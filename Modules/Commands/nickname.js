import { SlashCommandBuilder } from "discord.js";
import Pokemon from "../../Classes/pokemon.js";
import capitalize from "../../Utilities/Misc/capitalize.js";

export default {
    help: "",
    data: new SlashCommandBuilder()
        .setName('nickname')
        .setNameLocalizations({
            'pt-BR': 'apelido',
            'es-ES': 'apodo',
            'de': 'spitzname',
            'fr': 'surnom',
            // 'ar': 'لقب'
        })
        .setDescription('Rename your Pokemon! Call it by something other than its species (you racist)')
        .setDescriptionLocalizations({
            'pt-BR': 'Renomeie seu Pokémon! Chame-o por algo diferente de sua espécie (seu racista)',
            'es-ES': '¡Renombra a tu Pokémon! Llámalo por algo que no sea su especie (racista)',
            'de': 'Benenne dein Pokémon um! Nenne es bei etwas anderem als seiner Spezies (du Rassist)',
            'fr': 'Renommez votre Pokémon! Appelez-le par autre chose que son espèce (raciste)',
            // 'ar': 'أعد تسمية بوكيمونك! ناده بشيء آخر غير فصيلته (يا عنصري)'
        })
        .addIntegerOption(option => option.setName('id').setRequired(true).setDescription('Type in the ID of the pokemon')
            .setNameLocalizations({
                'pt-BR': 'id',
                'es-ES': 'id',
                'de': 'id',
                'fr': 'id',
                // 'ar': 'المعرف'
            })
            .setDescriptionLocalizations({
                'pt-BR': 'Digite o ID do pokemon',
                'es-ES': 'Escribe el ID del pokemon',
                'de': 'Gib die ID des Pokemons ein',
                'fr': 'Tapez l\'ID du pokémon',
                // 'ar': 'اكتب معرف البوكيمون'
            }))
        .addStringOption(option => option.setName('new-name').setDescription('Type in the new name of the pokemon').setMaxLength(50)
            .setNameLocalizations({
                'pt-BR': 'novo-nome',
                'es-ES': 'nuevo-nombre',
                'de': 'neuer-name',
                'fr': 'nouveau-nom',
                // 'ar': 'اسم-جديد'
            })
            .setDescriptionLocalizations({
                'pt-BR': 'Digite o novo nome do pokemon',
                'es-ES': 'Escribe el nuevo nombre del pokemon',
                'de': 'Gib den neuen Namen des Pokemons ein',
                'fr': 'Tapez le nouveau nom du pokémon',
                // 'ar': 'اكتب الاسم الجديد للبوكيمون'
            }))
        .addBooleanOption(option => option.setName('reset').setDescription('Select this if you wish to reset your pokemon name')
            .setNameLocalizations({
                'pt-BR': 'resetar',
                'es-ES': 'restablecer',
                'de': 'zurücksetzen',
                'fr': 'réinitialiser',
                // 'ar': 'إعادة تعيين'
            })
            .setDescriptionLocalizations({
                'pt-BR': 'Selecione isto se desejar redefinir o nome do seu pokemon',
                'es-ES': 'Selecciona esto si deseas restablecer el nombre de tu pokemon',
                'de': 'Wähle dies aus, wenn du deinen Pokémon-Namen zurücksetzen möchtest',
                'fr': 'Sélectionnez ceci si vous souhaitez réinitialiser le nom de votre pokémon',
                // 'ar': 'حدد هذا إذا كنت ترغب في إعادة تعيين اسم بوكيمونك'
            })),
    async execute(msg) {

        const pokemonID = msg.options.getInteger('id');

        const setName = msg.options.getString('new-name') || "";

        const resetPokemon = msg.options.getBoolean('reset');

        const queryPokemon = new Pokemon({ user_id: msg.user.id, idx: pokemonID });

        await queryPokemon.fetchPokemonByIDX(msg.client.postgres)

        if (!queryPokemon.pokemon) return await msg.reply("Pokemon of that ID does not exist.");

        if (resetPokemon) queryPokemon.name = null;

        if (setName) queryPokemon.name = setName;

        try {
            await msg.client.postgres`UPDATE pokemon SET name = ${resetPokemon ? null : setName} WHERE id = ${queryPokemon.id}`;

            await msg.reply(`Your ${capitalize(queryPokemon.pokemon)} (${queryPokemon.idx}) was updated.`);

        } catch (error) {
            await msg.reply("An error occurred, contact an admin");
        }

    }
}
