const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// 首次使用：把小程序内置的静态初始作品批量导入云端。
// works 由小程序端传入（src/content/works.ts 的 WORKS），不在云函数内写死。
// 已存在相同 id 的作品会跳过，可重复调用。
exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const admin = await db.collection('admins').where({ openid: OPENID }).count()
  if (admin.total === 0) {
    return { success: false, error: '无权限' }
  }

  const works = event.works || []
  let added = 0
  let skipped = 0
  for (const w of works) {
    const exist = await db.collection('works').where({ id: w.id }).count()
    if (exist.total === 0) {
      await db.collection('works').add({ data: w })
      added++
    } else {
      skipped++
    }
  }
  return { success: true, added, skipped }
}
