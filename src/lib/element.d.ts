interface Element {
  checkVisibility: (options?: {
    contentVisibilityAuto?: boolean;
    opacityProperty?: boolean;
    visibilityProperty?: boolean;
  }) => boolean;
}
