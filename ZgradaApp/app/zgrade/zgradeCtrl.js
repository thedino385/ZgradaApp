angularApp.controller('zgradeCtrl', ['$scope', '$location', '$routeParams', '$rootScope', 'DataService',
    function ($scope, $location, $routeParams, $rootScope, DataService) {

        

        $rootScope.loaderActive = true;
        DataService.getZgrade().then(
            function (result) {
                // on success
                $scope.zgrade = result.data;
                $rootScope.loaderActive = false;
                //DataService.listZgrade = result.data;
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
            DataService.getZgrada(zgradaId).then(
                function (result) {
                    // on success
                    $scope.zgradaObj = result.data.Zgrada;
                    DataService.currZgrada = result.data.Zgrada;
                    DataService.zgradaUseri = result.data.Useri;
                    DataService.userId = result.data.userId;
                    $rootScope.loaderActive = false;
                    $location.path('/posebniDijeloviMasterList/' + zgradaId);
                },
                function (result) {
                    // on errr
                    alert(result.Message);
                    $rootScope.errMsg = result.Message;
                }
            );
        }

        $scope.goToPrihodiRashodi = function (zgradaId) {
            DataService.getZgrada(zgradaId).then(
                function (result) {
                    // on success
                    $scope.zgradaObj = result.data.Zgrada;
                    DataService.currZgrada = result.data.Zgrada;
                    DataService.zgradaUseri = result.data.Useri;
                    DataService.userId = result.data.userId;
                    $rootScope.loaderActive = false;
                    $location.path('/prihodiRashodi/' + zgradaId);
                },
                function (result) {
                    // on errr
                    alert(result.Message);
                    $rootScope.errMsg = result.Message;
                }
            );
        }

        function getZgrada(id) {
            
        }


        //$scope.goToPregled = function (zgradaId) {
        //    $location.path('/pregled/' + zgradaId);
        //}

        //$scope.goToZaduzivanje = function (zgradaId) {
        //    $location.path('/zaduzivanje/' + zgradaId);
        //}

    }]);
