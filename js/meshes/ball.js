import * as THREE from "three";

export function o(r,s) {
    const g = new THREE.SphereGeometry(r, s, s);
    const m = new THREE.MeshLambertMaterial({color:"#FAF0E6"});

    return new THREE.Mesh(g,m);
}