import { useState, type ReactNode } from 'react'
import { View } from '@tarojs/components'
import { motion } from '../taro/motion'
import { Icon } from '../taro/Icon'
import WordsPullUpMultiStyle, { type Segment } from '../components/WordsPullUpMultiStyle'
import {
  COMBO_PACKAGES,
  PHOTO_PACKAGES,
  SERVICE_PROMISES,
  VIDEO_PACKAGES,
  type ServicePackage,
} from '../content/services'

const HEADER: Segment[] = [
  { text: '婚礼摄影与摄像，', className: 'text-E1E0CC' },
  { text: '透明定价，按需选择。', className: 'text-gray-500' },
]

const EASE = [0.22, 1, 0.36, 1] as const

type TabId = 'photo' | 'video' | 'combo'

const TABS: { id: TabId; label: string }[] = [
  { id: 'photo', label: '婚礼摄影' },
  { id: 'video', label: '婚礼摄像' },
  { id: 'combo', label: '摄影摄像' },
]

/** 入场动效：缩放 0.95 → 1，错峰 0.15s（挂载即播） */
function CardShell({
  index,
  children,
  className = '',
  onClick,
}: {
  index: number
  children: ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: index * 0.15, ease: EASE }}
      className={`h-full overflow-hidden rounded-2xl ${className}`}
    >
      {children}
    </motion.div>
  )
}

function Checklist({ items }: { items: string[] }) {
  return (
    <View className="mt-5 flex flex-col gap-2-5">
      {items.map((item) => (
        <View key={item} className="flex items-start gap-2">
          <Icon name="check" color="primary" size={14} className="mt-2px shrink-0" />
          <View className="text-11px leading-snug text-gray-400">{item}</View>
        </View>
      ))}
    </View>
  )
}

function MetaPills({ meta }: { meta: string[] }) {
  return (
    <View className="mt-4 flex flex-wrap gap-1-5">
      {meta.map((m) => (
        <View key={m} className="rounded-full bg-black-40 px-2 py-1 text-10px text-primary-80">
          {m}
        </View>
      ))}
    </View>
  )
}

function ServiceCard({
  pkg,
  index,
  onOpen,
}: {
  pkg: ServicePackage
  index: number
  onOpen?: () => void
}) {
  return (
    <CardShell index={index} className="bg-212121" onClick={onOpen}>
      <View className="flex h-full w-full flex-col p-5 text-left">
        <View className="flex items-baseline justify-between gap-3">
          <View className="text-sm font-medium text-E1E0CC">
            {pkg.name}
            <View className="ml-1-5 text-10px text-gray-500">{pkg.number}</View>
          </View>
          <View className="shrink-0 text-11px text-primary">{pkg.price}</View>
        </View>

        <MetaPills meta={pkg.highlights} />
        <Checklist items={pkg.items} />
      </View>
    </CardShell>
  )
}

function PhotoPanel({ onOpen }: { onOpen?: (p: ServicePackage) => void }) {
  return (
    <View className="grid grid-cols-1 gap-3">
      {PHOTO_PACKAGES.map((pkg, i) => (
        <ServiceCard key={pkg.id} pkg={pkg} index={i} onOpen={onOpen ? () => onOpen(pkg) : undefined} />
      ))}
    </View>
  )
}

function VideoPanel({ onOpen }: { onOpen?: (p: ServicePackage) => void }) {
  return (
    <View className="grid grid-cols-1 gap-3">
      {VIDEO_PACKAGES.map((pkg, i) => (
        <ServiceCard key={pkg.id} pkg={pkg} index={i} onOpen={onOpen ? () => onOpen(pkg) : undefined} />
      ))}
    </View>
  )
}

function ComboPanel({ onOpen }: { onOpen?: (p: ServicePackage) => void }) {
  return (
    <View className="mx-auto grid max-w-2xl grid-cols-1 gap-3">
      {COMBO_PACKAGES.map((pkg, i) => (
        <ServiceCard key={pkg.id} pkg={pkg} index={i} onOpen={onOpen ? () => onOpen(pkg) : undefined} />
      ))}
    </View>
  )
}

export default function Services({
  onOpenPackage,
}: {
  onOpenPackage?: (p: ServicePackage) => void
}) {
  const [tab, setTab] = useState<TabId>('photo')

  return (
    <View id="services" className="relative bg-black px-4 py-20">
      <View className="relative z-10 mx-auto max-w-7xl">
        <View className="text-center text-10px uppercase tracking-0-2em text-primary">
          服务与套系
        </View>

        <View className="mx-auto mt-6 max-w-4xl text-center">
          <WordsPullUpMultiStyle segments={HEADER} className="text-xl font-normal" />
        </View>

        {/* 三个 Tab */}
        <View className="mt-10 flex justify-center">
          <View className="inline-flex rounded-full bg-101010 p-1">
            {TABS.map((t) => {
              const active = tab === t.id
              return (
                <View
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`relative rounded-full px-5 py-2 text-xs ${
                    active ? 'bg-primary text-black' : 'text-primary-70'
                  }`}
                >
                  {t.label}
                </View>
              )
            })}
          </View>
        </View>

        {/* 面板：切 tab 时重挂载，入场动效重播 */}
        <View className="mt-8">
          {tab === 'photo' && <PhotoPanel key="photo" onOpen={onOpenPackage} />}
          {tab === 'video' && <VideoPanel key="video" onOpen={onOpenPackage} />}
          {tab === 'combo' && <ComboPanel key="combo" onOpen={onOpenPackage} />}
        </View>

        {/* 通用承诺 */}
        <View className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {SERVICE_PROMISES.map((p) => (
            <View key={p} className="flex items-center gap-1-5 text-11px text-gray-500">
              <Icon name="check" color="primary" size={12} />
              {p}
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}
