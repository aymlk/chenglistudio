import { useState } from 'react'
import { View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { motion } from '../taro/motion'
import { Icon } from '../taro/Icon'
import WordsPullUpMultiStyle, { type Segment } from '../components/WordsPullUpMultiStyle'
import { CONTACT, PHONE_RAW } from '../content/contact'

const HEADER: Segment[] = [
  { text: '说说你们的婚礼，', className: 'text-E1E0CC' },
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
  children: any
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: index * 0.15, ease: EASE }}
      className={`overflow-hidden rounded-2xl ${className}`}
    >
      {children}
    </motion.div>
  )
}

/** 可复制 / 可拨号的一行信息 */
function CopyRow({
  icon,
  label,
  value,
  copyValue,
  action,
}: {
  icon: any
  label: string
  value: string
  copyValue?: string
  action?: () => void
}) {
  const [copied, setCopied] = useState(false)

  async function onTap() {
    if (action) {
      action()
      return
    }
    try {
      await Taro.setClipboardData({ data: copyValue ?? value })
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // 剪贴板不可用时静默失败
    }
  }

  return (
    <View
      onClick={onTap}
      className="flex w-full items-center gap-3 rounded-xl bg-black-20 px-3 py-2-5 text-left"
    >
      <View className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black-40 text-primary">
        {icon}
      </View>
      <View className="min-w-0 flex-1">
        <View className="block text-10px uppercase tracking-0-16em text-gray-500">{label}</View>
        <View className="mt-0-5 block truncate text-13px font-medium text-E1E0CC">{value}</View>
      </View>
      <View className="flex shrink-0 items-center gap-1 text-10px text-primary-70">
        {copied ? (
          <>
            <Icon name="check" color="primary" size={14} />
            已复制
          </>
        ) : (
          <>
            <Icon name="copy" color="primary" size={14} />
            复制
          </>
        )}
      </View>
    </View>
  )
}

export default function Contact() {
  return (
    <View id="contact" className="relative bg-black px-4 py-20">
      <View className="relative z-10 mx-auto max-w-7xl">
        <View className="text-center text-10px uppercase tracking-0-2em text-primary">预约咨询</View>

        <View className="mx-auto mt-6 max-w-4xl text-center">
          <WordsPullUpMultiStyle segments={HEADER} className="text-xl font-normal" />
        </View>

        <View className="mt-10 flex justify-center">
          <CardShell index={0} className="w-full max-w-2xl bg-212121 p-5">
            <View className="flex items-center gap-3">
              <View className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black-40 text-primary">
                <Icon name="building" color="primary" size={20} />
              </View>
              <View className="min-w-0">
                <View className="text-base font-medium text-E1E0CC">{CONTACT.studio}</View>
                <View className="mt-0-5 truncate text-11px text-gray-500">{CONTACT.tagline}</View>
              </View>
            </View>

            <View className="mt-5 flex flex-col gap-2">
              <CopyRow
                icon={<Icon name="message" color="primary" size={16} />}
                label="微信"
                value={CONTACT.wechat}
              />
              <CopyRow
                icon={<Icon name="phone" color="primary" size={16} />}
                label="电话"
                value={CONTACT.phone}
                copyValue={PHONE_RAW}
                action={() => Taro.makePhoneCall({ phoneNumber: PHONE_RAW })}
              />
              <CopyRow
                icon={<Icon name="mail" color="primary" size={16} />}
                label="邮箱"
                value={CONTACT.email}
              />
            </View>

            <View className="mt-5 border-t border-white-5 pt-4 text-11px leading-relaxed text-gray-400">
              {CONTACT.hours}
            </View>
            <View className="mt-2 text-11px leading-relaxed text-gray-500">
              添加微信时请备注「婚礼日期 + 场地」，我们会先确认档期再细聊方案。
            </View>
          </CardShell>
        </View>

        <View className="mt-10 text-center text-10px text-gray-600">
          {CONTACT.studio} · {CONTACT.email}
        </View>
      </View>
    </View>
  )
}
