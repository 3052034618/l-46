import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import { getActivityStatusText, getCheckinStatusText, getSignupStatusText } from '../../utils';

type StatusType = 'activity' | 'checkin' | 'signup';

interface StatusBadgeProps {
  type: StatusType;
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ type, status }) => {
  let text = status;
  if (type === 'activity') text = getActivityStatusText(status);
  if (type === 'checkin') text = getCheckinStatusText(status);
  if (type === 'signup') text = getSignupStatusText(status);

  return (
    <View className={classnames(styles.badge, styles[status])}>
      <View className={styles.dot} />
      <Text>{text}</Text>
    </View>
  );
};

export default StatusBadge;
