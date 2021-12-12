function displayElapsedTime(start){
    let end = Date.now();
    let unformattedTime = (end - start)/1000
    // src: https://stackoverflow.com/a/11832950
    let formattedTime = Math.round((unformattedTime + Number.EPSILON) * 100)/100;
    
    console.log(`Execution time: (${formattedTime}) seconds`)
}

module.exports = {
    displayElapsedTime
};