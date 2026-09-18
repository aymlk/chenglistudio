import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Play } from 'lucide-react'
import WallCard from './WallCard'
import { VIDEO_SUBS, WORKS, type VideoSub, type Work } from '../content/works'

const EASE = [0.16, 1, 0.3, 1] as const

type Props = {
  onClose: () => void
  onOpenWork: (w: Work) => void
}

/**
 * 婚礼摄像的二级入口 —— 左侧子类型 + 右侧对应作品墙的两栏布局。
 *
 * 所有视口宽度均为两栏：左侧固定分类导航，右侧上下滑动挑选作品。
 * 点某张作品卡进入其作品集（纵向预览）。
 */
export default function VideoSubs({ onClose, onOpenWork }: Props) {
  const [activeSub, setActiveSub] = useState<VideoSub>(VIDEO_SUBS[0].id)

  const activeWorks = WORKS.filter((w) => w.category === 'video' && w.videoSub === activeSub)

  // 打开时锁滚动，Esc 返回
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  return (
    <motion.div
      className="fixed inset-0 z-40 flex flex-col bg-black"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{ duration: 0.35, ease: EASE }}
    >
      <div className="bg-noise pointer-events-none absolute inset-0 z-0 opacity-[0.12]" aria-hidden />

      {/* 顶部条 */}
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-white/5 bg-black/90 px-4 py-4 backdrop-blur-md sm:px-6">
        <button
          type="button"
          onClick={onClose}
          aria-label="返回作品"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-primary/70">婚礼摄像</p>
          <h2 className="truncate text-sm font-medium text-[#E1E0CC] sm:text-base">
            {VIDEO_SUBS.length} 个类型 · 点左侧切换
          </h2>
        </div>
      </header>

      {/* 两栏主体：左侧分类导航 + 右侧作品墙（所有宽度生效） */}
      <div className="relative z-10 flex flex-1 overflow-hidden">
        {/* 左侧：子类型导航（固定侧栏） */}
        <nav className="scrollbar-hide flex w-60 shrink-0 flex-col gap-1 overflow-y-auto border-r border-white/5 bg-[#0c0c0c] px-3 py-4 sm:w-64 sm:px-4 sm:py-5 lg:w-72">
          {VIDEO_SUBS.map((s, i) => {
            const count = WORKS.filter((w) => w.category === 'video' && w.videoSub === s.id).length
            const active = s.id === activeSub
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveSub(s.id)}
                className={[
                  'group flex shrink-0 items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors sm:gap-4 sm:px-4 sm:py-4',
                  active
                    ? 'bg-white/10 ring-1 ring-primary/40'
                    : 'bg-transparent hover:bg-white/5',
                ].join(' ')}
              >
                <span
                  className={[
                    'mt-0.5 text-[10px] tracking-[0.15em] sm:text-xs',
                    active ? 'text-primary' : 'text-gray-600',
                  ].join(' ')}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3
                      className={[
                        'text-sm font-medium sm:text-base',
                        active ? 'text-[#E1E0CC]' : 'text-gray-300 group-hover:text-[#E1E0CC]',
                      ].join(' ')}
                    >
                      {s.label}
                    </h3>
                    <Play
                      className={[
                        'h-3 w-3',
                        active ? 'text-primary/80' : 'text-gray-600',
                      ].join(' ')}
                      strokeWidth={2.5}
                    />
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-[10px] text-gray-500 sm:text-[11px]">
                    {s.hint}
                  </p>
                  <span className="mt-1.5 inline-block text-[10px] text-primary/70 sm:text-[11px]">
                    {count} 组作品
                  </span>
                </div>
              </button>
            )
          })}
        </nav>

        {/* 右侧：当前子类型的作品墙 */}
        <main className="scrollbar-hide flex-1 overflow-y-auto px-4 py-5 sm:px-6 md:py-8">
          <div className="mx-auto mb-4 flex max-w-6xl items-center justify-between md:mb-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-primary/70">
                {VIDEO_SUBS.find((s) => s.id === activeSub)?.label}
              </p>
              <h3 className="text-sm font-medium text-[#E1E0CC] sm:text-base">
                {activeWorks.length} 组作品 · 上下滑动挑选
              </h3>
            </div>
          </div>

          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
            {activeWorks.map((w, i) => (
              <WallCard key={w.id} work={w} index={i} onOpen={() => onOpenWork(w)} />
            ))}
          </div>

          {activeWorks.length === 0 && (
            <p className="mt-20 text-center text-sm text-gray-500">
              该分类下暂无作品，敬请期待。
            </p>
          )}

          {activeWorks.length > 0 && (
            <p className="mt-8 text-center text-[10px] tracking-wider text-gray-600">
              — 点击任意作品，纵向预览其作品集 —
            </p>
          )}
        </main>
      </div>
    </motion.div>
  )
}
