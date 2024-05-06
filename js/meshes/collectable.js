import * as THREE from "three";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils";
import * as shaderMaterial from "./materials/collectableMaterial";

export let g = new THREE.IcosahedronGeometry(2, 20);
g.deleteAttribute("uv");
g.deleteAttribute("normal");
g = mergeVertices(g);
g.computeVertexNormals();

export let vertices = [];
for(let i = 0; i < g.attributes.position.count; i++){
    vertices.push(new THREE.Vector3().fromBufferAttribute(g.attributes.position, i).normalize());
}


export function o() {
    return new THREE.Mesh(g, shaderMaterial.m("#6495ED"));
}

export function animation(noise4D, v3, t) {
    let scaleValue = 0.05;

    vertices.forEach((v, idx) => {
        let n = noise4D(v.x, v.y, v.z, t * 0.5);
        v3.copy(v).multiplyScalar(8.5).addScaledVector(v, n);

        g.attributes.position.setXYZ(idx, v3.x*scaleValue, v3.y*scaleValue, v3.z*scaleValue);
    });
    g.computeVertexNormals();
    g.attributes.position.needsUpdate = true;
}