import { useRef, useState, type ReactNode } from 'react'
import { motion, useInView } from 'framer-motion'
import { Building2, Check, Copy, Mail, MessageCircle, Phone } from 'lucide-react'
import WordsPullUpMultiStyle, { type Segment } from '../components/WordsPullUpMultiStyle'
import { CONTACT, PHONE_RAW } from '../content/contact'

const HEADER: Segment[] = [
  { text: '说说你们的婚礼，', className: 'text-[#E1E0CC]' },
  { text: '剩下的交给我们。', className: 'text-gray-500' },
]

const EASE = [0.22, 1, 0.36, 1] as const

/** 与其他区块一致的入场动效 */
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
      className={`overflow-hidden rounded-2xl ${className}`}
    >
      {children}
    </motion.div>
  )
}

/** 可复制的一行信息 */
function CopyRow({
  icon,
  label,
  value,
  copyValue,
  href,
}: {
  icon: ReactNode
  label: string
  value: string
  copyValue?: string
  href?: string
}) {
  const [copied, setCopied] = useState(false)

  async function onCopy(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(copyValue ?? value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      // 非安全上下文（http）下剪贴板不可用，静默失败
    }
  }

  const content = (
    <>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/40 text-primary">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] uppercase tracking-[0.16em] text-gray-500">
          {label}
        </span>
        <span className="mt-0.5 block truncate text-[13px] font-medium text-[#E1E0CC] sm:text-sm">
          {value}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-1 text-[10px] text-primary/70 sm:text-[11px]">
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
            已复制
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" strokeWidth={2} />
            复制
          </>
        )}
      </span>
    </>
  )

  if (href) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-black/20 px-3 py-2.5 transition-colors hover:bg-black/30">
        <a href={href} className="flex min-w-0 flex-1 items-center gap-3">
          {content}
        </a>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      className="flex w-full items-center gap-3 rounded-xl bg-black/20 px-3 py-2.5 text-left transition-colors hover:bg-black/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
    >
      {content}
    </button>
  )
}

export default function Contact() {
  return (
    <section id="contact" className="relative bg-black px-4 py-20 md:px-6 md:py-28">
      <div className="bg-noise absolute inset-0 z-0 opacity-[0.15]" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <p className="text-center text-[10px] uppercase tracking-[0.2em] text-primary sm:text-xs">
          预约咨询
        </p>

        <div className="mx-auto mt-6 max-w-4xl text-center sm:mt-8">
          <WordsPullUpMultiStyle
            segments={HEADER}
            className="text-xl font-normal sm:text-2xl md:text-3xl lg:text-4xl"
          />
        </div>

        <div className="mt-10 flex justify-center">
          <CardShell
            index={0}
            className="w-full max-w-2xl bg-[#212121] p-5 sm:p-6 md:p-8"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black/40 text-primary">
                <Building2 className="h-5 w-5" strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <h3 className="text-base font-medium text-[#E1E0CC] sm:text-lg md:text-xl">
                  {CONTACT.studio}
                </h3>
                <p className="mt-0.5 truncate text-[11px] text-gray-500 sm:text-xs">
                  {CONTACT.tagline}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-2 sm:mt-6">
              <CopyRow
                icon={<MessageCircle className="h-4 w-4" strokeWidth={2} />}
                label="微信"
                value={CONTACT.wechat}
              />
              <CopyRow
                icon={<Phone className="h-4 w-4" strokeWidth={2} />}
                label="电话"
                value={CONTACT.phone}
                copyValue={PHONE_RAW}
                href={`tel:${PHONE_RAW}`}
              />
              <CopyRow
                icon={<Mail className="h-4 w-4" strokeWidth={2} />}
                label="邮箱"
                value={CONTACT.email}
                href={`mailto:${CONTACT.email}`}
              />
            </div>

            <p className="mt-5 border-t border-white/5 pt-4 text-[11px] leading-relaxed text-gray-400 sm:text-xs">
              {CONTACT.hours}
            </p>
            <p className="mt-2 text-[11px] leading-relaxed text-gray-500 sm:text-xs">
              添加微信时请备注「婚礼日期 + 场地」，我们会先确认档期再细聊方案。
            </p>
          </CardShell>
        </div>

        {/* 底部版权 */}
        <p className="mt-10 text-center text-[10px] text-gray-600 sm:text-xs">
          {CONTACT.studio} · {CONTACT.email}
        </p>
      </div>
    </section>
  )
}
