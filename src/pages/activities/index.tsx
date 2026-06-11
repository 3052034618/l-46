import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppStore } from '../../store';
import ActivityCard from '../../components/ActivityCard';
import type { ActivityStatus } from '../../types';

interface FilterOption {
  key: ActivityStatus | 'all';
  label: string;
}

const filters: FilterOption[] = [
  { key: 'all', label: '全部' },
  { key: 'upcoming', label: '即将开始' },
  { key: 'ongoing', label: '进行中' },
  { key: 'finished', label: '已结束' }
];

const ActivitiesPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterOption['key']>('all');
  const activities = useAppStore((state) => state.activities);
  const members = useAppStore((state) => state.members);

  const filteredActivities = useMemo(() => {
    if (activeFilter === 'all') return activities;
    return activities.filter((a) => a.status === activeFilter);
  }, [activities, activeFilter]);

  const upcomingCount = activities.filter((a) => a.status === 'upcoming').length;
  const ongoingCount = activities.filter((a) => a.status === 'ongoing').length;

  const handlePublish = () => {
    Taro.navigateTo({ url: '/pages/activity-publish/index' });
  };

  const handleRefresh = () => {
    setTimeout(() => {
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '刷新成功', icon: 'success' });
    }, 800);
  };

  React.useEffect(() => {
    Taro.eventCenter.on('__taroPullDownRefresh', handleRefresh);
    return () => {
      Taro.eventCenter.off('__taroPullDownRefresh', handleRefresh);
    };
  }, []);

  return (
    <View className={styles.page}>
      <View className="pageContainer">
        <View className={styles.hero}>
          <Text className={styles.heroTitle}>智慧跑团</Text>
          <Text className={styles.heroSubtitle}>安全约跑 · 快乐奔跑</Text>
          <View className={styles.heroStats}>
            <View className={styles.statItem}>
              <Text className={styles.statNum}>{upcomingCount}</Text>
              <Text className={styles.statLabel}>即将开始</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statNum}>{ongoingCount}</Text>
              <Text className={styles.statLabel}>进行中</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statNum}>{members.length}</Text>
              <Text className={styles.statLabel}>成员数</Text>
            </View>
          </View>
        </View>

        <ScrollView scrollX className={styles.filterBar}>
          {filters.map((f) => (
            <View
              key={f.key}
              className={classnames(styles.filterItem, activeFilter === f.key && styles.filterActive)}
              onClick={() => setActiveFilter(f.key)}
            >
              <Text>{f.label}</Text>
            </View>
          ))}
        </ScrollView>

        {filteredActivities.length === 0 ? (
          <View className={styles.emptyState}>暂无活动，快去发布一个吧~</View>
        ) : (
          filteredActivities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))
        )}
      </View>

      <View className={styles.fab} onClick={handlePublish}>
        <Text>+</Text>
      </View>
    </View>
  );
};

export default ActivitiesPage;
