angularApp.factory('AccountService', ['$http', '$rootScope', '$q', function ($http, $rootScope, $q) {


    var createAccForZgrada = function (zgradaId) {
        return $http({
            url: '../Account/createAccForZgrada',
            method: "GET",
            params: { zgradaId: zgradaId }
        });
    }

    return {
        createAccForZgrada: createAccForZgrada
    }

}]);