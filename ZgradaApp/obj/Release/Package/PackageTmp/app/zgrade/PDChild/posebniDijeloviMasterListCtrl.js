angularApp.controller('posebniDijeloviMasterListCtrl', ['$scope', '$location', '$routeParams', '$rootScope', 'DataService', '$mdDialog',
    function ($scope, $location, $routeParams, $rootScope, DataService, $mdDialog) {

        if (DataService.selZgradaId == null) {
            $location.path('/zgrade');
            return;
        }

        $scope.zgradaMsg = '';
        $rootScope.loaderActive = true;
        //if ($routeParams) {
        DataService.getZgrada(DataService.selZgradaId, false, false).then(
            function (result) {
                // on success
                $scope.zgrada = result.data.Zgrada;
                //DataService.currZgrada = result.data.Zgrada;
                //DataService.zgradaUseri = result.data.Useri;
                //DataService.userId = result.data.userId;
                $rootScope.loaderActive = false;
                //$scope.zgrada = zgradaObj
                $scope.zgradaMsg = $scope.zgrada.Naziv + ' ' + $scope.zgrada.Adresa + ' ' + $scope.zgrada.Mjesto;
            },
            function (result) {
                // on errr
                alert(result.Message);
                $rootScope.errMsg = result.Message;
            }
        );



        //}
        //$scope.novaZgrada = function () {
        //    $location.path('/zgrada/0');
        //};

        $scope.edit = function (posebniDioMasterId) {
            DataService.currZgrada = $scope.zgrada;
            $location.path('/posebniDioChildren/' + posebniDioMasterId);
        }

        //$scope.goToPrihodiRashodi = function () {
        //    $location.path('/prihodiRashodi/' + $scope.zgrada.Id);
        //}

        //$scope.goToPricuvaRezije = function () {
        //    $location.path('/pricuvaRezije/' + $scope.zgrada.Id);
        //}

        //$scope.goToPopisZD = function () {
        //    DataService.currZgrada = $scope.zgrada;
        //    $location.path('/popisDijelova');
        //}

        //$scope.goToPopisZU = function () {
        //    DataService.currZgrada = $scope.zgrada;
        //    $location.path('/popisUredjaja');
        //}

        $scope.goToDnevnik = function () {
            DataService.currZgrada = $scope.zgrada;
            $location.path('/dnevnik/' + $scope.zgrada.Id);
        }


        // _________________________________________________________
        //              Modal kartica
        // _________________________________________________________
        $scope.kartica = function (pdMaster, ev) {
            $('nav').fadeOut();
            $mdDialog.show({
                controller: 'indexKsCtrl',
                templateUrl: 'app/ks/indexKs.html?p=' + new Date().getTime() / 1000,
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
