import { View, ScrollView } from '@tarojs/components'
import { motion } from '../taro/motion'
import { Icon } from '../taro/Icon'
import type { ServicePackage } from '../content/services'

const EASE = [0.16, 1, 0.3, 1] as const

type Props = {
  pkg: ServicePackage | null
  onClose: () => void
  onNav?: (t: string) => void
}

/**
 * 服务详情弹窗 —— 移动端全屏纵向。段落：包含项 / 不包含项 / 适合场景 / 拍摄流程 / 交付周期。
 * 底部 CTA：预约拍摄 → #contact。小程序没有 document / Esc，关闭由按钮触发。
 */
export default function ServiceDetailModal({ pkg, onClose, onNav }: Props) {
  if (!pkg) return null

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-stretch justify-center bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    >
      {/* 背景遮罩 */}
      <View className="absolute inset-0 bg-black-90 backdrop-blur-md" />

      {/* 弹窗本体 */}
      <motion.div
        role="dialog"
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: EASE }}
        className="relative z-10 flex h-full w-full flex-col overflow-hidden bg-101010"
        onClick={(e: any) => e.stopPropagation()}
      >
        {/* 顶部条带 */}
        <View className="z-10 flex items-start justify-between gap-3 border-b border-white-5 bg-101010 px-5 py-4">
          <View className="min-w-0 flex-1">
            <View className="text-10px uppercase tracking-0-2em text-primary-70">{pkg.number}</View>
            <View className="mt-1 truncate text-lg font-medium leading-tight text-E1E0CC">{pkg.name}</View>
            <View className="mt-1 text-base font-medium text-primary">{pkg.price}</View>
          </View>
          <View
            onClick={onClose}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white-10 text-E1E0CC backdrop-blur"
          >
            <Icon name="x" color="white" size={20} />
          </View>
        </View>

        {/* 滚动区 */}
        <ScrollView scrollY className="flex-1 overflow-y-auto px-5 py-6">
          <Section title="包含项" subtitle="套餐内提供">
            <View className="flex flex-col gap-2-5">
              {pkg.details.includes.map((s) => (
                <CheckItem key={s} text={s} />
              ))}
            </View>
          </Section>

          <Section title="不包含项" subtitle="需要另议或自备">
            <View className="flex flex-col gap-2-5">
              {pkg.details.excludes.map((s) => (
                <DashItem key={s} text={s} />
              ))}
            </View>
          </Section>

          <Section title="适合场景" subtitle="什么情况下选这个套餐">
            <View className="flex flex-wrap gap-1-5">
              {pkg.details.suitable.map((s) => (
                <View key={s} className="rounded-full bg-white-5 px-3 py-1-5 text-11px text-E1E0CC">
                  {s}
                </View>
              ))}
            </View>
          </Section>

          <Section title="拍摄流程" subtitle="从咨询到成片每一步">
            <View className="flex flex-col gap-3">
              {pkg.details.workflow.map((step, i) => (
                <View key={i} className="flex gap-3">
                  <View className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-15 text-10px font-medium text-primary">
                    {i + 1}
                  </View>
                  <View className="flex-1 text-12px leading-relaxed text-gray-300">
                    {step.replace(/^\d+\.\s*/, '')}
                  </View>
                </View>
              ))}
            </View>
          </Section>

          <Section title="交付周期" subtitle="成片什么时候给到">
            <View className="rounded-xl border border-white-5 bg-white-0-03 px-4 py-3 text-12px leading-relaxed text-E1E0CC">
              {pkg.details.delivery}
            </View>
          </Section>
        </ScrollView>

        {/* 底部 CTA —— 跳转联系区 */}
        <View className="border-t border-white-5 bg-101010 px-5 py-4">
          <View
            onClick={() => {
              onClose()
              onNav && onNav('contact')
            }}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-13px font-medium text-black"
          >
            预约拍摄
            <View className="neg-rotate-45">
              <Icon name="arrowRight" color="black" size={16} />
            </View>
          </View>
          <View onClick={onClose} className="mt-2 block w-full py-1 text-center text-11px text-gray-500">
            继续浏览
          </View>
        </View>
      </motion.div>
    </motion.div>
  )
}

/** 段落容器 */
function Section({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: any
}) {
  return (
    <View className="mt-7 first:mt-0">
      <View className="mb-3">
        <View className="text-12px font-medium uppercase tracking-0-18em text-primary-80">{title}</View>
        {subtitle && <View className="mt-0-5 text-11px text-gray-500">{subtitle}</View>}
      </View>
      {children}
    </View>
  )
}

/** check 项 —— 包含项用 */
function CheckItem({ text }: { text: string }) {
  return (
    <View className="flex items-start gap-2-5">
      <Icon name="check" color="primary" size={14} className="mt-2px shrink-0" />
      <View className="flex-1 text-12px leading-relaxed text-E1E0CC">{text}</View>
    </View>
  )
}

/** dash 项 —— 不包含项用 */
function DashItem({ text }: { text: string }) {
  return (
    <View className="flex items-start gap-2-5">
      <View className="mt-7px inline-block h-px w-3 shrink-0 bg-gray-500" />
      <View className="flex-1 text-12px leading-relaxed text-gray-400">{text}</View>
    </View>
  )
}
