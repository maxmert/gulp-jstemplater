'use strict';
var through = require('through2');
var glob = require("glob");
var fs = require("fs");
var gutil = require('gulp-util');

// ==========================================================================
// FUNCTIONS
// ==========================================================================

function deepmerge(foo, bar) {
	var merged = {};
	for (var each in bar) {
		if (each in foo) {
			if (typeof(foo[each]) == "object" && typeof(bar[each]) == "object") {
				merged[each] = deepmerge(foo[each], bar[each]);
			} else {
				merged[each] = [foo[each], bar[each]];
			}
		} else {
			merged[each] = bar[each];
		}
	}
	for (var each in foo) {
		if (!(each in bar)) {
			merged[each] = foo[each];
		}
	}
	return merged;
}


function buildJsonPath(path, filepath) {
	var pathLength = path.length;
	var node = path.splice(0,1);

	var res = '{';

	if( pathLength > 1 ) {
		res += '"' + node + '":' + buildJsonPath(path, filepath) + '}'
	}
	else if( path.length == 0 ) {
		res += '"' + node[0].match(/(.*)\.[^.]+$/)[1] + '":"' + fs.readFileSync(filepath,{encoding:'utf8'}).replace(/\t/g,"").replace(/\n/g," ").replace(/"/g,'\\"') + '"}'
	}
	return res;
}



module.exports = function( filename, options ) {

    if (!filename) {
		throw new gutil.PluginError('gulp-jstemplater', chalk.blue('filename') + ' required');
	}

	var result = {};


	return through.obj(function (file, enc, cb) {
		if (file.isNull()) {
			return cb();
		}

		if (file.isStream()) {
			this.emit('error', new gutil.PluginError('gulp-jstemplater', 'Streaming not supported'));
			return cb();
		}

		var filepath = file.path.replace(file.base,'')
		var paths = filepath.split('/')
		var jsonpart = buildJsonPath(paths, file.path);

		jsonpart = jsonpart.replace(/(\r\n|\n|\r|\t)/gm,"");
		jsonpart = jsonpart.replace(/>[\s]+</gm,"><");
		jsonpart = jsonpart.replace(/[\s]{2,}/gm,"");
		result = deepmerge(result, JSON.parse(jsonpart));

		// Because Windows...
		// var pathname = file.relative.replace(/\\/g, '/');

		cb();
	}, function (cb) {

		result = JSON.stringify(result);

		if( options !== null && options !== undefined && options.variable !== undefined && options.variable !== null && options.variable !== '' )
			result = "var " + options.variable + " = " + result + ";"

		this.push(new gutil.File({
			path: filename,
			contents: new Buffer(result)
		}));

		cb();
	});
};
