import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {starCatalogue,galaxyCatalogue} from '../astralis-vr-space.js';

test('space catalogues have finite positions, varied brightness and reproducible geometry',()=>{
  for(const create of [starCatalogue,galaxyCatalogue]){
    const data=create(500,1928);
    assert.deepEqual(data,create(500,1928));
    assert.equal(data.positions.length,1500);assert.equal(data.colors.length,1500);
    assert.equal(data.sizes.length,500);assert.equal(data.brightness.length,500);
    assert.ok(Object.values(data).flat().every(Number.isFinite));
    assert.ok(Math.max(...data.sizes)-Math.min(...data.sizes)>.5);
    assert.ok(Math.max(...data.brightness)-Math.min(...data.brightness)>.4);
    assert.notDeepEqual(data,create(500,1929));
  }
});

test('NASA asteroid assets contain dimensional meshes and self-contained surface textures',()=>{
  for(const name of ['bennu','eros']){
    const bytes=fs.readFileSync(new URL('../assets/deep-space/nasa-'+name+'.glb',import.meta.url));
    assert.equal(bytes.toString('ascii',0,4),'glTF');assert.equal(bytes.readUInt32LE(4),2);
    assert.equal(bytes.readUInt32LE(8),bytes.length);
    const size=bytes.readUInt32LE(12),gltf=JSON.parse(bytes.toString('utf8',20,20+size));
    assert.ok(gltf.buffers.every(b=>!b.uri),'geometry is embedded');
    assert.ok(gltf.images.length>0&&gltf.images.every(i=>Number.isInteger(i.bufferView)),'textures are embedded');
    const primitive=gltf.meshes[0].primitives[0],position=gltf.accessors[primitive.attributes.POSITION];
    assert.ok(position.count>500);assert.ok(gltf.accessors[primitive.indices].count>3000);
    assert.ok(position.max.every((v,i)=>v-position.min[i]>.01),'mesh has depth on all axes');
    assert.ok(Number.isInteger(primitive.attributes.NORMAL));assert.ok(Number.isInteger(primitive.attributes.TEXCOORD_0));
    if(name==='eros')assert.ok(gltf.materials[0].normalTexture,'Eros keeps its original normal map');
  }
});
