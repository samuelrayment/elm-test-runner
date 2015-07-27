var page = require('webpage').create();
var _ = require('lodash');
var system = require('system');
// consoleplusplus is the only console colour that I found works on phantom
require('consoleplusplus');

// turn off the other chalk settings, we just want colours
console.disableTimestamp();
console.disableLevelMsg();

function waitFor(testFx, onReady, timeOutMillis) {
    var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3001,
        start = new Date().getTime(),
        condition = false,
        interval = setInterval(function() {
            if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
                condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
            } else {
                if(!condition) {
                    phantom.exit(1);
                } else {
                    typeof(onReady) === "string" ? eval(onReady) : onReady();
                    clearInterval(interval);
                }
            }
        }, 100);
};


function parseResults() {
    var parseResult = function(element) {
        var name = element.firstChild.textContent;

        var reports = element.querySelectorAll('div.report');
        var reportsList = [];
        outputToConsole(topLevelReports.length);
        for (var i=0; i<reports.length; i++) {
            var report = reports[i];
            reportsList.push(parseResult(report));        
        }

        var testsList = [];
        var tests = element.children;
        for (var i=0; i<tests.length; i++) {
            var test = tests[i];
            if (!test.classList.contains('test')) {
                continue;
            }
                
            var message = test.firstChild.textContent;
            testsList.push({
                message: message,
                pass: (test.classList.contains('pass'))
            });
        }
        
        return { name: name,
                 reports: reportsList,
                 tests: testsList
               };
    }
    
    var stateClassList = document.querySelector('div.testresults').classList;   
    var status = document.getElementsByTagName('h1')[0].innerText;

    var reports = [];
    var topLevelReports = document.querySelectorAll('div.results > div.report');
    for (var i=0; i<topLevelReports.length; i++) {
        var topLevelReport = topLevelReports[i];
        reports.push(parseResult(topLevelReport));        
    }
    
    return {
        status: status,
        stateClassList: stateClassList,
        reports: reports
    }
}

function outputToConsole(message, indent) {
    if (indent == undefined) {
	indent = 0;
    }
    console.debug(_.padLeft('', indent) + message);
}

function printResults(output) {
    var spaceOut = function(indent) {
        return _.padLeft('', indent);
    }
    
    var printReport = function(report, indent) {
	outputToConsole('Suite: ' + report.name, indent);

        var reports = report.reports;
        for (var i=0; i<reports.length; i++) {
            printReport(reports[i], indent+2);
        }

        var tests = report.tests;
        for (var i=0; i<tests.length; i++) {
            var test = tests[i];
	    var messageColour;
            if (test.pass) {
		messageColour = 'green';
            } else {
		messageColour = 'red';
            }
	    outputToConsole('Test: #' + messageColour + '{' + test.message + '}', indent + 1);
        }
    }
    
    outputToConsole(output.status);
    for (var i=0; i<output.reports.length; i++) {
        var report = output.reports[i];
        printReport(report, 0);
    }
    
    var index = _.indexOf(output.stateClassList, 'passed');
    if (index >= 0) {
        setTimeout(function(){phantom.exit(0);}, 0);
    } else {
        setTimeout(function(){phantom.exit(1);}, 0);
    }
}

var url = 'file://' + system.args[1];

page.open(url, function(status){
    if (status !== "success") {
        outputToConsole("#red{Can't load file}");
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
	    var output = page.evaluate(parseResults);
            printResults(output);
	}, 1000);
    }
});
