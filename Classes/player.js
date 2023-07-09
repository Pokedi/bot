class Player {
    constructor(info = { id } = {}) {
        this.id = info.id;
    }

    async fetch(prisma) {
        return Object.assign(this, await prisma.users.findUnique({ where: { id: BigInt(this.id) } }));
    }
}

export default Player;