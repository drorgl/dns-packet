import * as rstring from "./string";

export interface IHInfo {
	cpu: string;
	os: string;
}

export function encode(data: IHInfo, buf?: Buffer, offset?: number): Buffer {
	if (!buf) { buf = Buffer.allocUnsafe(encodingLength(data)); }
	if (!offset) { offset = 0; }

	let oldOffset = offset;
	offset += 2;
	rstring.encode(data.cpu, buf, offset);
	offset += rstring.encode_bytes;
	rstring.encode(data.os, buf, offset);
	offset += rstring.encode_bytes;
	buf.writeUInt16BE(offset - oldOffset - 2, oldOffset);
	encode_bytes = offset - oldOffset;
	return buf;
}

export let encode_bytes = 0;

export function decode(buf: Buffer, offset?: number) {
	if (!offset) { offset = 0; }

	let oldOffset = offset;

	let data: IHInfo = <any> {};
	offset += 2;
	data.cpu = rstring.decode(buf, offset);
	offset += rstring.decode_bytes;
	data.os = rstring.decode(buf, offset);
	offset += rstring.decode_bytes;
	decode_bytes = offset - oldOffset;
	return data;
}

export let decode_bytes = 0;

export function encodingLength(data: IHInfo) {
	return rstring.encodingLength(data.cpu) + rstring.encodingLength(data.os) + 2;
}
