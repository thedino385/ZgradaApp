angularApp.controller('editPrihRasCtrl', ['$scope', '$rootScope', '$route', '$location', '$uibModal', 'DataService', 'toastr',
    function ($scope, $rootScope, $route, $location, $uibModal, DataService, toastr) {

        // $scope.prihodiRashodi - masteri (sve godine)
        //  $scope.prihodRashodZaGodinu - master (jedna godina)

        if (DataService.selectedZgrada == null) {
            $location.path('prihodirashodi');
            return;
        }
        $scope.tableVisible = false;
        $scope.godine = [];
        $scope.novaGodina = null; // godina koju user dodaje
        $scope.dodajGodinu = function () {
            if (isFinite($scope.novaGodina)) {
                var ok = true;
                $scope.prihodiRashodi.forEach(function (obj) {
                    if (obj.Godina == $scope.novaGodina) {
                        toastr.error('Godina postoji!');
                        ok = false;
                    }
                });
                if (!ok)
                    return;

                // kreiraj prazan prihodRashod za Tvrtku i godinu
                DataService.createEmptyPrihodRashod($scope.zgrada.Id, $scope.novaGodina).then(
                    function (result) {
                        $scope.prihodRashodZaGodinu = result.data;
                        $scope.prihodRashodZaGodinu.Status = 'a';
                        $scope.prihodiRashodi.push(result.data);
                        $scope.godine.push($scope.novaGodina);
                        $scope.novaGodina = '';
                    },
                    function (result) {
                        // err
                    }
                )
            }
        }

        var gList = [];
        var g = {};
        $scope.obj = {}; // ovo je object za izabranu godinu
        $scope.zgrada = DataService.selectedZgrada;
        $rootScope.loaderActive = true;
        DataService.getPr(DataService.selectedZgrada.Id).then(
            function (result) {
                $scope.prihodiRashodi = result.data; // ovo su sve godine selected zgrade
                DataService.getPricuva(DataService.selectedZgrada.Id).then(
                    function (result) {
                        $scope.pricuvaZaZgraduSveGodine = result.data;
                        $rootScope.loaderActive = false;
                        if ($scope.prihodiRashodi.length > 0) {
                            $scope.prihodiRashodi.forEach(function (g) {
                                gList.push(g.Godina)
                            });
                            $scope.godine = gList;
                            //$scope.tableVisible = true;
                            // povuci i pricuvu zbog prebacivanja upata pricuve
                        }
                        //else {
                        //    $scope.tableVisible = false;
                        //}
                    },
                    function (result) {
                        alert('Dohvat pricuva nije uspio');
                    }
                )
            },
            function (result) {
                // on error
                alert('Dohvat prihoda i rashoda nije uspio')
            }
        )
        $scope.godinaChanged = function (godina) {
            $scope.SelectedGodina = godina;
            $scope.prihodiRashodi.forEach(function (pr) {
                console.log(pr.Godina);
                if (pr.Godina == $scope.SelectedGodina) {
                    $scope.prihodRashodZaGodinu = pr;
                    $scope.tableVisible = true;
                    
                }
            });
        };

        // provjeri lleap year
        $scope.getFebDay = function () {
            //var year = new Date().getFullYear();
            var year = $scope.SelectedGodina;
            if (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0))
                return 29;
            return 28;
        }

        // _______________________________________________________________
        // modal Prihodi
        // _______________________________________________________________
        $scope.openModalPrihodi = function (mjesec) {
            var tempObj = {};
            angular.copy($scope.prihodRashodZaGodinu, tempObj);

            var modalInstance = $uibModal.open({
                templateUrl: '../app/PihRas/modalPrihod.html',
                controller: 'modalPrihodCtrl',
                size: 'lg',
                backdrop: 'static',
                keyboard: false,
                resolve: {
                    prihodRashodZaGodinu: function () {
                        return $scope.prihodRashodZaGodinu;
                    },
                    mjesec: function () { return mjesec; },
                    godina: function () { return $scope.SelectedGodina; },
                    pricuvaZaZgraduSveGodine: function () { return $scope.pricuvaZaZgraduSveGodine; }
                }
            });

            modalInstance.result.then(function (prihodRashodZaGodinu) { // citav object sa editiranim/dodanim kolekcijama
                if (prihodRashodZaGodinu.Status == null)
                    prihodRashodZaGodinu.Status = 'u';

            }, function () {
                angular.copy(tempObj, $scope.prihodRashodZaGodinu);
            });
        }; // end of prihod modal stuff


        // _______________________________________________________________
        // modal Rashodi
        // _______________________________________________________________
        $scope.openModalRashodi = function (mjesec) {
            var tempObj = {};
            angular.copy($scope.prihodRashodZaGodinu, tempObj);

            var modalInstance = $uibModal.open({
                templateUrl: '../app/PihRas/modalRashod.html',
                controller: 'modalRashodCtrl',
                size: 'lg',
                backdrop: 'static',
                keyboard: false,
                resolve: {
                    prihodRashodZaGodinu: function () {
                        return $scope.prihodRashodZaGodinu;
                    },
                    mjesec: function () { return mjesec; },
                    godina: function () { return $scope.SelectedGodina; }
                }
            });

            modalInstance.result.then(function (prihodRashodZaGodinu) { // citav object sa editiranim/dodanim kolekcijama
               // sve je u masteru za godinu, statusi postavljeni
                // provjeri Status mastera, ako nije 'a' (prazan je) , stavi da je 'u'
                if (prihodRashodZaGodinu.Status.length == 0)
                    prihodRashodZaGodinu.Status = 'u';

            }, function () {
                angular.copy(tempObj, $scope.prihodRashodZaGodinu);
            });
        }; // end of prihod modal stuff

        $scope.saveAll = function () {
            DataService.pRCreateUpdate($scope.prihodiRashodi).then(
                function (result) {
                    toastr.success('Promjene su snimljene!', '');
                },
                function (result) {
                    toastr.error('Greška kod snimanja!', '');
                }
            )
            
        }

        $scope.cancelReload = function () {
            $route.reload();
        }

    }]);