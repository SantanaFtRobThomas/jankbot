const { removeStringOf } = require('./jankutils');
const axios = require("axios");
const geoTz = require("geo-tz");
const sharp = require("sharp");
const fs = require('fs');
const { mapquest } = require('./token')
const MAPQUEST_TOKEN = mapquest;


async function getGeoCodefromPlace(place_in) {
    resp = await axios.get(
        `https://open.mapquestapi.com/geocoding/v1/address?key=${encodeURIComponent(MAPQUEST_TOKEN)}&location=${encodeURIComponent(place_in)}`
    );

    if (resp.data.results[0].locations[0].latLng.lat == 39.78373 && resp.data.results[0].locations[0].latLng.lng == -100.445882) return null;
    else {
        return [resp.data.results[0].locations[0].latLng.lat, resp.data.results[0].locations[0].latLng.lng, resp.data.results[0].locations[0].adminArea5];
    }
}

async function getTimeZonefromLatLong(lat, long) {
    return geoTz(lat, long)[0];
}

/**
 *
 * @param {string} msg_in
 * @returns
 */
 function extractPlaceNameFromMsg(msg_in) {
    const msg_split = msg_in.split(" ");
    const in_loc = msg_split.indexOf("in");
    const time_loc = msg_split.indexOf("time");
    let out_loc = -1;
    //strip punctuation except ,
    const chars_to_strip = [".", "?", "!", "|"];
    for (const word of msg_split) {
        for (const ch of chars_to_strip) msg_split[msg_split.indexOf(word)] = removeStringOf(word, ch);
    }
    const terminators = ["and", "where"];
    for (const t of terminators)
        if (msg_split.indexOf(t) != -1) {
            out_loc = msg_split.indexOf(t);
            break;
        }
    if (in_loc != -1 && out_loc != -1) {
        return msg_split.slice(in_loc + 1, out_loc).join(" ");
    } else if (in_loc == -1 && out_loc != -1) {
        return msg_split.slice(time_loc + 1, out_loc).join(" ");
    } else if (in_loc != -1 && out_loc == -1) {
        return msg_split.slice(in_loc + 1).join(" ");
    } else {
        return msg_split.slice(time_loc + 1).join(" ");
    }
}

/**
 * Gets a clock and saves to file.
 */
 async function getClock(hrin, minin, is_angry = false) {
    const min = minin;
    const hr_rotation = hrin * 30 + min * 0.5;
    const min_rotation = min * 6;
    let images = ["./images/face.png", "./images/gimp.png", "./images/tant.png", "./images/shipclocc.jpg"];
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

async function doTime(msg_in){
    msg_text = ""
    if (msg_in != " time" && msg_in != "time") {
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
            if (msg_in.includes("where")) {
                msg_text += `I think the place you've searched for is: https://maps.google.com/?q=${r[0]},${r[1]} . `;
            }
            msg_text += `Wow! The time in \n[${place.toUpperCase()}]\n is:`;
            await getClock(d.getHours(), d.getMinutes());
        }
    } else {
        let t = new Date();
        msg_text += "Jankman time:";
        await getClock(t.getHours(), t.getMinutes());
    }
    return msg_text
}

/**
 * When the message was (probably) intended for time.
 * @param {*} msg
 */
 async function doTimeIntent(msg) {
    let msg_text = await doTime(msg['wotag']);
    
    //let f = fs.readFileSync("./clocktopost.jpg");
    await msg.channel.send({ content: msg_text, files: ["clocktopost.jpg"] });
    fs.unlinkSync("./clocktopost.jpg");
}

exports.doTimeIntent = doTimeIntent