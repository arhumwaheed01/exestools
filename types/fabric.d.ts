/** Minimal typings for dynamic `import("fabric")` (PDF editor). */
declare module "fabric" {
  export class FabricObject {
    set(key: string | Record<string, unknown>, value?: unknown): this;
    type?: string;
    left?: number;
    top?: number;
    width?: number;
    height?: number;
    scaleX?: number;
    scaleY?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    visible?: boolean;
    selectable?: boolean;
    evented?: boolean;
  }

  export class Textbox extends FabricObject {
    constructor(text: string, options?: Record<string, unknown>);
    text?: string;
    fontSize?: number;
    fontWeight?: string | number;
    fontStyle?: string;
    fontFamily?: string;
    textAlign?: string;
    fill?: string;
    underline?: boolean;
  }

  export class PencilBrush {
    constructor(canvas: Canvas);
    color: string;
    width: number;
    decimate?: number;
  }

  export class Rect extends FabricObject {
    constructor(options?: Record<string, unknown>);
  }

  export class Circle extends FabricObject {
    constructor(options?: Record<string, unknown>);
    radius?: number;
  }

  export class Line extends FabricObject {
    constructor(points?: [number, number, number, number], options?: Record<string, unknown>);
    x1?: number;
    y1?: number;
    x2?: number;
    y2?: number;
  }

  export class Triangle extends FabricObject {
    constructor(options?: Record<string, unknown>);
    width?: number;
    height?: number;
    angle?: number;
    originX?: string;
    originY?: string;
  }

  export class FabricImage extends FabricObject {
    static fromURL(
      url: string,
      options?: { crossOrigin?: string },
      imgOptions?: Record<string, unknown>,
    ): Promise<FabricImage>;
    scaleToWidth(w: number): this;
  }

  export class Canvas {
    constructor(element: HTMLCanvasElement, options?: Record<string, unknown>);
    width: number;
    height: number;
    backgroundColor: string;
    isDrawingMode: boolean;
    selection: boolean;
    defaultCursor: string;
    freeDrawingBrush?: unknown;
    on(event: string, handler: (...args: unknown[]) => void): this;
    off(event: string, handler: (...args: unknown[]) => void): this;
    add(...objects: FabricObject[]): void;
    remove(...objects: FabricObject[]): void;
    setActiveObject(object: FabricObject | undefined): void;
    getActiveObject(): FabricObject | undefined;
    discardActiveObject(): void;
    getScenePoint(e: Event): { x: number; y: number };
    requestRenderAll(): void;
    clear(): void;
    setDimensions(dim: { width: number; height: number }): void;
    dispose(): void;
    renderAll(): void;
    toJSON(propertiesToInclude?: string[]): object;
    loadFromJSON(
      json: object | string,
      reviver?: (serialized: Record<string, unknown>, obj: FabricObject) => void,
    ): Promise<this>;
    getObjects(): FabricObject[];
    sendObjectToBack(object: FabricObject): void;
    toDataURL(options: { format?: string; multiplier: number }): string;
  }
}
