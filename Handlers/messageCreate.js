import Chance from "chance";

const chance = Chance();

async function messageCreate(msg, e) {
    console.log(msg, e);

    if (!msg.guild || (msg.member && msg.member.user.bot))
        return;

    // msg.reply(msg.content);

    // Spawn System
    if (!msg.guild.spawn) msg.guild.spawn = { count: chance.integer({ min: 30, max: 140 }), pokemon: {} };

    msg.guild.spawn.count--;

    if (msg.guild.spawn < 0) {
        
    }

    return true;
}

export default messageCreate;