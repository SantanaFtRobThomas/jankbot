const Discord = require("discord.js");

function doButtonIntent(msg) {
    let buttons = [];
    buttons.push(new Discord.MessageButton().setCustomID("NEW_ALL").setLabel("New All").setStyle(1));
    msg.channel.send({ content: "COME GET YA BUTTONS", components: [buttons] });
}

async function doFistIntent(msg) {
    let now = new Date();
    if (now.getDay() == 5) {
        if (now.getHours() >= 17 && now.getHours() < 21) await msg.channel.send("Almost!");
        else if (now.getHours() >= 21) await msg.channel.send("Yes!");
        else await msg.channel.send("Not quite, but it is today!");
    } else await msg.channel.send("No :( Fistchord is on Friday!");
}

async function doQuitSibelius(msg){
    let msg_to_send = { content: "  ­  ", components: [[]] };
    msg_to_send.components[0].push(new Discord.MessageButton().setCustomID("QUIT_SIBELIUS").setLabel("Quit Sibelius").setStyle(1));
    await msg.channel.send(msg_to_send);
}

exports.doButtonIntent=doButtonIntent;
exports.doFistIntent = doFistIntent;
exports.doQuitSibelius = doQuitSibelius;