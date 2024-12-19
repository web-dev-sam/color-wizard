import { converter, formatCss, type Hsl, type Lrgb, type Rgb, wcagContrast } from "culori"

export const toOklab = converter("oklab")
export const toOklch = converter("oklch")
export const toRGB = converter("rgb")
export const toHsl = converter("hsl")

export function distanceRGB(colorA: string, colorB: string) {
  const colorAConverted = toRGB(colorA)
  const colorBConverted = toRGB(colorB)
  if (!colorAConverted || !colorBConverted) {
    return err("ColorParserError")
  }

  const distance = (colorAConverted.r - colorBConverted.r) ** 2
    + (colorAConverted.g - colorBConverted.g) ** 2
    + (colorAConverted.b - colorBConverted.b) ** 2
  return ok(Math.sqrt(distance))
}

export function mixOklchLinear(colorA: string, colorB: string, steps: number) {
  const colorAOklch = toOklch(colorA)
  const colorBOklch = toOklch(colorB)
  if (!colorAOklch || !colorBOklch) {
    return err("ColorParserError")
  }

  const colors: string[] = []
  for (let i = 0; i < steps; i++) {
    const l = colorAOklch.l + (colorBOklch.l - colorAOklch.l) * (i / (steps - 1))
    const c = colorAOklch.c + (colorBOklch.c - colorAOklch.c) * (i / (steps - 1))
    const h = colorBOklch.h && colorAOklch.h ? colorAOklch.h + (colorBOklch.h - colorAOklch.h) * (i / (steps - 1)) : undefined
    colors.push(formatCss({ l, c, h, mode: "oklch" }))
  }
  return ok(colors)
}

export function mixOklabLinear(colorA: string, colorB: string, steps: number) {
  const colorAOklab = toOklab(colorA)
  const colorBOklab = toOklab(colorB)
  if (!colorAOklab || !colorBOklab) {
    return err("ColorParserError")
  }

  const colors: string[] = []
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1)
    const l = colorAOklab.l + (colorBOklab.l - colorAOklab.l) * t
    const a = colorAOklab.a + (colorBOklab.a - colorAOklab.a) * t
    const b = colorAOklab.b + (colorBOklab.b - colorAOklab.b) * t
    colors.push(formatCss({ l, a, b, mode: "oklab" }))
  }
  return ok(colors)
}

export function mixRgbLinear(colorA: string, colorB: string, steps: number) {
  const colorARgb = toRGB(colorA)
  const colorBRgb = toRGB(colorB)
  if (!colorARgb || !colorBRgb) {
    return err("ColorParserError")
  }

  const colors: string[] = []
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1)
    const r = colorARgb.r + (colorBRgb.r - colorARgb.r) * t
    const g = colorARgb.g + (colorBRgb.g - colorARgb.g) * t
    const b = colorARgb.b + (colorBRgb.b - colorARgb.b) * t
    colors.push(formatCss({ r, g, b, mode: "rgb" }))
  }
  return ok(colors)
}

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

export function mixHslAuto(colorA: string, colorB: string, steps: number) {
  const colorAHsl = toHsl(colorA)
  const colorBHsl = toHsl(colorB)
  if (!colorAHsl || !colorBHsl) {
    return err("ColorParserError")
  }

  const colors: string[] = []
  for (let i = 0; i < steps; i++) {
    // const t = i / (steps - 1)

    // Goal Contrasts: 1.25, 1.55, 2.1, 3, 3.6, 4.5, 7, 12, 16 (light mode)

    // ['1.10', '1.23', '1.48', '2.56', '4.76', '7.58', '10.35', '14.63', '17.85']
    // Hue: 12 in a direction
    // Saturation: 48% -> 16% -> 48%
    // Lightness: 96% -> 11% (outer = bigger difference)

    // colors.push(formatCss({ h, s, l, mode: "hsl" }))
  }
  return ok(colors)
}

/**
 * @deprecated
 */
export function getPerceivedBrightnessOklab(color: string) {
  const colorConverted = toOklab(color)
  if (!colorConverted) {
    return err("ColorParserError")
  }

  return ok(colorConverted.l)
}

/**
 * @deprecated
 */
export function getPerceivedBrightnessRgb(color: string) {
  const colorConverted = toRGB(color)
  if (!colorConverted) {
    return err("ColorParserError")
  }

  return ok(Math.sqrt((colorConverted.r ** 2) * 0.299 + (colorConverted.g ** 2) * 0.587 + (colorConverted.b ** 2) * 0.114) / 1)
}

/**
 * @deprecated
 */
export function getPerceivedBrightnessAvgDiffs(colors: string[]) {
  const brightnesses = colors.map(getPerceivedBrightnessOklab)
  const isValid = (brightnesses: Result<number>[]): brightnesses is Ok<number>[] => brightnesses.every(brightness => brightness.success)
  if (!isValid(brightnesses)) {
    return err("ColorParserError")
  }

  const brightnessValues = brightnesses.map(brightness => brightness.data)
  // console.log("wcag", colors.map(color => wcagContrast(color, "#fff").toFixed(2)))
  const differences = Array.from(
    { length: brightnessValues.length - 1 },
    (_, i) => brightnessValues[i + 1] - brightnessValues[i],
  )
  return ok(differences)
}

const linearRgbValue = (c = 0) => {
  const abs = Math.abs(c)
  if (abs <= 0.04045) {
    return c / 12.92
  }
  return (Math.sign(c) || 1) * ((abs + 0.055) / 1.055) ** 2.4
}

const quickRgbToLrgb = ({ r, g, b, alpha }: Rgb) => {
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
export function findHSLColorsWithContrast(
  color: string,
  hueConstraint: number,
  contrast: number,
  contrastDelta: number,
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
        const contrastValue = wcagContrast(color, lrgbWhite)
        if (Math.abs(contrastValue - contrast) < contrastDelta) {
          colors.push(colorHSL)
        }
      }
    }
  }
  return ok(colors)
}
