import assert from 'node:assert/strict';
import * as THREE from 'three';
import {planRoute,flightDistance,clearance,coneDirection} from '../src/navigation.js';
const V=(...a)=>new THREE.Vector3(...a),saturn={name:'Saturn',center:V(),axes:V(60318,54414,60318)};
const fixtures=[['clear',V(1220000,6700,-290000),V(-78000,30,-225000)],['opposite',V(150000,0,0),V(-150000,0,0)],['atmosphere',V(500000,120000,0),V(60420,0,0)],['pole',V(0,150000,0),V(0,-150000,0)],['nearby',V(80000,.02,0),V(80000,.03,.02)]];
let samples=0;
for(const [name,a,b]of fixtures){const route=planRoute(a,b,[saturn]);if(name==='clear')assert.ok(Math.abs(route.length-a.distanceTo(b))<1e-6,'Unblocked route must be straight');assert.ok(route.atDistance(0).distanceTo(a)<1e-7);assert.ok(route.atDistance(route.length).distanceTo(b)<1e-7);let previous=0;for(let i=0;i<=2000;i++){let d=flightDistance(i/2000,route.length,1000,.029);assert.ok(d>=previous-1e-7);previous=d;assert.ok(clearance(route.atDistance(d),saturn)>=1-1e-9,name+' must avoid surface');samples++;}}
for(let a=-10;a<10;a+=.1){const dir=coneDirection(V(0,1,0),V(0,0,1),V(1,0,0),a,78*Math.PI/180);assert.ok(dir.dot(V(0,1,0))>=Math.cos(78*Math.PI/180)-1e-12);}
const arrivalLength=1e6,d1=500000,d2=.029;
const closeSamples=Array.from({length:1001},(_,i)=>arrivalLength-flightDistance(i/1000,arrivalLength,d1,d2)).filter(d=>d<1&&d>.05).length;
assert.ok(closeSamples>100,'Metre-scale model must grow through a sustained final approach, not one frame');
console.log(JSON.stringify({passed:true,pathSamples:samples,approachVisibleFraction:closeSamples/1001,fixtures:fixtures.length}));
