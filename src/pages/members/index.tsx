import React, { useState, useMemo } from 'react';
import { View, Text, Input } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppStore } from '../../store';
import MemberCard from '../../components/MemberCard';
import SectionHeader from '../../components/SectionHeader';
import type { PaceLevel } from '../../types';

const paceFilters: { key: PaceLevel | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'fast', label: '快跑组' },
  { key: 'medium', label: '中速组' },
  { key: 'slow', label: '慢跑组' }
];

const MembersPage: React.FC = () => {
  const members = useAppStore((state) => state.members);
  const signupRecords = useAppStore((state) => state.signupRecords);
  const [paceFilter, setPaceFilter] = useState<PaceLevel | 'all'>('all');
  const [searchText, setSearchText] = useState('');

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchPace = paceFilter === 'all' || m.paceLevel === paceFilter;
      const matchSearch = m.name.includes(searchText);
      return matchPace && matchSearch;
    });
  }, [members, paceFilter, searchText]);

  const overallStats = useMemo(() => {
    const totalRuns = members.reduce((sum, m) => sum + m.totalRuns, 0);
    const avgAttendance = Math.round(
      members.reduce((sum, m) => sum + m.attendanceRate, 0) / members.length
    );
    const checkedCount = signupRecords.filter(
      (s) => s.status === 'approved' && s.checkinStatus === 'checked'
    ).length;
    return {
      totalMembers: members.length,
      totalRuns,
      avgAttendance,
      checkedCount
    };
  }, [members, signupRecords]);

  return (
    <View className={styles.page}>
      <View className="pageContainer">
        <View className={styles.statsOverview}>
          <Text className={styles.statsTitle}>跑团概览</Text>
          <View className={styles.statsGrid}>
            <View className={styles.statCard}>
              <Text className={styles.statValue}>{overallStats.totalMembers}</Text>
              <Text className={styles.statLabel}>成员总数</Text>
            </View>
            <View className={styles.statCard}>
              <Text className={styles.statValue}>{overallStats.totalRuns}</Text>
              <Text className={styles.statLabel}>累计活动</Text>
            </View>
            <View className={styles.statCard}>
              <Text className={styles.statValue}>{overallStats.avgAttendance}%</Text>
              <Text className={styles.statLabel}>平均出勤</Text>
            </View>
          </View>
        </View>

        <View className={styles.attendanceCard}>
          <View className={styles.cardTitle}>
            <Text className={styles.cardIcon}>📊</Text>
            <Text>整体出勤统计</Text>
          </View>
          <View className={styles.attendanceRow}>
            <Text className={styles.attendanceLabel}>平均出勤率</Text>
            <Text className={styles.attendanceValue} style={{ color: '$color-success' }}>{overallStats.avgAttendance}%</Text>
          </View>
          <View className={styles.attendanceBar}>
            <View className={styles.attendanceFill} style={{ width: `${overallStats.avgAttendance}%` }} />
          </View>
          <View className={styles.attendanceRow}>
            <Text className={styles.attendanceLabel}>累计签到人次</Text>
            <Text className={styles.attendanceValue}>{overallStats.checkedCount}</Text>
          </View>
          <View className={styles.attendanceRow}>
            <Text className={styles.attendanceLabel}>本月活动次数</Text>
            <Text className={styles.attendanceValue}>{Math.ceil(overallStats.totalRuns / 12)}</Text>
          </View>
        </View>

        <SectionHeader title="成员列表" subtitle={`共${filteredMembers.length}人`} />

        <View className={styles.searchBar}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder="搜索成员姓名"
            value={searchText}
            onInput={(e) => setSearchText(e.detail.value)}
          />
        </View>

        <View className={styles.filterBar}>
          {paceFilters.map((f) => (
            <View
              key={f.key}
              className={classnames(styles.filterTag, paceFilter === f.key && styles.filterActive)}
              onClick={() => setPaceFilter(f.key)}
            >
              <Text>{f.label}</Text>
            </View>
          ))}
        </View>

        <View className={styles.memberList}>
          {filteredMembers.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </View>
      </View>
    </View>
  );
};

export default MembersPage;
