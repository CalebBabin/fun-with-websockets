const hueHasher = require('./hueHasher');

class Favicon {
    constructor () {

    }

    static generate (id) {
        const color = hueHasher(id, false);
        
        const baseImage = new Image(256, 256);

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = baseImage.width;
        canvas.height = baseImage.height;

        context.filter = `hue-rotate(${color}deg)`;

        baseImage.addEventListener('load', ()=>{
            context.drawImage(baseImage, 0, 0);

            const element = document.createElement('link');
            element.setAttribute('rel', 'icon');
            element.setAttribute('type', 'image/png');
            element.setAttribute('href', canvas.toDataURL());

            document.head.appendChild(element);
        })
        baseImage.src = 'img/paintbrush.png';
    }
}

module.exports = Favicon;