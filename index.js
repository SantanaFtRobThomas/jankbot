const Discord = require("discord.js");
const sharp = require("sharp");
const fs = require("fs");
const token = require("./token"); //a separate file with tokens/IDs in. Could also do process.env.whatever, either way I'm not posting them on gh lol
const { doTimeIntent } = require("./time");
const { doJankIntent, doResourceIntent, handleResourceMenu } = require("./resources");
const { doLogoIntent, handleNewLogoButton } = require("./logo");
const { doJankedexIntent, handleJdxButton } = require("./jankedex");
const { doFistIntent, doButtonIntent, doQuitSibelius } = require("./stupidshit");
const { doHelpIntent } = require('./help');

Object.assign(String.prototype, {
    //adds functionality to search for multiple words in one function - i.e. contains any of the words given
    contains() {
        var rv = false;
        for (let i = 0; i < arguments.length; i++) {
            if (this.indexOf(arguments[i]) != -1) {
                rv = true;
            }
        }
        return rv;
    },
});

const MAPQUEST_TOKEN = token.mapquest;
const SANTANAS_TEST_SERVER = token.santanas_test;
const TC_BOT_COMMANDS = token.tc_bot_commands;

//Create the bot
const bot = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES] });
bot.login(token.token);

/**
 * 
 * @param {string} msg_in 
 * @returns 
 */
function botShouldWake(msg_in) {
    const BOT_WAKE_WORDS = ["j!", `<@!${bot.user.id}>`,`<@${bot.user.id}>`]
    for(w of BOT_WAKE_WORDS){
        if(msg_in.toLowerCase().startsWith(w)){
            spliced_msg = msg_in.slice(w.length).split(" ");
            if (spliced_msg[0] == "") spliced_msg.shift();
            return [true, spliced_msg, w]
        }
    }
    return [false]
}

//Log to console once connected
bot.on("ready", () => {
    console.log("Jank it up!");
    //bot.user.setAvatar('./av.png')
});

//an object to retain info about timing cooldown
const chans_can_post = {
    TC_BOT_COMMANDS: true,
    "850700283767554068": true,
};

const COMMANDS = {
    TIME_INTENT: {trigger_words: ['time'], f: async (msg) => {await doTimeIntent(msg)}, helpMsg: 'time <city>: Get the time.'},
    LOGO_INTENT: {trigger_words: ['logo'], f: async (msg) => {await doLogoIntent(msg)}, helpMsg: 'logo: Get a random MuseScore logo.'},
    HELP_INTENT: {trigger_words: ['help'], f: async (msg) => {await doHelpIntent(msg, COMMANDS)}, helpMsg: 'help: Get some help.'},
    JANK_INTENT: {trigger_words: ['jank' ,'jankman'], f: async (msg) => {await doJankIntent(msg)}, helpMsg: 'jankman: Get a jankman.'},
    FIST_INTENT: {trigger_words: ['fistchord', 'fistcord'], f: async (msg) => {await doFistIntent(msg)}, helpMsg: 'fistchord: Is it fistchord?'},
    RESOURCE_INTENT: {trigger_words: ['resource', 'resources'], f: async (msg) => {await doResourceIntent(msg)}, helpMsg: 'resources: Get parts of jankman for The Meme.'},
    BUTTON_INTENT: {trigger_words: ['button'], f: async (msg) => {await doButtonIntent(msg)}, helpMsg: ''},
    JANKEDEX_INTENT: {trigger_words: ['jankedex'], f: async (msg) => {await doJankedexIntent(msg)}, helpMsg: 'jankedex <number>: Show the jankedex. You can ask for a specific number or will get a random one if you don\'t specify.'},
}

//runs whenever a message is received in any server it's in
bot.on("message", async (msg) => {
    if (msg.content.toLowerCase() == "quit sibelius" || msg.content == "<:quit1:737227012435083274><:quit2:737226986191061013>") {
        doQuitSibelius(msg);
        return;
    }
    bsw = botShouldWake(msg.content)
    if (bsw[0]) {
        let msg_without_tag = bsw[1].join(" ");
        try {
            //if (chans_can_post[msg.channel.id] || !(msg.channel.id in chans_can_post) || msg.guildID == SANTANAS_TEST_SERVER) {
            if (chans_can_post[msg.channel.id] || msg.guild.id == SANTANAS_TEST_SERVER) {
                if (msg_without_tag != "") {
                    user_intent = getUserIntent(bsw[1]);
                    switch(user_intent.length){
                        case 0:
                            await msg.channel.send("I didn't understand that. <:jankman:736593545376563320> Use @JankBot help for commands.");
                            break;
                        case 1:
                            msg['wotag'] = msg_without_tag;
                            await COMMANDS[user_intent[0]].f(msg);
                            break;
                        default:
                            await msg.channel.send({
                                content: "It appears you tried to give me multiple commands. That is not advanced. Try again.",
                                files: ["./images/notadvanced.png"],
                            });
                    }
                } else {
                    await msg.channel.send("<:jankman:736593545376563320>");
                }
                if (msg.channel.id != TC_BOT_COMMANDS && msg.channel.id != "850700283767554068") {
                    //set a cooldown if we're not in #bot-commands
                    chans_can_post[msg.channel.id] = false;
                    setTimeout(() => {
                        chans_can_post[msg.channel.id] = true;
                    }, 60000);
                }
            } else {
                msg.react("🕑");
            }
        } catch (err) {
            console.warn("Failed to respond to mention.");
            console.warn(err);
        }
    }
});

bot.on("error", (err) => {
    console.warn(err);
});

/**
 * 
 * @param {Array} msg_as_str 
 */
function getUserIntent(msg_as_str) {
    lc_msg_as_str = []
    for(e of msg_as_str) lc_msg_as_str.push(e.toLowerCase());
    user_intents = []
    for(const [c_name, c] of Object.entries(COMMANDS)) {
        for(const t of c['trigger_words']){
            if(lc_msg_as_str.includes(t)){
                user_intents.push(c_name);
                break;
            }
        }
    }
    return user_intents;
}

bot.on("interaction", (interaction) => {
    if (interaction.isSelectMenu()) {
        if (interaction.customID == "JANK_RESOURCE_SELECT") {
            handleResourceMenu(interaction);
        }
    }
    if (interaction.isButton()) {
        if (interaction.customID.startsWith("NEWLOGO")) {
            handleNewLogoButton(interaction);
        }
        if (interaction.customID.startsWith("JANKEDEX")) {
            handleJdxButton(interaction);
        }
        if (interaction.customID.startsWith("QUIT_SIBELIUS")) {
            let msg_to_send = { content: "<:logo_Sibelius_bloody:737227893825994845>", files: ["./images/sib_crashed.png"], components: [], attachments: [] };
            interaction.update(msg_to_send);
        }
    }
});
