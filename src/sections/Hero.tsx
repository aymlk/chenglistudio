import { useState } from 'react'
import { motion } from 'framer-motion'
import WordsPullUp from '../components/WordsPullUp'

const EASE = [0.16, 1, 0.3, 1] as const

const NAV_ITEMS = [
  { label: '服务套系', href: '#services' },
  { label: '作品', href: '#works' },
  { label: '预约咨询', href: '#contact' },
]

function NavLink({ label, href }: { label: string; href: string }) {
  const [hovered, setHovered] = useState(false)

  return (
    <a
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="whitespace-nowrap transition-colors duration-300"
      style={{ color: hovered ? '#E1E0CC' : 'rgba(225, 224, 204, 0.8)' }}
    >
      {label}
    </a>
  )
}

export default function Hero() {
  return (
    <section id="hero" className="relative h-screen w-full p-4 md:p-6">
      <div className="relative h-full w-full overflow-hidden rounded-2xl md:rounded-[2rem]">
        {/* 背景视频 */}
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4"
          autoPlay
          loop
          muted
          playsInline
        />

        {/* 胶片颗粒 */}
        <div className="noise-overlay absolute inset-0 z-[1] opacity-[0.7] mix-blend-overlay" />

        {/* 电影感渐变 */}
        <div className="absolute inset-0 z-[2] bg-gradient-to-b from-black/30 via-transparent to-black/60" />

        {/* 悬挂式导航 */}
        <nav className="absolute left-1/2 top-0 z-20 -translate-x-1/2 rounded-b-2xl bg-black px-4 py-2 md:rounded-b-3xl md:px-8">
          <ul className="flex items-center gap-3 text-[10px] sm:gap-6 sm:text-xs md:gap-12 md:text-sm lg:gap-14">
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                <NavLink label={item.label} href={item.href} />
              </li>
            ))}
          </ul>
        </nav>

        {/* 底部内容 */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-5 sm:p-8 md:p-10 lg:p-14">
          <div className="grid grid-cols-1 items-end gap-6 md:grid-cols-[2fr_1fr] md:gap-8">
            <div className="md:min-w-0">
              <h1
                className="whitespace-nowrap pb-[0.08em] font-bold leading-[1.05] tracking-[-0.04em] text-[18vw] md:text-[15vw] lg:text-[14vw] xl:text-[13vw] 2xl:text-[12vw]"
                style={{ color: '#E1E0CC' }}
              >
                <WordsPullUp text="橙梨影视" delay={0.15} wrap={false} />
              </h1>
            </div>

            <div>
              <motion.p
                className="text-primary/70 text-xs sm:text-sm md:text-base"
                style={{ lineHeight: 1.2 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
              >
                橙梨影视是一间以自然光为笔的婚礼影像工作室。我们相信每一束光都有它的情绪，
                每一个人都值得被诚实地、温柔地记录一次。
              </motion.p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
