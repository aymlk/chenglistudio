import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ChevronDown } from 'lucide-react'
import type { Work } from '../content/works'
import WallCard from './WallCard'

const EASE = [0.16, 1, 0.3, 1] as const

type Props = {
  /** 作品墙标题（如「婚礼摄影」「30 秒预告」） */
  title: string
  works: Work[]
  onClose: () => void
  onOpenWork: (w: Work) => void
}

/**
 * 作品墙 —— 点击分类后「跳转出」的全屏视图。
 *
 * 竖向滑动挑选作品：移动端单列长屏，桌面端多列网格，
 * 整屏可上下滚动；点某张作品卡进入其作品集（纵向预览）。
 */
export default function WorksWall({ title, works, onClose, onOpenWork }: Props) {
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
          <p className="text-[10px] uppercase tracking-[0.2em] text-primary/70">
            作品墙 · {title}
          </p>
          <h2 className="truncate text-sm font-medium text-[#E1E0CC] sm:text-base">
            {works.length} 组作品 · 上下滑动挑选
          </h2>
        </div>
        <span className="hidden items-center gap-1 text-[11px] text-gray-500 sm:flex">
          下滑浏览
          <ChevronDown className="h-4 w-4 animate-bounce" strokeWidth={2} />
        </span>
      </header>

      {/* 竖向滑动区 */}
      <div className="scrollbar-hide relative z-10 flex-1 overflow-y-auto px-4 py-5 sm:px-6 md:py-8">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
          {works.map((w, i) => (
            <WallCard key={w.id} work={w} index={i} onOpen={() => onOpenWork(w)} />
          ))}
        </div>
        <p className="mt-8 text-center text-[10px] tracking-wider text-gray-600">
          — 点击任意作品，纵向预览其作品集 —
        </p>
      </div>
    </motion.div>
  )
}
