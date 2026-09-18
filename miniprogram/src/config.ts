/**
 * 云开发配置 —— 仅在「微信开发者工具开通云开发」并填入环境 ID 后生效。
 *
 * CLOUD_ENV 留空时，小程序自动使用静态 works.ts 数据，照常运行（顾客无感、
 * 构建也能通过）。开通云环境后把环境 ID 填到这里即可切换到云端动态数据。
 *
 * 环境 ID 在微信开发者工具「云开发」控制台左上角获取（形如 photography-9abcde）。
 */
export const CLOUD_ENV = 'cloud1-d1ga8bnhte00f0bb4'

/** 连点「作品」标题多少次进入隐藏的管理端（仅管理员知道这个入口） */
export const ADMIN_TAPS = 5

/** 管理员 openid 白名单集合名（云数据库） */
export const ADMIN_COLLECTION = 'admins'

/** 作品集合名（云数据库） */
export const WORKS_COLLECTION = 'works'

/**
 * 离开小程序前弹确认框的文案；设为 `false` 可关闭此功能。
 *
 * 背景：微信 7.0.5 客户端起，「右滑手势返回」升级为基础能力，
 * 页面配置 `disableSwipeBack` 已被官方废弃、**不再生效**，右滑退出无法被禁用。
 * 因此改用「离开前确认」（wx.enableAlertBeforeUnload，基础库 2.12.0+）来防止误触退出。
 */
export const CONFIRM_BEFORE_EXIT: string | false = '确定要离开橙梨影视吗？'
