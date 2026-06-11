import React, { useState } from 'react';
import { View, Text, Input, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppStore } from '../../store';
import { generateId } from '../../utils';
import type { PaceGroup, PaceLevel } from '../../types';

interface PaceGroupForm {
  id: string;
  name: string;
  level: PaceLevel;
  pace: string;
  maxMembers: string;
}

const ActivityPublishPage: React.FC = () => {
  const addActivity = useAppStore((state) => state.addActivity);
  const currentUserId = useAppStore((state) => state.currentUserId);
  const members = useAppStore((state) => state.members);
  const currentUser = members.find((m) => m.id === currentUserId);

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [meetPoint, setMeetPoint] = useState('');
  const [distance, setDistance] = useState('');
  const [maxMembers, setMaxMembers] = useState('');
  const [routeDesc, setRouteDesc] = useState('');
  const [healthTips, setHealthTips] = useState('');

  const [paceGroups, setPaceGroups] = useState<PaceGroupForm[]>([
    { id: generateId(), name: '挑战组', level: 'fast', pace: '5分00秒/km', maxMembers: '15' },
    { id: generateId(), name: '进阶组', level: 'medium', pace: '6分00秒/km', maxMembers: '20' },
    { id: generateId(), name: '欢乐组', level: 'slow', pace: '7分30秒/km', maxMembers: '25' }
  ]);

  const handleAddPaceGroup = () => {
    setPaceGroups([
      ...paceGroups,
      { id: generateId(), name: '新分组', level: 'medium', pace: '6分00秒/km', maxMembers: '20' }
    ]);
  };

  const handleRemovePaceGroup = (id: string) => {
    if (paceGroups.length <= 1) {
      Taro.showToast({ title: '至少保留一个分组', icon: 'none' });
      return;
    }
    setPaceGroups(paceGroups.filter((g) => g.id !== id));
  };

  const handleUpdatePaceGroup = (id: string, field: keyof PaceGroupForm, value: string) => {
    setPaceGroups(
      paceGroups.map((g) => (g.id === id ? { ...g, [field]: value } : g))
    );
  };

  const handleSubmit = () => {
    if (!title || !date || !startTime || !endTime || !meetPoint || !distance) {
      Taro.showToast({ title: '请填写必填项', icon: 'none' });
      return;
    }

    const validPaceGroups: PaceGroup[] = paceGroups
      .filter((g) => g.name && g.pace && g.maxMembers)
      .map((g) => ({
        id: g.id,
        name: g.name,
        level: g.level,
        pace: g.pace,
        maxMembers: parseInt(g.maxMembers) || 20,
        currentMembers: 0
      }));

    if (validPaceGroups.length === 0) {
      Taro.showToast({ title: '请至少配置一个配速组', icon: 'none' });
      return;
    }

    const totalMax = validPaceGroups.reduce((sum, g) => sum + g.maxMembers, 0);

    const newActivity = {
      id: generateId(),
      title,
      date,
      startTime,
      endTime,
      meetPoint,
      distance: parseFloat(distance) || 0,
      routeDesc,
      status: 'upcoming' as const,
      paceGroups: validPaceGroups,
      maxMembers: parseInt(maxMembers) || totalMax,
      currentMembers: 0,
      supplyPoints: [],
      organizerId: currentUserId,
      organizerName: currentUser?.name || '团长',
      healthTips: healthTips || '请提前充分热身，量力而行',
      coverImage: 'https://picsum.photos/id/1036/750/400',
      lng: 121.4737,
      lat: 31.2304
    };

    addActivity(newActivity);
    Taro.showToast({ title: '发布成功', icon: 'success' });
    setTimeout(() => {
      Taro.navigateBack();
    }, 1000);
  };

  const handleCancel = () => {
    Taro.showModal({
      title: '确认取消',
      content: '取消后已填写的内容将丢失',
      success: (res) => {
        if (res.confirm) {
          Taro.navigateBack();
        }
      }
    });
  };

  const getLevelClass = (level: PaceLevel) => {
    const map = {
      fast: styles.levelFastActive,
      medium: styles.levelMediumActive,
      slow: styles.levelSlowActive
    };
    return map[level];
  };

  return (
    <View className={styles.page}>
      <View className="pageContainer">
        <View className={styles.formCard}>
          <View className={styles.formTitle}>
            <Text className={styles.formIcon}>📋</Text>
            <Text>基本信息</Text>
          </View>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>活动标题<Text className={styles.formRequired}>*</Text></Text>
            <Input
              className={styles.formInput}
              placeholder="请输入活动标题，如：周末滨江晨跑10K"
              value={title}
              onInput={(e) => setTitle(e.detail.value)}
            />
          </View>
          <View className={styles.formRow}>
            <View className={styles.formRowItem}>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>活动日期<Text className={styles.formRequired}>*</Text></Text>
                <Input
                  className={styles.formInput}
                  type="text"
                  placeholder="YYYY-MM-DD"
                  value={date}
                  onInput={(e) => setDate(e.detail.value)}
                />
              </View>
            </View>
          </View>
          <View className={styles.formRow}>
            <View className={styles.formRowItem}>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>开始时间<Text className={styles.formRequired}>*</Text></Text>
                <Input
                  className={styles.formInput}
                  placeholder="HH:MM"
                  value={startTime}
                  onInput={(e) => setStartTime(e.detail.value)}
                />
              </View>
            </View>
            <View className={styles.formRowItem}>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>结束时间<Text className={styles.formRequired}>*</Text></Text>
                <Input
                  className={styles.formInput}
                  placeholder="HH:MM"
                  value={endTime}
                  onInput={(e) => setEndTime(e.detail.value)}
                />
              </View>
            </View>
          </View>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>集合地点<Text className={styles.formRequired}>*</Text></Text>
            <Input
              className={styles.formInput}
              placeholder="请输入集合地点"
              value={meetPoint}
              onInput={(e) => setMeetPoint(e.detail.value)}
            />
          </View>
          <View className={styles.formRow}>
            <View className={styles.formRowItem}>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>里程(KM)<Text className={styles.formRequired}>*</Text></Text>
                <Input
                  className={styles.formInput}
                  type="digit"
                  placeholder="例如：10"
                  value={distance}
                  onInput={(e) => setDistance(e.detail.value)}
                />
              </View>
            </View>
            <View className={styles.formRowItem}>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>人数上限</Text>
                <Input
                  className={styles.formInput}
                  type="number"
                  placeholder="默认各组合计"
                  value={maxMembers}
                  onInput={(e) => setMaxMembers(e.detail.value)}
                />
              </View>
            </View>
          </View>
        </View>

        <View className={styles.formCard}>
          <View className={styles.formTitle}>
            <Text className={styles.formIcon}>🏃</Text>
            <Text>配速分组</Text>
          </View>
          <View className={styles.paceGroupList}>
            {paceGroups.map((group, idx) => (
              <View key={group.id} className={styles.paceGroupItem}>
                <View className={styles.paceGroupHeader}>
                  <Text className={styles.paceGroupName}>分组 {idx + 1}</Text>
                  <Text
                    className={styles.paceGroupRemove}
                    onClick={() => handleRemovePaceGroup(group.id)}
                  >
                    删除
                  </Text>
                </View>
                <View className={styles.paceGroupFields}>
                  <View className={styles.paceGroupField}>
                    <Text className={styles.paceGroupFieldLabel}>名称</Text>
                    <Input
                      value={group.name}
                      onInput={(e) => handleUpdatePaceGroup(group.id, 'name', e.detail.value)}
                    />
                  </View>
                  <View className={styles.paceGroupField}>
                    <Text className={styles.paceGroupFieldLabel}>配速</Text>
                    <Input
                      value={group.pace}
                      placeholder="6分00秒/km"
                      onInput={(e) => handleUpdatePaceGroup(group.id, 'pace', e.detail.value)}
                    />
                  </View>
                  <View className={styles.paceGroupField}>
                    <Text className={styles.paceGroupFieldLabel}>上限</Text>
                    <Input
                      type="number"
                      value={group.maxMembers}
                      onInput={(e) => handleUpdatePaceGroup(group.id, 'maxMembers', e.detail.value)}
                    />
                  </View>
                </View>
                <View className={styles.levelSelect} style={{ marginTop: '16rpx' }}>
                  {(['fast', 'medium', 'slow'] as PaceLevel[]).map((level) => (
                    <View
                      key={level}
                      className={classnames(
                        styles.levelOption,
                        group.level === level && getLevelClass(level)
                      )}
                      onClick={() => handleUpdatePaceGroup(group.id, 'level', level)}
                    >
                      <Text>{level === 'fast' ? '快跑' : level === 'medium' ? '中速' : '慢跑'}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
          <View className={styles.addPaceGroupBtn} onClick={handleAddPaceGroup}>
            <Text>+ 添加配速分组</Text>
          </View>
        </View>

        <View className={styles.formCard}>
          <View className={styles.formTitle}>
            <Text className={styles.formIcon}>📝</Text>
            <Text>补充说明</Text>
          </View>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>路线描述</Text>
            <Textarea
              className={styles.formTextarea}
              placeholder="请描述跑步路线，起终点、途经点等"
              value={routeDesc}
              onInput={(e) => setRouteDesc(e.detail.value)}
            />
          </View>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>健康提示</Text>
            <Textarea
              className={styles.formTextarea}
              placeholder="健康安全提示，如热身要求、禁忌事项等"
              value={healthTips}
              onInput={(e) => setHealthTips(e.detail.value)}
            />
          </View>
        </View>
      </View>

      <View className={styles.submitBar}>
        <View className={styles.cancelBtn} onClick={handleCancel}>
          <Text>取消</Text>
        </View>
        <View className={styles.submitBtn} onClick={handleSubmit}>
          <Text>发布活动</Text>
        </View>
      </View>
    </View>
  );
};

export default ActivityPublishPage;
