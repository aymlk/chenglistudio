const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 返回当前微信是否为管理员（管理端「环境自检」用）。
//
// 除鉴权结果外，额外返回几个轻量诊断字段，用于排查「白名单已填但仍显示未授权」：
//   env          云函数实际连接的环境 ID
//   adminsTotal  admins 集合里的记录条数（为 0 说明数据不在这个库里）
//   storedLength 库内第一条 openid 的长度
//   myLength     当前调用者 openid 的长度
// 只暴露长度与条数、不返回集合内 openid 明文，避免泄露他人凭据。
exports.main = async () => {
  const { OPENID, ENV } = cloud.getWXContext()
  const col = db.collection('admins')

  const total = await col.count()
  const hit = await col.where({ openid: OPENID }).count()

  let storedLength = 0
  try {
    const one = await col.limit(1).get()
    storedLength = String((one.data && one.data[0] && one.data[0].openid) || '').length
  } catch (e) {
    storedLength = -1
  }

  return {
    isAdmin: hit.total > 0,
    openid: OPENID,
    env: ENV || '',
    adminsTotal: total.total,
    storedLength,
    myLength: OPENID.length,
  }
}
