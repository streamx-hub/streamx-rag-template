import { describe, it, expect } from 'vitest';
import { formatAiOutput, type Formatter } from '../formatter/formatAiOutput.ts';
import { defaultProductsFormatter, type ProductsSchema } from '../formatter/defaultProductsFormatter.ts';

describe('formatAiOutput', () => {
    it('should correctly map output for simple object without any formatters', () => {
        const schema = {
            name: 'table',
            label: 'Table',
            quantity: 12,
            isExpired: false,
            metadata: undefined,
            details: null,
        }
        const result = formatAiOutput(schema);

        const expected = [
            'table',
            'Table',
            '12',
            'false',
            ''
        ].join('\n');
        expect(result).toEqual(expected);
    });

    it('should correctly map output for simple object with formatters', () => {
        const schema = {
            name: 'table',
            label: 'Table',
            price: 12,
            isExpired: false,
            metadata: undefined,
            details: null,
        }
        const formatter: Formatter<typeof schema> = {
            label: (v) => `Formatted label: ${v}\n`,
            price: (v) => `Price: $${v.toFixed(2)}\n`,
        }
        const result = formatAiOutput(schema, formatter);

        const expected = [
            'table',
            'Formatted label: Table',
            'Price: $12.00',
            'false',
            ''
        ].join('\n');
        expect(result).toEqual(expected);
    });

    it('should correctly map output for simple object with formatters and display fields only from defined order', () => {
        const schema = {
            category: 'Home',
            price: 12,
            isExpired: false,
            metadata: undefined,
            slug: '/table',
            quantity: 12,
            label: 'Table',
            details: null,
        }
        const formatter: Formatter<typeof schema> = {
            _order: ['label', 'slug', 'price', 'isExpired'],
            label: (v) => `Formatted label: ${v}\n`,
            price: (v) => `Price: $${v.toFixed(2)}\n`,
            isExpired: (v) => `is expired: ${v}\n`,
        }
        const result = formatAiOutput(schema, formatter);

        const expected = [
            'Formatted label: Table',
            '/table',
            'Price: $12.00',
            'is expired: false',
            ''
        ].join('\n');
        expect(result).toEqual(expected);
    });

    describe('nested object field', () => {
        it('should correctly map output for nested object without any formatters', () => {
            const schema = {
                name: 'Table',
                quantity: 12,
                details: {
                    width: 240,
                    length: 240,
                    material: 'wood',
                    isOnSale: true,
                    metadata: undefined,
                    details: null,
                },
            }
            const result = formatAiOutput(schema);

            const expected = [
                'Table',
                '12',
                '240',
                '240',
                'wood',
                'true',
                ''
            ].join('\n');
            expect(result).toEqual(expected);
        });

        it('should correctly map output for nested object with formatting function for whole field', () => {
            const schema = {
                name: 'Table',
                quantity: 12,
                details: {
                    width: 120,
                    length: 240,
                    height: 90,
                    material: 'wood',
                    isOnSale: true,
                    metadata: undefined,
                    other: null,
                },
            }
            const formatter: Formatter<typeof schema> = {
                quantity: (v) => `Quantity: ${v}\n`,
                details: (v) =>
                    `<em>on sale: ${v.isOnSale}</em> Material: ${v.material} Size: ${v.width}cm x ${v.length}cm x ${v.height}cm`
            }
            const result = formatAiOutput(schema, formatter);

            const expected = [
                'Table',
                'Quantity: 12',
                '<em>on sale: true</em> Material: wood Size: 120cm x 240cm x 90cm'
            ].join('\n');
            expect(result).toEqual(expected);
        });

        it('should correctly map output for nested object field with formatting functions for nested fields', () => {
            const schema = {
                name: 'Table',
                quantity: 12,
                details: {
                    width: 120,
                    length: 240,
                    height: 90,
                    material: 'wood',
                    isOnSale: true,
                    metadata: undefined,
                    other: null,
                },
            }
            const formatter: Formatter<typeof schema> = {
                quantity: (v) => `Quantity: ${v}\n`,
                details: {
                    width: (v) => `Width: ${v}cm `,
                    length: (v) => `Length: ${v}cm `,
                    height: (v) => `Height: ${v}cm\n`,
                    material: (v) => `Material: ${v}\n`,
                    isOnSale: (v) => `isOnSale: ${v}`,
                }
            }
            const result = formatAiOutput(schema, formatter);

            const expected = [
                'Table',
                'Quantity: 12',
                'Width: 120cm Length: 240cm Height: 90cm',
                'Material: wood',
                'isOnSale: true'
            ].join('\n');
            expect(result).toEqual(expected);
        });

        it('should correctly map output for nested object field with formatting functions for nested fields and display fields only from defined order', () => {
            const schema = {
                name: 'Table',
                quantity: 12,
                details: {
                    width: 120,
                    length: 240,
                    height: 90,
                    material: 'wood',
                    isOnSale: true,
                    metadata: undefined,
                    other: null,
                },
            }
            const formatter: Formatter<typeof schema> = {
                quantity: (v) => `Quantity: ${v}\n`,
                details: {
                    _order: ['material', 'height', 'width', 'length'],
                    width: (v) => `Width: ${v}cm\n`,
                    length: (v) => `Length: ${v}cm\n`,
                    height: (v) => `Height: ${v}cm\n`,
                    material: (v) => `Material: ${v}\n`,
                }
            }
            const result = formatAiOutput(schema, formatter);

            const expected = [
                'Table',
                'Quantity: 12',
                'Material: wood',
                'Height: 90cm',
                'Width: 120cm',
                'Length: 240cm',
                ''
            ].join('\n');
            expect(result).toEqual(expected);
        });
    });

    describe('array field in object', () => {
        it('should correctly map object array field without any formatters', () => {
            const schema = {
                name: 'Table',
                categories: ['Living room', 'Dining room', 'Kitchen'],
            }
            const result = formatAiOutput(schema);

            const expected = [
                'Table',
                'Living room',
                '',
                'Dining room',
                '',
                'Kitchen',
                ''
            ].join('\n');
            expect(result).toEqual(expected);
        });

        it('should correctly map object array field with formatting function for whole field', () => {
            const schema = {
                name: 'Table',
                categories: ['Living room', 'Dining room', 'Kitchen'],
            }
            const formatter: Formatter<typeof schema> = {
                categories: (v) => `Categories: ${v.join(', ')}\n`
            }
            const result = formatAiOutput(schema, formatter);

            const expected = [
                'Table',
                'Categories: Living room, Dining room, Kitchen',
                ''
            ].join('\n');
            expect(result).toEqual(expected);
        });

        it('should correctly map array of objects field without any formatters', () => {
            const schema = {
                name: 'Table',
                attributes: [
                    { label: 'Material', value: 'wood' },
                    { label: 'Size', value: 'small' },
                ],
            }
            const result = formatAiOutput(schema);

            const expected = [
                'Table',
                'Material',
                'wood',
                '',
                'Size',
                'small',
                ''
            ].join('\n');
            expect(result).toEqual(expected);
        });

        it('should correctly map array of objects field with formatters and order', () => {
            const schema = {
                name: 'Table',
                attributes: [
                    { value: 'wood', label: 'Material', other: 'other' },
                    { value: 'small', label: 'Size', other: 'other' },
                ],
            }
            const formatter: Formatter<typeof schema> = {
                attributes: {
                    _order: ['label', 'value'],
                    value: (v) => `${v.toUpperCase()}\n`
                }
            }
            const result = formatAiOutput(schema, formatter);

            const expected = [
                'Table',
                'Material',
                'WOOD',
                '',
                'Size',
                'SMALL',
                ''
            ].join('\n');
            expect(result).toEqual(expected);
        });
    });

    it('should correctly map output with multiple different type of fields', () => {
        const schema: ProductsSchema = {
            "message": "Here are some tables you might be interested in:",
            "products": [
                {
                    "id": "1",
                    "sku": "FT123",
                    "name": "Folding Table",
                    "label": "Folding Table",
                    "description": "A versatile folding table, perfect for extra seating or compact spaces.",
                    "slug": "folding-table",
                    "quantity": 10,
                    "price": {
                        "value": 49.99,
                        "discountedValue": 39.99
                    },
                    "primaryImage": {
                        "url": "https://example.com/images/folding-table.jpg",
                        "alt": "Folding Table"
                    },
                    "attributes": [
                        {
                            "name": "material",
                            "label": "Material",
                            "values": [
                                {
                                    "label": "Plastic",
                                    "value": "plastic"
                                }
                            ]
                        }
                    ],
                    "categories": [
                        {
                            "id": "c1",
                            "slug": "tables",
                            "name": "Tables",
                            "label": "Tables",
                            "subcategories": []
                        }
                    ]
                },
                {
                    "id": "2",
                    "sku": "CT456",
                    "name": "Coffee Table",
                    "label": "Coffee Table",
                    "description": "A stylish coffee table, perfect for your living room.",
                    "slug": "coffee-table",
                    "quantity": 5,
                    "price": {
                        "value": 89.99,
                        "discountedValue": 79.99
                    },
                    "primaryImage": {
                        "url": "https://example.com/images/coffee-table.jpg",
                        "alt": "Coffee Table"
                    },
                    "attributes": [
                        {
                            "name": "material",
                            "label": "Material",
                            "values": [
                                {
                                    "label": "Wood",
                                    "value": "wood"
                                }
                            ]
                        }
                    ],
                    "categories": [
                        {
                            "id": "c1",
                            "slug": "tables",
                            "name": "Tables",
                            "label": "Tables",
                            "subcategories": []
                        }
                    ]
                },
                {
                    "id": "3",
                    "sku": "CF789",
                    "name": "Casual Farmhouse Wood Dining Table",
                    "label": "Casual Farmhouse Wood Dining Table",
                    "description": "A farmhouse-style dining table that extends from 54\" to 72\" wide.",
                    "slug": "casual-farmhouse-wood-dining-table",
                    "quantity": 3,
                    "price": {
                        "value": 299.99,
                        "discountedValue": 279.99
                    },
                    "primaryImage": {
                        "url": "https://example.com/images/farmhouse-dining-table.jpg",
                        "alt": "Casual Farmhouse Wood Dining Table"
                    },
                    "attributes": [
                        {
                            "name": "material",
                            "label": "Material",
                            "values": [
                                {
                                    "label": "Birch",
                                    "value": "birch"
                                }
                            ]
                        }
                    ],
                    "categories": [
                        {
                            "id": "c1",
                            "slug": "tables",
                            "name": "Tables",
                            "label": "Tables",
                            "subcategories": []
                        }
                    ]
                }
            ]
        };

        const formatter: Formatter<ProductsSchema> = { ...defaultProductsFormatter };

        const result = formatAiOutput(schema, formatter);

        const firstTableHtml = [
            '<strong>Folding Table</strong>',
            'slug: <a href="folding-table">/folding-table</a>',
            'Price: <span style="text-decoration: line-through">$49.99</span> $39.99',
            '<img src="https://example.com/images/folding-table.jpg" alt="Folding Table" width="60" height="60" />',
            'Categories: Tables'
        ].join('<br/>');

        const secondTableHtml = [
            '<strong>Coffee Table</strong>',
            'slug: <a href="coffee-table">/coffee-table</a>',
            'Price: <span style="text-decoration: line-through">$89.99</span> $79.99',
            '<img src="https://example.com/images/coffee-table.jpg" alt="Coffee Table" width="60" height="60" />',
            'Categories: Tables'
        ].join('<br/>');

        const thirdTableHtml = [
            '<strong>Casual Farmhouse Wood Dining Table</strong>',
            'slug: <a href="casual-farmhouse-wood-dining-table">/casual-farmhouse-wood-dining-table</a>',
            'Price: <span style="text-decoration: line-through">$299.99</span> $279.99',
            '<img src="https://example.com/images/farmhouse-dining-table.jpg" alt="Casual Farmhouse Wood Dining Table" width="60" height="60" />',
            'Categories: Tables'
        ].join('<br/>');

        const expected = [
            'Here are some tables you might be interested in:',
            '',
            'FT123',
            firstTableHtml,
            'Material: Plastic',
            'Quantity: 10',
            'A versatile folding table, perfect for extra seating or compact spaces.',
            '',
            'CT456',
            secondTableHtml,
            'Material: Wood',
            'Quantity: 5',
            'A stylish coffee table, perfect for your living room.',
            '',
            'CF789',
            thirdTableHtml,
            'Material: Birch',
            'Quantity: 3',
            'A farmhouse-style dining table that extends from 54" to 72" wide.',
            ''
        ].join('\n');
        expect(result).toEqual(expected);
    });
});