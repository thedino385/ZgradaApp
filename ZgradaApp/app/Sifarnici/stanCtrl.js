angularApp.controller('stanCtrl', ['$scope', '$routeParams', '$location', '$rootScope', '$uibModal', 'DataService', function (
    $scope, $routeParams, $location, $rootScope, $uibModal, DataService) {

    // new item in collection
    var newItemDio = { Id: 0, StanId: $routeParams.id, Naziv: "", PovrsinaM2: 0, PovrsinaPosto: 0, Koeficijent: 0 }
    var newItemPripadak = { Id: 0, StanId: $routeParams.id, PripadakId: null, Naziv: "", VrstaNaziv: "", PovrsinaM2: 0, PovrsinaPosto: 0, Koeficijent: 0 }
    var newItemStanar = { Id: 0, StanId: $routeParams.id, Ime: "", Prezime: "", OIB: "", Email: "", Udjel: 0 }

    if ($routeParams) {
        console.log($routeParams.id); // stanId

        

        var zgradaId = DataService.selectedZgradaId; // iz ove je zgrade
        var _stanovi = [];

        var _pripadci = [];
        DataService.getPripadci().then(function (result) {
            _pripadci = result;
            //nsole.log('pripadci: ' + pripadci);
        });

        var _zgrada = {};
        DataService.getZgrade().then(function (zgrade) {
            zgrade.forEach(function (zgrada) {
                if (zgradaId == zgrada.Id)
                    _zgrada = zgrada;
            })
        }
        )

        //var stanovi = DataService.getStanovi();
        console.log(_zgrada);

        if ($routeParams.id > 0) {
            //$scope.msg = "Uredi stan";
            DataService.getStanovi().then(
                function (stanovi) {
                    stanovi.forEach(function (obj) {
                        if (obj.ZgradaId == zgradaId) {
                            _stanovi.push(obj);
                        }

                        if ($routeParams.id == obj.Id) {
                            $scope.obj = obj;
                            $scope.msg = "Stan: " + $scope.obj.Naziv + ", Zgrada: " + _zgrada.Naziv + ", Adresa: " + _zgrada.Adresa + ", Površina: " + _zgrada.Povrsinam2;
                        }
                    });
                    IzracunajUkupnePovrsine();
                }
          )
        }
        else {
            $scope.msg = "Dodaj stan" + ", Zgrada: " + _zgrada.Naziv + ", Adresa: " + _zgrada.Adresa;
            $scope.obj = {
                Id: 0, ZgradaId: zgradaId, Naziv: "", PovrsinaM2: 0, PovrsinaPosto: 0, Povrsinam2: 0, SumaPovrsinaM2: 0, SumaPovrsinaPosto: 0,
                Stanovi_PosebniDijelovi: [], Stanovi_Pripadci: [], Stanovi_Stanari: []
            };
        }

        $scope.PovrsinaStanaChanged = function () {
            if (parseFloat($scope.obj.PovrsinaM2) > 0)
                IzracunajPovrsine();
            console.log("PovrsinaStanaChanged");
            
        }

        $scope.save = function () {
            console.log('save fn');
            $scope.obj.ZgradaId = zgradaId;
            $rootScope.loaderActive = true;
            DataService.stanCreateUpdate($scope.obj).then(
                function (result) {
                    // on success
                    if (result.data > 0) {
                        $scope.obj.Id = result.data; // insert, vrati Id sa servera, pukni u obj
                        DataService.listStanovi.push($scope.obj); // dodaj u listu
                    }
                    else {
                        DataService.listStanovi.forEach(function (obj) {
                            if (obj.Id == result.data)
                                DataService.listStanovi.obj = $scope.obj;
                        })
                    }
                    $rootScope.loaderActive = false;
                    $location.path('/stanovi/' + zgradaId);
                    console.log(DataService.listStanovi);
                },
                function (result) {
                    // on error
                    $rootScope.errMsg = result.Message;
                }
            )
        }

        $scope.backToStanovi = function () {
            console.log(zgradaId + " stan back to stanovi");
            $location.path('/stanovi/' + zgradaId);
        }

        // _________________________________________________________________
        //
        //                  D E L E T E FNs
        // _________________________________________________________________
        $scope.deleteDio = function (dio) {
            var index = $scope.obj.Stanovi_PosebniDijelovi.indexOf(dio)
            $scope.obj.Stanovi_PosebniDijelovi.splice(index, 1);
        }
        $scope.deletePripadak = function (pripadak) {
            $scope.obj.Stanovi_Pripadci.splice($scope.obj.Stanovi_Pripadci.indexOf(pripadak), 1);
            IzracunajPovrsineZaPripadke();
            IzracunajPovrsine();
        }
        $scope.deleteStanar = function (stanar) {
            $scope.obj.Stanovi_Stanari.splice($scope.obj.Stanovi_Stanari.indexOf(stanar), 1);
        }



        // _________________________________________________________________
        // 
        //                  M O D A L I
        // _________________________________________________________________

        // _________________________
        //      posebni dio
        // _________________________
        $scope.newItemDio = newItemDio;
        $scope.openModalDio = function (item) {
            var tempObj = {};
            angular.copy(item, tempObj);
            var modalInstance = $uibModal.open({
                templateUrl: '../app/Sifarnici/modals/posebniDioModal.html',
                //controller: function ($scope, $uibModalInstance, item) {
                //    $scope.item = item;
                //},
                controller: 'posebniDioModalCtrl',
                size: 'lg',
                resolve: {
                    item: function () {
                        return item;
                    }
                }
            });

            modalInstance.result.then(function (item) {
                console.log(item);
                if (item.Id == 0) {
                    // add new
                    var maxId = 0;
                    $scope.obj.Stanovi_PosebniDijelovi.forEach(function (obj) {
                        if (obj.Id > maxId)
                            maxId = obj.Id;
                    });
                    item.Id = maxId + 1;
                    $scope.obj.Stanovi_PosebniDijelovi.push(item);
                    console.log($scope.obj.Stanovi_PosebniDijelovi);
                }
                //else {
                //    $scope.obj.Stanovi_PosebniDijelovi.forEach(function (dio) {
                //        if (dio.Id == item.Id)
                //            $scope.obj.Stanovi_PosebniDijelovi.dio = item;
                //    });
                //}
            }, function () {
                if (item.Id > 0) {
                    // vrati objekt u prethodno stanje (tempObj)
                    $scope.obj.Stanovi_PosebniDijelovi.forEach(function (dio) {
                        if (dio.Id == item.Id) {
                            dio.Naziv = tempObj.Naziv;
                            dio.PovrsinaM2 = tempObj.PovrsinaM2;
                            dio.PovrsinaPosto = tempObj.PovrsinaPosto
                        }
                    });
                }
            });
            $scope.newItemDio = newItemDio;
        };


        // _________________________
        //      pripadci
        // _________________________
        $scope.newItemPripadak = { Id: 0, StanId: $routeParams.id, PripadakId: null, Naziv: "", VrstaNaziv: "", PovrsinaM2: 0, PovrsinaPosto: 0, Koeficijent: 0 };
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
                resolve: {
                    item: function () {
                        return item;
                    },
                    pripadci: function () {
                        console.log("pripadci " + _pripadci);
                        return _pripadci;
                    },
                    stanovi: function () {
                        console.log("_stanovi " + _stanovi);
                        return _stanovi;
                    },
                    currentStan: function () {
                        return $scope.obj;
                    }
                }
            });

            modalInstance.result.then(function (item) {
                console.log("modal result fn");
                if (item.Id == 0) {
                    // add new
                    var maxId = 0;
                    $scope.obj.Stanovi_Pripadci.forEach(function (obj) {
                        if (obj.Id > maxId)
                            maxId = obj.Id;
                    });
                    item.Id = maxId + 1;

                    $scope.obj.Stanovi_Pripadci.push(item);

                }
                //else {
                //    $scope.obj.Stanovi_Pripadci.forEach(function (dio) {
                //        if (dio.Id == item.Id)
                //            $scope.obj.Stanovi_Pripadci.dio = item;
                //    });
                //}

                // tu
                IzracunajPovrsineZaPripadke();
                IzracunajPovrsine();
            }, function () {
                // modal dismiss
                //$scope.newItemPripadak = { Id: 0, StanId: $routeParams.id, PripadakId: null, Naziv: "", PovrsinaM2: 0, PovrsinaPosto: 0 }
                if (item.Id > 0) {
                    // vrati objekt u prethodno stanje (tempObj)
                    $scope.obj.Stanovi_Pripadci.forEach(function (dio) {
                        if (dio.Id == item.Id) {
                            dio.Naziv = tempObj.Naziv;
                            dio.PovrsinaM2 = tempObj.PovrsinaM2;
                            dio.PovrsinaPosto = tempObj.PovrsinaPosto
                        }

                    });
                }
            });
            $scope.newItemPripadak = { Id: 0, StanId: $routeParams.id, PripadakId: null, Naziv: "", VrstaNaziv: "", PovrsinaM2: 0, PovrsinaPosto: 0, Koeficijent: 0 };
        }; // end of pripadak modal

        // _________________________
        //       stanari
        // _________________________
        $scope.newItemStanar = newItemStanar;
        $scope.openModalStanar = function (item) {
            var tempObj = {};
            angular.copy(item, tempObj);
            console.log(item);
            var modalInstance = $uibModal.open({
                templateUrl: '../app/Sifarnici/modals/stanarModal.html',
                //controller: function ($scope, $uibModalInstance, item) {
                //    $scope.item = item;
                //},
                controller: 'stanarModalCtrl',
                size: 'lg',
                resolve: {
                    item: function () {
                        return item;
                    },
                }
            });

            modalInstance.result.then(function (item) {
                console.log("modal result fn");
                if (item.Id == 0) {
                    // add new
                    var maxId = 0;
                    $scope.obj.Stanovi_Stanari.forEach(function (obj) {
                        if (obj.Id > maxId)
                            maxId = obj.Id;
                    });
                    item.Id = maxId + 1;
                    $scope.obj.Stanovi_Stanari.push(item);
                    console.log($scope.obj.Stanovi_Stanari);
                }
            }, function () {
                // modal dismiss
                if (item.Id > 0) {
                    // vrati objekt u prethodno stanje (tempObj)
                    $scope.obj.Stanovi_Stanari.forEach(function (stanar) {
                        if (stanar.Id == item.Id) {
                            stanar.Ime = tempObj.Ime;
                            stanar.Prezime = tempObj.Prezime;
                            stanar.OIB = tempObj.OIB;
                            stanar.Email = tempObj.Email;
                            stanar.Udjel = tempObj.Udjel;
                        }

                    });
                }
            });
            $scope.newItemStanar = newItemStanar;
        }; // end of stanar modal

        //PovrsinaPosto, SumaPovrsinaM2, SumaPovrsinaPosto (za zfradu)
        function IzracunajPovrsine() {
            // // POSTOTCI I SUME SE RACUNAJU, M2 SE SNIMA 

            // provjeri


            // PovrsinaPosto = PovrsinaM2 od stana / suma svhih PovrsinaM2 u zgradi  * 100
            var suma_svihPovrsinaM2_uZgradi = 0;
            _stanovi.forEach(function (stan) {
                if (stan.Id != $scope.obj.Id) {
                    suma_svihPovrsinaM2_uZgradi = parseFloat(suma_svihPovrsinaM2_uZgradi) + parseFloat(stan.PovrsinaM2)
                }
            });
            suma_svihPovrsinaM2_uZgradi = parseFloat(suma_svihPovrsinaM2_uZgradi) + parseFloat($scope.obj.PovrsinaM2)
            console.log("suma_svihPovrsinaM2_uZgradi: " + suma_svihPovrsinaM2_uZgradi);
            $scope.obj.PovrsinaPosto = parseFloat(parseFloat($scope.obj.PovrsinaM2) / parseFloat(suma_svihPovrsinaM2_uZgradi) * 100).toFixed(2);

            // SumaPovrsinaM2 = Povrsina stana + (suma povrsina svih pripadaka / 2)
            // ovo ne valja - provjeriiti kako
            var sumaPovrsinapripadaka = 0;
            $scope.obj.Stanovi_Pripadci.forEach(function (pripadak) {
                sumaPovrsinapripadaka = parseFloat(sumaPovrsinapripadaka) + parseFloat(pripadak.PovrsinaM2);
            });
            $scope.obj.SumaPovrsinaM2 = parseFloat(parseFloat($scope.obj.PovrsinaM2) + parseFloat(sumaPovrsinapripadaka) / 2).toFixed(2);

            // SumaPovrsinaPosto = SumaPovrsinaM2 (za stan) / suma svih  SumaPovrsinaM2 u zgradi * 100
            var suma_svihSumaPovrsinaM2_uZgradi = 0;
            _stanovi.forEach(function (stan) {
                if (stan.Id != $scope.obj.Id) {
                    suma_svihSumaPovrsinaM2_uZgradi = parseFloat(suma_svihSumaPovrsinaM2_uZgradi) + parseFloat(stan.SumaPovrsinaM2)
                }
            });
            suma_svihSumaPovrsinaM2_uZgradi = parseFloat(suma_svihSumaPovrsinaM2_uZgradi) + parseFloat($scope.obj.SumaPovrsinaM2)
            $scope.obj.SumaPovrsinaPosto = parseFloat(parseFloat($scope.obj.SumaPovrsinaM2) / parseFloat(suma_svihSumaPovrsinaM2_uZgradi) * 100).toFixed(2);

            IzracunajUkupnePovrsine();
        }

        $scope.ukupnaPovrsinaM2 = 0;
        $scope.ukupnaPovrsinaPosto = 0;
        $scope.ukupnaSumaPovrsinaM2 = 0;
        $scope.ukupnaSumaPOvrsinaPosto = 0;
        // Ukupne povrsine za zfradu
        function IzracunajUkupnePovrsine() {
            var ukupnaPovrsinaM2 = 0;
            var ukupnaPovrsinaPosto = 0;
            var ukupnaSumaPovrsinaM2 = 0;
            var ukupnaSumaPOvrsinaPosto = 0;

            console.log("IzracunajUkupnePovrsine");
            // Ukupno PovrsinaM2

            _stanovi.forEach(function (stan) {
                if (stan.Id != $scope.obj.Id) {
                    // ne zbraja vrijednosti od stana iz arraya, uzmi ih direktno da ne zbrajas dva puta
                    ukupnaPovrsinaM2 += parseFloat(stan.PovrsinaM2);
                    ukupnaPovrsinaPosto += parseFloat(stan.PovrsinaPosto);
                    ukupnaSumaPovrsinaM2 += parseFloat(stan.SumaPovrsinaM2);
                    ukupnaSumaPOvrsinaPosto += parseFloat(stan.SumaPovrsinaPosto);
                }
            });

            console.log($scope.obj);

            ukupnaPovrsinaM2 += parseFloat($scope.obj.PovrsinaM2);
            ukupnaPovrsinaPosto += parseFloat($scope.obj.PovrsinaPosto);
            ukupnaSumaPovrsinaM2 += parseFloat($scope.obj.SumaPovrsinaM2);
            ukupnaSumaPOvrsinaPosto += parseFloat($scope.obj.SumaPovrsinaPosto);

            console.log(ukupnaPovrsinaM2);
            $scope.ukupnaPovrsinaM2 = ukupnaPovrsinaM2.toFixed(2);
            $scope.ukupnaPovrsinaPosto = ukupnaPovrsinaPosto.toFixed(2);
            $scope.ukupnaSumaPovrsinaM2 = ukupnaSumaPovrsinaM2.toFixed(2);
            $scope.ukupnaSumaPOvrsinaPosto = ukupnaSumaPOvrsinaPosto.toFixed(2);
        }

        // PovrsinaPosto u zgradu za pojedine vrste propadaka (rekapitulacija pripadaka)
        function IzracunajPovrsineZaPripadke()
        {
            // Izracun PovrsinaPosto za pripatke
            // formula:
            //          PovrsinaM2 (od pripadka) sto je uneseno / suma svih PovrsinaM2 pripadaka iste vrste u zgradi * 100

            $scope.obj.Stanovi_Pripadci.forEach(function (pripadak) {
                var ukupnoZaVrtsuPripadka = 0;
                var ukupnoPovrsinaPoVrsti = 0;
                $scope.obj.Stanovi_Pripadci.forEach(function (pr) {
                    if (pr.PripadakId == pripadak.PripadakId)
                        ukupnoPovrsinaPoVrsti += parseFloat(pr.PovrsinaM2);
                });

                _stanovi.forEach(function (stan) {
                    if (stan.Id != $scope.obj.Id) {
                        stan.Stanovi_Pripadci.forEach(function (p) {
                            if (p.PripadakId == pripadak.PripadakId)
                                ukupnoZaVrtsuPripadka += parseFloat(p.PovrsinaM2);
                        })
                    }
                });
                console.log("ukupnoPovrsinaPoVrsti " + ukupnoPovrsinaPoVrsti);
                ukupnoZaVrtsuPripadka += parseFloat(ukupnoPovrsinaPoVrsti);
                console.log("ukupnoZaVrtsuPripadka " + ukupnoZaVrtsuPripadka);
                pripadak.PovrsinaPosto = parseFloat(parseFloat(pripadak.PovrsinaM2) / ukupnoZaVrtsuPripadka * 100).toFixed(2);
                console.log("pripadak " + pripadak.PripadakId);
            });
        }

    }; // if ($routeParams)
}]);