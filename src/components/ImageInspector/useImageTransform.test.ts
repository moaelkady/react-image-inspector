import { describe, expect, it } from 'vitest'
import { clampPanToStage } from './useImageTransform'

describe('useImageTransform math', () => {
  it('clamps pan within zoom bounds', () => {
    const stageSize = { width: 1000, height: 600 }
    const zoom = 2
    const clamped = clampPanToStage({ x: 900, y: -700 }, stageSize, zoom)
    expect(clamped.x).toBe(500)
    expect(clamped.y).toBe(-300)
  })

  it('returns zero pan range at base zoom', () => {
    const stageSize = { width: 1000, height: 600 }
    const clamped = clampPanToStage({ x: 200, y: 200 }, stageSize, 1)
    expect(clamped.x).toBe(0)
    expect(clamped.y).toBe(0)
  })
})
