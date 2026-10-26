import { reactive } from 'vue';

/** The drag source of the builder drag and drop operation */
export type BuilderDragSource = 'palette' | 'canvas' | null;

/** The custom mime type carrying the dragged component type */
export const BUILD_COMPONENT_MIME = 'application/x-build-component';

/** The shared drag state, the canvas and the palette of one page instance communicate through it */
export const builderDrag = reactive<{
  source: BuilderDragSource;
  from: number;
  over: number;
}>({
  source: null,
  from: -1,
  over: -1,
});

/** Start a drag from the palette or from a canvas item */
export function startBuilderDrag(source: Exclude<BuilderDragSource, null>, from = -1) {
  builderDrag.source = source;
  builderDrag.from = from;
  builderDrag.over = -1;
}

/** Update the current insertion index while dragging over the canvas */
export function setBuilderDropIndex(index: number) {
  builderDrag.over = index;
}

/** Reset the drag state */
export function endBuilderDrag() {
  builderDrag.source = null;
  builderDrag.from = -1;
  builderDrag.over = -1;
}
