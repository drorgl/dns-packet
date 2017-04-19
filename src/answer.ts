import * as name from "./records/name";
import * as ptr from "./records/ptr";

import * as ra from "./records/a";
import * as raaaa from "./records/aaaa";
import * as rhinfo from "./records/hinfo";
import * as rptr from "./records/ptr";
import * as rsrv from "./records/srv";

import * as rtxt from "./records/rtxt";

import * as runknown from "./records/runknown";

import * as types from "./types";

const FLUSH_MASK = 1 << 15;
const NOT_FLUSH_MASK = ~FLUSH_MASK;

let rcname = ptr;
let rdname = ptr;
let rnull = rtxt;

export function renc(type: string) {
	switch (type.toUpperCase()) {
		case "A": return ra;
		case "PTR": return rptr;
		case "CNAME": return rcname;
		case "DNAME": return rdname;
		case "TXT": return rtxt;
		case "NULL": return rnull;
		case "AAAA": return raaaa;
		case "SRV": return rsrv;
		case "HINFO": return rhinfo;
		default:
			return runknown;
	}

};

export interface IAnswer {
	name?: string;
	type?: string;
	class?: number;
	ttl?: number;
	flush?: boolean;
	data?: any;
}

export function encode(a: IAnswer, buf?: Buffer, offset?: number) {
	if (!buf) { buf = Buffer.allocUnsafe(encodingLength(a)); }
	if (!offset) { offset = 0; }

	let oldOffset = offset;

	name.encode(a.name, buf, offset);
	offset += name.encode_bytes;

	buf.writeUInt16BE(types.toType(a.type), offset);

	let klass = a.class === undefined ? 1 : a.class;
	if (a.flush) { klass |= FLUSH_MASK; } // the 1st bit of the class is the flush bit
	buf.writeUInt16BE(klass, offset + 2);

	buf.writeUInt32BE(a.ttl || 0, offset + 4);

	let enc: any = renc(a.type);
	enc.encode(a.data, buf, offset + 8);
	offset += 8 + enc.encode_bytes;

	encode_bytes = offset - oldOffset;
	return buf;
};

export let encode_bytes = 0;

export function decode(buf: Buffer, offset: number) {
	if (!offset) { offset = 0; }

	let a: IAnswer = {};
	let oldOffset = offset;

	a.name = name.decode(buf, offset);
	offset += name.decode_bytes;
	a.type = types.toString(buf.readUInt16BE(offset));
	a.class = buf.readUInt16BE(offset + 2);
	a.ttl = buf.readUInt32BE(offset + 4);

	a.flush = !!(a.class & FLUSH_MASK);
	if (a.flush) { a.class &= NOT_FLUSH_MASK; }

	let enc = renc(a.type);
	a.data = enc.decode(buf, offset + 8);
	offset += 8 + enc.decode_bytes;

	decode_bytes = offset - oldOffset;
	return a;
};

export let decode_bytes = 0;

export function encodingLength(a: IAnswer) {
	return name.encodingLength(a.name) + 8 + (renc(a.type) as any).encodingLength(a.data);
}
