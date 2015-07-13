var page = require('webpage').create();
var _ = require('lodash');
var system = require('system');
//var argv = require('minimist')(process.argv.slice(2));

function waitFor(testFx, onReady, timeOutMillis) {
    var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3001, //< Default Max Timout is 3s
        start = new Date().getTime(),
        condition = false,
        interval = setInterval(function() {
            if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
                // If not time-out yet and condition not yet fulfilled
                condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
            } else {
                if(!condition) {
                    // If condition still not fulfilled (timeout but condition is 'false')
                    //console.log("'waitFor()' timeout");
                    phantom.exit(1);
                } else {
                    // Condition fulfilled (timeout and/or condition is 'true')
                    //console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
                    typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
                    clearInterval(interval); //< Stop this interval
                }
            }
        }, 100); //< repeat check every 250ms
};

function parseResults(text) {

}

//var url = 'file:///Users/sam/gocode/src/github.com/samuelrayment/monitron/www/static/test.html';
var url = 'file://' + system.args[1];

page.open(url, function(status){
    if (status !== "success") {
        console.log("Can't load file");
        phantom.exit(1);
    } else {
	waitFor(function() {
	    return page.evaluate(function() {
		var els = document.getElementsByTagName('div');

		if (els.length > 0) {
		    return true;
		}
		return false;
            });
	}, function() {
	    var output = page.evaluate(function() {
                var stateClassList = document.querySelector('div.testresults').classList;
 
                var status = document.getElementsByTagName('h1')[0].innerText;
                return {
                    status: status,
                    stateClassList: stateClassList
                }
	    });

            console.log(output.status);
            
            var index = _.indexOf(output.stateClassList, 'passed');
            if (index >= 0) {
	        setTimeout(function(){phantom.exit(0);}, 0);
            } else {
	        setTimeout(function(){phantom.exit(1);}, 0);
            }

	}, 1000);
    }
});
