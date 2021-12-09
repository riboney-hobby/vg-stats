const fileUtils = require('../file-utils');

test('Tests getProjectRootDir()', () => {
    const result = fileUtils.getProjectRootDir();
    expect(result).toBe('/home/ribba/prog/vg-stats/backend');
})
