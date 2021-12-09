const path = require('path');

// src: https://stackoverflow.com/a/50052194
/**
 * Returns the absolute path to the project root directory
 * @param {string} [rootDirName='backend'] - The name of the root folder of the project
 * @return {string} Absolute path of the project root directory
 * @example
 * rootDir(); // returns /home/risbah/todo_app/backend 
 */
function getProjectRootDir(rootDirectoryName = 'backend'){
    const currentDirAbsFilepath = path.join('~', __dirname);
    const isThisAlreadyInRootDir = currentDirAbsFilepath.endsWith(rootDirectoryName);

    return isThisAlreadyInRootDir ? 
        currentDirAbsFilepath :  _transformPath(rootDirectoryName, currentDirAbsFilepath);
}

/**
 * This method cuts off extraneous file paths from absolute path of project root directory
 * @private
 * @param {string} rootDirName - project root directory name
 * @param {string} fullPathToDirOfFile - absolute path to the invoking function's file
 * @return {string} absolute path of root project directory
 * @example
 * cutAfterRootDir("backend", "/home/documents/backend/project/backend/src/utils"); 
 * // returns /home/documents/backend/project/backend
 * 
 */
function _transformPath(rootDirName, filePath){
    const arr = filePath.split(path.sep);
    let targetIndex = _lastTargetIndex(rootDirName, arr);

    return arr.slice(0, targetIndex+1).join(path.sep);
}

/**
 * Returns last occurence of word in array
 * @private
 * @param {string} targetWord 
 * @param {Array<string>} arr 
 * 
 * @returns {number} index of last occurence of targetWord in the array
 * 
 * @example
 * _findLastIndexOfWord('back', ['home', 'back', 'documents', 'back']); // returns 3
 */
function _lastTargetIndex(targetWord, arr){
    let index = 0;

    if(!targetWord || arr.length <= 0) throw new Error('Invalid arguments provided!')

    for(let i=0; i < arr.length; i++){
        if(arr[i] === targetWord) 
            index = i;
    }

    return index;
}

module.exports = {
    getProjectRootDir,
}