angularApp.controller('editPrihRasCtrl', ['$scope', '$rootScope', '$route', '$location', '$uibModal', 'DataService',
    function ($scope, $rootScope, $route, $location, $uibModal, DataService) {

        if (DataService.selectedZgrada == null) {
            $location.path('prihodirashodi');
            return;
        }

        //  $scope.prihodiRashodi - lista svih prihoda i rashoda za zgradu
        // $scope.obj - izavrani prihodRashod objekt po godini
        // obj koji se dodaju, pushaju se u $scope.prihodiRashodi i to se snima (Status)

        // prihod i rashod je jedan record po godini - $scope.obj ima i prihos i rashod - jedan obj, sa kolekcijama (kolekcije ima Vrstu = p ili r)

        $scope.godine = [];
        
        $scope.novaGodina = null; // godina koju user dodaje
        $scope.dodajGodinu = function () {
            if (isFinite($scope.novaGodina)) {
                // kreiraj prazan prihodRashod za Tvrtku i godinu
                DataService.createEmptyPrihodRashod($scope.zgrada.Id, $scope.novaGodina).then(
                    function (result) {
                        $scope.obj = result.data;
                        $scope.obj.Status = 'a';
                        $scope.SelectedGodina = $scope.novaGodina
                        $scope.tableVisible = true;
                        g = { Godina: $scope.novaGodina };
                        $scope.godine.push(g);
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

        DataService.getPr(DataService.selectedZgrada.Id).then(
            function (result) {
                $scope.prihodiRashodi = result.data; // ovo su sve godine selected zgrade
                if ($scope.prihodiRashodi.length > 0) {
                    var maxGodina = 0;
                    $scope.prihodiRashodi.forEach(function (g) {
                        g = { Godina: g.Godina };
                        gList.push(g)
                        //maxGodina = g.Godina;
                    });
                    //g = { Godina: maxGodina };
                    //gList.push(g)
                    $scope.godine = gList;
                    $scope.SelectedGodina = $scope.prihodiRashodi[$scope.prihodiRashodi.length - 1].Godina;
                    $scope.obj = $scope.prihodiRashodi[$scope.prihodiRashodi.length-1]; // selektiraj zadnjega
                    $scope.tableVisible = true;
                }
                else {
                    //g = { Godina: new Date().getFullYear() };
                    //gList.push(g)
                    //// dodaj josjednu godinu
                    //g = { Godina: parseInt(new Date().getFullYear()) + 1 };
                    //gList.push(g)
                    //$scope.godine = gList;
                    //$scope.SelectedGodina = new Date().getFullYear();
                    $scope.tableVisible = false;
                }

            },
            function (result) {
                // on error
            }
        )
        $scope.godinaChanged = function () {
            $scope.prihodiRashodi.forEach(function (pr) {
                if (pr.Godina == $scope.SelectedGodina)
                    $scope.obj = pr;
            });
        };

        // provjeri lleap year
        $scope.getFebDay = function () {
            var year = new Date().getFullYear();
            if (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0))
                return 29;
            return 28;
        }


        // _______________________________________________________________
        // modal Prihodi
        // _______________________________________________________________
        //$scope.noviPrihod = {
        //    Id: 0, PrihodiRashodiMasterId: $scope.obj.Id, Datum: null, Opis: "", Iznos: 0, Razlika: 0, Placeno: 0, Vrsta: "p"
        //};
        $scope.openModalPrihodi = function (mjesec) {
            var tempObj = {};
            angular.copy($scope.obj, tempObj);

            var modalInstance = $uibModal.open({
                templateUrl: '../app/PihRas/modalPrihod.html',
                controller: 'modalPrihodCtrl',
                size: 'lg',
                backdrop: 'static',
                keyboard: false,
                resolve: {
                    obj: function () {
                        return $scope.obj;
                    },
                    mjesec: function () { return mjesec; }
                }
            });

            modalInstance.result.then(function (obj) { // citav object sa editiranim/dodanim kolekcijama
                console.log("modal result fn " + $scope.obj.PlacenoPrihodMj1);
                if (obj.Id > 0)
                    $scope.obj.Status = 'u';

            }, function () {
                // modal dismiss
                //$scope.newItemPripadak = { Id: 0, StanId: $routeParams.id, PripadakId: null, Naziv: "", PovrsinaM2: 0, PovrsinaPosto: 0 }
                //if (item.Id > 0) {
                    // vrati objekt u prethodno stanje (tempObj)
                    //$scope.obj.PrihodiRashodiDetails.forEach(function (col) {
                    //    if (dio.Id == item.Id) {
                    //        dio.Datum = tempObj.Datum;
                    //        dio.Opis = tempObj.Opis;
                    //        dio.Iznos = tempObj.Iznos;
                    //        dio.Razlika = tempObj.Razlika;
                    //        dio.Placeno = tempObj.Placeno;
                    //    }
                    //});
                    angular.copy(tempObj, $scope.obj);
                //}
            });
            //$scope.noviPrihod = {
            //    Id: 0, PrihodiRashodiMasterId: $scope.obj.Id, Datun: null, Opis: "", Iznos: 0, Razlika: 0, Placeno: 0, Vrsta: "p"
            //};
        }; // end of prihod modal stuff

        $scope.saveAll = function () {
            alert('saveAll');
        }

        $scope.cancelReload = function () {
            $route.reload();
        }

    }]);