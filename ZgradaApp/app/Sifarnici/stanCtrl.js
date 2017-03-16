angularApp.controller('stanCtrl', ['$scope', '$routeParams', '$location', '$rootScope', '$uibModal', 'DataService', function (
    $scope, $routeParams, $location, $rootScope, $uibModal, DataService) {

    // new item in collection
    //var newItemDio = { Id: 0, StanId: $routeParams.id, Naziv: "", PovrsinaM2: 0, PovrsinaPosto: 0, Koeficijent: 0 }
    //var newItemPripadak = { Id: 0, StanId: $routeParams.id, PripadakId: null, Naziv: "", VrstaNaziv: "", PovrsinaM2: 0, PovrsinaPosto: 0, Koeficijent: 0 }
    //var newItemStanar = { Id: 0, StanId: $routeParams.id, Ime: "", Prezime: "", OIB: "", Email: "", Udjel: 0 }

    if ($routeParams) {
        console.log($routeParams.id); // stanId


        //var zgradaId = DataService.selectedZgradaId; // iz ove je zgrade
        var zgradaId = 4; // iz ove je zgrade
        var _stanovi = []; // treba za pripadak modal

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
                    //IzracunajUkupnePovrsine();
                }
          )
        }
        else {
            $scope.msg = "Dodaj stan" + ", Zgrada: " + _zgrada.Naziv + ", Adresa: " + _zgrada.Adresa;
            $scope.obj = {
                Id: 0, ZgradaId: zgradaId, BrojStana: "", Kat: "", Naziv: "", Oznaka: "", PovrsinaM2: 0, PovrsinaPosto: 0, SumaPovrsinaM2: 0,
                SumaPovrsinaPosto: 0, Napomena: "",
                Stanovi_PosebniDijelovi: [], Stanovi_Pripadci: [], Stanovi_Stanari: [], Stanovi_PrijenosPripadaka: []
            };
        }

        $scope.PovrsinaStanaChanged = function () {
            if (parseFloat($scope.obj.PovrsinaM2) > 0)
                IzracunajPovrsine();
            console.log("PovrsinaStanaChanged");
            
        }

        $scope.save = function () {
            console.log('save fn');
            console.log($scope.obj.PovrsinaM2);
            $scope.obj.ZgradaId = zgradaId;
            $rootScope.loaderActive = true;
            DataService.stanCreateUpdate($scope.obj).then(
                function (result) {
                    // on success
                    if (result.data > 0) {
                        console.log(DataService.listStanovi);
                        $scope.obj.Id = result.data; // insert, vrati Id sa servera, pukni u obj
                        DataService.listStanovi.push($scope.obj); // dodaj u listu
                        console.log(DataService.listStanovi);
                    }
                    else {
                        DataService.listStanovi.forEach(function (obj) {
                            if (obj.Id == result.data)
                                DataService.listStanovi.obj = $scope.obj;
                        })
                    }
                    $rootScope.loaderActive = false;
                    $location.path('/stanovi/' + zgradaId);
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
        //$scope.deleteDio = function (dio) {
        //    var index = $scope.obj.Stanovi_PosebniDijelovi.indexOf(dio)
        //    $scope.obj.Stanovi_PosebniDijelovi.splice(index, 1);
        //}
        
        $scope.deleteStanar = function (stanar) {
            //$scope.obj.Stanovi_Stanari.splice($scope.obj.Stanovi_Stanari.indexOf(stanar), 1);
            stanar.Status = "d";
        }

        $scope.deletePripadak = function (pripadak) {
            $scope.obj.Stanovi_Pripadci.forEach(function (p) {
                if (pripadak.PripadakIZgradaId == p.PripadakIZgradaId) {
                    if($scope.obj.Id == 0)
                        $scope.obj.Stanovi_Pripadci.splice($scope.obj.Stanovi_Pripadci.indexOf(pripadak), 1);
                        // obrisi ga, stan nije snimljen, kod snimanja novog stana, snimaju se svi pripadci
                    else
                        p.Status = "d";
                        // markiraj ga kao deleted, biti ce obrisan iz db-a
                }
                    
            })
        };

        // _________________________________________________________________
        // 
        //                  M O D A L I
        // _________________________________________________________________

        // _________________________
        //      posebni dio
        // _________________________
        //$scope.newItemDio = newItemDio;
        //$scope.openModalDio = function (item) {
        //    var tempObj = {};
        //    angular.copy(item, tempObj);
        //    var modalInstance = $uibModal.open({
        //        templateUrl: '../app/Sifarnici/modals/posebniDioModal.html',
        //        //controller: function ($scope, $uibModalInstance, item) {
        //        //    $scope.item = item;
        //        //},
        //        controller: 'posebniDioModalCtrl',
        //        size: 'lg',
        //        resolve: {
        //            item: function () {
        //                return item;
        //            }
        //        }
        //    });

        //    modalInstance.result.then(function (item) {
        //        console.log(item);
        //        if (item.Id == 0) {
        //            // add new
        //            var maxId = 0;
        //            $scope.obj.Stanovi_PosebniDijelovi.forEach(function (obj) {
        //                if (obj.Id > maxId)
        //                    maxId = obj.Id;
        //            });
        //            item.Id = maxId + 1;
        //            $scope.obj.Stanovi_PosebniDijelovi.push(item);
        //            console.log($scope.obj.Stanovi_PosebniDijelovi);
        //        }
        //        //else {
        //        //    $scope.obj.Stanovi_PosebniDijelovi.forEach(function (dio) {
        //        //        if (dio.Id == item.Id)
        //        //            $scope.obj.Stanovi_PosebniDijelovi.dio = item;
        //        //    });
        //        //}
        //    }, function () {
        //        if (item.Id > 0) {
        //            // vrati objekt u prethodno stanje (tempObj)
        //            $scope.obj.Stanovi_PosebniDijelovi.forEach(function (dio) {
        //                if (dio.Id == item.Id) {
        //                    dio.Naziv = tempObj.Naziv;
        //                    dio.PovrsinaM2 = tempObj.PovrsinaM2;
        //                    dio.PovrsinaPosto = tempObj.PovrsinaPosto
        //                }
        //            });
        //        }
        //    });
        //    $scope.newItemDio = newItemDio;
        //};


        //// _________________________
        ////      pripadci
        //// _________________________
        $scope.newItemPripadak = { Id: 0, StanId: $routeParams.id, PripadakId: null, Naziv: "", VrstaNaziv: "", Koef: 0 };
        $scope.openModalPripadak = function (item) {
            var tempObj = {};
            angular.copy(item, tempObj);
            var modalInstance = $uibModal.open({
                templateUrl: '../app/Sifarnici/modals/pripadakStan.html',
                //controller: function ($scope, $uibModalInstance, item) {
                //    $scope.item = item;
                //},
                controller: 'pripadakStanCtrl',
                size: 'lg',
                resolve: {
                    item: function () {
                        return item;
                    },
                    zgrada: function () {
                        //console.log("_zgrada " + _zgrada);
                        return _zgrada;
                    },
                    stanovi: function () {
                        //console.log("_stanovi " + _stanovi);
                        return _stanovi;
                    },
                    currentStan: function () {
                        return $scope.obj;
                    },
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
                    item.Status = "a";
                    item.StanId = $scope.obj.Id;
                    // ako je VrijediOdMjesec null, nije bilo prijenosta, daj ima current mjesec i godinu
                    if (item.VrijediOdMjesec == null || item.VrijediOdMjesec == undefined)
                    {
                        item.VrijediOdMjesec = new Date().getMonth();
                        item.VrijediOdGodina = new Date().getFullYear();
                    }
                    $scope.obj.Stanovi_Pripadci.push(item);
                    //console.log($scope.obj.Stanovi_Pripadci);

                }
                else {
                //    $scope.obj.Stanovi_Pripadci.forEach(function (dio) {
                //        if (dio.Id == item.Id)
                //            $scope.obj.Stanovi_Pripadci.dio = item;
                    //    });
                    item.Status = "u";
                }

                IzracunajPovrsine(); // proracunaj ponovo povrsine, zbog koeficijenta pripadaka na stanu
            }, function () {
                // modal dismiss
                //$scope.newItemPripadak = { Id: 0, StanId: $routeParams.id, PripadakId: null, Naziv: "", PovrsinaM2: 0, PovrsinaPosto: 0 }
                if (item.Id > 0) {
                    // vrati objekt u prethodno stanje (tempObj)
                    $scope.obj.Stanovi_Pripadci.forEach(function (dio) {
                        if (dio.Id == item.Id) {
                            dio.Naziv = tempObj.Naziv;
                            dio.Koef = tempObj.Koef;
                            Stanovi_PrijenosPripadaka = tempObj.Stanovi_PrijenosPripadaka;
                        }
                    });
                }
            });
            $scope.newItemPripadak = { Id: 0, StanId: $routeParams.id, PripadakId: null, Naziv: "", VrstaNaziv: "", Koef: 0 };
        }; // end of pripadak modal

        // _________________________
        //       stanari
        // _________________________
        $scope.newItemStanar = { Id: 0, StanId: $routeParams.id, Ime: "", Prezime: "", OIB: "", Email: "", Udjel: 0 }
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
            $scope.newItemStanar = { Id: 0, StanId: $routeParams.id, Ime: "", Prezime: "", OIB: "", Email: "", Udjel: 0 };
        }; // end of stanar modal

        //PovrsinaPosto, SumaPovrsinaM2, SumaPovrsinaPosto (za zfradu)
        function IzracunajPovrsine() {
            // // POSTOTCI I SUME SE RACUNAJU, M2 SE SNIMA 

            if (parseFloat($scope.obj.PovrsinaM2) > 0)
            {
                // PovrsinaPosto = PovrsinaM2 od stana / suma svhih PovrsinaM2 od stanova u zgradi  * 100
                var suma_svihPovrsinaM2_uZgradi = 0;
                _stanovi.forEach(function (stan) {
                    if (stan.Id != $scope.obj.Id) {
                        suma_svihPovrsinaM2_uZgradi = parseFloat(suma_svihPovrsinaM2_uZgradi) + parseFloat(stan.PovrsinaM2)
                    }
                });
                suma_svihPovrsinaM2_uZgradi = parseFloat(suma_svihPovrsinaM2_uZgradi) + parseFloat($scope.obj.PovrsinaM2)
                console.log("suma_svihPovrsinaM2_uZgradi: " + suma_svihPovrsinaM2_uZgradi);
                $scope.obj.PovrsinaPosto = parseFloat(parseFloat($scope.obj.PovrsinaM2) / parseFloat(suma_svihPovrsinaM2_uZgradi) * 100).toFixed(2);

                // SumaPovrsinaM2 = PovrsinaM2 (od stana) + (PovrsinaM2 za pojedini pripadak * Koeficijent)
                // ovo ne valja - provjeriiti kako
                var pripadciRez = 0;
                _zgrada.Zgrade_Pripadci.forEach(function (pripadak) {
                    // nadji PovrsinaM2 za svaki pripadak na zgradi
                    // nadji njegov koficijent
                    console.log($scope.obj.Stanovi_Pripadci);
                    $scope.obj.Stanovi_Pripadci.forEach(function (pripadakUStanu) {
                        if (pripadak.Id == pripadakUStanu.PripadakIZgradaId)
                            pripadciRez += parseFloat(pripadak.PovrsinaM2) * (parseFloat(pripadakUStanu.Koef) / 100 );

                    });
                });
                console.log("pripadciRez: " + pripadciRez);
                $scope.obj.SumaPovrsinaM2 = parseFloat(parseFloat($scope.obj.PovrsinaM2) + parseFloat(pripadciRez)).toFixed(2);

                // SumaPovrsinaPosto = SumaPovrsinaM2 (za stan) / suma svih  SumaPovrsinaM2 u zgradi * 100
                var suma_svihSumaPovrsinaM2_uZgradi = 0;
                _stanovi.forEach(function (stan) {
                    if (stan.Id != $scope.obj.Id) {
                        suma_svihSumaPovrsinaM2_uZgradi = parseFloat(suma_svihSumaPovrsinaM2_uZgradi) + parseFloat(stan.SumaPovrsinaM2)
                    }
                });
                suma_svihSumaPovrsinaM2_uZgradi = parseFloat(suma_svihSumaPovrsinaM2_uZgradi) + parseFloat($scope.obj.SumaPovrsinaM2)
                $scope.obj.SumaPovrsinaPosto = parseFloat(parseFloat($scope.obj.SumaPovrsinaM2) / parseFloat(suma_svihSumaPovrsinaM2_uZgradi) * 100).toFixed(2);
            }

            

            //IzracunajUkupnePovrsine();
        }

        
        $scope.getData = function (PripadakIZgradaId) {
            var o = {};
            //console.log("PripadakIZgradaId: " + PripadakIZgradaId);
            _zgrada.Zgrade_Pripadci.forEach(function (pripadakIzZgrade) {
                if (PripadakIZgradaId == pripadakIzZgrade.Id) {
                    //console.log('pripadakIzZgrade');
                    //console.log(pripadakIzZgrade);
                    o = pripadakIzZgrade;
                }
                    
            });
            var ret = { VrstaNaziv: o.VrstaNaziv, Naziv: o.Naziv, PovrsinaM2: o.PovrsinaM2, PovrsinaPosto: o.PovrsinaPosto };

            //var o = { Vrsta: "a", Naziv: "b" }
            return ret;
        }

    }; // if ($routeParams)
}]);