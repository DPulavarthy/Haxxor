import { Client, ClientEvents } from 'discord.js';

export default class Ready {
    public static async run(client: Client) {
        // out.client('Ready');
        console.log(`${client.user?.tag} online.`);
    }
}