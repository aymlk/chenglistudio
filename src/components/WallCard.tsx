import { motion } from 'framer-motion'
import { Layers, Play } from 'lucide-react'
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
      className="group relative block aspect-[4/5] w-full shrink-0 overflow-hidden rounded-2xl text-left focus:outline-none focus:ring-2 focus:ring-primary/60"
      aria-label={`查看作品：${work.title}`}
    >
      <div
        className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
        style={{ background: work.cover, backgroundSize: 'cover' }}
      />
      <div
        className="noise-overlay pointer-events-none absolute inset-0 opacity-50 mix-blend-overlay transition-opacity duration-500 group-hover:opacity-70"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 35%, transparent 55%, rgba(0,0,0,0.88) 100%)',
        }}
        aria-hidden
      />

      {/* 编号 */}
      <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5">
        <span className="rounded-full bg-black/45 px-2 py-0.5 text-[9px] tracking-[0.15em] text-primary/90 backdrop-blur sm:text-[10px]">
          {work.number}
        </span>
      </div>

      {/* 视频标记 */}
      {videoCount > 0 && (
        <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[9px] tracking-wider text-primary/85 backdrop-blur sm:text-[10px]">
          <Play className="h-2.5 w-2.5" strokeWidth={2.5} />
          {videoCount}
        </div>
      )}

      {/* 张数 */}
      <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[9px] tracking-wider text-primary/85 backdrop-blur sm:text-[10px]">
        <Layers className="h-3 w-3" strokeWidth={2} />
        <span>{work.items.length}</span>
      </div>

      {/* 标题 + 元数据 */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-3 sm:p-4">
        <h3 className="text-[15px] font-medium leading-tight text-[#E1E0CC] sm:text-base">
          {work.title}
        </h3>
        <div className="mt-1 flex items-center gap-1.5 text-[10px] text-gray-400 sm:text-[11px]">
          <span className="truncate">{work.date}</span>
          <span className="h-0.5 w-0.5 shrink-0 rounded-full bg-gray-500" />
          <span className="truncate">{work.location}</span>
        </div>
        <p className="mt-1.5 line-clamp-1 text-[10px] text-gray-500 sm:hidden">
          {photoCount > 0 ? `${photoCount} 张照片` : ''}
          {videoCount > 0 ? `${photoCount > 0 ? ' · ' : ''}${videoCount} 段视频` : ''}
        </p>
      </div>
    </motion.button>
  )
}
