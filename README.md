# postcss-global-vars

PostCSS plugin to declare global variables, accepts some internal references.

It’s based on `postcss-external-vars` plugin, some kind of fork, but totally rewritten in TypeScript.

The main idea is to allow internal references (use some variables in the value of other variables).

## Usage

```js
const postcss = require( 'postcss' );
const globalVars = require( 'postcss-global-vars' ).default;

const data = {
	colors: {
		main: 'red',
		lighter: 'color($global.colors.main l(+30%))',
	},
};

const css = '.test {color: $global.colors.main; background: $global.colors.lighter;}';

const result = postcss( [globalVars( {data} )] ).process( css ).css;

console.log( result ); // => '.test {color: red; background: color(red l(+30%));}'
```
