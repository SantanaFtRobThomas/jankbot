function removeStringOf(str, char) {
    while (str.indexOf(char) != -1) {
        let char_to_remove = str.indexOf(char);
        if (char_to_remove == str.length - 1) return str.slice(0, char_to_remove);
        else str = str.slice(0, char_to_remove) + str.slice(char_to_remove + 1);
    }
    return str;
}

exports.removeStringOf = removeStringOf