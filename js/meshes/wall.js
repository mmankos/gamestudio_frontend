import * as THREE from "three";

export function o(w,h,d) {
    const g = new THREE.BoxGeometry(w, h, d);
    const m = new THREE.MeshLambertMaterial({color:"#B9B4C7"});

    return new THREE.Mesh(g,m);
}