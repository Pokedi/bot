export default (mod, t) => {
    if (!mod)
        return 1;
    if (mod[t] == 0)
        return 1;
    if (mod[t] == 1)
        return 3 / 2;
    if (mod[t] == 2)
        return 4 / 2;
    if (mod[t] == 3)
        return 5 / 2;
    if (mod[t] == 4)
        return 6 / 2;
    if (mod[t] == 5)
        return 7 / 2;
    if (mod[t] == 6)
        return 8 / 2;
    if (mod[t] == -1)
        return 2 / 3;
    if (mod[t] == -2)
        return 2 / 4;
    if (mod[t] == -3)
        return 2 / 5;
    if (mod[t] == -4)
        return 2 / 6;
    if (mod[t] == -5)
        return 2 / 7;
    if (mod[t] == -6)
        return 2 / 8;
    return 1;
}