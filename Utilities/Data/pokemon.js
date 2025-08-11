// Import of All Pokemon Files
// import gen1 from "./Pokemon/gen1.json" assert {type: "json"};
// import gen2 from "./Pokemon/gen2.json" assert {type: "json"};
// import gen3 from "./Pokemon/gen3.json" assert {type: "json"};
// import gen4 from "./Pokemon/gen4.json" assert {type: "json"};
// import gen5 from "./Pokemon/gen5.json" assert {type: "json"};
// import gen6 from "./Pokemon/gen6.json" assert {type: "json"};
// import gen7 from "./Pokemon/gen7.json" assert {type: "json"};
// import gen8 from "./Pokemon/gen8.json" assert {type: "json"};
// import custom from "./Pokemon/custom.json" assert {type: "json"};
// import gen9 from "./Pokemon/gen9.json" assert {type: "json"};

import pokemondb from "../../Modules/Database/pokedb.js";

// const allPokemon = [...gen1, ...gen2, ...gen3, ...gen4, ...gen5, ...gen6, ...gen7, ...gen8, ...custom];

const allPokemon = await pokemondb`SELECT
                p.id,
                p.name AS _id, -- Use name as _id (slug) for consistency
                p.name AS name,
                p.height,
                p.weight,
                p.base_experience,
                ps.gender_rate,
                ps.capture_rate,
                ps.base_happiness,
                ps.is_baby,
                ps.hatch_counter,
                ps.forms_switchable,
                ps.has_gender_differences,
                ps.evolves_from_species_id,
                stats.spd,
                stats.hp,
                stats.def,
                stats.atk,
                stats.spdef,
                stats.spatk,
                NULL::integer AS acc, -- Placeholder if not available in current schema
                NULL::integer AS eva, -- Placeholder if not available in current schema
                types.types,
                ps.pokemon_color_id,
                ps.pokemon_shape_id,
                ps.growth_rate_id,
                ps.pokemon_habitat_id,
                ps.is_mythical,
                ps.is_legendary,
                FALSE AS is_sub_legendary, -- Set explicitly as false based on schema mapping
                FALSE AS is_custom,        -- Set explicitly as false
                FALSE AS is_nonspawnable,  -- Set explicitly as false
                FALSE AS is_event,         -- Set explicitly as false
                NULL::text AS art,         -- Placeholder for art URL
                p.id AS dexid
            FROM pokemon_v2_pokemon p
            JOIN pokemon_v2_pokemonspecies ps ON ps.id = p.pokemon_species_id
            -- Subquery for stats
            LEFT JOIN (
                SELECT
                    s.pokemon_id,
                    MAX(CASE WHEN s.stat_id = 7 THEN s.base_stat END) AS spd, -- Speed
                    MAX(CASE WHEN s.stat_id = 1 THEN s.base_stat END) AS hp,  -- HP
                    MAX(CASE WHEN s.stat_id = 3 THEN s.base_stat END) AS def, -- Defense
                    MAX(CASE WHEN s.stat_id = 2 THEN s.base_stat END) AS atk, -- Attack
                    MAX(CASE WHEN s.stat_id = 6 THEN s.base_stat END) AS spdef, -- Special Defense
                    MAX(CASE WHEN s.stat_id = 4 THEN s.base_stat END) AS spatk -- Special Attack
                FROM pokemon_v2_pokemonstat s
                GROUP BY s.pokemon_id
            ) stats ON stats.pokemon_id = p.id
            LEFT JOIN (
                SELECT
                    pt_sub.pokemon_id,
                    ARRAY_AGG(t.id ORDER BY pt_sub.slot) AS types
                FROM (
                    SELECT DISTINCT ON (pt.pokemon_id, pt.type_id)
                        pt.pokemon_id, pt.type_id, pt.slot
                    FROM pokemon_v2_pokemontype pt
                    ORDER BY pt.pokemon_id, pt.type_id, pt.slot
                ) pt_sub
                JOIN pokemon_v2_type t ON t.id = pt_sub.type_id
                GROUP BY pt_sub.pokemon_id
            ) types ON types.pokemon_id = p.id`;

export default allPokemon;