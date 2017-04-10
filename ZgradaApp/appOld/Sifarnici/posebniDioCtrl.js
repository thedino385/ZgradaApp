angularApp.controller('posebniDioCtrl', ['$scope', '$routeParams', '$location', '$rootScope', 'DataService', function (
    $scope, $routeParams, $location, $rootScope, DataService) {

    if (DataService.selectedPosebniDio == null) {
        $scope.msg = "Dodaj posebni dio";
        $scope.obj = {
            Id: 0, Naziv: "", Oznaka: ""
        };
    }
    else {
        $scope.obj = DataService.selectedPosebniDio;
    }   

    $scope.save = function () {
        $rootScope.loaderActive = true;
        DataService.posebniDioCreateUpdate($scope.obj).then(
            function (result) {
                // on success
                $rootScope.loaderActive = false;
                $location.path('/prosebniDIjelovi');
            },
            function (result) {
                // on error
                $rootScope.errMsg = result.Message;
            }
        )
    };

}]);