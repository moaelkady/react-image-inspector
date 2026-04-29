import { describe, expect, it } from 'vitest'
import { clampNumber, normalizeImages, resolveFeatures, resolveInitialIndex, normalizeRotation } from './utils'

describe('utils', () => {
  it('normalizes images with images precedence over src', () => {
    const result = normalizeImages({
      src: '/fallback.png',
      images: [{ src: '/a.png' }, { src: '' }, { src: '/b.png' }],
    })
    expect(result).toEqual([{ src: '/a.png' }, { src: '/b.png' }])
  })

  it('normalizes single src when images are invalid', () => {
    const result = normalizeImages({
      src: '/single.png',
      alt: 'Single',
      images: [{ src: '' }],
    })
    expect(result).toEqual([{ src: '/single.png', alt: 'Single' }])
  })

  it('resolves initial index safely', () => {
    expect(resolveInitialIndex(3, 2)).toBe(1)
    expect(resolveInitialIndex(-2, 4)).toBe(0)
    expect(resolveInitialIndex(undefined, 4)).toBe(0)
  })

  it('resolves feature parent-child dependencies and aliases', () => {
    const result = resolveFeatures(
      { toolbar: false, zoom: false, rotate: false, flip: false },
      3,
      true,
      true,
    )
    expect(result.toolbar).toBe(false)
    expect(result.zoomIn).toBe(false)
    expect(result.zoomOut).toBe(false)
    expect(result.resetZoom).toBe(false)
    expect(result.wheelZoom).toBe(false)
    expect(result.doubleClickZoom).toBe(false)
    expect(result.rotateLeft).toBe(false)
    expect(result.rotateRight).toBe(false)
    expect(result.flipHorizontal).toBe(false)
    expect(result.flipVertical).toBe(false)
  })

  it('hides thumbnails for single image by default', () => {
    expect(resolveFeatures(undefined, 1).thumbnails).toBe(false)
    expect(resolveFeatures(undefined, 1, undefined, true).thumbnails).toBe(true)
  })

  it('clamps numbers and normalizes rotations', () => {
    expect(clampNumber(8, 1, 4)).toBe(4)
    expect(clampNumber(-2, 1, 4)).toBe(1)
    expect(normalizeRotation(-90)).toBe(270)
    expect(normalizeRotation(450)).toBe(90)
  })
})
