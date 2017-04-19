
export function encode(s: string, buf?: Buffer, offset?: number): Buffer {
	if (!buf) { buf = Buffer.allocUnsafe(encodingLength(s)); }
	if (!offset) { offset = 0; }

	let len = buf.write(s, offset + 1);
	buf[offset] = len;
	encode_bytes = len + 1;
	return buf;
};

export let encode_bytes = 0;

export function decode(buf: Buffer, offset?: number): string {
	if (!offset) { offset = 0; }

	let len = buf[offset];
	let s = buf.toString("utf-8", offset + 1, offset + 1 + len);
	decode_bytes = len + 1;
	return s;
};

export let decode_bytes = 0;

export function encodingLength(s: string) {
	return Buffer.byteLength(s) + 1;
}
