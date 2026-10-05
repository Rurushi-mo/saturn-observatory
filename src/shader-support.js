// Keep Three.js chunk directives on their own lines across GLSL drivers.
export function normalizeShader(source,stage){
 if(stage==='vertex'&&!source.includes('#include <common>'))source='#include <common>\n'+source;
 return source.replace(/#include <([^>]+)>/g,'\n#include <$1>\n');
}
export function prepareShaderMaterials(...scenes){
 const materials=new Set();for(const scene of scenes)scene.traverse(o=>{if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);});
 for(const m of materials)if(m.isShaderMaterial){m.vertexShader=normalizeShader(m.vertexShader,'vertex');m.fragmentShader=normalizeShader(m.fragmentShader,'fragment');m.needsUpdate=true;}
}
