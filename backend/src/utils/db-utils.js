function _makeTableExtractor(beg, end){
  
  return function(stmt){

    const indexOfResult = 1;
    let results;
    
    try{
      const rgx = new RegExp(`(?:${beg})(.*)?${end}`);
      const results = stmt.match(rgx)[indexOfResult]

      return results ? results.trim(): '';
    } catch(err){
        if(err.name === 'SyntaxError') console.log('Error in RegExp pattern!')
        else throw err;
    }

    return results;
  }
}

const getTableFromCreate = _makeTableExtractor('CREATE TABLE', '\\(');
const getTableFromInsert = _makeTableExtractor('INSERT INTO |INSERT OR IGNORE INTO ', '(\\n|\\()')
const getTableFromDrop = _makeTableExtractor('DROP TABLE IF EXISTS |DROP TABLE ','');


module.exports = {
  getTableFromCreate,
  getTableFromInsert,
  getTableFromDrop
}