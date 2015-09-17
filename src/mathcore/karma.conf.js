// Karma configuration
// Generated on Mon Feb 16 2015 09:38:01 GMT+1100 (EST)

module.exports = function(config) {

  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine', 'requirejs'],


    // list of files / patterns to load in the browser
    files: [],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
        // source files, that you wanna generate coverage for
        // do not include tests or libraries
        // (these files will be instrumented by Istanbul)
        'lib/mathcore.js': ['coverage'],
        'lib/chemcore.js': ['coverage']
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['dots'],

    // optionally, configure the reporter
    coverageReporter: {
        reporters: [
            {type : 'text-summary'},
            {type : 'lcov', dir : 'reports/js/coverage/lcov', subdir: '.'},
            {type : 'html', dir : 'reports/js/coverage/html', subdir: '.'},
            {type : 'cobertura', dir : 'reports/js/coverage/cobertura', subdir: '.'}
        ]
    },

    junitReporter: {
        outputFile: 'reports/js/junit/TEST-results.xml',
        suite: 'assess'
    },

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['phantomjs'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};
