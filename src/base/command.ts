// Import modules.
import { Client } from 'discord.js'

// Define Command interface.
export default interface Command {
    client: Client
    title: string
    about: string
    group: string
    lines: number
}


/**
 * All client commands should extend this base class.
 */
export default class Command {
    public constructor(client: Client, { title = '', about = '', group = '', lines = 0 }) {
        Object.mergify(this, { client, title, about, lines, group })
    }
}