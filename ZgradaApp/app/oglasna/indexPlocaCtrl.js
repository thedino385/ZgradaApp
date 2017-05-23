angularApp.controller('indexPlocaCtrl', ['$scope', '$rootScope', '$location', '$mdDialog', 'toastr', 'DataService', function ($scope, $rootScope, $location, $mdDialog, toastr, DataService) {


    if (DataService.selZgradaId == null) {
        $location.path('/zgrade');
        return;
    }

    $rootScope.loaderActive = true;
    DataService.getOglasna(DataService.selZgradaId).then(
        function (result) {
            // on success
            $scope.oglasna = result.data;
            //$scope.msg = $scope.zgradaObj.Naziv + ' ' + $scope.zgradaObj.Adresa;
            $rootScope.loaderActive = false;
        },
        function (result) {
            toastr.error('Greška pri dohvačanju podataka sa servera');
        }
    );


    $scope.openModal = function (id, ev) {
        $mdDialog.show({
            controller: 'dodajOglasModalCtrl',
            templateUrl: 'app/oglasna/dodajOglasModal.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
            , locals: {
                id: id,
                oglasna: $scope.oglasna
            }
        }).then(function (oglas) {
            if (id == 0)
                $scope.oglasna.push(oglas);
            else {
                $scope.oglasna.forEach(function (o) {
                    if (o.Id == oglas.Id)
                        o = oglas;
                });
            }
            //$scope.oglasna = oglasna;
            DataService.oglasnaEditOrCreate(oglas).then(
                function (result) {
                    toastr.success('Podaci su snimljeni.');
                    //$route.reload();
                },
                function (result) {
                    toastr.error('Pogreška kod snimanja.');
                }
            )
            }, function (oglasna) {
                // cancel
                $scope.oglasna = oglasna;
        });
    }

    $scope.parseDate = function (date) {
        var d = new Date(date);
        return dodajNulu(d.getDate()) + '.' + dodajNulu(parseInt(d.getMonth() + 1)) + '.' + d.getFullYear() + '.';
    }

    function dodajNulu(x) {
        if (x < 10)
            return '0' + x;
        return x;
    }

}]);