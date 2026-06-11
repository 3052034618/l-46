import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import type { Activity } from '../../types';
import StatusBadge from '../StatusBadge';
import PaceGroupTag from '../PaceGroupTag';

interface ActivityCardProps {
  activity: Activity;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity }) => {
  const handleClick = () => {
    Taro.navigateTo({
      url: `/pages/activity-detail/index?id=${activity.id}`
    });
  };

  return (
    <View className={styles.card} onClick={handleClick}>
      <View className={styles.cover}>
        <Image src={activity.coverImage} className={styles.coverImage} mode="aspectFill" />
        <View className={styles.coverBadge}>
          <StatusBadge type="activity" status={activity.status} />
        </View>
      </View>
      <View className={styles.header}>
        <Text className={styles.title}>{activity.title}</Text>
      </View>
      <View className={styles.infoRow}>
        <Text className={styles.infoIcon}>📅</Text>
        <Text>{activity.date} {activity.startTime}-{activity.endTime}</Text>
      </View>
      <View className={styles.infoRow}>
        <Text className={styles.infoIcon}>📍</Text>
        <Text>{activity.meetPoint}</Text>
      </View>
      <View className={styles.infoRow}>
        <Text className={styles.infoIcon}>🏃</Text>
        <Text>{activity.distance}KM · 组织者 {activity.organizerName}</Text>
      </View>
      <View className={styles.footer}>
        <View className={styles.paceTags}>
          {activity.paceGroups.slice(0, 3).map((pg) => (
            <PaceGroupTag key={pg.id} level={pg.level} name={pg.name} />
          ))}
        </View>
        <Text className={styles.progress}>
          <Text className={styles.progressNum}>{activity.currentMembers}</Text>
          <Text>/{activity.maxMembers}人</Text>
        </Text>
      </View>
    </View>
  );
};

export default ActivityCard;
