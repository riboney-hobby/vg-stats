const {generateInserts} = require('./configs');

describe('Tests every insert function for simple mistakes (mispellings, wrong variables, etc)', () => {

    const csv = `54,Super Mario 3D Land,3DS,2011,Platform,Nintendo,4.89,2.99,2.13,0.78,10.79`;
    
    let csvObj;
    let expectedInsertsOrder;
    let insertsArr;

    beforeAll(() => {
        csvObj = {
            rank: '54',
            name: 'Super Mario 3D Land',
            platform: '3DS',
            year: '2011',
            genre: 'Platform',
            publisher: 'Nintendo',
            naSales: '4.89',
            euSales: '2.99',
            jpSales: '2.13',
            otherSales: '0.78',
            globalSales: '10.79'
        };

        insertsArr = generateInserts(csvObj).split(';');

        expectedInsertsOrder = new Map([
            ['genre', insertsArr[0]],
            ['platform', insertsArr[1]],
            ['publisher', insertsArr[2]],
            ['game', insertsArr[3]],
            ['gamePlat', insertsArr[4]],
            ['gamePub', insertsArr[5]],
            ['sales', insertsArr[6]],
        ]);
    });

    test('Generated genre insert statement is valid', () => {
        const raw = `
        INSERT OR IGNORE INTO genre
            (genre)
        VALUES
            ('Platform')`;
        
        const expected = raw.replace(/\s/g, '')
        const results = expectedInsertsOrder.get('genre').replace(/\s/g, '')

        expect(results).toEqual(expected);
    });

    test('Generated platform insert statement is valid', () => {
        const raw = `
        INSERT OR IGNORE INTO platform
            (platform)
        VALUES
            ('3DS')`;
        
        const expected = raw.replace(/\s/g, '')
        const results = expectedInsertsOrder.get('platform').replace(/\s/g, '')

        expect(results).toEqual(expected);
    });

    test('Generated publisher insert statement is valid', () => {
        const raw = `
        INSERT OR IGNORE INTO publisher
            (name)
        VALUES
            ('Nintendo')
        `
        
        const expected = raw.replace(/\s/g, '')
        const results = expectedInsertsOrder.get('publisher').replace(/\s/g, '')

        expect(results).toEqual(expected);
    });

    test('Generated game insert statement is valid', () => {
        const raw = `
        INSERT OR IGNORE INTO game
            (name, genre_id)
        VALUES
            (
                'Super Mario 3D Land',
                (
                    SELECT genre_id
                    FROM genre
                    WHERE genre = 'Platform'
                )
            )
        `
        
        const expected = raw.replace(/\s/g, '')
        const results = expectedInsertsOrder.get('game').replace(/\s/g, '')

        expect(results).toEqual(expected);
    });

    test('Generated game_plat_map insert statement is valid', () => {
        const raw = `
        INSERT INTO game_plat_map
            (game_id, platform_id, release_year)
        VALUES
            (
                (
                    SELECT game_id
                    FROM game
                    WHERE name = 'Super Mario 3D Land'
                ),
                (
                    SELECT platform_id
                    FROM platform
                    WHERE platform = '3DS'
                ),
                '2011'
            )
        `
        
        const expected = raw.replace(/\s/g, '')
        const results = expectedInsertsOrder.get('gamePlat').replace(/\s/g, '')

        expect(results).toEqual(expected);
    });

    test('Generated game_pub_map insert statement is valid', () => {
        const raw = `
        INSERT OR IGNORE INTO game_pub_map
            (game_id, publisher_id, release_year)
        VALUES
            (
                (
                    SELECT game_id
                    FROM game
                    WHERE name = 'Super Mario 3D Land'
                ),
                (
                    SELECT publisher_id
                    FROM publisher
                    WHERE name = 'Nintendo'
                ),
                '2011'
            )
        `
        
        const expected = raw.replace(/\s/g, '')
        const results = expectedInsertsOrder.get('gamePub').replace(/\s/g, '')

        expect(results).toEqual(expected);
    });

    test('Generated sales insert statement is valid', () => {
        const raw = `
        INSERT INTO sales
            (
                game_id, platform_id,  
                na_sales, eu_sales, 
                jp_sales, other_sales
            )
        VALUES 
            (
                (
                    SELECT v.game_id
                    FROM game v
                        INNER JOIN game_plat_map vp
                            ON v.game_id = vp.game_id
                        INNER JOIN platform p
                            ON p.platform_id = vp.platform_id
                    WHERE 
                        v.name = 'Super Mario 3D Land' AND
                        p.platform = '3DS' AND
                        vp.release_year = '2011'
                ),
                (
                    SELECT p.platform_id
                    FROM platform p
                        INNER JOIN game_plat_map vp
                            ON p.platform_id = vp.platform_id
                        INNER JOIN game v
                            ON v.game_id = vp.game_id
                    WHERE 
                        v.name = 'Super Mario 3D Land' AND
                        p.platform = '3DS' AND
                        vp.release_year = '2011'
                ),
                4.89, 2.99, 2.13, 0.78
            )
        `
        
        const expected = raw.replace(/\s/g, '')
        const results = expectedInsertsOrder.get('sales').replace(/\s/g, '')

        expect(results).toEqual(expected);
    });
})