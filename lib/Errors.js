module.exports = {
    MISSING_ID: "Missing _id field",
    INVALID_FIELD: function(field) {
        return "`" + field + "` is not present in the given fields list"
    },
    UNSUPPORTED_ACCUMULATOR: function(acc) {
        return "Unsuported accumulator in `" + JSON.stringify(acc) + "`"
    },
    UNSUPPORTED_ACCUMULATOR_EXPRESSION: function(acc) {
        return "Unsuported accumulator expression in `" + JSON.stringify(acc) + "`"
    },
    EMPTY_PROJECTION: "Empty projection",
    EMPTY_GROUPING: "Empty grouping",
    INCLUSION_AND_EXCLUSION: "Both inclusion and exclusion of fields are not allowed"
}
