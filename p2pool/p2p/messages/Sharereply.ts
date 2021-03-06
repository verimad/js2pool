/*
 * Created on Sun Apr 16 2017 UnsignedInt8
 * Github: https://github.com/unsignedint8
 */

import { Payload } from "./Payload";
import { Shares } from "./Shares";
import BufferReader from "../../../misc/BufferReader";
import BufferWriter from "../../../misc/BufferWriter";
import * as Bignum from 'bignum';

export type TypeSharereply = {
    id: Bignum;
    result: number;// {0: 'good', 1: 'too long', 2: 'unk2', 3: 'unk3', 4: 'unk4', 5: 'unk5', 6: 'unk6'})),
    wrapper: Shares;
}

export default class Sharereply extends Payload {
    id: Bignum; // 256 bits 
    result: number; // var int
    wrapper: Shares;

    toBuffer() {
        return Buffer.concat([
            this.id.toBuffer({ size: 32, endian: 'little' }),
            BufferWriter.writeVarNumber(this.result),
            this.wrapper.toBuffer(),
        ]);
    }

    static fromObject(obj: TypeSharereply) {
        let reply = new Sharereply();
        reply = Object.assign(reply, obj);
        return reply;
    }

    static fromBuffer(data: Buffer) {
        let reply = new Sharereply();
        let reader = new BufferReader(data);
        reply.id = reader.readNumber(32);
        reply.result = reader.readVarNumber();
        reply.wrapper = Shares.fromBuffer(data.slice(reader.offset));
        return reply;
    }
}