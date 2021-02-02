module.exports = {
    MISSING_ID: "Missing _id field",
    INVALID_FIELD: function(field) {
        return "`" + field + "` is not present in the given fields list"
    },
    UNSUPPORTED_STAGE: function(stage) {
        return "Unsupported stage `" + JSON.stringify(stage) + "`"
    },
    UNSUPPORTED_ACCUMULATOR: function(acc) {
        return "Unsupported accumulator in `" + JSON.stringify(acc) + "`"
    },
    UNSUPPORTED_ACCUMULATOR_EXPRESSION: function(acc) {
        return "Unsupported accumulator expression in `" + JSON.stringify(acc) + "`"
    },
    EMPTY_PROJECTION: "Empty projection",
    EMPTY_GROUPING: "Empty grouping",
    EMPTY_LIMIT: "Empty limit",
    EMPTY_SKIP: "Empty skip",
    EMPTY_MATCHING: "Empty matching",
    EMPTY_UNION_PIPELINE: "Empty union pipeline",
    EMPTY_UNION_SUBPIPELINE: "Empty union sub-pipeline",
    EMPTY_QUERY_PIPELINE: "Empty query pipeline",
    EMPTY_QUERY_SUBPIPELINE: "Empty query sub-pipeline",
    EMPTY_ORDER: "Empty order",
    INVALID_ORDER_OBJECT: "Invalid order object",
    INVALID_LIMIT: "Invalid limit",
    INVALID_SKIP: "Invalid skip",
    INCLUSION_AND_EXCLUSION: "Both inclusion and exclusion of fields are not allowed",
    IN_NOT_AN_ARRAY: "An array was not passed to the $in operator",
    MISSING_ORIGINAL_FIELD: function(operator) {
        return "The `" + JSON.stringify(operator) + "` operator has no field name";
    },
    NOT_A_NUMBER: "Given comparison value is not a number",
    INVALID_COMPARISON_TYPE: function(type) {
        return "`" + JSON.stringify(type) + "` is not a valid comparison operator"
    },
    OR_NOT_AN_ARRAY: "An array was not passed to the $or operator",
    CONCAT_NOT_AN_ARRAY: "An array was not passed to the $concat operator",
    UNSUPPORTED_MATCH_OPERATOR: function(operator) {
        return "`" + JSON.stringify(operator) + "` is not a supported $match operator"
    },
    UNSUPPORTED_PROJECT_OPERATOR: function(operator) {
        return "`" + JSON.stringify(operator) + "` is not a supported $project operator"
    },
    MISSING_FIELDS: function(stage) {
        return `Missing fields in the ${stage} stage`;
    },
    INVALID_SUM_OPERATOR: "All operands in the $sum stage must be separated by a operator",
    INVALID_$AS: "Invalid type for the `as` field or no keys provided",
    MISSING_RESOURCE_NAME: "Missing table name",
    INVALID_JOIN_TYPE: function(type) {
        return `Invalid join type "${type}"`;
    },
    UNKNOWN_ERROR: "An unknown error occurred",
}
