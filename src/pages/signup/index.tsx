import React, { useState, useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppStore } from '../../store';
import StatusBadge from '../../components/StatusBadge';
import PaceGroupTag from '../../components/PaceGroupTag';
import { formatDate } from '../../utils';

type TabType = 'my' | 'manage';

const SignupPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('my');
  const currentUserId = useAppStore((state) => state.currentUserId);
  const signupRecords = useAppStore((state) => state.signupRecords);
  const updateCheckinStatus = useAppStore((state) => state.updateCheckinStatus);
  const members = useAppStore((state) => state.members);

  const mySignups = useMemo(() => {
    return signupRecords.filter((s) => s.memberId === currentUserId);
  }, [signupRecords, currentUserId]);

  const manageSignups = useMemo(() => {
    return signupRecords;
  }, [signupRecords]);

  const displayList = activeTab === 'my' ? mySignups : manageSignups;

  const handleScanCode = () => {
    Taro.showActionSheet({
      itemList: ['模拟扫码 - 正常签到', '模拟扫码 - 迟到签到', '标记退赛'],
      success: (res) => {
        const statuses = ['checked', 'late', 'withdrawn'] as const;
        const status = statuses[res.tapIndex];
        if (displayList.length > 0) {
          const firstPending = displayList.find((s) => s.checkinStatus === 'not_checked');
          if (firstPending) {
            updateCheckinStatus(firstPending.id, status);
            Taro.showToast({
              title: status === 'checked' ? '签到成功' : status === 'late' ? '已标记迟到' : '已标记退赛',
              icon: 'success'
            });
          } else {
            Taro.showToast({ title: '没有待签到的活动', icon: 'none' });
          }
        }
      }
    });
  };

  const handleMarkStatus = (signupId: string, status: 'checked' | 'late' | 'withdrawn') => {
    updateCheckinStatus(signupId, status);
    Taro.showToast({ title: '操作成功', icon: 'success' });
  };

  return (
    <View className={styles.page}>
      <View className="pageContainer">
        {activeTab === 'manage' && (
          <View className={styles.scanCodeTip}>
            <Text className={styles.scanIcon}>📷</Text>
            <Text className={styles.scanText}>使用二维码快速完成到场签到</Text>
            <View className={styles.scanBtn} onClick={handleScanCode}>
              <Text>扫码签到</Text>
            </View>
          </View>
        )}

        <View className={styles.tabs}>
          <View
            className={classnames(styles.tab, activeTab === 'my' && styles.tabActive)}
            onClick={() => setActiveTab('my')}
          >
            <Text>我的报名</Text>
          </View>
          <View
            className={classnames(styles.tab, activeTab === 'manage' && styles.tabActive)}
            onClick={() => setActiveTab('manage')}
          >
            <Text>签到管理</Text>
          </View>
        </View>

        {displayList.length === 0 ? (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📝</Text>
            <Text className={styles.emptyText}>
              {activeTab === 'my' ? '暂无报名记录' : '暂无签到数据'}
            </Text>
          </View>
        ) : (
          displayList.map((record) => {
            const member = members.find((m) => m.id === record.memberId);
            return (
              <View key={record.id} className={styles.signupCard}>
                <View className={styles.cardHeader}>
                  <Text className={styles.cardTitle}>{record.activityTitle}</Text>
                  <StatusBadge type="checkin" status={record.checkinStatus} />
                </View>
                <View className={styles.cardInfo}>
                  {activeTab === 'manage' && member && (
                    <View className={styles.infoItem}>
                      <Text className={styles.infoIcon}>👤</Text>
                      <Text>{member.name}</Text>
                    </View>
                  )}
                  <View className={styles.infoItem}>
                    <Text className={styles.infoIcon}>⏰</Text>
                    <Text>报名时间: {formatDate(record.signupTime, 'MM-DD HH:mm')}</Text>
                  </View>
                  {record.checkinTime && (
                    <View className={styles.infoItem}>
                      <Text className={styles.infoIcon}>✅</Text>
                      <Text>签到时间: {formatDate(record.checkinTime, 'HH:mm')}</Text>
                    </View>
                  )}
                </View>
                <View className={styles.cardFooter}>
                  <View className={styles.paceInfo}>
                    <PaceGroupTag level={record.paceGroupId.includes('1') || record.paceGroupId.includes('4') || record.paceGroupId.includes('6') || record.paceGroupId.includes('10') ? 'fast' : record.paceGroupId.includes('2') || record.paceGroupId.includes('5') || record.paceGroupId.includes('7') || record.paceGroupId.includes('11') ? 'medium' : 'slow'} name={record.paceGroupName} />
                  </View>
                  <View className={styles.actionButtons}>
                    {activeTab === 'manage' && record.checkinStatus === 'not_checked' && (
                      <>
                        <View className={classnames(styles.btn, styles.btnPrimary)} onClick={() => handleMarkStatus(record.id, 'checked')}>
                          <Text>签到</Text>
                        </View>
                        <View className={classnames(styles.btn, styles.btnSecondary)} onClick={() => handleMarkStatus(record.id, 'late')}>
                          <Text>迟到</Text>
                        </View>
                        <View className={classnames(styles.btn, styles.btnDanger)} onClick={() => handleMarkStatus(record.id, 'withdrawn')}>
                          <Text>退赛</Text>
                        </View>
                      </>
                    )}
                    {activeTab === 'my' && record.checkinStatus === 'not_checked' && (
                      <View className={classnames(styles.btn, styles.btnPrimary)} onClick={handleScanCode}>
                        <Text>去签到</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })
        )}
      </View>
    </View>
  );
};

export default SignupPage;
