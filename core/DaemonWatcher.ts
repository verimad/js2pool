import Client from 'bitcoin-core';
import { Event } from "../nodejs/Event";
const BitcoinClient = require('bitcoin-core');

export type DaemonOptions = {
    host: string,
    port: number,
    username: string,
    password: string,
}

export class DaemonWatcher extends Event {
    private client: Client;
    private blockHeight = 0;
    private timerId: NodeJS.Timer;

    static Events = {
        blockTemplateUpdate: 'BlockTemplateUpdated',
    };

    constructor(opts: DaemonOptions) {
        super();
        this.client = new BitcoinClient(opts) as Client;
    }

    beginWatching() {
        let me = this;
        if (me.timerId) clearTimeout(me.timerId);

        me.timerId = setInterval(async () => {
            try {
                let value: GetMiningInfo = await me.client.command('getmininginfo');
                if (value.blocks <= me.blockHeight) return;
                this.blockHeight = value.blocks;
                await me.refreshBlockTemplateAsync();
            } catch (error) { console.log(error); }
        }, 250);
    }

    async submitBlockAsync(blockHex: string) {
        try {
            let results: any[] = await this.client.command([{ method: 'submitblock', parameters: [blockHex] }]);
            let result = results.first();
            if (result == null) return true;
            if (typeof (result) === 'string') return false;
            if (result.error || result.result === 'reject') return false;
            return true;
        } catch (error) {
            return false;
        }
    }

    private async refreshBlockTemplateAsync() {
        try {
            let values: GetBlockTemplate[] = await this.client.command([{ method: 'getblocktemplate', parameters: [{ rules: ['segwit'] }] }]);
            super.trigger(DaemonWatcher.Events.blockTemplateUpdate, this, values.first());
        } catch (error) {
            console.error(error);
        }

    }

    onBlockTemplateUpdated(callback: (sender: DaemonWatcher, template: GetBlockTemplate) => void) {
        super.register(DaemonWatcher.Events.blockTemplateUpdate, callback);
    }

}

export type GetBlockTemplate = {
    // BTC
    capabilities: string[],
    version: number,
    rules: string[],
    vbavailable?: { segwit: number },
    vbrequired?: number,
    previousblockhash: string,
    transactions: [{
        data: string,
        txid: string,
        hash: string,
        depends?: any[],
        fee: number,
        sigops: number,
        weight: number,
    }],
    coinbaseaux?: {
        flags: string
    },
    coinbasevalue: number,
    longpollid: string,
    target: string, // hex string
    mintime: number,
    mutable?: string[], // time, transactions, prevblock
    noncerange: string, // hex string
    sigoplimit?: number,
    sizelimit: number,
    curtime: number,
    bits: string,
    height: number,
    default_witness_commitment?: string,

    // Dashcoin
    superblock?: any,
    masternode?: any,
    masternode_payments?: any,

    // Others
    payee?: any,
    payee_amount?: number,
    votes?: any[],

    // Custom aera
    auxes?: any,
}

export type GetMiningInfo = {
    blocks: number,
    currentblocksize: number,
    currentblockweight: number,
    currentblocktx: number,
    difficulty: number,
    errors: string,
    networkhashps: number,
    pooledtx: number,
    chain: string
}
