export default defineAppConfig({
  pages: ['pages/index/index'],
  window: {
    navigationBarBackgroundColor: '#000000',
    navigationBarTextStyle: 'white',
    navigationBarTitleText: '橙梨影视',
    backgroundColor: '#000000',
    backgroundTextStyle: 'dark',
    // 关闭下拉刷新（属于 window 配置，不能放在顶层）
    enablePullDownRefresh: false,
  },
  style: 'v2',
  // 组件按需注入：只注入页面/组件实际用到的组件，减少启动时的注入开销，
  // 缩短冷启动时间。开发者工具「代码质量」建议项，要求基础库 2.11.1+。
  lazyCodeLoading: 'requiredComponents',
})
