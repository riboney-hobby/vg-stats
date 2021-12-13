const {checkArgsAreMissing} = require('../misc-utils');

describe('missingArgsChecker test suite', () => {
  const msg = 'Missing args!';
  const falsyNumber = 0;
  const falsyString = '';
  const falsyArgNull = null;
  const missingArgUndef = undefined;

  test('Produces expected error when supplied with undefined', () => {
    
    const results = () => checkArgsAreMissing(msg, missingArgUndef);
    expect(results).toThrow(msg);
  });

  test('Produces expected error when supplied with falsy number', () => {
    
    const results = () => checkArgsAreMissing(msg, missingNumber);
    expect(results).toThrow(msg);
  });
})