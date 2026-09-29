import fs from 'node:fs';
import vm from 'node:vm';
import {planRoute,flightDistance,orientation,coneDirection,ease} from '../src/navigation.js';
import * as THREE from 'three';
const source=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const ep=JSON.parse(fs.readFileSync(new URL('../assets/ephemeris.json',import.meta.url),'utf8'));
const spec=JSON.parse(source.match(/const moonSpecs=(\[\[.*?\]\]);/)[1].replaceAll("'",'"'));
const V=(...a)=>new THREE.Vector3(...a),el={classList:{add(){},remove(){},toggle(){}},style:{},textContent:''};
const state={scene:'classic',yaw:0,pitch:0,zoom:1,transit:null};let now=0;
const context=vm.createContext({planRoute,flightDistance,orientation,coneDirection,ease,THREE,V,ep,state,R:60268,RP:54364,DEG:Math.PI/180,Sun:V(-.619,.433,.655).normalize(),zero:V(),patch:V(129500,0,0),cassiniPos:V(...ep.cassini.position),bodies:Object.fromEntries(spec.map(([id,name,radius])=>[id,{name,radius,position:V(...ep[id].position)}])),eye:V(),look:V(),up:V(0,1,0),camera:new THREE.PerspectiveCamera(38,1.6,.001,3e8),innerWidth:1440,innerHeight:900,clamp:THREE.MathUtils.clamp,mix:THREE.MathUtils.lerp,performance:{now:()=>now},$:()=>el,document:{querySelector:()=>el,querySelectorAll:()=>[]},console});
vm.runInContext(source.slice(source.indexOf('const sunYaw='),source.indexOf('// Direction-fixed star field')),context);
const ids=['classic','wide','cloud','ring','edge','backlit','hex','aurora','ice','atmos','cassini','titan','enceladus','mimas'];
let paths=0,samples=0,maxEndpointError=0,maxStartError=0;
for(const from of ids)for(const to of ids){state.scene=from;state.yaw=.06;state.pitch=.025;state.zoom=1.02;const a=vm.runInContext('destination()',context);context.eye.copy(a.eye);context.look.copy(a.target);context.up.copy(a.up);context.camera.fov=a.fov;state.scene=to;state.yaw=state.pitch=0;state.zoom=1;now=0;vm.runInContext('startMove()',context);const duration=state.transit.duration;const end=state.transit.end.eye.clone();for(let i=0;i<=100;i++){now=duration*i/100;vm.runInContext(`updateCamera(${now},.016)`,context);const p=context.eye;const ell=Math.hypot(p.x/60268,p.y/54364,p.z/60268);if(!p.toArray().every(Number.isFinite)||ell<1)throw Error(`Invalid ${from} -> ${to}: ${ell}`);if(i===0)maxStartError=Math.max(maxStartError,p.distanceTo(a.eye));for(const o of vm.runInContext('obstacles',context)){const c=p.clone().sub(o.center).divide(o.axes).length();if(c<1-1e-8)throw Error(`Body collision ${from} -> ${to}`);}samples++;}maxEndpointError=Math.max(maxEndpointError,context.eye.distanceTo(end));paths++;}
if(maxStartError>.000001||maxEndpointError>.000001)throw Error('Camera discontinuity');
const controls=source.slice(source.indexOf('function adjust('),source.indexOf("$('universe').addEventListener('pointerdown'"));vm.runInContext(controls,context);
for(const shot of ids.filter(x=>!['classic','wide'].includes(x))){state.scene=shot;state.transit=null;vm.runInContext('adjust(100,100);zoom(1e9)',context);const l=vm.runInContext('currentPreset().limits',context);if(Math.abs(state.yaw)>l.yaw||Math.abs(state.pitch)>l.pitch||state.zoom>l.max)throw Error('Positive limit failed '+shot);vm.runInContext('adjust(-100,-100);zoom(1e-9)',context);if(Math.abs(state.yaw)>l.yaw||Math.abs(state.pitch)>l.pitch||state.zoom<l.min)throw Error('Negative limit failed '+shot);}
state.scene='cassini';state.transit=null;vm.runInContext('adjust(10,10)',context);if(Math.abs(state.yaw)<5||Math.abs(state.pitch)<5)throw Error('Free spacecraft orbit is clamped');
console.log(JSON.stringify({passed:true,paths,samples,maxStartErrorKm:maxStartError,maxEndpointErrorKm:maxEndpointError,zoomRestrictedViews:12},null,2));
