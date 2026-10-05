import fs from 'node:fs';import assert from 'node:assert/strict';import {ShaderChunk} from 'three';
const url=new URL('../src/shader-support.js',import.meta.url);
let normalizeShader=s=>s;if(fs.existsSync(url))({normalizeShader}=await import(url));
const vertex=normalizeShader('varying vec3 vP;#include <logdepthbuf_pars_vertex>\nvoid main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);#include <logdepthbuf_vertex>}','vertex');
assert.ok(vertex.includes('#include <common>'),'Log-depth vertex shaders need Three.js common functions');
const expanded=vertex.replace(/#include <([^>]+)>/g,(_,name)=>ShaderChunk[name]);
assert.ok(expanded.includes('bool isPerspectiveMatrix'));
assert.ok(!/#endif\}/.test(expanded),'Preprocessor directive must end before closing brace');
console.log(JSON.stringify({passed:true,logDepthFunctionsPresent:true,directivesSeparated:true}));
