import { SlashCommandBuilder } from "discord.js";
import buttonVerification from "../../Utilities/Core/buttonVerification.js";
import removeDuplicates from "../../Utilities/Misc/removeDuplicates.js";
import Player from "../../Classes/player.js";
import { battleBoxFields, generateBattleBox, returnBattleBox } from "../../Utilities/Pokemon/pokemonBattleImage.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .addSubcommand(x => x
            .setName("start")
            .setDescription("Setup for Duels")
            .addMentionableOption(x => x
                .setName("vs-user-1")
                .setDescription("User 1 you will battle against [Required]")
            )
            .addMentionableOption(x => x
                .setName("vs-user-2")
                .setDescription("User 2 you will battle against")
            )
            .addMentionableOption(x => x
                .setName("vs-user-3")
                .setDescription("User 3 you will battle against")
            )

            .addMentionableOption(x => x
                .setName("2-user-vs")
                .setDescription("User 2 you will battle with")
            )
            .addMentionableOption(x => x
                .setName("3-user-vs")
                .setDescription("User 3 you will battle with")
            )
        )
        .setName('duel')
        .setDescription('Admin command'),
    async execute(msg) {

        if (msg.user.id != "688446585524584502") return await msg.reply("Yeah, this is currently being remade");

        const teamAIDs = removeDuplicates([msg.user.id, msg.options.getUser('2-user-vs'), msg.options.getUser('3-user-vs')]).filter(x => x);
        const teamBIDs = removeDuplicates([msg.options.getUser('vs-user-1'), msg.options.getUser('vs-user-2'), msg.options.getUser('vs-user-3')]).filter(x => x);

        if (!teamAIDs.length || !teamBIDs.length)
            return await msg.reply("You need to mention a specified number of players");

        if (teamAIDs.find(x => teamBIDs.includes(x)) || teamBIDs.find(x => teamAIDs.includes(x)))
            return await msg.reply("You cannot have the same members on both sides.");

        // const verification = await buttonVerification({ interaction: msg, users: [msg.user].concat(teamAIDs, teamBIDs).filter(x => x && x.id).map(x => x.id) });

        // if (!verification) return await msg.followUp("First Phase Failed");
        // if (verification) return await msg.followUp("First Phase Passed");

        const teamAConstructs = removeDuplicates(teamAIDs).map(x => new Player({ id: BigInt(x) }));
        const teamBConstructs = removeDuplicates(teamBIDs).map(x => new Player({ id: BigInt(x) }));

        // Fetch Details
        for (const member of teamAConstructs) {
            await member.fetch(msg.client.postgres);
            member.username = msg.client.users.cache.get(member.id)?.username;
            member.globalName = msg.client.users.cache.get(member.id)?.globalName;
        }

        for (const member of teamBConstructs) {
            await member.fetch(msg.client.postgres);
            member.username = msg.client.users.cache.get(member.id)?.username;
            member.globalName = msg.client.users.cache.get(member.id)?.globalName;
        }

        if (teamAConstructs.find(x => !x.selected.length) || teamBConstructs.find(x => !x.selected.length))
            // Change to Follow Up after enabling Verification
            return await msg.reply("One of the players does not have a Pokemon selected.");

        // Ready Teams
        const teamA = Object.assign(...teamAConstructs.map(x => ({ [x.id]: x })));
        const teamB = Object.assign(...teamBConstructs.map(x => ({ [x.id]: x })));

        for (const member in teamA) {
            await teamA[member].fetchPokemon(msg.client.postgres);
            // Change to Follow Up after enabling Verification
            if (!teamA[member].pokemon.length) return await msg.reply("Duel cancelled, <@" + member + "> does not have any Pokemon selected");

            teamA[member].readyBattleMode();
            if (teamA[member].pokemon) {
                for (const row of teamA[member].pokemon) {
                    row.readyBattleMode();
                    await row.readyBattleImage();
                }
            }
        }

        for (const member in teamB) {
            await teamB[member].fetchPokemon(msg.client.postgres);
            // Change to Follow Up after enabling Verification
            if (!teamB[member].pokemon.length) return await msg.reply("Duel cancelled, <@" + member + "> does not have any Pokemon selected");
            teamB[member].readyBattleMode();
            if (teamB[member].pokemon) {
                for (const row of teamB[member].pokemon) {
                    row.readyBattleMode();
                    await row.readyBattleImage();
                }
            }
        }

        let battleImage = await returnBattleBox(generateBattleBox(teamA, teamB));

        // Change to Follow Up after enabling Verification
        const battleMessage = await msg.reply({
            files: [{
                attachment: battleImage,
                name: "battle.png"
            }],
            embeds: [{
                image: {
                    url: "attachment://battle.png"
                },
                fields: battleBoxFields(teamA, teamB),
                author: {
                    icon_url: "https://cdn.discordapp.com/attachments/716304762395426816/1154365538303217774/225px-Sun_Moon_Professor_Kukui.png",
                    name: "Professor Kukui"
                }
            }]
        });

        return true;

    }
}
