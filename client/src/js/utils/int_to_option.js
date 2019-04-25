const Variables = require('../variables');

module.exports = (int) => {
    /*
        Converts an integer into our basic options object
    */
    if (int === 1) return {disconnect: true};
    let string = Number(int).toString(2);
    while (string.length < 8) string = '0'+string;
    const options = {};
    
    for (let index = 0; index < string.length; index++) {
        if (string[index] === '1') {
            options[Variables.OPTION_MAP_ARRAY[index]] = true;
        }
    }

    return options;
}