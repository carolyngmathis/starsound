var host = require( 'autohost' );
var KeyReader = require( './keyReader.js' );
var importer = require( './importer.js' );
var _ = require( 'lodash' );
var Transform = require( './transformer.js' );
var player = require( './player.js' );
// var postal = require( 'postal' );
// var notifier = postal.channel( 'updates' );

host.init( {
	socketIO: true,
	websocket: false
} );

host.on( "socket.client.closed", function( data ) {
	console.log( "got socket.client.closed for id", data.id );
} );

host.on( "socket.client.identified", function( data ) {
	console.log( "client identified", data.id );
	host.socket.notify( "hey.there", { data: 'BOOM' } );
	player.startNofication( host.socket );
} );

// notifier.subscribe( "stream.changed", function( data ) {
// 	console.log( 'stream.changed', data );
// } );


var G117 = importer.import( "G117-rel-flux-t1" );
var comp1 = importer.import( "G117-rel-flux-c2" );
var comp2 = importer.import( "G117-rel-flux-c3" );
var comp2b = importer.import( "G117-rel-flux-c3-b" );
var gd66 = importer.import( "GD66-rel-flux-T" );
var comp3 = importer.import( "GD66-rel-flux-C2" );

var playState = false;

player.addDataStream( 'G117', G117 );
player.addDataStream( 'GD66', gd66 );
player.addDataStream( 'comp1', comp1 );
player.addDataStream( 'comp2', comp2 );
player.addDataStream( 'comp2b', comp2b );
player.addDataStream( 'comp3', comp3 );
player.addDataStream( 'boring', [ 0.1, 0.2, 0.3, 0.4, 0.5, 0.4, 0.3, 0.2 ] );
player.addDataStream( 'boringer', [ 0.1, 0.1, 0.15, 0.09, 0.1, 0.11, 0.09, 0.1 ] );

player.addTransformer( 'a', function( stream ) {
	return Transform( stream )
		.truncateAt( 0.925 )
		.stretch( 4 )
		.normalize( 0 )
		.multiply( 10 )
		.result();
} );

player.addTransformer( 'b', function( stream ) {
	return Transform( stream )
		.truncateAt( 0.925 )
		.stretch( 6 )
		.normalize( 0 )
		.multiply( 10 )
		.result();
} );


// playSource( 1 );

function playSource( source ) {
	// host.socket.send( "hey.there", {
	// 	data: {}
	// } );

	var sourceMap = {
		1: 'comp1',
		2: 'comp2',
		3: 'comp3',
		4: 'G117',
		5: 'GD66',
		6: "boring",
		7: "boringer"
	};
	console.log( 'change to source #%s (%s)', source, sourceMap[ source ] );

	player.play( sourceMap[ source ] );
	playState = true;
}

function transform( id ) {
	player.useTransformer( id );
}

function clearTransform() {
	player.clearTransformer();
}

function changePlayState( newState ) {
	if ( newState === undefined ) {
		newState = !playState;
	}
	playState = newState;
	console.log( playState ? "playing" : "paused" );
	if ( playState ) {
		player.play();
	} else {
		player.stop();
	}
}

function togglePlayState() {
	changePlayState();
}
function pause() {
	changePlayState( false );
}

function play() {
	changePlayState( true );
}

function expand() {
	customTransformValues.stretch += 1;
	console.log( 'expand', customTransformValues.stretch );
	player.useTransformer( 'custom' );
}

function contract() {
	customTransformValues.stretch -= 1;
	player.useTransformer( 'custom' );
}


function magnify() {
	customTransformValues.multiply += 0.25;
	player.useTransformer( 'custom' );
}

function demagnify() {
	customTransformValues.multiply -= 0.25;
	player.useTransformer( 'custom' );
}
function truncate() {
	var i = customTransformValues.truncateValueSelected;
	i++;
	if ( i >= customTransformValues.truncateValues.length ) {
		i = 0;
	}
	if ( !i ) {
		i = 0;
	}

	customTransformValues.truncateValueSelected = i;
	player.useTransformer( 'custom' );
}
function dump() {
	console.log( 'Playing [ %s ]', player.getStreamName() );
	var transformerName = player.getTransformerName();
	if ( transformerName ) {
		console.log( ' Transformer: [ %s ]', transformerName );
		if ( transformerName === 'custom' ) {
			_.each( customTransformValues, function( val, key ) {
				console.log( ' - %s: %s', key, val );
			} );
		}
	}
}

var customTransformValues = {
	stretch: 1,
	multiply: 1,
	truncateValues: [ -1, 0.98, 0.95, 0.925, 0.9, 0.85, 0.8 ],
	truncateValueSelected: 0,
	normalize: 0
};

player.addTransformer( 'custom', function( stream ) {
	return Transform( stream )
		.truncateAt( customTransformValues.truncateValues[ customTransformValues.truncateValueSelected ] )
		.normalize( customTransformValues.normalize )
		.multiply( customTransformValues.multiply )
		.stretch( customTransformValues.stretch )
		.result();
} );

var keyActionMap = {
	1: playSource,
	2: playSource,
	3: playSource,
	4: playSource,
	5: playSource,
	6: playSource,
	7: playSource,
	8: playSource,
	9: playSource,
	a: transform,
	b: transform,
	c: transform,
	d: transform,
	p: togglePlayState,
	t: truncate,
	'backspace': clearTransform,
	'up': magnify,
	'down': demagnify,
	'left': contract,
	'right': expand,
	' ': dump
};

KeyReader( keyActionMap );