import React, { useState, useMemo } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppStore } from '../../store';
import StatusBadge from '../../components/StatusBadge';
import PaceGroupTag from '../../components/PaceGroupTag';
import { generateId } from '../../utils';
import type { PaceLevel, SignupStatus, CheckinStatus } from '../../types';

const ActivityDetailPage: React.FC = () => {
  const router = useRouter();
  const activityId = router.params.id as string;

  const activities = useAppStore((state) => state.activities);
  const addSignup = useAppStore((state) => state.addSignup);
  const signupRecords = useAppStore((state) => state.signupRecords);
  const currentUserId = useAppStore((state) => state.currentUserId);
  const members = useAppStore((state) => state.members);
  const ensureReviewForActivity = useAppStore((state) => state.ensureReviewForActivity);
  const updateReviewStats = useAppStore((state) => state.updateReviewStats);

  const currentUser = members.find((m) => m.id === currentUserId);
  const activity = useMemo(() => activities.find((a) => a.id === activityId), [activities, activityId]);

  const [selectedGroup, setSelectedGroup] = useState<string>('');

  useDidShow(() => {
    if (activity) {
      updateReviewStats(activityId);
    }
  });

  const mySignup = useMemo(() => {
    return signupRecords.find(
      (s) => s.activityId === activityId && s.memberId === currentUserId
    );
  }, [signupRecords, activityId, currentUserId]);

  const handleSignup = () => {
    if (!activity) return;
    if (!selectedGroup) {
      Taro.showToast({ title: '请选择配速组', icon: 'none' });
      return;
    }
    if (mySignup) {
      Taro.showToast({ title: '您已报名此活动', icon: 'none' });
      return;
    }

    const paceGroup = activity.paceGroups.find((g) => g.id === selectedGroup);
    if (!paceGroup) return;

    const isFull = paceGroup.currentMembers >= paceGroup.maxMembers;

    const record = {
      id: generateId(),
      activityId: activity.id,
      activityTitle: activity.title,
      memberId: currentUserId,
      memberName: currentUser?.name || '成员',
      paceGroupId: paceGroup.id,
      paceGroupName: paceGroup.name,
      status: (isFull ? 'waitlist' : 'approved') as SignupStatus,
      checkinStatus: 'not_checked' as CheckinStatus,
      signupTime: new Date().toISOString()
    };

    addSignup(record);
    ensureReviewForActivity(activityId);
    updateReviewStats(activityId);

    Taro.showToast({
      title: isFull ? '已加入候补，等待空位' : '报名成功',
      icon: 'success'
    });

    setSelectedGroup('');
  };

  const handleCheckin = () => {
    Taro.switchTab({ url: '/pages/signup/index' });
  };

  const handleCancelSignup = () => {
    Taro.showModal({
      title: '确认取消',
      content: '确定要取消此次活动的报名吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '已取消报名', icon: 'success' });
        }
      }
    });
  };

  const getFillClass = (level: PaceLevel) => {
    const map = { fast: styles.fastFill, medium: styles.mediumFill, slow: styles.slowFill };
    return map[level];
  };

  if (!activity) {
    return (
      <View className={styles.page}>
        <View className="pageContainer">
          <Text>活动不存在</Text>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <View className="pageContainer">
        <View className={styles.cover}>
          <Image src={activity.coverImage} className={styles.coverImage} mode="aspectFill" />
          <View className={styles.coverBadge}>
            <StatusBadge type="activity" status={activity.status} />
          </View>
          <View className={styles.coverOverlay}>
            <Text className={styles.coverTitle}>{activity.title}</Text>
            <Text className={styles.coverSubtitle}>
              {activity.date} {activity.startTime} · {activity.distance}KM · {activity.currentMembers}/{activity.maxMembers}人
            </Text>
          </View>
        </View>

        <View className={styles.card}>
          <View className={styles.cardTitle}>
            <Text className={styles.cardIcon}>📍</Text>
            <Text>活动信息</Text>
          </View>
          <View className={styles.infoList}>
            <View className={styles.infoItem}>
              <Text className={styles.infoIcon}>📅</Text>
              <View className={styles.infoContent}>
                <Text className={styles.infoLabel}>活动时间</Text>
                <Text className={styles.infoValue}>
                  {activity.date} {activity.startTime} - {activity.endTime}
                </Text>
              </View>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoIcon}>🏁</Text>
              <View className={styles.infoContent}>
                <Text className={styles.infoLabel}>集合地点</Text>
                <Text className={styles.infoValue}>{activity.meetPoint}</Text>
              </View>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoIcon}>🗺️</Text>
              <View className={styles.infoContent}>
                <Text className={styles.infoLabel}>路线描述</Text>
                <Text className={styles.infoValue}>{activity.routeDesc || '详见现场指示'}</Text>
              </View>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoIcon}>👤</Text>
              <View className={styles.infoContent}>
                <Text className={styles.infoLabel}>组织者</Text>
                <Text className={styles.infoValue}>{activity.organizerName}</Text>
              </View>
            </View>
          </View>
          {activity.healthTips && (
            <View className={styles.healthTip}>
              <Text className={styles.healthIcon}>⚠️</Text>
              <Text className={styles.healthText}>{activity.healthTips}</Text>
            </View>
          )}
        </View>

        <View className={styles.card}>
          <View className={styles.cardTitle}>
            <Text className={styles.cardIcon}>🏃</Text>
            <Text>配速分组（点击选择后报名）</Text>
          </View>
          {activity.paceGroups.map((pg) => {
            const progress = Math.min(100, (pg.currentMembers / pg.maxMembers) * 100);
            const isFull = pg.currentMembers >= pg.maxMembers;
            return (
              <View
                key={pg.id}
                className={classnames(styles.paceGroupCard, selectedGroup === pg.id && styles.selected)}
                onClick={() => setSelectedGroup(pg.id)}
                style={{
                  border: selectedGroup === pg.id ? `2rpx solid ${pg.level === 'fast' ? '#f53f3f' : pg.level === 'medium' ? '#ff7d00' : '#00b42a'}` : 'none'
                }}
              >
                <View className={styles.paceGroupHeader}>
                  <View style={{ display: 'flex', alignItems: 'center', gap: '16rpx' }}>
                    <PaceGroupTag level={pg.level} name={pg.name} />
                    <Text style={{ fontSize: '24rpx', color: '#86909c' }}>{pg.pace}</Text>
                  </View>
                  <Text style={{ fontSize: '24rpx', color: isFull ? '#f53f3f' : '#4e5969', fontWeight: 600 }}>
                    {isFull ? `已满（${pg.currentMembers}/${pg.maxMembers}）` : `${pg.currentMembers}/${pg.maxMembers}`}
                  </Text>
                </View>
                <View className={styles.paceGroupProgress}>
                  <View
                    className={classnames(styles.paceGroupFill, getFillClass(pg.level))}
                    style={{ width: `${progress}%` }}
                  />
                </View>
                <View className={styles.paceGroupFooter}>
                  {isFull ? (
                    <Text style={{ color: '#f53f3f' }}>👉 可候补报名，有位置自动补上</Text>
                  ) : (
                    <Text>{selectedGroup === pg.id ? '✓ 已选择此分组' : '点击选择此分组'}</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {activity.supplyPoints.length > 0 && (
          <View className={styles.card}>
            <View className={styles.cardTitle}>
              <Text className={styles.cardIcon}>💧</Text>
              <Text>补给点信息</Text>
            </View>
            <View className={styles.infoList}>
              {activity.supplyPoints.map((sp) => (
                <View key={sp.id} className={styles.infoItem}>
                  <Text className={styles.infoIcon}>
                    {sp.type === 'water' ? '💧' : sp.type === 'energy' ? '🍌' : '🏥'}
                  </Text>
                  <View className={styles.infoContent}>
                    <Text className={styles.infoLabel}>{sp.name}</Text>
                    <Text className={styles.infoValue}>
                      {sp.type === 'water' ? '补水站' : sp.type === 'energy' ? '能量补给' : '医疗站'} · 距起点 {sp.distance}KM
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      <View className={styles.bottomBar}>
        {mySignup ? (
          <>
            <View className={styles.outlineBtn} onClick={handleCancelSignup}>
              <Text>取消报名</Text>
            </View>
            {activity.status === 'ongoing' ? (
              <View className={styles.secondaryBtn} onClick={handleCheckin}>
                <Text>去签到</Text>
              </View>
            ) : activity.status === 'finished' ? (
              <View className={styles.disabledBtn}>
                <Text>活动已结束</Text>
              </View>
            ) : (
              <View className={styles.successBtn}>
                <Text>✓ 已{mySignup.status === 'waitlist' ? '候补' : '报名'}</Text>
              </View>
            )}
          </>
        ) : activity.status === 'upcoming' ? (
          <>
            <View className={styles.outlineBtn} onClick={() => Taro.navigateBack()}>
              <Text>返回</Text>
            </View>
            <View className={styles.primaryBtn} onClick={handleSignup}>
              <Text>立即报名{selectedGroup ? '（已选组）' : ''}</Text>
            </View>
          </>
        ) : activity.status === 'ongoing' ? (
          <View className={styles.secondaryBtn} onClick={handleCheckin}>
            <Text>去签到</Text>
          </View>
        ) : (
          <View className={styles.disabledBtn}>
            <Text>活动已结束</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default ActivityDetailPage;
