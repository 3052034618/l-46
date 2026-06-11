import React, { useMemo } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppStore } from '../../store';
import { getPaceLevelText, formatDate } from '../../utils';
import PaceGroupTag from '../../components/PaceGroupTag';

const MemberDetailPage: React.FC = () => {
  const router = useRouter();
  const memberId = router.params.id as string;
  const getMember = useAppStore((state) => state.getMember);
  const getActivity = useAppStore((state) => state.getActivity);
  const signupRecords = useAppStore((state) => state.signupRecords);

  const member = useMemo(() => getMember(memberId), [getMember, memberId]);

  const memberActivities = useMemo(() => {
    if (!member) return [];
    return member.recentActivities
      .map((id) => getActivity(id))
      .filter(Boolean);
  }, [member, getActivity]);

  const personalStats = useMemo(() => {
    if (!member) return null;
    const approvedSignups = signupRecords.filter(
      (s) => s.memberId === member.id && s.status === 'approved'
    );
    const total = approvedSignups.length;
    const attended = approvedSignups.filter((s) => s.checkinStatus === 'checked').length;
    const late = approvedSignups.filter((s) => s.checkinStatus === 'late').length;
    const absent = approvedSignups.filter((s) => s.checkinStatus === 'withdrawn').length;
    const rate = total > 0 ? Math.round(((attended + late) / total) * 100) : 0;
    return { attended, late, absent, total, rate };
  }, [member, signupRecords]);

  const handleContact = () => {
    if (!member) return;
    Taro.showActionSheet({
      itemList: [`拨打电话 ${member.phone}`, `联系紧急联系人 ${member.emergencyPhone}`],
      success: (res) => {
        if (res.tapIndex === 0) {
          Taro.makePhoneCall({ phoneNumber: member.phone.replace(/\*/g, '0') });
        } else {
          Taro.makePhoneCall({ phoneNumber: member.emergencyPhone.replace(/\*/g, '0') });
        }
      }
    });
  };

  if (!member) {
    return (
      <View className={styles.page}>
        <View className="pageContainer">
          <Text>成员不存在</Text>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <View className="pageContainer">
        <View className={styles.profileHeader}>
          <View className={styles.profileInfo}>
            <Image src={member.avatar} className={styles.avatar} mode="aspectFill" />
            <View className={styles.infoBlock}>
              <Text className={styles.memberName}>{member.name}</Text>
              <Text className={styles.joinDate}>加入时间: {formatDate(member.joinDate)}</Text>
              <View className={styles.paceTag}>
                <PaceGroupTag level={member.paceLevel} />
              </View>
            </View>
          </View>
          <View className={styles.statsGrid}>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{personalStats?.total ?? member.totalRuns}</Text>
              <Text className={styles.statLabel}>累计活动</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{personalStats?.rate ?? member.attendanceRate}%</Text>
              <Text className={styles.statLabel}>出勤率</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{getPaceLevelText(member.paceLevel)}</Text>
              <Text className={styles.statLabel}>配速组</Text>
            </View>
          </View>
        </View>

        {personalStats && (
          <View className={styles.card}>
            <View className={styles.cardTitle}>
              <Text className={styles.cardIcon}>📊</Text>
              <Text>出勤统计</Text>
            </View>
            <View className={styles.attendanceSection}>
              <View className={styles.attendanceHeader}>
                <Text className={styles.attendanceTitle}>个人出勤率</Text>
                <Text className={styles.attendanceRate}>{personalStats.rate}%</Text>
              </View>
              <View className={styles.attendanceBar}>
                <View className={styles.attendanceFill} style={{ width: `${personalStats.rate}%` }} />
              </View>
              <View className={styles.attendanceBreakdown}>
                <View className={styles.breakdownItem}>
                  <Text className={classnames(styles.breakdownValue, styles.successValue)}>
                    {personalStats.attended}
                  </Text>
                  <Text className={styles.breakdownLabel}>正常签到</Text>
                </View>
                <View className={styles.breakdownItem}>
                  <Text className={classnames(styles.breakdownValue, styles.warningValue)}>
                    {personalStats.late}
                  </Text>
                  <Text className={styles.breakdownLabel}>迟到</Text>
                </View>
                <View className={styles.breakdownItem}>
                  <Text className={classnames(styles.breakdownValue, styles.dangerValue)}>
                    {personalStats.absent}
                  </Text>
                  <Text className={styles.breakdownLabel}>退赛</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <View className={styles.card}>
          <View className={styles.cardTitle}>
            <Text className={styles.cardIcon}>📋</Text>
            <Text>个人信息</Text>
          </View>
          <View className={styles.infoList}>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>联系电话</Text>
              <Text className={styles.infoValue}>{member.phone}</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>紧急联系人</Text>
              <Text className={styles.infoValue}>{member.emergencyContact} · {member.emergencyPhone}</Text>
            </View>
            <View className={styles.infoItem}>
              <Text className={styles.infoLabel}>配速水平</Text>
              <Text className={styles.infoValue}>{getPaceLevelText(member.paceLevel)}</Text>
            </View>
          </View>
          {member.healthStatus && member.healthStatus !== '健康' && (
            <View className={styles.healthWarning}>
              <Text className={styles.warningIcon}>⚠️</Text>
              <Text className={styles.warningText}>健康提示: {member.healthStatus}</Text>
            </View>
          )}
        </View>

        <View className={styles.card}>
          <View className={styles.cardTitle}>
            <Text className={styles.cardIcon}>🏃</Text>
            <Text>近期活动</Text>
          </View>
          <View className={styles.activityList}>
            {memberActivities.length === 0 ? (
              <Text style={{ fontSize: '28rpx', color: '#86909c', textAlign: 'center', padding: '32rpx 0' }}>
                暂无活动记录
              </Text>
            ) : (
              memberActivities.map((activity) => activity && (
                <View key={activity.id} className={styles.activityItem}>
                  <Text className={styles.activityName}>{activity.title}</Text>
                  <Text
                    className={classnames(
                      styles.activityStatus,
                      activity.status === 'finished' ? styles.statusFinished : styles.statusUpcoming
                    )}
                  >
                    {activity.status === 'finished' ? '已完成' : activity.status === 'upcoming' ? '即将开始' : '进行中'}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>

        <View className={styles.contactBtn} onClick={handleContact}>
          <Text>联系成员</Text>
        </View>
      </View>
    </View>
  );
};

export default MemberDetailPage;
