'use strict';
var path = require('path');
var assert = require('assert');
var gutil = require('gulp-util');
var template = require('./index');

it('should template files', function (cb) {
	var stream = template('./fixture/templates.js');

	stream.on('data', function (file) {
		assert.equal(file.relative, 'fixture/templates.js');
		assert(file.contents.length > 0);
	});
    stream.on('end', cb);

	stream.write(new gutil.File({
		cwd: __dirname,
		base: __dirname + '/fixture',
		path: __dirname + '/fixture/hello.html',
		contents: new Buffer('Hi'),
		stat: {
			mtime: new Date()
		}
	}));

	stream.write(new gutil.File({
		cwd: __dirname,
		base: __dirname + '/fixture',
		path: __dirname + '/fixture/goodbye/bye.html',
		contents: new Buffer('Bye'),
		stat: {
			mtime: new Date()
		}
	}));

	stream.end();
});


it('should parse and add empty files', function (cb) {
	var stream = template('./fixture/templates.js');

	stream.on('data', function (file) {
        assert(file.contents.length == 2);
    });
    stream.on('end', cb);

	stream.write(new gutil.File({
		path: __dirname + 'unexistfile.html'
	}));

	stream.end();
});
