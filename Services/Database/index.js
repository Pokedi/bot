import { PrismaClient } from "@prisma/client";

const client = new PrismaClient({
    log: [
        { level: 'warn', emit: 'event' }, { level: 'info', emit: 'event' }, { level: 'error', emit: 'event' }, { level: 'query', emit: 'event' }],
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});

client.$on('warn', (e) => { console.log(e) });
client.$on('info', (e) => { console.log(e) });
client.$on('error', (e) => { console.log(e) });
client.$on('query', (e) => {
    console.log(e)
})

export default client;