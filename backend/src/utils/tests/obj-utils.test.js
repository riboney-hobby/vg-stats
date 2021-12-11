const o = require('../obj-utils');

describe('tests mapValuesToObject()', () => {
    test('Expected error thrown when amt of values != amt of schema props', () => {
        const schema = {1: 1, 2: 2, 3: 3};
        const values = [1, 2];

        const test = () => {
            o.mapValuesToObject(values, schema);
        };

        expect(test).toThrow('Invalid arguments provided!');
    });

    test('Expected error thrown when schema is not provided', () => {
        const values = [1, 2];

        const test = () => {
            o.mapValuesToObject(values);
        };

        expect(test).toThrow('Invalid arguments provided!');
    });

    test('Expected error thrown when values is not provided', () => {
        const schema = {1: 1, 2: 2, 3: 3};

        const test = () => {
            o.mapValuesToObject(schema);
        };

        expect(test).toThrow('Invalid arguments provided!');
    });

    test('Return object with values mapped from array', () => {
        const schema = {a: '', b: '', c: ''};
        const values = ['a', 'b', 'c']

        const results = o.mapValuesToObject(values, schema);

        expect(results).toEqual({a: 'a', b: 'b', c: 'c'});
    })
});