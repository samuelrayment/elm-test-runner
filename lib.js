var path = require('path')
var childProcess = require('child_process')
var phantomjs = require('phantomjs')
var binPath = phantomjs.path
var temp = require('temp')
var argv = require('minimist')(process.argv.slice(2));

var elmMakePath;
try {
    // use elm node module
    var elm = require('elm');
    elmMakePath = elm['elm-make'];
} catch (e) {
    // fallback to env var
    elmMakePath = process.env['ELM-MAKE-PATH'];
}


function compileElmTests(elmMakePath, filename, tempName) {
    var command = elmMakePath + ' ' + filename + ' --output ' + tempName;
    
    childProcess.exec(command, function(err, stdout, stderr) {
        if (err) {
            console.log(err);
        }
    });
}

function runPhantomTests(binPath, tempName) {
    var childArgs = [
	path.join(__dirname, 'phantom_runner.js'),
	tempName
    ]

    childProcess.execFile(binPath, childArgs, function(err, stdout, stderr) {
	console.log(stdout);
	
	// handle results
	if (err) {
	    process.exit(1);
	} else {
	    process.exit(0);
	}
	
    });
}


exports.run = function() {
    var tempName = temp.path({suffix: '.html'});
    
    compileElmTests(elmMakePath, argv['_'][0], tempName);
    runPhantomTests(binPath, tempName);
}
