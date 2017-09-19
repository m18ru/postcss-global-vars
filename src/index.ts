import {Declaration, plugin, Plugin, Root, Transformer} from 'postcss';

/**
 * Name of this plugin.
 */
const PLUGIN_NAME = 'postcss-global-vars';
/**
 * Allowed types for variables.
 */
const ALLOWED_VARIABLE_TYPES = ['string', 'number'];

/**
 * Plugin options.
 */
export interface PostCssGlobalVarsOptions
{
	/** Global variable prefix */
	prefix?: string;
	/**
	 * Data to be used as global variables.
	 */
	data: VariablesData;
}

/**
 * Data to be used as global variables.
 */
export interface VariablesData
{
	[key: string]: string | number | VariablesData;
}

/**
 * PostCSS plugin for global variables.
 * 
 * @param options Plugin options.
 */
function main( options: PostCssGlobalVarsOptions = {data: {}} ): Transformer
{
	const variablePattern = makeVariableRegExp( options.prefix || '$global.' );
	const variablesData = injectInternalVariables( options.data, variablePattern );
	
	const onDeclaration = ( declaration: Declaration ): void =>
	{
		try
		{
			declaration.value = inject(
				declaration.value,
				variablesData,
				variablePattern,
			);
		}
		catch ( error )
		{
			throw declaration.error( error.message, {plugin: PLUGIN_NAME} );
		}
	};
	
	return ( root: Root ): void =>
	{
		root.walkDecls( onDeclaration );
	};
}

/**
 * Escape string to use in Regular expression.
 * 
 * @param value String to be escaped.
 */
function regExpEscape( value: string ): string
{
	return value.replace( /[|\\{}()[\]^$+*?.]/g, '\\$&' );
}

/**
 * Make regular expression pattern for global variable.
 * 
 * @param prefix Global variable prefix.
 */
function makeVariableRegExp( prefix: string ): RegExp
{
	return new RegExp(
		regExpEscape( prefix ) + '([\\w.-]+)',
		'g',
	);
}

/**
 * Check if data is object and has required property.
 * 
 * @param data Data to check.
 * @param property Required property.
 */
function isPropertyExists( data: any, property: string ): boolean
{
	return (
		( typeof data === 'object' )
		&& data.hasOwnProperty( property )
	);
}

/**
 * Get value of the nested property.
 * 
 * @param data Variables data.
 * @param path Path to the value.
 */
function nestedProperty( data: VariablesData, path: string ): string
{
	const result = path.split( '.' ).reduce(
		( value, property, index, properties ): VariablesData | string | number =>
		{
			if ( !isPropertyExists( value, property ) )
			{
				const currentPath = properties.slice( 0, index + 1 ).join( '.' );
				
				throw new TypeError( `Property "${currentPath}" is not defined.` );
			}
			
			return value[property];
		},
		data,
	);
	
	if ( ALLOWED_VARIABLE_TYPES.indexOf( typeof result ) === -1 )
	{
		throw new TypeError( `The "${path}" property has an inappropriate type.` );
	}
	
	return String( result );
}

/**
 * Inject global variables.
 * 
 * @param value Current value.
 * @param data Variables data.
 * @param variablePattern Variable pattern.
 */
function inject(
	value: string, data: VariablesData, variablePattern: RegExp,
): string
{
	return value.replace(
		variablePattern,
		( _substring, path ) => nestedProperty( data, path ),
	);
}

/**
 * Inject internal references in variables data.
 * 
 * @param data Variables data.
 * @param variablePattern Variable pattern.
 */
function injectInternalVariables(
	data: VariablesData, variablePattern: RegExp,
): VariablesData
{
	const newData: VariablesData = JSON.parse( JSON.stringify( data ) );
	
	const processObject = ( dataPart: VariablesData ) =>
	{
		for ( const key of Object.keys( dataPart ) )
		{
			const value = dataPart[key];
			
			if ( typeof value === 'string' )
			{
				dataPart[key] = inject( value, newData, variablePattern );
			}
			else if ( typeof value === 'object' )
			{
				processObject( value );
			}
		}
	};
	
	processObject( newData );
	
	return newData;
}

/**
 * PostCSS plugin.
 */
const postCssGlobalVarsPlugin: Plugin<PostCssGlobalVarsOptions> = plugin(
	PLUGIN_NAME,
	main,
);

/**
 * Module.
 */
export {
	postCssGlobalVarsPlugin as default,
};
