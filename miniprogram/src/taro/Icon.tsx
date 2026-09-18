import { Image } from '@tarojs/components'
import type { CSSProperties } from 'react'

/**
 * lucide-react 的小程序替代。小程序不能直接渲染 SVG React 组件，这里把每个图标
 * 画成内联 SVG 并以 base64 data-URI 交给 Image 组件渲染，颜色用 COLOR 占位符在
 * 运行时替换为 primary / white / gray。
 */

const ICON_PATHS: Record<string, string> = {
  check:
    '<polyline points="20 6 9 17 4 12" fill="none" stroke="COLOR" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  arrowRight:
    '<line x1="5" y1="12" x2="19" y2="12" stroke="COLOR" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="12 5 19 12 12 19" fill="none" stroke="COLOR" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  arrowLeft:
    '<line x1="19" y1="12" x2="5" y2="12" stroke="COLOR" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="12 19 5 12 12 5" fill="none" stroke="COLOR" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  chevronDown:
    '<polyline points="6 9 12 15 18 9" fill="none" stroke="COLOR" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  chevronUp:
    '<polyline points="18 15 12 9 6 15" fill="none" stroke="COLOR" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  x:
    '<line x1="18" y1="6" x2="6" y2="18" stroke="COLOR" stroke-width="2" stroke-linecap="round"/><line x1="6" y1="6" x2="18" y2="18" stroke="COLOR" stroke-width="2" stroke-linecap="round"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" fill="COLOR" stroke="none"/>',
  play: '<polygon points="6 4 20 12 6 20 6 4" fill="COLOR" stroke="none"/>',
  layers:
    '<path d="m12 2 9 5-9 5-9-5 9-5Z" fill="none" stroke="COLOR" stroke-width="2" stroke-linejoin="round"/><path d="m3 12 9 5 9-5" fill="none" stroke="COLOR" stroke-width="2" stroke-linejoin="round"/><path d="m3 17 9 5 9-5" fill="none" stroke="COLOR" stroke-width="2" stroke-linejoin="round"/>',
  phone:
    '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.5-1.1a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2z" fill="none" stroke="COLOR" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  mail:
    '<rect x="2" y="4" width="20" height="16" rx="2" fill="none" stroke="COLOR" stroke-width="2"/><path d="m22 7-10 6L2 7" fill="none" stroke="COLOR" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  message:
    '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" fill="none" stroke="COLOR" stroke-width="2" stroke-linejoin="round"/>',
  building:
    '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" fill="none" stroke="COLOR" stroke-width="2" stroke-linejoin="round"/><path d="M6 12H4a2 2 0 0 0-2 2v8h2" fill="none" stroke="COLOR" stroke-width="2" stroke-linejoin="round"/><path d="M18 9h2a2 2 0 0 1 2 2v11h-2" fill="none" stroke="COLOR" stroke-width="2" stroke-linejoin="round"/>',
  copy:
    '<rect x="9" y="9" width="13" height="13" rx="2" fill="none" stroke="COLOR" stroke-width="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" fill="none" stroke="COLOR" stroke-width="2" stroke-linejoin="round"/>',
  plus:
    '<line x1="12" y1="5" x2="12" y2="19" stroke="COLOR" stroke-width="2" stroke-linecap="round"/><line x1="5" y1="12" x2="19" y2="12" stroke="COLOR" stroke-width="2" stroke-linecap="round"/>',
  image:
    '<rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="COLOR" stroke-width="2" stroke-linejoin="round"/><circle cx="9" cy="9" r="2" fill="none" stroke="COLOR" stroke-width="2"/><path d="m21 15-5-5L5 21" fill="none" stroke="COLOR" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  trash:
    '<polyline points="3 6 5 6 21 6" fill="none" stroke="COLOR" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" fill="none" stroke="COLOR" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="10" y1="11" x2="10" y2="17" stroke="COLOR" stroke-width="2" stroke-linecap="round"/><line x1="14" y1="11" x2="14" y2="17" stroke="COLOR" stroke-width="2" stroke-linecap="round"/>',
}

export type IconName = keyof typeof ICON_PATHS
export type IconColor = 'primary' | 'white' | 'gray' | 'black'

function toHex(color: IconColor) {
  if (color === 'white') return '#FFFFFF'
  if (color === 'gray') return '#9CA3AF'
  if (color === 'black') return '#000000'
  return '#DEDBC8'
}

/**
 * 小程序环境不一定提供 btoa / unescape，这里手写一个 ASCII 安全的 base64 编码器。
 * 本文件的 SVG 内容均为 ASCII（路径 + 十六进制颜色），按字节编码即可。
 */
function base64Encode(input: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  const bytes: number[] = []
  for (let i = 0; i < input.length; i++) bytes.push(input.charCodeAt(i) & 0xff)
  let output = ''
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i]
    const b1 = i + 1 < bytes.length ? bytes[i + 1] : 0
    const b2 = i + 2 < bytes.length ? bytes[i + 2] : 0
    const e0 = b0 >> 2
    const e1 = ((b0 & 3) << 4) | (b1 >> 4)
    const e2 = ((b1 & 15) << 2) | (b2 >> 6)
    const e3 = b2 & 63
    output +=
      chars[e0] +
      chars[e1] +
      (i + 1 < bytes.length ? chars[e2] : '=') +
      (i + 2 < bytes.length ? chars[e3] : '=')
  }
  return output
}

export function Icon({
  name,
  color = 'primary',
  size = 16,
  className,
  style,
}: {
  name: IconName
  color?: IconColor
  size?: number
  className?: string
  style?: CSSProperties
}) {
  const hex = toHex(color)
  const inner = (ICON_PATHS[name] ?? '').replace(/COLOR/g, hex)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">${inner}</svg>`
  const src = 'data:image/svg+xml;base64,' + base64Encode(svg)
  return (
    <Image
      src={src}
      mode="aspectFit"
      className={className}
      style={{ width: size, height: size, ...(style as any) }}
    />
  )
}
