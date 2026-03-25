/**
 * Compact MD5 for browser (Web Crypto has no MD5). Used for dev hash tools only.
 */

function rotateLeft(value: number, shift: number) {
  return (value << shift) | (value >>> (32 - shift));
}

function addUnsigned(x: number, y: number) {
  const lsw = (x & 0xffff) + (y & 0xffff);
  const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xffff);
}

function wordToHex(value: number) {
  let hex = "";
  for (let i = 0; i <= 3; i++) {
    const byte = (value >>> (i * 8)) & 255;
    hex += ("0" + byte.toString(16)).slice(-2);
  }
  return hex;
}

function utf8Encode(str: string) {
  str = str.replace(/\r\n/g, "\n");
  let utftext = "";
  for (let n = 0; n < str.length; n++) {
    const c = str.charCodeAt(n);
    if (c < 128) utftext += String.fromCharCode(c);
    else if (c < 2048) {
      utftext += String.fromCharCode((c >> 6) | 192);
      utftext += String.fromCharCode((c & 63) | 128);
    } else {
      utftext += String.fromCharCode((c >> 12) | 224);
      utftext += String.fromCharCode(((c >> 6) & 63) | 128);
      utftext += String.fromCharCode((c & 63) | 128);
    }
  }
  return utftext;
}

function md5Block(block: number[], chain: number[]) {
  const [a0, b0, c0, d0] = chain;

  function ff(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    return addUnsigned(rotateLeft(addUnsigned(addUnsigned(a, (b & c) | (~b & d)), addUnsigned(x, ac)), s), b);
  }
  function gg(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    return addUnsigned(rotateLeft(addUnsigned(addUnsigned(a, (b & d) | (c & ~d)), addUnsigned(x, ac)), s), b);
  }
  function hh(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    return addUnsigned(rotateLeft(addUnsigned(addUnsigned(a, b ^ c ^ d), addUnsigned(x, ac)), s), b);
  }
  function ii(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    return addUnsigned(rotateLeft(addUnsigned(addUnsigned(a, c ^ (b | ~d)), addUnsigned(x, ac)), s), b);
  }

  let a = a0;
  let b = b0;
  let c = c0;
  let d = d0;

  const x = block;

  a = ff(a, b, c, d, x[0], 7, 3614090360);
  d = ff(d, a, b, c, x[1], 12, 3905402710);
  c = ff(c, d, a, b, x[2], 17, 606105819);
  b = ff(b, c, d, a, x[3], 22, 3250441966);
  a = ff(a, b, c, d, x[4], 7, 4118548399);
  d = ff(d, a, b, c, x[5], 12, 1200080426);
  c = ff(c, d, a, b, x[6], 17, 2821735955);
  b = ff(b, c, d, a, x[7], 22, 4249261313);
  a = ff(a, b, c, d, x[8], 7, 1770035416);
  d = ff(d, a, b, c, x[9], 12, 2336552879);
  c = ff(c, d, a, b, x[10], 17, 4294925233);
  b = ff(b, c, d, a, x[11], 22, 2304563134);
  a = ff(a, b, c, d, x[12], 7, 1804603682);
  d = ff(d, a, b, c, x[13], 12, 4254626195);
  c = ff(c, d, a, b, x[14], 17, 2792965006);
  b = ff(b, c, d, a, x[15], 22, 1236535329);

  a = gg(a, b, c, d, x[1], 5, 4129170786);
  d = gg(d, a, b, c, x[6], 9, 3225465664);
  c = gg(c, d, a, b, x[11], 14, 643717713);
  b = gg(b, c, d, a, x[0], 20, 3921069994);
  a = gg(a, b, c, d, x[5], 5, 3593408605);
  d = gg(d, a, b, c, x[10], 9, 38016083);
  c = gg(c, d, a, b, x[15], 14, 3634488961);
  b = gg(b, c, d, a, x[4], 20, 3889429448);
  a = gg(a, b, c, d, x[9], 5, 568446438);
  d = gg(d, a, b, c, x[14], 9, 3275163606);
  c = gg(c, d, a, b, x[3], 14, 4107603335);
  b = gg(b, c, d, a, x[8], 20, 1163531501);
  a = gg(a, b, c, d, x[13], 5, 2850285829);
  d = gg(d, a, b, c, x[2], 9, 4243563512);
  c = gg(c, d, a, b, x[7], 14, 1735328473);
  b = gg(b, c, d, a, x[12], 20, 2368359562);

  a = hh(a, b, c, d, x[5], 4, 4294588738);
  d = hh(d, a, b, c, x[8], 11, 2272392833);
  c = hh(c, d, a, b, x[11], 16, 1839030562);
  b = hh(b, c, d, a, x[14], 23, 4259657740);
  a = hh(a, b, c, d, x[1], 4, 2763975236);
  d = hh(d, a, b, c, x[4], 11, 1272893353);
  c = hh(c, d, a, b, x[7], 16, 4139469664);
  b = hh(b, c, d, a, x[10], 23, 3200236656);
  a = hh(a, b, c, d, x[13], 4, 681279174);
  d = hh(d, a, b, c, x[0], 11, 3936430074);
  c = hh(c, d, a, b, x[3], 16, 3572445317);
  b = hh(b, c, d, a, x[6], 23, 76029189);
  a = hh(a, b, c, d, x[9], 4, 3654602809);
  d = hh(d, a, b, c, x[12], 11, 3873151461);
  c = hh(c, d, a, b, x[15], 16, 530742520);
  b = hh(b, c, d, a, x[2], 23, 3299628645);

  a = ii(a, b, c, d, x[0], 6, 4096336452);
  d = ii(d, a, b, c, x[7], 10, 1126891415);
  c = ii(c, d, a, b, x[14], 15, 2878612391);
  b = ii(b, c, d, a, x[5], 21, 4237533241);
  a = ii(a, b, c, d, x[12], 6, 1700485571);
  d = ii(d, a, b, c, x[3], 10, 2399980690);
  c = ii(c, d, a, b, x[10], 15, 4293915773);
  b = ii(b, c, d, a, x[1], 21, 2240044497);
  a = ii(a, b, c, d, x[8], 6, 1873313359);
  d = ii(d, a, b, c, x[15], 10, 4264355552);
  c = ii(c, d, a, b, x[6], 15, 2734768916);
  b = ii(b, c, d, a, x[13], 21, 1309151649);
  a = ii(a, b, c, d, x[4], 6, 4149444226);
  d = ii(d, a, b, c, x[11], 10, 3174756917);
  c = ii(c, d, a, b, x[2], 15, 718787259);
  b = ii(b, c, d, a, x[9], 21, 3951481745);

  chain[0] = addUnsigned(chain[0], a);
  chain[1] = addUnsigned(chain[1], b);
  chain[2] = addUnsigned(chain[2], c);
  chain[3] = addUnsigned(chain[3], d);
}

export function md5Hex(message: string): string {
  const msg = utf8Encode(message);
  const msgLength = msg.length * 8;
  const nPadded = (((msg.length + 8) >>> 6) + 1) << 4;
  const padded = new Array<number>(nPadded);
  for (let i = 0; i < nPadded; i++) padded[i] = 0;
  let k = 0;
  for (let i = 0; i < msg.length; i++) {
    padded[k >> 2] |= msg.charCodeAt(i) << ((k % 4) * 8);
    k++;
  }
  padded[k >> 2] |= 0x80 << ((k % 4) * 8);
  padded[nPadded - 2] = msgLength & 0xffffffff;
  padded[nPadded - 1] = Math.floor(msgLength / 0x100000000);

  const chain = [1732584193, 4023233417, 2562383102, 271733878];

  for (let i = 0; i < nPadded; i += 16) {
    const block: number[] = [];
    for (let j = 0; j < 16; j++) {
      block.push(padded[i + j] ?? 0);
    }
    md5Block(block, chain);
  }

  return wordToHex(chain[0]) + wordToHex(chain[1]) + wordToHex(chain[2]) + wordToHex(chain[3]);
}
