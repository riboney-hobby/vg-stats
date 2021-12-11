function CSVLineTokenizer(){}

/**
 * Converts raw CSV line into String array of items; Main method of class
 * 
 * @param {String} line - Single raw CSV line in UTF-8 format
 * @param {*} targetCount - Specified number of values in a CSV data line 
 * @returns {String[]} - Array of transformed CSV data items in String format
 */
CSVLineTokenizer.prototype.tokenize = function(line, targetCount){
    const rawTokens = line.split(',');
    const tokenCount = rawTokens.length;
    const countIsValid = this._verifyCount(tokenCount, targetCount);

    return this._transformSingleQuotes(countIsValid ? rawTokens: this._fixTokens(rawTokens));
}

/**
 * Counts number of items in CSV line
 * 
 * @param {Number} actual - The number of values in line CSV line
 * @param {*} expected - The number of values specified by CSV dataset
 * @returns {Boolean} - True if count is correct, False if more than expected, Error if less than expected
 */
 CSVLineTokenizer.prototype._verifyCount = function(actual, expected){
    if(actual < expected) 
        throw new Error('Invalid data! Number of values provided less the specified amount!');
        
    return actual == expected ? true:false;
}

// Example use case: 
//   Original: "Hey You, Pikachu!"
//   Before: ['"Hey You ','Pikachu!"']
//   After:  ['"Hey You, Pickachu!"']
// This function assumes double quotes are in pairs
/**
 * Fixes errors from splitting line by commas when commas are encountered within double-quotes (that should be ignored)
 * 
 * @param {String[]} rawTokens - tokens that were incorrectly split and have had their commas removed
 * @returns {String[]} - array of rejoined and comma-restored string values
 */
 CSVLineTokenizer.prototype._fixTokens = function(rawTokens) {
    let arr = [...rawTokens];
    const doubleQuote = '"';

    for(let i = 0; i<arr.length; i++){
        if(arr[i].startsWith(doubleQuote)) {
            do{
                /*Rejoin*/ arr[i] = arr[i].concat('', ',' + arr[i+1]); 
                /*Remove*/ arr.splice(i+1, 1);
            } while(!arr[i].endsWith(doubleQuote))
        }
    }
    return arr;
}

/**
 * Sanitizes single quotes to prevent SQL errors
 * 
 * @param {String[]} rawTokens - CSV line items whose single-quotes haven't been transformed
 * @returns {String[]} - Array of items where all single-quotes have been replaced by double single-quotes
 */
CSVLineTokenizer.prototype._transformSingleQuotes = function(rawTokens){
    const singleQuote = "'";
    const doubledUpSingleQuotes = "''";

    return rawTokens.map(item => !item.includes(singleQuote) ? 
        item : item.replaceAll(singleQuote, doubledUpSingleQuotes))
}

module.exports = function main(line, targetCount){
    const t = new CSVLineTokenizer();
    return t.tokenize(line,targetCount);
}
