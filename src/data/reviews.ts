import type { ReviewRecord } from '../types';

export const mockReviews: ReviewRecord[] = [
  {
    id: 'r001',
    activityId: 'a003',
    activityTitle: '6月城市马拉松预热跑',
    activityDate: '2026-06-07',
    totalMembers: 43,
    checkedMembers: 40,
    lateMembers: 2,
    withdrawnMembers: 1,
    photos: [
      'https://picsum.photos/id/1036/600/400',
      'https://picsum.photos/id/1039/600/400',
      'https://picsum.photos/id/1044/600/400',
      'https://picsum.photos/id/1015/600/400',
      'https://picsum.photos/id/1018/600/400'
    ],
    feedbacks: [
      {
        id: 'f001',
        memberId: 'm001',
        memberName: '张团长',
        rating: 5,
        content: '组织得非常好，补给点充足，大家都很有热情！下次继续加油！',
        createdAt: '2026-06-07 18:30'
      },
      {
        id: 'f002',
        memberId: 'm009',
        memberName: '吴佳佳',
        rating: 4,
        content: '路线很棒，希望下次能再多一个补给点在17K位置就完美了',
        createdAt: '2026-06-07 19:15'
      },
      {
        id: 'f003',
        memberId: 'm005',
        memberName: '陈大力',
        rating: 5,
        content: '慢跑组的配速很合适，谢谢团长组织！',
        createdAt: '2026-06-07 20:00'
      }
    ],
    unreturnedMembers: [],
    remindedMembers: [],
    paceGroupLists: [
      {
        groupId: 'pg6',
        groupName: '破90组',
        pace: '4分15秒/km',
        members: [
          { id: 'm001', name: '张团长' },
          { id: 'm009', name: '吴佳佳' },
          { id: 'm006', name: '刘飞飞' }
        ]
      },
      {
        groupId: 'pg7',
        groupName: '破100组',
        pace: '4分45秒/km',
        members: [
          { id: 'm002', name: '李副团长' },
          { id: 'm003', name: '王小明' },
          { id: 'm007', name: '孙悦悦' }
        ]
      },
      {
        groupId: 'pg8',
        groupName: '完赛组',
        pace: '5分30秒/km',
        members: [
          { id: 'm004', name: '赵晓红' },
          { id: 'm005', name: '陈大力' }
        ]
      }
    ],
    createdAt: '2026-06-07 21:00'
  }
];
