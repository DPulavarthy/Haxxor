// // Import modules.
// import { config } from 'dotenv'
// import { Mention as MentionHandler } from '#manager'
// import { Collection, Message } from 'discord.js'

// // Define global interfaces.
// declare global {
//     var Client: object

//     // Populate "discord.js" client with more properties.
//     interface Client {
//         _util: object
//         _mention: Collection<string, object>
//         _slash: Collection<string, object>
//         _commands: {
//             fetch(query: string): object
//             approved: {
//                 mention: number
//                 slash: number
//             }
//             rejected: {
//                 mention: Array<string>
//                 slash: Array<string>
//             }
//         }
//     }

//     interface MessageExtender extends Message {
//         args: Array<string>
//         command: string
//     }
//     interface Array<T> {

//         /**
//          * Check if type is "Array" and at least one value exists within.
//          * 
//          * @param [] None required.
//          * @return boolean
//          * 
//          * @example 
//          * [].exists(): false (boolean)
//          * [1].exists(): true (boolean)
//          */

//         exists(): boolean
//     }

//     interface Object {

//         /**
//          * Merge multiple objects into one.
//          * 
//          * @param [main] The main object to merge into.
//          * @param [secondary] The sub-objects to merge into the main.
//          * @return object
//          * 
//          * @example
//          * Object.mergify({ a: 1 }, { b: 2 }): { a: 1, b: 2 } (object)
//          */

//         mergify(main: object, ...secondary: Array<object>): object
//     }


//     interface String {

//         /**
//          * Compare two strings case insensitive.
//          * 
//          * @param [query] The string to compare with "this".
//          * @return boolean
//          * 
//          * @example
//          * "a".compare("b"): false (boolean)
//          * "a".compare("A"): true (boolean)
//          */

//         is(query: string): boolean
//     }
// }

// /**
//  * Do this before the actual program (not process) starts.
//  * 
//  * @param [] None required.
//  * @example new Preload()
//  */
// export default class Preload {
//     public constructor(client: Client) {

//         // Load <ENV> variables.
//         config()

//         // Check if all required <ENV> variables exist.
//         this.required()

//         // Check if type is "Array" and at least one value exists within.
//         Array.prototype.exists = function (): boolean {
//             return Array.isArray(this) && this?.some((e: any) => e)
//         }

//         // Merge multiple objects into one.
//         Object.mergify = function (main: object, ...secondary: Array<object>) {
//             secondary.map((o: object) => Object.keys(o).map((k: string) => (main as any)[k] = (o as any)[k]))
//             return main
//         }

//         String.prototype.is = function (query: string) {
//             return this.localeCompare(query, undefined, { sensitivity: 'accent' }) === 0 ? true : false
//         }

//         client._util = {}


//         Object.mergify(client, {
//             _mention: new Collection(),
//             _slash: new Collection(),
//             _commands: {
//                 fetch: (query: string) => client._mention.get(query) ?? client._slash.get(query),
//                 approved: {
//                     mention: 0,
//                     slash: 0
//                 },
//                 rejected: {
//                     mention: [],
//                     slash: []
//                 }
//             }
//         })

//         // Load commands of type mention.
//         new MentionHandler(client)
//     }

//     // Check if all required <ENV> variables exist.
//     required() {
//         for (let id of ['TOKEN']) if (!process.env[id]) throw new ReferenceError(`Identifier <ENV>[${id}] was not declared`)
//     }
// }

// export default class Preload {
//     public static run = new Promise((resolve: Function, reject: Function) => {
//         if (Math.random() > 0.5) resolve('Works')
//         else reject('Broken')
//     })
// }

import { Client } from 'discord.js'
import { config } from 'dotenv'

declare global {
    var Client: Client
    var Util: {}
    var client: (...param: any[]) => void
    var system: (...param: any[]) => void

    interface Array<T> {

        /**
         * Check if type is "Array" and at least one value exists within.
         *
         * @param [] None required.
         * @return boolean
         *
         * @example
         * [].exists(): false (boolean)
         * [1].exists(): true (boolean)
         */

        exists(): boolean
    }

    interface Object {

        /**
         * Merge multiple objects into one.
         *
         * @param [main] The main object to merge into.
         * @param [secondary] The sub-objects to merge into the main.
         * @return object
         *
         * @example
         * Object.mergify({ a: 1 }, { b: 2 }): { a: 1, b: 2 } (object)
         */

        mergify(main: object, ...secondary: Array<object>): object
    }


    interface String {

        /**
         * Compare two strings case insensitive.
         *
         * @param [query] The string to compare with "this".
         * @return boolean
         *
         * @example
         * "a".compare("b"): false (boolean)
         * "a".compare("A"): true (boolean)
         */

        is(query: string): boolean
    }
}

export default class Preloader {
    public constructor(client: Client) {

        process.on('SIGINT', (_: void) => {
            client?.destroy()
            if (client.user) global.client(`Disconnected ${client.user?.tag}`)
            process.exit(1)
        })

        process.on('uncaughtException', (error: Error | ReferenceError) => {
            console.error(`\u001b[31m${error.stack}\u001b[0m`)
            process.exit(1)
        })

        // Check if type is "Array" and at least one value exists within.
        Array.prototype.exists = function (): boolean {
            return Array.isArray(this) && this?.some((e: any) => e)
        }

        // Merge multiple objects into one.
        Object.mergify = function (main: object, ...secondary: Array<object>) {
            secondary.map((o: object) => Object.keys(o).map((k: string) => (main as any)[k] = (o as any)[k]))
            return main
        }

        String.prototype.is = function (query: string) {
            return this.localeCompare(query, undefined, { sensitivity: 'accent' }) === 0 ? true : false
        }

        global.client = (...param: any[]) => console.log(`\u001b[34m[CLIENT]: ${param.join(' ')}\u001b[0m`)
        global.system = (...param: any[]) => console.log(`\u001b[32m[SYSTEM]: ${param.join(' ')}\u001b[0m`)

        this.load.environment()
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