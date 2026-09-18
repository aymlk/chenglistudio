/**
 * 作品集数据 —— 后期补充真实素材时只改本文件。
 *
 * `placeholder` 是占位渐变（避免依赖未准备好的图片），
 * 真实素材接入时新增 `src: 'https://...'` 字段，渲染时优先读 src。
 *
 * 点开作品是纵向滑动浏览体验（小红书/IG 风格）：
 * - 每个作品 = 一个 items 数组
 * - 每项可以是 photo 或 video（视频禁用点赞/留言）
 * - 每张照片可点赞 + 留言（本地 state，无后端）
 */

export type WorkCategory = 'photo' | 'video'

/** 婚礼摄像的细分类型（仅 video 类作品使用） */
export type VideoSub = 'trailer30' | 'trailer60' | 'mv3' | 'sameday'

export type WorkItemType = 'photo' | 'video'

export type WorkComment = {
  id: string
  author: string
  text: string
  time: string
}

export type WorkItem = {
  id: string
  type: WorkItemType
  /** 占位渐变（CSS background 字符串） */
  placeholder: string
  /** 真实素材地址（可选，接入真实图/视频时填） */
  src?: string
  /** 单图下方的小字说明（可选） */
  caption?: string
  /** 初始点赞数（演示用） */
  likes: number
  /** 初始留言（演示用） */
  comments: WorkComment[]
}

export type Work = {
  id: string
  number: string
  title: string
  category: WorkCategory
  /** 婚礼摄像的细分类型（仅 video 类作品使用） */
  videoSub?: VideoSub
  date: string
  location: string
  /** 作品集的全部图/视频（首项也用作卡片封面） */
  items: WorkItem[]
  /** 封面渐变（卡片墙使用；取 items[0].placeholder 的 hue 简化版本） */
  cover: string
  tags: string[]
  description: string
  /** 详情里的小节列表 */
  details: string[]
}

export const CATEGORIES: { id: WorkCategory; label: string; hint: string }[] = [
  { id: 'photo', label: '婚礼摄影', hint: '光影、情绪与瞬间的静态叙事' },
  { id: 'video', label: '婚礼摄像', hint: '让那一天重新流动的动态影像' },
]

/** 婚礼摄像的 4 个细分类型 —— 作为二级入口 */
export const VIDEO_SUBS: { id: VideoSub; label: string; hint: string }[] = [
  { id: 'trailer30', label: '30 秒预告', hint: '把一整天压进 30 秒，社交平台首发' },
  { id: 'trailer60', label: '60 秒预告', hint: '更完整的情绪铺垫，适合正式预告' },
  { id: 'mv3', label: '3 分钟 MV', hint: '以一首歌的时间讲完这天，微电影质感' },
  { id: 'sameday', label: '当天快剪', hint: '宴席尾声现场首映，把惊喜留在当天' },
]

/** 占位封面：暗色基调 + 暖色光晕，模拟电影感 */
function gradient(hue: number): string {
  return `radial-gradient(ellipse 80% 60% at 30% 20%, rgba(222, 219, 200, 0.18), transparent 60%), linear-gradient(${hue}deg, #0a0a0a 0%, #161616 45%, #0d0d0d 100%)`
}

/** 同一色相的小幅变体，用于同一作品集里多张图之间的差异 */
function gradientVariant(hue: number, shift: number): string {
  return `radial-gradient(ellipse 70% 55% at ${30 + shift * 4}% ${20 + shift * 3}%, rgba(222, 219, 200, ${0.14 + (shift % 3) * 0.04}), transparent 60%), linear-gradient(${(hue + shift * 8) % 360}deg, #0a0a0a 0%, #161616 45%, #0d0d0d 100%)`
}

function photo(hue: number, shift: number, caption?: string, likes = 0): WorkItem {
  return {
    id: `i-${hue}-${shift}`,
    type: 'photo',
    placeholder: gradientVariant(hue, shift),
    caption,
    likes: likes || Math.floor(Math.random() * 120) + 12,
    comments: [],
  }
}

function video(hue: number, shift: number, caption?: string): WorkItem {
  return {
    id: `v-${hue}-${shift}`,
    type: 'video',
    placeholder: gradientVariant(hue, shift),
    caption,
    likes: 0,
    comments: [],
  }
}

export const WORKS: Work[] = [
  {
    id: 'w01',
    number: '01',
    title: '江畔的誓词',
    category: 'photo',
    date: '2025.10',
    location: '上海 · 外滩',
    cover: gradient(15),
    tags: ['单机摄影', '外景', '黄昏'],
    description: '十月的外滩，黄浦江的风把婚纱裙摆吹成弧形。我们在廊桥下等了一小时，等那束从对岸楼宇间漏下来的夕光。',
    details: [
      '8 小时跟拍，化妆到 First Dance',
      '精修 40 张，底片 800+',
      '外景与仪式以黄昏侧逆光为主',
    ],
    items: [
      photo(15, 0, '外滩廊桥 · 黄昏侧逆光'),
      photo(15, 1, '江风与裙摆', 86),
      photo(15, 2, '交换戒指的瞬间', 142),
      photo(15, 3, 'First Dance', 95),
      photo(15, 4, '廊桥下的剪影', 64),
    ],
  },
  {
    id: 'w02',
    number: '02',
    title: '青砖老宅的喜宴',
    category: 'photo',
    date: '2025.09',
    location: '苏州 · 平江路',
    cover: gradient(45),
    tags: ['双机摄影摄像', '古宅', '晚宴'],
    description: '一场在清代老宅里的家宴。没有司仪，新人给每位长辈敬茶。我们在巷口架起副机位，等那个三进院落里的回响。',
    details: [
      '双机摄影 + 双机摄像',
      '24 小时预告 30 秒 + 精修 12 张',
      '3 分钟花絮 + 20 分钟完整纪录片',
    ],
    items: [
      photo(45, 0, '三进院落 · 迎亲'),
      photo(45, 1, '给长辈敬茶', 110),
      photo(45, 2, '家宴席间', 78),
      photo(45, 3, '夜色里的红灯笼', 134),
      video(45, 4, '家宴纪录片段'),
    ],
  },
  {
    id: 'w03',
    number: '03',
    title: '海边的清晨',
    category: 'photo',
    date: '2025.08',
    location: '舟山 · 朱家尖',
    cover: gradient(200),
    tags: ['单机摄影', '海滩', '晨光'],
    description: '凌晨四点半出发，赶到海边时天边刚泛出第一道光。新人说："我们想留下刚醒来时的那种感觉。"',
    details: [
      '6 小时半日纪实',
      '精修 40 张，底片 800+',
      '自然光为主，零补光',
    ],
    items: [
      photo(200, 0, '凌晨四点半 · 出发'),
      photo(200, 1, '海风里的裙摆', 52),
      photo(200, 2, '第一道晨光', 168),
      photo(200, 3, '礁石上的剪影', 73),
    ],
  },
  {
    id: 'w04',
    number: '04',
    title: '教堂里的二重唱',
    category: 'video',
    videoSub: 'trailer60',
    date: '2025.07',
    location: '杭州 · 圣母无原罪堂',
    cover: gradient(280),
    tags: ['双机摄像', '完整版', '仪式'],
    description: '新人都是合唱团成员。唱诗班的回声让他们在交换戒指时笑出了声——我们没有删掉那几秒。',
    details: [
      '双机摄像 · 完整版',
      '24 小时预告 60 秒',
      '3 分钟花絮 + 20 分钟纪录片',
    ],
    items: [
      video(280, 0, '仪式完整片段 · 00:00-03:20'),
      video(280, 1, '花絮 · 合唱团排练'),
      video(280, 2, '交换戒指 · 笑出声的几秒'),
    ],
  },
  {
    id: 'w05',
    number: '05',
    title: '山里的小型仪式',
    category: 'photo',
    date: '2025.06',
    location: '莫干山',
    cover: gradient(90),
    tags: ['纪实', '户外', '8 人'],
    description: '一场只有 8 位亲友的小型仪式。新人自己写誓词，从山上走下来的时候，所有人都在哭。',
    details: [
      '单机摄影 + 单机摄像组合',
      '纪实风格，不做摆拍引导',
      '成片以现场同期声为主',
    ],
    items: [
      photo(90, 0, '山间小路 · 上山'),
      photo(90, 1, '8 位亲友的小仪式', 89),
      photo(90, 2, '自己写的誓词', 201),
      photo(90, 3, '下山时所有人都在哭', 156),
    ],
  },
  {
    id: 'w06',
    number: '06',
    title: '院里的回门宴',
    category: 'photo',
    date: '2025.05',
    location: '成都 · 宽窄巷子',
    cover: gradient(330),
    tags: ['双机摄影摄像', '院落', '中式'],
    description: '回门宴，老人坚持用老式的八抬大轿把新娘接回来。我们在巷子里架了一台副机，等那顶轿子转过街角。',
    details: [
      '双机摄影 + 双机摄像 · 完整版',
      '24 小时预告 60 秒',
      '精修 70 张 + 完整纪录片',
    ],
    items: [
      photo(330, 0, '巷口的八抬大轿'),
      photo(330, 1, '轿子转过街角', 178),
      photo(330, 2, '院落里的敬茶', 94),
      video(330, 3, '迎亲纪录片段'),
    ],
  },
  {
    id: 'w07',
    number: '07',
    title: '樱花季的短旅',
    category: 'photo',
    date: '2025.04',
    location: '无锡 · 鼋头渚',
    cover: gradient(0),
    tags: ['单机摄影', '樱花', '旅拍'],
    description: '婚前一周的预拍。新人从上海坐高铁过来，只为看那一周的樱花。',
    details: [
      '4 小时旅拍',
      '精修 30 张',
      '自然光 + 长焦压缩感',
    ],
    items: [
      photo(0, 0, '鼋头渚 · 樱花大道'),
      photo(0, 1, '花瓣落在肩上', 67),
      photo(0, 2, '湖边的回眸', 145),
      photo(0, 3, '黄昏离开时', 88),
    ],
  },
  {
    id: 'w08',
    number: '08',
    title: '夜场快剪',
    category: 'video',
    videoSub: 'sameday',
    date: '2025.03',
    location: '上海 · 外滩源',
    cover: gradient(220),
    tags: ['双机摄像', '快剪', '夜场'],
    description: '宴席尾声，剪辑师直接在酒店宴会厅架起工作站。新人致辞结束后 20 分钟，屏幕上已经播出了当日快剪。',
    details: [
      '双机摄像 · 完整版',
      '现场驻场剪辑师',
      '宴席尾声现场首映',
    ],
    items: [
      video(220, 0, '夜场快剪 · 完整版'),
      video(220, 1, '现场首映 · 新人反应'),
    ],
  },
  {
    id: 'w09',
    number: '09',
    title: '江畔晨光 · 30 秒预告',
    category: 'video',
    videoSub: 'trailer30',
    date: '2025.11',
    location: '上海 · 北外滩',
    cover: gradient(20),
    tags: ['30 秒预告', '卡点', '横竖双版'],
    description: '把一整天的情绪压进 30 秒，卡着鼓点剪辑，适合朋友圈与短视频平台首发。',
    details: [
      '单机 + 副机素材',
      '当日剪辑，24 小时内交付',
      '横版 / 竖版双交付，社交平台直发',
    ],
    items: [
      video(20, 0, '30 秒预告 · 卡点成片'),
      video(20, 1, '花絮 · 调色对比'),
    ],
  },
  {
    id: 'w10',
    number: '10',
    title: '山间小院 · 3 分钟 MV',
    category: 'video',
    videoSub: 'mv3',
    date: '2025.10',
    location: '莫干山',
    cover: gradient(95),
    tags: ['3 分钟 MV', '叙事', '同期声'],
    description: '以一首歌的时间讲完这一天的故事，大量同期声与特写，像一支微电影。',
    details: [
      '双机摄像 · 完整记录',
      '精编 3 分钟，配乐叙事',
      '4K 交付，支持投屏',
    ],
    items: [
      video(95, 0, '3 分钟 MV · 正片'),
      video(95, 1, '花絮 · 现场调度'),
      video(95, 2, '调色前后对比'),
    ],
  },
  {
    id: 'w11',
    number: '11',
    title: '樱花旅拍 · 30 秒预告',
    category: 'video',
    videoSub: 'trailer30',
    date: '2025.04',
    location: '无锡 · 鼋头渚',
    cover: gradient(340),
    tags: ['30 秒预告', '旅拍', '轻快'],
    description: '婚前旅拍的 30 秒快剪，把樱花、湖面与回眸剪成一段轻盈的预告。',
    details: [
      '单机旅拍素材',
      '当日粗剪 + 精修交付',
      '适合作为请柬彩蛋',
    ],
    items: [
      video(340, 0, '30 秒预告 · 旅拍版'),
      video(340, 1, '花絮 · 樱花大道'),
    ],
  },
]
