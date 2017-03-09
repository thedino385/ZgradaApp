angularApp.controller('zgradaCtrl', ['$scope', '$routeParams', '$location', '$rootScope', 'DataService', function (
    $scope, $routeParams, $location, $rootScope, DataService) {
    

    if ($routeParams) {
        console.log($routeParams.id);

        if ($routeParams.id > 0) {
            $scope.msg = "Uredi zgradu";
            console.log(DataService.listZgrade);
            DataService.listZgrade.forEach(function (obj) {
                if($routeParams.id == obj.Id) {
                    $scope.obj = obj;
                }
            });
        }
        else {
            $scope.msg = "Dodaj zgradu";
            $scope.obj = {
                Id: 0, Naziv: "", Adresa: "", Mjesto: "", Povrsinam2: 0, CompanyId: 1
            };
        }
    }

    $scope.save = function () {
        console.log('save fn');
        console.log($scope.obj);
        $rootScope.loaderActive = true;
        // dodaj zgradu u db i DataService.listZgrade array
        DataService.zgradaCreateUpdate($scope.obj).then(
        function (result) {
            // on success
            if (result.data > 0) {
                $scope.obj.Id = result.data; // insert, vrati Id sa servera, pukni u obj
                DataService.listZgrade.push($scope.obj); // dodaj u listu
            }
            else {
                DataService.listZgrade.forEach(function (obj) {
                    if (obj.Id == result.data)
                        DataService.listZgrade.obj = $scope.obj;
                })
            }
            $rootScope.loaderActive = false;
            $location.path('/zgrade');
            console.log(DataService.listZgrade);
        },
        function (result) {
            // on error
            $rootScope.errMsg = result.Message;
        }
    )
};

}]);