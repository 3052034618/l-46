export default defineAppConfig({
  pages: [
    'pages/activities/index',
    'pages/signup/index',
    'pages/map/index',
    'pages/members/index',
    'pages/review/index',
    'pages/activity-publish/index',
    'pages/activity-detail/index',
    'pages/member-detail/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ff6b35',
    navigationBarTitleText: '智慧跑团',
    navigationBarTextStyle: 'white',
    backgroundColor: '#fff5f0'
  },
  tabBar: {
    color: '#86909c',
    selectedColor: '#ff6b35',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/activities/index',
        text: '活动广场'
      },
      {
        pagePath: 'pages/signup/index',
        text: '报名签到'
      },
      {
        pagePath: 'pages/map/index',
        text: '路线地图'
      },
      {
        pagePath: 'pages/members/index',
        text: '成员档案'
      },
      {
        pagePath: 'pages/review/index',
        text: '活动复盘'
      }
    ]
  }
})
