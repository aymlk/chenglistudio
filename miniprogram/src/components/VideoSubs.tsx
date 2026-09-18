import { useState } from 'react'
import { View, ScrollView } from '@tarojs/components'
import { motion } from '../taro/motion'
import { Icon } from '../taro/Icon'
import WallCard from './WallCard'
import { VIDEO_SUBS, WORKS, type VideoSub, type Work } from '../content/works'

const EASE = [0.16, 1, 0.3, 1] as const

type Props = {
  onClose: () => void
  onOpenWork: (w: Work) => void
}

/**
 * 婚礼摄像的二级入口 —— 左侧竖栏子类型 + 右侧作品墙。
 * 移动端适配：左栏收窄为 112px 紧凑列表（序号 + 名称 + 数量），
 * 右侧作品墙占满剩余宽度，避免桌面版宽侧栏挤压预览区。
 */
export default function VideoSubs({ onClose, onOpenWork }: Props) {
  const [activeSub, setActiveSub] = useState<VideoSub>(VIDEO_SUBS[0].id)

  const activeWorks = WORKS.filter((w) => w.category === 'video' && w.videoSub === activeSub)

  return (
    <motion.div
      className="fixed inset-0 z-40 flex flex-col bg-black"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
    >
      <View className="bg-noise pointer-events-none absolute inset-0 z-0 opacity-0-12" />

      {/* 顶部条 */}
      <View className="z-20 flex shrink-0 items-center gap-3 border-b border-white-5 bg-black-90 px-4 py-4 backdrop-blur-md">
        <View
          onClick={onClose}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white-10 text-white backdrop-blur"
        >
          <Icon name="arrowLeft" color="white" size={20} />
        </View>
        <View className="min-w-0 flex-1">
          <View className="text-10px uppercase tracking-0-2em text-primary-70">婚礼摄像</View>
          <View className="truncate text-sm font-medium text-E1E0CC">
            {VIDEO_SUBS.length} 个类型 · 点左侧切换
          </View>
        </View>
      </View>

      {/* 两栏主体：左侧竖栏分类 + 右侧作品墙 */}
      <View className="relative z-10 flex min-h-0 flex-1">
        {/* 左侧：紧凑竖栏导航（112px） */}
        <ScrollView
          scrollY
          className="scrollbar-hide shrink-0 border-r border-white-5 bg-0c0c0c"
          style={{ width: 112, height: '100%' }}
        >
          <View className="flex flex-col gap-1 px-2 py-3">
            {VIDEO_SUBS.map((s, i) => {
              const count = WORKS.filter((w) => w.category === 'video' && w.videoSub === s.id).length
              const active = s.id === activeSub
              return (
                <View
                  key={s.id}
                  onClick={() => setActiveSub(s.id)}
                  className={`flex flex-col rounded-lg px-2 py-2-5 text-left ${
                    active ? 'bg-white-10 ring-primary-40' : 'bg-transparent'
                  }`}
                >
                  <View className="flex items-center justify-between">
                    <View
                      className={`text-9px tracking-0-15em ${active ? 'text-primary' : 'text-gray-600'}`}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </View>
                    <Icon name="play" color={active ? 'primary' : 'gray'} size={10} />
                  </View>
                  <View
                    className={`mt-1 text-13px font-medium leading-snug ${
                      active ? 'text-E1E0CC' : 'text-gray-300'
                    }`}
                  >
                    {s.label}
                  </View>
                  <View className="mt-1 text-9px text-primary-70">{count} 组作品</View>
                </View>
              )
            })}
          </View>
        </ScrollView>

        {/* 右侧：当前子类型的作品墙（占满剩余宽度） */}
        <ScrollView scrollY className="scrollbar-hide min-h-0 flex-1 px-3 py-4">
          <View className="mb-4">
            <View className="text-10px uppercase tracking-0-2em text-primary-70">
              {VIDEO_SUBS.find((s) => s.id === activeSub)?.label}
            </View>
            <View className="text-sm font-medium text-E1E0CC">
              {activeWorks.length} 组作品
            </View>
          </View>

          <View className="grid grid-cols-1 gap-3">
            {activeWorks.map((w, i) => (
              <WallCard key={w.id} work={w} index={i} onOpen={() => onOpenWork(w)} />
            ))}
          </View>

          {activeWorks.length === 0 && (
            <View className="mt-20 text-center text-sm text-gray-500">该分类下暂无作品，敬请期待。</View>
          )}

          {activeWorks.length > 0 && (
            <View className="mt-8 text-center text-10px tracking-wider text-gray-600">
              — 点击任意作品，纵向预览其作品集 —
            </View>
          )}
        </ScrollView>
      </View>
    </motion.div>
  )
}
