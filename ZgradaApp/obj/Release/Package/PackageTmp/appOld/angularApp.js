var angularApp = angular.module('angularApp', ['ngRoute', 'ui.bootstrap', 'ngMaterial', 'ngAnimate', 'ngMessages', 'toastr']);


angularApp.config(['$routeProvider', '$locationProvider', '$httpProvider', function ($routeProvider, $locationProvider, $httpProvider) {
    $routeProvider
    .when('/index', {
        templateUrl: '../app/index.html',
        controller: 'indexCtrl'
    })
    .when('/zgrade', {
        templateUrl: '../app/zgrade/zgrade.html',
        controller: 'zgradeCtrl'
    })
    .when('/zgrada/:id', {
        templateUrl: '../app/zgrade/zgrada.html',
        controller: 'zgradaCtrl'
        })



    .when('/pripadci', {
        templateUrl: '../app/Sifarnici/pripadci.html',
        controller: 'pripadciCtrl'
    })
    .when('/pripadak/:id', {
        templateUrl: '../app/Sifarnici/pripadak.html',
        controller: 'pripadakCtrl'
    })
    .when('/prosebniDIjelovi', {
        templateUrl: '../app/Sifarnici/prosebniDIjelovi.html',
        controller: 'prosebniDIjeloviCtrl'
    })
    .when('/posebniDio/:id', {
        templateUrl: '../app/Sifarnici/posebniDio.html',
        controller: 'posebniDioCtrl'
    })
    .when('/stanovi/:id', { // zgradaId
        templateUrl: '../app/Sifarnici/stanovi.html',
        controller: 'stanoviCtrl'
    })
    .when('/stan/:id', { // stanId
        templateUrl: '../app/Sifarnici/stan.html',
        controller: 'stanCtrl'
    })
    .when('/pregled/:id', { // stanId
        templateUrl: '../app/Sifarnici/zgradaPregledPripadakaPoStanovima.html',
        controller: 'zgradaPregledPripadakaPoStanovimaCtrl'
    })
    .when('/zaduzivanje/:id', { 
        templateUrl: '../app/zaduzivanja/zaduzivanjePoMj.html',
        controller: 'zaduzivanjePoMjCtrl'
    })
    .when('/prihodirashodi', { 
        templateUrl: '../app/PihRas/index.html',
        controller: 'indexPrihRasCtrl'
    })
    .when('/prihrasedit', {
        templateUrl: '../app/PihRas/edit.html',
        controller: 'editPrihRasCtrl'
        })
    .when('/pricuva', {
        templateUrl: '../app/pricuva/index.html',
        controller: 'indexPricuvaCtrl'
    })
    .when('/pricuvaedit/:id', {
        templateUrl: '../app/pricuva/edit.html',
        controller: 'pricuvaEditCtrl'
        })
    .when('/ks/:id', {
        templateUrl: '../app/ks/display.html',
        controller: 'ksDisplayCtrl'
    })
    .otherwise({
        redirectTo: '/index'
    });
}])


