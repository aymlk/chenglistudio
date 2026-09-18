import { View, ScrollView } from '@tarojs/components'
import { motion } from '../taro/motion'
import { Icon } from '../taro/Icon'
import type { Work } from '../content/works'
import WallCard from './WallCard'

const EASE = [0.16, 1, 0.3, 1] as const

type Props = {
  /** 作品墙标题（如「婚礼摄影」） */
  title: string
  works: Work[]
  onClose: () => void
  onOpenWork: (w: Work) => void
}

/**
 * 作品墙 —— 点击分类后「跳转出」的全屏视图。竖向滑动挑选作品。
 * 小程序没有 document / Esc，关闭由返回按钮触发。
 */
export default function WorksWall({ title, works, onClose, onOpenWork }: Props) {
  return (
    <motion.div
      className="fixed inset-0 z-40 flex flex-col bg-black"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
    >
      <View className="bg-noise pointer-events-none absolute inset-0 z-0 opacity-0-12" />

      {/* 顶部条 */}
      <View className="z-20 flex items-center gap-3 border-b border-white-5 bg-black-90 px-4 py-4 backdrop-blur-md">
        <View
          onClick={onClose}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white-10 text-white backdrop-blur"
        >
          <Icon name="arrowLeft" color="white" size={20} />
        </View>
        <View className="min-w-0 flex-1">
          <View className="truncate text-sm font-medium text-E1E0CC">作品墙 · {title}</View>
        </View>
      </View>

      {/* 竖向滑动区 */}
      <ScrollView scrollY className="scrollbar-hide relative z-10 flex-1 overflow-y-auto px-4 py-5">
        <View className="grid grid-cols-2 gap-3">
          {works.map((w, i) => (
            <WallCard key={w.id} work={w} index={i} onOpen={() => onOpenWork(w)} />
          ))}
        </View>
        <View className="mt-8 text-center text-10px tracking-wider text-gray-600">
          — 点击任意作品，纵向预览其作品集 —
        </View>
      </ScrollView>
    </motion.div>
  )
}
