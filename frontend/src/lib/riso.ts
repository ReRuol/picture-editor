/** Konva 画在 canvas 上读不到 CSS 变量，油墨色在这里与 index.css 的 @theme 保持一致。 */
export const INK = {
  ink: '#13294b',
  brand: '#0078bf',
  brandStrong: '#005e96',
  accent: '#ff48b0',
  paper: '#fbf9f4',
  /** 画布边线用无彩色，避免干扰对图片颜色的判断 */
  frame: '#c9c9c9',
} as const
