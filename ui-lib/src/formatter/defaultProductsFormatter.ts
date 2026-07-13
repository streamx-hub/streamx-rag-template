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

export const defaultProductsFormatter = {
    message: (v) => `${v}\n\n`,
    products: {
        _order: ['sku', 'label', 'slug', 'price', 'primaryImage', 'categories', 'attributes', 'quantity', 'description'],
        slug: (slug) => `slug: <a href="${slug}">/${slug}</a><br />`,
        quantity: (v) => `Quantity: ${v}\n`,
        label: (v) => `<strong>${v}</strong><br />`,
        price: (v) =>
            `Price: <span style="text-decoration: line-through">${formatMoney(v.value)}</span> ${formatMoney(v.discountedValue)}<br/>`,
        primaryImage: (v) => `<img src="${v.url}" alt="${v.alt}" width="60" height="60" /><br />`,
        categories: (v) => `Categories: ${v?.map((item) => item?.label)?.join(', ')}\n`,
        attributes: (attributes) =>
            `${attributes?.map((attribute) => {
                return `${attribute?.label}: ${attribute?.values?.map((value) => value?.label).join(', ')}`;
            }).join('\n')}\n`
    }
}