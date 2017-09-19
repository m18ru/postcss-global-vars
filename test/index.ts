import {expect} from 'chai';
import 'mocha';
import * as postcss from 'postcss';
import globalVars, {
	PostCssGlobalVarsOptions, VariablesData,
} from '../src/index';

describe(
	'Plain properties',
	() =>
	{
		it(
			'should not change other variables',
			() => check(
				{
					color: 'red',
				},
				'a {color: $color}',
				'a {color: $color}',
			),
		);
		
		it(
			'should inject global variables',
			() => check(
				{
					color: 'red',
				},
				'a {color: $global.color}',
				'a {color: red}',
			),
		);
		
		it(
			'should throw an error for unknown global variables',
			() => checkError(
				{},
				'a {color: $global.color}',
				'Property "color" is not defined.',
			),
		);
		
		it(
			'should allow custom prefix',
			() => checkOptions(
				{
					prefix: '--const-',
					data: {
						color: 'red',
					},
				},
				'a {color: --const-color}',
				'a {color: red}',
			),
		);
		
	},
);

describe(
	'Nested properties',
	() =>
	{
		it(
			'should inject global variables',
			() => check(
				{
					colors: {
						primary: 'red',
					},
				},
				'a {color: $global.colors.primary}',
				'a {color: red}',
			),
		);
		
		it(
			'should throw an error for unknown nested variables',
			() => checkError(
				{
					colors: {
						primary: 'red',
					},
				},
				'a {color: $global.colors.secondary}',
				'Property "colors.secondary" is not defined.',
			),
		);
		
		it(
			'should allow number value',
			() => check(
				{
					'aspect-ratios': {
						'video-height': 0.5625,
					},
				},
				'div {padding-top: calc($global.aspect-ratios.video-height * 1%)}',
				'div {padding-top: calc(0.5625 * 1%)}',
			),
		);
		
		it(
			'should throw an error for object value',
			() => checkError(
				{
					colors: {
						primary: 'red',
					},
				},
				'a {color: $global.colors}',
				'The "colors" property has an inappropriate type.',
			),
		);
		
		it(
			'should allow custom prefix',
			() => checkOptions(
				{
					prefix: '--const-',
					data: {
						colors: {
							primary: 'red',
						},
					},
				},
				'a {color: --const-colors.primary}',
				'a {color: red}',
			),
		);
		
		it(
			'should allow several properties per declaration',
			() => check(
				{
					padding: {
						vertical: '50px',
						horizontal: '100px',
					},
				},
				'div {padding: $global.padding.vertical $global.padding.horizontal}',
				'div {padding: 50px 100px}',
			),
		);
		
		it(
			'should allow commas in declaration',
			() => check(
				{
					colors: {
						top: 'white',
						bottom: 'black',
					},
				},
				'div {background: linear-gradient(top, $global.colors.top, $global.colors.bottom)}',
				'div {background: linear-gradient(top, white, black)}',
			),
		);
		
		it(
			'should work in at-rules',
			() => check(
				{
					screen: {
						notebook: '1400px',
						tablet: '1100px',
					},
				},
				'@media ($global.screen.tablet >= width < $global.screen.notebook){div {color: red}}',
				'@media (1100px >= width < 1400px){div {color: red}}',
			),
		);
		
		it(
			'should allow internal references',
			() => check(
				{
					colors: {
						main: 'red',
						lighter: 'color($global.colors.main l(+30%))',
					},
				},
				'.test {color: $global.colors.main; background: $global.colors.lighter;}',
				'.test {color: red; background: color(red l(+30%));}',
			),
		);
		
	},
);

/**
 * Check PostCSS result.
 * 
 * @param data Global variables.
 * @param input Input CSS.
 * @param output Expected output CSS.
 */
function check(
	data: VariablesData,
	input: string,
	output: string,
): void
{
	expect(
		postcss( [globalVars( {data} )] ).process( input ).css,
	).to.equal(
		output,
	);
}

/**
 * Check PostCSS error.
 * 
 * @param data Global variables.
 * @param input Input CSS.
 * @param message Expected error message.
 */
function checkError(
	data: VariablesData,
	input: string,
	message: string,
): void
{
	expect(
		() => postcss( [globalVars( {data} )] ).process( input ).css,
	).to.throw(
		message,
	);
}

/**
 * Check PostCSS result with specific options.
 * 
 * @param options Plugin options.
 * @param input Input CSS.
 * @param output Expected output CSS.
 */
function checkOptions(
	options: PostCssGlobalVarsOptions,
	input: string,
	output: string,
): void
{
	expect(
		postcss( [globalVars( options )] ).process( input ).css,
	).to.equal(
		output,
	);
}
