/**
 * 联系方式 —— 占位值集中在本文。
 * 用户提供真实信息后，只改本文件的 CONTACT 对象即可，组件不用动。
 */

export type ContactInfo = {
  /** 工作室名 */
  studio: string
  /** 一句话简介（显示在工作室名下方） */
  tagline: string
  /** 微信（占位） */
  wechat: string
  /** 电话（占位） */
  phone: string
  /** 邮箱 */
  email: string
  /** 营业/接单说明 */
  hours: string
}

export const CONTACT: ContactInfo = {
  studio: '橙梨影视',
  tagline: '婚礼摄影 · 婚礼摄像 · 品牌影像',
  wechat: 'chengli_studio', // TODO 占位：替换为真实微信号
  phone: '138-0000-0000', // TODO 占位：替换为真实电话
  email: 'hello@chengli.studio',
  hours: '全年接单，建议提前 2–3 个月预约档期',
}

/** 电话去掉分隔符，用于 tel: 链接与复制 */
export const PHONE_RAW = CONTACT.phone.replace(/[^\d+]/g, '')
