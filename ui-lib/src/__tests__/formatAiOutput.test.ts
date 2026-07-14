import { describe, it } from 'vitest';
// import { formatAiOutput } from '../formatter/formatAiOutput.ts';
// import { defaultProductsFormatter } from '../formatter/defaultProductsFormatter.ts';

describe('formatAiOutput', () => {
    it.todo('should correctly map output for simple object without any formatters');
    it.todo('should correctly map output for simple object with formatters');
    it.todo('should correctly map output for simple object with formatters and defined order');

    describe('nested object field', () => {
        it.todo('should correctly map output for nested object without any formatters');
        it.todo('should correctly map output for nested object with formatting function for whole field');
        it.todo('should correctly map output for nested object with formatting functions for nested object fields');
        it.todo('should correctly map output for nested object with formatting functions for nested object fields and defined order');
    })

    describe('array field in object', () => {
        it.todo('should correctly map object array field without any formatters');
        it.todo('should correctly map object array field with formatting function for whole field');
        it.todo('should correctly array of objects field');
    });

    it.todo('should correctly map output with multiple different type of fields');
});