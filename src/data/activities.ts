import type { Activity } from '../types';

export const mockActivities: Activity[] = [
  {
    id: 'a001',
    title: '周末滨江晨跑10K',
    date: '2026-06-14',
    startTime: '06:30',
    endTime: '08:30',
    meetPoint: '滨江公园东门集合',
    distance: 10,
    routeDesc: '滨江公园东门 → 沿江绿道 → 折返点 → 东门',
    status: 'upcoming',
    paceGroups: [
      { id: 'pg1', name: '挑战组', level: 'fast', pace: '5分00秒/km', maxMembers: 15, currentMembers: 12 },
      { id: 'pg2', name: '进阶组', level: 'medium', pace: '6分00秒/km', maxMembers: 20, currentMembers: 18 },
      { id: 'pg3', name: '欢乐组', level: 'slow', pace: '7分30秒/km', maxMembers: 25, currentMembers: 20 }
    ],
    maxMembers: 60,
    currentMembers: 50,
    supplyPoints: [
      { id: 'sp1', name: '3K补水站', distance: 3, type: 'water', lng: 121.499, lat: 31.239 },
      { id: 'sp2', name: '5K能量补给站', distance: 5, type: 'energy', lng: 121.502, lat: 31.241 },
      { id: 'sp3', name: '8K医疗站', distance: 8, type: 'medical', lng: 121.505, lat: 31.243 }
    ],
    organizerId: 'm001',
    organizerName: '张团长',
    healthTips: '请提前充分热身，有心脏病、高血压等病史者请勿参加',
    coverImage: 'https://picsum.photos/id/1036/750/400',
    lng: 121.499,
    lat: 31.239
  },
  {
    id: 'a002',
    title: '周三夜跑间歇训练',
    date: '2026-06-11',
    startTime: '19:30',
    endTime: '21:00',
    meetPoint: '体育中心北门',
    distance: 8,
    routeDesc: '体育中心田径场 400米间歇x10组',
    status: 'ongoing',
    paceGroups: [
      { id: 'pg4', name: '高强度组', level: 'fast', pace: '4分30秒/km', maxMembers: 10, currentMembers: 8 },
      { id: 'pg5', name: '间歇组', level: 'medium', pace: '5分30秒/km', maxMembers: 15, currentMembers: 14 }
    ],
    maxMembers: 25,
    currentMembers: 22,
    supplyPoints: [
      { id: 'sp4', name: '起点补水站', distance: 0, type: 'water', lng: 121.4737, lat: 31.2304 }
    ],
    organizerId: 'm001',
    organizerName: '张团长',
    healthTips: '间歇训练强度大，请量力而行，注意补水',
    coverImage: 'https://picsum.photos/id/1039/750/400',
    lng: 121.4737,
    lat: 31.2304
  },
  {
    id: 'a003',
    title: '6月城市马拉松预热跑',
    date: '2026-06-07',
    startTime: '06:00',
    endTime: '09:30',
    meetPoint: '人民广场喷泉处',
    distance: 21.0975,
    routeDesc: '人民广场 → 南京东路 → 外滩 → 陆家嘴 → 世纪公园 → 人民广场',
    status: 'finished',
    paceGroups: [
      { id: 'pg6', name: '破90组', level: 'fast', pace: '4分15秒/km', maxMembers: 10, currentMembers: 9 },
      { id: 'pg7', name: '破100组', level: 'medium', pace: '4分45秒/km', maxMembers: 15, currentMembers: 15 },
      { id: 'pg8', name: '完赛组', level: 'slow', pace: '5分30秒/km', maxMembers: 20, currentMembers: 19 }
    ],
    maxMembers: 45,
    currentMembers: 43,
    supplyPoints: [
      { id: 'sp5', name: '5K补水站', distance: 5, type: 'water', lng: 121.485, lat: 31.235 },
      { id: 'sp6', name: '10K能量站', distance: 10, type: 'energy', lng: 121.500, lat: 31.240 },
      { id: 'sp7', name: '15K医疗站', distance: 15, type: 'medical', lng: 121.515, lat: 31.230 },
      { id: 'sp8', name: '20K补给站', distance: 20, type: 'water', lng: 121.490, lat: 31.225 }
    ],
    organizerId: 'm001',
    organizerName: '张团长',
    healthTips: '半马距离，请务必赛前充分准备，量力而行',
    coverImage: 'https://picsum.photos/id/1044/750/400',
    lng: 121.4737,
    lat: 31.2304
  },
  {
    id: 'a004',
    title: '周一恢复慢跑',
    date: '2026-06-16',
    startTime: '07:00',
    endTime: '08:00',
    meetPoint: '世纪公园3号门',
    distance: 5,
    routeDesc: '世纪公园外圈慢跑',
    status: 'upcoming',
    paceGroups: [
      { id: 'pg9', name: '恢复组', level: 'slow', pace: '8分00秒/km', maxMembers: 30, currentMembers: 15 }
    ],
    maxMembers: 30,
    currentMembers: 15,
    supplyPoints: [
      { id: 'sp9', name: '起点补水站', distance: 0, type: 'water', lng: 121.548, lat: 31.220 }
    ],
    organizerId: 'm002',
    organizerName: '李副团长',
    healthTips: '恢复跑以放松为主，不要追求配速',
    coverImage: 'https://picsum.photos/id/1015/750/400',
    lng: 121.548,
    lat: 31.220
  },
  {
    id: 'a005',
    title: '周末长距离拉练',
    date: '2026-06-21',
    startTime: '05:30',
    endTime: '09:00',
    meetPoint: '徐汇滨江龙腾大道',
    distance: 18,
    routeDesc: '徐汇滨江 → 前滩 → 后滩 → 折返',
    status: 'upcoming',
    paceGroups: [
      { id: 'pg10', name: 'LSD快组', level: 'fast', pace: '5分20秒/km', maxMembers: 12, currentMembers: 6 },
      { id: 'pg11', name: 'LSD中组', level: 'medium', pace: '6分00秒/km', maxMembers: 18, currentMembers: 10 },
      { id: 'pg12', name: 'LSD慢组', level: 'slow', pace: '7分00秒/km', maxMembers: 20, currentMembers: 8 }
    ],
    maxMembers: 50,
    currentMembers: 24,
    supplyPoints: [
      { id: 'sp10', name: '6K补水站', distance: 6, type: 'water', lng: 121.465, lat: 31.185 },
      { id: 'sp11', name: '12K能量站', distance: 12, type: 'energy', lng: 121.480, lat: 31.175 },
      { id: 'sp12', name: '医疗保障', distance: 9, type: 'medical', lng: 121.472, lat: 31.180 }
    ],
    organizerId: 'm001',
    organizerName: '张团长',
    healthTips: '长距离拉练请自备能量胶和盐丸',
    coverImage: 'https://picsum.photos/id/1018/750/400',
    lng: 121.460,
    lat: 31.190
  }
];
