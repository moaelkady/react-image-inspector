type MagnifierLensProps = {
  src: string
  alt: string
  lensSize: number
  lensZoom: number
  x: number
  y: number
  imageRect: DOMRect | null
  containerRect: DOMRect | null
  lensClassName?: string
}

export function MagnifierLens({
  src,
  alt,
  lensSize,
  lensZoom,
  x,
  y,
  imageRect,
  containerRect,
  lensClassName,
}: MagnifierLensProps) {
  if (!imageRect || !containerRect) return null

  const pointerX = x + lensSize / 2 + containerRect.left
  const pointerY = y + lensSize / 2 + containerRect.top
  const imageX = Math.min(imageRect.width, Math.max(0, pointerX - imageRect.left))
  const imageY = Math.min(imageRect.height, Math.max(0, pointerY - imageRect.top))
  const backgroundX = -(imageX * lensZoom - lensSize / 2)
  const backgroundY = -(imageY * lensZoom - lensSize / 2)

  return (
    <div
      aria-hidden="true"
      className={`rii__lens ${lensClassName ?? ''}`.trim()}
      style={{
        width: lensSize,
        height: lensSize,
        transform: `translate(${x}px, ${y}px)`,
        backgroundImage: `url("${src}")`,
        backgroundSize: `${imageRect.width * lensZoom}px ${imageRect.height * lensZoom}px`,
        backgroundPosition: `${backgroundX}px ${backgroundY}px`,
      }}
      data-alt={alt}
    />
  )
}
