export function encode(data: Buffer | string, buf?: Buffer, offset?: number): Buffer {
	if (!buf) { buf = Buffer.allocUnsafe(encodingLength(data)); }
	if (!offset) { offset = 0; }

	if (typeof data === "string") { data = Buffer.from(data); }
	if (!data) { data = Buffer.allocUnsafe(0); }

	let oldOffset = offset;
	offset += 2;

	let len = data.length;
	data.copy(buf, offset, 0, len);
	offset += len;

	buf.writeUInt16BE(offset - oldOffset - 2, oldOffset);
	encode_bytes = offset - oldOffset;
	return buf;
};

export let encode_bytes = 0;

export function decode(buf: Buffer, offset?: number) {
	if (!offset) { offset = 0; }
	let oldOffset = offset;
	let len = buf.readUInt16BE(offset);

	offset += 2;

	let data = buf.slice(offset, offset + len);
	offset += len;

	decode_bytes = offset - oldOffset;
	return data;
};

export let decode_bytes = 0;

export function encodingLength(data: Buffer | string) {
	if (!data) { return 2; }
	return (Buffer.isBuffer(data) ? data.length : Buffer.byteLength(data)) + 2;
}
