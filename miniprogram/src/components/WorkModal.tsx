import { useEffect, useState } from 'react'
import { View, ScrollView, Input, Textarea } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { motion } from '../taro/motion'
import { Layer } from '../taro/Layer'
import { Icon } from '../taro/Icon'
import type { Work } from '../content/works'

const EASE = [0.16, 1, 0.3, 1] as const

const CATEGORY_LABEL: Record<Work['category'], string> = {
  photo: '婚礼摄影',
  video: '婚礼摄像',
}

type Props = {
  work: Work | null
  onClose: () => void
  /** 向上注册「关闭最上层子层」；返回 true 表示已处理（例如关掉了评论抽屉） */
  registerCloseTop?: (fn: () => boolean) => void
}

/**
 * 作品集详情 —— 纵向滑动预览（上下滑动浏览整套作品集）。
 * 小程序没有 document / Esc / scrollIntoView，改为：每张照片卡自带点赞 + 留言按钮，
 * 顶部信息区展示标题 / 描述 / 标签 / 详情；留言用底部上滑面板。
 */
export default function WorkModal({ work, onClose, registerCloseTop }: Props) {
  const [likes, setLikes] = useState<Record<string, boolean>>({})
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({})
  const [commentsByItem, setCommentsByItem] = useState<Record<string, Work['items'][number]['comments']>>({})
  const [commentingItemId, setCommentingItemId] = useState<string | null>(null)
  const [author, setAuthor] = useState('')
  const [draft, setDraft] = useState('')

  // 打开时初始化互动 state
  useEffect(() => {
    if (!work) return
    const initialLikes: Record<string, boolean> = {}
    const initialCounts: Record<string, number> = {}
    const initialComments: Record<string, Work['items'][number]['comments']> = {}
    for (const item of work.items) {
      initialLikes[item.id] = false
      initialCounts[item.id] = item.likes
      initialComments[item.id] = [...item.comments]
    }
    setLikes(initialLikes)
    setLikeCounts(initialCounts)
    setCommentsByItem(initialComments)
    setCommentingItemId(null)
    setAuthor('')
    setDraft('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [work?.id])

  // 返回手势：评论抽屉开着时先关抽屉，返回 true 表示已处理、不再关闭整个详情
  useEffect(() => {
    registerCloseTop?.(() => {
      if (commentingItemId) {
        setCommentingItemId(null)
        return true
      }
      return false
    })
  }, [commentingItemId])

  function toggleLike(itemId: string) {
    const nextLiked = !likes[itemId]
    setLikes((prev) => ({ ...prev, [itemId]: nextLiked }))
    setLikeCounts((c) => ({ ...c, [itemId]: (c[itemId] ?? 0) + (nextLiked ? 1 : -1) }))
  }

  function playVideo() {
    // 目前无真实视频文件，占位提示；接入真实片源后替换为 <Video> 播放
    Taro.showToast({ title: '视频样片即将上线', icon: 'none' })
  }

  function submitComment() {
    if (!commentingItemId) return
    const text = draft.trim()
    if (!text) return
    setCommentsByItem((prev) => ({
      ...prev,
      [commentingItemId]: [
        ...(prev[commentingItemId] ?? []),
        { id: `c-${Date.now()}`, author: author.trim() || '匿名', text, time: '刚刚' },
      ],
    }))
    setDraft('')
  }

  if (!work) return null

  const photoCount = work.items.filter((i) => i.type === 'photo').length

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      {/* 顶部条带 */}
      <View className="pointer-events-none absolute inset-x-0 top-0 z-30 flex h-14 items-center justify-between bg-gradient-to-b from-black-80 to-transparent px-3">
        <View className="pointer-events-auto flex min-w-0 flex-1 items-center gap-2">
          <View
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white-10 text-white backdrop-blur"
          >
            <Icon name="x" color="white" size={20} />
          </View>
          <View className="min-w-0">
            <View className="truncate text-sm font-medium text-E1E0CC">{work.title}</View>
            <View className="truncate text-10px text-gray-500">{work.date} · {work.location}</View>
          </View>
        </View>
        <View className="pointer-events-auto ml-2 flex shrink-0 items-center gap-2">
          <View className="rounded-full bg-white-10 px-3 py-1 text-11px tracking-wider text-white-85 backdrop-blur">
            {work.items.length} 图
          </View>
        </View>
      </View>

      {/* 主体滑动区 */}
      <ScrollView scrollY className="relative z-10 min-h-0 flex-1 pt-14">
        {/* 信息区 */}
        <View className="px-4 pb-6 pt-4">
          <View className="text-10px uppercase tracking-0-2em text-primary-70">
            {work.number} · {CATEGORY_LABEL[work.category]}
          </View>
          <View className="mt-2 text-xl font-medium leading-snug text-E1E0CC">{work.title}</View>
          <View className="mt-2 text-11px tracking-wider text-gray-500">{work.date} · {work.location}</View>
          <View className="mt-4 text-13px leading-relaxed text-gray-400">{work.description}</View>

          <View className="mt-4 flex flex-wrap gap-1-5">
            {work.tags.map((t) => (
              <View key={t} className="rounded-full bg-white-5 px-2-5 py-0-5 text-10px text-primary-80">
                {t}
              </View>
            ))}
          </View>

          <View className="mt-4 flex flex-col gap-2 border-t border-white-5 pt-4 text-12px text-gray-400">
            {work.details.map((d) => (
              <View key={d} className="flex gap-2-5">
                <View className="mt-1-5 inline-block h-1 w-1 shrink-0 rounded-full bg-primary-70" />
                <View>{d}</View>
              </View>
            ))}
          </View>
        </View>

        {/* 作品集纵向预览 */}
        <View className="flex flex-col gap-4 px-4 pb-10">
          {work.items.map((item, i) => {
            const isLiked = !!likes[item.id]
            const likeCount = likeCounts[item.id] ?? item.likes
            const commentCount = (commentsByItem[item.id] ?? []).length
            return (
              <View key={item.id} className="relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-0d0d0d">
                <View className="relative flex aspect-3-4 w-full max-w-420px items-center justify-center overflow-hidden rounded-2xl bg-0d0d0d">
                  <View className="absolute inset-0" style={{ background: item.placeholder, backgroundSize: 'cover' }} />
                  <View className="noise-overlay pointer-events-none absolute inset-0 opacity-50 mix-blend-overlay" />
                  <View
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(180deg, rgba(0,0,0,0.22) 0%, transparent 25%, transparent 70%, rgba(0,0,0,0.65) 100%)',
                    }}
                  />

                  {/* 视频标记 —— 可点击 */}
                  {item.type === 'video' && (
                    <View
                      onClick={playVideo}
                      className="absolute inset-0 z-10 flex flex-col items-center justify-center"
                    >
                      <View className="flex h-16 w-16 items-center justify-center rounded-full bg-white-15 backdrop-blur-md">
                        <Icon name="play" color="white" size={28} />
                      </View>
                      <View className="mt-4 text-10px uppercase tracking-0-25em text-white-70">点击播放</View>
                    </View>
                  )}

                  {/* 编号水印 */}
                  <View className="absolute right-3 top-3 rounded-full bg-black-45 px-2 py-0-5 text-10px tracking-0-2em text-primary-85 backdrop-blur">
                    {String(i + 1).padStart(2, '0')}
                  </View>

                  {/* 互动按钮 —— 照片/视频均可用 */}
                  <View className="absolute right-3 top-1-2 z-20 flex neg-translate-y-1-2 flex-col items-center gap-4">
                    <View onClick={() => toggleLike(item.id)} className="flex flex-col items-center gap-1 text-white">
                      <View
                        className={`flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-md ${
                          isLiked ? 'bg-primary-90 text-black' : 'bg-white-15 text-white'
                        }`}
                      >
                        <Icon name="heart" color={isLiked ? 'black' : 'white'} size={20} />
                      </View>
                      <View className="text-10px tabular-nums text-white-85">{likeCount}</View>
                    </View>
                    <View
                      onClick={() => {
                        setCommentingItemId(item.id)
                        setDraft('')
                      }}
                      className="flex flex-col items-center gap-1 text-white"
                    >
                      <View className="flex h-11 w-11 items-center justify-center rounded-full bg-white-15 backdrop-blur-md">
                        <Icon name="message" color="white" size={20} />
                      </View>
                      <View className="text-10px tabular-nums text-white-85">{commentCount}</View>
                    </View>
                  </View>

                  {/* caption */}
                  {item.caption && (
                    <View className="absolute inset-x-0 bottom-3 px-4 text-center text-12px font-medium text-white-90">
                      {item.caption}
                    </View>
                  )}
                </View>
              </View>
            )}
          )}
        </View>
      </ScrollView>

      {/* 评论抽屉 —— 底部上滑面板（Layer 负责关闭时淡出） */}
      <Layer open={commentingItemId !== null} duration={240}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="fixed inset-x-0 bottom-0 z-60 flex max-h-70vh flex-col rounded-t-2xl bg-101010"
        >
          <View className="flex items-center justify-between border-b border-white-5 px-5 py-4">
            <View className="text-sm font-medium text-E1E0CC">
              留言 ·{' '}
              <View className="text-11px text-gray-500">
                {(commentsByItem[commentingItemId] ?? []).length} 条
              </View>
            </View>
            <View
              onClick={() => setCommentingItemId(null)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white-10 text-white"
            >
              <Icon name="x" color="white" size={16} />
            </View>
          </View>
          <ScrollView scrollY className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            {(commentsByItem[commentingItemId] ?? []).length === 0 ? (
              <View className="py-12 text-center text-12px text-gray-500">还没有留言，做第一个吧</View>
            ) : (
              <View className="flex flex-col gap-4">
                {(commentsByItem[commentingItemId] ?? []).map((c) => (
                  <View key={c.id} className="flex gap-3">
                    <View className="mt-0-5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white-10 text-10px text-E1E0CC">
                      {c.author.slice(0, 1)}
                    </View>
                    <View className="min-w-0 flex-1">
                      <View className="text-12px text-E1E0CC">
                        <View className="font-medium">{c.author}</View>
                        <View className="ml-2 text-10px text-gray-500">{c.time}</View>
                      </View>
                      <View className="mt-0-5 text-13px leading-relaxed text-gray-300">{c.text}</View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
          <View className="border-t border-white-5 px-4 py-3">
            <View className="flex flex-col gap-2">
              <Input
                value={author}
                onInput={(e: any) => setAuthor(e.detail.value)}
                placeholder="昵称（可选）"
                maxlength={20}
                className="w-full rounded-md bg-white-5 px-3 py-2 text-12px text-E1E0CC"
                // 小程序 input 自带高度 + 全局 box-sizing:border-box，
                // 仅靠 padding 会被挤压截字，需显式给高度
                style={{ height: '36px', boxSizing: 'border-box' }}
              />
              <View className="flex items-end gap-2">
                <Textarea
                  value={draft}
                  onInput={(e: any) => setDraft(e.detail.value)}
                  placeholder="留下你的感想…"
                  maxlength={200}
                  autoHeight
                  className="flex-1 rounded-md bg-white-5 px-3 py-2 text-13px text-E1E0CC"
                />
                <View
                  onClick={submitComment}
                  className={`shrink-0 rounded-md bg-primary px-4 py-2 text-12px font-medium text-black ${
                    !draft.trim() ? 'opacity-40' : ''
                  }`}
                >
                  发送
                </View>
              </View>
            </View>
          </View>
        </motion.div>
      </Layer>
    </motion.div>
  )
}
