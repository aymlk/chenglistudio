import { useRef, useState } from 'react'
import { View, PageContainer } from '@tarojs/components'
import Taro, { useLoad } from '@tarojs/taro'
import Hero from '../../sections/Hero'
import Services from '../../sections/Services'
import Works from '../../sections/Works'
import Contact from '../../sections/Contact'
import ServiceDetailModal from '../../components/ServiceDetailModal'
import { Layer } from '../../taro/Layer'
import type { ServicePackage } from '../../content/services'
import { CONFIRM_BEFORE_EXIT } from '../../config'

export default function Index() {
  const [openPackage, setOpenPackage] = useState<ServicePackage | null>(null)
  const [worksOverlay, setWorksOverlay] = useState(false)
  // Works 内部浮层的「关闭最上层」方法（作品墙 / 子类型页 / 作品详情 / 管理端）
  const closeWorksTopRef = useRef<() => void>(() => {})

  // 有浮层打开时，交给 page-container 接管返回操作，避免直接退出小程序
  const anyOverlay = worksOverlay || openPackage !== null

  useLoad(() => {
    // 右滑返回已无法禁用（微信 7.0.5 起 disableSwipeBack 废弃），
    // 改为开启「离开前确认」：用户误触右滑时弹窗可取消，避免直接退出小程序。
    if (CONFIRM_BEFORE_EXIT && Taro.enableAlertBeforeUnload) {
      Taro.enableAlertBeforeUnload({ message: CONFIRM_BEFORE_EXIT })
    }
  })

  // 返回操作（右滑手势 / 安卓物理返回键 / navigateBack）：
  // 只关闭最上层的浮层，不退出小程序
  const handleLeave = () => {
    console.log('[page-container] 返回手势已接管，关闭当前浮层')
    if (openPackage) {
      setOpenPackage(null)
      return
    }
    closeWorksTopRef.current()
  }

  const handleNav = (target: string) => {
    Taro.pageScrollTo({ selector: `#${target}` })
  }

  return (
    <View className="relative min-h-screen bg-black">
      <Hero onNav={handleNav} />
      <Services onOpenPackage={setOpenPackage} />
      <Works
        onOverlayChange={setWorksOverlay}
        registerCloseTop={(fn) => {
          closeWorksTopRef.current = fn
        }}
      />
      <Contact />
      {/* 套餐详情 —— Layer 负责关闭时淡出 */}
      <Layer open={openPackage !== null} duration={260}>
        <ServiceDetailModal
          pkg={openPackage}
          onClose={() => setOpenPackage(null)}
          onNav={handleNav}
        />
      </Layer>

      {/* 手势接管层：内容为空（0 尺寸），仅用于把「返回操作」从退出小程序
          改为关闭当前浮层 —— 覆盖右滑手势、安卓物理返回键和 navigateBack。
          page-container 同一页面只允许存在一个，因此统一放在页面根部。 */}
      <PageContainer
        show={anyOverlay}
        position="center"
        overlay={false}
        // 注意：不要设 duration={0}，否则容器的「进入」动画时长为 0，
        // 可能导致其未被注册进页面返回栈、进而接管不到手势。
        customStyle="width:0;height:0;overflow:hidden"
        onBeforeEnter={() => console.log('[page-container] 容器进入，开始接管返回手势')}
        onLeave={handleLeave}
      >
        <View />
      </PageContainer>
    </View>
  )
}
