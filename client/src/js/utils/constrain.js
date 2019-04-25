class Constrain {
    constructor () {

    }

    static toOne (number) {
        return Math.min(1, Math.max(0, number));
    }

}

module.exports = Constrain;