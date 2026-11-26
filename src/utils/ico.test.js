import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { packPngIcons } from '../../scripts/ico.mjs';
test('favicon container retains decodable PNG images and correct size entries', async () => {
  const images=await Promise.all([16,32].map(async size=>({size,png:await sharp({create:{width:size,height:size,channels:4,background:'#123456'}}).png().toBuffer()})));
  const ico=packPngIcons(images);assert.equal(ico.readUInt16LE(2),1);assert.equal(ico.readUInt16LE(4),2);
  for(let i=0;i<images.length;i++){const entry=6+i*16;const offset=ico.readUInt32LE(entry+12),length=ico.readUInt32LE(entry+8);const metadata=await sharp(ico.subarray(offset,offset+length)).metadata();assert.equal(metadata.width,images[i].size);assert.equal(metadata.height,images[i].size);}
});
