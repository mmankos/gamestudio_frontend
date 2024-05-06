import TWEEN from "@tweenjs/tween.js";
import * as ui from "./ui"

export let smoothReset;

export function onStart( event )
{
    smoothReset = false;
}

// enging drag with OrbitControls -- activate smooth reset
export function onEnd( event )
{
    smoothReset = true;
}

// function to smooth reset the OrbitControl camera's angles
export function resize() {
    ui.camera.aspect = window.innerWidth / window.innerHeight;
    ui.camera.updateProjectionMatrix();
    ui.renderer.setSize(window.innerWidth, window.innerHeight);
}

export function doSmoothReset() {
    onStart();

    new TWEEN.Tween(ui.camera.position)
        .to(ui.target, 1000)
        .easing(TWEEN.Easing.Exponential.Out)
        .onComplete(ui.controls.reset)
        .start();
}