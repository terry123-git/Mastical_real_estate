import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xd6d6d6);

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 15, 30);

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
const canvasContainer = document.getElementById('canvas-container');
canvasContainer.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// Ground Plane
const planeGeometry = new THREE.PlaneGeometry(10, 10);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

// Load 3D Model
const loader = new GLTFLoader();
loader.load(
    'models/ARVRhouse1.glb',
    (gltf) => {
        const model = gltf.scene;
        model.position.set(0, 0, 0);
        scene.add(model);
    },
    undefined,
    (error) => {
        console.error('An error occurred while loading the model:', error);
    }
);

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 5, 0);

// WASD Controls
const moveSpeed = 0.25;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let isMoving = false; // Flag to track if the camera is moving

// Box to block camera movement
const boxGeometry = new THREE.BoxGeometry(11, 5, 26);
const boxMaterial = new THREE.MeshStandardMaterial({
    color: 0x00000,
    wireframe: true,
    transparent: true,
    opacity: 0
});
const box = new THREE.Mesh(boxGeometry, boxMaterial);
box.position.set(0, 2.5, 1);
scene.add(box);

// Hover effect settings
const clock = new THREE.Clock();
const hoverAmplitude = 0.002;
const hoverSpeed = 0.5;
let isHovering = true;

// Event listeners for hover effect
renderer.domElement.addEventListener('pointerdown', () => {
    isHovering = false;
    controls.enableRotate = true;
});

renderer.domElement.addEventListener('pointerup', () => {
    isHovering = true;
});

// Keyboard event listeners
document.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'KeyW':
            moveForward = true;
            break;
        case 'KeyS':
            moveBackward = true;
            break;
        case 'KeyA':
            moveLeft = true;
            break;
        case 'KeyD':
            moveRight = true;
            break;
    }
});

document.addEventListener('keyup', (event) => {
    switch (event.code) {
        case 'KeyW':
            moveForward = false;
            break;
        case 'KeyS':
            moveBackward = false;
            break;
        case 'KeyA':
            moveLeft = false;
            break;
        case 'KeyD':
            moveRight = false;
            break;
    }
});

// Function to check if the camera is inside the box
function isCameraInsideBox() {
    const minBounds = new THREE.Vector3(-5.5, 0, -13);
    const maxBounds = new THREE.Vector3(5.5, 5, 13);

    return (
        camera.position.x >= minBounds.x &&
        camera.position.x <= maxBounds.x &&
        camera.position.y >= minBounds.y &&
        camera.position.y <= maxBounds.y &&
        camera.position.z >= minBounds.z &&
        camera.position.z <= maxBounds.z
    );
}

// Restrict WASD movement inside the box with respect to the camera's local direction
function restrictWASDMovement() {
    const cameraInside = isCameraInsideBox();
    const moveVector = new THREE.Vector3();

    // Create direction vectors in the local space of the camera
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion); // Forward direction
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);   // Right direction

    // Normalize directions to ensure consistent movement speed
    forward.normalize();
    right.normalize();

    // Apply WASD movement based on local directions
    if (moveForward) moveVector.add(forward);
    if (moveBackward) moveVector.add(forward.negate()); // Negate forward for backward movement
    if (moveLeft) moveVector.add(right.negate());       // Negate right for left movement
    if (moveRight) moveVector.add(right);

    // Scale movement vector by speed
    moveVector.normalize().multiplyScalar(moveSpeed);

    // Apply movement if camera is not inside the box
    if (!cameraInside) {
        camera.position.add(moveVector);
        isMoving = moveVector.lengthSq() > 0; // Update moving flag
    } else {
        // Prevent further movement inside the box
        isMoving = false;
    }

    // Ensure the camera stays above the ground
    camera.position.y = Math.max(camera.position.y, 0);
}

// Hover effect for the camera
function applyHoverEffect() {
    if (isHovering && !moveForward && !moveBackward && !moveLeft && !moveRight) {
        const time = clock.getElapsedTime();
        const hoverYOffset = hoverAmplitude * Math.sin(hoverSpeed * time);
        const hoverXOffset = hoverAmplitude * Math.sin(hoverSpeed * time * 0.5);
        const hoverZOffset = hoverAmplitude * Math.cos(hoverSpeed * time * 0.7);

        if (!isCameraInsideBox()) {
            camera.position.set(
                camera.position.x + hoverXOffset,
                Math.max(camera.position.y + hoverYOffset, 0),
                camera.position.z + hoverZOffset
            );
        }
    }
}

// Function to animate the camera to a target position and set OrbitControls target
export function moveCameraTo(location, point, duration = 1, blur = "no") {
    const startPosition = new THREE.Vector3().copy(camera.position);
    const startTarget = new THREE.Vector3().copy(controls.target);

    const endPosition = new THREE.Vector3(location.x, location.y, location.z);
    const endTarget = new THREE.Vector3(point.x, point.y, point.z);

    let startTime = null;

    // Apply blur effect only once before the movement starts
    if (blur === "yes") {
        applyBlurEffect("yes");
    }

    function animateCamera(time) {
        if (!startTime) startTime = time;
        const elapsedTime = (time - startTime) / 1000;
        const t = Math.min(elapsedTime / duration, 1);

        // Animate the camera position and target
        camera.position.lerpVectors(startPosition, endPosition, t);
        controls.target.lerpVectors(startTarget, endTarget, t);

        controls.update();
        renderer.render(scene, camera);

        // If the animation is still ongoing, keep animating
        if (t < 1) {
            requestAnimationFrame(animateCamera);
        } else {
            // Once movement is complete, update final positions
            camera.position.copy(endPosition);
            controls.target.copy(endTarget);
            controls.update();

            // Remove blur after the movement is done
            if (blur === "yes") {
                applyBlurEffect("no");
            }
        }
    }

    // Start the animation
    requestAnimationFrame(animateCamera);
}

// Apply blur effect
function applyBlurEffect(blur) {
    if (blur === "yes") {
        renderer.domElement.style.transition = "filter 0.3s"; // Smooth transition for blur
        renderer.domElement.style.filter = "blur(10px)";
    }
    if (blur === "no") {
        renderer.domElement.style.filter = "none";
    }
}

// Animation loop
export const animate = () => {
    requestAnimationFrame(animate);

    restrictWASDMovement();
    applyHoverEffect();
    controls.update();
    renderer.render(scene, camera);
};
