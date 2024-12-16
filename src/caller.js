// caller.js

import { moveCameraTo, animate } from './main1.js';

// Variable to track the last clicked button
let lastClickedButton = null;
let appartment = null;
let ismoving=false;


// Event listener for the "entry gate" button
const overview = document.querySelector(".overview");
const appartment1 = document.querySelector(".appartment1");
const appartment2 = document.querySelector(".appartment2");
const bedroom = document.querySelector(".bedroom");

overview.addEventListener("click",()=>{
    if(lastClickedButton!=null&&ismoving===false){
        ismoving=true;
        moveCameraTo({ x: 0, y: 15, z: 30 }, { x: 0, y: 5, z: 0 }, 0.5, "yes");
            setTimeout(()=>{
                lastClickedButton=null;
                ismoving=false;
            },500);
    }
})

appartment1.addEventListener("click", () => {
    if(lastClickedButton===null&&ismoving===false){
        ismoving=true;
        moveCameraTo({ x: 5.6, y: 1, z: 6.4 }, { x: -0.5, y: 1, z: 6.4 }, 0.2, "yes");
        setTimeout(() => {
            moveCameraTo({ x: -1, y: 1, z: 6.4 }, { x: -1, y: 1, z: 6.5 }, 1, "no");
            setTimeout(()=>{
                ismoving=false;
            },1000);
        }, 250);
    }
    appartment="appartment1"
    lastClickedButton = "appartment1";
});

appartment2.addEventListener("click", () => {
    if(lastClickedButton===null&&ismoving===false){
        ismoving=true;
        moveCameraTo({ x: -8, y: 1, z: 1 }, { x: 0, y: 1, z: 1 }, 0.2, "yes");
        setTimeout(() => {
            moveCameraTo({ x: -3, y: 1, z: 1 }, { x: -0.5, y: 1.5, z: 0 }, 1, "no");
            setTimeout(() => {
                moveCameraTo({ x: -0.5, y: 1.5, z: 0 }, { x: -0.5, y: 1.5, z: -0.1 }, 1, "no");
                setTimeout(()=>{
                    ismoving=false;
                },1000);
            }, 1000);
        }, 250);
        
    }
    
    lastClickedButton = "appartment2";
    appartment="appartment2"
});

bedroom.addEventListener("click", () => {
    if (appartment === "appartment1"&&ismoving===false) {
        ismoving=true;
        moveCameraTo({ x: -1, y: 1, z: 11 }, { x: -1.1, y: 1, z: 11 }, 1, "no");
        setTimeout(() => {
            moveCameraTo({ x: -2, y: 2, z: 11 }, { x: -2.1, y: 1.9, z: 10.98 }, 1, "no");
            setTimeout(()=>{
                ismoving=false;
            },1000);
        }, 1000);
    } else {
        console.log("Error: last clicked button is not entrygate.");
    }
    lastClickedButton = "bedroom";
});

// Start the animation loop
animate();
