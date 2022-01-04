"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
class Preload {
    constructor() {
        this.cleanup();
        this.params = this.parse(process.argv);
    }
    cleanup() {
        const result = (0, fs_1.rmdir)('lib', _ => { });
        console.log(result);
    }
    parse(args) {
        const raw = `${args.join(' ')} -`;
        const matches = raw.match(/(-{1,})(.*?)(?= )(.*?)(?= -)/g);
        const result = {};
        matches === null || matches === void 0 ? void 0 : matches.map((arg) => {
            var _a, _b;
            const key = (_b = (_a = arg.replace(/^(-{1,})/g, '')) === null || _a === void 0 ? void 0 : _a.split(' ')) === null || _b === void 0 ? void 0 : _b.shift();
            const value = arg.split(' ').slice(1).join(' ');
            if (key)
                result[key] = value;
        });
        return result;
    }
}
exports.default = Preload;
