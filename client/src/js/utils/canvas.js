class Canvas {
    constructor () {
        this.canvas = document.createElement('canvas');
        this.context = this.canvas.getContext('2d');
        
        this.offcanvas = document.createElement('canvas');
        this.offcontext = this.offcanvas.getContext('2d');

        setTimeout(this.init.bind(this), 1);
        window.addEventListener('resize', this.resize.bind(this));
    }

    init () {
        document.body.appendChild(this.canvas);
        this.resize();
    }

    clear () {
        this.context.clearRect(0,0,this.canvas.width, this.canvas.height);
    }

    resize () {
        this.offcanvas.width = this.canvas.width;
        this.offcanvas.height = this.canvas.height;

        this.offcontext.drawImage(this.canvas, 0, 0);

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.context.drawImage(this.offcanvas, 0, 0, this.canvas.width, this.canvas.height);
    }
}
module.exports = Canvas;