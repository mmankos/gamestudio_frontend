import * as THREE from "https://cdn.skypack.dev/three@0.136.0";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls";
import * as dat from "three/addons/libs/lil-gui.module.min";


let sphere;





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
  
  // rim lighting
  float rimDot = 1.0 - dot(vViewDir, vNormal);
  float rimAmount = 0.6;

  float rimThreshold = 0.2;
  float rimIntensity = rimDot * pow(NdotL, rimThreshold);
  rimIntensity = smoothstep(rimAmount - 0.01, rimAmount + 0.01, rimIntensity);

  vec3 rim = rimIntensity * directionalLights[0].color;
  
  gl_FragColor = vec4(uColor * (directionalLight + ambientLightColor + rim), 1.0);
}
`;

window.addEventListener("load", init, false);

function init() {
    const gui = new dat.GUI();
    gui.close();

    const canvas = document.querySelector("#canvas");

    const scene = new THREE.Scene();
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


    sphere = new THREE.Mesh(sphereGeometry, shaderMaterial);
    sphere.castShadow = true;
    scene.add(sphere);



    const planeGeometry = new THREE.PlaneGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: "#7a7775" });
    const mesh = new THREE.Mesh(planeGeometry, material);
    mesh.receiveShadow = true;
    mesh.scale.setScalar(10);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -1;
    scene.add(mesh);


    window.addEventListener("resize", () => {

        camera.aspect = canvas.width / canvas.height;
        camera.updateProjectionMatrix();

    });

    const camera = new THREE.PerspectiveCamera(
        75,
        canvas.width / canvas.height,
        0.1,
        100
    );
    camera.position.set(0, 0, 5);
    scene.add(camera);

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.maxDistance = 50;
    controls.minDistance = 3;

    const directionalLight = new THREE.DirectionalLight(
        params.directionalLight,
        0.75
    );
    directionalLight.position.set(0, 4, 7);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.camera.near = 2;
    directionalLight.shadow.camera.far = 15;

    const ambientLight = new THREE.AmbientLight("#ffffff", 0.5);

    scene.add(directionalLight, ambientLight);

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true
    });
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.setPixelRatio(5);
    renderer.toneMapping = THREE.CineonToneMapping;
    renderer.toneMappingExposure = 1.75;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.physicallyCorrectLights = true;

    gui
        .addColor(params, "color")
        .onChange((value) => {
            uniforms.uColor.value = new THREE.Color(value);
        })
        .name("mesh color");



    const clock = new THREE.Clock();

    const tick = () => {
        controls.update();
        renderer.render(scene, camera);
        window.requestAnimationFrame(tick);
    };

    tick();
}