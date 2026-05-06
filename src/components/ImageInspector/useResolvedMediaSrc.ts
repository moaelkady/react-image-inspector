import type { ViewerMedia } from "./types";

type ResolverArgs = {
  media?: ViewerMedia;
  onResolveError?: (_message: string, _media: ViewerMedia) => void;
};

export function useResolvedMediaSrc({ media }: ResolverArgs) {
  const mediaSrc = media?.src ?? "";

  return {
    resolvedSrc: mediaSrc,
    isObjectUrl: false,
  };
}
