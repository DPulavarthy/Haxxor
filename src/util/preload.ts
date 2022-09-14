import { Client } from 'discord.js';
import { config } from 'dotenv';

declare global {
    let Client: Client;

    interface out {
        (color: string, ...params: any[]): void;
        client(...params: any[]): void;
        system(...params: any[]): void;
    }

    interface Array<T> {
        exists(): boolean;
    }

    interface Object {
        mergify(main: object, ...subs: object[]): void;
    }

    interface String {
        is(query: string): boolean;
        camelify(query: string): string;
        parse(query: string): object;
    }
}

export default class Preload {
    constructor(client: Client) {

        process.on('uncaughtException', (error: Error | ReferenceError) => {
            console.error(`\u001b[31m${error.stack}\u001b[0m`)
            process.exit(1)
        })
    }

    load = {
        environment() {
            if (config()?.error) throw new ReferenceError('Failed to load .env properties.')
            if (this.properties.exists()) throw new ReferenceError(`Failed to find following .env properties: ${this.properties.join(', ')}`)
        },

        get properties() {
            const missing: string[] = []
            for (let id of ['TOKEN']) if (!process.env[id]) missing.push(id)
            return missing
        }
    }
}