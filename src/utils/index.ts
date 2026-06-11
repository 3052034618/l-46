import dayjs from 'dayjs';

export const formatDate = (date: string | Date, format = 'YYYY-MM-DD') => {
  return dayjs(date).format(format);
};

export const formatDateTime = (date: string | Date, format = 'YYYY-MM-DD HH:mm') => {
  return dayjs(date).format(format);
};

export const getPaceLevelText = (level: string) => {
  const map: Record<string, string> = {
    fast: '快跑组',
    medium: '中速组',
    slow: '慢跑组'
  };
  return map[level] || level;
};

export const getPaceLevelColor = (level: string) => {
  const map: Record<string, string> = {
    fast: '#f53f3f',
    medium: '#ff7d00',
    slow: '#00b42a'
  };
  return map[level] || '#ff6b35';
};

export const getActivityStatusText = (status: string) => {
  const map: Record<string, string> = {
    upcoming: '即将开始',
    ongoing: '进行中',
    finished: '已结束',
    cancelled: '已取消'
  };
  return map[status] || status;
};

export const getActivityStatusColor = (status: string) => {
  const map: Record<string, string> = {
    upcoming: '#165dff',
    ongoing: '#00b42a',
    finished: '#86909c',
    cancelled: '#f53f3f'
  };
  return map[status] || '#86909c';
};

export const getSignupStatusText = (status: string) => {
  const map: Record<string, string> = {
    pending: '待审核',
    approved: '已通过',
    waitlist: '候补',
    cancelled: '已取消'
  };
  return map[status] || status;
};

export const getCheckinStatusText = (status: string) => {
  const map: Record<string, string> = {
    not_checked: '未签到',
    checked: '已签到',
    late: '迟到',
    withdrawn: '退赛'
  };
  return map[status] || status;
};

export const getCheckinStatusColor = (status: string) => {
  const map: Record<string, string> = {
    not_checked: '#86909c',
    checked: '#00b42a',
    late: '#ff7d00',
    withdrawn: '#f53f3f'
  };
  return map[status] || '#86909c';
};

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
