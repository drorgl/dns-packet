import * as name from "./records/name";
import * as types from "./types";

const QU_MASK = 1 << 15;
const NOT_QU_MASK = ~QU_MASK;

export interface IQuestion {
	name: string;
	type: string;
	class: number;
}

export function encode(q: IQuestion, buf?: Buffer, offset?: number) {
	if (!buf) { buf = Buffer.allocUnsafe(encodingLength(q)); }
	if (!offset) { offset = 0; }

	let oldOffset = offset;

	name.encode(q.name, buf, offset);
	offset += name.encode_bytes;

	buf.writeUInt16BE(types.toType(q.type), offset);
	offset += 2;

	buf.writeUInt16BE(q.class === undefined ? 1 : q.class, offset);
	offset += 2;

	encode_bytes = offset - oldOffset;
	return q;
};

export let encode_bytes = 0;

export function decode(buf: Buffer, offset?: number) {
	if (!offset) { offset = 0; }

	let oldOffset = offset;
	let q: IQuestion = <any> {};

	q.name = name.decode(buf, offset);
	offset += name.decode_bytes;

	q.type = types.toString(buf.readUInt16BE(offset));
	offset += 2;

	q.class = buf.readUInt16BE(offset);
	offset += 2;

	let qu = !!(q.class & QU_MASK);
	if (qu) { q.class &= NOT_QU_MASK; }

	decode_bytes = offset - oldOffset;
	return q;
};

export let decode_bytes = 0;

export function encodingLength(q: IQuestion) {
	return name.encodingLength(q.name) + 4;
}
