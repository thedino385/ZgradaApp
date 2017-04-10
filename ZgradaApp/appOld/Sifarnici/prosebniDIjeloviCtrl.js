angularApp.controller('prosebniDIjeloviCtrl', ['$scope', '$location', '$rootScope', 'DataService', function ($scope, $location, $rootScope, DataService) {

    // povuci pripadke
    $rootScope.loaderActive = true;
    DataService.getPosebiDijelovi().then(
        function (result) {
            // on success
            $scope.dijelovi = result.data;
            $rootScope.loaderActive = false;
            //DataService.listPripadci = result.data;
        },
        function (result) {
            // on errr
            $rootScope.errMsg = result.Message;
        }
    )

    $scope.noviDio = function () {
        DataService.selectedPosebniDio = { Id: 0, Naziv: "", Oznaka: "" };
        $location.path('/posebniDio/0');
    };

    $scope.edit = function (obj) {
        DataService.selectedPosebniDio = obj;
        $location.path('/posebniDio/' + obj.Id);
    }

}]);