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
            exports: 'bootstrap'
        },
        bootstrapSweetAlert: {
            deps: ['bootstrap'],
            exports: 'BootstrapSweetAlert'
        },
        bootstrapStarRating: {
            deps: ['jquery', 'bootstrap'],
            exports: 'bootstrapStarRating'
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

        bootstrapStarRating:[
            '/bower_components/bootstrap-star-rating/js/star-rating.min'
        ],

        moment:[
            '/bower_components/moment/min/moment.min'
        ],

        pace:[
            '/bower_components/pace/pace.min'
        ],

    }
});

require(['pace'], function(Pace){
    Pace.start();
});

require(['parse'], function(Parse) {
    Parse.initialize('hdxwc8xvBGxbQiJm5e2VYvPtOhOj9xxHJNJUTghr', 'GfLPwUPbBuABMIn6bSvQJtKi0QMDgEG4SVhQ01aW');
});

require(['bootstrap']);
require(['bootstrapSweetAlert']);
require(['bootstrapStarRating']);
require(["jsx!auth"]);
