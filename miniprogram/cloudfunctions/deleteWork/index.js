const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 删除一篇作品。与 addWork 一样，写库前先比对 admins 集合的 openid 白名单，
// 非管理员即使拿到管理端入口也删不掉任何数据。
// 优先按云数据库主键 _id 删除（小程序端 normalize 后 id 即 _id），
// 失败则退回按业务字段 id 匹配删除。
exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()

  const admin = await db.collection('admins').where({ openid: OPENID }).count()
  if (admin.total === 0) {
    return { success: false, error: '无权限：当前微信不在管理员白名单' }
  }

  const id = event && event.id
  if (!id) {
    return { success: false, error: '缺少作品 id' }
  }

  try {
    const res = await db.collection('works').doc(id).remove()
    const removed = res && res.stats ? res.stats.removed : 1
    return { success: true, removed }
  } catch (e1) {
    // doc(id) 不存在（id 可能是业务 id 而非 _id）时，退回按业务字段删除
    try {
      const res2 = await db.collection('works').where({ id }).remove()
      const removed2 = res2 && res2.stats ? res2.stats.removed : 0
      if (removed2 === 0) {
        return { success: false, error: '未找到该作品' }
      }
      return { success: true, removed: removed2 }
    } catch (e2) {
      return { success: false, error: (e2 && e2.errMsg) || '删除失败' }
    }
  }
}
