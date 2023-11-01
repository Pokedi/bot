import { SlashCommandBuilder } from "discord.js";
import Player from "../../Classes/player.js";
import Pokedex from "../../Classes/pokedex.js";
import capitalize from "../../Utilities/Misc/capitalize.js";

async function processVoucher(voucher = {}, user_id, postgres) {

    const { id, amount, type, pokemon, claimed, permanent } = voucher;

    if (!id) return false;

    return await postgres.begin(async sql => [
        sql`INSERT INTO claimed_vouchers ${sql({ id, user_id })}`,
        (!permanent && !claimed) ? sql`UPDATE voucher SET claimed = true WHERE id = ${id}` : undefined,
        (async () => {
            switch (type) {
                case 0:
                    return (sql`UPDATE users SET bal = bal + ${amount} WHERE id = ${user_id}`);
                case 1:
                    return (sql`UPDATE users SET redeem = redeem + ${amount} WHERE id = ${user_id}`);
                case 2:
                    try {
                        const voucherPokemon = new Pokedex({});
                        await voucherPokemon.getColumnsByID(undefined, { _id: pokemon });
                        await voucherPokemon.SpawnFriendlyV2(true);
                        voucherPokemon.user_id = user_id;
                        const [{ idx }] = await sql`SELECT MAX(idx) as idx FROM pokemon WHERE user_id = ${user_id}`;
                        voucherPokemon.idx = (idx || 0) + 1;
                        const pokemonTransaction = await voucherPokemon.save(sql, undefined, true);
                        return (sql.unsafe(pokemonTransaction.text, pokemonTransaction.values));
                    } catch (error) {
                        console.log(error);
                        return false;
                    }
                default:
                    return false;
            }
        })()
    ].filter(x => x));

}

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName('voucher')
        .setDescription('Claim your ticket to the chocolate factory!')
        .addStringOption(option => option
            .setName("code")
            .setDescription("Token of the Voucher you wish to claim").setRequired(true)
        ),
    async execute(msg) {

        // Declare Voucher Code
        const code = msg.options.getString("code");

        // Create Voucher
        if (code.split(" ").length > 1 && process.env.DEVIDS && JSON.parse(process.env.DEVIDS).includes(msg.user.id)) {

            let [command, type, amount, permanent, pokemon, time] = code.split(" ");

            if (time && isNaN(parseInt(time)))
                return msg.reply("Invalid Time");

            if (!type.startsWith("p"))
                pokemon = null;

            try {
                
                const obj = {
                    type: type.startsWith('p') ? 2 : (type.startsWith('r') ? 1 : 0),
                    pokemon,
                    permanent: !!parseInt(permanent),
                    amount: BigInt(amount),
                    time: time ? new Date(parseInt(time)) : null
                }

                const [added] = await msg.client.postgres`INSERT INTO voucher (id, type, amount, permanent, pokemon, expiredat) VALUES (gen_random_uuid(), ${obj.type}, ${obj.amount}, ${obj.permanent}, ${obj.pokemon || null}, ${obj.time} ) returning id`;

                return msg.reply({ ephemeral: true, content: `Successfully made your voucher ID: \`${added.id}\`` });

            } catch (error) {

                console.log(error);

                await msg.reply("An error occurred trying to make a voucher");

            }

        } else
        // Usage
        {

            // Reject User
            if (code.split(" ").length > 1)
                return await msg.reply("Invalid Voucher");

            const player = new Player({ id: msg.user.id });

            await player.fetchColumns(msg.client.postgres, "id, started");

            if (!player.started)
                return await msg.reply("You haven't started your journey yet!");

            // Voucher
            const [foundVoucher] = await msg.client.postgres`SELECT * FROM voucher WHERE id = ${code}`;

            if (!foundVoucher)
                return await msg.reply("Voucher does not exist");

            if (foundVoucher.expiredat && new Date(foundVoucher.expiredat).getTime() < Date.now())
                return await msg.reply("This Voucher expired");

            if (!foundVoucher.permanent && foundVoucher.claimed)
                return await msg.reply("This Voucher was claimed");

            if (foundVoucher.permanent) {

                const [userHasVouched] = await msg.client.postgres`SELECT true FROM claimed_vouchers WHERE id = ${code} AND user_id = ${msg.user.id}`;

                if (userHasVouched)
                    return await msg.reply("You already claimed this voucher");

            }

            const processNewVoucher = await processVoucher(foundVoucher, msg.user.id, msg.client.postgres);

            if (processNewVoucher?.[0])
                return await msg.reply(`Congratulations, you earnt ${foundVoucher.type == 2 ? "a " + capitalize(foundVoucher.pokemon, true) : (foundVoucher.type ? foundVoucher.amount + " redeem" : foundVoucher.amount + " credits")}`)

            return await msg.reply("An error occured");

        }

    }
}
