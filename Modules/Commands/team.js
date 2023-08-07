import { SlashCommandBuilder } from "discord.js";
import Player from "../../Classes/player.js";
import capitalize from "../../Utilities/Misc/capitalize.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName('team')
        .setDescription('Check your Pokemon team out!'),
    async execute(msg) {

        const userDB = new Player({ id: BigInt(msg.user.id) });

        await userDB.fetch(msg.client.prisma);

        if (!userDB.started) return msg.reply({ ephemeral: true, content: "User not found" });

        if (!userDB.selected[0]) return msg.reply({ ephemeral: true, content: "No one's home..." });

        const selectedPokemon = await msg.client.prisma.pokemon.findMany({
            where: {
                OR: userDB.selected.map(x => ({ id: x }))
            },
            select: {
                id: true,
                idx: true,
                level: true,
                name: true,
                pokemon: true
            }
        });

        await msg.reply({
            embeds: [{
                title: "Your Team",
                fields: (() => {
                    // return [];
                    return userDB.selected.map(x => selectedPokemon.find(z => z.id == x)).filter(x => x).map((x, i) => {
                        return {
                            name: capitalize(x.name || x.pokemon) + ` (Nº ${x.idx}) _ _ _ _ _ _`,
                            value: `**Slot**: ${i + 1}\n**Level** ${x.level}`,
                            inline: true
                        }
                    }
                    );
                }
                )(),
                color: 7506394,
                footer: {
                    text: `/select Slot: <slot> ID: <pokemon id> - Organize your pokemon\n/info <id> - View your Pokemon`
                }
            }]
        });
    }
}