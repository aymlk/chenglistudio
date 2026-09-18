import { View } from '@tarojs/components'
import { motion } from '../taro/motion'
import WordsPullUp from '../components/WordsPullUp'

const NAV_ITEMS = [
  { label: '服务套系', target: 'services' },
  { label: '作品', target: 'works' },
  { label: '预约咨询', target: 'contact' },
]

function NavLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <View
      onClick={onClick}
      className="whitespace-nowrap text-10px text-primary-80 sm:text-xs md:text-sm lg:text-base"
    >
      {label}
    </View>
  )
}

export default function Hero({ onNav }: { onNav: (t: string) => void }) {
  return (
    <View id="hero" className="relative h-screen w-full">
      <View
        className="relative h-full w-full overflow-hidden"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 30% 20%, rgba(222,219,200,0.18), transparent 60%), linear-gradient(15deg, #0a0a0a 0%, #161616 45%, #0d0d0d 100%)',
        }}
      >
        {/* 胶片颗粒 */}
        <View className="noise-overlay absolute inset-0 z-1 opacity-0-7 mix-blend-overlay" />

        {/* 电影感渐变 */}
        <View
          className="absolute inset-0 z-2"
          style={{
            background:
              'linear-gradient(to bottom, rgba(0,0,0,0.3), transparent, rgba(0,0,0,0.6))',
          }}
        />

        {/* 悬挂式导航 */}
        <View className="absolute left-1-2 top-0 z-20 neg-translate-x-1-2 rounded-b-2xl bg-black px-4 py-2">
          <View className="flex items-center gap-3 text-10px sm:gap-6 sm:text-xs md:gap-12 md:text-sm lg:gap-14">
            {NAV_ITEMS.map((item) => (
              <View key={item.label} onClick={() => onNav(item.target)}>
                <NavLink label={item.label} onClick={() => onNav(item.target)} />
              </View>
            ))}
          </View>
        </View>

        {/* 底部内容：移动端竖排（标题独占一行，简介全宽在下方） */}
        <View className="absolute bottom-0 left-0 right-0 z-10 p-5 pb-7">
          <View className="flex flex-col gap-4">
            <View>
              <View className="pb-0-08em font-bold leading-1-05 text-15vw text-E1E0CC">
                <WordsPullUp text="橙梨影视" delay={0.15} wrap={false} />
              </View>
            </View>

            <motion.div
              className="text-primary-70 text-13px"
              style={{ lineHeight: 1.8 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              橙梨影视是一间以自然光为笔的婚礼影像工作室。我们相信每一束光都有它的情绪，
              每一个人都值得被诚实地、温柔地记录一次。
            </motion.div>
          </View>
        </View>
      </View>
    </View>
  )
}
