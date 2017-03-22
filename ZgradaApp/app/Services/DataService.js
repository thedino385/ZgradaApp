angularApp.factory('DataService', ['$http', '$rootScope', '$q', function ($http, $rootScope, $q) {

    var listZgrade = [];
    var listPripadci = [];
    var listStanovi = [];
    var selectedZgrada = null;
    var selectedStan = null;
    var selectedPosebniDio = null;

    // zgrade
    var getZgrade = function() {
        return $http.get('../api/data/getzgrade');
    }

    var getZgrada = function (zgradaId) {
        return $http.get('../api/data/getzgrada?Id=' + zgradaId);
    }

    //var getZgrade = function () {
    //    var defer = $q.defer();
    //    //if (listZgrade.length == 0) {
    //        $rootScope.loaderActive = true;
    //        $http.get('../api/data/getzgrade').then(
    //            function (result) {
    //                // on success
    //                listZgrade = result.data;
    //                console.log('dataService zgrade, pullilng from the server');
    //                $rootScope.loaderActive = false;
    //                defer.resolve(result.data);
    //            },
    //            function (result) {
    //                // on error
    //                defer.reject(result.data);
    //                $rootScope.errMsg = result.Message;
    //            }
    //        )
    //    //}
    //    //else {
    //    //    console.log("dataService listZgrade.length: " + listZgrade.length);
    //    //    defer.resolve(listZgrade);
    //    //}
            
    //    return defer.promise;
    //}

    var zgradaCreateUpdate = function (zgrada) {
        console.log(zgrada);
        return $http.post('../api/data/zgradaCreateUpdate', zgrada);
    }

    var getPripadci = function () {
        return $http.get('../api/data/getpripadci');
    }

    var getPripadak = function (id) {
        return $http.get('../api/data/getpripadak?Id=' + id);
    }

    var getPosebiDijelovi = function () {
        return $http.get('../api/data/getPosebiDijelovi');
    }

    //var getPripadci = function () {
    //    var defer = $q.defer();
    //    if (listPripadci.length == 0) {
    //        $rootScope.loaderActive = true;
    //        $http.get('../api/data/getpripadci').then(
    //            function (result) {
    //                // on success
    //                listPripadci = result.data;
    //                console.log('dataService pripadci, pullilng from the server');
    //                $rootScope.loaderActive = false;
    //                defer.resolve(result.data);
    //            },
    //            function (result) {
    //                // on error
    //                defer.reject(result.data);
    //                $rootScope.errMsg = result.Message;
    //            }
    //        )
    //    }
    //    else
    //        defer.resolve(listPripadci);
    //    return defer.promise;
    //}

    var pripadakCreateUpdate = function (pripadak) {
        return $http.post('../api/data/pripadakCreateUpdate', pripadak);
    }

    var posebniDioCreateUpdate = function (dio) {
        return $http.post('../api/data/posebniDioCreateUpdate', dio);
    }

    //var getStanovi = function () {
    //    return $http.get('../api/data/getstanovi');
    //};
    //var getStanovi = function () {
    //    var defer = $q.defer();
    //    //if (listStanovi.length == 0) {
    //        $rootScope.loaderActive = true;
    //        $http.get('../api/data/getstanovi').then(
    //            function (result) {
    //                // on success
    //                listStanovi = result.data;
    //                console.log('dataService stanovi, pullilng from the server');
    //                $rootScope.loaderActive = false;
    //                defer.resolve(result.data);
    //            },
    //            function (result) {
    //                // on error
    //                defer.reject(result.data);
    //                $rootScope.errMsg = result.Message;
    //            }
    //        )
    //    //}
    //    //else {
    //    //    defer.resolve(listStanovi);
    //    //}
            
    //        return defer.promise;
    //}


    var stanCreateUpdate = function (stan) {
        // ovo je master - detail relationship
        return $http.post('../api/data/stanCreateUpdate', stan);
    }

    var zaduzenjeCreateUpdate = function (z) {
        return $http.post('../api/data/zaduzivanjeCreateUpdate', z);
    }

    var getPr = function (ZgradaId) {
        return $http({
            url: '../api/data/getprihodirashodi',
            method: "GET",
            params: { ZgradaId: ZgradaId }
        });
    }

    var createPricuva = function (ZgradaId, Godina) {
        console.log("zgradaId: " + ZgradaId);
        return $http({
            url: '../api/data/createPricuva',
            method: "GET",
            params: { ZgradaId: ZgradaId, Godina: Godina }
        });
    }

    return {
        getZgrade: getZgrade,
        zgradaCreateUpdate: zgradaCreateUpdate,
        listZgrade: listZgrade,
        getZgrada: getZgrada,
        listPripadci: listPripadci,
        getPripadci: getPripadci,
        getPripadak: getPripadak,
        getPosebiDijelovi: getPosebiDijelovi,
        posebniDioCreateUpdate: posebniDioCreateUpdate,
        pripadakCreateUpdate: pripadakCreateUpdate,
        listStanovi: listStanovi,
        zaduzenjeCreateUpdate: zaduzenjeCreateUpdate,
        selectedZgrada: selectedZgrada,
        stanCreateUpdate: stanCreateUpdate,
        getPr: getPr,
        selectedPosebniDio: selectedPosebniDio,
        selectedStan: selectedStan,
        createPricuva: createPricuva
    }

}]);