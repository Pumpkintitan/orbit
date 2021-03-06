import * as THREE from 'three';
import { OrbitControls } from 'OrbitControls';
import Stats from 'Stats';

//#########################################
const LINES = true // true for trails on
//#########################################

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
        this.geom = new THREE.SphereGeometry(1, 5, 5); // radius, triangles h, triangles w
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

for (let i = 0; i < 100; i++) { // number of sails
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

const sun = 50 // sun mass

const materiall = new THREE.LineBasicMaterial({
    color: 0xffffff
});

let frame = 0
const geoms = []
const animate = function () {
    stats.update();
    const lines = []

    requestAnimationFrame(animate);

    frame++
    for (let i = 0; i < sails.length; i++) {
        if (!sails[i].dead) {
            if (LINES) {
                if (frame == 1) {
                    console.log("dingus")
                    geoms[i] = new THREE.BufferGeometry()
                }
                geoms[i].setFromPoints(sails[i].points);
                lines[i] = new THREE.Line(geoms[i], materiall);
                if (frame > 100) { // number of frames before trail starts going away
                    sails[i].points.shift()
                }
            }
            const f = sun / (Math.pow(sails[i].pos.length(), 2))
            const nv = sails[i].pos.clone()
            nv.negate()
            nv.setLength(f)
            sails[i].vel.add(nv)
            sails[i].pos.add(sails[i].vel)
            sails[i].updatePos()
            if (LINES) {
                sails[i].points.push(sails[i].pos.clone())
                scene.add(lines[i]);
            }
            if (sails[i].pos.length() <= 6 || sails[i].pos.length() >= 500) {
                sails[i].dead = true
                scene.remove(sails[i].s)
                if (LINES) {
                    geoms[i].dispose()
                }
            }
        }
    }

    renderer.render(scene, camera);
    if (LINES) {
        for (let i = 0; i < sails.length; i++) {
            scene.remove(lines[i])
        }
    }
};

animate();