angularApp.controller('posebniDijeloviMasterListCtrl', ['$scope', '$location', '$routeParams', '$rootScope', 'DataService',
    function ($scope, $location, $routeParams, $rootScope, DataService) {

        $scope.zgradaMsg = '';
        if ($routeParams) {
            $rootScope.loaderActive = true;
            DataService.getZgrada($routeParams.id).then(
                function (result) {
                    // on success
                    $scope.zgrada = result.data;
                    $rootScope.loaderActive = false;
                    $scope.zgradaMsg = $scope.zgrada.Naziv + ' ' + $scope.zgrada.Adresa + ' ' + $scope.zgrada.Mjesto;
                },
                function (result) {
                    // on errr
                    $rootScope.errMsg = result.Message;
                }
            );
        }
        //$scope.novaZgrada = function () {
        //    $location.path('/zgrada/0');
        //};

        $scope.edit = function (posebniDioMasterId) {
            DataService.currZgrada = $scope.zgrada;
            $location.path('/posebniDioChildren/' + posebniDioMasterId);
        }

        $scope.goToPrihodiRashodi = function () {
            $location.path('/prihodiRashodi/' + $scope.zgrada.Id);
        }
        
        $scope.goToPricuvaRezije = function () {
            $location.path('/pricuvaRezije/' + $scope.zgrada.Id);
        }

        //$scope.goToStanovi = function (zgradaId) {
        //    $location.path('/stanovi/' + zgradaId);
        //}

        //$scope.goToPregled = function (zgradaId) {
        //    $location.path('/pregled/' + zgradaId);
        //}

        //$scope.goToZaduzivanje = function (zgradaId) {
        //    $location.path('/zaduzivanje/' + zgradaId);
        //}

    }]);
