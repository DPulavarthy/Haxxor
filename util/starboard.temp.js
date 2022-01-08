class Starboard {
    /**
     * @param {import("elaracmdo").CommandoClient} client 
     * @param {import("elaratypes").StarboardAdd|import("elaratypes").StarboardRemove} packet
     */
    constructor(client, packet) {
        this.client = client;
        this.pack = packet;
    }
    /** * @returns {string} */
    get emoji() { return "⭐"; }
    get id() { return this.pack.message_id; }

    async fetchEmbed(db, message, starboard = { channel: null, message: null }, reaction = { emoji: this.emoji, count: 1 }, edit = false, admin = false) {
        if (!db || !message || !reaction || typeof reaction !== "object") return Promise.resolve(`No db, message or reaction was provided.`);
        let [{ emoji, count }, { channel, message: starmessage }, image] = [reaction, starboard, this.fetchImage(message)];
        let options = {
            embeds: [
                {
                    color: message.member.displayColor === 0 ? global.util.colors.purple : message.member.displayColor,
                    title: `${emoji} ${typeof count === "number" ? `${count} stars` : count}`,
                    description: message.content ?? "",
                    timestamp: new Date(),
                    image: { url: image },
                    footer: { text: `ID: ${message.id}` },
                    author: { name: message.member.displayName, icon_url: message.member.displayAvatarURL({ dynamic: true }), url: this.client.options.invite }
                }
            ],
            components: [
                {
                    type: 1, components: [
                        this.client.f.button({ url: message.url, emoji: { id: '860931133448912947' } })
                    ]
                }
            ]
        };

        if (edit) {
            if (!starmessage) return Promise.resolve(`The star-message was empty/null, nothing was sent or edited.`);
            if (starmessage.embeds[0].title === options.embeds[0].title) return Promise.resolve(`The title for the old and new embeds are the same, ignoring.`);
            await starmessage.edit(options).catch(() => null);
            return Promise.resolve(`The starboard message (${message.id}) has been edited.`);
        } else {
            let m = await channel.send(options).catch(err => err);
            if (m instanceof Error) {
                let str = `[STARBOARD:ERROR]: I got an error while trying to send a message in ${channel.name} (${channel.id})`;
                global.log(str, m);
                return Promise.resolve(str);
            } else {
                db.messages.push({ id: message.id, msg: m.id, channel: m.channel.id, admin });
                await db.save().catch((err) => global.log(`[STARBOARD:SAVE:ERROR]: Got an error while trying to save ${m.id} in ${channel.name} (${channel.id})`, err))
                return Promise.resolve(`The starboard message was successfully posted to the channel and saved into the database!`);
            }
        }
    }
    /**
    * @param {import("elaracmdo").CommandoMessage} message 
    * @returns {string|null}
    */
    fetchImage(message) {
        const attach = message.attachments.filter((x) => x.url && x.width && x.height);
        if (attach.size) return attach.first().url;
        const imageEmbeds = message.embeds.filter((x) => x.image && x.image.url);
        if (imageEmbeds.length) return imageEmbeds[0].image.url;
        const urlEmbeds = message.embeds.filter((x) => ["gif", "image", "gifv"].includes(x.type) && (x.url || x.thumbnail?.url));
        if (urlEmbeds.length && !(urlEmbeds[0]?.thumbnail?.url ?? urlEmbeds[0]?.url ?? "").includes(".mp4")) return urlEmbeds[0]?.thumbnail?.url ?? urlEmbeds[0]?.url;
        return null;
    }

    /**
     * @returns {boolean}
     */
    get isDisabled() {
        if (
            !this.guild || !this.channel || !this.channel.isText() ||
            global.config.ignore.guilds.includes(this.pack.guild_id) || this.guild.client.registry.block.users.includes(this.pack.user_id) ||
            !this.perms() || global.cache.hkey(`star|${this.id}`)
        ) return true;
        return false;
    }

    /**
     * @returns {import("elaracmdo").CommandoGuild}
     */
    get guild() { return this.client.guilds.cache.get(this.pack.guild_id) ?? null; }

    /**
     * @returns {import("elaratypes").isText}
     */
    get channel() { return this.guild.channels.cache.get(this.pack.channel_id) ?? null; }

    /**
     * @param {string} userID 
     * @returns {Promise<import("discord.js").GuildMember>}
     */
    async member(userID = null) { return this.client.f.misc.member(this.guild, userID ?? this.pack.user_id, true); }

    /**
     * @param {import("elaratypes").isText} channel 
     * @param {string} id 
     * @returns {Promise<import("elaratypes").isText>}
     */
    async message(channel = this.channel, id = this.id) { return channel.messages.fetch(id, { cache: true }).catch(e => e); }

    async add() {
        if (this.pack.emoji.name !== this.emoji) return Promise.resolve(`The packet.emoji.name isn't ${this.emoji}`);
        if (global.config.misc.disable) return Promise.resolve(`Disabled is true, ignoring`);

        let [guild, channel, member, message] = await Promise.all([this.guild, this.channel, this.member(), this.message()]);
        if (!guild || !channel || !member || !message || member.user.bot || message.author.bot) return Promise.resolve(`Guild, Channel, Member or Message was returned as empty/null`);
        if (message instanceof Error) return Promise.resolve(`The message returned errored out.`);

        let [db, dbb] = await Promise.all([global.dbs.getSettings(guild), global.dbs.starboard.findOne({ guildID: guild.id })]);
        if (!db) return Promise.resolve(`Settings database returned empty/null.`);

        if (!db.starboard.enabled || !db.starboard.channel) return Promise.resolve(`Starboard is disabled for the server.`);
        if (!dbb) dbb = await new global.dbs.starboard({ guildID: guild.id }).save().catch(() => null);
        if (!dbb) return Promise.resolve(`No Starboard database found or created.`)

        let starboard = guild.channels.cache.get(db.starboard.channel);
        if (!starboard || !starboard.isText() || !this.perms(starboard)) return Promise.resolve(`No starboard channel was found, or no permissions for the client in the channel`);
        if (db.starboard.ignore.channels.includes(channel.id) || member.roles.cache.filter(c => db.starboard.ignore.roles.includes(c.id)).size) return Promise.resolve(`The channel or user is blocked from using the command.`);

        let [react, find, stars] = [
            message.reactions.cache.get(this.emoji),
            dbb.messages.find(c => c.id === message.id),
            null
        ];
        if (!react || react.count <= 0 || typeof react.count === "undefined") return Promise.resolve(`The reaction.count returned as below 0 or undefined.`);

        let { emoji, count } = this.getReactionInfo(react);

        if (find) {
            if (find.admin) return null;
            stars = await this.message(starboard, find.msg);
        }
        if (stars instanceof Error) {
            if (stars.message?.includes("Unknown Message")) {
                dbb.messages = dbb.messages.filter(c => c.id !== this.id);
                await dbb.save().catch(() => null);
            }
            let str = `[STARBOARD:ERROR]: Channel ${starboard.name} (${starboard.id}), message_id: ${this.id}`;
            global.log(str, stars.message);
            return Promise.resolve(str);
        }
        if (stars) {
            if (!stars.embeds.length) return Promise.resolve(`The starboard message in the channel doesn't have any embeds?...`);
            if (!global.cache.hkey(`star|${this.id}`)) global.cache.akey(`star|${this.id}|${global.util.time(30, 'seconds')}`);
            if (count < db.starboard.count) {
                dbb.messages = dbb.messages.filter(c => c.id !== this.id);
                dbb.save().catch((err) => global.log(`[STARBOARD:SAVE:ERROR]: Got an error while trying to save ${this.id} in ${starboard.name} (${starboard.id})`, err));
                stars.del().catch(() => { })
                return Promise.resolve(`The message got under the threshold for the amount of stars to be on the starboard.`)
            }
            return await this.fetchEmbed(dbb, message, { channel: starboard, message: stars }, { emoji, count }, true);
        }
        if (react.count < db.starboard.count) return Promise.resolve(`The starboard count isn't enough to be on the starboard.`);
        if (!global.cache.hkey(`star|${this.id}`)) global.cache.akey(`star|${this.id}|${global.util.time(30, 'seconds')}`);
        return this.fetchEmbed(dbb, message, { channel: starboard, message: null }, { emoji, count: react.count }, false);
    }

    async remove() {
        if (this.pack.emoji.name !== this.emoji) return Promise.resolve(`The packet.emoji.name isn't ${this.emoji}`);
        if (global.config.misc.disable) return Promise.resolve(`Disabled is true, ignoring`);

        let [guild, channel, member, message] = await Promise.all([this.guild, this.channel, this.member(), this.message()]);
        if (!guild || !channel || !member || !message || member.user.bot || message.author.bot) return Promise.resolve(`Guild, Channel, Member or Message was returned as empty/null`);
        if (message instanceof Error) return Promise.resolve(`The message returned errored out.`);

        let [db, dbb] = await Promise.all([global.dbs.getSettings(guild), global.dbs.starboard.findOne({ guildID: guild.id })]);
        if (!db) return Promise.resolve(`Settings database returned empty/null.`);
        if (!db.starboard.enabled || !db.starboard.channel) return Promise.resolve(`Starboard is disabled for the server.`);
        if (!dbb) dbb = await new global.dbs.starboard({ guildID: guild.id }).save().catch(() => null);
        if (!dbb) return Promise.resolve(`No Starboard database found or created.`)

        let starboard = guild.channels.cache.get(db.starboard.channel);
        if (!starboard || !starboard.isText() || !this.perms(starboard)) return Promise.resolve(`No starboard channel was found, or no permissions for the client in the channel`);
        if (db.starboard.ignore.channels.includes(channel.id) || member.roles.cache.filter(c => db.starboard.ignore.roles.includes(c.id)).size) return Promise.resolve(`The channel or user is blocked from using the command.`);
        let [react, find, stars] = [
            message.reactions.cache.get(this.emoji),
            dbb.messages.find(c => c.id === message.id),
            null,
        ],
            { emoji, count } = this.getReactionInfo(react);
        if (!react || react.count <= 0 || typeof react.count === "undefined") return Promise.resolve(`The reaction.count returned as below 0 or undefined.`);
        if (!find) return Promise.resolve(`There is no database found for ${this.id}`);
        if (find.admin === true) return null;
        stars = await starboard.messages.fetch(find.msg, true).catch((err) => err);
        if (stars instanceof Error) {
            if (stars.message?.includes("Unknown Message")) {
                dbb.messages = dbb.messages.filter(c => c.id !== this.id);
                await dbb.save().catch(() => null);
            }
            let str = `[STARBOARD:ERROR]: Channel ${starboard.name} (${starboard.id}), message_id: ${this.id}`;
            global.log(str, stars.message);
            return Promise.resolve(str);
        }
        if (!stars) return Promise.resolve(`There is no star-message found.`);
        if (!stars.embeds.length) return Promise.resolve(`The starboard message in the channel doesn't have any embeds?...`);
        if (!global.cache.hkey(`star|${this.id}`)) global.cache.akey(`star|${this.id}|${global.util.time(30, 'seconds')}`);
        if (react.count < db.starboard.count) {
            dbb.messages = dbb.messages.filter(c => c.id !== this.id);
            dbb.save().catch((err) => global.log(`[STARBOARD:SAVE:ERROR]: Got an error while trying to save ${this.id} in ${starboard.name} (${starboard.id})`, err));
            stars.del().catch(() => { })
            return Promise.resolve(`The message got under the threshold for the amount of stars to be on the starboard.`)
        }
        return this.fetchEmbed(dbb, message, { channel: starboard, message: stars }, { emoji, count }, true);
    }

    perms(channel = this.channel, perms = global.PERMS.basic) { return channel.permissionsFor(this.client.user.id).has(perms); }

    getReactionInfo(react) {
        let emoji = this.emoji;
        if (react.count <= 10 && react.count >= 5) emoji = "🌟";
        if (react.count > 10 && react.count <= 25) emoji = "✨";
        if (react.count > 25) emoji = "💫";
        return { count: react.count, emoji };
    }
};
