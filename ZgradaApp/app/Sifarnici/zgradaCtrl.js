angularApp.controller('zgradaCtrl', ['$scope', '$routeParams', '$location', '$rootScope', '$uibModal', 'toastr', 'DataService',
    function ($scope, $routeParams, $location, $rootScope, $uibModal, toastr, DataService) {

    if ($routeParams) {
        console.log($routeParams.id);
        //var _stanovi = [];
        //var _obj = {};

        var _pripadci = [];
        DataService.getPripadci().then(
            function (result) {
            _pripadci = result.data;
            },
            function (result) {
                $rootScope.errMsg = result.Message;
            }
        );

        //DataService.getStanovi().then(
        //function (stanovi) {
        //    stanovi.forEach(function (obj) {
        //        if (obj.ZgradaId == $routeParams.id) {
        //            _stanovi.push(obj);
        //        }
        //    });
        //    IzracunajUkupnePovrsine();
        //});

        if ($routeParams.id > 0) {
            $rootScope.loaderActive = true;
            DataService.getZgrada($routeParams.id).then(
                function (result) {
                    // on success
                    $scope.obj = result.data;
                    $rootScope.loaderActive = false;
                    IzracunajUkupnePovrsine();
                },
                function (result) {
                    // on errr
                    alert(result.Message);
                    $rootScope.errMsg = result.Message;
                }
            );


            //console.log(DataService.listZgrade);
            //DataService.getZgrade().then(function (zgrade) {
            //    console.log(zgrade);
            //    zgrade.forEach(function (obj) {
            //        if ($routeParams.id == obj.Id) {
            //            //angular.copy(obj, _obj);
            //            //console.log(_obj);
            //            console.log("samo obj:" + obj.Povrsinam2);
            //            $scope.obj = obj;
            //            console.log("POVRSSSSSSSSSSSS:" + $scope.obj.Povrsinam2);
            //        }
            //    })
            //})
        }
        else {
            $scope.msg = "Dodaj zgradu";
            $scope.obj = {
                Id: 0, Naziv: "", Adresa: "", Mjesto: "", Povrsinam2: 0, Zgrade_Pripadci: []
            };
        }
    }

    $scope.save = function () {
        $rootScope.loaderActive = true;
        // dodaj zgradu u db i DataService.listZgrade array
        DataService.zgradaCreateUpdate($scope.obj).then(
        function (result) {
            // on success
            //if (result.data > 0) {
            //    $scope.obj.Id = result.data; // insert, vrati Id sa servera, pukni u obj
            //    //DataService.listZgrade.push($scope.obj); // dodaj u listu
                
            //}
            //else {
            //    DataService.listZgrade.forEach(function (obj) {
            //        if (obj.Id == result.data)
            //            DataService.listZgrade.obj = $scope.obj;
            //    })
            //}
            $rootScope.loaderActive = false;
            toastr.success('Promjene su snimljene!', '');
            $location.path('/zgrade');
        },
        function (result) {
            // on error
            $rootScope.errMsg = result.Message;
        }
    )
    };


    // _______________________________
    //      Pripadci
    // _______________________________

    $scope.deletePripadak = function (pripadak) {
        //$scope.obj.Zgrade_Pripadci.splice($scope.obj.Zgrade_Pripadci.indexOf(pripadak), 1);
        pripadak.Status = "d";
        IzracunajPovrsineZaPripadke();
        //IzracunajPovrsine();
    }


    $scope.newItemPripadak = { Id: 0, ZgradaId: $routeParams.id, PripadakId: null, Naziv: "", VrstaNaziv: "", PovrsinaM2: 0, PovrsinaPosto: 0, Napomena: "" };
    $scope.openModalPripadak = function (item) {
        var tempObj = {};
        angular.copy(item, tempObj);
        var modalInstance = $uibModal.open({
            templateUrl: '../app/Sifarnici/modals/pripadakModal.html',
            //controller: function ($scope, $uibModalInstance, item) {
            //    $scope.item = item;
            //},
            controller: 'pripadakModalCtrl',
            size: 'lg',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                item: function () {
                    return item;
                },
                pripadci: function () {
                    console.log("pripadci " + _pripadci);
                    return _pripadci;
                },
                //stanovi: function () {
                //    console.log("_stanovi " + _stanovi);
                //    return _stanovi;
                //},
                //currentStan: function () {
                //    return $scope.obj;
                //}
            }
        });

        modalInstance.result.then(function (item) {
            console.log("modal result fn");
            if (item.Id == 0) {
                // add new
                var maxId = 0;
                item.Status = "a";
                $scope.obj.Zgrade_Pripadci.forEach(function (obj) {
                    if (obj.Id > maxId)
                        maxId = obj.Id;
                });
                item.Id = maxId + 1;

                $scope.obj.Zgrade_Pripadci.push(item);

            }
            else {
                item.Status = "u";
            //    $scope.obj.Stanovi_Pripadci.forEach(function (dio) {
            //        if (dio.Id == item.Id)
            //            $scope.obj.Stanovi_Pripadci.dio = item;
            //    });
            }

            // tu
            IzracunajPovrsineZaPripadke();
            
        }, function () {
            // modal dismiss
            //$scope.newItemPripadak = { Id: 0, StanId: $routeParams.id, PripadakId: null, Naziv: "", PovrsinaM2: 0, PovrsinaPosto: 0 }
            if (item.Id > 0) {
                // vrati objekt u prethodno stanje (tempObj)
                $scope.obj.Zgrade_Pripadci.forEach(function (dio) {
                    if (dio.Id == item.Id) {
                        dio.Naziv = tempObj.Naziv;
                        dio.PovrsinaM2 = tempObj.PovrsinaM2;
                        dio.Napomena = tempObj.Napomena
                    }

                });
            }
        });
        $scope.newItemPripadak = { Id: 0, ZgradaId: $routeParams.id, PripadakId: null, Naziv: "", VrstaNaziv: "", PovrsinaM2: 0, PovrsinaPosto: 0, Napomena: "" };
    }; // end of pripadak modal


    $scope.ukupnaPovrsinaM2 = 0;
    $scope.ukupnaPovrsinaPosto = 0;
    $scope.ukupnaSumaPovrsinaM2 = 0;
    $scope.ukupnaSumaPOvrsinaPosto = 0;
    // Ukupne povrsine za zfradu
    function IzracunajUkupnePovrsine() {
        // suma povrisna za stanovima

        var ukupnaPovrsinaM2 = 0;
        var ukupnaPovrsinaPosto = 0;
        var ukupnaSumaPovrsinaM2 = 0;
        var ukupnaSumaPOvrsinaPosto = 0;

        console.log("IzracunajUkupnePovrsine");
        // Ukupno PovrsinaM2
        console.log("ukupnaPovrsinaM2 " + ukupnaPovrsinaM2);
        $scope.obj.Stanovi.forEach(function (stan) {
            //if (stan.Id != $scope.obj.Id) {
                // ne zbraja vrijednosti od stana iz arraya, uzmi ih direktno da ne zbrajas dva puta
                ukupnaPovrsinaM2 += parseFloat(stan.PovrsinaM2);
                ukupnaPovrsinaPosto += parseFloat(stan.PovrsinaPosto);
                ukupnaSumaPovrsinaM2 += parseFloat(stan.SumaPovrsinaM2);
                ukupnaSumaPOvrsinaPosto += parseFloat(stan.SumaPovrsinaPosto);
                console.log("ukupnaPovrsinaM2 " + ukupnaPovrsinaM2);
            //}
        });

        //console.log($scope.obj);

        //ukupnaPovrsinaM2 += parseFloat($scope.obj.PovrsinaM2);
        //ukupnaPovrsinaPosto += parseFloat($scope.obj.PovrsinaPosto);
        //ukupnaSumaPovrsinaM2 += parseFloat($scope.obj.SumaPovrsinaM2);
        //ukupnaSumaPOvrsinaPosto += parseFloat($scope.obj.SumaPovrsinaPosto);

        console.log("ukupnaPovrsinaM2 " + ukupnaPovrsinaM2);
        $scope.ukupnaPovrsinaM2 = ukupnaPovrsinaM2.toFixed(2);
        $scope.ukupnaPovrsinaPosto = ukupnaPovrsinaPosto.toFixed(2);
        $scope.ukupnaSumaPovrsinaM2 = ukupnaSumaPovrsinaM2.toFixed(2);
        $scope.ukupnaSumaPOvrsinaPosto = ukupnaSumaPOvrsinaPosto.toFixed(2);
    }

    // PovrsinaPosto u zgradu za pojedine vrste propadaka (rekapitulacija pripadaka)
    function IzracunajPovrsineZaPripadke() {
        // Izracun PovrsinaPosto za pripatke
        // formula:
        //          PovrsinaM2 (od pripadka) sto je uneseno / suma svih PovrsinaM2 pripadaka iste vrste u zgradi * 100
        // tice se ssam pripadaka koji su na zgradi, nema veze sa stanovima
      

        $scope.obj.Zgrade_Pripadci.forEach(function (pripadak) {
            var ukupnoZaVrtsuPripadka = 0;
            var ukupnoPovrsinaPoVrsti = 0;
            
            if (pripadak.Status != "d")
            {
                $scope.obj.Zgrade_Pripadci.forEach(function (pr) {
                    if (pr.PripadakId == pripadak.PripadakId && pr.Status != "d")
                        ukupnoPovrsinaPoVrsti += parseFloat(pr.PovrsinaM2);
                });

                ukupnoZaVrtsuPripadka += parseFloat(ukupnoPovrsinaPoVrsti);
                console.log("ukupnoZaVrtsuPripadka " + ukupnoZaVrtsuPripadka);
                pripadak.PovrsinaPosto = (parseFloat(pripadak.PovrsinaM2) / ukupnoZaVrtsuPripadka * 100).toFixed(2);
                console.log("pripadak.PovrsinaPosto " + pripadak.PovrsinaPosto);
                console.log("pripadak " + pripadak.PripadakId);
            }
        });
    }

    $scope.goBack = function () {
        $location.path('/zgrade');
    }

}]);