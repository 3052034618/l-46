import React, { useState, useMemo } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { QRCodeSVG } from 'qrcode.react';
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
  const promoteWaitlistToApproved = useAppStore((state) => state.promoteWaitlistToApproved);
  const members = useAppStore((state) => state.members);
  const getMember = useAppStore((state) => state.getMember);
  const updateReviewStats = useAppStore((state) => state.updateReviewStats);
  const ensureReviewForActivity = useAppStore((state) => state.ensureReviewForActivity);
  const activities = useAppStore((state) => state.activities);

  const [showQRCode, setShowQRCode] = useState(false);
  const [qrActivityId, setQrActivityId] = useState('');
  const [qrActivityTitle, setQrActivityTitle] = useState('');
  const [qrCodeContent, setQrCodeContent] = useState('');

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
    const approvedSignups = mySignups.filter((s) => s.status === 'approved');
    const total = approvedSignups.length;
    const checked = approvedSignups.filter((s) => s.checkinStatus === 'checked').length;
    const late = approvedSignups.filter((s) => s.checkinStatus === 'late').length;
    const withdrawn = approvedSignups.filter((s) => s.checkinStatus === 'withdrawn').length;
    const rate = total > 0 ? Math.round(((checked + late) / total) * 100) : 0;
    return { total, checked, late, withdrawn, rate };
  }, [mySignups]);

  const generateCheckinQRCode = (activityId: string, activityTitle: string) => {
    return JSON.stringify({
      type: 'activity_checkin',
      activityId,
      activityTitle,
      timestamp: Date.now()
    });
  };

  const verifyQRCode = (result: string) => {
    try {
      const data = JSON.parse(result);
      if (data && data.type === 'activity_checkin' && data.activityId && data.activityTitle) {
        return data;
      }
    } catch {
    }
    return null;
  };

  const handleShowQRCode = () => {
    const activityOptions = activities.filter(
      (a) => a.status === 'ongoing' || a.status === 'upcoming'
    );
    if (activityOptions.length === 0) {
      Taro.showToast({ title: '暂无可签到的活动', icon: 'none' });
      return;
    }
    Taro.showActionSheet({
      itemList: activityOptions.map((a) => `${a.title}（${a.date}）`),
      success: (res) => {
        const selected = activityOptions[res.tapIndex];
        const qrContent = generateCheckinQRCode(selected.id, selected.title);
        setQrActivityId(selected.id);
        setQrActivityTitle(selected.title);
        setQrCodeContent(qrContent);
        setShowQRCode(true);
      }
    });
  };

  const handleScanCode = () => {
    if (mySignups.length === 0) {
      Taro.showModal({
        title: '无法签到',
        content: '您还没有报名任何活动，请先到活动广场报名~',
        showCancel: false
      });
      return;
    }

    const pendingSignups = mySignups.filter((s) => s.checkinStatus === 'not_checked');
    if (pendingSignups.length === 0) {
      Taro.showModal({
        title: '已完成签到',
        content: '您报名的所有活动均已签到，无需重复操作~',
        showCancel: false
      });
      return;
    }

    Taro.scanCode({
      onlyFromCamera: false,
      scanType: ['qrCode', 'barCode'],
      success: (res) => {
        const qrData = verifyQRCode(res.result);
        if (!qrData) {
          Taro.showModal({
            title: '❌ 签到失败',
            content: `扫描内容无法识别。\n\n请扫描团长出示的有效活动签到二维码。`,
            showCancel: false,
            confirmText: '知道了'
          });
          return;
        }

        const activity = activities.find((a) => a.id === qrData.activityId);
        if (!activity) {
          Taro.showModal({
            title: '❌ 签到失败',
            content: `该活动已删除或不存在。\n\n活动名称: ${qrData.activityTitle}`,
            showCancel: false,
            confirmText: '知道了'
          });
          return;
        }

        const myRecord = mySignups.find((s) => s.activityId === qrData.activityId);
        if (!myRecord) {
          Taro.showModal({
            title: '❌ 签到失败',
            content: `您未报名"${qrData.activityTitle}"活动。\n\n请先到活动广场完成报名后再签到。`,
            showCancel: false,
            confirmText: '知道了'
          });
          return;
        }

        if (myRecord.status === 'waitlist') {
          Taro.showModal({
            title: '⚠️ 候补状态',
            content: `您当前在"${qrData.activityTitle}"的候补中，暂无法签到。\n\n请联系团长确认候补转正。`,
            showCancel: false,
            confirmText: '知道了'
          });
          return;
        }

        if (myRecord.checkinStatus !== 'not_checked') {
          const statusText = getCheckinStatusText(myRecord.checkinStatus);
          Taro.showModal({
            title: '⚠️ 已签到',
            content: `您已在"${qrData.activityTitle}"活动中${statusText}。\n\n签到时间: ${myRecord.checkinTime ? formatDate(myRecord.checkinTime, 'HH:mm') : '已记录'}\n\n无需重复操作。`,
            showCancel: false,
            confirmText: '知道了'
          });
          return;
        }

        const now = new Date();
        const isLate = false;
        Taro.showModal({
          title: '✅ 确认签到',
          content: `活动: ${qrData.activityTitle}\n时间: ${formatDate(now, 'HH:mm')}\n配速组: ${myRecord.paceGroupName}\n\n确认到场签到吗？`,
          confirmText: '确认签到',
          cancelText: '取消',
          success: (modalRes) => {
            if (modalRes.confirm) {
              updateCheckinStatus(myRecord.id, isLate ? 'late' : 'checked');
              ensureReviewForActivity(qrData.activityId);
              updateReviewStats(qrData.activityId);
              Taro.showToast({
                title: isLate ? '已签到（迟到）' : '🎉 签到成功',
                icon: 'success',
                duration: 2000
              });
            }
          }
        });
      },
      fail: (err) => {
        if (err.errMsg && err.errMsg.includes('cancel')) {
          return;
        }
        Taro.showModal({
          title: '扫码失败',
          content: '无法打开摄像头或扫码被取消，请重试。\n\n请确认已授权相机权限。',
          showCancel: false,
          confirmText: '知道了'
        });
      }
    });
  };

  const handleMarkStatus = (signupId: string, activityId: string, memberName: string, status: 'checked' | 'late' | 'withdrawn') => {
    const statusMap = {
      checked: '正常签到',
      late: '迟到',
      withdrawn: '退赛'
    };
    Taro.showModal({
      title: '确认操作',
      content: `确定要将 ${memberName} 标记为${statusMap[status]}吗？`,
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

  const handlePromoteWaitlist = (signupId: string, memberName: string, activityTitle: string) => {
    Taro.showModal({
      title: '候补转正',
      content: `确定要将 ${memberName} 转为"${activityTitle}"的正式报名吗？\n\n转正后活动人数和配速组人数将同步更新。`,
      success: (res) => {
        if (res.confirm) {
          promoteWaitlistToApproved(signupId);
          const record = signupRecords.find((s) => s.id === signupId);
          if (record) {
            ensureReviewForActivity(record.activityId);
            updateReviewStats(record.activityId);
          }
          Taro.showToast({ title: `${memberName} 已转正`, icon: 'success' });
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
              <Text className={styles.scanSub}>选择活动 → 出示签到码 → 成员扫码完成签到</Text>
            </View>
            <View className={styles.scanBtn} onClick={handleShowQRCode}>
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
                    {activeTab === 'manage' && record.status === 'waitlist' && (
                      <View
                        className={classnames(styles.btn, styles.btnPromote)}
                        onClick={() => handlePromoteWaitlist(record.id, member?.name || '成员', record.activityTitle)}
                      >
                        <Text>转正</Text>
                      </View>
                    )}
                    {activeTab === 'manage' && record.checkinStatus === 'not_checked' && record.status !== 'waitlist' && (
                      <>
                        <View className={classnames(styles.btn, styles.btnPrimary)} onClick={() => handleMarkStatus(record.id, record.activityId, member?.name || '成员', 'checked')}>
                          <Text>签到</Text>
                        </View>
                        <View className={classnames(styles.btn, styles.btnSecondary)} onClick={() => handleMarkStatus(record.id, record.activityId, member?.name || '成员', 'late')}>
                          <Text>迟到</Text>
                        </View>
                        <View className={classnames(styles.btn, styles.btnDanger)} onClick={() => handleMarkStatus(record.id, record.activityId, member?.name || '成员', 'withdrawn')}>
                          <Text>退赛</Text>
                        </View>
                      </>
                    )}
                    {activeTab === 'my' && record.checkinStatus === 'not_checked' && record.status !== 'waitlist' && (
                      <View className={classnames(styles.btn, styles.btnPrimary)} onClick={handleScanCode}>
                        <Text>扫码签到</Text>
                      </View>
                    )}
                    {activeTab === 'my' && record.status === 'waitlist' && (
                      <Text className={styles.waitlistInfo}>候补阶段暂不可签到</Text>
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
              <View className={styles.qrReal}>
                <QRCodeSVG
                  value={qrCodeContent}
                  size={240}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="M"
                  includeMargin={true}
                />
              </View>
              <Text className={styles.qrHint}>请使用微信扫一扫或相机扫描上方二维码</Text>
            </View>
            <Text className={styles.qrTips}>
              💡 使用说明{'\n'}
              1. 请成员打开「我的签到」Tab{'\n'}
              2. 点击「扫码签到」按钮扫描此码{'\n'}
              3. 扫码后系统自动核验报名信息{'\n'}
              4. 确认后即完成签到
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
