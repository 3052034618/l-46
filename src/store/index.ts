import { create } from 'zustand';
import type { Activity, Member, SignupRecord, ReviewRecord, MemberLocation } from '../types';
import { mockActivities } from '../data/activities';
import { mockMembers, mockSignupRecords, mockMemberLocations } from '../data/members';
import { mockReviews } from '../data/reviews';

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
  addActivity: (activity: Activity) => void;
  addSignup: (record: SignupRecord) => void;
  updateCheckinStatus: (signupId: string, status: SignupRecord['checkinStatus']) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  activities: mockActivities,
  members: mockMembers,
  signupRecords: mockSignupRecords,
  reviews: mockReviews,
  memberLocations: mockMemberLocations,
  currentUserId: 'm001',

  getActivity: (id) => get().activities.find((a) => a.id === id),
  getMember: (id) => get().members.find((m) => m.id === id),
  getMySignups: (memberId) => get().signupRecords.filter((s) => s.memberId === memberId),

  addActivity: (activity) => set((state) => ({ activities: [activity, ...state.activities] })),
  addSignup: (record) => set((state) => ({ signupRecords: [record, ...state.signupRecords] })),
  updateCheckinStatus: (signupId, status) => set((state) => ({
    signupRecords: state.signupRecords.map((s) =>
      s.id === signupId ? { ...s, checkinStatus: status, checkinTime: new Date().toISOString() } : s
    )
  }))
}));
