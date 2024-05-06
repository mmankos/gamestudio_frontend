import * as collectable from "./collectable";
import * as wall from "./wall";
import * as grid from "./grid";
import * as ui from "../modules/ui";
import * as serverData from "../modules/serverData";
import * as ball from "./ball";
import TWEEN from "@tweenjs/tween.js";

const wallThickness = 0.1;
export const wallWidth = 2;
const wallHeight = wallWidth/2;
const ballSize = wallWidth/2*0.75;

let movingAllowed = true;
export const moveDuration = 100;
export let ballO, ballPosX, ballPosZ;
let gameBoardObjects = [];

let rowCount = serverData.rowCount();
let charField = serverData.charField();

export async function update() {
    rowCount = await serverData.rowCount();
    charField = await serverData.charField();
    console.log(rowCount)
    while (gameBoardObjects.length > 0) {
        ui.scene.remove(gameBoardObjects.pop());
    }
    base();
    borders();
    generated();

    for (let object of gameBoardObjects) {
        ui.scene.add(object);
    }

}

function base() {
    let baseO = wall.o(wallWidth*rowCount+wallThickness,wallThickness,wallWidth*rowCount+wallThickness);
    baseO.position.y = -0.05;
    baseO.receiveShadow = true;
    gameBoardObjects.push(baseO);
    let baseGrid = grid.o(wallWidth*rowCount, rowCount,"#000000");
    baseGrid.receiveShadow = true;
    gameBoardObjects.push(baseGrid);
}

function borders() {
    let vWall1 = wall.o(wallThickness, wallHeight, wallWidth*rowCount+wallThickness);
    vWall1.position.set(rowCount,wallHeight/2,0);
    vWall1.receiveShadow = true;
    vWall1.castShadow = true;
    gameBoardObjects.push(vWall1);
    let vWall2 = wall.o(wallThickness, wallHeight, wallWidth*rowCount+wallThickness);
    vWall2.position.set(-rowCount,wallHeight/2,0);
    vWall2.receiveShadow = true;
    vWall2.castShadow = true;
    gameBoardObjects.push(vWall2);

    let hWall1 = wall.o(wallWidth*rowCount+wallThickness, wallHeight, wallThickness);
    hWall1.position.set(0,wallHeight/2,rowCount);
    hWall1.receiveShadow = true;
    hWall1.castShadow = true;
    gameBoardObjects.push(hWall1);
    let hWall2 = wall.o(wallWidth*rowCount+wallThickness, wallHeight, wallThickness);
    hWall2.position.set(0,wallHeight/2,-rowCount);
    hWall2.receiveShadow = true;
    hWall2.castShadow = true;
    gameBoardObjects.push(hWall2);
}

function generated() {
    for (let row = 0; row < rowCount; row++) {
        for (let col = 0; col < rowCount; col++) {
            if (col !== 0 && charField[row*2+1][col*2] === '|') {
                let vWall = wall.o(wallThickness, wallHeight, wallWidth);
                vWall.receiveShadow = true;
                vWall.castShadow = true;
                gameBoardObjects.push(vWall);

                if (rowCount % 2 === 1) {
                    vWall.position.set((wallWidth*rowCount/2) - wallWidth*col, wallHeight/2, (wallWidth*Math.floor(rowCount/2)) - wallWidth*row);
                } else {
                    vWall.position.set((wallWidth*rowCount/2) - wallWidth*col, wallHeight/2, rowCount*wallWidth/2 - wallWidth/2  - wallWidth*row);
                }
            }
            if (row !== 0 && charField[row*2][col*2+1] === '–') {
                let hWall = wall.o(wallWidth, wallHeight, wallThickness);
                hWall.receiveShadow = true;
                hWall.castShadow = true;
                gameBoardObjects.push(hWall);

                if (rowCount % 2 === 1) {
                    hWall.position.set((wallWidth*rowCount/2) - wallWidth/2 - wallWidth*col, wallHeight/2, (wallWidth*Math.floor(rowCount/2)) + wallWidth/2 - wallWidth*row);
                } else {
                    hWall.position.set((wallWidth*rowCount/2) - wallWidth/2 - wallWidth*col, wallHeight/2, rowCount*wallWidth/2 - wallWidth*row);
                }
            }

            if (charField[row*2+1][col*2+1] === '*') {
                const collectableBlock = collectable.o();
                gameBoardObjects.push(collectableBlock);
                collectableBlock.receiveShadow = true;
                collectableBlock.castShadow = true;
                collectableBlock.position.set(rowCount*wallWidth/2 - wallWidth/2 - col*wallWidth, wallHeight/2, rowCount*wallWidth/2 - wallWidth/2 - row*wallWidth);
            } else if (charField[row*2+1][col*2+1] === 'o') {
                ballO = ball.o(ballSize,32);
                ballO.position.y = ballSize;
                ballO.receiveShadow = true;
                ballO.castShadow = true;
                gameBoardObjects.push(ballO);
                ballO.position.set(rowCount * wallWidth / 2 - wallWidth / 2 - col * wallWidth, ballSize, rowCount * wallWidth / 2 - wallWidth / 2 - row * wallWidth);
                ballPosX = ballO.position.x;
                ballPosZ = ballO.position.z;
            }
        }
    }
}

export async function verticalBallMove(dir) {
    if (movingAllowed) {
        let response = await fetch("http://192.168.0.147:8080/logical_mazes/field/tilt/"+dir);
        let success = await response.json();
        new TWEEN.Tween(ballO.position)
            .to(ballO.position.clone().setZ(ballPosZ - success.ballPosYDiff * wallWidth), moveDuration)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onStart(() => {
                ballPosZ -= success.ballPosYDiff * wallWidth;
                movingAllowed = false;
            })
            .onComplete(() => {
                movingAllowed = true;
            })
            .start();
        console.log(success);
    }
}

export async function horiznotalBallMove(dir) {
    if (movingAllowed) {
        let response = await fetch("http://192.168.0.147:8080/logical_mazes/field/tilt/"+dir);
        let success = await response.json();
        new TWEEN.Tween(ballO.position)
            .to(ballO.position.clone().setX(ballPosX - success.ballPosXDiff * wallWidth), moveDuration)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onStart(() => {
                ballPosX -= success.ballPosXDiff * wallWidth;
                movingAllowed = false;
            })
            .onComplete(() => {
                movingAllowed = true;
            })
            .start();
        console.log(success);
    }
}