// Import modules.
import { Events } from '#manager'
import { Message } from 'discord.js'

// Define event interface.
export default interface MessageCreate {
    content: string
}

/**
 * <Client> messageCreate event.
 * 
 * @param [message] extends from "discord.js" Message.
 * @example new messageCreate(<Message>)
 */
export default class MessageCreate extends Events {
    public constructor(message: Message) {
        super(message)

        // Log message content.
        console.log(this.content)
    }
}
