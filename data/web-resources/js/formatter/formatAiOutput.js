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
        const itemsOrder = Array.isArray(formattersOverride?._order) ? formattersOverride?._order : Object.keys(content);

        return itemsOrder.map((key) => {
            if (typeof key !== "string") return '';

            const value = content[key];
            const newFormatters = key in (formattersOverride ?? {}) ? formattersOverride[key] : null;

            return formatAiOutput(value, newFormatters);
        }).join('');
    }

    return '';
}