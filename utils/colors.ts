import { converter, formatCss, type Hsl, type Lrgb, type Rgb, wcagContrast } from "culori"

export const toOklab = converter("oklab")
export const toOklch = converter("oklch")
export const toRGB = converter("rgb")
export const toHsl = converter("hsl")

export function mixHslLinear(colorA: string, colorB: string, steps: number) {
  const colorAHsl = toHsl(colorA)
  const colorBHsl = toHsl(colorB)
  if (!colorAHsl || !colorBHsl) {
    return err("ColorParserError")
  }

  const colors: string[] = []
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1)
    const h = (colorAHsl.h || 0) + ((colorBHsl.h || 0) - (colorAHsl.h || 0)) * t
    const s = colorAHsl.s + (colorBHsl.s - colorAHsl.s) * t
    const l = colorAHsl.l + (colorBHsl.l - colorAHsl.l) * t
    colors.push(formatCss({ h, s, l, mode: "hsl" }))
  }
  return ok(colors)
}

function linearRgbValue(c = 0) {
  const abs = Math.abs(c)
  if (abs <= 0.04045) {
    return c / 12.92
  }
  return (Math.sign(c) || 1) * ((abs + 0.055) / 1.055) ** 2.4
}

function quickRgbToLrgb({ r, g, b, alpha }: Rgb) {
  const res: Lrgb = {
    mode: "lrgb",
    r: linearRgbValue(r),
    g: linearRgbValue(g),
    b: linearRgbValue(b),
  }
  if (alpha !== undefined) {
    res.alpha = alpha
  }
  return res
}

export const lrgbWhite = quickRgbToLrgb({ r: 1, g: 1, b: 1, mode: "rgb" })
export const lrgbBlack = quickRgbToLrgb({ r: 0 / 255, g: 0 / 255, b: 0 / 255, mode: "rgb" })
export function findHSLColorsWithContrast(
  color: Rgb,
  hueConstraint: number,
  lowerContrast: number,
  upperContrast: number,
  saturationMin: number,
) {
  const colorHsl = toHsl(color)
  if (!colorHsl) {
    return err("ColorParserError")
  }

  const hueStart = colorHsl.h != null ? colorHsl.h - hueConstraint : 0
  const hueEnd = colorHsl.h != null ? colorHsl.h + hueConstraint : 0
  const saturationStart = colorHsl.h == null ? 0 : Math.max(colorHsl.s, saturationMin)
  const saturationEnd = colorHsl.h == null ? 0 : 1
  const colors: Hsl[] = []

  for (let h = hueStart; h <= hueEnd; h += 1) {
    for (let s = saturationStart; s <= saturationEnd; s += 0.01) {
      for (let l = 0; l <= 1; l += 0.01) {
        const colorHSL = { h, s, l, mode: "hsl" } as const
        const color = quickRgbToLrgb(toRGB(colorHSL))
        const lightContrastValue = wcagContrast(color, lrgbWhite)

        if (lightContrastValue >= lowerContrast && lightContrastValue <= upperContrast) {
          colors.push(colorHSL)
          continue
        }
      }
    }
  }
  return ok(colors)
}
