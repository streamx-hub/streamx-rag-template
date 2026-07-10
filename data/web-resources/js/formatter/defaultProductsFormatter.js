function formatMoney(
    price,
    locale = 'en-Us',
    currency = 'USD',
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
        id: () => '',
        name: () => '',
        slug: (slug) => `slug: <a href="${slug}">/${slug}</a><br />`,
        quantity: (v) => `Quantity: ${v}\n`,
        label: (v) => `<strong>${v}</strong><br />`,
        price: (v) =>
            `Price: <span style="text-decoration: line-through">${formatMoney(v.value)}</span> ${formatMoney(v.discountedValue)}<br/>`,
        primaryImage: (v) => `<img src="${v.url}" alt="${v.alt}" /><br />`,
        categories: (v) => `Categories: ${v?.map((item) => item?.label)?.join(', ')}\n`,
        attributes: (attributes) =>
            `${attributes?.map((attribute) => {
                return `${attribute?.label}: ${attribute?.values?.map((value) => value?.label).join(', ')}`;
            }).join('\n')}\n`
    }
}