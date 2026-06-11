import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import type { PaceLevel } from '../../types';
import { getPaceLevelText } from '../../utils';

interface PaceGroupTagProps {
  level: PaceLevel;
  pace?: string;
  name?: string;
}

const PaceGroupTag: React.FC<PaceGroupTagProps> = ({ level, pace, name }) => {
  return (
    <View className={classnames(styles.tag, styles[level])}>
      <Text>{name || getPaceLevelText(level)}</Text>
      {pace && <Text className={styles.pace}> · {pace}</Text>}
    </View>
  );
};

export default PaceGroupTag;
