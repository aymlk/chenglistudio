import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ChevronUp, Heart, MessageCircle, Play, X } from 'lucide-react'
import type { Work } from '../content/works'

const EASE = [0.16, 1, 0.3, 1] as const

const CATEGORY_LABEL: Record<Work['category'], string> = {
  photo: '婚礼摄影',
  video: '婚礼摄像',
}

type Props = {
  work: Work | null
  onClose: () => void
}

/**
 * 作品集详情 —— 纵向滑动预览（上下滑动浏览整套作品集）。
 *
 * 整屏竖向 snap-scroll：移动端全屏单图，桌面端居中列 + 右侧信息栏。
 * 照片项可点赞 + 留言；视频项禁用点赞/留言，仅播放控件。
 */
export default function WorkModal({ work, onClose }: Props) {
  const [likes, setLikes] = useState<Record<string, boolean>>({})
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({})
  const [commentsByItem, setCommentsByItem] = useState<Record<string, Work['items'][number]['comments']>>({})
  const [commentingItemId, setCommentingItemId] = useState<string | null>(null)
  const [author, setAuthor] = useState('')
  const [draft, setDraft] = useState('')
  const [index, setIndex] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Array<HTMLDivElement | null>>([])

  // 打开时锁滚动 + 初始化互动 state
  useEffect(() => {
    if (!work) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (commentingItemId) setCommentingItemId(null)
        else onClose()
        return
      }
      if (commentingItemId) return
      if (e.key === 'ArrowDown') goTo(index + 1)
      if (e.key === 'ArrowUp') goTo(index - 1)
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

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
    setIndex(0)
    setCommentingItemId(null)
    setDraft('')

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [work?.id])

  // 跳到指定索引（竖向 snap-scroll，scrollIntoView 实现）
  function goTo(i: number) {
    if (!work) return
    const total = work.items.length
    const clamped = Math.max(0, Math.min(total - 1, i))
    setIndex(clamped)
    const node = itemRefs.current[clamped]
    if (node) node.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // 监听竖向滚动，按各 item 中点同步当前索引
  function onTrackScroll() {
    const track = trackRef.current
    if (!track || !work) return
    const center = track.scrollTop + track.clientHeight / 2
    let best = 0
    let bestDist = Infinity
    itemRefs.current.forEach((node, i) => {
      if (!node) return
      const nodeCenter = node.offsetTop + node.offsetHeight / 2
      const d = Math.abs(nodeCenter - center)
      if (d < bestDist) {
        bestDist = d
        best = i
      }
    })
    if (best !== index) setIndex(Math.max(0, Math.min(work.items.length - 1, best)))
  }

  function toggleLike(itemId: string) {
    setLikes((prev) => {
      const next = { ...prev, [itemId]: !prev[itemId] }
      setLikeCounts((c) => ({ ...c, [itemId]: c[itemId] + (next[itemId] ? 1 : -1) }))
      return next
    })
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

  const total = work?.items.length ?? 0
  const currentItem = work && work.items[index]
  const photoCount = useMemo(
    () => (work ? work.items.filter((i) => i.type === 'photo').length : 0),
    [work]
  )

  return (
    <AnimatePresence>
      {work && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* 顶部条带 */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex h-14 items-center justify-between bg-gradient-to-b from-black/80 to-transparent px-3 sm:px-5">
            <div className="pointer-events-auto flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={onClose}
                aria-label="关闭"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
              <div className="min-w-0">
                <span className="hidden text-[10px] uppercase tracking-[0.2em] text-primary/70 sm:inline">
                  {work.number} · {CATEGORY_LABEL[work.category]}
                </span>
                <h2 className="truncate text-sm font-medium text-[#E1E0CC] sm:text-base sm:leading-tight">
                  {work.title}
                </h2>
                <p className="truncate text-[10px] text-gray-500 sm:hidden">
                  {work.date} · {work.location}
                </p>
              </div>
            </div>
            <div className="pointer-events-auto ml-2 flex shrink-0 items-center gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] tracking-wider text-white/85 backdrop-blur">
                {index + 1} / {total}
              </span>
            </div>
          </div>

          {/* 上下翻页按钮（桌面端，悬浮在滑动区两侧中部） */}
          {index > 0 && (
            <button
              type="button"
              aria-label="上一张"
              onClick={() => goTo(index - 1)}
              className="absolute left-2 top-1/2 z-20 hidden h-10 w-10 -translate-y-[120%] items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20 md:flex"
            >
              <ChevronUp className="h-5 w-5" strokeWidth={2} />
            </button>
          )}
          {index < total - 1 && (
            <button
              type="button"
              aria-label="下一张"
              onClick={() => goTo(index + 1)}
              className="absolute left-2 top-1/2 z-20 hidden h-10 w-10 translate-y-[20%] items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20 md:flex"
            >
              <ChevronDown className="h-5 w-5" strokeWidth={2} />
            </button>
          )}

          {/* 主体 —— 桌面端：左侧竖向滑动列 + 右侧信息栏 */}
          <div className="relative z-10 flex h-full w-full flex-1 flex-col md:flex-row">
            {/* 中央竖向滑动列 */}
            <div className="relative flex w-full flex-1 items-start justify-center overflow-hidden pt-14 md:pt-0">
              <div
                ref={trackRef}
                onScroll={onTrackScroll}
                className="scrollbar-hide h-full w-full snap-y snap-mandatory overflow-y-auto"
                style={{ scrollSnapStop: 'always' }}
              >
                {work.items.map((item, i) => {
                  const isLiked = !!likes[item.id]
                  const likeCount = likeCounts[item.id] ?? item.likes
                  const commentCount = (commentsByItem[item.id] ?? []).length
                  return (
                    <div
                      key={item.id}
                      ref={(el) => {
                        itemRefs.current[i] = el
                      }}
                      className="relative flex w-full snap-start items-center justify-center px-4 pb-6 pt-4 sm:px-6 md:min-h-screen md:px-0"
                    >
                      {/* 图/视频本体 */}
                      <div className="relative flex aspect-[3/4] w-full max-w-[420px] items-center justify-center overflow-hidden rounded-2xl bg-[#0d0d0d] sm:max-w-[460px] md:max-h-[82vh] md:max-w-[460px]">
                        <div
                          className="absolute inset-0"
                          style={{ background: item.placeholder, backgroundSize: 'cover' }}
                        />
                        <div
                          className="noise-overlay pointer-events-none absolute inset-0 opacity-50 mix-blend-overlay"
                          aria-hidden
                        />
                        <div
                          className="pointer-events-none absolute inset-0"
                          style={{
                            background:
                              'linear-gradient(180deg, rgba(0,0,0,0.22) 0%, transparent 25%, transparent 70%, rgba(0,0,0,0.65) 100%)',
                          }}
                          aria-hidden
                        />

                        {/* 视频标记 */}
                        {item.type === 'video' && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 backdrop-blur-md">
                              <Play className="h-7 w-7 fill-white text-white" strokeWidth={1.5} />
                            </div>
                            <span className="mt-4 text-[10px] uppercase tracking-[0.25em] text-white/70">
                              视频
                            </span>
                          </div>
                        )}

                        {/* 编号水印 */}
                        <span className="absolute right-3 top-3 rounded-full bg-black/45 px-2 py-0.5 text-[10px] tracking-[0.2em] text-primary/85 backdrop-blur">
                          {String(i + 1).padStart(2, '0')}
                        </span>

                        {/* 互动按钮 —— 照片可见，视频禁用 */}
                        {item.type === 'photo' ? (
                          <div className="absolute right-3 top-1/2 z-10 flex -translate-y-1/2 flex-col items-center gap-4 sm:right-4 sm:gap-5">
                            <button
                              type="button"
                              aria-label={isLiked ? '取消点赞' : '点赞'}
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleLike(item.id)
                              }}
                              className="flex flex-col items-center gap-1 text-white"
                            >
                              <span
                                className={`flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-md transition-colors ${
                                  isLiked ? 'bg-primary/90 text-black' : 'bg-white/15 text-white hover:bg-white/25'
                                }`}
                              >
                                <Heart className={`h-5 w-5 ${isLiked ? 'fill-black' : ''}`} strokeWidth={2} />
                              </span>
                              <span className="text-[10px] tabular-nums text-white/85">{likeCount}</span>
                            </button>
                            <button
                              type="button"
                              aria-label="留言"
                              onClick={(e) => {
                                e.stopPropagation()
                                setCommentingItemId(item.id)
                                setDraft('')
                              }}
                              className="flex flex-col items-center gap-1 text-white"
                            >
                              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 backdrop-blur-md transition-colors hover:bg-white/25">
                                <MessageCircle className="h-5 w-5" strokeWidth={2} />
                              </span>
                              <span className="text-[10px] tabular-nums text-white/85">{commentCount}</span>
                            </button>
                          </div>
                        ) : null}

                        {/* caption */}
                        {item.caption && (
                          <p className="absolute inset-x-0 bottom-3 px-4 text-center text-[12px] font-medium text-white/90 sm:text-sm">
                            {item.caption}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 桌面端右侧信息栏（md+ 可见） */}
            <div className="hidden w-[320px] shrink-0 flex-col overflow-y-auto border-l border-white/5 bg-[#101010] p-6 md:flex">
              <span className="text-[10px] uppercase tracking-[0.2em] text-primary/70">
                {work.number} · {CATEGORY_LABEL[work.category]}
              </span>
              <h2 className="mt-2 text-xl font-medium leading-snug text-[#E1E0CC]">
                {work.title}
              </h2>
              <p className="mt-2 text-[11px] tracking-wider text-gray-500">
                {work.date} · {work.location}
              </p>
              <p className="mt-4 text-[13px] leading-relaxed text-gray-400">
                {work.description}
              </p>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {work.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] text-primary/80"
                  >
                    {t}
                  </span>
                ))}
              </div>

              {currentItem && currentItem.type === 'photo' && (
                <div className="mt-5 flex items-center gap-4 border-t border-white/5 pt-4 text-[12px] text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <Heart
                      className={`h-4 w-4 ${likes[currentItem.id] ? 'fill-primary text-primary' : ''}`}
                      strokeWidth={2}
                    />
                    {likeCounts[currentItem.id] ?? currentItem.likes}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="h-4 w-4" strokeWidth={2} />
                    {(commentsByItem[currentItem.id] ?? []).length}
                  </span>
                  <span className="text-[11px] text-gray-500">
                    {photoCount > 0 ? `${photoCount} 张照片可互动` : ''}
                  </span>
                </div>
              )}

              {currentItem && currentItem.type === 'video' && (
                <div className="mt-5 border-t border-white/5 pt-4 text-[11px] text-gray-500">
                  视频内容仅供观看，不支持点赞与留言
                </div>
              )}

              <ul className="mt-auto space-y-2 border-t border-white/5 pt-4 text-[12px] text-gray-400">
                {work.details.map((d) => (
                  <li key={d} className="flex gap-2.5">
                    <span className="mt-1.5 inline-block h-1 w-1 shrink-0 rounded-full bg-primary/70" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 移动端底部互动条（md 以下可见） */}
            {currentItem && currentItem.type === 'photo' && (
              <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-around border-t border-white/5 bg-black/85 px-4 py-3 backdrop-blur md:hidden">
                <button
                  type="button"
                  onClick={() => toggleLike(currentItem.id)}
                  className="flex items-center gap-2 text-white"
                >
                  <Heart
                    className={`h-5 w-5 ${likes[currentItem.id] ? 'fill-primary text-primary' : ''}`}
                    strokeWidth={2}
                  />
                  <span className="text-[12px] tabular-nums">
                    {likeCounts[currentItem.id] ?? currentItem.likes}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCommentingItemId(currentItem.id)
                    setDraft('')
                  }}
                  className="flex items-center gap-2 text-white"
                >
                  <MessageCircle className="h-5 w-5" strokeWidth={2} />
                  <span className="text-[12px] tabular-nums">
                    {(commentsByItem[currentItem.id] ?? []).length}
                  </span>
                </button>
              </div>
            )}
            {currentItem && currentItem.type === 'video' && (
              <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-center border-t border-white/5 bg-black/85 px-4 py-3 backdrop-blur md:hidden">
                <span className="text-[11px] text-gray-500">视频内容仅供观看</span>
              </div>
            )}
          </div>

          {/* 评论抽屉 —— 底部上滑面板 */}
          <AnimatePresence>
            {commentingItemId && (
              <motion.div
                key="comment-panel"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ duration: 0.3, ease: EASE }}
                className="absolute inset-x-0 bottom-0 z-40 flex max-h-[70vh] flex-col rounded-t-2xl bg-[#101010] shadow-2xl sm:left-auto sm:right-4 sm:bottom-4 sm:max-h-[60vh] sm:w-[420px] sm:rounded-2xl"
              >
                <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
                  <h3 className="text-sm font-medium text-[#E1E0CC]">
                    留言 ·{' '}
                    <span className="text-[11px] text-gray-500">
                      {(commentsByItem[commentingItemId] ?? []).length} 条
                    </span>
                  </h3>
                  <button
                    type="button"
                    aria-label="关闭留言"
                    onClick={() => setCommentingItemId(null)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                  >
                    <X className="h-4 w-4" strokeWidth={2} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-5 py-4">
                  {(commentsByItem[commentingItemId] ?? []).length === 0 ? (
                    <p className="py-12 text-center text-[12px] text-gray-500">
                      还没有留言，做第一个吧
                    </p>
                  ) : (
                    <ul className="space-y-4">
                      {(commentsByItem[commentingItemId] ?? []).map((c) => (
                        <li key={c.id} className="flex gap-3">
                          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10px] text-[#E1E0CC]">
                            {c.author.slice(0, 1)}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-[12px] text-[#E1E0CC]">
                              <span className="font-medium">{c.author}</span>
                              <span className="ml-2 text-[10px] text-gray-500">{c.time}</span>
                            </p>
                            <p className="mt-0.5 text-[13px] leading-relaxed text-gray-300">
                              {c.text}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="border-t border-white/5 px-4 py-3">
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="昵称（可选）"
                      maxLength={20}
                      className="w-full rounded-md bg-white/5 px-3 py-2 text-[12px] text-[#E1E0CC] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary/50"
                    />
                    <div className="flex items-end gap-2">
                      <textarea
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="留下你的感想…"
                        rows={2}
                        maxLength={200}
                        className="flex-1 resize-none rounded-md bg-white/5 px-3 py-2 text-[13px] text-[#E1E0CC] placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary/50"
                      />
                      <button
                        type="button"
                        onClick={submitComment}
                        disabled={!draft.trim()}
                        className="shrink-0 rounded-md bg-primary px-4 py-2 text-[12px] font-medium text-black transition-opacity disabled:opacity-40"
                      >
                        发送
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
