export default {
  navigationBarTitleText: '橙梨影视',
  navigationBarBackgroundColor: '#000000',
  navigationBarTextStyle: 'white',
  backgroundColor: '#000000',
  enablePullDownRefresh: false,
  // 注意：这里曾经配过 disableSwipeBack: true，但微信 7.0.5 起该字段已被官方废弃、
  // 不再生效（右滑返回成为基础能力）。改用 src/config.ts 的 CONFIRM_BEFORE_EXIT
  // 开启「离开前确认」来防误触退出。
}
