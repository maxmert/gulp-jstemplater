gulp-jstemplater
================

Compiles all templates into one json. Tested with *mustache* (should work with every mustache-like templates).

## Example

Compile all templates at `path/**/*.html` into file `templates.js` and put it to `destpath`.

```javascript
gulp.task 'templates', ->

  gulp.src( [ "path/**/*.html" ] )
		.pipe( templater( "templates.js", {variable: "TMPL"} ) )
		.pipe( gulp.dest "path-to-compiled-file" )
```

If you have files

```javascript
/path/layout.html
/path/widgets/new.html
/path/widgets/old.html
/path/widgets/sidebar/left.html
/path/footer/bottom.html
```

then it will compile to `templates.js`:

```js
TMPL = {
    layout: "...",
    widgets: {
        new: "...",
        old: "...",
        sidebar: {
            left: "..."
        }
    },
    footer: {
        bottom: "..."
    }
};
```

### Options

#### variable

Name of the variable. If it not provided, then jstemplater will compile to

```javascript
{
    layout: "...",
    widgets: {
        new: "...",
        old: "...",
        sidebar: {
            left: "..."
        }
    },
    footer: {
        bottom: "..."
    }
}
```
