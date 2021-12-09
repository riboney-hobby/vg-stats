const fileUtils = require('../file-utills');

test('Tests getProjectRootDir()', () => {
    const result = fileUtils.getProjectRootDir();
    expect(result).toBe('~/home/ribba/prog/vg-stats/backend');
})
