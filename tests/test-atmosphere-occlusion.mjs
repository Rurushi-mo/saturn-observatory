import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
// Optional GPU regression: uses an isolated headless browser, never the user's open tabs.
// Install Playwright separately, or provide its module URL in SATURN_PLAYWRIGHT_MODULE.
const {chromium}=await import(process.env.SATURN_PLAYWRIGHT_MODULE||'playwright');
const source=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const common=source.match(/const common=`([\s\S]*?)`;/)[1];
const post=source.slice(source.indexOf('const rt=new THREE.WebGLRenderTarget'),source.indexOf('function resize()'));
const fixture=`
import * as THREE from 'three';
import {prepareShaderMaterials} from './shader-support.js';
const V=(...a)=>new THREE.Vector3(...a),eye=V(),Sun=V(-.619,.433,.655).normalize(),common=${JSON.stringify(common)};
const quadGeo=new THREE.PlaneGeometry(2,2),screenVert='varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
const bodies={titan:{position:V(1e8,0,0)}};
const camera=new THREE.PerspectiveCamera(38,1,.0000002,3e8),screenCamera=new THREE.Camera();
${post}
prepareShaderMaterials(postScene);
const renderer=new THREE.WebGLRenderer({antialias:false,logarithmicDepthBuffer:true});
renderer.autoClear=false;renderer.outputColorSpace=THREE.LinearSRGBColorSpace;renderer.toneMapping=THREE.NoToneMapping;
renderer.setSize(257,257);document.body.append(renderer.domElement);rt.setSize(257,257);
const output=new THREE.WebGLRenderTarget(257,257,{depthBuffer:false});
const world=new THREE.Scene();world.background=new THREE.Color(.12,.06,.025);
const surface=new THREE.Mesh(new THREE.PlaneGeometry(2e7,2e7),new THREE.MeshBasicMaterial({color:new THREE.Color(.12,.06,.025)}));world.add(surface);
postU.uResolution.value.set(257,257);postU.uRot.value.identity();postU.uAspect.value=1;postU.uTan.value=Math.tan(19*Math.PI/180);postU.uAltitude.value=10000;
window.testHalo=(kind,foreground,samples,control=false,options={})=>{
 const {distance=10000,partial=false,probe=128,offAxis=false}=options;
 rt.dispose();rt.samples=samples;surface.visible=foreground;surface.scale.setScalar(distance*1e-6);surface.position.set(partial?-distance*10:0,0,-distance);
 camera.fov=partial?.1:38;camera.updateProjectionMatrix();postU.uTan.value=Math.tan(camera.fov*.5*Math.PI/180);
 eye.set(kind==='saturn'?60280:2575.7,0,2e6);postU.uTitan.value.set(kind==='titan'?0:1e8,0,0);
 if(offAxis){const ray=V(((probe+.5)/257-.5)*2*postU.uTan.value,0,-1),length=ray.length(),direction=ray.normalize(),normal=V(-direction.z,0,direction.x);eye.copy(normal.multiplyScalar(60280)).addScaledVector(direction,-(distance*length-2000));}
 // The baseline is the same foreground colour with both atmospheres off the ray.
 if(control){eye.x=1e8;postU.uTitan.value.set(0,0,0);}
 renderer.setRenderTarget(rt);renderer.clear();renderer.render(world,camera);
 renderer.setRenderTarget(output);renderer.clear();renderer.render(postScene,screenCamera);
 const pixels=new Uint8Array(4);renderer.readRenderTargetPixels(output,probe,128,1,1,pixels);
 renderer.setRenderTarget(null);renderer.clear();renderer.render(postScene,screenCamera);
 return [...pixels];
};
window.fixtureReady=true;
`;
const bundle=await build({stdin:{contents:fixture,resolveDir:path.resolve(import.meta.dirname,'../src'),sourcefile:'occlusion-fixture.js',loader:'js'},bundle:true,format:'iife',write:false});
const html='<canvas hidden></canvas><script>'+bundle.outputFiles[0].text.replaceAll('</script','<\\/script')+'</script>';
const server=http.createServer((req,res)=>{res.writeHead(200,{'Content-Type':'text/html'});res.end(html);});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;const errors=[],results=[];
try{
 browser=await chromium.launch({headless:true,...(process.env.SATURN_BROWSER_PATH?{executablePath:process.env.SATURN_BROWSER_PATH}:{}),args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>window.fixtureReady);
 for(const samples of [0,4])for(const kind of ['saturn','titan'])for(const distance of [.004,10000]){
  const values=await page.evaluate(({kind,samples,distance})=>({base:window.testHalo(kind,true,samples,true,{distance}),blocked:window.testHalo(kind,true,samples,false,{distance}),visible:window.testHalo(kind,false,samples)}),{kind,samples,distance});
  const blockedDelta=Math.max(...values.blocked.slice(0,3).map((c,i)=>Math.abs(c-values.base[i])));
  const visibleDelta=Math.max(...values.visible.slice(0,3).map((c,i)=>Math.abs(c-values.base[i])));
  results.push({kind,samples,distance,blockedDelta,visibleDelta,pixels:values});
  assert.ok(blockedDelta<=1,'Background '+kind+' atmosphere shines through an opaque foreground: '+JSON.stringify(results.at(-1)));
  assert.ok(visibleDelta>=3,'Unobscured '+kind+' limb must remain visible');
 }
 // Cover only the left half of the atmosphere: keep the exposed limb on the right.
 const partial=await page.evaluate(()=>({left:window.testHalo('saturn',true,4,false,{partial:true,probe:127}),leftBase:window.testHalo('saturn',true,4,true,{partial:true,probe:127}),right:window.testHalo('saturn',true,4,false,{partial:true,probe:129}),rightBase:window.testHalo('saturn',true,4,true,{partial:true,probe:129})}));
 const leftDelta=Math.max(...partial.left.slice(0,3).map((c,i)=>Math.abs(c-partial.leftBase[i]))),rightDelta=Math.max(...partial.right.slice(0,3).map((c,i)=>Math.abs(c-partial.rightBase[i])));
 assert.ok(leftDelta<=1,'Covered part of the limb leaks through');assert.ok(rightDelta>=3,'Exposed part of the limb was erased');
 // Depth is view-space Z: at an oblique screen pixel it must be converted to ray distance.
 const offAxis=await page.evaluate(()=>({base:window.testHalo('saturn',true,4,true,{distance:2e6,probe:200,offAxis:true}),visible:window.testHalo('saturn',true,4,false,{distance:2e6,probe:200,offAxis:true})}));
 const offAxisDelta=Math.max(...offAxis.visible.slice(0,3).map((c,i)=>Math.abs(c-offAxis.base[i])));
 assert.ok(offAxisDelta>=3,'Oblique ray incorrectly clips atmosphere in front of the surface');
 assert.deepEqual(errors,[],'GPU shader compilation / runtime errors');
 console.log(JSON.stringify({passed:true,results,partial:{leftDelta,rightDelta},offAxisDelta}));
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
