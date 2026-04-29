import { TOOLBAR_ACTIONS } from './constants'
import type { ResolvedImageInspectorFeatures, ResolvedLabels } from './types'

type ToolbarProps = {
  features: ResolvedImageInspectorFeatures
  labels: ResolvedLabels
  disabled: {
    zoomIn: boolean
    zoomOut: boolean
    resetZoom: boolean
    resetAll: boolean
  }
  handlers: Record<
    | 'zoomIn'
    | 'zoomOut'
    | 'resetZoom'
    | 'rotateLeft'
    | 'rotateRight'
    | 'flipHorizontal'
    | 'flipVertical'
    | 'resetAll',
    () => void
  >
  className?: string
}

export function Toolbar({ features, labels, disabled, handlers, className }: ToolbarProps) {
  if (!features.toolbar) return null

  const visibility: Record<string, boolean> = {
    zoomIn: features.zoomIn,
    zoomOut: features.zoomOut,
    resetZoom: features.resetZoom,
    rotateLeft: features.rotateLeft,
    rotateRight: features.rotateRight,
    flipHorizontal: features.flipHorizontal,
    flipVertical: features.flipVertical,
    resetAll: features.resetAll,
  }

  const visibleActions = TOOLBAR_ACTIONS.filter((action) => visibility[action.key])
  if (visibleActions.length === 0) return null

  return (
    <div className={`rii__toolbar ${className ?? ''}`.trim()} aria-label="Image controls">
      {visibleActions.map((action) => {
        const label = labels[action.key]
        const isDisabled = action.key in disabled ? disabled[action.key as keyof typeof disabled] : false
        return (
          <button
            key={action.key}
            type="button"
            className="rii__button"
            onClick={handlers[action.key]}
            aria-label={label}
            disabled={isDisabled}
            data-disabled={isDisabled}
          >
            <span aria-hidden="true">{action.icon}</span>
            <span className="rii__button-text">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
