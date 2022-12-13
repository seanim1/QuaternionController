// Sean Im, 2022
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.145.0/three.module.js';

// Global variables
const timer = new THREE.Clock(true);
const speed = 0.2;
let forward_vector = new THREE.Vector3( 0, 0, 1 );
const up_vector = new THREE.Vector3( 0, 1, 0 );
let angle = 0;

import { OrbitControls } from '../libs/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const frustumSize = 9;
let aspect = window.innerWidth / window.innerHeight;
//let camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const controls = new OrbitControls( camera, renderer.domElement );


window.addEventListener('keydown', onKeyDown, false);
function onKeyDown(event) {
    var keyCode = event.which;
    if (keyCode == 68 || keyCode == 39) {
        rotate(speed, "horizontal");
    } else if (keyCode == 65 || keyCode == 37) {
        rotate(-speed, "horizontal");
    } else if (keyCode == 83 || keyCode == 40) {
        rotate( speed, "vertical" );
    } else if (keyCode == 87 || keyCode == 38) {
        rotate( -speed, "vertical");
    }
};

window.addEventListener( 'resize', onWindowResize );
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

// initiate
function init() {
    let geometry, material;

    geometry = new THREE.CapsuleGeometry( 1, 2, 4, 8 );
    material = new THREE.MeshMatcapMaterial( { color: 0x36eb66 } );
    const person = ( new THREE.Mesh( geometry, material ) );

    geometry = new THREE.ConeGeometry( 0.9, 1, 4 );
    material = new THREE.MeshMatcapMaterial( { color: 0xfc9403 } );
    const person_face = ( new THREE.Mesh( geometry, material ) );

    geometry = new THREE.BoxGeometry( 0.7, 0.7, 2.7 );
    material = new THREE.MeshMatcapMaterial( { color: 0xff294d } );
    const target_z = ( new THREE.Mesh( geometry, material ) );


    // < Init: Transformations >
    person_face.position.copy(new THREE.Vector3(0,1,1.5));
    person_face.rotation.x = Math.PI/2;
    target_z.position.copy(forward_vector.clone().multiplyScalar(3));
    // < scene.add >
    person.add(person_face);

    scene.add( new THREE.AxesHelper( 10 ) ); // scene.children[0]
    scene.add( person ); // scene.children[1]
    scene.add( target_z ); // scene.children[2]

    camera.position.z = 10;
}

// This is the quaternion rotation method from the homework.
function rotate( speed, orientation ) {
    // < p = cos(theta/2) + sin(theta/2) >
    // theta is interpreted as rotating speed.
    let theta = speed / 2;
    up_vector.normalize();
    let axis_of_rotation;
    if (orientation == "horizontal") {
        axis_of_rotation = up_vector.clone();
    } else {
        axis_of_rotation = (up_vector.clone()).cross(forward_vector);
    }
    const imaginary_term = ( axis_of_rotation ).multiplyScalar(Math.sin( theta ));
    const p = new THREE.Quaternion( imaginary_term.x, imaginary_term.y, imaginary_term.z, Math.cos( theta ) );
    const v = new THREE.Quaternion( forward_vector.x, forward_vector.y, forward_vector.z, 0 );
    const p_conjugate = new THREE.Quaternion( -imaginary_term.x, -imaginary_term.y, -imaginary_term.z, Math.cos( theta ) );

    const result = (p.multiply(v)).multiply(p_conjugate);
    forward_vector = (new THREE.Vector3( result.x, result.y, result.z )).normalize();
}

// game loop
function animate() {
    requestAnimationFrame( animate );

    const time = timer.getElapsedTime(); // time since the beginning

    scene.children[2].position.copy(forward_vector.clone().multiplyScalar(3));

    /* I am kind of cheating by having our character "look at" the vector turned by quaternion, 
        rather than somehow applying the vector directly into the transformation matrix, 
        which I am not sure how to do with THREE.JS. */
    scene.children[1].lookAt( scene.children[2].position );

    scene.children[2].lookAt( scene.children[1].position );
    renderer.render( scene, camera );
};

init();
animate();
