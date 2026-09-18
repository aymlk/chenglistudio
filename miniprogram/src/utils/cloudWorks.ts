import Taro from '@tarojs/taro'
import { WORKS, type Work } from '../content/works'
import { CLOUD_ENV, WORKS_COLLECTION } from '../config'

/** 云端文档比渲染用的 Work 多一个 _id（云数据库自动主键） */
export type CloudWork = Work & { _id?: string }

/**
 * 拉取作品：优先读云数据库 works 集合；未配置云环境或读取失败则回退静态 WORKS。
 * 这样没开通云开发时小程序也完全可用，且云端为空时也不会白屏。
 */
export async function fetchWorks(): Promise<Work[]> {
  if (!CLOUD_ENV) return WORKS
  try {
    const cloud = (Taro as any).cloud
    if (!cloud || !cloud.database) return WORKS
    const db = cloud.database()
    const res = await db.collection(WORKS_COLLECTION).orderBy('number', 'asc').get()
    const list: CloudWork[] = (res && res.data) || []
    return list.length > 0 ? list.map(normalize) : WORKS
  } catch (e) {
    console.warn('[cloudWorks] 读取云端失败，使用静态数据', e)
    return WORKS
  }
}

/** 把云端文档收敛成渲染用的 Work（补齐缺字段，统一 id） */
function normalize(doc: CloudWork): Work {
  return {
    id: doc._id || doc.id,
    number: doc.number || '',
    title: doc.title || '',
    category: doc.category,
    videoSub: doc.videoSub,
    date: doc.date || '',
    location: doc.location || '',
    items: doc.items || [],
    cover: doc.cover || '',
    tags: doc.tags || [],
    description: doc.description || '',
    details: doc.details || [],
  }
}

/** 上传一张本地临时图/视频到云存储，返回 fileID（云存储内可访问地址） */
export async function uploadFile(tempFilePath: string): Promise<string> {
  const cloud = (Taro as any).cloud
  const clean = tempFilePath.split('?')[0]
  const ext = (clean.split('.').pop() || 'jpg').toLowerCase()
  const cloudPath = `works/${Date.now()}-${Math.floor(Math.random() * 1e6)}.${ext}`
  const res = await cloud.uploadFile({ cloudPath, filePath: tempFilePath })
  return res.fileID
}

/**
 * 云函数统一调用：云函数一律返回 { success, error? }，
 * 这里把 success:false 转成异常抛出，避免"服务端拒绝但客户端显示成功"的静默失败。
 */
async function callWithCheck(name: string, data?: Record<string, any>): Promise<any> {
  const res = await (Taro as any).cloud.callFunction({ name, data })
  const r = res && res.result
  if (!r || r.success === false) {
    throw new Error((r && r.error) || `云函数 ${name} 调用失败`)
  }
  return r
}

/**
 * 调用云函数 addWork 写库。写库权限由云函数内部的 openid 白名单校验保障，
 * 非管理员即使拿到入口也无法写入。
 */
export async function callAddWork(work: Omit<Work, 'id'>): Promise<void> {
  await callWithCheck('addWork', { work })
}

/** 首次使用：把静态初始作品批量导入云端（已存在则跳过） */
export async function callSeedWorks(works: Work[]): Promise<void> {
  await callWithCheck('seedWorks', { works })
}

/** 删除一篇作品（仅管理员；云函数内同样校验 openid 白名单） */
export async function callDeleteWork(id: string): Promise<void> {
  await callWithCheck('deleteWork', { id })
}

/**
 * 环境自检：返回当前微信的 openid 与是否管理员。
 * 用途：部署后先跑一次，拿到 openid 填进 admins 集合，并确认云函数已部署成功。
 */
export async function callCheckAdmin(): Promise<{ isAdmin: boolean; openid: string }> {
  const res = await (Taro as any).cloud.callFunction({ name: 'checkAdmin' })
  const r = res && res.result
  return { isAdmin: !!(r && r.isAdmin), openid: (r && r.openid) || '' }
}
