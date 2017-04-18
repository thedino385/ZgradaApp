angularApp.controller('zgradeCtrl', ['$scope', '$location', '$routeParams', '$rootScope', 'DataService',
    function ($scope, $location, $routeParams, $rootScope, DataService) {

        // povuci zgrade
        //DataService.getZgrade().then(function (result) {
        //    $scope.zgrade = result;
        //    console.log($scope.zgrade);
        //    console.log(result);
        //});

        $rootScope.loaderActive = true;
        DataService.getZgrade().then(
            function (result) {
                // on success
                $scope.zgrade = result.data;
                $rootScope.loaderActive = false;
                DataService.listZgrade = result.data;
            },
            function (result) {
                // on errr
                $rootScope.errMsg = result.Message;
            }
        );

        $scope.novaZgrada = function () {
            $location.path('/zgrada/0');
        };

        $scope.edit = function (obj) {
            $location.path('/zgrada/' + obj.Id);
        }

        $scope.goToPosebniDjeloviChild = function (zgradaId) {
            $location.path('/posebniDijeloviMasterList/' + zgradaId);
        }

        $scope.goToPrihodiRashodi = function (zgradaId) {
            $location.path('/prihodiRashodi/' + zgradaId);
        }


        //$scope.goToPregled = function (zgradaId) {
        //    $location.path('/pregled/' + zgradaId);
        //}

        //$scope.goToZaduzivanje = function (zgradaId) {
        //    $location.path('/zaduzivanje/' + zgradaId);
        //}

    }]);
