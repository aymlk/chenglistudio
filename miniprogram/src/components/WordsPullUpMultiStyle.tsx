import { View } from '@tarojs/components'
import { motion } from '../taro/motion'
import { tokenize } from '../utils/tokenize'

export type Segment = {
  text: string
  /** 该段文字的额外类名，例如 italic font-serif */
  className?: string
}

type WordsPullUpMultiStyleProps = {
  segments: Segment[]
  className?: string
  delay?: number
  stagger?: number
}

/**
 * 多段混排的逐词上滑：把若干段（可各自带样式）拆成词，
 * 逐词保留各自的 className 并错峰上滑入场。
 * 小程序没有 DOM/IntersectionObserver，改为挂载即播（animate）。
 */
export default function WordsPullUpMultiStyle({
  segments,
  className = '',
  delay = 0,
  stagger = 0.08,
}: WordsPullUpMultiStyleProps) {
  const words = segments.flatMap((seg) =>
    tokenize(seg.text).map((t) => ({ ...t, className: seg.className })),
  )

  return (
    <View className={`inline-flex flex-wrap justify-center ${className}`}>
      {words.map(({ word, className: wordClass, spaceAfter }, i) => (
        <View key={`${word}-${i}`} className="inline-flex overflow-hidden">
          <motion.span
            className={`inline-flex ${wordClass ?? ''}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: delay + i * stagger, ease: [0.16, 1, 0.3, 1] }}
          >
            {word}
            {spaceAfter && <View className="inline-block">{'\u00A0'}</View>}
          </motion.span>
        </View>
      ))}
    </View>
  )
}
