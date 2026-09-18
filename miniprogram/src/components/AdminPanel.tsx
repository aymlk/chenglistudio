import { useState } from 'react'
import type { CSSProperties } from 'react'
import { View, Input, Textarea, Picker, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Icon } from '../taro/Icon'
import { VIDEO_SUBS, WORKS, type Work, type WorkItem } from '../content/works'
import {
  uploadFile,
  callAddWork,
  callSeedWorks,
  callCheckAdmin,
  callDeleteWork,
  fetchWorks,
} from '../utils/cloudWorks'
import { CLOUD_ENV } from '../config'

type Category = 'photo' | 'video'

type DiagResult = {
  isAdmin: boolean
  openid: string
  env?: string
  adminsTotal?: number
  storedLength?: number
  myLength?: number
}

const overlay: CSSProperties = {
  position: 'fixed',
  left: 0,
  top: 0,
  right: 0,
  bottom: 0,
  zIndex: 60,
  background: '#000',
}

const inputStyle: CSSProperties = {
  background: 'rgba(255,255,255,0.08)',
  color: '#fff',
  padding: '10px 12px',
  borderRadius: '8px',
  fontSize: '14px',
  // 小程序 input 组件自带高度，而全局样式是 box-sizing:border-box，
  // 只给 padding 会把内容区挤没（文字被裁切），必须显式给出高度。
  height: '42px',
  lineHeight: '22px',
  boxSizing: 'border-box',
}

export default function AdminPanel({
  onClose,
  onSaved,
}: {
  onClose: () => void
  onSaved: () => void
}) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<Category>('photo')
  const [videoSub, setVideoSub] = useState(VIDEO_SUBS[0].id)
  const [location, setLocation] = useState('')
  const [date, setDate] = useState('')
  const [tags, setTags] = useState('')
  const [description, setDescription] = useState('')
  const [details, setDetails] = useState('')
  const [coverHue, setCoverHue] = useState(20)
  const [items, setItems] = useState<WorkItem[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [diag, setDiag] = useState<DiagResult | null>(null)
  const [diagErr, setDiagErr] = useState('')
  // 已有作品管理（查看 / 删除）
  const [showManage, setShowManage] = useState(false)
  const [manageLoading, setManageLoading] = useState(false)
  const [manageList, setManageList] = useState<Work[] | null>(null)

  // 环境自检：确认云函数已部署 + 拿到自己的 openid（填进 admins 集合用）
  const runDiag = async () => {
    setDiagErr('')
    setDiag(null)
    Taro.showLoading({ title: '检测中' })
    try {
      const r = await callCheckAdmin()
      setDiag(r)
    } catch (e: any) {
      setDiagErr((e && (e.errMsg || e.message)) || JSON.stringify(e))
    } finally {
      Taro.hideLoading()
    }
  }

  const copyOpenid = () => {
    if (!diag?.openid) return
    Taro.setClipboardData({
      data: diag.openid,
      success: () => Taro.showToast({ title: 'openid 已复制', icon: 'none' }),
    })
  }

  // 展开「已有作品」时才去拉取云端，避免每次进管理端都发请求
  const toggleManage = async () => {
    const next = !showManage
    setShowManage(next)
    if (!next || manageList !== null) return
    setManageLoading(true)
    try {
      setManageList(await fetchWorks())
    } catch (e) {
      setManageList([])
    } finally {
      setManageLoading(false)
    }
  }

  const removeWork = async (w: Work) => {
    const res = await Taro.showModal({
      title: '删除作品',
      content: `确定删除「${w.title}」？删除后顾客端会立即消失，且不可恢复。`,
      confirmText: '删除',
      confirmColor: '#E24B4A',
    })
    if (!res.confirm) return
    Taro.showLoading({ title: '删除中' })
    try {
      await callDeleteWork(w.id)
      setManageList((prev) => (prev || []).filter((x) => x.id !== w.id))
      Taro.showToast({ title: '已删除', icon: 'success' })
      onSaved()
    } catch (e: any) {
      Taro.showToast({ title: (e && e.message) || '删除失败', icon: 'none' })
    } finally {
      Taro.hideLoading()
    }
  }

  const pickMedia = async () => {
    try {
      const res = await Taro.chooseMedia({
        count: 9,
        mediaType: ['image', 'video'],
        sourceType: ['album', 'camera'],
      })
      for (const f of res.tempFiles) {
        Taro.showLoading({ title: '上传中' })
        const fileID = await uploadFile(f.tempFilePath)
        const item: WorkItem = {
          id: `i-${Date.now()}-${Math.floor(Math.random() * 1e4)}`,
          type: f.fileType === 'video' ? 'video' : 'photo',
          placeholder: '',
          src: fileID,
          caption: '',
          likes: 0,
          comments: [],
        }
        setItems((prev) => [...prev, item])
      }
      Taro.hideLoading()
    } catch (e) {
      Taro.hideLoading()
    }
  }

  const updateCaption = (idx: number, caption: string) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, caption } : it)))
  }
  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx))

  const submit = async () => {
    if (!title.trim()) {
      Taro.showToast({ title: '请填标题', icon: 'none' })
      return
    }
    if (items.length === 0) {
      Taro.showToast({ title: '至少选一张图', icon: 'none' })
      return
    }
    if (!CLOUD_ENV) {
      Taro.showToast({ title: '未配置云环境', icon: 'none' })
      return
    }
    setSubmitting(true)
    try {
      const cover = `radial-gradient(ellipse 80% 60% at 30% 20%, rgba(222,219,200,0.18), transparent 60%), linear-gradient(${coverHue}deg, #0a0a0a 0%, #161616 45%, #0d0d0d 100%)`
      const work: Omit<Work, 'id'> = {
        number: String(Date.now()).slice(-4),
        title: title.trim(),
        category,
        videoSub: category === 'video' ? videoSub : undefined,
        date: date.trim() || '—',
        location: location.trim(),
        cover,
        items,
        tags: tags
          .split(/[,，]/)
          .map((t) => t.trim())
          .filter(Boolean),
        description: description.trim(),
        details: details
          .split(/[,，\n]/)
          .map((t) => t.trim())
          .filter(Boolean),
      }
      await callAddWork(work)
      Taro.showToast({ title: '已发布', icon: 'success' })
      setManageList(null) // 让管理列表下次展开时重新拉取
      onSaved()
    } catch (e: any) {
      Taro.showToast({ title: (e && e.message) || '发布失败', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  // 首次使用：把静态初始 11 组作品批量导入云端（已存在则跳过）
  const seed = async () => {
    if (!CLOUD_ENV) return
    Taro.showLoading({ title: '导入中' })
    try {
      await callSeedWorks(WORKS)
      Taro.showToast({ title: '导入完成', icon: 'success' })
      setManageList(null) // 让管理列表下次展开时重新拉取
      onSaved()
    } catch (e: any) {
      Taro.showToast({ title: (e && e.message) || '导入失败', icon: 'none' })
    } finally {
      Taro.hideLoading()
    }
  }

  // 未配置云环境时给明确引导，而不是白屏
  if (!CLOUD_ENV) {
    return (
      <View style={overlay}>
        <View style={{ padding: '20px' }}>
          <View style={{ color: '#fff', fontSize: '16px', marginBottom: '12px' }}>
            管理端未启用
          </View>
          <View style={{ color: '#9CA3AF', fontSize: '13px', lineHeight: '1.7' }}>
            请先在 miniprogram/src/config.ts 填入 CLOUD_ENV（微信开发者工具「云开发」控制台获取），
            并按 CLOUD_SETUP.md 部署云函数、建立集合后，连点「作品」标题即可进入。
          </View>
          <View style={{ marginTop: '20px' }} onClick={onClose}>
            <ButtonLike>关闭</ButtonLike>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View style={overlay}>
      <View style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#000' }}>
        {/* 顶部条 */}
        <View
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: '0.5px solid rgba(255,255,255,0.1)',
          }}
        >
          <View style={{ color: '#fff', fontSize: '16px' }}>发布作品（管理端）</View>
          <View onClick={onClose}>
            <Icon name="x" color="white" size={22} />
          </View>
        </View>

        {/* 首次使用：导入初始作品 */}
        <View
          style={{
            padding: '12px 16px',
            borderBottom: '0.5px solid rgba(255,255,255,0.1)',
          }}
        >
          <View
            onClick={seed}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#DEDBC8',
              fontSize: '13px',
            }}
          >
            <Icon name="plus" color="primary" size={16} />
            导入初始 11 组作品（仅首次）
          </View>
        </View>

        {/* 环境自检：确认云函数已部署，并拿到自己的 openid */}
        <View
          style={{
            padding: '12px 16px',
            borderBottom: '0.5px solid rgba(255,255,255,0.1)',
          }}
        >
          <View
            onClick={runDiag}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#9CA3AF',
              fontSize: '13px',
            }}
          >
            <Icon name="check" color="primary" size={16} />
            环境自检（云函数 / 我的 openid）
          </View>

          {diag && (
            <View
              style={{
                marginTop: '10px',
                padding: '10px 12px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.06)',
                fontSize: '12px',
                lineHeight: '1.8',
                color: '#D1D5DB',
              }}
            >
              <View>云环境 ID：{CLOUD_ENV || '未配置'}（云函数已连通 ✓）</View>
              <View style={{ color: diag.isAdmin ? '#6EE7B7' : '#FCA5A5' }}>
                管理员身份：{diag.isAdmin ? '已授权 ✓' : '未授权（把下面 openid 加进 admins 集合）'}
              </View>
              <View style={{ wordBreak: 'break-all' }}>我的 openid：{diag.openid || '—'}</View>
              {diag.openid && (
                <View
                  onClick={copyOpenid}
                  style={{ marginTop: '6px', color: '#DEDBC8', fontSize: '12px' }}
                >
                  点击复制 openid → 到云开发控制台 admins 集合新增记录
                </View>
              )}
              {!diag.isAdmin && diag.adminsTotal !== undefined && (
                <View
                  style={{ marginTop: '6px', color: '#6B7280', fontSize: '11px', lineHeight: '1.7' }}
                >
                  诊断：云函数环境 {diag.env || '—'} · admins 共 {diag.adminsTotal} 条 ·
                  库内 openid 长 {diag.storedLength} · 你的长 {diag.myLength}
                  {diag.adminsTotal === 0 && ' → 集合是空的，记录可能加到了别的环境'}
                  {diag.adminsTotal > 0 &&
                    diag.storedLength !== diag.myLength &&
                    ' → 长度不一致，多半是抄写/粘贴时少了字符'}
                </View>
              )}
            </View>
          )}

          {diagErr && (
            <View
              style={{
                marginTop: '10px',
                padding: '10px 12px',
                borderRadius: '8px',
                background: 'rgba(248,113,113,0.12)',
                fontSize: '12px',
                lineHeight: '1.7',
                color: '#FCA5A5',
              }}
            >
              云函数调用失败：{diagErr}
              <View style={{ marginTop: '4px' }}>
                通常是三个云函数还没「上传并部署」，或部署的环境与 config.ts 的 CLOUD_ENV 不一致。
              </View>
            </View>
          )}
        </View>

        {/* 滚动要点：flex 子项默认 min-height:auto 会被内容撑开，导致 scroll-view 拿不到
            固定高度而无法内滚，必须显式 minHeight:0；另外小程序 webview 渲染模式下
            scroll-view 不支持 padding，所以内边距要挪到内层 View。 */}
        <ScrollView scrollY style={{ flex: 1, minHeight: 0 }}>
          <View style={{ padding: '16px' }}>
          {/* 已有作品管理：展开时才拉取云端 */}
          <View
            style={{
              marginBottom: '20px',
              paddingBottom: '14px',
              borderBottom: '0.5px solid rgba(255,255,255,0.1)',
            }}
          >
            <View
              onClick={toggleManage}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <View
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#DEDBC8',
                  fontSize: '13px',
                }}
              >
                <Icon name="trash" color="primary" size={16} />
                管理已有作品{manageList ? `（${manageList.length}）` : ''}
              </View>
              <Icon name={showManage ? 'chevronUp' : 'chevronDown'} color="gray" size={16} />
            </View>

            {showManage && (
              <View style={{ marginTop: '10px' }}>
                {manageLoading && (
                  <View style={{ color: '#6B7280', fontSize: '12px', padding: '8px 0' }}>
                    加载中…
                  </View>
                )}
                {!manageLoading && manageList && manageList.length === 0 && (
                  <View style={{ color: '#6B7280', fontSize: '12px', padding: '8px 0' }}>
                    云端还没有作品（可先点上面的「导入初始 11 组作品」）
                  </View>
                )}
                {(manageList || []).map((w) => (
                  <View
                    key={w.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 0',
                      borderBottom: '0.5px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <View style={{ flex: 1, minWidth: 0, paddingRight: '10px' }}>
                      <View style={{ color: '#E5E7EB', fontSize: '13px' }}>{w.title}</View>
                      <View style={{ color: '#6B7280', fontSize: '11px', marginTop: '2px' }}>
                        {w.category === 'photo' ? '婚礼摄影' : '婚礼摄像'}
                        {w.date ? ` · ${w.date}` : ''}
                        {w.location ? ` · ${w.location}` : ''}
                      </View>
                    </View>
                    <View
                      onClick={() => removeWork(w)}
                      style={{
                        padding: '6px 8px',
                        borderRadius: '6px',
                        background: 'rgba(248,113,113,0.12)',
                      }}
                    >
                      <Icon name="trash" color="gray" size={16} />
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          <Field label="标题">
            <Input
              value={title}
              onInput={(e) => setTitle(e.detail.value)}
              placeholder="作品标题"
              style={inputStyle}
            />
          </Field>

          <Field label="分类">
            <Picker
              mode="selector"
              range={['婚礼摄影', '婚礼摄像']}
              value={category === 'photo' ? 0 : 1}
              onChange={(e: any) => setCategory(e.detail.value === 0 ? 'photo' : 'video')}
            >
              <View style={{ ...inputStyle, display: 'flex', alignItems: 'center' }}>
                {category === 'photo' ? '婚礼摄影' : '婚礼摄像'}
              </View>
            </Picker>
          </Field>

          {category === 'video' && (
            <Field label="摄像子类型">
              <Picker
                mode="selector"
                range={VIDEO_SUBS.map((s) => s.label)}
                value={VIDEO_SUBS.findIndex((s) => s.id === videoSub)}
                onChange={(e: any) => setVideoSub(VIDEO_SUBS[e.detail.value].id)}
              >
                <View style={{ ...inputStyle, display: 'flex', alignItems: 'center' }}>
                  {VIDEO_SUBS.find((s) => s.id === videoSub)?.label}
                </View>
              </Picker>
            </Field>
          )}

          <Field label="地点">
            <Input
              value={location}
              onInput={(e) => setLocation(e.detail.value)}
              placeholder="城市 · 地点"
              style={inputStyle}
            />
          </Field>

          <Field label="日期">
            <Input
              value={date}
              onInput={(e) => setDate(e.detail.value)}
              placeholder="如 2026.01"
              style={inputStyle}
            />
          </Field>

          <Field label="标签（逗号分隔）">
            <Input
              value={tags}
              onInput={(e) => setTags(e.detail.value)}
              placeholder="单机摄影, 外景"
              style={inputStyle}
            />
          </Field>

          <Field label="简介">
            <Textarea
              value={description}
              onInput={(e) => setDescription(e.detail.value)}
              placeholder="一句话简介"
              style={{ ...inputStyle, height: '64px' }}
            />
          </Field>

          <Field label="要点（逗号 / 换行分隔）">
            <Textarea
              value={details}
              onInput={(e) => setDetails(e.detail.value)}
              placeholder="8 小时跟拍, 精修 40 张"
              style={{ ...inputStyle, height: '64px' }}
            />
          </Field>

          <Field label={`封面色相（0-360）：${coverHue}`}>
            <Input
              type="number"
              value={String(coverHue)}
              onInput={(e) => setCoverHue(Number(e.detail.value) || 0)}
              style={inputStyle}
            />
          </Field>

          {/* 图集 */}
          <View style={{ marginTop: '4px' }}>
            <View style={{ color: '#9CA3AF', fontSize: '13px', marginBottom: '8px' }}>
              图集 / 视频（{items.length}）
            </View>
            <View style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {items.map((it, idx) => (
                <View
                  key={it.id}
                  style={{
                    position: 'relative',
                    width: '80px',
                    height: '80px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    background: 'rgba(255,255,255,0.1)',
                  }}
                >
                  {it.type === 'video' ? (
                    <View
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon name="play" color="white" size={28} />
                    </View>
                  ) : (
                    <View
                      style={{
                        width: '100%',
                        height: '100%',
                        backgroundImage: `url(${it.src})`,
                        backgroundSize: 'cover',
                      }}
                    />
                  )}
                  <View
                    style={{ position: 'absolute', top: 0, right: 0, padding: '4px' }}
                    onClick={() => removeItem(idx)}
                  >
                    <Icon name="x" color="white" size={16} />
                  </View>
                </View>
              ))}
              <View
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '8px',
                  border: '1px dashed rgba(255,255,255,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onClick={pickMedia}
              >
                <Icon name="image" color="white" size={26} />
              </View>
            </View>

            {items.map((it, idx) => (
              <Input
                key={`cap-${it.id}`}
                style={{ ...inputStyle, marginTop: '8px' }}
                value={it.caption}
                onInput={(e) => updateCaption(idx, e.detail.value)}
                placeholder={`第 ${idx + 1} 张说明`}
              />
            ))}
          </View>
          </View>
        </ScrollView>

        <View style={{ padding: '16px', borderTop: '0.5px solid rgba(255,255,255,0.1)' }}>
          <View onClick={submit} style={submitting ? { opacity: 0.5 } : undefined}>
            <ButtonLike>{submitting ? '发布中…' : '发布作品'}</ButtonLike>
          </View>
        </View>
      </View>
    </View>
  )
}

function Field({ label, children }: { label: string; children: any }) {
  return (
    <View style={{ marginBottom: '16px' }}>
      <View style={{ color: '#9CA3AF', fontSize: '13px', marginBottom: '4px' }}>{label}</View>
      {children}
    </View>
  )
}

function ButtonLike({ children }: { children: any }) {
  return (
    <View
      style={{
        background: '#DEDBC8',
        color: '#0a0a0a',
        textAlign: 'center',
        padding: '13px',
        borderRadius: '10px',
        fontSize: '15px',
        fontWeight: 500,
      }}
    >
      {children}
    </View>
  )
}
