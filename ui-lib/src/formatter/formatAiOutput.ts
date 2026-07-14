type FormatterFunction<T> = (value: T) => string;

type FormatterObject<T> = {
    [K in keyof T]?: Formatter<T[K]>;
};

export type Formatter<T> =
    T extends Array<infer U>
        ? FormatterFunction<T> | (FormatterObject<U> & { _order?: Array<keyof U & string> })
        : T extends object
            ? FormatterFunction<T> | (FormatterObject<T> & { _order?: Array<keyof T & string> })
            : FormatterFunction<T>;

export function formatAiOutput<T>(content: T, formattersOverride?: Formatter<T>): string {
    if (content === null || content === undefined) {
        return '';
    }

    if (typeof formattersOverride === "function") {
        return formattersOverride(content);
    }

    if (typeof content === "string" || typeof content === "number" || typeof content === "boolean") {
        return `${content}\n`;
    }

    if (Array.isArray(content)) {
        return content.map((item) => {
            return formatAiOutput(item, formattersOverride);
        }).join('\n');
    }

    if (typeof content === "object") {
        const itemsOrder = Array.isArray(formattersOverride?._order) ? formattersOverride?._order : Object.keys(content);

        return itemsOrder.map((key: string) => {
            const value = (content as Record<string, any>)[key];
            const formattersObj = formattersOverride || {} as Record<string, any>;
            const nextFormatter = formattersObj[key];

            return formatAiOutput(value, nextFormatter);
        }).join('');
    }

    return '';
}