angularApp.controller('zaduzivanjePoMjCtrl', ['$scope', '$routeParams', '$location', 'DataService', function ($scope, $routeParams, $location, DataService) {

    if ($routeParams.id > 0) {
        $scope.msg = "Uredi zgradu";
        DataService.getZgrade().then(function (zgrade) {
            zgrade.forEach(function (obj) {
                if ($routeParams.id == obj.Id) {
                    $scope.obj = obj;
                }
            })
            $scope.msg = "Zaduživanje po mjesecima";
            $scope.msgZgrada = $scope.obj.Naziv + ", " + $scope.obj.Adresa + ", " + $scope.obj.Mjesto;

        })
    }

}]);