import { SlashCommandBuilder } from "discord.js";
import Player from "../../Classes/player.js";
import Pokedex from "../../Classes/pokedex.js";
import capitalize from "../../Utilities/Misc/capitalize.js";

async function processVoucher(voucher = {}, user_id, postgres) {

    const { id, amount, type, pokemon, claimed, permanent } = voucher;
    // Destructure the properties `id`, `amount`, `type`, `pokemon`, `claimed`, and `permanent` from the `voucher` object.

    if (!id) return false;
    // If the `id` property is false, return `false`.

    return await postgres.begin(async sql => [
        // Return the result of calling the `begin` method on the `postgres` object, passing an async arrow function as an argument. The arrow function returns an array.

        sql`INSERT INTO claimed_vouchers ${sql({ id, user_id })}`,
        // Insert a new row into the "claimed_vouchers" table with the values of `id` and `user_id`.

        (!permanent && !claimed) ? sql`UPDATE voucher SET claimed = true WHERE id = ${id}` : undefined,
        // Conditionally update the "voucher" table if `permanent` and `claimed` properties are both false.

        (async () => {
            // Start an immediately-invoked async arrow function.

            switch (type) {
                // Start a switch statement based on the value of the `type` variable.

                case 0:
                    return (sql`UPDATE users SET bal = bal + ${amount} WHERE id = ${user_id}`);
                // Return an SQL query that updates the "users" table, incrementing the "bal" column by the value of `amount` for the specified `user_id`.

                case 1:
                    return (sql`UPDATE users SET redeem = redeem + ${amount} WHERE id = ${user_id}`);
                // Return an SQL query that updates the "users" table, incrementing the "redeem" column by the value of `amount` for the specified `user_id`.

                case 2:
                    try {
                        const voucherPokemon = new Pokedex({});
                        // Create a new instance of the `Pokedex` class.

                        await voucherPokemon.getColumnsByID(undefined, { _id: pokemon });
                        await voucherPokemon.SpawnFriendlyV2(true);
                        voucherPokemon.user_id = user_id;
                        // Set properties of the `voucherPokemon` object.

                        const [{ idx }] = await sql`SELECT MAX(idx) as idx FROM pokemon WHERE user_id = ${user_id}`;
                        voucherPokemon.idx = (idx || 0) + 1;
                        // Retrieve the maximum `idx` value from the "pokemon" table and set the `idx` property of `voucherPokemon`.

                        const pokemonTransaction = await voucherPokemon.save(sql, undefined, true);
                        // Save `voucherPokemon` and assign the result to `pokemonTransaction`.

                        return (sql.unsafe(pokemonTransaction.text, pokemonTransaction.values));
                        // Return an unsafe SQL query using the text and values of `pokemonTransaction`.

                    } catch (error) {
                        console.log(error);
                        return false;
                        // Log the error to the console and return `false`.
                    }

                default:
                    return false;
                // Return `false` for the default case.
            }
        })()
        // Immediately invoke the async arrow function.

    ].filter(x => x));
    // Filter out any false values from the array and return the filtered array.

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

        const code = msg.options.getString("code"); // Retrieve the value of the "code" option from the `msg` object and assign it to the `code` variable.

        if (code.split(" ").length > 1 && process.env.DEVIDS && JSON.parse(process.env.DEVIDS).includes(msg.user.id)) {
            // Check if the `code` variable has more than one space-separated string and if the `DEVIDS` environment variable exists and if the `msg.user.id` is included in the parsed JSON value of `DEVIDS`.

            let [command, type, amount, permanent, pokemon, time] = code.split(" "); // Split the `code` string into an array of strings separated by spaces and assign the values to the respective variables.

            if (time && isNaN(parseInt(time))) // Check if `time` exists and if it is not a valid integer.
                return msg.reply("Invalid Time"); // Return a reply to the `msg` object indicating that the time is invalid.

            if (!type.startsWith("p"))
                pokemon = null; // If `type` does not start with "p", set `pokemon` to `null`.

            try {
                const obj = {
                    // Create an object `obj` with the following properties:
                    type: type.startsWith('p') ? 2 : (type.startsWith('r') ? 1 : 0), // Set the `type` property based on the starting characters of `type` string.
                    pokemon, // Assign the `pokemon` variable to the `pokemon` property.
                    permanent: !!parseInt(permanent), // Convert `permanent` to a boolean value and assign it to the `permanent` property.
                    amount: BigInt(amount), // Convert `amount` to a BigInt and assign it to the `amount` property.
                    time: time ? new Date(parseInt(time)) : null // Convert `time` to a Date object if it exists, otherwise assign `null` to the `time` property.
                };

                const [added] = await msg.client.postgres`INSERT INTO voucher (id, type, amount, permanent, pokemon, expiredat) VALUES (gen_random_uuid(), ${obj.type}, ${obj.amount}, ${obj.permanent}, ${obj.pokemon || null}, ${obj.time} ) returning id`;
                // Insert a new row into the "voucher" table with the values from the `obj` object and retrieve the `id` of the inserted row.

                return msg.reply({ ephemeral: true, content: `Successfully made your voucher ID: \`${added.id}\`` });
                // Return a reply to the `msg` object indicating the successful creation of the voucher with the corresponding `id`.

            } catch (error) {
                console.log(error); // Log the error to the console.
                await msg.reply("An error occurred trying to make a voucher"); // Reply to the `msg` object indicating that an error occurred while making a voucher.
            }
        } else
        // Usage
        {

            if (code.split(" ").length > 1)
                return await msg.reply("Invalid Voucher");
            // Check if the `code` string has more than one space-separated segment. If true, reply with an "Invalid Voucher" message.

            const player = new Player({ id: msg.user.id });
            // Create a new instance of the `Player` class with the `id` property set to `msg.user.id`.

            await player.fetchColumns(msg.client.postgres, "id, started");
            // Fetch the columns "id" and "started" for the `player` object using the `msg.client.postgres` database connection.

            if (!player.started)
                return await msg.reply("You haven't started your journey yet!");
            // If the `started` property of the `player` object is false, reply with a message indicating that the user hasn't started their journey yet.

            const [foundVoucher] = await msg.client.postgres`SELECT * FROM voucher WHERE id = ${code}`;
            // Retrieve the first row from the "voucher" table where the `id` column matches the `code` value using the `msg.client.postgres` database connection.

            if (!foundVoucher)
                return await msg.reply("Voucher does not exist");
            // If no `foundVoucher` is retrieved, reply with a message indicating that the voucher does not exist.

            if (foundVoucher.expiredat && new Date(foundVoucher.expiredat).getTime() < Date.now())
                return await msg.reply("This Voucher expired");
            // If the `expiredat` property of the `foundVoucher` exists and its value is in the past, reply with a message indicating that the voucher has expired.

            if (!foundVoucher.permanent && foundVoucher.claimed)
                return await msg.reply("This Voucher was claimed");
            // If the `permanent` property of the `foundVoucher` is false and the `claimed` property is truth, reply with a message indicating that the voucher has already been claimed.

            if (foundVoucher.permanent) {
                const [userHasVouched] = await msg.client.postgres`SELECT true FROM claimed_vouchers WHERE id = ${code} AND user_id = ${msg.user.id}`;
                // Retrieve the first row from the "claimed_vouchers" table where the `id` column matches the `code` value and the `user_id` column matches `msg.user.id`.

                if (userHasVouched)
                    return await msg.reply("You already claimed this voucher");
                // If `userHasVouched` is truth, reply with a message indicating that the user has already claimed this voucher.
            }

            const processNewVoucher = await processVoucher(foundVoucher, msg.user.id, msg.client.postgres);
            // Call the `processVoucher` function with the `foundVoucher`, `msg.user.id`, and `msg.client.postgres` as arguments and assign the result to `processNewVoucher`.

            if (processNewVoucher?.[0])
                return await msg.reply(`Congratulations, you earnt ${foundVoucher.type == 2 ? "a " + capitalize(foundVoucher.pokemon, true) : (foundVoucher.type ? foundVoucher.amount + " redeem" : foundVoucher.amount + " credits")}`);
            // If the first element of `processNewVoucher` exists, reply with a congratulatory message based on the `foundVoucher` properties.

            return await msg.reply("An error occurred");
            // If none of the above conditions are met, reply with a generic error message.

        }

    }
}
