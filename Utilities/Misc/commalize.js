function commalize(string = new String()) {
    return string.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

export default commalize;