import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import * as THREE from 'three';
// A square footprint overpopulates diagonal directions, exposing an edge when orbiting.
// Test actual generated samples and the shader's periodic movement, not source constants.
const source=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const context=vm.createContext({THREE,V:(...a)=>new THREE.Vector3(...a),scene:new THREE.Scene(),eye:new THREE.Vector3(),ringUniform:{uHole:{value:0},uPatch:{value:new THREE.Vector3()}},env:null,MU:37931000,TAU:Math.PI*2,state:{time:0},innerHeight:900});
vm.runInContext(source.slice(source.indexOf('// Locally resolved ring particles:'),source.indexOf('const sunYaw=')),context);
const data=vm.runInContext('({particles,grainPos,grainSpans,grainShader:grainMat.vertexShader,iceMat})',context);
const shader={uniforms:{},vertexShader:'#include <project_vertex>',fragmentShader:'#include <alphahash_fragment>'};
data.iceMat.onBeforeCompile(shader);
const glsl=vm.createContext({mod:(x,y)=>x-y*Math.floor(x/y)});
const iceZ=vm.runInContext(`(function(instanceMatrix,uIceTime,iceSpan){return ${shader.vertexShader.match(/float localZ=(.*?);/)[1]};})`,glsl);
const grainZ=vm.runInContext(`(function(p,uTime,span){return ${data.grainShader.match(/p\.z=(.*?);/)[1]};})`,glsl);
const results=[];
for(const time of [0,6000,86400,1e7]){
 const sectors=Array(8).fill(0);let expandedIce=0;
 for(const p of data.particles){const z=iceZ([null,null,null,p],time,p.span),r=Math.hypot(p.x,z);if(r>.25&&r<.5)expandedIce++;}
 assert.ok(expandedIce>1200,'Resolved detail abruptly disappears beyond the old square: '+expandedIce);
 for(let i=0;i<data.grainPos.length;i+=3){const x=data.grainPos[i],z=grainZ({x,z:data.grainPos[i+2]},time,data.grainSpans[i/3]),r=Math.hypot(x,z);if(r>2.1&&r<2.7){const a=(Math.atan2(z,x)+Math.PI*2)%(Math.PI*2);sectors[Math.floor(a/(Math.PI/4))]++;}}
 const ratio=Math.max(...sectors)/Math.min(...sectors);
 assert.ok(ratio<1.4,'Fine-grain density reveals a square border while orbiting: '+JSON.stringify(sectors));
 results.push({time,expandedIce,angularDensityRatio:ratio});
}
console.log(JSON.stringify({passed:true,results}));
