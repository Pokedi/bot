import { SlashCommandBuilder } from "discord.js";
import Pokemon from "../../Classes/pokemon.js";
import Player from "../../Classes/player.js";
import buttonVerification from "../../Utilities/Core/buttonVerification.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName('trade').setNameLocalizations({
            "es-ES": "intercambio",
            "pt-BR": "trocar",
            "de": "tausch"
        })
        .setDescription('Release your pokemon')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add [pokemon, credit, redeem]')
                .addIntegerOption(option => option.setName("pokemon").setAutocomplete(true).setDescription("Select a pokemon to add to the trade"))
                .addIntegerOption(option => option.setName("credit").setDescription("Add credits to the trade"))
                .addIntegerOption(option => option.setName("redeem").setDescription("Add redeems to the trade"))
                .addStringOption(option => option.setName("mass").setDescription("Mass add pokemon to the trade by their IDs"))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove [pokemon, credit, redeem]')
                .addIntegerOption(option => option.setName("pokemon").setAutocomplete(true).setDescription("Select a pokemon to remove from the trade"))
                .addIntegerOption(option => option.setName("credit").setDescription("Remove credits to the trade"))
                .addIntegerOption(option => option.setName("redeem").setDescription("Remove redeems to the trade"))
                .addStringOption(option => option.setName("mass").setDescription("Mass remove pokemon to the trade by their IDs"))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("request")
                .setDescription('Mention a user you wish to trade with')
                .addUserOption(option => option.setName('user').setDescription('Select a user'))
        ).addSubcommand(subcommand =>
            subcommand
                .setName("confirm")
                .setDescription('Confirm the trade between you and the mysterious merchant')
        ).addSubcommand(subcommand =>
            subcommand
                .setName("cancel")
                .setDescription('Cancel the trade between you and the mysterious merchant')
        ),
    async execute(msg) {

        const Tradee = msg.options.getUser('user');

        if (Tradee) {
            // Ready User
            const You = new Player(msg.user);
            // Fetch User
            await You.fetch(msg.client.prisma);

            // Check if User is in Trade
            if (await You.isTrading(msg.client.redis))
                return msg.reply("No. You're still trading my dude. =w=");

            const Them = new Player({ id: BigInt(Tradee.id) });

            if (Them.id == You.id) return msg.reply("No, you cannot trade with yourself. That's just... sad...");

            let verification = await buttonVerification({ interaction: msg, users: [You.id.toString(), Them.id.toString()], title: "You are Trading now! Please verify!" });

            if (!verification) return msg.reply(`You both need to click on the button to verify the trade.`);

            return msg.followUp("Trade verified");

            // const Other = new Player()

        }

        return msg.reply("Hello");
    }
}
