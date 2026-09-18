import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Layers } from 'lucide-react'
import WordsPullUpMultiStyle, { type Segment } from '../components/WordsPullUpMultiStyle'
import WorksWall from '../components/WorksWall'
import VideoSubs from '../components/VideoSubs'
import WorkModal from '../components/WorkModal'
import { CATEGORIES, WORKS, type Work } from '../content/works'

const HEADER: Segment[] = [
  { text: '作品，', className: 'text-[#E1E0CC]' },
  { text: '比文字更诚实。', className: 'text-gray-500' },
]

const EASE = [0.22, 1, 0.36, 1] as const

/** 作品区视图状态机 */
type Stage = { view: 'home' } | { view: 'photoWall' } | { view: 'videoSubs' }

export default function Works() {
  const [stage, setStage] = useState<Stage>({ view: 'home' })
  const [openWork, setOpenWork] = useState<Work | null>(null)

  const photoWorks = WORKS.filter((w) => w.category === 'photo')
  const videoWorks = WORKS.filter((w) => w.category === 'video')

  return (
    <section id="works" className="relative bg-black px-4 py-20 md:px-6 md:py-28">
      <div className="bg-noise absolute inset-0 z-0 opacity-[0.12]" aria-hidden />

      <div className="relative z-10 mx-auto max-w-7xl">
        <p className="text-center text-[10px] uppercase tracking-[0.2em] text-primary sm:text-xs">
          作品
        </p>
        <div className="mx-auto mt-6 max-w-4xl text-center sm:mt-8">
          <WordsPullUpMultiStyle
            segments={HEADER}
            className="text-[22px] font-normal leading-snug sm:text-2xl md:text-3xl lg:text-4xl"
          />
        </div>

        {/* 两大分类入口 —— 点击跳转作品墙 / 子类型选择 */}
        <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-5">
          {CATEGORIES.map((c, i) => {
            const works = c.id === 'photo' ? photoWorks : videoWorks
            const cover = works[0]?.cover
            return (
              <motion.button
                key={c.id}
                type="button"
                onClick={() =>
                  setStage(c.id === 'photo' ? { view: 'photoWall' } : { view: 'videoSubs' })
                }
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.7, delay: i * 0.12, ease: EASE }}
                className="group relative flex aspect-[16/10] w-full flex-col justify-end overflow-hidden rounded-2xl text-left focus:outline-none focus:ring-2 focus:ring-primary/60 sm:aspect-[4/3]"
                aria-label={`进入${c.label}作品墙`}
              >
                {/* 背景：取该分类首张作品封面 */}
                <div
                  className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
                  style={{ background: cover, backgroundSize: 'cover' }}
                />
                <div
                  className="noise-overlay pointer-events-none absolute inset-0 opacity-50 mix-blend-overlay"
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, transparent 40%, rgba(0,0,0,0.85) 100%)',
                  }}
                  aria-hidden
                />

                {/* 编号水印 */}
                <span className="absolute left-4 top-4 z-10 rounded-full bg-black/40 px-2.5 py-1 text-[10px] tracking-[0.2em] text-primary/80 backdrop-blur sm:left-5 sm:top-5">
                  {String(i + 1).padStart(2, '0')}
                </span>

                <div className="relative z-10 p-4 sm:p-6">
                  <h3 className="text-xl font-medium text-[#E1E0CC] sm:text-2xl">
                    {c.label}
                  </h3>
                  <p className="mt-1 max-w-[20rem] text-[11px] leading-relaxed text-gray-400 sm:text-xs">
                    {c.hint}
                  </p>
                  <div className="mt-3 flex items-center justify-between sm:mt-4">
                    <span className="flex items-center gap-1.5 text-[11px] text-primary/80 sm:text-xs">
                      <Layers className="h-3.5 w-3.5" strokeWidth={2} />
                      {works.length} 组作品
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] text-[#E1E0CC] transition-transform duration-300 group-hover:gap-2.5 sm:text-xs">
                      进入作品墙
                      <ArrowRight
                        className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                        strokeWidth={2.5}
                      />
                    </span>
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* 婚礼摄影作品墙（上下滑动挑选） */}
      <AnimatePresence>
        {stage.view === 'photoWall' && (
          <WorksWall
            title="婚礼摄影"
            works={photoWorks}
            onClose={() => setStage({ view: 'home' })}
            onOpenWork={setOpenWork}
          />
        )}
      </AnimatePresence>

      {/* 婚礼摄像：左侧子类型 + 右侧作品墙 */}
      <AnimatePresence>
        {stage.view === 'videoSubs' && (
          <VideoSubs
            onClose={() => setStage({ view: 'home' })}
            onOpenWork={setOpenWork}
          />
        )}
      </AnimatePresence>

      {/* 作品集（点开作品后纵向预览） */}
      <WorkModal work={openWork} onClose={() => setOpenWork(null)} />
    </section>
  )
}
