const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 写库前校验管理员：比对 admins 集合中是否存在当前调用者的 openid。
// 非管理员即使拿到管理端入口也无法写入 works 集合。
exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const { work } = event

  const admin = await db.collection('admins').where({ openid: OPENID }).count()
  if (admin.total === 0) {
    return { success: false, error: '无权限：当前微信不在管理员白名单' }
  }
  if (!work || !work.title) {
    return { success: false, error: '数据不完整' }
  }

  const res = await db.collection('works').add({ data: work })
  return { success: true, _id: res._id }
}
