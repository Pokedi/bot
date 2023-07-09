function calculateNextLevelEXP(level, baseEXP, type = 0) {

    switch (type) {
        // Pokedi
        case 0:
            return Math.floor((((2 * 100) / (100 - level)) ^ (4 + level) ^ 3) * ((baseEXP || 256) / 20));
        // Erratic
        case 1:
            {
                if (level < 50) return ((Math.pow(level, 3) * (100 - level)) / 50);
                if (level < 68) return ((Math.pow(level, 3) * (150 - level)) / 50);
                if (level < 98) return ((Math.pow(level, 3) * ((1911 - level * 10) / 3)) / 500);
                return ((Math.pow(level, 3) * (160 - level)) / 50);
            }
        // Fast
        case 2:
            {
                return (4 * Math.pow(level, 3)) / 5;
            }
        // Medium Fast
        case 3:
            {
                return Math.pow(level, 3);
            }
        // Medium Slow 
        case 4: {
            return (6 / 5) * Math.pow(level, 3) - 15 * Math.pow(level, 2) + 100 * level - 140;
        }
        // Slow
        case 5:
        default: {
            return (5 * Math.pow(level, 3)) / 4;
        }
        // Fluctuating
        case 6:
            {
                if (level < 15) return Math.pow(level, 3) * ((((level + 1) / 3) + 24) / 50) * 1;
                if (level < 36) return Math.pow(level, 3) * ((level + 14) / 50);
                return Math.pow(level, 3) * (((level / 2) + 32) / 50);
            }
    }
}

export default calculateNextLevelEXP;