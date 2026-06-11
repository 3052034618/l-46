import React, { useState, useMemo } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppStore } from '../../store';
import StatusBadge from '../../components/StatusBadge';
import PaceGroupTag from '../../components/PaceGroupTag';
import { formatDate, getCheckinStatusText } from '../../utils';

type TabType = 'my' | 'manage';

const SignupPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('my');
  const currentUserId = useAppStore((state) => state.currentUserId);
  const signupRecords = useAppStore((state) => state.signupRecords);
  const updateCheckinStatus = useAppStore((state) => state.updateCheckinStatus);
  const members = useAppStore((state) => state.members);
  const getMember = useAppStore((state) => state.getMember);
  const updateReviewStats = useAppStore((state) => state.updateReviewStats);
  const ensureReviewForActivity = useAppStore((state) => state.ensureReviewForActivity);

  const [showQRCode, setShowQRCode] = useState(false);
  const [qrActivityId, setQrActivityId] = useState('');
  const [qrActivityTitle, setQrActivityTitle] = useState('');

  useDidShow(() => {
    const uniqueActivityIds = [...new Set(signupRecords.map((s) => s.activityId))];
    uniqueActivityIds.forEach((id) => {
      ensureReviewForActivity(id);
      updateReviewStats(id);
    });
  });

  const currentUser = getMember(currentUserId);

  const mySignups = useMemo(() => {
    return signupRecords.filter((s) => s.memberId === currentUserId);
  }, [signupRecords, currentUserId]);

  const manageSignups = useMemo(() => {
    return signupRecords;
  }, [signupRecords]);

  const displayList = activeTab === 'my' ? mySignups : manageSignups;

  const myStats = useMemo(() => {
    const total = mySignups.length;
    const checked = mySignups.filter((s) => s.checkinStatus === 'checked').length;
    const late = mySignups.filter((s) => s.checkinStatus === 'late').length;
    const withdrawn = mySignups.filter((s) => s.checkinStatus === 'withdrawn').length;
    const rate = total > 0 ? Math.round(((checked + late) / total) * 100) : 0;
    return { total, checked, late, withdrawn, rate };
  }, [mySignups]);

  const verifyQRCode = (result: string) => {
    try {
      const data = JSON.parse(result);
      if (data && data.type === 'activity_checkin' && data.activityId) {
        return data;
      }
    } catch {
      // plain text fallback
    }
    return null;
  };

  const handleScanCode = () => {
    if (activeTab === 'manage') {
      if (displayList.length === 0) {
        Taro.showToast({ title: '暂无待签到成员', icon: 'none' });
        return;
      }
      const firstPending = displayList.find((s) => s.checkinStatus === 'not_checked');
      if (!firstPending) {
        Taro.showToast({ title: '所有成员已完成签到', icon: 'none' });
        return;
      }
      setQrActivityId(firstPending.activityId);
      setQrActivityTitle(firstPending.activityTitle);
      setShowQRCode(true);
      return;
    }

    Taro.scanCode({
      onlyFromCamera: false,
      scanType: ['qrCode', 'barCode'],
      success: (res) => {
        const qrData = verifyQRCode(res.result);
        if (!qrData) {
          Taro.showModal({
            title: '二维码无效',
            content: `扫描内容: ${res.result}\n\n该二维码不是有效的活动签到码`,
            showCancel: false
          });
          return;
        }

        const myRecord = mySignups.find((s) => s.activityId === qrData.activityId);
        if (!myRecord) {
          Taro.showModal({
            title: '签到失败',
            content: `您未报名"${qrData.activityTitle}"活动`,
            showCancel: false
          });
          return;
        }

        if (myRecord.checkinStatus !== 'not_checked') {
          Taro.showModal({
            title: '重复签到',
            content: `您已${getCheckinStatusText(myRecord.checkinStatus)}，无需重复操作`,
            showCancel: false
          });
          return;
        }

        const now = new Date();
        const isLate = false;
        Taro.showModal({
          title: '确认签到',
          content: `活动: ${qrData.activityTitle}\n时间: ${formatDate(now, 'HH:mm')}\n\n确认到场签到？`,
          success: (modalRes) => {
            if (modalRes.confirm) {
              updateCheckinStatus(myRecord.id, isLate ? 'late' : 'checked');
              ensureReviewForActivity(qrData.activityId);
              updateReviewStats(qrData.activityId);
              Taro.showToast({
                title: isLate ? '已签到（迟到）' : '签到成功',
                icon: 'success'
              });
            }
          }
        });
      },
      fail: (err) => {
        if (err.errMsg && err.errMsg.includes('cancel')) {
          return;
        }
        Taro.showActionSheet({
          itemList: ['手动正常签到', '手动迟到签到', '标记退赛'],
          success: (actionRes) => {
            const statuses = ['checked', 'late', 'withdrawn'] as const;
            const status = statuses[actionRes.tapIndex];
            const firstPending = mySignups.find((s) => s.checkinStatus === 'not_checked');
            if (firstPending) {
              updateCheckinStatus(firstPending.id, status);
              ensureReviewForActivity(firstPending.activityId);
              updateReviewStats(firstPending.activityId);
              Taro.showToast({
                title: status === 'checked' ? '签到成功' : status === 'late' ? '已标记迟到' : '已标记退赛',
                icon: 'success'
              });
            } else {
              Taro.showToast({ title: '没有待签到的活动', icon: 'none' });
            }
          }
        });
      }
    });
  };

  const handleMarkStatus = (signupId: string, activityId: string, status: 'checked' | 'late' | 'withdrawn') => {
    Taro.showModal({
      title: '确认操作',
      content: `确定要将此记录标记为${status === 'checked' ? '正常签到' : status === 'late' ? '迟到' : '退赛'}吗？`,
      success: (res) => {
        if (res.confirm) {
          updateCheckinStatus(signupId, status);
          ensureReviewForActivity(activityId);
          updateReviewStats(activityId);
          Taro.showToast({ title: '操作成功', icon: 'success' });
        }
      }
    });
  };

  const getPaceLevel = (paceGroupId: string) => {
    if (paceGroupId.includes('1') || paceGroupId.includes('4') || paceGroupId.includes('6') || paceGroupId.includes('10')) return 'fast';
    if (paceGroupId.includes('2') || paceGroupId.includes('5') || paceGroupId.includes('7') || paceGroupId.includes('11')) return 'medium';
    return 'slow';
  };

  return (
    <View className={styles.page}>
      <View className="pageContainer">
        {activeTab === 'my' && currentUser && (
          <View className={styles.myStatsCard}>
            <View className={styles.statsHeader}>
              <Image src={currentUser.avatar} className={styles.statsAvatar} mode="aspectFill" />
              <View className={styles.statsInfo}>
                <Text className={styles.statsName}>{currentUser.name}</Text>
                <Text className={styles.statsSub}>出勤率 {myStats.rate}% · 共参加 {myStats.total} 次</Text>
              </View>
            </View>
            <View className={styles.statsRow}>
              <View className={styles.statItem}>
                <Text className={styles.statNumSuccess}>{myStats.checked}</Text>
                <Text className={styles.statLabel}>正常签到</Text>
              </View>
              <View className={styles.statItem}>
                <Text className={styles.statNumWarning}>{myStats.late}</Text>
                <Text className={styles.statLabel}>迟到</Text>
              </View>
              <View className={styles.statItem}>
                <Text className={styles.statNumDanger}>{myStats.withdrawn}</Text>
                <Text className={styles.statLabel}>退赛</Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'manage' && (
          <View className={styles.scanCodeTip}>
            <Text className={styles.scanIcon}>📷</Text>
            <View className={styles.scanContent}>
              <Text className={styles.scanText}>使用二维码签到核验</Text>
              <Text className={styles.scanSub}>成员扫码 → 团长核验 → 完成签到</Text>
            </View>
            <View className={styles.scanBtn} onClick={handleScanCode}>
              <Text>显示签到码</Text>
            </View>
          </View>
        )}

        <View className={styles.tabs}>
          <View
            className={classnames(styles.tab, activeTab === 'my' && styles.tabActive)}
            onClick={() => setActiveTab('my')}
          >
            <Text>我的签到</Text>
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
              {activeTab === 'my' ? '暂无报名记录，快去活动广场报名吧~' : '暂无签到数据'}
            </Text>
          </View>
        ) : (
          displayList.map((record) => {
            const member = members.find((m) => m.id === record.memberId);
            return (
              <View key={record.id} className={styles.signupCard}>
                <View className={styles.cardHeader}>
                  <View className={styles.cardTitleRow}>
                    <Text className={styles.cardTitle}>{record.activityTitle}</Text>
                    <StatusBadge type="checkin" status={record.checkinStatus} />
                  </View>
                  {record.status === 'waitlist' && (
                    <Text className={styles.waitlistTag}>候补中</Text>
                  )}
                </View>
                <View className={styles.cardInfo}>
                  {activeTab === 'manage' && member && (
                    <View className={styles.infoItem}>
                      <Image src={member.avatar} className={styles.memberAvatar} mode="aspectFill" />
                      <Text>{member.name}</Text>
                    </View>
                  )}
                  <View className={styles.infoItem}>
                    <Text className={styles.infoIcon}>⏰</Text>
                    <Text>报名: {formatDate(record.signupTime, 'MM-DD HH:mm')}</Text>
                  </View>
                  {record.checkinTime && (
                    <View className={styles.infoItem}>
                      <Text className={styles.infoIcon}>✅</Text>
                      <Text>{getCheckinStatusText(record.checkinStatus)}: {formatDate(record.checkinTime, 'HH:mm')}</Text>
                    </View>
                  )}
                </View>
                <View className={styles.cardFooter}>
                  <View className={styles.paceInfo}>
                    <PaceGroupTag level={getPaceLevel(record.paceGroupId) as any} name={record.paceGroupName} />
                  </View>
                  <View className={styles.actionButtons}>
                    {activeTab === 'manage' && record.checkinStatus === 'not_checked' && (
                      <>
                        <View className={classnames(styles.btn, styles.btnPrimary)} onClick={() => handleMarkStatus(record.id, record.activityId, 'checked')}>
                          <Text>签到</Text>
                        </View>
                        <View className={classnames(styles.btn, styles.btnSecondary)} onClick={() => handleMarkStatus(record.id, record.activityId, 'late')}>
                          <Text>迟到</Text>
                        </View>
                        <View className={classnames(styles.btn, styles.btnDanger)} onClick={() => handleMarkStatus(record.id, record.activityId, 'withdrawn')}>
                          <Text>退赛</Text>
                        </View>
                      </>
                    )}
                    {activeTab === 'my' && record.checkinStatus === 'not_checked' && (
                      <View className={classnames(styles.btn, styles.btnPrimary)} onClick={handleScanCode}>
                        <Text>扫码签到</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })
        )}
      </View>

      {showQRCode && (
        <View className={styles.qrModal} onClick={() => setShowQRCode(false)}>
          <View className={styles.qrContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.qrTitle}>活动签到码</Text>
            <Text className={styles.qrSubtitle}>{qrActivityTitle}</Text>
            <View className={styles.qrCodeBox}>
              <View className={styles.qrMock}>
                <Text className={styles.qrBig}>📱</Text>
                <Text className={styles.qrHint}>请让成员扫描此二维码</Text>
                <Text className={styles.qrSmall}>签到码: ACT-{qrActivityId}</Text>
              </View>
            </View>
            <Text className={styles.qrTips}>
              成员使用"扫码签到"功能扫描此码{'\n'}
              即可完成自动签到核验
            </Text>
            <View className={styles.qrClose} onClick={() => setShowQRCode(false)}>
              <Text>关闭</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default SignupPage;
