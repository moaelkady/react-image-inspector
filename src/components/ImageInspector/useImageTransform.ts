import { useCallback, useEffect, useState } from "react";
import { clampNumber, normalizeRotation } from "./utils";
import type { ViewerTransformState } from "./types";

type TransformConfig = {
  minZoom: number;
  maxZoom: number;
  zoomStep: number;
  initialZoom: number;
  onTransformChange?: (state: ViewerTransformState) => void;
};

export function clampPanToStage(
  next: { x: number; y: number },
  stageSize: { width: number; height: number },
  zoomValue: number,
) {
  const maxX = Math.max(0, (stageSize.width * zoomValue - stageSize.width) / 2);
  const maxY = Math.max(
    0,
    (stageSize.height * zoomValue - stageSize.height) / 2,
  );
  return {
    x: clampNumber(next.x, -maxX, maxX),
    y: clampNumber(next.y, -maxY, maxY),
  };
}

export function useImageTransform(config: TransformConfig) {
  const [state, setState] = useState<ViewerTransformState>({
    zoom: config.initialZoom,
    rotation: 0,
    flipX: false,
    flipY: false,
  });
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const clampPan = useCallback(
    (
      next: { x: number; y: number },
      stageSize: { width: number; height: number },
      zoomValue = state.zoom,
    ) => clampPanToStage(next, stageSize, zoomValue),
    [state.zoom],
  );

  useEffect(() => {
    config.onTransformChange?.(state);
  }, [config, state]);

  const setZoom = useCallback(
    (value: number) => {
      const nextZoom = clampNumber(value, config.minZoom, config.maxZoom);
      setState((prev) => ({ ...prev, zoom: nextZoom }));
      if (nextZoom <= config.initialZoom) {
        setPan({ x: 0, y: 0 });
      }
    },
    [config.initialZoom, config.maxZoom, config.minZoom],
  );

  const zoomIn = useCallback(
    () => setZoom(state.zoom + config.zoomStep),
    [config.zoomStep, setZoom, state.zoom],
  );
  const zoomOut = useCallback(
    () => setZoom(state.zoom - config.zoomStep),
    [config.zoomStep, setZoom, state.zoom],
  );
  const resetZoom = useCallback(() => {
    setState((prev) => ({ ...prev, zoom: config.initialZoom }));
    setPan({ x: 0, y: 0 });
  }, [config.initialZoom]);

  const rotateLeft = useCallback(() => {
    setState((prev) => ({
      ...prev,
      rotation: normalizeRotation(prev.rotation - 90),
    }));
  }, []);

  const rotateRight = useCallback(() => {
    setState((prev) => ({
      ...prev,
      rotation: normalizeRotation(prev.rotation + 90),
    }));
  }, []);

  const flipHorizontal = useCallback(() => {
    setState((prev) => ({ ...prev, flipX: !prev.flipX }));
  }, []);

  const flipVertical = useCallback(() => {
    setState((prev) => ({ ...prev, flipY: !prev.flipY }));
  }, []);

  const resetAll = useCallback(() => {
    setState({
      zoom: config.initialZoom,
      rotation: 0,
      flipX: false,
      flipY: false,
    });
    setPan({ x: 0, y: 0 });
  }, [config.initialZoom]);

  return {
    state,
    setZoom,
    zoomIn,
    zoomOut,
    resetZoom,
    rotateLeft,
    rotateRight,
    flipHorizontal,
    flipVertical,
    resetAll,
    pan,
    setPan,
    clampPan,
    canZoomIn: state.zoom < config.maxZoom,
    canZoomOut: state.zoom > config.minZoom,
    canResetZoom: state.zoom !== config.initialZoom,
    hasActiveTransforms:
      state.zoom !== config.initialZoom ||
      state.rotation !== 0 ||
      state.flipX ||
      state.flipY,
  };
}
