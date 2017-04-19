export function encode(data: Buffer, buf?: Buffer, offset?: number): Buffer {
	if (!buf) { buf = Buffer.allocUnsafe(encodingLength(data)); }
	if (!offset) { offset = 0; }

	buf.writeUInt16BE(data.length, offset);
	data.copy(buf, offset + 2);

	encode_bytes = data.length + 2;
	return buf;
};

export let encode_bytes = 0;

export function decode(buf: Buffer, offset?: number) {
	if (!offset) { offset = 0; }

	let len = buf.readUInt16BE(offset);
	let data = buf.slice(offset + 2, offset + 2 + len);
	decode_bytes = len + 2;
	return data;
};

export let decode_bytes = 0;

export function encodingLength(data: Buffer) {
	return data.length + 2;
}
