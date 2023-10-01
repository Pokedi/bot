export default (array, chunkSize) => {
    var result = [];
    for (var i = 0; i < array.length; i += chunkSize) {
        var chunk = array.slice(i, i + chunkSize);
        result.push(chunk);
    }
    return result;
}