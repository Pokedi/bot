function capitalize(string, removeHyphen) {
    if (!string)
        return "";
    if (removeHyphen)
        string = string.replace(/-/gmi, ' ');
    let mk = "";
    let ma = string.split("");
    ma.forEach((letter, aa) => {
        if (aa == 0)
            return (mk += letter.toUpperCase());
        if (ma[aa - 1] == " ")
            return (mk += ma[aa].toUpperCase());
        return (mk += letter);
    }
    );
    return mk;
}

export default capitalize;