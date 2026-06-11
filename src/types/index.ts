export type PaceLevel = 'fast' | 'medium' | 'slow';
export type ActivityStatus = 'upcoming' | 'ongoing' | 'finished' | 'cancelled';
export type SignupStatus = 'pending' | 'approved' | 'waitlist' | 'cancelled';
export type CheckinStatus = 'not_checked' | 'checked' | 'late' | 'withdrawn';

export interface PaceGroup {
  id: string;
  name: string;
  level: PaceLevel;
  pace: string;
  maxMembers: number;
  currentMembers: number;
}

export interface SupplyPoint {
  id: string;
  name: string;
  distance: number;
  type: 'water' | 'energy' | 'medical';
  lng: number;
  lat: number;
}

export interface MemberLocation {
  memberId: string;
  memberName: string;
  lng: number;
  lat: number;
  timestamp: number;
  isReturned: boolean;
  reminded?: boolean;
}

export interface Activity {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  meetPoint: string;
  distance: number;
  routeDesc: string;
  status: ActivityStatus;
  paceGroups: PaceGroup[];
  maxMembers: number;
  currentMembers: number;
  supplyPoints: SupplyPoint[];
  organizerId: string;
  organizerName: string;
  healthTips: string;
  coverImage: string;
  lng: number;
  lat: number;
}

export interface Member {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  emergencyContact: string;
  emergencyPhone: string;
  healthStatus: string;
  paceLevel: PaceLevel;
  totalRuns: number;
  attendanceRate: number;
  joinDate: string;
  recentActivities: string[];
}

export interface SignupRecord {
  id: string;
  activityId: string;
  activityTitle: string;
  memberId: string;
  memberName: string;
  paceGroupId: string;
  paceGroupName: string;
  status: SignupStatus;
  checkinStatus: CheckinStatus;
  checkinTime?: string;
  signupTime: string;
}

export interface ReviewRecord {
  id: string;
  activityId: string;
  activityTitle: string;
  activityDate: string;
  totalMembers: number;
  checkedMembers: number;
  lateMembers: number;
  withdrawnMembers: number;
  photos: string[];
  feedbacks: ReviewFeedback[];
  unreturnedMembers: string[];
  remindedMembers: string[];
  paceGroupLists: PaceGroupList[];
  createdAt: string;
}

export interface PaceGroupList {
  groupId: string;
  groupName: string;
  pace: string;
  members: { id: string; name: string }[];
}

export interface ReviewFeedback {
  id: string;
  memberId: string;
  memberName: string;
  rating: number;
  content: string;
  createdAt: string;
}

export interface AttendanceStat {
  totalActivities: number;
  attendedCount: number;
  lateCount: number;
  absentCount: number;
  attendanceRate: number;
}
