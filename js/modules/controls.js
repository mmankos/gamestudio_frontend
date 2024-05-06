import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {IcosahedronGeometry, Mesh, MeshBasicMaterial, RenderTarget, ShaderMaterial} from "three";
import TWEEN from "@tweenjs/tween.js";

let camera, controls, scene, renderer, light;
let ball, ballPosX, ballPosZ, movingAllowed, moveDuration, newTarget;
export const TileSize = 10;
let smoothReset = false;

const canvas = document.querySelector("#canvas");
const container = document.querySelector('.container');
container.append(canvas);

const vertexShader = `
varying vec3 vNormal;
varying vec3 vViewDir; 

void main() {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 clipPosition = projectionMatrix * viewPosition;
  
  vNormal = normalize(normalMatrix * normal);
  vViewDir = normalize(-viewPosition.xyz);

  gl_Position = clipPosition;
}
`;

const fragmentShader = `
#include <common>
#include <lights_pars_begin>

uniform vec3 uColor;
uniform float uGlossiness;

varying vec3 vNormal;
varying vec3 vViewDir;

void main() {
  // directional light
  float NdotL = dot(vNormal, directionalLights[0].direction);
  float lightIntensity = smoothstep(0.0, 0.01, NdotL);
  vec3 directionalLight = directionalLights[0].color * lightIntensity;
  
  // specular reflection
  vec3 halfVector = normalize(directionalLights[0].direction + vViewDir);
  float NdotH = dot(vNormal, halfVector);

  float specularIntensity = pow(NdotH * lightIntensity, 1000.0 / uGlossiness);
  float specularIntensitySmooth = smoothstep(0.05, 0.1, specularIntensity);

  vec3 specular = specularIntensitySmooth * directionalLights[0].color;
  
  // rim lighting
  float rimDot = 1.0 - dot(vViewDir, vNormal);
  float rimAmount = 0.6;

  float rimThreshold = 0.2;
  float rimIntensity = rimDot * pow(NdotL, rimThreshold);
  rimIntensity = smoothstep(rimAmount - 0.01, rimAmount + 0.01, rimIntensity);

  vec3 rim = rimIntensity * directionalLights[0].color;
  
  gl_FragColor = vec4(uColor * (directionalLight + ambientLightColor + specular + rim), 1.0);
}
`;


export function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color('gainsboro');
    // scene.background = null;

    renderer = new THREE.WebGLRenderer({canvas:canvas, antialias: true});
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.CineonToneMapping;
    renderer.toneMappingExposure = 1.75;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.physicallyCorrectLights = true;

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
    camera.position.z = 3;


    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    //
    //
    // let ambientLight = new THREE.AmbientLight( 'white', 0.5 );
    // scene.add( ambientLight );
    //
    // light = new THREE.DirectionalLight( 'white', 0.5 );
    // light.position.set( 1, 1, 1 );
    // scene.add( light );

    // controls.autoRotate = true;
    // controls.enabled = false;
    controls.enablePan = false;

    movingAllowed = true;
    moveDuration = 150;

    // GameBoard();


    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', onWindowResize);
    controls.addEventListener( 'start', onStart );
    controls.addEventListener( 'end', onEnd );





    const params = {
        color: "#6495ED",
        directionalLight: "#f8f1e6",
        ambientLight: "#ffffff"
    };

    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    const uniforms = {
        uColor: { value: new THREE.Color(params.color) },
        uGlossiness: { value: 4 }
    };
    const shaderMaterial = new THREE.ShaderMaterial({
        lights: true,
        uniforms: { ...THREE.UniformsLib.lights, ...uniforms },
        vertexShader,
        fragmentShader
    });
    const sphere = new THREE.Mesh(sphereGeometry, shaderMaterial);
    sphere.castShadow = true;
    scene.add(sphere);












    animate();

}

export function animate() {
    if( smoothReset ) doSmoothReset( );

    requestAnimationFrame(animate);
    controls.update();
    TWEEN.update();
    // light.position.copy( camera.position );
    render();
}

function render() {
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

async function GameBoard() {
    const responseSize = await fetch("http://192.168.0.147:8080/logical_mazes/field/size");
    let rowCount = await responseSize.json();

    const responseCharField = await fetch("http://192.168.0.147:8080/logical_mazes/field");
    const charField = await responseCharField.json();

    const wallLength = TileSize;
    const wallHeight = wallLength/2;
    const wallThickness = 1;

    const base = rowCount*wallLength;
    const color = 0x000000;
    const gridHelper = new THREE.GridHelper(base, rowCount, color, color);
    scene.add(gridHelper);

    const hWallGeometry = new THREE.BoxGeometry(wallLength+wallThickness, wallHeight, wallThickness);
    const hBorderWallGeometry = new THREE.BoxGeometry(wallLength*rowCount+wallThickness, wallHeight, wallThickness);
    const vWallGeometry = new THREE.BoxGeometry(wallThickness, wallHeight, wallLength+wallThickness);
    const vBorderWallGeometry = new THREE.BoxGeometry(wallThickness, wallHeight, wallLength*rowCount+wallThickness);
    const collectableBlockGeometry = new THREE.BoxGeometry(wallLength/3, wallLength/3, wallLength/3);
    const blockMaterial = new THREE.MeshNormalMaterial({depthWrite: false, transparent: true, opacity: 0.5});
    let hBorderWall, vBorderWall, hWall, vWall;

    const ballSize = wallLength/3;
    const ballGeometry = new THREE.SphereGeometry(ballSize, 32, 16);
    const ballMaterial = new THREE.MeshBasicMaterial({color: 0xFF0000});
    ball = new THREE.Mesh(ballGeometry, ballMaterial);
    scene.add(ball);

    hBorderWall = new THREE.Mesh(hBorderWallGeometry, blockMaterial);
    scene.add(hBorderWall);
    hBorderWall.position.set(0, wallHeight/2, wallLength/2*rowCount);

    hBorderWall = new THREE.Mesh(hBorderWallGeometry, blockMaterial);
    scene.add(hBorderWall);
    hBorderWall.position.set(0, wallHeight/2, -wallLength/2*rowCount);

    vBorderWall = new THREE.Mesh(vBorderWallGeometry, blockMaterial);
    scene.add(vBorderWall);
    vBorderWall.position.set(wallLength*rowCount/2, wallHeight/2, 0);

    vBorderWall = new THREE.Mesh(vBorderWallGeometry, blockMaterial);
    scene.add(vBorderWall);
    vBorderWall.position.set(-wallLength*rowCount/2, wallHeight/2, 0);

    for (let row = 0; row < rowCount; row++) {
        for (let col = 0; col < rowCount; col++) {
            if (col !== 0 && charField[row*2+1][col*2] === '|') {
                vWall = new THREE.Mesh(vWallGeometry, blockMaterial);
                scene.add(vWall);

                if (rowCount % 2 === 1) {
                    vWall.position.set((wallLength*rowCount/2) - wallLength*col, wallHeight/2, (wallLength*Math.floor(rowCount/2)) - wallLength*row);
                } else {
                    vWall.position.set((wallLength*rowCount/2) - wallLength*col, wallHeight/2, rowCount*wallLength/2 - wallLength/2  - wallLength*row);
                }
            }
            if (row !== 0 && charField[row*2][col*2+1] === '–') {
                hWall = new THREE.Mesh(hWallGeometry, blockMaterial);
                scene.add(hWall);

                if (rowCount % 2 === 1) {
                    hWall.position.set((wallLength*rowCount/2) - wallLength/2 - wallLength*col, wallHeight/2, (wallLength*Math.floor(rowCount/2)) + wallLength/2 - wallLength*row);
                } else {
                    hWall.position.set((wallLength*rowCount/2) - wallLength/2 - wallLength*col, wallHeight/2, rowCount*wallLength/2 - wallLength*row);
                }
            }

            if (charField[row*2+1][col*2+1] === 'o') {
                ball.position.set(rowCount*wallLength/2 - wallLength/2 - col*wallLength, ballSize, rowCount*wallLength/2 - wallLength/2 - row*wallLength);
                ballPosX = ball.position.x;
                ballPosZ = ball.position.z;
            } else if (charField[row*2+1][col*2+1] === '*') {
                const collectableBlock = new THREE.Mesh(collectableBlockGeometry, new MeshBasicMaterial({color: 0x000000}));
                scene.add(collectableBlock);
                collectableBlock.position.set(rowCount*wallLength/2 - wallLength/2 - col*wallLength, ballSize, rowCount*wallLength/2 - wallLength/2 - row*wallLength);
                console.log(row + ", " + col + ": " + charField[row*2+1][col*2+1]);
            }
        }
    }

    camera.position.set(-2*rowCount, 8*rowCount, -7*rowCount);
    controls.update();
    newTarget = {x: camera.position.x, y: camera.position.y, z: camera.position.z};
}



// starting new drag with OrbitCintrols -- recover the min.max values
function onStart( event )
{
    smoothReset = false;
}

// enging drag with OrbitControls -- activate smooth reset
function onEnd( event )
{
    smoothReset = true;
}

// function to smooth reset the OrbitControl camera's angles
function doSmoothReset( ) {
    onStart();
    new TWEEN.Tween(camera.position)
        .to(newTarget, 1000)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();
}

async function verticalBallMove(dir) {
    if (movingAllowed) {
        let response = await fetch("http://192.168.0.147:8080/logical_mazes/field/tilt/"+dir);
        let success = await response.json();
        new TWEEN.Tween(ball.position)
            .to(ball.position.clone().setZ(ballPosZ - success.ballPosYDiff * TileSize), moveDuration)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onStart(() => {
                ballPosZ -= success.ballPosYDiff * TileSize;
                movingAllowed = false;
            })
            .onComplete(() => {
                movingAllowed = true;
            })
            .start();
        console.log(success);
    }
}

async function horiznotalBallMove(dir) {
    if (movingAllowed) {
        let response = await fetch("http://192.168.0.147:8080/logical_mazes/field/tilt/"+dir);
        let success = await response.json();
        new TWEEN.Tween(ball.position)
            .to(ball.position.clone().setX(ballPosX - success.ballPosXDiff * TileSize), moveDuration)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onStart(() => {
                ballPosX -= success.ballPosXDiff * TileSize;
                movingAllowed = false;
            })
            .onComplete(() => {
                movingAllowed = true;
            })
            .start();
        console.log(success);
    }
}

async function handleKeyDown(event) {
    let response;
    let success;
    switch (event.key) {
        case 'ArrowUp':
            await verticalBallMove("north");
            break;
        case 'ArrowDown':
            await verticalBallMove("south");
            break;
        case 'ArrowLeft':
            await horiznotalBallMove("west");
            break;
        case 'ArrowRight':
            await horiznotalBallMove("east");
            break;
        case 'n':
            response = await fetch("http://192.168.0.147:8080/logical_mazes/next");
            success = await response.json();
            console.log(success);
            while(scene.children.length > 0){
                scene.remove(scene.children[0]);
            }
            await GameBoard();
            break;
        case 'p':
            response = await fetch("http://192.168.0.147:8080/logical_mazes/prev");
            success = await response.json();
            console.log(success);
            while(scene.children.length > 0){
                scene.remove(scene.children[0]);
            }
            await GameBoard();
            break;
        case 'r':
            response = await fetch("http://192.168.0.147:8080/logical_mazes/field/reset");
            success = await response.json();
            console.log(success);
            while(scene.children.length > 0){
                scene.remove(scene.children[0]);
            }
            await GameBoard();
            break;
        case 's':
            response = await fetch("http://192.168.0.147:8080/logical_mazes/score");
            success = await response.json();
            console.log(success);
            break;
    }

    // Render the scene after updating the camera position
    renderer.render(scene, camera);
}