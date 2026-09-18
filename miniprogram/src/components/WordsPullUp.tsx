import { View } from '@tarojs/components'
import { motion } from '../taro/motion'
import { tokenize } from '../utils/tokenize'

type WordsPullUpProps = {
  text: string
  className?: string
  /** 起始延迟（秒） */
  delay?: number
  /** 词与词之间的错峰间隔（秒） */
  stagger?: number
  /** 在最后一个词的末尾字符右上角加一个上标星号 */
  showAsterisk?: boolean
  /**
   * 词与词之间是否换行。
   */
  wrap?: boolean
}

/**
 * 逐词上滑入场：每个词从 y:20 滑到 y:0，错峰播放。
 * 小程序没有 DOM/IntersectionObserver，改为挂载即播（animate）。
 */
export default function WordsPullUp({
  text,
  className = '',
  delay = 0,
  stagger = 0.08,
  showAsterisk = false,
  wrap = true,
}: WordsPullUpProps) {
  const tokens = tokenize(text)

  return (
    <View
      className={`inline-flex ${wrap ? 'flex-wrap' : 'flex-nowrap whitespace-nowrap'} ${className}`}
    >
      {tokens.map(({ word, spaceAfter }, i) => {
        const isLast = i === tokens.length - 1
        return (
          <View key={`${word}-${i}`} className="inline-flex overflow-hidden">
            <motion.span
              className="inline-flex"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: delay + i * stagger, ease: [0.16, 1, 0.3, 1] }}
            >
              {isLast && showAsterisk ? renderWithAsterisk(word) : word}
              {spaceAfter && <View className="inline-block">{'\u00A0'}</View>}
            </motion.span>
          </View>
        )
      })}
    </View>
  )
}

/** 把最后一个字符包起来，右上角挂一个上标 *。 */
function renderWithAsterisk(word: string) {
  const chars = Array.from(word)
  const last = chars[chars.length - 1]
  const head = chars.slice(0, -1).join('')

  return (
    <View className="relative inline-block whitespace-pre">
      {head}
      <View className="relative inline-block pr-0-24em">
        {last}
        <View className="absolute right-0 top-0-04em text-0-26em leading-none">*</View>
      </View>
    </View>
  )
}
