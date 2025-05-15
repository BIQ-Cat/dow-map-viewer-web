import { runGame, stopGame } from "./play.js";

(function() {
    const canvasElement = document.querySelector("canvas");
    const canvasContext = canvasElement.getContext("2d");
    
    const preload = new Image();
    preload.src = "/static/img/default.jpg";
    preload.addEventListener("load", () => {
        preload.sizes = ""
        canvasContext.drawImage(preload, 0, 0, canvasElement.width, canvasElement.height); 
    })
}())