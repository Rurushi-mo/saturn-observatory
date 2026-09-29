import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const root=path.resolve(import.meta.dirname,'..'),read=p=>fs.readFileSync(path.join(root,p)),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const manifest=JSON.parse(read('archive/manifest.json'));
for(const item of manifest.files){const b=read(item.path);assert.equal(b.length,item.bytes);assert.equal(hash(b),item.sha256,item.path);}
const html=read('index.html').toString('utf8');
assert.ok(html.startsWith('<!DOCTYPE html>')||html.toLowerCase().startsWith('<!doctype html>'));
assert.ok(html.endsWith('</body></html>'));
assert.deepEqual([...html.matchAll(/data-style="([0-9])"/g)].map(m=>m[1]),['0','1','3']);
assert.ok(!/<(?:script|img|link)\b[^>]*(?:src|href)=["'](?:https?:)?\/\//i.test(html),'Runtime must be self-contained');
assert.ok(!/[A-Z]:[\\/]Users[\\/]/i.test(html),'Personal path in HTML');
assert.ok(!/gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{50,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(html),'Credential-like string');
const payload=html.match(/<script id="assets" type="application\/json">([\s\S]*?)<\/script>/);
assert.ok(payload,'Embedded payload missing');
const parsed=JSON.parse(payload[1]);
assert.deepEqual(parsed,JSON.parse(read('assets/embedded.json')));
assert.deepEqual(parsed.ephemeris,JSON.parse(read('assets/ephemeris.json')));
for(const [name,value]of Object.entries(parsed)){if(typeof value==='string'){assert.ok(/^data:(image\/|model\/gltf-binary)/.test(value),name);assert.ok(Buffer.from(value.split(',')[1],'base64').length>0,name);}}
assert.ok(html.includes('three.js authors')&&html.includes('Permission is hereby granted'));
const files=[];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){if(['.git','node_modules'].includes(entry.name))continue;const p=path.join(dir,entry.name);if(entry.isDirectory())walk(p);else files.push(p);}}
walk(root);
let total=0;
for(const p of files){const b=fs.readFileSync(p);total+=b.length;assert.ok(b.length<100*1024*1024,'GitHub file limit: '+p);if(/\.(?:js|mjs|json|md|html|txt|yml)$/.test(p)){const s=b.toString();assert.ok(!/gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{50,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(s),'Credential-like content: '+p);assert.ok(!/[A-Z]:[\\/]Users[\\/]/i.test(s),'Personal path: '+p);}}
console.log(JSON.stringify({passed:true,archivedFiles:manifest.files.length,files:files.length,totalBytes:total,indexBytes:read('index.html').length,indexSha256:hash(read('index.html')),externalRuntimeAssets:0,styles:3},null,2));
