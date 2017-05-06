angularApp.controller('posebniDijeloviMasterListCtrl', ['$scope', '$location', '$routeParams', '$rootScope', 'DataService', '$mdDialog',
    function ($scope, $location, $routeParams, $rootScope, DataService, $mdDialog) {

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

        $scope.goToPopisZD = function () {
            DataService.currZgrada = $scope.zgrada;
            $location.path('/popisDijelova');
        }

        $scope.goToPopisZU = function () {
            DataService.currZgrada = $scope.zgrada;
            $location.path('/popisUredjaja');
        }
        
        

        // _________________________________________________________
        //              Modal kartica
        // _________________________________________________________
        $scope.kartica = function (pdMaster, ev) {
            $mdDialog.show({
                controller: 'indexKsCtrl',
                templateUrl: 'app/ks/indexKs.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
                , locals: {
                    zgradaObj: $scope.zgrada,
                    pdMaster: pdMaster,
                }
            }).then(function () {
            }, function () {
            });
        };
    }]);
