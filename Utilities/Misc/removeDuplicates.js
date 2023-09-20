export default (array = []) => {
    return array.filter(function (item, pos) {
        return array.indexOf(item) == pos;
    })
};