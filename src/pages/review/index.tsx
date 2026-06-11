import React, { useState } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppStore } from '../../store';
import SectionHeader from '../../components/SectionHeader';
import type { ReviewFeedback } from '../../types';

const ReviewPage: React.FC = () => {
  const reviews = useAppStore((state) => state.reviews);
  const members = useAppStore((state) => state.members);
  const currentUserId = useAppStore((state) => state.currentUserId);
  const getMember = useAppStore((state) => state.getMember);
  const addReviewPhoto = useAppStore((state) => state.addReviewPhoto);
  const addReviewFeedback = useAppStore((state) => state.addReviewFeedback);
  const markRemindedInReview = useAppStore((state) => state.markRemindedInReview);

  const currentUser = getMember(currentUserId);

  const [expandedReview, setExpandedReview] = useState<string | null>(reviews[0]?.id || null);
  const [feedbackRating, setFeedbackRating] = useState<Record<string, number>>({});
  const [feedbackContent, setFeedbackContent] = useState<Record<string, string>>({});
  const [submittingFeedback, setSubmittingFeedback] = useState<string | null>(null);

  const handleAddPhoto = (reviewId: string, activityTitle: string) => {
    Taro.showActionSheet({
      itemList: ['拍照上传', '从相册选择'],
      success: (res) => {
        if (process.env.TARO_ENV === 'h5') {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.onchange = (e: any) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = () => {
                addReviewPhoto(reviewId, reader.result as string);
                Taro.showToast({ title: '照片已上传', icon: 'success' });
              };
              reader.readAsDataURL(file);
            }
          };
          input.click();
        } else {
          const currentReview = reviews.find((r) => r.id === reviewId);
          const mockPhotos = [
            'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=group%20runners%20celebrating%20after%20city%20marathon%20running%20event%20with%20medals&image_size=square_hd',
            'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=sunrise%20city%20park%20morning%20run%20runners%20jogging&image_size=square_hd',
            'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=running%20race%20finish%20line%20with%20timing%20clock%20and%20cheering%20crowd&image_size=square_hd'
          ];
          const randomPhoto = mockPhotos[Math.floor(Math.random() * mockPhotos.length)];
          addReviewPhoto(reviewId, randomPhoto);
          Taro.showToast({
            title: `第${(currentReview?.photos.length || 0) + 1}张照片已上传`,
            icon: 'success'
          });
        }
      }
    });
  };

  const handleRemindUnreturned = (reviewId: string, activityId: string, names: string) => {
    Taro.showModal({
      title: '提醒归队',
      content: `确认发送归队提醒给以下成员：${names}？`,
      success: (res) => {
        if (res.confirm) {
          markRemindedInReview(reviewId);
          Taro.showToast({ title: '提醒已发送，复盘已标记', icon: 'success' });
        }
      }
    });
  };

  const renderStars = (rating: number, interactive?: boolean, reviewId?: string) => {
    if (interactive && reviewId) {
      const currentRating = feedbackRating[reviewId] || 0;
      return (
        <View className={styles.ratingStars}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Text
              key={i}
              className={classnames(
                styles.star,
                styles.starInteractive,
                i <= currentRating ? styles.starActive : styles.starInactive
              )}
              onClick={(e) => {
                e.stopPropagation();
                setFeedbackRating({ ...feedbackRating, [reviewId]: i });
              }}
            >
              ★
            </Text>
          ))}
        </View>
      );
    }
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

  const handleSubmitFeedback = (reviewId: string) => {
    const rating = feedbackRating[reviewId] || 0;
    const content = feedbackContent[reviewId] || '';

    if (rating === 0) {
      Taro.showToast({ title: '请先选择评分', icon: 'none' });
      return;
    }
    if (!content.trim()) {
      Taro.showToast({ title: '请填写反馈内容', icon: 'none' });
      return;
    }

    setSubmittingFeedback(reviewId);
    setTimeout(() => {
      const newFeedback: ReviewFeedback = {
        id: `fb_${Date.now()}`,
        memberId: currentUserId,
        memberName: currentUser?.name || '匿名成员',
        rating,
        content: content.trim(),
        createdAt: new Date().toLocaleString('zh-CN')
      };
      addReviewFeedback(reviewId, newFeedback);
      setFeedbackRating({ ...feedbackRating, [reviewId]: 0 });
      setFeedbackContent({ ...feedbackContent, [reviewId]: '' });
      setSubmittingFeedback(null);
      Taro.showToast({ title: '反馈提交成功', icon: 'success' });
    }, 500);
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
            <Text className={styles.emptyHint}>完成活动报名后将自动生成复盘</Text>
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
          const remindedCount = review.remindedMembers.length;

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
                      className={classnames(
                        styles.unreturnedAlert,
                        remindedCount > 0 && styles.alertReminded
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemindUnreturned(review.id, review.activityId, unreturnedMembersInfo);
                      }}
                    >
                      <Text className={styles.alertIcon}>⚠️</Text>
                      <View className={styles.alertContent}>
                        <Text className={styles.alertTitle}>
                          {review.unreturnedMembers.length} 位成员未归队
                          {remindedCount > 0 && <Text className={styles.remindedBadge}> · 已提醒{remindedCount}人</Text>}
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
                          handleAddPhoto(review.id, review.activityTitle);
                        }}
                      >
                        <Text className={styles.photoAddIcon}>+</Text>
                        <Text className={styles.photoAddText}>上传照片</Text>
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

                    <View className={styles.feedbackForm} onClick={(e) => e.stopPropagation()}>
                      <View className={styles.formHeader}>
                        <Text className={styles.formTitle}>我的反馈</Text>
                        {renderStars(0, true, review.id)}
                      </View>
                      <View className={styles.formBody}>
                        <Text className={styles.formLabel}>活动评分</Text>
                        {renderStars(0, true, review.id)}
                        <Text className={styles.formRatingText}>
                          {(feedbackRating[review.id] || 0) > 0
                            ? `${feedbackRating[review.id]} 分`
                            : '请点击星星评分'}
                        </Text>
                      </View>
                      <View className={styles.formTextareaWrap}>
                        <textarea
                          className={styles.formTextarea}
                          placeholder="分享您的活动体验、建议或遇到的问题..."
                          value={feedbackContent[review.id] || ''}
                          onInput={(e: any) =>
                            setFeedbackContent({ ...feedbackContent, [review.id]: e.detail.value })
                          }
                          onClick={(e) => e.stopPropagation()}
                        />
                      </View>
                      <View
                        className={classnames(
                          styles.submitBtn,
                          submittingFeedback === review.id && styles.btnDisabled
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSubmitFeedback(review.id);
                        }}
                      >
                        <Text>{submittingFeedback === review.id ? '提交中...' : '提交反馈'}</Text>
                      </View>
                    </View>

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
