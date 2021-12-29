// Import modules.
import { config } from 'dotenv'
import { Mention as MentionHandler } from '#manager'
import { Client } from 'discord.js'

// Define global interfaces.
declare global {
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
}

/**
 * Do this before the actual program (not process) starts.
 * 
 * @param [] None required.
 * @example new Preload()
 */
export default class Preload {
    public constructor(client: Client | any) {

        client._util = {}

        // Load <ENV> variables.
        config()

        // Check if all required <ENV> variables exist.
        this.required()

        // Check if type is "Array" and at least one value exists within.
        client._util.exists = Array.prototype.exists = function (): boolean {
            return Array.isArray(this) && this?.some((e: any) => e)
        }

        // Merge multiple objects into one.
        client._util.mergify = Object.mergify = function (main: object, ...secondary: Array<object>) {
            secondary.map((o: object) => Object.keys(o).map((k: string) => (main as any)[k] = (o as any)[k]))
            return main
        }

        // Load commands of type mention.
        new MentionHandler(client)
    }

    // Check if all required <ENV> variables exist.
    required() {
        for (let id of ['TOKEN']) if (!process.env[id]) throw new ReferenceError(`Identifier <ENV>[${id}] was not declared`)
    }
}
