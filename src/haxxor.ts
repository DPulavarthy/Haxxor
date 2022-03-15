// import { config } from 'dotenv'
// import { Client, Options } from 'discord.js'

// if (config()?.error) throw new ReferenceError('Failed to load .env properties.')

// const client: Client = new Client({ intents: ['GUILD_MESSAGES'] })

// client.on('ready', _ => {
//     console.log('Ready')
// })

// client.login(process.env.TOKEN)



// Import modules.
import { Preloader } from '#manager'
import { Client, Options } from 'discord.js'

/**
 * Create and login to Discord client with custom properties.
 * 
 * @param [] None required.
 * @example new Haxxor()
 */
export default class Haxxor extends Client {
    public constructor() {
        super({
            restTimeOffset: 100,
            intents: ['GUILDS', 'GUILD_MESSAGES'],
            makeCache: Options.cacheWithLimits({ MessageManager: { maxSize: 200, sweepInterval: 5 * 60000 } })
        })

        new Preloader(this)

        this.on('ready', () => {
            global.client(`Connected to ${this.user?.tag}`)
        })

        // Login to client.
        this.login(process.env.TOKEN).catch(error => { throw new ReferenceError(error) })
    }
}

// Globally define client.
global.Client = new Haxxor()
