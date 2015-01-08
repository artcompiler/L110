/*global require, console */
(function () {
    'use strict';

    var tests = window.jasmineConfig && window.jasmineConfig.specs || [];

    if (tests.length === 0) {
        for (var file in window.__karma__.files) {
            if (window.__karma__.files.hasOwnProperty(file)) {
                if (file.match(/\/specs\/(.*)?\.js$/)) {
                    tests.push(file);
                }
            }
        }
    }

    require.config({

        baseUrl: window.jasmineConfig && window.jasmineConfig.baseUrl || '/base/www/latest/app',

        paths: {
            // JavaScript folders.
            libs: '../assets/js/libs',
            plugins: '../assets/js/plugins',
            // app: '../test/app',
            // Libraries.
            dom: '../assets/js/libs/jquery',
            lodash: '../assets/js/libs/lodash',
            backbone: '../assets/js/libs/backbone',
            handlebars: '../assets/js/libs/handlebars',
            timer: '../assets/js/libs/timer'
        },
        shim: {
            // BOTH of these are here due to different require version used in karma
            dom: {
                exports: function () {
                    return this.jQuery;
                },
                init: function () {
                    return this.jQuery.noConflict(true);
                }
            },
            backbone: {
                deps: ['lodash', 'dom'],
                exports: 'Backbone'
            },
            'plugins/backbone.layoutmanager': ['backbone'],
            'plugins/slides.jquery': ['dom'],
            'plugins/jquery.scrollIntoView': ['dom'],
            'plugins/jqueryactual': ['dom'],
            'libs/bootstrap': ['dom']
        }
    });

    require(['app'], function (app) {
        var callback = window.jasmineConfig && window.jasmineConfig.start || window.__karma__.start;
        require(tests, callback);
    });

})();
