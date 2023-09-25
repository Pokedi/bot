class Duel {
    constructor(teamA = {}, teamB = {}) {
        this.teamA = teamA;
        this.teamB = teamB;
    }

    attack(attacking_user, users = [], move_name) {

        if (!attacking_user) return false;

        const whatTeam = this.teamA[attacking_user] || this.teamB[attacking_user];

    }

    move(name) {

    }
}

export default Duel;