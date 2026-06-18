// this_file: src/global.js
//
// Classic-script entry. Built as an IIFE that exposes window.VexyVlip and
// auto-registers <vexy-vlip>. Single <script src="vexy-vlip.global.js">.

import { VexyVlip, version } from "./index.js";
import VexyVlipElement from "./element.js"; // registers <vexy-vlip> on import

VexyVlip.Element = VexyVlipElement;
VexyVlip.version = version;

export default VexyVlip;
