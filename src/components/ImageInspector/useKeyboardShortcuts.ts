import { useEffect, type RefObject } from 'react'

type KeyboardActions = {
  enabled: boolean
  onNext: () => void
  onPrevious: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onResetZoom: () => void
  onRotateRight: () => void
  onRotateLeft: () => void
  onFlipHorizontal: () => void
  onFlipVertical: () => void
  onEscape: () => void
  canNavigate: boolean
  canZoom: boolean
  canRotate: boolean
  canFlipHorizontal: boolean
  canFlipVertical: boolean
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName.toLowerCase()
  return tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable
}

export function useKeyboardShortcuts(containerRef: RefObject<HTMLElement | null>, actions: KeyboardActions) {
  useEffect(() => {
    const container = containerRef.current
    if (!container || !actions.enabled) return

    const onKeyDown = (event: KeyboardEvent) => {
      const activeElement = document.activeElement
      const focusInContainer = activeElement ? container.contains(activeElement) : false
      if (!focusInContainer || isTypingTarget(event.target)) return

      if (event.key === 'ArrowRight' && actions.canNavigate) {
        event.preventDefault()
        actions.onNext()
        return
      }

      if (event.key === 'ArrowLeft' && actions.canNavigate) {
        event.preventDefault()
        actions.onPrevious()
        return
      }

      if (actions.canZoom && event.key === '+') {
        event.preventDefault()
        actions.onZoomIn()
        return
      }

      if (actions.canZoom && event.key === '-') {
        event.preventDefault()
        actions.onZoomOut()
        return
      }

      if (actions.canZoom && event.key === '0') {
        event.preventDefault()
        actions.onResetZoom()
        return
      }

      if (actions.canRotate && event.key === 'r' && event.shiftKey) {
        event.preventDefault()
        actions.onRotateLeft()
        return
      }

      if (actions.canRotate && event.key.toLowerCase() === 'r') {
        event.preventDefault()
        actions.onRotateRight()
        return
      }

      if (actions.canFlipHorizontal && event.key.toLowerCase() === 'h') {
        event.preventDefault()
        actions.onFlipHorizontal()
        return
      }

      if (actions.canFlipVertical && event.key.toLowerCase() === 'v') {
        event.preventDefault()
        actions.onFlipVertical()
        return
      }

      if (event.key === 'Escape') {
        actions.onEscape()
      }
    }

    container.addEventListener('keydown', onKeyDown)
    return () => container.removeEventListener('keydown', onKeyDown)
  }, [actions, containerRef])
}
