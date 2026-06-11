import React, { useState } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppStore } from '../../store';
import SectionHeader from '../../components/SectionHeader';

const ReviewPage: React.FC = () => {
  const reviews = useAppStore((state) => state.reviews);
  const members = useAppStore((state) => state.members);
  const [expandedReview, setExpandedReview] = useState<string | null>(reviews[0]?.id || null);

  const handleAddPhoto = () => {
    Taro.showActionSheet({
      itemList: ['拍照上传', '从相册选择'],
      success: () => {
        Taro.showToast({ title: '照片已上传', icon: 'success' });
      }
    });
  };

  const handleRemindUnreturned = (names: string) => {
    Taro.showModal({
      title: '提醒归队',
      content: `确认发送归队提醒给以下成员：${names}？`,
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '提醒已发送', icon: 'success' });
        }
      }
    });
  };

  const renderStars = (rating: number) => {
    return (
      <View className={styles.ratingStars}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Text
            key={i}
            className={classnames(styles.star, i <= rating ? styles.starActive : styles.starInactive)}
          >
            ★
          </Text>
        ))}
      </View>
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedReview(expandedReview === id ? null : id);
  };

  if (reviews.length === 0) {
    return (
      <View className={styles.page}>
        <View className="pageContainer">
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📝</Text>
            <Text className={styles.emptyText}>暂无复盘记录</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <View className="pageContainer">
        <View className={styles.headerCard}>
          <Text className={styles.headerTitle}>活动复盘</Text>
          <Text className={styles.headerSubtitle}>总结经验 · 持续进步 · 安全第一</Text>
        </View>

        {reviews.map((review) => {
          const isExpanded = expandedReview === review.id;
          const unreturnedMembersInfo = review.unreturnedMembers
            .map((id) => members.find((m) => m.id === id)?.name)
            .filter(Boolean)
            .join('、');

          return (
            <View key={review.id} className={styles.reviewCard} onClick={() => toggleExpand(review.id)}>
              <View className={styles.cardHeader}>
                <View>
                  <Text className={styles.activityTitle}>{review.activityTitle}</Text>
                  <Text className={styles.activityDate}>{review.activityDate}</Text>
                </View>
                <Text className={styles.activityDate}>{isExpanded ? '收起 ▲' : '展开 ▼'}</Text>
              </View>

              <View className={styles.statsRow}>
                <View className={styles.statBlock}>
                  <Text className={classnames(styles.statNumber, styles.success)}>{review.checkedMembers}</Text>
                  <Text className={styles.statLabel}>已签到</Text>
                </View>
                <View className={styles.statBlock}>
                  <Text className={classnames(styles.statNumber, styles.warning)}>{review.lateMembers}</Text>
                  <Text className={styles.statLabel}>迟到</Text>
                </View>
                <View className={styles.statBlock}>
                  <Text className={classnames(styles.statNumber, styles.danger)}>{review.withdrawnMembers}</Text>
                  <Text className={styles.statLabel}>退赛</Text>
                </View>
                <View className={styles.statBlock}>
                  <Text className={styles.statNumber}>{review.totalMembers}</Text>
                  <Text className={styles.statLabel}>总报名</Text>
                </View>
              </View>

              {isExpanded && (
                <>
                  {review.unreturnedMembers.length > 0 && (
                    <View
                      className={styles.unreturnedAlert}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemindUnreturned(unreturnedMembersInfo);
                      }}
                    >
                      <Text className={styles.alertIcon}>⚠️</Text>
                      <View className={styles.alertContent}>
                        <Text className={styles.alertTitle}>
                          {review.unreturnedMembers.length} 位成员未归队
                        </Text>
                        <Text className={styles.alertNames}>{unreturnedMembersInfo} - 点击发送提醒</Text>
                      </View>
                    </View>
                  )}

                  <View className={styles.section}>
                    <SectionHeader title="📸 完赛照片" subtitle={`${review.photos.length}张`} />
                    <View className={styles.photoGrid}>
                      {review.photos.map((photo, idx) => (
                        <View key={idx} className={styles.photoItem}>
                          <Image src={photo} className={styles.photoImage} mode="aspectFill" />
                        </View>
                      ))}
                      <View
                        className={classnames(styles.photoItem, styles.photoAdd)}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddPhoto();
                        }}
                      >
                        <Text>+</Text>
                      </View>
                    </View>
                  </View>

                  <View className={styles.section}>
                    <SectionHeader title="👥 配速分组名单" subtitle={`${review.paceGroupLists.length}组`} />
                    {review.paceGroupLists.map((group) => (
                      <View key={group.groupId} className={styles.paceGroupSection}>
                        <View className={styles.groupHeader}>
                          <Text className={styles.groupName}>{group.groupName}</Text>
                          <Text className={styles.groupPace}>{group.pace} · {group.members.length}人</Text>
                        </View>
                        <View className={styles.groupMembers}>
                          {group.members.map((m) => (
                            <View key={m.id} className={styles.groupMember}>
                              <Text>{m.name}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    ))}
                  </View>

                  <View className={styles.section}>
                    <SectionHeader title="💬 活动反馈" subtitle={`${review.feedbacks.length}条`} />
                    {review.feedbacks.map((fb) => {
                      const member = members.find((m) => m.id === fb.memberId);
                      return (
                        <View key={fb.id} className={styles.feedbackItem}>
                          <View className={styles.feedbackHeader}>
                            <View className={styles.feedbackUser}>
                              {member && (
                                <Image src={member.avatar} className={styles.feedbackAvatar} mode="aspectFill" />
                              )}
                              <Text className={styles.feedbackName}>{fb.memberName}</Text>
                            </View>
                            {renderStars(fb.rating)}
                          </View>
                          <Text className={styles.feedbackContent}>{fb.content}</Text>
                          <Text className={styles.feedbackTime}>{fb.createdAt}</Text>
                        </View>
                      );
                    })}
                  </View>
                </>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default ReviewPage;
