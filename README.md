[![NPM][npm]][npm-url]
[![Dependencies][deps]][deps-url]
[![DevDependencies][deps-dev]][deps-dev-url]
[![Tests][build]][build-url]

# postcss-global-vars

[PostCSS] plugin to declare global variables, accepts some internal references.

It’s based on `postcss-external-vars` plugin, some kind of fork, but totally rewritten in TypeScript.

The main idea is to allow internal references (use some variables in the value of other variables).  
Also, it can process variables in media-queries.

## Example

Input:

```css
div.test
{
	width: $global.test.width;
	height: $global.test.height;
	padding: $global.test.padding.vertical $global.test.padding.horizontal;
}

@media (max-width: $global.screen.mobile)
{
	width: calc($global.test.width / 2);
}
```

Data:

```json
{
	"test": {
		"width": "200px",
		"height": "100px",
		"padding": {
			"vertical": "10px",
			"horizontal": "20px"
		}
	},
	"screen": {
		"mobile": "700px"
	}
}
```

Output:

```css
div.test
{
	width: 200px;
	height: 100px;
	padding: 10px 20px;
}

@media (max-width: 700px)
{
	width: calc(200px / 2);
}
```

## Install

```
npm install --save-dev postcss-global-vars
```

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

## Options

### `prefix`

Type: `string`  
Default: `'$global.'`

A prefix for global variable name.

### `data`

Type: `object`  
Default: `{data:{}}`

Data to be used as global variables.

Interface:

```ts
interface VariablesData
{
	[key: string]: string | number | VariablesData;
}
```

## Change Log

[View changelog](CHANGELOG.md).

## License

[MIT](LICENSE).

[npm]: https://img.shields.io/npm/v/postcss-global-vars.svg
[npm-url]: https://npmjs.com/package/postcss-global-vars

[deps]: https://img.shields.io/david/m18ru/postcss-global-vars.svg
[deps-url]: https://david-dm.org/m18ru/postcss-global-vars

[deps-dev]: https://img.shields.io/david/dev/m18ru/postcss-global-vars.svg
[deps-dev-url]: https://david-dm.org/m18ru/postcss-global-vars?type=dev

[build]: https://img.shields.io/travis/m18ru/postcss-global-vars.svg
[build-url]: https://travis-ci.org/m18ru/postcss-global-vars

[PostCSS]: https://github.com/postcss/postcss
