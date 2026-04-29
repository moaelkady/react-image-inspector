import type { PointerEvent } from 'react'
import { useMemo, useState } from 'react'
import type { ViewerTransformState } from './types'

type LensPoint = { x: number; y: number }

export function useMagnifierLens(
  enabled: boolean,
  transform: ViewerTransformState,
  lensSize: number,
  isTouchDevice: boolean,
  isDragging = false,
) {
  const [point, setPoint] = useState<LensPoint>({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)

  const canRenderLens = useMemo(() => {
    if (!enabled || isTouchDevice) return false
    // Mapping lens coordinates for rotated/flipped images is intentionally not handled.
    // We hide the lens in these states to avoid misleading magnification.
    return transform.rotation === 0 && !transform.flipX && !transform.flipY
  }, [enabled, isTouchDevice, transform.flipX, transform.flipY, transform.rotation])

  const showLens = () => {
    if (canRenderLens && !isDragging) setIsVisible(true)
  }

  const hideLens = () => setIsVisible(false)

  const moveLens = (
    event: PointerEvent<HTMLElement>,
    container: HTMLElement,
    image: HTMLImageElement | null,
  ) => {
    if (!canRenderLens || !image || isDragging) {
      hideLens()
      return
    }
    const containerRect = container.getBoundingClientRect()
    const imageRect = image.getBoundingClientRect()
    const inside =
      event.clientX >= imageRect.left &&
      event.clientX <= imageRect.right &&
      event.clientY >= imageRect.top &&
      event.clientY <= imageRect.bottom
    if (!inside) {
      hideLens()
      return
    }

    setPoint({
      x: event.clientX - containerRect.left - lensSize / 2,
      y: event.clientY - containerRect.top - lensSize / 2,
    })
    setIsVisible(true)
  }

  return { canRenderLens, isVisible, point, showLens, hideLens, moveLens }
}
