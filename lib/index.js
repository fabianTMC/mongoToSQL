var Errors = require("./Errors");

var $group = require("./stages/group");
var $project = require("./stages/project");
var $match = require("./stages/match");

function QueryBuilder(resource, fields, stage) {
    if(stage['$group']) {
        return $group(stage['$group'], resource, fields);
    } else if(stage['$project']) {
        return $project(stage['$project'], resource, fields);
    } else if(stage['$match']) {
        return $match(stage['$match'], resource, fields);
    }
}

function convert2(resource, fields, pipeline) {
    let lastResource = resource;
    let lastQuery = "";

    for(let i = 0; i < pipeline.length; i++) {
        lastQuery = QueryBuilder(lastResource, fields, pipeline[i]);

        // Check if anything went wrong
        if(lastQuery.success) {
            // Check if this is the last stage in the pipeline
            if((i + 1) != pipeline.length) {
                lastResource = "(" + lastQuery.query +") t" + i;
            } else {
                lastResource = lastQuery.query;
            }
        } else {
            return lastQuery.error;
        }
    }
    return lastResource;
}

module.exports = {
    $group: $group,
    $project: $project,
    $match: $match,
    convert: convert2,
    Errors: Errors
}
