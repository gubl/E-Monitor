const { spawn } = require( 'child_process' );

console.log('###!### Starting XServer');

const ls = spawn( 'startx', [ '--', '-nocursor' ] );

ls.stdout.on( 'data', ( data ) => {
    console.log( `stdout: ${ data }` );
} );

ls.stderr.on( 'data', ( data ) => {
    console.log( `stderr: ${ data }` );
} );

ls.on( 'close', ( code ) => {
    console.log( `child process exited with code ${ code }` );
} );

