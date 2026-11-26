// ICO supports PNG-compressed image entries. Keeping the already generated PNG
// bytes avoids an obsolete decoder/downloader dependency chain.
export const packPngIcons = (images) => {
  if (!images.length || images.length > 256) throw new Error('Invalid icon count.');
  const header = Buffer.alloc(6 + images.length * 16);
  header.writeUInt16LE(1, 2); header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, png }, index) => {
    if (!Number.isInteger(size) || size < 1 || size > 256 || png.length < 24
      || png.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a'
      || png.readUInt32BE(16) !== size || png.readUInt32BE(20) !== size) throw new Error('Invalid PNG icon.');
    const entry = 6 + index * 16;
    header[entry] = size === 256 ? 0 : size; header[entry + 1] = header[entry];
    header.writeUInt16LE(1, entry + 4); header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(png.length, entry + 8); header.writeUInt32LE(offset, entry + 12);
    offset += png.length;
  });
  return Buffer.concat([header, ...images.map(image => image.png)]);
};
