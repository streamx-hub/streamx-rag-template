// TODO: Add function that first sorts fields in exact order

export function formatAiOutput(content, formattersOverride) {
    if (typeof formattersOverride === "function") {
        return formattersOverride(content);
    }

    if (typeof content === "string") {
        return `${content}\n`;
    }

    if (typeof content === "number") {
        return `${content}\n`;
    }

    if (Array.isArray(content)) {
        return content.map((item) => {
            return formatAiOutput(item, formattersOverride);
        }).join('\n');
    }

    if (typeof content === "object") {
        return Object.entries(content).map(([key, value]) => {
            const newFormatters = key in (formattersOverride ?? {}) ? formattersOverride[key] : null;
            return formatAiOutput(value, newFormatters);
        }).join('');
    }

    return '';
}