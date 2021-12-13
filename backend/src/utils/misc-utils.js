function displayElapsedTime(start){
    let end = Date.now();
    let unformattedTime = (end - start)/1000
    // src: https://stackoverflow.com/a/11832950
    let formattedTime = Math.round((unformattedTime + Number.EPSILON) * 100)/100;
    
    console.log(`Execution time: (${formattedTime}) seconds`)
}

/**
 * Utility method for generating some letter given number of times
 * 
 * @param {string} character - the character to generate
 * @param {string} separator- the character to separate the generated characters between first and last characters
 * @param {number} amount - Amount of characters to generate
 * @returns {string} - String containing amount number of given characters
 */
 function generateCharacters (character, seperator = ',', amount) {
    let result = ''

    for(let i = 0; i<amount-1; i++) {
        result = result.concat(' ', `${character}${seperator}`);
    }

    // end of generated characters
    return result.concat(' ', `${character}`)
}

function checkArgsAreMissing(errMsg, ...valuesToCheck){
    // some() will break out of forEach loop upon the first falsy value found
    // forEach() would iterate through all values first and then return falsy or not
    // const missing = valuesToCheck.some(val => !val)
    const missing = valuesToCheck.some(val => val === undefined)
    if(missing) throw new Error(errMsg);
}

module.exports = {
    displayElapsedTime,
    generateCharacters,
    checkArgsAreMissing
};