function mapValuesToObject (values, schema){
    if(!schema || !values || (Object.entries(schema)).length !== values.length)
        throw new Error('Invalid arguments provided!');
    
    const obj = Object.assign(schema);
    let index = 0;

    for(let [key, value] of Object.entries(obj)){
        value = values[index];
        obj[`${key}`] = values[index];
        index++;
    }

    return obj;
}

module.exports = {
    mapValuesToObject,
}