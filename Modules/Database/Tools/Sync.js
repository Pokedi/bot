import oldDb from "../pokedb.js";
import newDb from "../pokemondb.js";

async function syncDatabases() {
    try {
        console.log("Fetching table names from the new database...");

        const tables = await newDb`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
        `;

        // Define a batch size to prevent hitting the parameter limit
        const batchSize = 1000; // Adjust this value based on your table's column count and data volume

        for (const { table_name } of tables) {
            console.log(`Syncing table: ${table_name}`);

            // 1. Fetch primary keys using the standard information_schema
            const primaryKeyData = await newDb`
                SELECT kcu.column_name
                FROM information_schema.table_constraints AS tc 
                JOIN information_schema.key_column_usage AS kcu
                    ON tc.constraint_name = kcu.constraint_name
                    AND tc.table_schema = kcu.table_schema
                WHERE tc.constraint_type = 'PRIMARY KEY'
                    AND tc.table_schema = 'public'
                    AND tc.table_name = ${table_name};
            `;

            if (primaryKeyData.length === 0) {
                console.warn(`No primary key found for table: ${table_name}. Skipping...`);
                continue;
            }
            const primaryKeys = primaryKeyData.map(col => col.column_name);

            // 2. Explicitly fetch the column names for the table
            const columnsResult = await newDb`
                SELECT column_name
                FROM information_schema.columns
                WHERE table_schema = 'public'
                    AND table_name = ${table_name}
                ORDER BY ordinal_position;
            `;
            const allColumns = columnsResult.map(c => c.column_name);

            // 3. Fetch all rows using the explicit column list
            const newRows = await newDb`
                SELECT ${newDb(allColumns)}
                FROM ${newDb(table_name)}
            `;

            if (newRows.length === 0) {
                console.log(`Table ${table_name} is empty, nothing to sync.`);
                continue;
            }
            
            // 4. Build and execute the UPSERT query in batches
            const columnsToUpdate = allColumns.filter(col => !primaryKeys.includes(col));

            for (let i = 0; i < newRows.length; i += batchSize) {
                const batch = newRows.slice(i, i + batchSize);
                console.log(`  Processing batch ${Math.floor(i / batchSize) + 1} for table: ${table_name} (${batch.length} rows)`);

                if (columnsToUpdate.length === 0) {
                    await oldDb`
                        INSERT INTO ${oldDb(table_name)} ${oldDb(batch, ...allColumns)}
                        ON CONFLICT (${oldDb(primaryKeys)})
                        DO NOTHING
                    `;
                } else {
                    const updateClauses = columnsToUpdate.flatMap((col, idx) => {
                        const clause = oldDb`${oldDb(col)} = EXCLUDED.${oldDb(col)}`;
                        return idx > 0 ? [oldDb`,`, clause] : [clause];
                    });

                    await oldDb`
                        INSERT INTO ${oldDb(table_name)} ${oldDb(batch, ...allColumns)}
                        ON CONFLICT (${oldDb(primaryKeys)})
                        DO UPDATE SET ${updateClauses}
                    `;
                }
            }

            console.log(`Synced ${newRows.length} rows for table: ${table_name}`);
        }

        console.log("✅ Database sync complete!");
    } catch (error) {
        console.error("❌ Error syncing databases:", error);
    } finally {
        await oldDb.end();
        await newDb.end();
    }
}

await syncDatabases();
