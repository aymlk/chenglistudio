import { View } from '@tarojs/components'
import { motion } from '../taro/motion'
import { Icon } from '../taro/Icon'
import type { Work } from '../content/works'

const EASE = [0.16, 1, 0.3, 1] as const

type Props = {
  work: Work
  index: number
  onOpen: () => void
}

/** 作品墙上的单张作品卡片 —— 可被 WorksWall / VideoSubs 复用。 */
export default function WallCard({ work, index, onOpen }: Props) {
  const photoCount = work.items.filter((i) => i.type === 'photo').length
  const videoCount = work.items.filter((i) => i.type === 'video').length

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: Math.min(index, 8) * 0.05, ease: EASE }}
      className="relative block aspect-4-5 w-full shrink-0 overflow-hidden rounded-2xl text-left"
    >
      <View
        className="absolute inset-0"
        style={{ background: work.cover, backgroundSize: 'cover' }}
      />
      <View className="noise-overlay pointer-events-none absolute inset-0 opacity-50 mix-blend-overlay" />
      <View
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 35%, transparent 55%, rgba(0,0,0,0.88) 100%)',
        }}
      />

      <View className="absolute left-3 top-3 z-10 flex items-center gap-1-5">
        <View className="rounded-full bg-black-45 px-2 py-0-5 text-9px tracking-0-15em text-primary-90">
          {work.number}
        </View>
      </View>

      {videoCount > 0 && (
        <View className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-black-55 px-2 py-0-5 text-9px tracking-wider text-primary-85">
          <Icon name="play" color="primary" size={10} />
          {videoCount}
        </View>
      )}

      <View className="absolute bottom-3 right-3 z-10 flex items-center gap-1 rounded-full bg-black-55 px-2 py-0-5 text-9px tracking-wider text-primary-85">
        <Icon name="layers" color="primary" size={12} />
        <View>{work.items.length}</View>
      </View>

      <View className="absolute inset-x-0 bottom-0 z-10 p-3">
        <View className="text-15px font-medium leading-tight text-E1E0CC">{work.title}</View>
        <View className="mt-1 flex items-center gap-1-5 text-10px text-gray-400">
          <View className="truncate">{work.date}</View>
          <View className="h-0-5 w-0-5 shrink-0 rounded-full bg-gray-500" />
          <View className="truncate">{work.location}</View>
        </View>
      </View>
    </motion.button>
  )
}
