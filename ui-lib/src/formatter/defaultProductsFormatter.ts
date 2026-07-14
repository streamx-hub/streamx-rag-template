import type { Formatter } from './formatAiOutput';

function formatMoney(
    price: number,
    locale: Intl.LocalesArgument = 'en-Us',
    currency: string = 'USD',
) {
    const moneyFormatter = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
    });
    return moneyFormatter.format(price);
}

interface CategoryItemSchema {
    id: string;
    slug: string;
    name: string;
    label: string;
    subcategories: { label: string; value: string }[];
}

interface AttributeItemSchema {
    name: string;
    label: string;
    values: { label: string; value: string }[];
}

interface ProductItemSchema {
    id: string;
    sku: string;
    name: string;
    label: string;
    description: string;
    slug: string;
    quantity: number;
    price: {
        value: number;
        discountedValue: number;
    },
    primaryImage: {
        url: string;
        alt: string;
    },
    categories: CategoryItemSchema[],
    attributes: AttributeItemSchema[],
}

export interface ProductsSchema {
    message: string;
    products: ProductItemSchema[];
}

export const defaultProductsFormatter: Formatter<ProductsSchema> = {
    message: (v) => `${v}\n\n`,
    products: {
        _order: ['sku', 'label', 'slug', 'price', 'primaryImage', 'categories', 'attributes', 'quantity', 'description'],
        slug: (slug) => `slug: <a href="${slug}">/${slug}</a><br/>`,
        quantity: (v) => `Quantity: ${v}\n`,
        label: (v) => `<strong>${v}</strong><br/>`,
        price: (v) =>
            `Price: <span style="text-decoration: line-through">${formatMoney(v.value)}</span> ${formatMoney(v.discountedValue)}<br/>`,
        primaryImage: (v) => `<img src="${v.url}" alt="${v.alt}" style="width: 100%; height: 100%; object-fit: contain;" /><br/>`,
        categories: (v) => `Categories: ${v.map((item) => item.label).join(', ')}\n`,
        attributes: (attributes) =>
            `${attributes.map((attribute) => {
                return `${attribute.label}: ${attribute.values.map((value) => value.label).join(', ')}`;
            }).join('\n')}\n`
    }
}