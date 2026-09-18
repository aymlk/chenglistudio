import { PropsWithChildren } from 'react'
import { useLaunch } from '@tarojs/taro'
import Taro from '@tarojs/taro'
import './app.scss'
import { CLOUD_ENV } from './config'

function App({ children }: PropsWithChildren) {
  useLaunch(() => {
    // 初始化微信云开发。CLOUD_ENV 为空（未开通/未配置）时跳过，
    // 小程序回退到静态 works.ts 数据，照常运行。
    const cloud = (Taro as any).cloud
    if (CLOUD_ENV && cloud) {
      cloud.init({ env: CLOUD_ENV, traceUser: true })
    }
  })

  return children
}

export default App
