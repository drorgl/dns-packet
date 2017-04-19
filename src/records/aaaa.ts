import * as ip from "ip";

export function encode(host: string, buf?: Buffer, offset?: number): Buffer {
	if (!buf) { buf = Buffer.allocUnsafe(encodingLength(host)); }
	if (!offset) { offset = 0; }

	buf.writeUInt16BE(16, offset);
	offset += 2;
	ip.toBuffer(host, buf, offset);
	encode_bytes = 18;
	return buf;
};

export let encode_bytes = 0;

export function decode(buf: Buffer, offset?: number) {
	if (!offset) { offset = 0; }

	offset += 2;
	let host = ip.toString(buf, offset, 16);
	decode_bytes = 18;
	return host;
};

export let decode_bytes = 0;

export function encodingLength(host: string) {
	return 18;
}
