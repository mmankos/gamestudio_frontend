import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls";
import { createNoise4D } from 'simplex-noise';
import * as cameraControl from "./cameraControl";
import * as collectable from "../meshes/collectable";
import * as gameBoard from "../meshes/gameBoard"
import * as keyboardControl from "./keyboardControl";
import TWEEN from "@tweenjs/tween.js";


export let scene, camera, renderer, controls;
let ambientLight, directionalLight;
export const target = {x: -2, y: 8, z: -7};

const noise4D = createNoise4D();
const canvas = document.querySelector("#canvas");
const container = document.querySelector(".container");

export function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color("#0F0E0E");

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(-2, 8, -7);

    renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true });
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.CineonToneMapping;
    renderer.toneMappingExposure = 1.75;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.physicallyCorrectLights = true;

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = true;
    controls.maxDistance = 20;
    controls.minDistance = 3;
    controls.saveState();

    directionalLight = new THREE.DirectionalLight("#f8f1e6", 0.75);
    directionalLight.position.set(0, 4, -7);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 5120;
    directionalLight.shadow.mapSize.height = 5120;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.top = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.bottom = 100;

    ambientLight = new THREE.AmbientLight("#ffffff", 0.5);

    scene.add(directionalLight, ambientLight);


    window.addEventListener("resize", cameraControl.resize);
    container.addEventListener('dblclick', cameraControl.doSmoothReset);
    container.addEventListener('keydown', keyboardControl.handleKeyDown);


    gameBoard.update();
    cameraControl.resize();

    let clock = new THREE.Clock();
    let v3 = new THREE.Vector3();

    const tick = () => {
        let t = clock.getElapsedTime();
        controls.update();

        collectable.animation(noise4D, v3, t);

        TWEEN.update();

        renderer.render(scene, camera);
        window.requestAnimationFrame(tick);
    };

    tick();
}


