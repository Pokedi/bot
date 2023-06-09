import { prisma } from "../Services/Main";

class Player {
    constructor(info = { id } = {}) {
        this.id = info.id;
    }

    async fetch() {
        return Object.assign(this, await prisma.users.findUnique({ where: { id: BigInt(this.id) } }));
    }
}