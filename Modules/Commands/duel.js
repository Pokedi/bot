import { SlashCommandBuilder } from "discord.js";
import buttonVerification from "../../Utilities/Core/buttonVerification.js";
import removeDuplicates from "../../Utilities/Misc/removeDuplicates.js";
import Player from "../../Classes/player.js";

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

        // const teamAIDs = removeDuplicates([msg.options.getUser('2-user-vs'), msg.options.getUser('3-user-vs')]);
        // const teamBIDs = removeDuplicates([msg.options.getUser('vs-user-1'), msg.options.getUser('vs-user-2'), msg.options.getUser('vs-user-3')]);

        // const verification = await buttonVerification({ interaction: msg, users: [msg.user].concat(teamAIDs, teamBIDs).filter(x => x && x.id).map(x => x.id) });

        // if (!verification) return await msg.followUp("First Phase Failed");
        // if (verification) return await msg.followUp("First Phase Passed");

        const teamAConstructs = removeDuplicates(["233823931830632449", "688446585524584502"]).map(x => new Player({ id: BigInt(x) }));
        const teamBConstructs = removeDuplicates(["772130014149083207", "678401615333556277"]).map(x => new Player({ id: BigInt(x) }));

        // Fetch Details
        for (const member of teamAConstructs) {
            await member.fetch(msg.client.postgres);
        }

        for (const member of teamBConstructs) {
            await member.fetch(msg.client.postgres);
        }

        // Ready Teams
        const teamA = Object.assign(teamAConstructs.map(x => ({ [x.id]: x })));
        const teamB = Object.assign(teamBConstructs.map(x => ({ [x.id]: x })));

        for (const member in teamA) {
            await teamA[member].fetchPokemon();
        }

        for (const member in teamA) {
            await teamB[member].fetchPokemon();
        }



    }
}
