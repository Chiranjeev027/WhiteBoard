// src/utils/rehydrateElements.js
import rough from "roughjs/bin/rough";
import getStroke from "perfect-freehand";
import { getSvgPathFromStroke } from "./element"; // ✅

const generator = rough.generator();

export function rehydrateElements(elements = []) {
  return elements.map((element) => {
    if (element.type === "BRUSH") {
      const points = element.points || [];
      // const xValues = points.map((p) => p.x);
      // const yValues = points.map((p) => p.y);

      return {
        ...element,
        // x1: Math.min(...xValues),
        // y1: Math.min(...yValues),
        // x2: Math.max(...xValues),
        // y2: Math.max(...yValues),
        path: new Path2D(getSvgPathFromStroke(getStroke(points))),
      };
    }

    // for other shape types like RECTANGLE, LINE, etc.
    let roughEle = null;
    const { x1, y1, x2, y2, stroke, fill, size } = element;
    const options = { stroke, fill, strokeWidth: size || 1 };

    switch (element.type) {
      case "RECTANGLE":
        roughEle = generator.rectangle(x1, y1, x2 - x1, y2 - y1, options);
        break;
      case "LINE":
        roughEle = generator.line(x1, y1, x2, y2, options);
        break;
      case "ARROW":
        roughEle = generator.line(x1, y1, x2, y2, options); // for now same as line
        break;
      case "CIRCLE":
        const radius = Math.hypot(x2 - x1, y2 - y1);
        roughEle = generator.circle(x1, y1, radius * 2, options);
        break;
    }

    return { ...element, roughEle };
  });
}
