angularApp.controller('zgradeCtrl', ['$scope', '$location', '$routeParams', '$rootScope', 'DataService',
    function ($scope, $location, $routeParams, $rootScope, DataService) {

        // povuci zgrade
        if (DataService.listZgrade.length == 0) {
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
            )
        }
        else {
            $scope.zgrade = DataService.listZgrade;
        }


        $scope.novaZgrada = function () {
            $location.path('/zgrada/0');
        };

        $scope.edit = function (obj) {
            $location.path('/zgrada/' + obj.Id);
        }

        $scope.goToStanovi = function (zgradaId) {
            $location.path('/stanovi/' + zgradaId);
        }


    }]);