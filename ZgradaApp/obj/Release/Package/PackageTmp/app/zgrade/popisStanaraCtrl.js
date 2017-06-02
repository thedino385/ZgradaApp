angularApp.controller('popisStanaraCtrl', ['$scope', '$rootScope', '$routeParams', '$location', 'toastr', 'DataService', function ($scope, $rootScope, $routeParams, $location, toastr, DataService) {

    if ($routeParams) {
        $rootScope.loaderActive = false;
        DataService.getPopisStanari($routeParams.id).then(
            function (result) {
                $scope.popis = result.data;
                $rootScope.loaderActive = false;
                $scope.msg = 'Popis stanara';
                if ($scope.popis.length > 0)
                    $scope.msg = 'Popis stanara u zgradi: ' + $scope.popis[0].Naziv + ', ' + $scope.popis[0].Adresa + ', ' + $scope.popis[0].Mjesto;
            },
            function (result) {
                $rootScope.loaderActive = false;
                toastr.error('Dohvat podataka nije uspio;');
            }
        )
    }
    

}]);