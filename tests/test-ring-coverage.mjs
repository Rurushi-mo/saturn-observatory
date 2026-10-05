import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import * as THREE from 'three';
const source=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const scene=new THREE.Scene(),eye=new THREE.Vector3(129500.02,.03,.02),ringUniform={uHole:{value:0},uPatch:{value:new THREE.Vector3()}};
const context=vm.createContext({THREE,V:(...a)=>new THREE.Vector3(...a),scene,eye,ringUniform,env:null,MU:37931000,TAU:Math.PI*2,state:{time:0},innerHeight:900});
vm.runInContext(source.slice(source.indexOf('// Locally resolved ring particles:'),source.indexOf('const sunYaw=')),context);
const data=vm.runInContext('({particles,grainPos,grainSpans,grainShader:grainMat.vertexShader})',context);
const nearExtent=Math.max(...data.particles.map(p=>Math.max(Math.abs(p.x),Math.abs(p.z))));
assert.ok(nearExtent>=3.9,'Resolved ice field still ends within a small local patch: '+nearExtent+' km');
let outer=0;for(let i=0;i<data.grainPos.length;i+=3)outer=Math.max(outer,Math.abs(data.grainPos[i]),Math.abs(data.grainPos[i+2]));assert.ok(outer>=31,'Surrounding ice sheet must extend beyond 31 km');
assert.ok(!source.includes('alpha*=smoothstep(.3,2.,length(uEye-uPatch))'),'Approaching must not erase the entire ring plane');
// Evaluate the actual GLSL shear expression at later simulated times, preserving GLSL mod semantics.
const expr=data.grainShader.match(/p\.z=(.*?);/)[1];
const moveZ=vm.runInContext(`(function(p,uTime,span){return ${expr};})`,vm.createContext({mod:(x,y)=>x-y*Math.floor(x/y)}));
const times=[0,6000,86400,1e7];let laterMaxZ=0;
for(const time of times)for(let i=0;i<data.grainPos.length;i+=3){const span=data.grainSpans[i/3],z=moveZ({x:data.grainPos[i],z:data.grainPos[i+2]},time,span);assert.ok(Number.isFinite(z)&&Math.abs(z)<=span/2+1e-8,'Sheared grain escapes its transverse bounds');laterMaxZ=Math.max(laterMaxZ,Math.abs(z));}
assert.ok(laterMaxZ>31.9);
console.log(JSON.stringify({passed:true,resolvedHalfWidthKm:nearExtent,grainHalfWidthKm:outer,laterTimeMaxZKm:laterMaxZ,simulatedTimesSeconds:times}));
