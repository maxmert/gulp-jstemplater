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
		res += '"' + node[0].match(/(.*)\.[^.]+$/)[1] + '":"' + fs.readFileSync(filepath,{encoding:'utf8'}).replace(/"/g,'\\"') + '"}'
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

		// jsonpart = jsonpart.replace(/(\r\n|\n|\r|\t)/gm,"");
		jsonpart = jsonpart.replace(/(\r)/gm,"\\r");
		jsonpart = jsonpart.replace(/(\n)/gm,"\\n");
		jsonpart = jsonpart.replace(/(\t)/gm,"\\t");
		jsonpart = jsonpart.replace(/>[\s]+</gm,"><");
		jsonpart = jsonpart.replace(/[\s]{2,}/gm,"");
		result = deepmerge(result, JSON.parse(jsonpart));

		// Because Windows...
		// var pathname = file.relative.replace(/\\/g, '/');

		cb();
	}, function (cb) {

		result = JSON.stringify(result);

		var isoptions = options !== null && options !== undefined;
		var iscommonjs = ( isoptions && options.commonjs !== undefined && options.commonjs !== null && options.commonjs !== false );
		var isvariable = ( isoptions && options.variable !== undefined && options.variable !== null && options.variable !== '' );

		var intermediateResult = "";

		if( isoptions )
			if( iscommonjs ) {
				intermediateResult = "module.exports";
				if ( isvariable ) intermediateResult += "." + options.variable;

				result = intermediateResult + " = " + result;
			} else {
				if ( isvariable ) result = "var " + options.variable + " = " + result + ";"
			}

		this.push(new gutil.File({
			path: filename,
			contents: new Buffer(result)
		}));

		cb();
	});
};
