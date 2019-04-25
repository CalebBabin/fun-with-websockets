const Variables = require('../variables');

module.exports = (options) => {
    /*
        Converts our basic options object into an integer
    */
    let string = '00000000'.split('');
    for (const key in options) {
        if (options.hasOwnProperty(key) && Variables.OPTION_MAP.hasOwnProperty(key)) {
            if (options[key]) {
                string[Variables.OPTION_MAP[key]] = '1';
            }
        }
    }
    string = string.join('');
    return parseInt('0'+string, 2);
}