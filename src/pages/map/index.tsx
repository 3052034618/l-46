import React, { useState, useMemo } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppStore } from '../../store';
import SectionHeader from '../../components/SectionHeader';

const MapPage: React.FC = () => {
  const activities = useAppStore((state) => state.activities);
  const memberLocations = useAppStore((state) => state.memberLocations);
  const members = useAppStore((state) => state.members);

  const ongoingActivities = useMemo(() => {
    return activities.filter((a) => a.status === 'ongoing' || a.status === 'upcoming');
  }, [activities]);

  const [selectedActivityId, setSelectedActivityId] = useState<string>(
    ongoingActivities[0]?.id || activities[0]?.id || ''
  );

  const selectedActivity = useMemo(() => {
    return activities.find((a) => a.id === selectedActivityId);
  }, [activities, selectedActivityId]);

  const supplyTypeMap = {
    water: { icon: '💧', label: '补水站' },
    energy: { icon: '🍌', label: '能量补给' },
    medical: { icon: '🏥', label: '医疗站' }
  };

  const handleSelectActivity = () => {
    if (ongoingActivities.length === 0) {
      Taro.showToast({ title: '暂无可选活动', icon: 'none' });
      return;
    }
    Taro.showActionSheet({
      itemList: ongoingActivities.map((a) => a.title),
      success: (res) => {
        setSelectedActivityId(ongoingActivities[res.tapIndex].id);
      }
    });
  };

  const handleReportLocation = () => {
    Taro.showModal({
      title: '位置上报',
      content: '确认上报当前位置吗？团长将能实时看到您的位置以保障安全。',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '位置已上报', icon: 'success' });
        }
      }
    });
  };

  const handleRemindMember = (memberName: string) => {
    Taro.showModal({
      title: '提醒归队',
      content: `确认发送归队提醒给 ${memberName} 吗？`,
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '提醒已发送', icon: 'success' });
        }
      }
    });
  };

  return (
    <View className={styles.page}>
      <View className="pageContainer">
        <View className={styles.activitySelector} onClick={handleSelectActivity}>
          <Text className={styles.selectorLabel}>当前活动</Text>
          <View className={styles.selectorValue}>
            <Text>{selectedActivity?.title || '请选择活动'}</Text>
            <Text className={styles.arrow}>▼</Text>
          </View>
        </View>

        {selectedActivity && (
          <>
            <View className={styles.mapPlaceholder}>
              <View className={styles.mapBg}>🗺️</View>
              <View className={styles.mapOverlay}>
                <View className={styles.routeInfo}>
                  <Text className={styles.routeTitle}>{selectedActivity.title}</Text>
                  <Text className={styles.routeMeta}>
                    {selectedActivity.distance}KM · {selectedActivity.paceGroups.length}个配速组 · {selectedActivity.supplyPoints.length}个补给点
                  </Text>
                </View>
                <View className={styles.memberMarkers}>
                  {memberLocations.map((loc, idx) => (
                    <View
                      key={loc.memberId}
                      className={styles.marker}
                      style={{
                        left: `${30 + idx * 25}%`,
                        top: `${40 + (idx % 2) * 30}%`
                      }}
                    >
                      <View
                        className={classnames(
                          styles.markerDot,
                          loc.isReturned ? styles.markerActive : styles.markerWarning
                        )}
                      />
                      <Text className={styles.markerLabel}>{loc.memberName}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            <View className={styles.section}>
              <SectionHeader title="补给点信息" subtitle={`共${selectedActivity.supplyPoints.length}个`} />
              <View className={styles.supplyList}>
                {selectedActivity.supplyPoints.map((sp) => (
                  <View key={sp.id} className={styles.supplyItem}>
                    <View className={classnames(styles.supplyIcon, styles[sp.type])}>
                      <Text>{supplyTypeMap[sp.type].icon}</Text>
                    </View>
                    <View className={styles.supplyInfo}>
                      <Text className={styles.supplyName}>{sp.name}</Text>
                      <Text className={styles.supplyDesc}>
                        {supplyTypeMap[sp.type].label} · 距起点 {sp.distance}KM
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            <View className={styles.section}>
              <SectionHeader
                title="成员安全状态"
                subtitle={`${memberLocations.filter(m => m.isReturned).length}/${memberLocations.length}人已归队`}
              />
              {memberLocations.map((loc) => {
                const member = members.find((m) => m.id === loc.memberId);
                return (
                  <View
                    key={loc.memberId}
                    className={classnames(
                      styles.memberSafety,
                      loc.isReturned ? styles.safe : styles.unsafe
                    )}
                  >
                    <View className={styles.safetyMember}>
                      {member && (
                        <Image src={member.avatar} className={styles.safetyAvatar} mode="aspectFill" />
                      )}
                      <Text className={styles.safetyName}>{loc.memberName}</Text>
                    </View>
                    {loc.isReturned ? (
                      <Text className={classnames(styles.safetyStatus, styles.statusSafe)}>已归队</Text>
                    ) : (
                      <Text
                        className={classnames(styles.safetyStatus, styles.statusUnsafe)}
                        onClick={() => handleRemindMember(loc.memberName)}
                      >
                        提醒归队
                      </Text>
                    )}
                  </View>
                );
              })}
              <View className={styles.reportBtn} onClick={handleReportLocation}>
                <Text>上报我的位置</Text>
              </View>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

export default MapPage;
