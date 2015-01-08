require.config({
    paths: {
        "jasmine": 'lib/jasmine-1.3.1/jasmine',
        "jasmine-html": 'lib/jasmine-1.3.1/jasmine-html',
        "spec": 'spec'
    },
    shim: {
        'jasmine': {
            exports: 'jasmine'
        },
        'jasmine-html': {
            deps: ['jasmine'],
            exports: 'jasmine'
        }
    }
});

require(['jasmine-html'], function (jasmine) {
    var jasmineEnv = jasmine.getEnv();
    jasmineEnv.updateInterval = 1000;
    var htmlReporter = new jasmine.HtmlReporter();    
    jasmineEnv.addReporter(htmlReporter);
    jasmineEnv.specFilter = function(spec) {
        return htmlReporter.specFilter(spec);
    };
    var currentWindowOnload = window.onload;    
    if (currentWindowOnload) {
        currentWindowOnload();
    }
    var specs = [
	"spec/DebugSpec",
    ];
    require(specs, function () {
        execJasmine();
    });    
    function execJasmine() {
        jasmineEnv.execute();
    }
});
