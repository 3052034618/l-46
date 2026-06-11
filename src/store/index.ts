import { create } from 'zustand';
import Taro from '@tarojs/taro';
import type {
  Activity,
  Member,
  SignupRecord,
  ReviewRecord,
  MemberLocation,
  SignupStatus,
  CheckinStatus,
  ReviewFeedback
} from '../types';
import { mockActivities } from '../data/activities';
import { mockMembers, mockSignupRecords, mockMemberLocations } from '../data/members';
import { mockReviews } from '../data/reviews';
import { generateId, formatDateTime } from '../utils';

const STORAGE_KEY = 'smart_sports_app_state_v1';

interface PersistedState {
  activities: Activity[];
  signupRecords: SignupRecord[];
  reviews: ReviewRecord[];
  memberLocations: MemberLocation[];
}

const loadPersistedState = (): Partial<PersistedState> => {
  try {
    const data = Taro.getStorageSync(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn('Failed to load persisted state', e);
  }
  return {};
};

const persistState = (state: PersistedState) => {
  try {
    Taro.setStorageSync(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to persist state', e);
  }
};

const persisted = loadPersistedState();

interface AppState {
  activities: Activity[];
  members: Member[];
  signupRecords: SignupRecord[];
  reviews: ReviewRecord[];
  memberLocations: MemberLocation[];
  currentUserId: string;

  getActivity: (id: string) => Activity | undefined;
  getMember: (id: string) => Member | undefined;
  getMySignups: (memberId: string) => SignupRecord[];
  getReviewByActivityId: (activityId: string) => ReviewRecord | undefined;

  addActivity: (activity: Activity) => void;
  addSignup: (record: SignupRecord) => void;
  updateCheckinStatus: (signupId: string, status: CheckinStatus) => void;

  updatePaceGroupMembers: (activityId: string, paceGroupId: string, delta: number) => void;
  updateMemberAttendance: (memberId: string, status: CheckinStatus) => void;

  reportLocation: (memberId: string, memberName: string, lng: number, lat: number) => void;
  setMemberReturned: (memberId: string) => void;
  remindMember: (memberId: string) => void;

  addReviewPhoto: (reviewId: string, photoUrl: string) => void;
  addReviewFeedback: (reviewId: string, feedback: ReviewFeedback) => void;
  markRemindedInReview: (reviewId: string) => void;
  ensureReviewForActivity: (activityId: string) => ReviewRecord | null;
  updateReviewStats: (activityId: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  activities: persisted.activities || mockActivities,
  members: mockMembers,
  signupRecords: persisted.signupRecords || mockSignupRecords,
  reviews: persisted.reviews || mockReviews,
  memberLocations: persisted.memberLocations || mockMemberLocations,
  currentUserId: 'm001',

  getActivity: (id) => get().activities.find((a) => a.id === id),
  getMember: (id) => get().members.find((m) => m.id === id),
  getMySignups: (memberId) => get().signupRecords.filter((s) => s.memberId === memberId),
  getReviewByActivityId: (activityId) => get().reviews.find((r) => r.activityId === activityId),

  addActivity: (activity) => {
    set((state) => {
      const newActivities = [activity, ...state.activities];
      persistState({
        activities: newActivities,
        signupRecords: state.signupRecords,
        reviews: state.reviews,
        memberLocations: state.memberLocations
      });
      return { activities: newActivities };
    });
  },

  addSignup: (record) => {
    set((state) => {
      const newSignupRecords = [record, ...state.signupRecords];
      let newActivities = state.activities;

      if (record.status === 'approved') {
        newActivities = state.activities.map((a) => {
          if (a.id === record.activityId) {
            return {
              ...a,
              currentMembers: a.currentMembers + 1,
              paceGroups: a.paceGroups.map((pg) =>
                pg.id === record.paceGroupId
                  ? { ...pg, currentMembers: pg.currentMembers + 1 }
                  : pg
              )
            };
          }
          return a;
        });
      }

      persistState({
        activities: newActivities,
        signupRecords: newSignupRecords,
        reviews: state.reviews,
        memberLocations: state.memberLocations
      });

      return { activities: newActivities, signupRecords: newSignupRecords };
    });
  },

  updateCheckinStatus: (signupId, status) => {
    set((state) => {
      const newSignupRecords = state.signupRecords.map((s) =>
        s.id === signupId ? { ...s, checkinStatus: status, checkinTime: new Date().toISOString() } : s
      );

      const targetSignup = state.signupRecords.find((s) => s.id === signupId);
      let newReviews = state.reviews;

      if (targetSignup) {
        newReviews = state.reviews.map((r) => {
          if (r.activityId === targetSignup.activityId) {
            return {
              ...r,
              checkedMembers: newSignupRecords.filter(
                (s) => s.activityId === targetSignup.activityId && s.checkinStatus === 'checked'
              ).length,
              lateMembers: newSignupRecords.filter(
                (s) => s.activityId === targetSignup.activityId && s.checkinStatus === 'late'
              ).length,
              withdrawnMembers: newSignupRecords.filter(
                (s) => s.activityId === targetSignup.activityId && s.checkinStatus === 'withdrawn'
              ).length
            };
          }
          return r;
        });

        get().updateMemberAttendance(targetSignup.memberId, status);
      }

      persistState({
        activities: state.activities,
        signupRecords: newSignupRecords,
        reviews: newReviews,
        memberLocations: state.memberLocations
      });

      return { signupRecords: newSignupRecords, reviews: newReviews };
    });
  },

  updatePaceGroupMembers: (activityId, paceGroupId, delta) => {
    set((state) => {
      const newActivities = state.activities.map((a) => {
        if (a.id === activityId) {
          return {
            ...a,
            currentMembers: Math.max(0, a.currentMembers + delta),
            paceGroups: a.paceGroups.map((pg) =>
              pg.id === paceGroupId
                ? { ...pg, currentMembers: Math.max(0, pg.currentMembers + delta) }
                : pg
            )
          };
        }
        return a;
      });

      persistState({
        activities: newActivities,
        signupRecords: state.signupRecords,
        reviews: state.reviews,
        memberLocations: state.memberLocations
      });

      return { activities: newActivities };
    });
  },

  updateMemberAttendance: (memberId, status) => {
    set((state) => {
      const newMembers = state.members.map((m) => {
        if (m.id === memberId) {
          const totalSignups = state.signupRecords.filter((s) => s.memberId === memberId).length;
          const attendedCount = state.signupRecords.filter(
            (s) => s.memberId === memberId && (s.checkinStatus === 'checked' || s.checkinStatus === 'late')
          ).length;
          const lateCount = state.signupRecords.filter(
            (s) => s.memberId === memberId && s.checkinStatus === 'late'
          ).length;
          const rate = totalSignups > 0 ? Math.round((attendedCount / totalSignups) * 100) : m.attendanceRate;
          return {
            ...m,
            attendanceRate: rate,
            totalRuns: m.totalRuns + (status === 'checked' || status === 'late' ? 1 : 0)
          };
        }
        return m;
      });
      return { members: newMembers };
    });
  },

  reportLocation: (memberId, memberName, lng, lat) => {
    set((state) => {
      const existing = state.memberLocations.find((l) => l.memberId === memberId);
      let newLocations: MemberLocation[];

      if (existing) {
        newLocations = state.memberLocations.map((l) =>
          l.memberId === memberId
            ? { ...l, lng, lat, timestamp: Date.now(), isReturned: true }
            : l
        );
      } else {
        newLocations = [
          ...state.memberLocations,
          { memberId, memberName, lng, lat, timestamp: Date.now(), isReturned: true, reminded: false }
        ];
      }

      persistState({
        activities: state.activities,
        signupRecords: state.signupRecords,
        reviews: state.reviews,
        memberLocations: newLocations
      });

      return { memberLocations: newLocations };
    });
  },

  setMemberReturned: (memberId) => {
    set((state) => {
      const newLocations = state.memberLocations.map((l) =>
        l.memberId === memberId ? { ...l, isReturned: true } : l
      );

      persistState({
        activities: state.activities,
        signupRecords: state.signupRecords,
        reviews: state.reviews,
        memberLocations: newLocations
      });

      return { memberLocations: newLocations };
    });
  },

  remindMember: (memberId) => {
    set((state) => {
      const newLocations = state.memberLocations.map((l) =>
        l.memberId === memberId ? { ...l, reminded: true } : l
      );

      persistState({
        activities: state.activities,
        signupRecords: state.signupRecords,
        reviews: state.reviews,
        memberLocations: newLocations
      });

      return { memberLocations: newLocations };
    });
  },

  addReviewPhoto: (reviewId, photoUrl) => {
    set((state) => {
      const newReviews = state.reviews.map((r) =>
        r.id === reviewId ? { ...r, photos: [...r.photos, photoUrl] } : r
      );

      persistState({
        activities: state.activities,
        signupRecords: state.signupRecords,
        reviews: newReviews,
        memberLocations: state.memberLocations
      });

      return { reviews: newReviews };
    });
  },

  addReviewFeedback: (reviewId, feedback) => {
    set((state) => {
      const newReviews = state.reviews.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              feedbacks: [...r.feedbacks, feedback]
            }
          : r
      );

      persistState({
        activities: state.activities,
        signupRecords: state.signupRecords,
        reviews: newReviews,
        memberLocations: state.memberLocations
      });

      return { reviews: newReviews };
    });
  },

  markRemindedInReview: (reviewId) => {
    set((state) => {
      const review = state.reviews.find((r) => r.id === reviewId);
      const unreturnedIds = review?.unreturnedMembers || [];

      const newReviews = state.reviews.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              remindedMembers: Array.from(new Set([...r.remindedMembers, ...unreturnedIds]))
            }
          : r
      );

      const newLocations = state.memberLocations.map((l) =>
        unreturnedIds.includes(l.memberId) ? { ...l, reminded: true } : l
      );

      persistState({
        activities: state.activities,
        signupRecords: state.signupRecords,
        reviews: newReviews,
        memberLocations: newLocations
      });

      return { reviews: newReviews, memberLocations: newLocations };
    });
  },

  ensureReviewForActivity: (activityId) => {
    const state = get();
    const activity = state.getActivity(activityId);
    if (!activity) return null;

    const existing = state.reviews.find((r) => r.activityId === activityId);
    if (existing) return existing;

    const activitySignups = state.signupRecords.filter((s) => s.activityId === activityId);

    const paceGroupLists = activity.paceGroups.map((pg) => ({
      groupId: pg.id,
      groupName: pg.name,
      pace: pg.pace,
      members: activitySignups
        .filter((s) => s.paceGroupId === pg.id && s.status === 'approved')
        .map((s) => ({ id: s.memberId, name: s.memberName }))
    }));

    const newReview: ReviewRecord = {
      id: generateId(),
      activityId,
      activityTitle: activity.title,
      activityDate: activity.date,
      totalMembers: activitySignups.length,
      checkedMembers: activitySignups.filter((s) => s.checkinStatus === 'checked').length,
      lateMembers: activitySignups.filter((s) => s.checkinStatus === 'late').length,
      withdrawnMembers: activitySignups.filter((s) => s.checkinStatus === 'withdrawn').length,
      photos: [],
      feedbacks: [],
      unreturnedMembers: [],
      remindedMembers: [],
      paceGroupLists,
      createdAt: formatDateTime(new Date())
    };

    set((state) => {
      const newReviews = [newReview, ...state.reviews];
      persistState({
        activities: state.activities,
        signupRecords: state.signupRecords,
        reviews: newReviews,
        memberLocations: state.memberLocations
      });
      return { reviews: newReviews };
    });

    return newReview;
  },

  updateReviewStats: (activityId) => {
    set((state) => {
      const activitySignups = state.signupRecords.filter((s) => s.activityId === activityId);
      const newReviews = state.reviews.map((r) =>
        r.activityId === activityId
          ? {
              ...r,
              totalMembers: activitySignups.length,
              checkedMembers: activitySignups.filter((s) => s.checkinStatus === 'checked').length,
              lateMembers: activitySignups.filter((s) => s.checkinStatus === 'late').length,
              withdrawnMembers: activitySignups.filter((s) => s.checkinStatus === 'withdrawn').length
            }
          : r
      );

      persistState({
        activities: state.activities,
        signupRecords: state.signupRecords,
        reviews: newReviews,
        memberLocations: state.memberLocations
      });

      return { reviews: newReviews };
    });
  }
}));
