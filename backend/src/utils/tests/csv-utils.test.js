const tokenizer = require('../csv-utils');

const targetCount = 11;

test('Handles normal CSV line', () => {
    const line = `547,Assassin Creed IV: Black Flag,PS4,2013,Action,Ubisoft,1.07,1.31,0.06,0.31,2.74`;
    const expected = ['547', 'Assassin Creed IV: Black Flag', 'PS4', '2013', 'Action', 'Ubisoft', '1.07', '1.31', '0.06', '0.31', '2.74'];
    const results = tokenizer(line, targetCount);

    expect(results).toEqual(expected);
})

test('Handles commas within double quotes correctly', () => {
    const line = `945,"Hey You, Pikachu!",N64,1998,Simulation,Nintendo,0.83,0.06,0.93,0,1.83`;
    const expected = ['945', '"Hey You, Pikachu!"', 'N64', '1998', 'Simulation', 'Nintendo','0.83', '0.06', '0.93', '0', '1.83'] 
    const results = tokenizer(line, targetCount);

    expect(results).toEqual(expected);
})

test('Handles single quotes correctly', () => {
    const line = `1618,Disney's Tarzan / Disney's Aladdin in Nasira's Revenge / Disney's The Emperor's New Groove Action Game,PS,2003,Misc,Sony Computer Entertainment,0.69,0.47,0,0.08,1.23`;
    const expected = ['1618', `Disney''s Tarzan / Disney''s Aladdin in Nasira''s Revenge / Disney''s The Emperor''s New Groove Action Game`, 'PS', '2003', 'Misc', 'Sony Computer Entertainment','0.69', '0.47', '0', '0.08', '1.23'] 
    const results = tokenizer(line, targetCount);

    expect(results).toEqual(expected);
})


