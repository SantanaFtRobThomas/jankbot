const Discord = require("discord.js");
const fs = require("fs");

const JANK_PARTS = {
    LEFT_EYE: "./images/components/eyeleft.png",
    RIGHT_EYE: "./images/components/eyeright.png",
    J_ARM: "./images/components/jarm.png",
    J_MOUTH: "./images/components/mouth.png",
    FULL_JANKMAN: "./images/jman.png",
};

async function doResourceIntent(msg) {
    let dropdown = [];
    dropdown.push(
        new Discord.MessageSelectMenu()
            .setCustomID("JANK_RESOURCE_SELECT")
            .setPlaceholder("Select one or more components!")
            .setMinValues(1)
            .setMaxValues(5)
            .addOptions([
                {
                    label: "Full Jankman",
                    description: "A full jankman.",
                    value: "FULL_JANKMAN",
                },
                {
                    label: "Left Eye",
                    description: "Jankman's Left Eye",
                    value: "LEFT_EYE",
                },
                {
                    label: "Right Eye",
                    description: "Jankman's Right Eye",
                    value: "RIGHT_EYE",
                },
                {
                    label: "Arm",
                    description: "Jankman's Arm",
                    value: "J_ARM",
                },
                {
                    label: "Mouth",
                    description: "Jankman's Mouth",
                    value: "J_MOUTH",
                },
            ])
    );
    msg.channel.send({ content: "Which resources do you want?", components: [dropdown] });
}

async function doJankIntent(msg) {
    {
        await msg.channel.send({
            files: ["./images/jman.png"],
        });
    }
}

function handleSelectMenu(interaction) {
    images_to_attach = [];
    for (let v of interaction.values) {
        images_to_attach.push(JANK_PARTS[v]);
    }
    interaction.message.edit({ content: "You can ask me for another menu with @JankBot resource!", components: [] });
    interaction.reply({ content: `Here you go, <@${interaction.user.id}>`, files: images_to_attach });
}

exports.doJankIntent = doJankIntent;
exports.doResourceIntent = doResourceIntent;
exports.handleResourceMenu = handleSelectMenu;