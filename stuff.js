import * as THREE from 'https://cdn.skypack.dev/three';
import {OrbitControls} from 'https://cdn.skypack.dev/three/examples/jsm/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;

const geometry = new THREE.SphereGeometry( 5, 20, 20 );
const material = new THREE.MeshBasicMaterial( { color: 0xffaa00 } )
const sphere = new THREE.Mesh( geometry, material );
scene.add( sphere );

class Sail{
    constructor(pos, vel) {
        this.pos = pos
        this.vel = vel
        this.acc = 0
        this.geom = new THREE.SphereGeometry( 0.2, 5, 5 );
        this.mat = new THREE.MeshBasicMaterial( { color: 0xffffff } )
        this.s = new THREE.Mesh( this.geom, this.mat );
    }
}

let sails = []

for (let i=0; i<3; i++) {
    const p = new THREE.Vector3( 8, i, 8);
    const v = new THREE.Vector3( 0, 0, 0 );
    sails[i] = new Sail(p,v)
    scene.add( sails[i].s );
}

camera.position.z = 50;

const loader = new THREE.TextureLoader();
  const texture = loader.load(
    'bb.png',
    () => {
      const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
      rt.fromEquirectangularTexture(renderer, texture);
      scene.background = rt.texture;
    });

let frames = 0

const animate = function () {
    requestAnimationFrame(animate);
    frames += 1

    for (let i=0; i<3; i++) {
        // sails[i].pos.add(sails[i].vel)
        sails[i].s.position.x = sails[i].pos.x * Math.cos(((i + 1)*frames)/500)
        sails[i].s.position.y = sails[i].pos.y
        sails[i].s.position.z = sails[i].pos.z * Math.sin(((i + 1)*frames)/500)  
        sails[i].s.rotation.x += i*0.01
    }

    renderer.render(scene, camera);
};

animate();