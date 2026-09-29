import * as THREE from 'three';
const V=()=>new THREE.Vector3(),clamp=THREE.MathUtils.clamp;
export const ease=t=>t*t*t*(t*(t*6-15)+10);
const line=(a,b)=>({kind:'line',a:a.clone(),b:b.clone(),at:t=>a.clone().lerp(b,t)});
export function clearance(point,obstacle){return point.clone().sub(obstacle.center).divide(obstacle.axes).length();}
export function blocked(a,b,o){const p=a.clone().sub(o.center).divide(o.axes),d=b.clone().sub(a).divide(o.axes);const t=clamp(-p.dot(d)/Math.max(d.lengthSq(),1e-30),0,1);return p.addScaledVector(d,t).length()<1-1e-10;}
function detour(a,b,o){
 if(!blocked(a,b,o))return[line(a,b)];
 const p=a.clone().sub(o.center).divide(o.axes),q=b.clone().sub(o.center).divide(o.axes),ra=p.length(),rb=q.length();
 if(ra<1-1e-8||rb<1-1e-8)throw Error('Camera endpoint inside obstacle '+o.name);
 const x=p.clone().normalize(),qhat=q.clone().normalize(),angle=Math.acos(clamp(x.dot(qhat),-1,1));
 let y=qhat.clone().addScaledVector(x,-Math.cos(angle));
 if(y.lengthSq()<1e-16){y=V().crossVectors(x,new THREE.Vector3(0,1,0));if(y.lengthSq()<1e-10)y.crossVectors(x,new THREE.Vector3(1,0,0));}y.normalize();
 const alpha=Math.acos(clamp(1/ra,-1,1)),beta=Math.acos(clamp(1/rb,-1,1));
 const map=theta=>x.clone().multiplyScalar(Math.cos(theta)).addScaledVector(y,Math.sin(theta)).multiply(o.axes).add(o.center);
 const ta=map(alpha),tb=map(angle-beta);
 return[line(a,ta),{kind:'arc',a:ta,b:tb,at:t=>map(THREE.MathUtils.lerp(alpha,angle-beta,t))},line(tb,b)];
}
export function planRoute(start,end,obstacles){
 let pieces=[line(start,end)];
 for(const o of obstacles){pieces=pieces.flatMap(piece=>piece.kind==='line'?detour(piece.a,piece.b,o):[piece]);}
 const segments=[];let length=0;
 for(const p of pieces){const samples=p.kind==='arc'?256:1;let prev=p.at(0),local=0;const table=[0];for(let i=1;i<=samples;i++){const point=p.at(i/samples);local+=point.distanceTo(prev);table.push(local);prev=point;}if(local<1e-10)continue;segments.push({...p,start:length,length:local,table,samples});length+=local;}
 function atDistance(s){if(!segments.length)return start.clone();s=clamp(s,0,length);const p=segments.find(p=>s<=p.start+p.length)||segments.at(-1);let d=s-p.start;if(p.kind==='line')return p.at(clamp(d/p.length,0,1));let lo=0,hi=p.samples;while(lo+1<hi){const m=(lo+hi)>>1;if(p.table[m]<d)lo=m;else hi=m;}const t=(lo+(d-p.table[lo])/Math.max(1e-20,p.table[hi]-p.table[lo]))/p.samples;return p.at(clamp(t,0,1));}
 return{length,segments,atDistance};
}
// Integrating inverse speed by distance gives a slow departure and arrival at every scale.
export function flightDistance(t,length,startScale,endScale){if(length<1e-10)return 0;const a=Math.max(.003,startScale),b=Math.max(.003,endScale),total=Math.log1p(length/a)+Math.log1p(length/b),e=Math.exp(total*ease(clamp(t,0,1)));return clamp(a*(length+b)*(e-1)/(length+b+e*a),0,length);}
export function orientation(eye,target,up){const m=new THREE.Matrix4().lookAt(eye,target,up);return new THREE.Quaternion().setFromRotationMatrix(m);}
export function coneDirection(axis,north,east,azimuth,tilt){return axis.clone().multiplyScalar(Math.cos(tilt)).addScaledVector(north,Math.sin(tilt)*Math.cos(azimuth)).addScaledVector(east,Math.sin(tilt)*Math.sin(azimuth)).normalize();}
