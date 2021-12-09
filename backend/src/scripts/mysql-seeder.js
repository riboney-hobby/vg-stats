// Create new file: ../../res/sqlite-init.sql
//   - check if already exists
//     - exec if already exists
//     - exit program
// Get filepath to data source (through env variables)
//   - Verify file exist, if not exit
// Create dataobject to represent CSV file table (columns are property names)
// Open write stream to sql file and write the CREATE TABLE statements into it 
// Open read stream on data source
// Ignore first line in data source
// Read into memory each line upto newline character
// Split values into array, separated by commmas 
//   - check if values.length = dataobject.keys.length
//     - false: throw error('data format not correct!')
//     - true: initialize dataobject with values in array
// Generate INSERT query string with values from the dataobject
// Write INSERT query string to sql file
// Repeat until EOL reached
// Execute SQL file