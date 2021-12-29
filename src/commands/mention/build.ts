// Import modules.
import { Command } from "#manager"

/**
 * A placeholder command until further development.
 * 
 * @param [client] extends from "discord.js" Client.
 * @example new Mention(<Client>) [Implementation may vary]
 */
export default class Build extends Command {
    public constructor(client: any) {
        super(client, { about: 'A test command' })
    }

    async run() {
        console.log('Hi')
    }
}
