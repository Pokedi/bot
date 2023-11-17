export default (arr = []) => {
    return arr.reduce((partialSum, a) => partialSum + a, 0);
}