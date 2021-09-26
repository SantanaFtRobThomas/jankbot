const Discord = require("discord.js");
const fs = require('fs')

const jdx = fs.readdirSync("./Jankedex/");
const jdx_str = [];
for (en of jdx) {
    jdx_str.push(en.split(".")[0].toLowerCase());
}

function doJankedexIntent(msg) {
    const msg_w_spaces = msg['wotag'].toLowerCase().split(" ");
    let msg_to_send = { content: "", files: [], components: [[]] };
    let pos;
    if (msg_w_spaces.indexOf("jankedex") + 1 < msg_w_spaces.length) {
        let index = msg_w_spaces[msg_w_spaces.indexOf("jankedex") + 1];
        if (jdx_str.includes(index)) {
            msg_to_send.files.push("./Jankedex/" + jdx[jdx_str.indexOf(index)]);
            pos = jdx_str.indexOf(index);
        } else {
            pos = parseInt(Math.floor(Math.random() * jdx.length));
            msg_to_send.files.push("./Jankedex/" + jdx[pos]);
            msg_to_send.content += "I couldn't find an entry by that name/number. Here's a random one!\n";
        }
    } else {
        pos = parseInt(Math.floor(Math.random() * jdx.length));
        msg_to_send.files.push("./Jankedex/" + jdx[pos]);
    }
    msg_to_send.content += `JANKEDEX ENTRY #${jdx[pos].split(".")[0]}:`;
    if (pos != 0) {
        msg_to_send.components[0].push(new Discord.MessageButton().setCustomID(`JANKEDEX_PREV_${pos}`).setLabel("⬅️").setStyle(2));
    }
    if (pos != jdx.length - 1) {
        msg_to_send.components[0].push(new Discord.MessageButton().setCustomID(`JANKEDEX_NEXT_${pos}`).setLabel("➡️").setStyle(2));
    }
    msg.channel.send(msg_to_send);
}

function handleJdxButton(interaction) {
    const data = interaction.customID.split("_");
    let pos = parseInt(data[2]);
    let msg_to_send = { content: "", files: [], components: [[]], attachments: [] };
    if (data[1] == "NEXT") pos++;
    else pos--;
    msg_to_send.files.push("./Jankedex/" + jdx[pos]);
    msg_to_send.content += `JANKEDEX ENTRY #${jdx[pos].split(".")[0]}:`;
    if (pos != 0) {
        msg_to_send.components[0].push(new Discord.MessageButton().setCustomID(`JANKEDEX_PREV_${pos}`).setLabel("⬅️").setStyle(2));
    }
    if (pos != jdx.length - 1) {
        msg_to_send.components[0].push(new Discord.MessageButton().setCustomID(`JANKEDEX_NEXT_${pos}`).setLabel("➡️").setStyle(2));
    }
    //console.log(msg_to_send);
    interaction.update(msg_to_send);
}

exports.doJankedexIntent = doJankedexIntent;
exports.handleJdxButton = handleJdxButton;