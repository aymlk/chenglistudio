export type Token = {
  word: string
  /** 该词后是否跟随一个空格 */
  spaceAfter: boolean
}

/**
 * 按「词」分词，保留中英文混排时的合理断点：
 * - 连续 CJK 字符按字拆分
 * - 连续拉丁字符、数字按单词拆分
 * - 标点独立成词
 */
export function tokenize(text: string): Token[] {
  const tokens: Token[] = []
  let current = ''
  let currentType: 'cjk' | 'latin' | 'punct' | null = null

  function pushCurrent() {
    if (current === '') return
    if (currentType === 'cjk') {
      for (const char of current) {
        tokens.push({ word: char, spaceAfter: false })
      }
    } else {
      tokens.push({ word: current, spaceAfter: false })
    }
    current = ''
  }

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    const isSpace = /\s/.test(ch)
    const isCjk = /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/.test(ch)
    const isPunct = /[\p{P}\p{S}]/u.test(ch)

    if (isSpace) {
      pushCurrent()
      if (tokens.length > 0) {
        tokens[tokens.length - 1].spaceAfter = true
      }
      currentType = null
      continue
    }

    let type: 'cjk' | 'latin' | 'punct'
    if (isCjk) {
      type = 'cjk'
    } else if (isPunct) {
      type = 'punct'
    } else {
      type = 'latin'
    }

    if (currentType !== type) {
      pushCurrent()
      currentType = type
    }

    current += ch
  }

  pushCurrent()
  return tokens
}
