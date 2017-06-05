var angularApp = angular.module('angularApp', ['ngRoute', 'ngSanitize', 'ui.bootstrap', 'ngMaterial', 'ngAnimate', 'ngMessages', 'toastr']);


// https://www.w3schools.com/angular/angular_validation.asp

// Remember, when naming a directive, you must use a camel case name, myDirective, but when invoking it, 
// you must use - separated name, my - directive.
angularApp.directive('myDirectiveRazlomak', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attr, mCtrl) {
            function myValidation(value) {
                //if (value.indexOf("e") > -1) {
                //    mCtrl.$setValidity('charE', true);
                //} else {
                //    mCtrl.$setValidity('charE', false);
                //}
                //alert(value)
                var valid = false;
                if (value != null && value != undefined) {
                    if (value.toString().length == 3) {
                        if (value.indexOf('/') != -1) {
                            var val1 = value.toString().split('/')[0];
                            var val2 = value.toString().split('/')[1];
                            if (!isNaN(parseInt(val1)) && isFinite(val1) && !isNaN(parseInt(val2)) && isFinite(val2))
                                valid = true;
                        }
                    }
                }
                mCtrl.$setValidity('charE', valid);
                return value;
            }
            mCtrl.$parsers.push(myValidation);
        }
    };
});

angularApp.directive('myDirectiveDecimal', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attr, mCtrl) {
            function myValidation(value) {
                var valid = false;
                if (value != null && value != undefined) {
                    var v = value.toString();
                    if (v.indexOf('.') == -1 && (v.split(",").length - 1 == 1 || v.split(",").length - 1 <= 0)) {
                        if (v.indexOf(',') != -1) {
                            var v1 = v.split(',')[0];
                            var v2 = v.split(',')[1];
                            if (!isNaN(parseInt(v1)) && isFinite(v1) && !isNaN(parseInt(v2)) && isFinite(v2)) {
                                valid = true;
                                value = v.toLocaleString('hr-HR', { minimumFractionDigits: 2 });
                            }
                        }
                        else if (!isNaN(parseInt(v)) && isFinite(v)) {
                            valid = true;
                            value = v.toLocaleString('hr-HR', { minimumFractionDigits: 2 });
                        }
                    }
                }
                //alert(valid);
                mCtrl.$setValidity('decimalhr', valid);
                return value;
            }
            mCtrl.$parsers.push(myValidation);
        }
    };
});


angularApp.config(['$routeProvider', '$locationProvider', '$httpProvider', '$mdDateLocaleProvider', function ($routeProvider, $locationProvider, $httpProvider, $mdDateLocaleProvider) {
    //disable cacheing
    if (!$httpProvider.defaults.headers.get) {
        $httpProvider.defaults.headers.get = {};
    }
    //disable IE ajax request caching
    $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
    // extra
    $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
    $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';

    $mdDateLocaleProvider.formatDate = function (date) {
        return moment(date).format('DD.MM.YYYY');
    };

    $routeProvider
        .when('/index', {
            templateUrl: '../app/zgrade/zgrade.html?p=' + new Date().getTime() / 1000,
            controller: 'zgradeCtrl'
        })
        .when('/zgrade', {
            templateUrl: '../app/zgrade/zgrade.html?p=' + new Date().getTime() / 1000,
            controller: 'zgradeCtrl'
        })
        .when('/zgrada/:id', {
            templateUrl: '../app/zgrade/zgrada.html?p=' + new Date().getTime() / 1000,
            controller: 'zgradaCtrl'
        })
        .when('/posebniDijeloviMasterList', {
            templateUrl: '../app/zgrade/PDChild/posebniDijeloviMasterList.html?p=' + new Date().getTime() / 1000,
            controller: 'posebniDijeloviMasterListCtrl'
        })
        .when('/posebniDioChildren/:id', { // posebniDioMasterId
            templateUrl: '../app/zgrade/PDChild/posebniDioChildren.html?p=' + new Date().getTime() / 1000,
            controller: 'posebniDioChildrenCtrl'
        })
        .when('/prihodiRashodi', { // posebniDioMasterId
            templateUrl: '../app/prihodiRashodi/index.html?p=' + new Date().getTime() / 1000,
            controller: 'prihodiRashodiIndexCtrl'
        })
        .when('/pricuvaRezije', { // posebniDioMasterId
            templateUrl: '../app/pricuvaRezije/godina.html?p=' + new Date().getTime() / 1000,
            controller: 'godinaCtrl'
        })
        .when('/popisDijelova', { // posebniDioMasterId
            templateUrl: '../app/zgrade/popisi/dijeloviList.html?p=' + new Date().getTime() / 1000,
            controller: 'dijeloviListCtrl'
        })
        .when('/popisUredjaja', { // posebniDioMasterId
            templateUrl: '../app/zgrade/popisi/uredjajiList.html?p=' + new Date().getTime() / 1000,
            controller: 'uredjajiListCtrl'
        })
        .when('/dnevnik/:id', { // 0 - povlaci sa servera, 2017 - cupaj is DS0-a i prokazi godinu
            templateUrl: '../app/zgrade/dnevnik/dnevnikIndex.html?p=' + new Date().getTime() / 1000,
            controller: 'dnevnikIndexCtrl'
        })
        .when('/dnevnikDetails/:id', { // dnevnikId
            templateUrl: '../app/zgrade/dnevnik/dnevnikDetails.html?p=' + new Date().getTime() / 1000,
            controller: 'dnevnikDetailsCtrl'
        })
        .when('/useri', {
            templateUrl: '../app/useri/indexUseri.html?p=' + new Date().getTime() / 1000,
            controller: 'indexUseriCtrl'
        })
        .when('/tvrtka', {
            templateUrl: '../app/tvrtka.html?p=' + new Date().getTime() / 1000,
            controller: 'tvrtkaCtrl'
        })
        .when('/oglasna', {
            templateUrl: '../app/oglasna/indexPloca.html?p=' + new Date().getTime() / 1000,
            controller: 'indexPlocaCtrl'
        })
        .when('/popisStanara/:id', {
            templateUrl: '../app/zgrade/popisStanara.html?p=' + new Date().getTime() / 1000,
            controller: 'popisStanaraCtrl'
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


