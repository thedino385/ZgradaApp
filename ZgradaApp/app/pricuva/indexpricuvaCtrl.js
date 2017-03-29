angularApp.controller('indexPricuvaCtrl', ['$scope', '$location', '$rootScope', 'DataService', function ($scope, $location, $rootScope, DataService) {

    $rootScope.loaderActive = true;
    DataService.getZgrade().then(
        function (result) {
            // success
            $scope.zgrade = result.data;
            $rootScope.loaderActive = false;
        },
        function (result) {
            // err
        }
    )

    $scope.showDetails = function (zgrada) {
        DataService.selectedZgrada = zgrada;
        $location.path('/pricuvaedit/' + zgrada.Id);
    }

}]);