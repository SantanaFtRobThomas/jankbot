const Discord = require("discord.js");
const fs = require("fs");

async function doLogoIntent(msg) {
    const logos = fs.readdirSync("./muselogos/");
    const logo_to_send = logos[parseInt(Math.floor(Math.random() * logos.length))];
    //const l = fs.readFileSync("./muselogos/" + logo_to_send);
    await msg.channel.send({
        files: ["./muselogos/" + logo_to_send],
        components: [[new Discord.MessageButton().setCustomID(`NEWLOGO_${logo_to_send}`).setLabel("New Logo").setStyle(1)]],
    });
}

async function handleNewLogoButton(interaction){ 
    const posn_old = parseInt(interaction.customID.split("_")[1]);
            const logos = fs.readdirSync("./muselogos/");
            let newpos;
            do {
                newpos = parseInt(Math.floor(Math.random() * logos.length));
            } while (newpos == posn_old);
            const logo_to_send = logos[newpos];
            interaction.update({ content: "<:jankman:736593545376563320>", files: ["./muselogos/" + logo_to_send], attachments: [] });
}

exports.doLogoIntent = doLogoIntent;
exports.handleNewLogoButton = handleNewLogoButton;