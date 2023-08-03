function arrayOffset(array = [], page = 0, length = 20) {
    return array.splice(page * length, length);
}

export default arrayOffset;