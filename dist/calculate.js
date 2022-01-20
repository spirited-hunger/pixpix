"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.relativeBrightness = void 0;
const relativeBrightness = (red, green, blue) => {
    return Math.floor(Math.sqrt((red * red) * 0.299 +
        (green * green) * 0.587 +
        (blue * blue) * 0.114));
};
exports.relativeBrightness = relativeBrightness;
//# sourceMappingURL=calculate.js.map