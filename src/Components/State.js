import { atom } from "recoil";

export const shipPositionState = atom({
    key: "shipPosition", 
    default: { position: {}, rotation: {} } 
});

export const enemyPositionState = atom({
    key: "enemyPosition", 
    default: [{ x: -10, y: 10, z: -80 },
        { x: 20, y: 20, z: -100 },
        { x: 50, y: 20, z: -100 },
        { x: 70, y: 20, z: -100 },
        { x: -60, y: 20, z: -100 },
        { x: 90, y: 20, z: -100 },
        { x: -30, y: 20, z: -100 }]

});

export const laserPositionState = atom({
    key: "laserPositions", 
    default: [] 
});

export const scoreState = atom({
    key: "score", 
    default: 0 
});
