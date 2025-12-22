export default function getTextWidth(text: string, font: string): number {
  const anyFn = getTextWidth as any;
  if (!anyFn._canvas) anyFn._canvas = document.createElement('canvas');
  const canvas: HTMLCanvasElement = anyFn._canvas;
  const ctx = canvas.getContext('2d');
  if (!ctx) return 0;
  ctx.font = font;
  return ctx.measureText(text).width;
}
