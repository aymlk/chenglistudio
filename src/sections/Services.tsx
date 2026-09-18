import { useRef, useState, type ReactNode } from 'react'
import { motion, useInView } from 'framer-motion'
import { Check } from 'lucide-react'
import WordsPullUpMultiStyle, { type Segment } from '../components/WordsPullUpMultiStyle'
import {
  COMBO_PACKAGES,
  PHOTO_PACKAGES,
  SERVICE_PROMISES,
  VIDEO_PACKAGES,
  type ServicePackage,
} from '../content/services'

const HEADER: Segment[] = [
  { text: '婚礼摄影与摄像，', className: 'text-[#E1E0CC]' },
  { text: '透明定价，按需选择。', className: 'text-gray-500' },
]

const EASE = [0.22, 1, 0.36, 1] as const

type TabId = 'photo' | 'video' | 'combo'

const TABS: { id: TabId; label: string }[] = [
  { id: 'photo', label: '婚礼摄影' },
  { id: 'video', label: '婚礼摄像' },
  { id: 'combo', label: '摄影摄像' },
]

/** 与 Features 卡一致的入场动效：缩放 0.95 → 1，错峰 0.15s */
function CardShell({
  index,
  children,
  className = '',
}: {
  index: number
  children: ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={isInView ? { opacity: 1, scale: 1 } : undefined}
      transition={{ duration: 0.8, delay: index * 0.15, ease: EASE }}
      className={`h-full overflow-hidden rounded-2xl ${className}`}
    >
      {children}
    </motion.div>
  )
}

function Checklist({ items }: { items: string[] }) {
  return (
    <ul className="mt-5 space-y-2.5 sm:mt-6 sm:space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2">
          <Check className="mt-[2px] h-3.5 w-3.5 shrink-0 text-primary sm:h-4 sm:w-4" strokeWidth={2.5} />
          <span className="text-[11px] leading-snug text-gray-400 sm:text-xs md:text-[13px]">{item}</span>
        </li>
      ))}
    </ul>
  )
}

function MetaPills({ meta }: { meta: string[] }) {
  return (
    <div className="mt-4 flex flex-wrap gap-1.5">
      {meta.map((m) => (
        <span
          key={m}
          className="rounded-full bg-black/40 px-2 py-1 text-[10px] text-primary/80 sm:text-[11px]"
        >
          {m}
        </span>
      ))}
    </div>
  )
}

function ServiceCard({ pkg, index }: { pkg: ServicePackage; index: number }) {
  return (
    <CardShell index={index} className="bg-[#212121]">
      <div className="flex h-full w-full flex-col p-5 text-left sm:p-6">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-sm font-medium text-[#E1E0CC] sm:text-base md:text-lg">
            {pkg.name}
            <span className="ml-1.5 align-super text-[10px] text-gray-500">{pkg.number}</span>
          </h3>
          <span className="shrink-0 text-[11px] text-primary sm:text-xs">{pkg.price}</span>
        </div>

        <MetaPills meta={pkg.highlights} />
        <Checklist items={pkg.items} />
      </div>
    </CardShell>
  )
}

function PhotoPanel() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:gap-2 md:grid-cols-2 md:gap-1">
      {PHOTO_PACKAGES.map((pkg, i) => (
        <ServiceCard key={pkg.id} pkg={pkg} index={i} />
      ))}
    </div>
  )
}

function VideoPanel() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:gap-2 md:grid-cols-3 md:gap-1">
      {VIDEO_PACKAGES.map((pkg, i) => (
        <ServiceCard key={pkg.id} pkg={pkg} index={i} />
      ))}
    </div>
  )
}

function ComboPanel() {
  return (
    <div className="mx-auto grid max-w-2xl grid-cols-1 gap-3 sm:gap-2 md:gap-1">
      {COMBO_PACKAGES.map((pkg, i) => (
        <ServiceCard key={pkg.id} pkg={pkg} index={i} />
      ))}
    </div>
  )
}

export default function Services() {
  const [tab, setTab] = useState<TabId>('photo')

  return (
    <section id="services" className="relative bg-black px-4 py-20 md:px-6 md:py-28">
      <div className="bg-noise absolute inset-0 z-0 opacity-[0.15]" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <p className="text-center text-[10px] uppercase tracking-[0.2em] text-primary sm:text-xs">
          服务与套系
        </p>

        <div className="mx-auto mt-6 max-w-4xl text-center sm:mt-8">
          <WordsPullUpMultiStyle
            segments={HEADER}
            className="text-xl font-normal sm:text-2xl md:text-3xl lg:text-4xl"
          />
        </div>

        {/* 三个 Tab */}
        <div className="mt-10 flex justify-center">
          <div className="inline-flex rounded-full bg-[#101010] p-1">
            {TABS.map((t) => {
              const active = tab === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className="relative rounded-full px-5 py-2 text-xs transition-colors duration-300 sm:text-sm"
                  style={{ color: active ? '#000000' : 'rgba(225, 224, 204, 0.7)' }}
                >
                  {active && (
                    <motion.span
                      layoutId="services-tab-pill"
                      className="absolute inset-0 rounded-full bg-primary"
                      transition={{ duration: 0.4, ease: EASE }}
                    />
                  )}
                  <span className="relative z-10">{t.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* 面板：切 tab 时重挂载，入场动效重播 */}
        <div className="mt-8 md:mt-10">
          {tab === 'photo' && <PhotoPanel key="photo" />}
          {tab === 'video' && <VideoPanel key="video" />}
          {tab === 'combo' && <ComboPanel key="combo" />}
        </div>

        {/* 通用承诺 */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 md:mt-14">
          {SERVICE_PROMISES.map((p) => (
            <span key={p} className="flex items-center gap-1.5 text-[11px] text-gray-500 sm:text-xs">
              <Check className="h-3 w-3 text-primary" strokeWidth={2.5} />
              {p}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
