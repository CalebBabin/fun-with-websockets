const Variables = {

    // the option map is an object which maps each function to a bit in our configuration byte.
    // values can only be true or false.
    OPTION_MAP: {
        mousedown: 0,
        clear: 1,
        disconnect: 7,
    },

    // the option map array is a companion variable to the option map, which is a reverse mapping of bit indexes to their representations. filled out automatically.
    OPTION_MAP_ARRAY: [],
}


for (const key in Variables.OPTION_MAP) {
    if (Variables.OPTION_MAP.hasOwnProperty(key)) {
        Variables.OPTION_MAP_ARRAY[Variables.OPTION_MAP[key]] = key;
    }
}


module.exports = Variables;