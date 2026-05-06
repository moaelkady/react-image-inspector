import { MagnifierLens } from './MagnifierLens'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { PointerEvent, RefObject } from 'react'
import type { ViewerMedia, ViewerTransformState } from './types'

type ImageStageProps = {
  images: ViewerMedia[]
  activeIndex: number
  resolvedActiveSrc: string
  imageClassName?: string
  lensClassName?: string
  transform: ViewerTransformState
  pan: { x: number; y: number }
  stageRef: RefObject<HTMLDivElement | null>
  imageRef: RefObject<HTMLImageElement | null>
  lens: {
    enabled: boolean
    visible: boolean
    x: number
    y: number
    lensSize: number
    lensZoom: number
  }
  onPointerEnter: () => void
  onPointerMove: (event: PointerEvent<HTMLDivElement>) => void
  onPointerLeave: () => void
  onDoubleClick: () => void
  onPointerDown: (event: PointerEvent<HTMLDivElement>) => void
  onPointerUp: () => void
  onError: (type: 'image' | 'video') => void
}

export function ImageStage({
  images,
  activeIndex,
  resolvedActiveSrc,
  imageClassName,
  lensClassName,
  transform,
  pan,
  stageRef,
  imageRef,
  lens,
  onPointerEnter,
  onPointerMove,
  onPointerLeave,
  onDoubleClick,
  onPointerDown,
  onPointerUp,
  onError,
}: ImageStageProps) {
  const MIN_LENS_LOADING_MS = 200
  const [imageRect, setImageRect] = useState<DOMRect | null>(null)
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null)
  const [isActiveImageLoading, setIsActiveImageLoading] = useState(true)
  const loadingStartedAtRef = useRef<number>(0)
  const loadingTimerRef = useRef<number | null>(null)
  const scaleX = transform.flipX ? -1 : 1
  const scaleY = transform.flipY ? -1 : 1
  const transformValue = `translate(${pan.x}px, ${pan.y}px) scale(${transform.zoom}) rotate(${transform.rotation}deg) scale(${scaleX}, ${scaleY})`
  const activeSrc = images[activeIndex]?.src ?? ''

  useEffect(() => {
    if (loadingTimerRef.current) {
      window.clearTimeout(loadingTimerRef.current)
      loadingTimerRef.current = null
    }

    loadingStartedAtRef.current = Date.now()
    const activeImage = imageRef.current
    if (activeImage?.complete && activeImage.naturalWidth > 0 && activeImage.currentSrc === activeSrc) {
      const elapsed = Date.now() - loadingStartedAtRef.current
      const remaining = Math.max(0, MIN_LENS_LOADING_MS - elapsed)
      loadingTimerRef.current = window.setTimeout(() => {
        setIsActiveImageLoading(false)
        loadingTimerRef.current = null
      }, remaining)
      return
    }
    setIsActiveImageLoading(true)
  }, [MIN_LENS_LOADING_MS, activeIndex, activeSrc, imageRef])

  useEffect(
    () => () => {
      if (loadingTimerRef.current) {
        window.clearTimeout(loadingTimerRef.current)
      }
    },
    [],
  )

  useLayoutEffect(() => {
    if (!lens.enabled || !lens.visible) return
    setImageRect(imageRef.current?.getBoundingClientRect() ?? null)
    setContainerRect(stageRef.current?.getBoundingClientRect() ?? null)
  }, [imageRef, lens.enabled, lens.visible, lens.x, lens.y, stageRef, transformValue])

  return (
    <div
      className="rii__stage"
      ref={stageRef}
      onPointerEnter={onPointerEnter}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onDoubleClick={onDoubleClick}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      <div className="rii__track" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
        {images.map((image, index) => (
          <div key={image.id ?? `${image.src}-${index}`} className="rii__slide">
            {image.type === 'video' ? (
              <video
                src={index === activeIndex ? resolvedActiveSrc : image.src}
                className="rii__video"
                controls
                playsInline
                preload="metadata"
                poster={image.poster}
                onError={index === activeIndex ? () => onError('video') : undefined}
              />
            ) : (
              <img
                ref={index === activeIndex ? imageRef : undefined}
                src={index === activeIndex ? resolvedActiveSrc : image.src}
                alt={image.alt || image.title || 'Image preview'}
                className={`rii__image ${imageClassName ?? ''}`.trim()}
                style={index === activeIndex ? { transform: transformValue } : undefined}
                draggable={false}
                onLoad={
                  index === activeIndex
                    ? () => {
                      const elapsed = Date.now() - loadingStartedAtRef.current
                      const remaining = Math.max(0, MIN_LENS_LOADING_MS - elapsed)
                      if (loadingTimerRef.current) {
                        window.clearTimeout(loadingTimerRef.current)
                      }
                      loadingTimerRef.current = window.setTimeout(() => {
                        setIsActiveImageLoading(false)
                        loadingTimerRef.current = null
                      }, remaining)
                    }
                    : undefined
                }
                onError={index === activeIndex ? () => onError('image') : undefined}
              />
            )}
          </div>
        ))}
      </div>
      {lens.enabled && lens.visible ? (
        <MagnifierLens
          src={images[activeIndex].src}
          alt={images[activeIndex].alt || images[activeIndex].title || 'Image preview'}
          lensSize={lens.lensSize}
          lensZoom={lens.lensZoom}
          x={lens.x}
          y={lens.y}
          imageRect={imageRect}
          containerRect={containerRect}
          lensClassName={lensClassName}
          isLensLoading={isActiveImageLoading}
        />
      ) : null}
    </div>
  )
}
