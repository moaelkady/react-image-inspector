import { MagnifierLens } from './MagnifierLens'
import { useEffect, useLayoutEffect, useState } from 'react'
import type { PointerEvent, RefObject } from 'react'
import type { ViewerImage, ViewerTransformState } from './types'

type ImageStageProps = {
  images: ViewerImage[]
  activeIndex: number
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
  onError: () => void
}

export function ImageStage({
  images,
  activeIndex,
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
  const [imageRect, setImageRect] = useState<DOMRect | null>(null)
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null)
  const [isActiveImageLoading, setIsActiveImageLoading] = useState(true)
  const scaleX = transform.flipX ? -1 : 1
  const scaleY = transform.flipY ? -1 : 1
  const transformValue = `translate(${pan.x}px, ${pan.y}px) scale(${transform.zoom}) rotate(${transform.rotation}deg) scale(${scaleX}, ${scaleY})`
  const activeSrc = images[activeIndex]?.src ?? ''

  useEffect(() => {
    const activeImage = imageRef.current
    if (activeImage?.complete && activeImage.naturalWidth > 0 && activeImage.currentSrc === activeSrc) {
      setIsActiveImageLoading(false)
      return
    }
    setIsActiveImageLoading(true)
  }, [activeIndex, activeSrc, imageRef])

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
            <img
              ref={index === activeIndex ? imageRef : undefined}
              src={image.src}
              alt={image.alt || image.title || 'Image preview'}
              className={`rii__image ${imageClassName ?? ''}`.trim()}
              style={index === activeIndex ? { transform: transformValue } : undefined}
              draggable={false}
              onLoad={index === activeIndex ? () => setIsActiveImageLoading(false) : undefined}
              onError={index === activeIndex ? onError : undefined}
            />
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
