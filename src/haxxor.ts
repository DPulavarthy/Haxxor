// import { config } from 'dotenv'
// import { Client, Options } from 'discord.js'

// if (config()?.error) throw new ReferenceError('Failed to load .env properties.')

// const client: Client = new Client({ intents: ['GUILD_MESSAGES'] })

// client.on('ready', _ => {
//     console.log('Ready')
// })

// client.login(process.env.TOKEN)

// process.on('SIGINT', e => {
//     client?.destroy()
//     process.exit(1)
// })

// process.on('uncaughtException', error => {
//     console.log(error)
//     process.exit(1)
// })


// Import modules.
import { Preload } from '#manager'
import { config } from 'dotenv'
import { Client, Options } from 'discord.js'

config()

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

        // Login to client.
        // this.login(process.env.TOKEN).catch(error => { throw new ReferenceError(error) })
    }
}

// Globally define client.
// new Haxxor()

(async () => {
    let x = await Preload.run.catch(e => e)

    console.log(x)
})()
