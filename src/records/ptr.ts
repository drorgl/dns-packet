import * as name from "./name";

export function encode(data: string, buf?: Buffer, offset?: number): Buffer {
	if (!buf) { buf = Buffer.allocUnsafe(encodingLength(data)); }
	if (!offset) { offset = 0; }

	name.encode(data, buf, offset + 2);
	buf.writeUInt16BE(name.encode_bytes, offset);
	encode_bytes = name.encode_bytes + 2;
	return buf;
};

export let encode_bytes = 0;

export function decode(buf: Buffer, offset?: number) {
	if (!offset) { offset = 0; }

	let data = name.decode(buf, offset + 2);
	decode_bytes = name.decode_bytes + 2;
	return data;
};

export let decode_bytes = 0;

export function encodingLength(data: string) {
	return name.encodingLength(data) + 2;
}
