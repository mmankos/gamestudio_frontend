import * as THREE from "three";
import * as ui from "../modules/ui";

let dirs = [];
let parts = [];
let movementSpeed = 80;
let objectSize = 20;
let totalObjects = 100;
let colors = [0xFF0FFF, 0xCCFF00, 0xFF000F, 0x996600, 0xFFFFFF];



function ExplodeAnimation(x,y)
{
    let geometry = new THREE.BufferGeometry();
    let vertices = [];
    for(let i = 0; i < geometry.attributes.position.count; i++){
        vertices.push(new THREE.Vector3().fromBufferAttribute(geometry.attributes.position, i).normalize());
    }

    for (let i = 0; i < totalObjects; i ++)
    {
        let vertex = new THREE.Vector3();
        vertex.x = x;
        vertex.y = y;
        vertex.z = 0;

        vertices.push( vertex );
        dirs.push({x:(Math.random() * movementSpeed)-(movementSpeed/2),y:(Math.random() * movementSpeed)-(movementSpeed/2),z:(Math.random() * movementSpeed)-(movementSpeed/2)});
    }
    let material = new THREE.PointsMaterial( { size: objectSize,  color: colors[Math.round(Math.random() * colors.length)] });
    this.object = new THREE.Points(geometry, material);
    this.status = true;


    ui.scene.add( this.object  );

    this.update = function(){
        if (this.status === true){
            let pCount = totalObjects;
            while(pCount--) {
                let particle =  this.object.geometry.vertices[pCount]
                particle.y += dirs[pCount].y;
                particle.x += dirs[pCount].x;
                particle.z += dirs[pCount].z;
            }
            this.object.geometry.verticesNeedUpdate = true;
        }
    }

}