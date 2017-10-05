var Errors = require("./Errors");

var $group = require("./stages/group");
var $project = require("./stages/project");
var $match = require("./stages/match");
var $lookup = require("./stages/lookup");

function QueryBuilder(resource, stage, tableCounter) {
    if(stage['$group']) {
        return $group(stage['$group'], resource, {tableCounter: tableCounter});
    } else if(stage['$project']) {
        return $project(stage['$project'], resource, {tableCounter: tableCounter});
    } else if(stage['$match']) {
        return $match(stage['$match'], resource, {tableCounter: tableCounter});
    } else if(stage['$lookup']) {
        return $lookup(stage['$lookup'], resource, {tableCounter: tableCounter});
    }
}

function convert2(resource, pipeline) {
    let lastResource = resource;
    let lastQuery = "";

    for(let i = 0; i < pipeline.length; i++) {
        lastQuery = QueryBuilder(lastResource, pipeline[i], i);

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
    $lookup, $lookup,
    convert: convert2,
    Errors: Errors
}
