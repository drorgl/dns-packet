import tape = require("tape");
import * as packet from "../src/dns-packet";

tape("unknown", (t) => {
	testEncoder(t, packet.unknown, Buffer.from("hello world"));
	t.end();
});

tape("txt", (t) => {
	testEncoder(t, packet.txt, Buffer.allocUnsafe(0));
	testEncoder(t, packet.txt, Buffer.from("hello world"));
	testEncoder(t, packet.txt, Buffer.from([0, 1, 2, 3, 4, 5]));
	t.end();
});

tape("null", (t) => {
	testEncoder(t, packet.rnull, Buffer.from([0, 1, 2, 3, 4, 5]));
	t.end();
});

tape("hinfo", (t) => {
	testEncoder(t, packet.hinfo, { cpu: "intel", os: "best one" });
	t.end();
});

tape("ptr", (t) => {
	testEncoder(t, packet.ptr, "hello.world.com");
	t.end();
});

tape("cname", (t) => {
	testEncoder(t, packet.cname, "hello.cname.world.com");
	t.end();
});

tape("dname", (t) => {
	testEncoder(t, packet.dname, "hello.dname.world.com");
	t.end();
});

tape("srv", (t) => {
	testEncoder(t, packet.srv, { port: 9999, target: "hello.world.com" });
	testEncoder(t, packet.srv, { port: 9999, target: "hello.world.com", priority: 42, weight: 10 });
	t.end();
});

tape("a", (t) => {
	testEncoder(t, packet.a, "127.0.0.1");
	t.end();
});

tape("aaaa", (t) => {
	testEncoder(t, packet.aaaa, "fe80::1");
	t.end();
});

tape("query", (t) => {
	testEncoder(t, packet, {
		type: "query",
		questions: [{
			type: "A",
			name: "hello.a.com"
		}, {
			type: "SRV",
			name: "hello.srv.com"
		}]
	});

	testEncoder(t, packet, {
		type: "query",
		id: 42,
		questions: [{
			type: "A",
			name: "hello.a.com"
		}, {
			type: "SRV",
			name: "hello.srv.com"
		}]
	});

	testEncoder(t, packet, {
		type: "query",
		id: 42,
		questions: [{
			type: "A",
			class: 100,
			name: "hello.a.com"
		}, {
			type: "SRV",
			name: "hello.srv.com"
		}]
	});

	t.end();
});

tape("response", (t) => {
	testEncoder(t, packet, {
		type: "response",
		flags: packet.TRUNCATED_RESPONSE,
		answers: [{
			type: "A",
			name: "hello.a.com",
			data: "127.0.0.1"
		}, {
			type: "SRV",
			name: "hello.srv.com",
			data: {
				port: 9090,
				target: "hello.target.com"
			}
		}, {
			type: "CNAME",
			name: "hello.cname.com",
			data: "hello.other.domain.com"
		}]
	});

	testEncoder(t, packet, {
		type: "response",
		id: 100,
		flags: 0,
		additionals: [{
			type: "AAAA",
			name: "hello.a.com",
			data: "fe80::1"
		}, {
			type: "PTR",
			name: "hello.ptr.com",
			data: "hello.other.ptr.com"
		}, {
			type: "SRV",
			name: "hello.srv.com",
			ttl: 42,
			data: {
				port: 9090,
				target: "hello.target.com"
			}
		}],
		answers: [{
			type: "NULL",
			name: "hello.null.com",
			data: Buffer.from([1, 2, 3, 4, 5])
		}]
	});

	t.end();
});

function testEncoder(t: tape.Test, packet: any, val: any) {
	let buf = packet.encode(val);
	let val2 = packet.decode(buf);

	t.same(buf.length, packet.encode_bytes, "encode.bytes was set correctly");
	t.same(buf.length, packet.encodingLength(val), "encoding length matches");
	t.ok(compare(t, val, val2), "decoded object match");

	let buf2 = packet.encode(val2);
	let val3 = packet.decode(buf2);

	t.same(buf2.length, packet.encode_bytes, "encode.bytes was set correctly on re-encode");
	t.same(buf2.length, packet.encodingLength(val), "encoding length matches on re-encode");

	t.ok(compare(t, val, val3), "decoded object match on re-encode");
	t.ok(compare(t, val2, val3), "re-encoded decoded object match on re-encode");

	let bigger = Buffer.allocUnsafe(buf2.length + 10);

	let buf3 = packet.encode(val, bigger, 10);
	let val4 = packet.decode(buf3, 10);

	t.ok(buf3 === bigger, "echoes buffer on external buffer");
	t.same(packet.encode_bytes, buf.length, "encode.bytes is the same on external buffer");
	t.ok(compare(t, val, val4), "decoded object match on external buffer");
}

function compare(t: tape.Test, a: any, b: any) {
	if (Buffer.isBuffer(a)) { return a.toString("hex") === b.toString("hex"); }
	if (typeof a === "object" && a && b) {
		let keys = Object.keys(a);
		for (let key of keys) {
			if (!compare(t, a[key], b[key])) { return false; }
		}
	} else {
		return a === b;
	}
	return true;
}
