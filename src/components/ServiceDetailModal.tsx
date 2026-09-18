import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Check, ChevronRight, X } from 'lucide-react'
import type { ServicePackage } from '../content/services'

const EASE = [0.16, 1, 0.3, 1] as const

type Props = {
  pkg: ServicePackage | null
  onClose: () => void
}

/**
 * 服务详情弹窗 —— 移动端全屏纵向，桌面端居中卡片
 *
 * 段落：包含项 / 不包含项 / 适合场景 / 拍摄流程 / 交付周期
 * 底部 CTA：预约拍摄 → #contact
 */
export default function ServiceDetailModal({ pkg, onClose }: Props) {
  // 打开时锁滚动 + Esc 关闭
  useEffect(() => {
    if (!pkg) return
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
  }, [pkg, onClose])

  return (
    <AnimatePresence>
      {pkg && (
        <motion.div
          className="fixed inset-0 z-50 flex items-stretch justify-center bg-black sm:items-center sm:p-4 md:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          {/* 背景遮罩 */}
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md sm:bg-black/85" />

          {/* 弹窗本体 */}
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="relative z-10 flex h-full w-full flex-col overflow-hidden bg-[#101010] sm:h-auto sm:max-h-[85vh] sm:max-w-2xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 顶部条带 */}
            <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-white/5 bg-[#101010] px-5 py-4 sm:px-6 sm:py-5">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase tracking-[0.2em] text-primary/70 sm:text-[11px]">
                  {pkg.number}
                </span>
                <h2 className="mt-1 truncate text-lg font-medium leading-tight text-[#E1E0CC] sm:text-xl">
                  {pkg.name}
                </h2>
                <p className="mt-1 text-base font-medium text-primary sm:text-lg">{pkg.price}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="关闭"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10 text-[#E1E0CC] backdrop-blur transition-colors hover:bg-white/20 sm:h-10 sm:w-10"
              >
                <X className="h-5 w-5 sm:h-4 sm:w-4" strokeWidth={2} />
              </button>
            </div>

            {/* 滚动区 */}
            <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-6 sm:py-7">
              {/* 包含项 */}
              <Section title="包含项" subtitle="套餐内提供">
                <ul className="space-y-2.5">
                  {pkg.details.includes.map((s) => (
                    <CheckItem key={s} text={s} />
                  ))}
                </ul>
              </Section>

              {/* 不包含项 */}
              <Section title="不包含项" subtitle="需要另议或自备">
                <ul className="space-y-2.5">
                  {pkg.details.excludes.map((s) => (
                    <DashItem key={s} text={s} />
                  ))}
                </ul>
              </Section>

              {/* 适合场景 */}
              <Section title="适合场景" subtitle="什么情况下选这个套餐">
                <div className="flex flex-wrap gap-1.5">
                  {pkg.details.suitable.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-white/5 px-3 py-1.5 text-[11px] text-[#E1E0CC] sm:text-xs"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </Section>

              {/* 拍摄流程 */}
              <Section title="拍摄流程" subtitle="从咨询到成片每一步">
                <ol className="space-y-3">
                  {pkg.details.workflow.map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-medium text-primary sm:h-6 sm:w-6 sm:text-[11px]">
                        {i + 1}
                      </span>
                      <span className="flex-1 text-[12px] leading-relaxed text-gray-300 sm:text-[13px]">
                        {step.replace(/^\d+\.\s*/, '')}
                      </span>
                    </li>
                  ))}
                </ol>
              </Section>

              {/* 交付周期 */}
              <Section title="交付周期" subtitle="成片什么时候给到">
                <div className="rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 text-[12px] leading-relaxed text-[#E1E0CC] sm:text-[13px]">
                  {pkg.details.delivery}
                </div>
              </Section>
            </div>

            {/* 底部 CTA —— 跳转 footer 联系区 */}
            <div className="border-t border-white/5 bg-[#101010] px-5 py-4 sm:px-6">
              <a
                href="#contact"
                onClick={onClose}
                className="group flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-[13px] font-medium text-black transition-opacity hover:opacity-90 sm:text-sm"
              >
                预约拍摄
                <ArrowRight
                  className="h-4 w-4 -rotate-45 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  strokeWidth={2.5}
                />
              </a>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 block w-full py-1 text-center text-[11px] text-gray-500 transition-colors hover:text-gray-400 sm:text-xs"
              >
                继续浏览
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
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
  children: React.ReactNode
}) {
  return (
    <section className="mt-7 first:mt-0">
      <header className="mb-3">
        <h3 className="text-[12px] font-medium uppercase tracking-[0.18em] text-primary/80 sm:text-[13px]">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-0.5 text-[11px] text-gray-500 sm:text-xs">{subtitle}</p>
        )}
      </header>
      {children}
    </section>
  )
}

/** check 项 —— 包含项用 */
function CheckItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2.5">
      <Check
        className="mt-[2px] h-3.5 w-3.5 shrink-0 text-primary sm:h-4 sm:w-4"
        strokeWidth={2.5}
      />
      <span className="flex-1 text-[12px] leading-relaxed text-[#E1E0CC] sm:text-[13px]">
        {text}
      </span>
    </li>
  )
}

/** dash 项 —— 不包含项用 */
function DashItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="mt-[7px] inline-block h-px w-3 shrink-0 bg-gray-500 sm:mt-[9px]" />
      <span className="flex-1 text-[12px] leading-relaxed text-gray-400 sm:text-[13px]">
        {text}
      </span>
    </li>
  )
}

// 避免 import 警告：保留 ChevronRight 以备扩展
void ChevronRight
