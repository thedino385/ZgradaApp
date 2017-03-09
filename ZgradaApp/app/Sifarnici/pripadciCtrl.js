angularApp.controller('pripadciCtrl', ['$scope', '$location', '$rootScope', 'DataService', function ($scope, $location, $rootScope, DataService) {

    // povuci pripadke
    if (DataService.listPripadci.length == 0) {
        $rootScope.loaderActive = true;
        DataService.getPripadci().then(
            function (result) {
                // on success
                $scope.pripadci = result.data;
                $rootScope.loaderActive = false;
                DataService.listPripadci = result.data;
            },
            function (result) {
                // on errr
                $rootScope.errMsg = result.Message;
            }
        )
    }
    else {
        $scope.pripadci = DataService.listPripadci;
    }


    $scope.noviPripadak = function () {
        $location.path('/pripadak/0');
    };

    $scope.edit = function (obj) {
        $location.path('/pripadak/' + obj.Id);
    }

}]);