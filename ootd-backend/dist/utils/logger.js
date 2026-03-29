"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const LOG_LEVEL_PRIORITY = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40,
};
const parseLogLevel = (value) => {
    if (!value) {
        return "info";
    }
    const normalized = value.toLowerCase();
    if (normalized === "debug" ||
        normalized === "info" ||
        normalized === "warn" ||
        normalized === "error") {
        return normalized;
    }
    return "info";
};
const minimumLevel = parseLogLevel(process.env.LOG_LEVEL);
const shouldLog = (level) => {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[minimumLevel];
};
const replacer = (_key, value) => {
    if (value instanceof Error) {
        return {
            name: value.name,
            message: value.message,
            stack: value.stack,
        };
    }
    if (typeof value === "bigint") {
        return value.toString();
    }
    return value;
};
const emit = (level, message, meta) => {
    if (!shouldLog(level)) {
        return;
    }
    const payload = {
        timestamp: new Date().toISOString(),
        level,
        message,
        meta,
    };
    let serialized = "";
    try {
        serialized = JSON.stringify(payload, replacer);
    }
    catch {
        serialized = JSON.stringify({
            timestamp: new Date().toISOString(),
            level,
            message,
            meta: { note: "Meta could not be serialized" },
        });
    }
    if (level === "error") {
        console.error(serialized);
        return;
    }
    if (level === "warn") {
        console.warn(serialized);
        return;
    }
    console.log(serialized);
};
exports.logger = {
    debug: (message, meta) => emit("debug", message, meta),
    info: (message, meta) => emit("info", message, meta),
    warn: (message, meta) => emit("warn", message, meta),
    error: (message, meta) => emit("error", message, meta),
};
//# sourceMappingURL=logger.js.map