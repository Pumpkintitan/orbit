import * as THREE from 'https://cdn.skypack.dev/three';
import { OrbitControls } from 'https://cdn.skypack.dev/three/examples/jsm/controls/OrbitControls.js';
import Stats from 'https://cdn.skypack.dev/three/examples/jsm/libs/stats.module.js';

const container = document.getElementById('container');

const stats = new Stats();
container.appendChild(stats.dom);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;

const geometry = new THREE.SphereGeometry(5, 20, 20);
const material = new THREE.MeshBasicMaterial({ color: 0xffaa00 })
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

class Sail {
    constructor(pos, vel) {
        this.dead = false
        this.pos = pos
        this.vel = vel
        this.acc = 0
        this.points = []
        this.geom = new THREE.SphereGeometry(1, 5, 5);
        this.mat = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
        this.s = new THREE.Mesh(this.geom, this.mat);
    }

    updatePos = function () {
        this.s.position.x = this.pos.x
        this.s.position.y = this.pos.y
        this.s.position.z = this.pos.z
    }
}

let sails = []

for (let i = 0; i < 10; i++) {
    const p = new THREE.Vector3(3 * Math.random() - 1.5, 3 * Math.random() - 1.5, 3 * Math.random() - 1.5);
    p.multiplyScalar(10)
    const v = new THREE.Vector3(Math.random() * 4 - 2, Math.random() * 4 - 2, Math.random() * 4 - 2);
    sails[i] = new Sail(p, v)
    scene.add(sails[i].s);
}

camera.position.z = 100;

const loader = new THREE.TextureLoader();
const texture = loader.load(
    'bb.png',
    () => {
        const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
        rt.fromEquirectangularTexture(renderer, texture);
        scene.background = rt.texture;
    });

const sun = 50

const materiall = new THREE.LineBasicMaterial({
    color: 0xffffff
});

let frame = 0
const animate = function () {
    stats.update();
    const lines = []
    requestAnimationFrame(animate);

    frame++
    for (let i = 0; i < sails.length; i++) {
        if (!sails[i].dead) {
            const geometryy = new THREE.BufferGeometry().setFromPoints(sails[i].points);
            lines[i] = new THREE.Line(geometryy, materiall);
            if (frame > 500) {
                sails[i].points.shift()
            }
            const f = sun / (Math.pow(sails[i].pos.length(), 2))
            const nv = sails[i].pos.clone()
            nv.negate()
            nv.setLength(f)
            sails[i].vel.add(nv)
            sails[i].pos.add(sails[i].vel)
            sails[i].updatePos()
            sails[i].points.push(sails[i].pos.clone())
            scene.add(lines[i]);
            if (sails[i].pos.length() <= 5 || sails[i].pos.length() >= 500) {
                sails[i].dead = true
                scene.remove(sails[i].s)
            }
        }
    }

    renderer.render(scene, camera);
    for (let i = 0; i < sails.length; i++) {
        scene.remove(lines[i])
    }
};

animate();