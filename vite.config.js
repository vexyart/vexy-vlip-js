// this_file: vite.config.js
//
// Two library outputs, one per build pass (selected by VEXY_BUILD), mirroring
// vexy-stax-js:
//   - VEXY_BUILD=element -> dist/vexy-vlip.element.js (ESM, auto-registers <vexy-vlip>)
//   - VEXY_BUILD=global  -> dist/vexy-vlip.global.js  (IIFE, exposes window.VexyVlip)
// There are no runtime dependencies, so nothing external is bundled in.
// `npm run build` runs both passes (see package.json).

import { defineConfig } from "vite";

const TARGETS = {
  element: { entry: "src/element.js", format: "es", file: "vexy-vlip.element.js" },
  global: { entry: "src/global.js", format: "iife", file: "vexy-vlip.global.js" },
};

export default defineConfig(() => {
  const which = process.env.VEXY_BUILD === "global" ? "global" : "element";
  const t = TARGETS[which];
  return {
    build: {
      outDir: "dist",
      emptyOutDir: which === "element", // only the first pass clears dist
      sourcemap: true,
      lib: {
        entry: t.entry,
        name: "VexyVlip",
        formats: [t.format],
        fileName: () => t.file,
      },
    },
  };
});
