import { useEffect, useRef, useState } from 'react'
import { View } from '@tarojs/components'
import { motion } from '../taro/motion'
import { Layer } from '../taro/Layer'
import { Icon } from '../taro/Icon'
import WordsPullUpMultiStyle, { type Segment } from '../components/WordsPullUpMultiStyle'
import WorksWall from '../components/WorksWall'
import VideoSubs from '../components/VideoSubs'
import WorkModal from '../components/WorkModal'
import AdminPanel from '../components/AdminPanel'
import { CATEGORIES, WORKS, type Work } from '../content/works'
import { fetchWorks } from '../utils/cloudWorks'
import { ADMIN_TAPS } from '../config'

const HEADER: Segment[] = [
  { text: '作品，', className: 'text-E1E0CC' },
  { text: '比文字更诚实。', className: 'text-gray-500' },
]

const EASE = [0.22, 1, 0.36, 1] as const

/** 作品区视图状态机 */
export type Stage = { view: 'home' } | { view: 'photoWall' } | { view: 'videoSubs' }

export default function Works({
  onOverlayChange,
  registerCloseTop,
}: {
  /** 本区块是否有浮层打开（作品墙 / 子类型页 / 作品详情 / 管理端） */
  onOverlayChange?: (open: boolean) => void
  /** 向上注册「关闭最上层浮层」的方法，供返回手势调用 */
  registerCloseTop?: (fn: () => void) => void
} = {}) {
  const [stage, setStage] = useState<Stage>({ view: 'home' })
  const [openWork, setOpenWork] = useState<Work | null>(null)
  const [works, setWorks] = useState<Work[]>(WORKS)
  const [showAdmin, setShowAdmin] = useState(false)
  const [titleTaps, setTitleTaps] = useState(0)

  // 进入作品区时拉取云端数据；未配置云环境时 fetchWorks 直接回退静态数据
  useEffect(() => {
    let alive = true
    fetchWorks().then((list) => {
      if (alive) setWorks(list)
    })
    return () => {
      alive = false
    }
  }, [])

  const photoWorks = works.filter((w) => w.category === 'photo')
  const videoWorks = works.filter((w) => w.category === 'video')

  // 隐藏入口：连点「作品」标题 N 次进入管理端（顾客无感知）
  const handleTitleTap = () => {
    const next = titleTaps + 1
    setTitleTaps(next)
    if (next >= ADMIN_TAPS) {
      setTitleTaps(0)
      setShowAdmin(true)
    }
  }

  const refresh = () => {
    fetchWorks().then(setWorks)
  }

  // 浮层是否打开：上报给页面，用于 page-container 拦截返回手势
  const overlayOpen = stage.view !== 'home' || openWork !== null || showAdmin
  useEffect(() => {
    onOverlayChange?.(overlayOpen)
  }, [overlayOpen])

  // 作品详情内部子层（评论抽屉）的「关闭」方法，由 WorkModal 注册
  const closeCommentRef = useRef<() => boolean>(() => false)

  // 注册「关闭最上层浮层」：管理端 > 作品详情（含评论抽屉）> 作品墙/子类型页
  useEffect(() => {
    registerCloseTop?.(() => {
      if (showAdmin) {
        setShowAdmin(false)
        return
      }
      if (openWork) {
        // 先关作品详情内部的子层，子层都关完了再关详情本身
        if (closeCommentRef.current()) return
        setOpenWork(null)
        return
      }
      setStage({ view: 'home' })
    })
  }, [showAdmin, openWork, stage])

  return (
    <View id="works" className="relative bg-black px-4 py-20">
      <View className="relative z-10 mx-auto max-w-7xl">
        <View className="text-center text-10px uppercase tracking-0-2em text-primary">作品</View>
        <View className="mx-auto mt-6 max-w-4xl text-center" onClick={handleTitleTap}>
          <WordsPullUpMultiStyle segments={HEADER} className="text-22px font-normal leading-snug" />
        </View>

        {/* 两大分类入口 —— 点击跳转作品墙 / 子类型选择 */}
        <View className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-4">
          {CATEGORIES.map((c, i) => {
            const catWorks = c.id === 'photo' ? photoWorks : videoWorks
            const cover = catWorks[0]?.cover
            return (
              <motion.button
                key={c.id}
                type="button"
                onClick={() =>
                  setStage(c.id === 'photo' ? { view: 'photoWall' } : { view: 'videoSubs' })
                }
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: i * 0.12, ease: EASE }}
                className="relative flex aspect-16-10 w-full flex-col justify-end overflow-hidden rounded-2xl text-left"
              >
                <View
                  className="absolute inset-0"
                  style={{ background: cover, backgroundSize: 'cover' }}
                />
                <View className="noise-overlay pointer-events-none absolute inset-0 opacity-50 mix-blend-overlay" />
                <View
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, transparent 40%, rgba(0,0,0,0.85) 100%)',
                  }}
                />

                <View className="absolute left-4 top-4 z-10 rounded-full bg-black-40 px-2-5 py-1 text-10px tracking-0-2em text-primary-80">
                  {String(i + 1).padStart(2, '0')}
                </View>

                <View className="relative z-10 p-4">
                  <View className="text-xl font-medium text-E1E0CC">{c.label}</View>
                  <View className="mt-1 max-w-20rem text-11px leading-relaxed text-gray-400">
                    {c.hint}
                  </View>
                  <View className="mt-3 flex items-center justify-between">
                    <View className="flex items-center gap-1-5 text-11px text-primary-80">
                      <Icon name="layers" color="primary" size={14} />
                      {catWorks.length} 组作品
                    </View>
                    <View className="flex items-center gap-1-5 text-11px text-E1E0CC">
                      进入作品墙
                      <Icon name="arrowRight" color="white" size={14} />
                    </View>
                  </View>
                </View>
              </motion.button>
            )
          })}
        </View>
      </View>

      {/* 婚礼摄影作品墙（上下滑动挑选）—— Layer 负责关闭时淡出，不再是瞬间消失 */}
      <Layer open={stage.view === 'photoWall'} duration={260}>
        <WorksWall
          title="婚礼摄影"
          works={photoWorks}
          onClose={() => setStage({ view: 'home' })}
          onOpenWork={setOpenWork}
        />
      </Layer>

      {/* 婚礼摄像：左侧子类型 + 右侧作品墙 */}
      <Layer open={stage.view === 'videoSubs'} duration={260}>
        <VideoSubs onClose={() => setStage({ view: 'home' })} onOpenWork={setOpenWork} />
      </Layer>

      {/* 作品集（点开作品后纵向预览） */}
      <Layer open={openWork !== null} duration={260}>
        <WorkModal
          work={openWork}
          onClose={() => setOpenWork(null)}
          registerCloseTop={(fn) => {
            closeCommentRef.current = fn
          }}
        />
      </Layer>

      {/* 隐藏的管理端：连点标题进入，仅管理员可用 */}
      <Layer open={showAdmin} duration={260}>
        <AdminPanel
          onClose={() => setShowAdmin(false)}
          onSaved={() => {
            setShowAdmin(false)
            refresh()
          }}
        />
      </Layer>
    </View>
  )
}
