import * as header from "./header";
export import header = header;

interface IRec {
	encode?: (n: string, buf: Buffer, offset: number) => void;
	encode_bytes?: number;
	decode_bytes?: number;
	decode?: (buf: Buffer, offset: number) => string;
	encodingLength?: (n: string) => number;
}

import * as name_local from "./records/name";
export import name = name_local;

import * as a_local from "./records/a";
export import a = a_local;

import * as aaaa_local from "./records/aaaa";
export import aaaa = aaaa_local;

import * as hinfo_local from "./records/hinfo";
export import hinfo = hinfo_local;

import * as ptr_local from "./records/ptr";
export import ptr = ptr_local;
export import cname = ptr_local;
export import dname = ptr_local;

import * as srv_local from "./records/srv";
export import srv = srv_local;

import * as rtxt_local from "./records/rtxt";
export import rtxt = rtxt_local;
export import txt = rtxt_local;
export import rnull = rtxt_local;

import * as runknown_local from "./records/runknown";
export import unknown = runknown_local;

import * as string_local from "./records/string";
export import rstring = string_local;

import * as answer_local from "./answer";
export import answer = answer_local;

import * as question_local from "./question";
export import question = question_local;

export const AUTHORITATIVE_ANSWER = 1 << 10;
export const TRUNCATED_RESPONSE = 1 << 9;
export const RECURSION_DESIRED = 1 << 8;
export const RECURSION_AVAILABLE = 1 << 7;
export const AUTHENTIC_DATA = 1 << 5;
export const CHECKING_DISABLED = 1 << 4;

export function encode(result: header.IHeaderRecord, buf?: Buffer, offset?: number) {
	if (!buf) { buf = Buffer.allocUnsafe(encodingLength(result)); }
	if (!offset) { offset = 0; }

	let oldOffset = offset;

	if (!result.questions) { result.questions = []; }
	if (!result.answers) { result.answers = []; }
	if (!result.authorities) { result.authorities = []; }
	if (!result.additionals) { result.additionals = []; }

	header.encode(result, buf, offset);
	offset += header.encode_bytes;

	offset = encodeList(result.questions, question, buf, offset);
	offset = encodeList(result.answers, answer, buf, offset);
	offset = encodeList(result.authorities, answer, buf, offset);
	offset = encodeList(result.additionals, answer, buf, offset);

	encode_bytes = offset - oldOffset;

	return buf;
};

export let encode_bytes = 0;

export function decode(buf: Buffer, offset?: number) {
	if (!offset) { offset = 0; }

	let oldOffset = offset;
	let result = header.decode(buf, offset);
	offset += header.decode_bytes;

	offset = decodeList(result.questions, question, buf, offset);
	offset = decodeList(result.answers, answer, buf, offset);
	offset = decodeList(result.authorities, answer, buf, offset);
	offset = decodeList(result.additionals, answer, buf, offset);

	decode_bytes = offset - oldOffset;

	return result;
};

export let decode_bytes = 0;

export function encodingLength(result: header.IHeaderRecord) {
	return header.encodingLength(result) +
		encodingLengthList(result.questions || [], question) +
		encodingLengthList(result.answers || [], answer) +
		encodingLengthList(result.authorities || [], answer) +
		encodingLengthList(result.additionals || [], answer);
}

function encodingLengthList(list: header.IHeaderRecord[] | answer.IAnswer[], enc: any) {
	let len = 0;
	for (let item of list) {
		len += enc.encodingLength(item);
	}
	return len;
}

function encodeList(list: any[], enc: any, buf: Buffer, offset: number): number {
	for (let item of list) {
		enc.encode(item, buf, offset);
		offset += enc.encode_bytes;
	}
	return offset;
}

function decodeList(list: any[], enc: any, buf: Buffer, offset: number): number {
	for (let i = 0; i < list.length; i++) {
		list[i] = enc.decode(buf, offset);
		offset += enc.decode_bytes;
	}
	return offset;
}
