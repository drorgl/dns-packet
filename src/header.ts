import { IAnswer } from "./answer";

const QUERY_FLAG = 0;
const RESPONSE_FLAG = 1 << 15;

export interface IQuestion {
	type: string;
	name: string;
}

export interface IHeaderRecord {
	id?: number;
	type: string;
	flags?: number;
	questions?: IQuestion[];
	answers?: IAnswer[];
	authorities?: IAnswer[];
	additionals?: IAnswer[];
}

export function encode(h: IHeaderRecord, buf?: Buffer, offset?: number) {
	if (!buf) { buf = new Buffer(encodingLength(h)); }
	if (!offset) { offset = 0; }

	let flags = (h.flags || 0) & 32767;
	let type = h.type === "response" ? RESPONSE_FLAG : QUERY_FLAG;

	buf.writeUInt16BE(h.id || 0, offset);
	buf.writeUInt16BE(flags | type, offset + 2);
	buf.writeUInt16BE(h.questions.length, offset + 4);
	buf.writeUInt16BE(h.answers.length, offset + 6);
	buf.writeUInt16BE(h.authorities.length, offset + 8);
	buf.writeUInt16BE(h.additionals.length, offset + 10);

	return buf;
};

export let encode_bytes = 12;

export function decode(buf: Buffer, offset?: number): IHeaderRecord {
	if (!offset) { offset = 0; }
	if (buf.length < 12) { throw new Error("Header must be 12 bytes"); }
	let flags = buf.readUInt16BE(offset + 2);

	return {
		id: buf.readUInt16BE(offset),
		type: flags & RESPONSE_FLAG ? "response" : "query",
		flags: flags & 32767,
		questions: new Array(buf.readUInt16BE(offset + 4)),
		answers: new Array(buf.readUInt16BE(offset + 6)),
		authorities: new Array(buf.readUInt16BE(offset + 8)),
		additionals: new Array(buf.readUInt16BE(offset + 10))
	};
};

export let decode_bytes = 12;

export function encodingLength(h: IHeaderRecord) {
	return 12;
}
