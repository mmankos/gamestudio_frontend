import TWEEN from "@tweenjs/tween.js";
import * as gameBoard from "../meshes/gameBoard";
import * as ui from "./ui";



export async function handleKeyDown(event) {
    let response;
    let success;
    event.preventDefault();
    switch (event.key) {
        case 'ArrowUp':
            await gameBoard.verticalBallMove("north");
            break;
        case 'ArrowDown':
            await gameBoard.verticalBallMove("south");
            break;
        case 'ArrowLeft':
            await gameBoard.horiznotalBallMove("west");
            break;
        case 'ArrowRight':
            await gameBoard.horiznotalBallMove("east");
            break;
        case 'n':
            response = await fetch("http://192.168.0.147:8080/logical_mazes/next");
            success = await response.json();
            console.log(success);

            await gameBoard.update();
            break;
        case 'p':
            response = await fetch("http://192.168.0.147:8080/logical_mazes/prev");
            success = await response.json();
            console.log(success);

            await gameBoard.update();
            break;
        case 'r':
            response = await fetch("http://192.168.0.147:8080/logical_mazes/field/reset");
            success = await response.json();
            console.log(success);

            await gameBoard.update();
            break;
        case 's':
            response = await fetch("http://192.168.0.147:8080/logical_mazes/score");
            success = await response.json();
            console.log(success);
            break;
    }

    // Render the ui.scene after updating the ui.camera position
    ui.renderer.render(ui.scene, ui.camera);
}