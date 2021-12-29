// Import modules.
import { Events } from '#manager'

// Define event interface.
export default interface Ready {
    user: {
        tag: string
    }
}

/**
 * <Client> ready event.
 * 
 * @param [client] extends from "discord.js" Client.
 * @example new Ready(<Client>)
 */
export default class Ready extends Events {
    public constructor(client: any) {
        super(client)

        // Log ready event.
        console.log(this.toString())
    }

    toString() {
        return `${this.user?.tag ?? 'Client'} successfully connected.`
    }
}
