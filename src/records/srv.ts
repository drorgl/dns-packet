import * as name from "./name";

export interface ISRV {
	priority?: number;
	weight?: number;
	port?: number;
	target?: string;
}

export function encode(data: ISRV, buf?: Buffer, offset?: number): Buffer {
	if (!buf) { buf = Buffer.allocUnsafe(encodingLength(data)); }
	if (!offset) {offset = 0; }

	buf.writeUInt16BE(data.priority || 0, offset + 2);
	buf.writeUInt16BE(data.weight || 0, offset + 4);
	buf.writeUInt16BE(data.port || 0, offset + 6);
	name.encode(data.target, buf, offset + 8);

	let len = name.encode_bytes + 6;
	buf.writeUInt16BE(len, offset);

	encode_bytes = len + 2;
	return buf;
};

export let encode_bytes = 0;

export function decode(buf: Buffer, offset?: number) {
	if (!offset) { offset = 0; }

	let len = buf.readUInt16BE(offset);

	let data: ISRV = {};
	data.priority = buf.readUInt16BE(offset + 2);
	data.weight = buf.readUInt16BE(offset + 4);
	data.port = buf.readUInt16BE(offset + 6);
	data.target = name.decode(buf, offset + 8);

	decode_bytes = len + 2;
	return data;
};

export let decode_bytes = 0;

export function encodingLength(data: ISRV) {
	return 8 + name.encodingLength(data.target);
}
