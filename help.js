async function doHelpIntent(msg, commands) {
    msg_to_send = `Follow me! There's Plenty more jank in the sea!
Wake me up with <@841382352936632400> or j! before your command.
Commands:
`
    trigger_word = msg.content.slice(0, -msg['wotag'].length);
    for([command, c] of Object.entries(commands)){
        if(c['helpMsg'] != '') msg_to_send += `${trigger_word}\`${c['helpMsg']}\`\n\n`
    }
    
msg_to_send += `\nI'll only post outside of #bot-commands once every minute as an anti-spam measure.
All feature requests to <@204969832326627330>.`

    await msg.channel.send(msg_to_send);
}

exports.doHelpIntent = doHelpIntent