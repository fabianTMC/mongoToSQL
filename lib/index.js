var mysql = require("mysql");

var Errors = require("./Errors");

var $group = require("./stages/group");
var $project = require("./stages/project");
var $match = require("./stages/match");
var $lookup = require("./stages/lookup");

function QueryBuilder(resource, stage, options) {
    if (stage['$group']) {
        return $group(stage['$group'], resource, options);
    }

    else if (stage['$project']) {
        if (options.previousStage != undefined && options.previousStage != null && options.previousStage["$match"]) {
            options['headless'] = true;
        }

        return $project(stage['$project'], resource, options);
    }

    else if (stage['$match']) {
        if (options.nextStage != undefined && options.nextStage != null && options.nextStage["$project"]) {
            options['headless'] = true;
        }

        return $match(stage['$match'], resource, options);
    }

    else if (stage['$lookup']) {
        return $lookup(stage['$lookup'], resource, options);
    }
}

function convert2(resource, pipeline) {
    try {
        let resources = [];

        let queries = pipeline.reduce((acc, currentStage, index) => {
            // Escape the first identifier because only the $match>$project optimization will be using it
            // and it will not get escaped if that pattern is the first two stages
            resources.push((index == 0) ? mysql.escapeId(acc) : acc);

            let previousStage = (index > 0) ? pipeline[index - 1] : null;
            let nextStage = (index + 1 != pipeline.length) ? pipeline[index + 1] : null;

            let lastQuery = QueryBuilder(acc, currentStage, {
                tableCounter: index,
                nextStage: nextStage,
                previousStage: previousStage
            });

            if (lastQuery.success) {
                if(nextStage != null && nextStage["$project"] && currentStage["$match"]) {
                    acc = lastQuery.query;
                } else if(previousStage != null && previousStage["$match"] && currentStage["$project"]) {
                    acc = lastQuery.query + " FROM " + resources[index - 1] + " " + acc;
                } else if(nextStage != null) {
                    // Check if this is the last stage in the pipeline
                    acc = "(" + lastQuery.query + ") t" + index;
                } else {
                    acc = lastQuery.query;
                }

                return acc;
            } else {
                throw lastQuery.error;
            }
        }, resource);

        return queries;
    } catch (error) {
        return error;
    }
}

module.exports = {
    $group: $group,
    $project: $project,
    $match: $match,
    $lookup, $lookup,
    convert: convert2,
    Errors: Errors
}
