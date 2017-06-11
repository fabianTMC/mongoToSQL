var Errors = require("../Errors");
var MatchExpressionConvertor = require("../helpers/$match/MatchExpressionConvertor");

module.exports = function($match, resource, options = {headless: false}) {
    if(Object.keys($match).length != 0) {
        let query = "";
        if(options.headless !== undefined && options.headless === false) {
            query += "SELECT * FROM " + resource + " ";
        }

        query += "WHERE";
        let keys = Object.keys($match);
        
        for(let i = 0; i < keys.length; i++) {
            let field = keys[i];
            let fieldValue = $match[field];

            let result = MatchExpressionConvertor(field, fieldValue);
            if(!result.success) {
                return result; // An error occurred so bubble it up
            } else {
                query += result.query + " AND";
            }
        }
        
        // Remove the last suffix
        if(query.substr(query.length - 4) == " AND") {
            query = query.slice(0, -4);
        }

        return {
            success: true,
            query: query
        }
    } else {
        return {
            success: false,
            error: Errors.EMPTY_MATCHING
        };
    }
}

