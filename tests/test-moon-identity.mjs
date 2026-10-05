import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import * as THREE from 'three';
const source=fs.readFileSync(new URL('../src/main.js',import.meta.url),'utf8');
const A=JSON.parse(fs.readFileSync(new URL('../assets/embedded.json',import.meta.url)));
const moonSpecs=JSON.parse(source.match(/const moonSpecs=(\[\[.*?\]\]);/)[1].replaceAll("'",'"'));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function texture(encoded){const t=new THREE.Texture();t.userData.identity=hash(encoded);return t;}
async function model(encoded){
 const b=Buffer.from(encoded.split(',')[1],'base64'),length=b.readUInt32LE(12),j=JSON.parse(b.subarray(20,20+length)),bin=b.subarray(28+length);
 const buildNode=index=>{const node=j.nodes[index],group=new THREE.Group();
  if(node.matrix){group.applyMatrix4(new THREE.Matrix4().fromArray(node.matrix));}else{if(node.translation)group.position.fromArray(node.translation);if(node.rotation)group.quaternion.fromArray(node.rotation);if(node.scale)group.scale.fromArray(node.scale);}
  if(node.mesh!==undefined)for(const primitive of j.meshes[node.mesh].primitives){const a=j.accessors[primitive.attributes.POSITION],v=j.bufferViews[a.bufferView];assert.equal(a.componentType,5126);const pos=new Float32Array(a.count*3);for(let i=0;i<a.count;i++)for(let c=0;c<3;c++)pos[i*3+c]=bin.readFloatLE((v.byteOffset||0)+(a.byteOffset||0)+i*(v.byteStride||12)+c*4);const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));const mat=new THREE.MeshStandardMaterial();const tex=j.materials?.[primitive.material]?.pbrMetallicRoughness?.baseColorTexture;if(tex){const image=j.images[j.textures[tex.index].source],iv=j.bufferViews[image.bufferView];mat.map=new THREE.Texture();mat.map.userData.identity=hash(bin.subarray(iv.byteOffset||0,(iv.byteOffset||0)+iv.byteLength));}group.add(new THREE.Mesh(geo,mat));}
  for(const c of node.children||[])group.add(buildNode(c));return group;};
 const group=new THREE.Group();for(const n of j.scenes[j.scene||0].nodes)group.add(buildNode(n));return group;
}
let createMoon;if(fs.existsSync(new URL('../src/moon-models.js',import.meta.url)))({createMoon}=await import('../src/moon-models.js'));
const context=vm.createContext({THREE,A,ep:A.ephemeris,moonSpecs,createMoon,model,texture,V:(...a)=>new THREE.Vector3(...a),shell(){},anchored(o){return o;},$(){return{append(){}}},document:{createElement(){return{}}}});
export const modelBounds={};
await vm.runInContext('(async()=>{'+source.slice(source.indexOf('const bodies='),source.indexOf('// Permanent polar curtains'))+';return bodies;})()',context).then(bodies=>{
 const identities=new Map();for(const [id,b]of Object.entries(bodies)){const identitiesForBody=[];b.object.traverse(o=>{if(o.isMesh){if(o.material.map)identitiesForBody.push(o.material.map.userData.identity);else if(o.geometry.attributes.color)identitiesForBody.push(hash(Buffer.from(o.geometry.attributes.color.array.buffer)));}});assert.ok(identitiesForBody.length,'Missing independent surface for '+id);modelBounds[id]=b.maxRadius;const identity=identitiesForBody.join(':');assert.ok(!identities.has(identity),`${id} reuses the surface of ${identities.get(identity)}`);identities.set(identity,id);b.object.updateMatrixWorld(true);const size=new THREE.Box3().setFromObject(b.object).getSize(new THREE.Vector3());assert.ok(size.toArray().every(x=>Number.isFinite(x)&&x>0));}assert.equal(identities.size,19);
 console.log(JSON.stringify({passed:true,independentMoonSurfaces:identities.size}));
});
