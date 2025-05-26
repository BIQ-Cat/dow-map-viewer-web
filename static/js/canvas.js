    import { canvas, ctx } from "./elements.js";
import { GameLoop } from "./gameLoop.js";

export class Preload {
    constructor(img) {
        this.image = new Image();
        this.image.src = img;
        this.isLoaded = false;

        this.image.addEventListener("load", () => {
            if (this.isLoaded) return false;

            this.image.sizes = "";
            this.isLoaded = true;

            this.render();
        })
    }

    render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        if (this.isLoaded && !GameLoop.isRunning) {
            ctx.drawImage(this.image, 0, 0, canvas.width, canvas.height)
        }
    }

}