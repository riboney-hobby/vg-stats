// Contains some SQL-related code from previous version of app development where Sequelize was not present

// 
//  Tables Statements
// 

const GENRE_TABLE = 
`CREATE TABLE ${TBL.genre.table} (
    ${TBL.genre.id} INTEGER PRIMARY KEY,
    ${TBL.genre.genre} TEXT UNIQUE NOT NULL 
)`;

const PLATFORM_TABLE = 
`CREATE TABLE ${TBL.platform.table} (    
    ${TBL.platform.id} INTEGER PRIMARY KEY,
    ${TBL.platform.platform} TEXT UNIQUE NOT NULL 
)`;

const GAME_TABLE = 
`CREATE TABLE ${TBL.game.table} (
    ${TBL.game.id} INTEGER PRIMARY KEY,
    ${TBL.game.name} TEXT NOT NULL UNIQUE,
    ${TBL.game.genre_id} INTEGER,
    FOREIGN KEY (${TBL.game.genre_id}) REFERENCES ${TBL.genre.table} (${TBL.genre.id})
            ON UPDATE CASCADE
)`;

const PUBLISHER_TABLE = 
`CREATE TABLE ${TBL.publisher.table} (
    ${TBL.publisher.id} INTEGER PRIMARY KEY,
    ${TBL.publisher.name} TEXT UNIQUE NOT NULL
)`;

const SALES_TABLE = 
`CREATE TABLE ${TBL.sales.table} (
    ${TBL.sales.id} INTEGER PRIMARY KEY,
    ${TBL.sales.game_id} INTEGER,
    ${TBL.sales.plat_id} INTEGER,
    ${TBL.sales.na} INTEGER DEFAULT 0,
    ${TBL.sales.eu} INTEGER DEFAULT 0,
    ${TBL.sales.jp} INTEGER DEFAULT 0,
    ${TBL.sales.other} INTEGER DEFAULT 0,
    FOREIGN KEY (${TBL.sales.game_id}) REFERENCES ${TBL.game.table} (${TBL.game.id})
            ON UPDATE CASCADE
            ON DELETE CASCADE
    FOREIGN KEY (${TBL.sales.plat_id}) REFERENCES ${TBL.platform.table} (${TBL.platform.id})
            ON UPDATE CASCADE
            ON DELETE CASCADE
)`;

const GAME_PLATFORM_MAP_TABLE = 
`CREATE TABLE ${TBL.gameplat.table} (
    ${TBL.gameplat.game_id} INTEGER NOT NULL,
    ${TBL.gameplat.plat_id} INTEGER NOT NULL,
    ${TBL.gameplat.year} TEXT DEFAULT '9999',
    PRIMARY KEY (${TBL.gameplat.game_id}, ${TBL.gameplat.plat_id}, ${TBL.gameplat.year}),
    FOREIGN KEY (${TBL.gameplat.game_id})
        REFERENCES ${TBL.game.table} (${TBL.game.id})
            ON DELETE CASCADE,
    FOREIGN KEY (${TBL.gameplat.plat_id})
        REFERENCES ${TBL.platform.table} (${TBL.platform.id})
            ON DELETE CASCADE
)`;

const GAME_PUBLISHER_MAP_TABLE =
`CREATE TABLE ${TBL.gamepub.table} (
    ${TBL.gamepub.game_id} INTEGER NOT NULL,
    ${TBL.gamepub.pub_id} INTEGER NOT NULL,
    ${TBL.gamepub.year} TEXT DEFAULT '9999',
    PRIMARY KEY (${TBL.gamepub.game_id}, ${TBL.gamepub.pub_id}, ${TBL.gamepub.year}),
    FOREIGN KEY (${TBL.gamepub.game_id})
        REFERENCES ${TBL.game.table} (${TBL.game.id})
            ON DELETE CASCADE,
    FOREIGN KEY (${TBL.gamepub.pub_id})
        REFERENCES ${TBL.publisher.table} (${TBL.publisher.id})
            ON DELETE CASCADE
)`;

const CREATE_TABLE_STMTS = [
    GENRE_TABLE,
    PLATFORM_TABLE,
    GAME_TABLE,
    PUBLISHER_TABLE,
    SALES_TABLE,
    GAME_PLATFORM_MAP_TABLE,
    GAME_PUBLISHER_MAP_TABLE
];

//
// Insert Statements
//


const genreInsert = function(csv){
    return `
    INSERT OR IGNORE INTO ${TBL.genre.table}
        (${TBL.genre.genre})
    VALUES
        ('${csv.genre}');
    `
}

const platformInsert = function(csv){
    return `
    INSERT OR IGNORE INTO ${TBL.platform.table}
        (${TBL.platform.platform})
    VALUES
        ('${csv.platform}');
    `
}

const gameInsert = function(csv){
    return `
    INSERT OR IGNORE INTO ${TBL.game.table}
        (${TBL.game.name}, ${TBL.game.genre_id})
    VALUES
        (
            '${csv.name}',
            (
                SELECT ${TBL.genre.id}
                FROM ${TBL.genre.table}
                WHERE ${TBL.genre.genre} = '${csv.genre}'
            )
        );
    `
}

const publisherInsert = function(csv){
    return `
    INSERT OR IGNORE INTO ${TBL.publisher.table}
        (${TBL.publisher.name})
    VALUES
        ('${csv.publisher}');
    `
}

const salesInsert = function(csv){
    return `
    INSERT INTO ${TBL.sales.table}
        (${TBL.sales.game_id}, ${TBL.sales.plat_id}, ${TBL.sales.na}, ${TBL.sales.eu}, ${TBL.sales.jp}, ${TBL.sales.other})
    VALUES 
        (
            (
                SELECT v.${TBL.game.id}
                FROM ${TBL.game.table} v
                    INNER JOIN ${TBL.gameplat.table} vp
                        ON v.${TBL.game.id} = vp.${TBL.gameplat.game_id}
                    INNER JOIN ${TBL.platform.table} p
                        ON p.${TBL.platform.id} = vp.${TBL.gameplat.plat_id}
                WHERE 
                    v.${TBL.game.name} = '${csv.name}' AND
                    p.${TBL.platform.platform} = '${csv.platform}' AND
                    vp.${TBL.gameplat.year} = '${csv.year}'
            ),
            (
                SELECT p.${TBL.platform.id}
                FROM ${TBL.platform.table} p
                    INNER JOIN ${TBL.gameplat.table} vp
                        ON p.${TBL.platform.id} = vp.${TBL.gameplat.plat_id}
                    INNER JOIN ${TBL.game.table} v
                        ON v.${TBL.game.id} = vp.${TBL.gameplat.game_id}
                WHERE 
                    v.${TBL.game.name} = '${csv.name}' AND
                    p.${TBL.platform.platform} = '${csv.platform}' AND
                    vp.${TBL.gameplat.year} = '${csv.year}'
            ),
            ${csv.naSales}, ${csv.euSales}, ${csv.jpSales}, ${csv.otherSales}
        );
    `
}

const gamePublisherInsert = function(csv){

    return `
    INSERT OR IGNORE INTO ${TBL.gamepub.table}
        (${TBL.gamepub.game_id}, ${TBL.gamepub.pub_id}, ${TBL.gamepub.year})
    VALUES
        (
            (
                SELECT ${TBL.game.id}
                FROM ${TBL.game.table}
                WHERE ${TBL.game.name} = '${csv.name}'
            ),
            (
                SELECT ${TBL.publisher.id}
                FROM ${TBL.publisher.table}
                WHERE ${TBL.publisher.name} = '${csv.publisher}'
            ),
            '${csv.year}'
        );
    `
}

const gamePlatformInsert = function(csv){
    return `
    INSERT INTO ${TBL.gameplat.table}
        (${TBL.gameplat.game_id}, ${TBL.gameplat.plat_id}, ${TBL.gameplat.year})
    VALUES
        (
            (
                SELECT ${TBL.game.id}
                FROM ${TBL.game.table}
                WHERE ${TBL.game.name} = '${csv.name}'
            ),
            (
                SELECT ${TBL.platform.id}
                FROM ${TBL.platform.table}
                WHERE ${TBL.platform.platform} = '${csv.platform}'
            ),
            '${csv.year}'
        );
    `
}
