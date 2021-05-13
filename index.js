const eris = require("eris");
const sharp = require("sharp");
const fs = require("fs");
const cz = require("city-timezones");
const axios = require("axios");
const geoTz = require("geo-tz");
const token = require("./token"); //a separate file with tokens/IDs in. Could also do process.env.whatever, either way I'm not posting them on gh lol

Object.assign(String.prototype, {
    //adds functionality to search for multiple words in one function - i.e. contains any of the words given
    contains() {
        var rv = false;
        for (var i = 0; i < arguments.length; i++) {
            if (this.indexOf(arguments[i]) != -1) {
                rv = true;
            }
        }
        return rv;
    },
});

const BOT_TOKEN = token.token; //discord bot token goes here. Moved to a different file for github
const MAPQUEST_TOKEN = token.mapquest;
const SANTANAS_TEST_SERVER = token.santanas_test;
const TC_BOT_COMMANDS = token.tc_bot_commands;

//Create the bot
const bot = new eris.Client(BOT_TOKEN);

//Log to console once connected
bot.on("ready", () => {
    console.log("Jank it up!");
});

//an object to retain info about timing cooldown
const chans_can_post = {
    TC_BOT_COMMANDS: true,
};

//runs whenever a message is received in any server it's in
bot.on("messageCreate", async (msg) => {
    const bot_was_mentioned = msg.mentions.find((mentionedUser) => mentionedUser.id === bot.user.id); //check if the bot was mentioned
    //const split_msg = msg.content.split(" "); //split the message on spaces (bad, I'll bring in my proper conversational parser at some point)

    if (bot_was_mentioned && msg.content.indexOf(`<@!${bot.user.id}>`) == 0) {
        msg_without_tag = msg.content.slice(`<@!${bot.user.id}>`.length);
        //messageReference existing means it's a quote message and we don't want to act on that TODO: only not respond if it's not mentioned in the main text
        try {
            if (chans_can_post[msg.channel.id] || !(msg.channel.id in chans_can_post) || msg.guildID == SANTANAS_TEST_SERVER) {
                if(msg_without_tag != ""){
                    user_intent = getUserIntent(msg_without_tag);
                    switch(user_intent[0]){
                        case "TIME_INTENT":
                            await doTimeIntent(msg_without_tag, user_intent[1], msg);
                            break;
                        case "LOGO_INTENT":
                            await doLogoIntent(msg);
                            break;
                        case "HELP_INTENT":
                            await doHelpIntent(msg);
                            break;
                        case "JANK_INTENT":
                            await doJankIntent(msg);
                            break;
                        case "MULTIPLE_INTENT":
                            let f = fs.readFileSync("./images/notadvanced.jpg");
                            await msg.channel.createMessage("It appears you tried to give me multiple commands. That is not advanced. Try again.", {
                                file: f,
                                name: "clock.jpg",
                            });
                            break;
                        default:
                            await msg.channel.createMessage("I didn't understand that. <:jankman:736593545376563320> Use @JankBot help for commands.");
                    }
                } else {
                    await msg.channel.createMessage("<:jankman:736593545376563320>");
                }
                
                if (msg.channel.id != TC_BOT_COMMANDS) {
                    //set a cooldown if we're not in #bot-commands
                    chans_can_post[msg.channel.id] = false;
                    setTimeout(() => {
                        chans_can_post[msg.channel.id] = true;
                    }, 60000);
                }
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

bot.connect();
/**
 * Gets a clock and saves to file.
 */
async function getClock(hrin, minin, is_angry = false) {
    const min = minin;
    const hr_rotation = hrin * 30 + min * 0.5;
    const min_rotation = min * 6;
    let images = ["./images/face.png", "./images/gimp.png", "./images/tant.png"];
    let face = sharp(images[parseInt(Math.floor(Math.random() * images.length))]);
    let hr_hand = is_angry ? sharp("./images/gunarm.png") : sharp("./images/ja2.png");
    let jman = is_angry ? sharp("./images/jankang.png") : sharp("./images/jankfce.png");
    let min_hand = is_angry ? sharp("./images/gunarm.png") : sharp("./images/ja2.png");

    jman = await jman.resize(null, 380).toBuffer();

    hr_hand = await hr_hand.rotate(hr_rotation + 10, {
        background: "#00FFFF00",
    });
    let h_m = await sharp(await hr_hand.toBuffer()).metadata();
    hr_hand = await hr_hand
        .extract({
            top: parseInt(Math.floor(h_m.height / 2 - 255)),
            left: parseInt(Math.floor(h_m.width / 2 - 255)),
            width: 510,
            height: 510,
        })
        .toBuffer();

    min_hand = await min_hand.rotate(min_rotation + 10, {
        background: "#00FFFF00",
    });
    let m_m = await sharp(await min_hand.toBuffer()).metadata();
    min_hand = await min_hand
        .extract({
            top: parseInt(Math.floor(m_m.height / 2 - 255)),
            left: parseInt(Math.floor(m_m.width / 2 - 255)),
            width: 510,
            height: 510,
        })
        .toBuffer();

    await face
        .composite([
            { input: hr_hand, top: 0, left: 0 },
            { input: jman, top: 70, left: 70 },
            { input: min_hand, top: 0, left: 0 },
        ])
        .toFile("./clocktopost.jpg");
}

/**
 * When the message was (probably) intended for time.
 * @param {*} split_msg
 * @param {*} msg
 */
async function doTimeIntent(msg_in, loc_intent, msg) {
    let msg_text = "";
    if (msg_in != "") {
        let c = extractPlaceNameFromMsg(msg_in);
        let r;
        try {
            r = await getGeoCodefromPlace(c);
        } catch (e) {
            r = null;
        }
        if (r == null) {
            msg_text = "That was not advanced.";
            h = Math.floor(Math.random() * 24);
            m = Math.floor(Math.random() * 60);
            await getClock(h, m, true);
        } else {
            let tz = await getTimeZonefromLatLong(r[0], r[1]);
            const place = r[2] == "" ? c : r[2];
            const d = new Date(
                new Date().toLocaleString("en-US", {
                    //fucking americans
                    timeZone: tz,
                })
            );
            if(loc_intent == "LOC_INTENT"){
                msg_text += `I think the place you've searched for is: https://maps.google.com/?q=${r[0]},${r[1]} . `
            }
            msg_text += `Wow! The time in \n[${place.toUpperCase()}]\n is:`;
            await getClock(d.getHours(), d.getMinutes());
        }
    } else {
        let t = new Date();
        await getClock(t.getHours(), t.getMinutes());
    }
    let f = fs.readFileSync("./clocktopost.jpg");
    await msg.channel.createMessage(msg_text, {
        file: f,
        name: "clock.jpg",
    });
    fs.unlinkSync("./clocktopost.jpg");
}
/**
 * 
 * @param {string} msg_in 
 * @returns 
 */
function extractPlaceNameFromMsg(msg_in){
    const msg_split = msg_in.split(" ");
    const in_loc = msg_split.indexOf("in");
    const time_loc = msg_split.indexOf("time");
    let out_loc = -1;
    //strip punctuation except ,
    const chars_to_strip = [".", "?", "!", "|"];
    for(const word of msg_split){
        for(const ch of chars_to_strip) msg_split[msg_split.indexOf(word)] = removeStringOf(word, ch);
    }
    const terminators = ["and"]
    for(const t of terminators) if(msg_split.indexOf(t) != -1){
        out_loc = msg_split.indexOf(t);
        break;
    }
    if(in_loc != -1 && out_loc != -1){
        return msg_split.slice(in_loc, out_loc).join(" ");
    } else if(in_loc == -1 && out_loc != -1){
        return msg_split.slice(time_loc, out_loc).join(" ");
    } else if(in_loc != -1 && out_loc == -1){
        return msg_split.slice(in_loc).join(" ");
    } else {
        return msg_split.slice(time_loc).join(" ");
    }
}

function removeStringOf(str, char){
    while(str.indexOf(char) != -1) {
        let char_to_remove = str.indexOf(char);
        if(char_to_remove == str.length-1) return str.slice(0, char_to_remove);
        else str = str.slice(0, char_to_remove) + str.slice(char_to_remove+1);
    }
    return str;
}

async function getGeoCodefromPlace(place_in) {
    resp = await axios.get(encodeURI(`https://open.mapquestapi.com/geocoding/v1/address?key=${MAPQUEST_TOKEN}&location=${place_in}`));

    if (resp.data.results[0].locations[0].latLng.lat == 39.78373 && resp.data.results[0].locations[0].latLng.lng == -100.445882) return null;
    else {
        return [resp.data.results[0].locations[0].latLng.lat, resp.data.results[0].locations[0].latLng.lng, resp.data.results[0].locations[0].adminArea5];
    }
}

async function getTimeZonefromLatLong(lat, long) {
    return geoTz(lat, long)[0];
}

async function doJankIntent(split_msg, msg) {
    {
        let f = fs.readFileSync("./images/jman.png");
        await msg.channel.createMessage("Here's an HQ Jankman! Credit to TANTAPRIZ ;].", {
            file: f,
            name: "hommedujanque.jpg",
        });
    }
}

async function doHelpIntent(msg) {
    await msg.channel.createMessage(
        `Follow me! There's plenty more jank in the sea!
\`@JankBot time <city>\` for the time -- you can also ask me for the location!
\`@JankBot jankman\` for a huge jankman.
\`@JankBot logo\` for a random MuseScore logo. DM Santana to add to the collection.

I'll only post outside of #bot-commands once every minute as an anti-spam measure.
All feature requests to Santana ft. Rob Thomas.`
    );
}

async function doLogoIntent(msg) {
    const logos = fs.readdirSync("./muselogos/");
    const logo_to_send = logos[parseInt(Math.floor(Math.random() * logos.length))];
    const l = fs.readFileSync("./muselogos/" + logo_to_send);
    await msg.channel.createMessage("", {
        file: l,
        name: logo_to_send,
    });
}

function getUserIntent(msg_as_str) {
    msg_as_str = msg_as_str.toLowerCase();
    let intent = [];
    let intent_count = 0;
    if (msg_as_str.contains("time")) {
        intent.push("TIME_INTENT");
        intent_count++;
        intent.push(msg_as_str.contains("location", "where") ? "LOC_INTENT" : "NO_LOC_INTENT");
    } if (msg_as_str.contains("logo")) {
        intent.push("LOGO_INTENT");
        intent_count++;
    } if (msg_as_str.contains("jank")) {
        intent.push("JANK_INTENT");
        intent_count++;
    } if (msg_as_str.contains("help")) {
        intent.push("HELP_INTENT");
        intent_count++;
    }
    if (intent_count > 1) {
        return ["MULTIPLE_INTENT"];
    } else return intent;
}
