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
    EMPTY_MATCHING: "Empty matching",
    INCLUSION_AND_EXCLUSION: "Both inclusion and exclusion of fields are not allowed",
    IN_NOT_AN_ARRAY: "An array was not passed to the $in operator",
    MISSING_ORIGINAL_FIELD: function(operator) {
        return "The `" +  JSON.stringify(operator) + "` operator has no field name";
    },
    NOT_A_NUMBER: "Given comparison value is not a number",
    INVALID_COMPARISON_TYPE: function(type) {
        return "`" + JSON.stringify(type) + "` is not a valid comparison operator"
    },
    OR_NOT_AN_ARRAY: "An array was not passed to the $or operator",
    UNSUPPORTED_MATCH_OPERATOR: function(operator) {
        return "`" + JSON.stringify(operator) + "` is not a supported $match operator"
    },
    MISSING_FIELDS: function(stage) {
        return `Missing fields in the ${stage} stage`;
    }
}
