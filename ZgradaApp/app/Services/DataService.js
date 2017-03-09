angularApp.factory('DataService', ['$http', '$rootScope', '$q', function ($http, $rootScope, $q) {

    var listZgrade = [];
    var listPripadci = [];
    var listStanovi = [];
    var selectedZgradaId = null;

    // zgrade
    var getZgrade = function() {
        return $http.get('../api/data/getzgrade');
    }

    var zgradaCreateUpdate = function (zgrada) {
        console.log(zgrada);
        return $http.post('../api/data/zgradaCreateUpdate', zgrada);
    }

    //var getPripadci = function () {
    //    return $http.get('../api/data/getpripadci');
    //}

    var getPripadci = function () {
        var defer = $q.defer();
        if (listPripadci.length == 0) {
            $rootScope.loaderActive = true;
            $http.get('../api/data/getpripadci').then(
                function (result) {
                    // on success
                    listPripadci = result.data;
                    console.log('dataService pripadci, pullilng from the server');
                    $rootScope.loaderActive = false;
                    defer.resolve(result.data);
                },
                function (result) {
                    // on error
                    defer.reject(result.data);
                    $rootScope.errMsg = result.Message;
                }
            )
        }
        else
            defer.resolve(listPripadci);
        return defer.promise;
    }

    var pripadakCreateUpdate = function (pripadak) {
        return $http.post('../api/data/pripadakCreateUpdate', pripadak);
    }

    //var getStanovi = function () {
    //    return $http.get('../api/data/getstanovi');
    //};
    var getStanovi = function () {
        var defer = $q.defer();
        if (listStanovi.length == 0) {
            $rootScope.loaderActive = true;
            $http.get('../api/data/getstanovi').then(
                function (result) {
                    // on success
                    listStanovi = result.data;
                    console.log('dataService stanovi, pullilng from the server');
                    $rootScope.loaderActive = false;
                    defer.resolve(result.data);
                },
                function (result) {
                    // on error
                    defer.reject(result.data);
                    $rootScope.errMsg = result.Message;
                }
            )
        }
        else 
            defer.resolve(listStanovi);
        return defer.promise;
    }


    var stanCreateUpdate = function (stan) {
        // ovo je master - detail relationship
        return $http.post('../api/data/stanCreateUpdate', stan);
    }

    

    return {
        getZgrade: getZgrade,
        zgradaCreateUpdate: zgradaCreateUpdate,
        listZgrade: listZgrade,
        listPripadci: listPripadci,
        getPripadci: getPripadci,
        pripadakCreateUpdate: pripadakCreateUpdate,
        listStanovi: listStanovi,
        getStanovi: getStanovi,
        selectedZgradaId: selectedZgradaId,
        stanCreateUpdate: stanCreateUpdate
    }

}]);