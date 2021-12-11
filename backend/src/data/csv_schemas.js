const CSV_DTO = {
    rank: 0,
    name: '',
    platform: '',
    year: '',
    genre: '',
    publisher: '',
    naSales: 0,
    euSales: 0,
    jpSales: 0,
    otherSales: 0,
    globalSales: 0
};

const GENRE_DTO = {
    table: '',
    name: ''
};

const PUBLISHER_DTO = {
    table: '',
    name: ''
};

const PLATFORM_DTO = {
    table: '',
    name: ''
};

const VIDEOGAME_DTO = {
    table: '',
    name: '',
    pub: '',
    genre: ''
};

const VGPLATFORM_DTO = {
    table: '',
    vg: '',
    plat: '',
    year: ''
};

const SALES_DTO = {
    table: '',
    vg: '',
    plat: '',
    year: '',
    na: 0,
    eu: 0,
    jp: 0,
    other: 0
};

module.exports = {
    CSV_DTO,
    GENRE_DTO,
    PLATFORM_DTO,
    PUBLISHER_DTO,
    VIDEOGAME_DTO,
    VGPLATFORM_DTO,
    SALES_DTO
};