import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import * as THREE from 'three';
const source=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const context=vm.createContext({THREE,V:(...a)=>new THREE.Vector3(...a),scene:new THREE.Scene(),eye:new THREE.Vector3(),ringUniform:{uHole:{value:0},uPatch:{value:new THREE.Vector3()}},env:null,MU:37931000,TAU:Math.PI*2,state:{time:0},innerHeight:900});
vm.runInContext(source.slice(source.indexOf('// Locally resolved ring particles:'),source.indexOf('const sunYaw=')),context);
const data=vm.runInContext('({particles,ice,iceMat,grainPos})',context);
const near=data.particles.filter(p=>Math.hypot(p.x,p.z)<.05);
const center=data.particles.filter(p=>Math.hypot(p.x,p.z)<.005);
const densityRatio=(center.length/(Math.PI*.005**2))/(near.length/(Math.PI*.05**2));
assert.ok(densityRatio<2,'Artificial central density cusp: '+densityRatio);
const giantFraction=near.filter(p=>p.size>.001).length/near.length;
assert.ok(giantFraction<.06,'Metre-radius blocks dominate the local view: '+giantFraction);
for(const p of data.particles)assert.ok(Math.abs(p.y)+p.size*1.25<=.0051,'Particle extends beyond the approximate 10-metre layer');
assert.ok(near.length>300,'Keep a resolved near field instead of removing the ice');
// Exercise the actual GPU periodic shear; a near tile must stay uniform after hours of simulated time.
const shader={uniforms:{},vertexShader:'#include <project_vertex>',fragmentShader:'#include <alphahash_fragment>'};data.iceMat.onBeforeCompile(shader);
const expr=shader.vertexShader.match(/float localZ=(.*?);/)[1];
const moveZ=vm.runInContext(`(function(instanceMatrix,uIceTime,iceSpan){return ${expr};})`,vm.createContext({mod:(x,y)=>x-y*Math.floor(x/y)}));
assert.ok(shader.fragmentShader.includes('diffuseColor.a*=vIceLod'));
const times=[0,6000,86400,1e7];let maxLaterDensityRatio=0;
for(const time of times){let a=0,b=0;for(const p of data.particles){const z=moveZ([null,null,null,p],time,p.span),r=Math.hypot(p.x,z);assert.ok(Number.isFinite(z)&&Math.abs(z)<=p.span*.5+1e-8);if(r<.005)a++;if(r<.05)b++;}const ratio=a*100/b;assert.ok(ratio<2,'Shear re-creates a concentrated wall at '+time+' seconds');maxLaterDensityRatio=Math.max(maxLaterDensityRatio,ratio);}
console.log(JSON.stringify({passed:true,centerDensityRatio:densityRatio,nearParticleCount:near.length,largeRadiusFraction:giantFraction,maxLaterDensityRatio,simulatedTimesSeconds:times}));
