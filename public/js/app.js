/*global require*/
'use strict';

require.config({
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: [
                'underscore',
                'jquery'
            ],
            exports: 'Backbone'
        },
        bootstrap: {
            deps: ['jquery'],
            exports: 'jquery'
        },
        bootstrapSweetAlert: {
            deps: ['bootstrap'],
            exports: 'BootstrapSweetAlert'
        },
        parse: {
            deps: ['jquery', 'underscore'],
            exports: 'Parse'
        },
        JSXTransformer: {
            exports: "JSXTransformer"
        }
    },
    paths: {
        jquery : [
            '/bower_components/jquery/dist/jquery.min'
        ],

        underscore : [
            '/bower_components/underscore/underscore-min'
        ],

        backbone : [
            '/bower_components/backbone/backbone'
        ],

        react : [
            '/bower_components/react/react.min'
        ],

        jsx: [
            '/bower_components/require-jsx/jsx'
        ],

        JSXTransformer: [
            '/bower_components/react/JSXTransformer'
        ],

        parse:[
            'http://www.parsecdn.com/js/parse-1.3.1.min'
        ],

        bootstrap:[
            '/bower_components/bootstrap/dist/js/bootstrap.min'
        ],

        bootstrapSweetAlert:[
            '/bower_components/bootstrap-sweetalert/lib/sweet-alert.min'
        ],

        moment:[
            '/bower_components/moment/min/moment.min'
        ],

    }
});

require(['parse'], function(Parse) {
    Parse.initialize('hdxwc8xvBGxbQiJm5e2VYvPtOhOj9xxHJNJUTghr', 'GfLPwUPbBuABMIn6bSvQJtKi0QMDgEG4SVhQ01aW');
});

require(['bootstrap']);
require(['bootstrapSweetAlert']);
require(["jsx!auth"]);
