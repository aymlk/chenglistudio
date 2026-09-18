import { useEffect, useRef, useState } from 'react'
import { View } from '@tarojs/components'
import type { CSSProperties, ReactNode } from 'react'

/**
 * 带退场动画的浮层容器。
 *
 * 小程序没有 framer-motion，用不了 AnimatePresence。这里用
 * 「先播放退场过渡、动画结束后再卸载」的方式补上关闭动画：
 * open 由 true 变 false 时，内容保持渲染并渐隐 + 轻微位移，duration 毫秒后真正卸载。
 *
 * 关键点：**缓存上一次 open 时的 children**。因为关闭时父组件已经把
 * work/pkg 之类的数据置空了，若直接渲染 children 会变成空白 —— 渲染上一帧的
 * 元素，弹窗在退场期间仍能拿到旧数据正常显示。这样各个弹窗组件内部一行都不用改。
 *
 * 用法：
 *   <Layer open={!!work} duration={260}>
 *     <WorkModal work={work} onClose={...} />
 *   </Layer>
 */
export function Layer({
  open,
  duration = 260,
  exitY = 0,
  exitScale,
  className,
  style,
  children,
}: {
  open: boolean
  /** 退场时长（ms） */
  duration?: number
  /** 退场时向下位移的距离（px） */
  exitY?: number
  /** 退场时的缩放，不传则不缩放 */
  exitScale?: number
  className?: string
  style?: CSSProperties
  children: ReactNode
}) {
  const [render, setRender] = useState(open)
  const [leaving, setLeaving] = useState(false)
  const lastChildren = useRef<ReactNode>(children)

  // 只在打开时更新缓存，关闭期间沿用上一帧元素，避免内容瞬间变空
  if (open) lastChildren.current = children

  useEffect(() => {
    if (open) {
      setRender(true)
      setLeaving(false)
      return
    }
    if (!render) return
    setLeaving(true)
    const t = setTimeout(() => {
      setRender(false)
      setLeaving(false)
    }, duration)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, duration])

  if (!render) return null

  // 默认只做透明度淡出：位移（transform）会创建新的包含块，
  // 可能让内部 position:fixed 的弹窗定位错乱。确需位移时再传 exitY。
  const transform =
    leaving && (exitY || exitScale)
      ? `translateY(${exitY}px)${exitScale ? ` scale(${exitScale})` : ''}`
      : 'none'

  return (
    <View
      className={className}
      style={
        {
          ...(style as any),
          transition: `opacity ${duration}ms ease, transform ${duration}ms ease`,
          opacity: leaving ? 0 : 1,
          transform,
          // 退场过程中不再响应点击，避免误触
          pointerEvents: leaving ? 'none' : 'auto',
        } as any
      }
    >
      {open ? children : lastChildren.current}
    </View>
  )
}
