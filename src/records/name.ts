export function encode(n: string, buf?: Buffer, offset?: number): Buffer {
	if (!buf) { buf = Buffer.allocUnsafe(encodingLength(n)); }
	if (!offset) { offset = 0; }

	let list = n.split(".");
	let oldOffset = offset;

	for (let item of list) {
		let len = buf.write(item, offset + 1);
		buf[offset] = len;
		offset += len + 1;
	}

	buf[offset++] = 0;

	encode_bytes = offset - oldOffset;
	return buf;
};

export let encode_bytes = 0;

export function decode(buf: Buffer, offset?: number): string {
	if (!offset) { offset = 0; }

	let list = [];
	let oldOffset = offset;
	let len = buf[offset++];

	if (len >= 0xc0) {
		let res = decode(buf, buf.readUInt16BE(offset - 1) - 0xc000);
		decode_bytes = 2;
		return res;
	}

	while (len) {
		if (len >= 0xc0) {
			list.push(decode(buf, buf.readUInt16BE(offset - 1) - 0xc000));
			offset++;
			break;
		}

		list.push(buf.toString("utf-8", offset, offset + len));
		offset += len;
		len = buf[offset++];
	}

	decode_bytes = offset - oldOffset;
	return list.join(".");
};

export let decode_bytes = 0;

export function encodingLength(n: string): number {
	return Buffer.byteLength(n) + 2;
}
