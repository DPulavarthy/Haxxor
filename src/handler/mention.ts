// Import modules.
import { Handler } from '#manager'
import { Client } from 'discord.js'

// Define mention properties.
export default interface Mention {
    path: string
    files: Array<object>
}

/**
 * A command handler to load all commands of type mention.
 * 
 * @param [client] extends from "discord.js" Client.
 * @example new Mention(<Client>) [Implementation may vary]
 */
export default class Mention extends Handler {
    constructor(client: Client) {
        super(client, true)

        // Load all commands under the mention directory.
        this.query('./lib/commands/mention', this.load)
    }

    // Load a command to client.
    load(client: Client, file: string, group: string) {
        const [register, merge] = [(title: string, file: object) => (client as any)._mention.set(title, file), { title: file.replace(/\.js/g, ''), group }]
        import(`../commands/mention/${group}/${file}`.replace(/\/null/g, '')).then(command => register(merge.title, Object.mergify(new command.default(client), merge)))
    }
}
