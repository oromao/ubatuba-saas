"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asObjectId = asObjectId;
const mongoose_1 = require("mongoose");
function asObjectId(value) {
    return value instanceof mongoose_1.Types.ObjectId ? value : new mongoose_1.Types.ObjectId(value);
}
//# sourceMappingURL=object-id.js.map