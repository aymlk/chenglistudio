# 作品集添加指南（只改本文件 works.ts）

> 所有作品数据都在这一个文件：`src/content/works.ts`。
> 加内容**只需编辑这一个文件**，下面的渲染层会自动出卡片、自动进分类，不需要碰任何组件：
> `sections/Works.tsx` → `components/WorksWall.tsx` / `VideoSubs.tsx` → `WallCard.tsx` → `WorkModal.tsx`

---

## 一、加一组作品（最常用）

在文件末尾 `export const WORKS: Work[] = [ ... ]` 的数组里，在最后一个 `},` 后面粘下面这段，改文字即可：

```ts
  {
    id: 'w12',                 // 唯一，别和已有重复（w01~w11 已占用）
    number: '12',              // 卡片上的编号水印，随意
    title: '作品标题',
    category: 'photo',         // 'photo' 摄影 ｜ 'video' 摄像
    date: '2026.01',
    location: '城市 · 地点',
    cover: gradient(120),      // 占位封面渐变，色相 0~360 随便填
    tags: ['标签1', '标签2'],
    description: '一句话简介',
    details: ['服务要点1', '服务要点2'],
    items: [
      photo(120, 0, '图1说明'),
      photo(120, 1, '图2说明', 88),   // 88 = 初始点赞数，可写 0
      // 有真实图后见第三节，把这一行换成带 src 的对象
    ],
  },
```

保存后 `npm run dev` 即可本地预览，无需其他操作。

---

## 二、加一个摄像子类型（如「5 分钟纪录片」）

1. 在文件顶部 `export const VIDEO_SUBS = [ ... ]` 里加一项：

```ts
  { id: 'doc5', label: '5 分钟纪录片', hint: '以更长篇幅完整叙事' },
```

2. 让作品归到该子类型：在作品的 `Work` 对象里加 `videoSub: 'doc5'`，且 `category: 'video'`：

```ts
  {
    id: 'w13', number: '13', title: '...', category: 'video', videoSub: 'doc5',
    // ...其余字段同一节模板
  }
```

左侧子类型导航和计数会自动更新，零额外配置。

---

## 三、接入真实图片 / 视频

占位渐变只用于没图时预览。图准备好后，把 `items` 里对应的 `photo(...)` 换成带 `src` 的对象：

```ts
  // 图片
  { id: 'r1', type: 'photo', placeholder: gradient(120), src: 'https://你的图床/a.jpg', caption: '图1说明', likes: 0, comments: [] },
  // 视频
  { id: 'v1', type: 'video', placeholder: gradient(120), src: 'https://你的图床/a.mp4', caption: '视频说明', likes: 0, comments: [] },
```

- 渲染优先读 `src`，有 `src` 就显示真图，没有就显示占位渐变。
- **若后续包成微信小程序**：图/视频地址必须 HTTPS，且域名要在小程序后台「服务器域名」加白名单（downloadFile / request 域名）。当前是 H5 版本则无此限制。

---

## 四、字段速查

| 字段 | 含义 | 备注 |
|------|------|------|
| id | 唯一标识 | 不可重复，用作 React key |
| number | 编号水印 | 卡片左上角显示，随意 |
| category | photo / video | 决定进哪个一级分类 |
| videoSub | 摄像子类型 | 仅 video 类需要，值对应 VIDEO_SUBS 的 id |
| items | 作品内图文/视频数组 | 首项用作卡片封面；photo/video 可混排 |
| cover | 卡片墙封面渐变 | 用 `gradient(色相)` |
| tags | 标签 | 数组 |
| likes / comments | 初始点赞 / 留言 | 演示用，前端本地态 |

---

## 五、常见坑

- `id` 必须唯一，重复会导致 React key 冲突、预览错乱。
- 视频类作品（`type:'video'`）建议 `likes: 0`（代码对视频禁用了点赞）。
- 想加**完全新的大类**（如亲子 / 商业 / 旅拍），当前需改 `Works.tsx` 的分支逻辑——
  可让开发者把 `CATEGORIES` 加一个 `layout` 字段、`Works.tsx` 按 `layout` 渲染，
  改完后加任何新品类也都只改本文件（数据驱动）。
