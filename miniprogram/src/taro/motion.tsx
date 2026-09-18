import { View } from '@tarojs/components'
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

/**
 * framer-motion 的轻量小程序替代层。
 *
 * 小程序没有 DOM，无法用 framer-motion。这里用 Taro 的 View + CSS transition
 * 实现入场动画，滚动进入视口由 ScrollView 的 onAppear 触发（页面主内容会放在
 * 一个 scroll-y 的 ScrollView 里，其直接子节点支持 onAppear）。
 *
 * 用法与原代码基本一致：
 *   <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} transition={{duration:0.7}} />
 *   <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.3}} />  // 挂载即播
 */

type MotionValue = { opacity?: number; x?: number; y?: number; scale?: number }

let _mid = 0
function nextId() {
  return `mv-${++_mid}`
}

function toStyle(mv?: MotionValue, transition?: { duration?: number; delay?: number }): CSSProperties {
  if (!mv) return {}
  const t: string[] = []
  if (mv.x) t.push(`translateX(${mv.x}px)`)
  if (mv.y) t.push(`translateY(${mv.y}px)`)
  if (mv.scale !== undefined) t.push(`scale(${mv.scale})`)
  const dur = transition?.duration ?? 0.6
  const delay = transition?.delay ?? 0
  return {
    opacity: mv.opacity ?? 1,
    transform: t.length ? t.join(' ') : 'none',
    transition: `opacity ${dur}s ease ${delay}s, transform ${dur}s ease ${delay}s`,
  } as CSSProperties
}

export interface MotionProps {
  initial?: MotionValue
  animate?: MotionValue
  whileInView?: MotionValue
  viewport?: { once?: boolean; margin?: string }
  // ease 用 readonly number[]：调用方常写成 `[0.16, 1, 0.3, 1] as const`（只读元组）
  transition?: { duration?: number; delay?: number; ease?: readonly number[] }
  className?: string
  style?: CSSProperties
  id?: string
  children?: ReactNode
  onClick?: (e?: any) => void
  onAppear?: () => void
  [key: string]: any
}

function MotionView(props: MotionProps) {
  const {
    initial,
    animate,
    whileInView,
    transition,
    className,
    style,
    children,
    id,
    onClick,
    onAppear,
    ref,
    ...rest
  } = props
  const [shown, setShown] = useState(false)
  const uid = useRef(id || nextId())

  useEffect(() => {
    // animate 模式：挂载后延迟切到目标态（模拟入场）
    if (animate) {
      const d = (transition?.delay ?? 0) * 1000
      const t = setTimeout(() => setShown(true), d)
      return () => clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const useInView = !!whileInView
  const target = useInView
    ? shown
      ? whileInView
      : initial
    : animate
      ? shown
        ? animate
        : initial
      : initial
  const css = toStyle(target, transition)

  return (
    <View
      id={uid.current}
      className={className}
      style={{ ...(style as any), ...css } as any}
      onClick={onClick}
      onAppear={() => {
        if (useInView) setShown(true)
        onAppear && onAppear()
      }}
      {...rest}
    >
      {children}
    </View>
  )
}

export const motion = {
  div: MotionView,
  span: MotionView,
  button: MotionView,
  p: MotionView,
  section: MotionView,
  a: MotionView,
}
