angularApp.factory('DataService', ['$http', function ($http) {

    // zgrade
    var getZgrade = function() {
        return $http.get('../api/data/getzgrade');
    }

    var zgradaCreateUpdate = function (zgrada) {
        console.log(zgrada);
        return $http.post('../api/data/zgradaCreateUpdate', zgrada);
    }

    var getPripadci = function () {
        return $http.get('../api/data/getpripadci');
    }

    var pripadakCreateUpdate = function (pripadak) {
        return $http.post('../api/data/pripadakCreateUpdate', pripadak);
    }

    var getStanovi = function () {
        return $http.get('../api/data/getstanovi');
    };

    var stanCreateUpdate = function (stan) {
        // ovo je master - detail relationship
        return $http.post('../api/data/stanCreateUpdate', stan);
    }

    var listZgrade = [];
    var listPripadci = [];
    var listStanovi = [];
    var selectedZgradaId = null;

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