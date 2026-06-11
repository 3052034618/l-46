import React, { useState, useMemo } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppStore } from '../../store';
import SectionHeader from '../../components/SectionHeader';

const MapPage: React.FC = () => {
  const activities = useAppStore((state) => state.activities);
  const memberLocations = useAppStore((state) => state.memberLocations);
  const members = useAppStore((state) => state.members);
  const currentUserId = useAppStore((state) => state.currentUserId);
  const getMember = useAppStore((state) => state.getMember);
  const reportLocation = useAppStore((state) => state.reportLocation);
  const remindMember = useAppStore((state) => state.remindMember);
  const setMemberReturned = useAppStore((state) => state.setMemberReturned);

  const currentUser = getMember(currentUserId);

  const ongoingActivities = useMemo(() => {
    return activities.filter((a) => a.status === 'ongoing' || a.status === 'upcoming');
  }, [activities]);

  const [selectedActivityId, setSelectedActivityId] = useState<string>(
    ongoingActivities[0]?.id || activities[0]?.id || ''
  );

  const selectedActivity = useMemo(() => {
    return activities.find((a) => a.id === selectedActivityId);
  }, [activities, selectedActivityId]);

  const myLocation = useMemo(() => {
    return memberLocations.find((l) => l.memberId === currentUserId);
  }, [memberLocations, currentUserId]);

  const supplyTypeMap = {
    water: { icon: '💧', label: '补水站' },
    energy: { icon: '🍌', label: '能量补给' },
    medical: { icon: '🏥', label: '医疗站' }
  };

  const handleSelectActivity = () => {
    if (ongoingActivities.length === 0) {
      Taro.showToast({ title: '暂无可选活动', icon: 'none' });
      return;
    }
    Taro.showActionSheet({
      itemList: ongoingActivities.map((a) => a.title),
      success: (res) => {
        setSelectedActivityId(ongoingActivities[res.tapIndex].id);
      }
    });
  };

  const handleReportLocation = () => {
    if (!currentUser) return;
    Taro.showModal({
      title: '位置上报',
      content: '确认上报当前位置吗？团长将能实时看到您的位置以保障安全。',
      success: (res) => {
        if (res.confirm) {
          const baseLng = selectedActivity?.lng || 121.4737;
          const baseLat = selectedActivity?.lat || 31.2304;
          const randomOffsetLng = (Math.random() - 0.5) * 0.02;
          const randomOffsetLat = (Math.random() - 0.5) * 0.02;
          reportLocation(
            currentUserId,
            currentUser.name,
            baseLng + randomOffsetLng,
            baseLat + randomOffsetLat
          );
          Taro.showToast({ title: '位置已上报，状态已更新', icon: 'success' });
        }
      }
    });
  };

  const handleRemindMember = (memberId: string, memberName: string) => {
    Taro.showModal({
      title: '提醒归队',
      content: `确认发送归队提醒给 ${memberName} 吗？发送后将标记为已提醒。`,
      success: (res) => {
        if (res.confirm) {
          remindMember(memberId);
          Taro.showToast({ title: `已提醒 ${memberName}`, icon: 'success' });
        }
      }
    });
  };

  const handleMarkReturned = (memberId: string, memberName: string) => {
    Taro.showModal({
      title: '标记归队',
      content: `确认 ${memberName} 已安全归队吗？`,
      success: (res) => {
        if (res.confirm) {
          setMemberReturned(memberId);
          Taro.showToast({ title: '已标记归队', icon: 'success' });
        }
      }
    });
  };

  const returnedCount = memberLocations.filter((m) => m.isReturned).length;
  const totalCount = memberLocations.length;
  const remindedCount = memberLocations.filter((m) => m.reminded).length;

  return (
    <View className={styles.page}>
      <View className="pageContainer">
        <View className={styles.activitySelector} onClick={handleSelectActivity}>
          <Text className={styles.selectorLabel}>当前活动</Text>
          <View className={styles.selectorValue}>
            <Text>{selectedActivity?.title || '请选择活动'}</Text>
            <Text className={styles.arrow}>▼</Text>
          </View>
        </View>

        {selectedActivity && (
          <>
            <View className={styles.mapPlaceholder}>
              <View className={styles.mapBg}>🗺️</View>
              <View className={styles.mapOverlay}>
                <View className={styles.routeInfo}>
                  <Text className={styles.routeTitle}>{selectedActivity.title}</Text>
                  <Text className={styles.routeMeta}>
                    {selectedActivity.distance}KM · {selectedActivity.paceGroups.length}个配速组 · {selectedActivity.supplyPoints.length}个补给点
                  </Text>
                </View>
                <View className={styles.memberMarkers}>
                  {memberLocations.map((loc, idx) => (
                    <View
                      key={loc.memberId}
                      className={classnames(
                        styles.marker,
                        loc.memberId === currentUserId && styles.markerSelf
                      )}
                      style={{
                        left: `${30 + idx * 25}%`,
                        top: `${40 + (idx % 2) * 30}%`
                      }}
                    >
                      <View
                        className={classnames(
                          styles.markerDot,
                          loc.isReturned ? styles.markerActive : styles.markerWarning,
                          loc.memberId === currentUserId && styles.markerDotSelf,
                          loc.reminded && !loc.isReturned && styles.markerReminded
                        )}
                      />
                      <Text className={styles.markerLabel}>
                        {loc.memberId === currentUserId ? '📍我' : loc.memberName}
                        {loc.reminded && !loc.isReturned && '🔔'}
                      </Text>
                    </View>
                  ))}
                </View>
                <View className={styles.mapLegend}>
                  <View className={styles.legendItem}>
                    <View className={classnames(styles.legendDot, styles.markerActive)} />
                    <Text>已归队</Text>
                  </View>
                  <View className={styles.legendItem}>
                    <View className={classnames(styles.legendDot, styles.markerWarning)} />
                    <Text>未归队</Text>
                  </View>
                  <View className={styles.legendItem}>
                    <View className={classnames(styles.legendDot, styles.markerReminded)} />
                    <Text>已提醒</Text>
                  </View>
                </View>
              </View>
            </View>

            <View className={styles.section}>
              <SectionHeader title="补给点信息" subtitle={`共${selectedActivity.supplyPoints.length}个`} />
              <View className={styles.supplyList}>
                {selectedActivity.supplyPoints.map((sp) => (
                  <View key={sp.id} className={styles.supplyItem}>
                    <View className={classnames(styles.supplyIcon, styles[sp.type])}>
                      <Text>{supplyTypeMap[sp.type].icon}</Text>
                    </View>
                    <View className={styles.supplyInfo}>
                      <Text className={styles.supplyName}>{sp.name}</Text>
                      <Text className={styles.supplyDesc}>
                        {supplyTypeMap[sp.type].label} · 距起点 {sp.distance}KM
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            <View className={styles.section}>
              <SectionHeader
                title="成员安全状态"
                subtitle={`${returnedCount}/${totalCount}人已归队${remindedCount > 0 ? ` · ${remindedCount}人已提醒` : ''}`}
              />
              {myLocation && (
                <View className={classnames(styles.myLocationCard, myLocation.isReturned ? styles.safe : styles.unsafe)}>
                  <View className={styles.safetyMember}>
                    <Image src={currentUser?.avatar} className={styles.safetyAvatar} mode="aspectFill" />
                    <View>
                      <Text className={styles.safetyName}>📍 我的位置</Text>
                      <Text className={styles.myLocationTime}>
                        最近上报: {new Date(myLocation.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>
                  <Text className={classnames(styles.safetyStatus, myLocation.isReturned ? styles.statusSafe : styles.statusUnsafe)}>
                    {myLocation.isReturned ? '✓ 已上报' : '未上报'}
                  </Text>
                </View>
              )}

              {memberLocations.map((loc) => {
                if (loc.memberId === currentUserId) return null;
                const member = members.find((m) => m.id === loc.memberId);
                return (
                  <View
                    key={loc.memberId}
                    className={classnames(
                      styles.memberSafety,
                      loc.isReturned ? styles.safe : styles.unsafe,
                      loc.reminded && !loc.isReturned && styles.reminded
                    )}
                  >
                    <View className={styles.safetyMember}>
                      {member && (
                        <Image src={member.avatar} className={styles.safetyAvatar} mode="aspectFill" />
                      )}
                      <View>
                        <Text className={styles.safetyName}>
                          {loc.memberName}
                          {loc.reminded && !loc.isReturned && (
                            <Text className={styles.remindedTag}> 🔔已提醒</Text>
                          )}
                        </Text>
                        <Text className={styles.locationTime}>
                          {new Date(loc.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </View>
                    </View>
                    {loc.isReturned ? (
                      <Text className={classnames(styles.safetyStatus, styles.statusSafe)}>已归队</Text>
                    ) : (
                      <View className={styles.safetyActions}>
                        <Text
                          className={classnames(styles.safetyStatus, styles.statusReturned)}
                          onClick={() => handleMarkReturned(loc.memberId, loc.memberName)}
                        >
                          标记归队
                        </Text>
                        {!loc.reminded && (
                          <Text
                            className={classnames(styles.safetyStatus, styles.statusUnsafe)}
                            onClick={() => handleRemindMember(loc.memberId, loc.memberName)}
                          >
                            提醒归队
                          </Text>
                        )}
                      </View>
                    )}
                  </View>
                );
              })}
              <View className={styles.reportBtn} onClick={handleReportLocation}>
                <Text>📡 上报我的位置</Text>
              </View>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

export default MapPage;
