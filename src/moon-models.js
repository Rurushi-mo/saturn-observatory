import * as THREE from 'three';
// SPICE pck00011.tpc radii, ordered a,b,c; scene y is the polar axis.
export const moonAxes={mimas:[207.8,196.7,190.6],enceladus:[256.6,251.4,248.3],tethys:[538.4,528.3,526.3],dione:[563.4,561.3,559.6],rhea:[765,763.1,762.4],titan:[2575.15,2574.78,2574.47],hyperion:[180.1,133,102.7],iapetus:[745.7,745.7,712.1],phoebe:[109.4,108.5,101.8],janus:[101.7,93,76.3],epimetheus:[64.9,57.3,53],helene:[22.5,19.6,13.3],telesto:[16.3,11.8,9.8],calypso:[15.3,9.3,6.3],atlas:[20.5,17.8,9.4],prometheus:[68.2,41.6,28.2],pandora:[52.2,40.8,31.5],pan:[17.2,15.4,10.4],daphnis:[4.6,4.5,2.8]};
const profiles={phoebe:{seed:609,color:0x79726c,rough:.044,craters:120},janus:{seed:610,color:0xb7b4aa,rough:.055,craters:82},epimetheus:{seed:611,color:0xb9b4a7,rough:.064,craters:72},helene:{seed:612,color:0xd5d1c5,rough:.060,craters:30,smooth:true},telesto:{seed:613,color:0xd6d0bd,rough:.046,craters:23,smooth:true},calypso:{seed:614,color:0xcac5b4,rough:.072,craters:20,smooth:true},atlas:{seed:615,color:0xb5ada0,rough:.024,craters:22,ridge:.36},prometheus:{seed:616,color:0xb8b0a2,rough:.082,craters:58},pandora:{seed:617,color:0xb4b0a8,rough:.075,craters:70},pan:{seed:618,color:0xc4bbaa,rough:.028,craters:27,ridge:.28},daphnis:{seed:635,color:0xbdb5a7,rough:.034,craters:17,ridge:.09}};
export function reconstruction(id){
 const p=profiles[id];if(!p)throw new Error('No individual moon model: '+id);
 let seed=p.seed;const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const craters=Array.from({length:p.craters},()=>{const y=rand()*2-1,phi=rand()*Math.PI*2,r=Math.sqrt(1-y*y);return{normal:new THREE.Vector3(r*Math.cos(phi),y,r*Math.sin(phi)),width:.045+rand()**3*.30,depth:(p.smooth?.006:.014)+rand()*.045};});
 const geo=new THREE.SphereGeometry(1,192,128),positions=geo.attributes.position,colors=new Float32Array(positions.count*3),base=new THREE.Color(p.color),v=new THREE.Vector3();
 for(let i=0;i<positions.count;i++){
  v.fromBufferAttribute(positions,i).normalize();const {x,y,z}=v;
  const hills=(Math.sin(x*5.1+p.seed)*Math.cos(z*4.3+y*3.7)+.46*Math.sin(z*9+y*6+p.seed*.37));
  let height=1+p.rough*hills,dark=1;
  for(const c of craters){const d=Math.acos(THREE.MathUtils.clamp(v.dot(c.normal),-1,1))/c.width;if(d<1.4){height-=c.depth*Math.exp(-d*d*3);height+=c.depth*.23*Math.exp(-(((d-.88)/.14)**2));dark-=.11*Math.exp(-d*d*6);}}
  if(p.ridge)height+=p.ridge*Math.exp(-((y/.105)**2));
  const fine=Math.sin(x*65+y*47+p.seed)*Math.sin(z*57-x*31+p.seed*.4);
  height+=.002*fine;
  const a=moonAxes[id];positions.setXYZ(i,x*height*a[0],y*height*a[2],z*height*a[1]);
  const value=THREE.MathUtils.clamp(dark*(.92+.10*hills+.055*fine),.58,1.1);colors[i*3]=base.r*value;colors[i*3+1]=base.g*value;colors[i*3+2]=base.b*value;
 }
 // Keep the measured three-axis extent while retaining the individual terrain.
 geo.computeBoundingBox();const size=geo.boundingBox.getSize(v),a=moonAxes[id];geo.scale(a[0]*2/size.x,a[2]*2/size.y,a[1]*2/size.z);geo.center();geo.computeVertexNormals();geo.setAttribute('color',new THREE.BufferAttribute(colors,3));
 const object=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,metalness:0}));object.userData.modelKind='individual-reconstruction';return object;
}
export async function createMoon(id,{assets,loadModel}){
 const axes=moonAxes[id];if(!axes)throw new Error('Unknown moon: '+id);
 if(!assets[id])return reconstruction(id);
 const source=await loadModel(assets[id]);source.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(source),center=box.getCenter(new THREE.Vector3()),size=box.getSize(new THREE.Vector3());source.position.sub(center);
 const object=new THREE.Group();object.add(source);object.scale.set(axes[0]*2/size.x,axes[2]*2/size.y,axes[1]*2/size.z);
 object.traverse(o=>{if(o.isMesh){o.material.roughness=1;o.material.metalness=0;if(o.material.map){o.material.map.anisotropy=8;}}});
 if(id==='mimas')object.rotation.y=-2.74;
 object.userData.modelKind='NASA-VTAD-model';return object;
}
