import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import type { Member } from '../../types';
import PaceGroupTag from '../PaceGroupTag';

interface MemberCardProps {
  member: Member;
}

const MemberCard: React.FC<MemberCardProps> = ({ member }) => {
  const handleClick = () => {
    Taro.navigateTo({
      url: `/pages/member-detail/index?id=${member.id}`
    });
  };

  return (
    <View className={styles.card} onClick={handleClick}>
      <Image src={member.avatar} className={styles.avatar} mode="aspectFill" />
      <View className={styles.info}>
        <View className={styles.nameRow}>
          <Text className={styles.name}>{member.name}</Text>
          <PaceGroupTag level={member.paceLevel} />
        </View>
        <View className={styles.stats}>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{member.totalRuns}</Text>
            <Text>次活动</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statNum}>{member.attendanceRate}%</Text>
            <Text>出勤率</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default MemberCard;
