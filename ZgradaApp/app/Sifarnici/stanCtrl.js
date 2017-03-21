angularApp.controller('stanCtrl', ['$scope', '$routeParams', '$location', '$rootScope', '$uibModal', 'toastr', 'DataService', function (
    $scope, $routeParams, $location, $rootScope, $uibModal, toastr,  DataService) {

    if ($routeParams) {
        console.log($routeParams.id); // stanId

        if (DataService.selectedStan == null) {
            $location.path('/zgrade');
            return;
        }
            

        var zgradaId = DataService.selectedStan.ZgradaId; // iz ove je zgrade

        //var zgradaId = 4; // iz ove je zgrade
        //var _stanovi = []; // treba za pripadak modal

        var _pripadci = [];
        var _posebniDijelovi = [];
        var _zgradePripadci = [];
        $scope.tablePovrisne = [];
        

        //DataService.getPripadci().then(function (result) {
        //    _pripadci = result;
        //    //nsole.log('pripadci: ' + pripadci);
        //});

        //var _zgrada = {};
        //DataService.getZgrade().then(function (zgrade) {
        //    zgrade.forEach(function (zgrada) {
        //        if (zgradaId == zgrada.Id)
        //            _zgrada = zgrada;
        //    })
        //}
        //)


        // _____ $scope.obj je zgrada
        // _____ $scope.stan je trazeni stan


        if ($routeParams.id > 0) {
            DataService.getZgrada(zgradaId).then(
                function (result) {
                    // on success
                    $scope.obj = result.data;
                    $rootScope.loaderActive = false;
                    $scope.obj.Stanovi.forEach(function (stan) {
                        _zgradePripadci = $scope.obj.Zgrade_Pripadci;
                        if ($routeParams.id == stan.Id) {
                            $scope.stan = stan;
                            IzracunajPovrsineNG();
                        }
                    });
                    $scope.msg = "Stan: " + $scope.stan.Naziv + ", Zgrada: " + $scope.obj.Naziv + ", Adresa: " + $scope.obj.Adresa + ", Površina: " + $scope.obj.Povrsinam2;

                    $rootScope.loaderActive = true;
                    DataService.getPripadci().then(
                        function (result) {
                            // on success
                            _pripadci = result.data;
                            $rootScope.loaderActive = false;
                        },
                        function (result) {
                            // on errr
                            $rootScope.errMsg = result.Message;
                        }
                    )
                    $rootScope.loaderActive = true;
                    DataService.getPosebiDijelovi().then(
                        function (result) {
                            // on success
                            _posebniDijelovi = result.data;
                            $rootScope.loaderActive = false;
                        },
                        function (result) {
                            // on errr
                            $rootScope.errMsg = result.Message;
                        }
                    )
                },
                function (result) {
                    // on errr
                    alert(result.Message);
                    $rootScope.errMsg = result.Message;
                }
            );


          //  DataService.getStanovi().then(
          //      function (stanovi) {
          //          stanovi.forEach(function (obj) {
          //              if (obj.ZgradaId == zgradaId) {
          //                  _stanovi.push(obj);
          //              }

          //              if ($routeParams.id == obj.Id) {
          //                  $scope.obj = obj;
          //                  $scope.msg = "Stan: " + $scope.obj.Naziv + ", Zgrada: " + _zgrada.Naziv + ", Adresa: " + _zgrada.Adresa + ", Površina: " + _zgrada.Povrsinam2;
          //              }
          //          });
          //          //IzracunajUkupnePovrsine();
          //      }
          //)
        }
        else {
            $scope.msg = "Dodaj stan" + ", Zgrada: " + $scope.obj.Naziv + ", Adresa: " + $scope.obj.Adresa;
            $scope.stan = {
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
            $scope.obj.ZgradaId = zgradaId;
            $rootScope.loaderActive = true;
            DataService.stanCreateUpdate($scope.stan).then(
                function (result) {
                    // on success
                    //if (result.data > 0) {
                    //    console.log(DataService.listStanovi);
                    //    $scope.obj.Id = result.data; // insert, vrati Id sa servera, pukni u obj
                    //    //DataService.listStanovi.push($scope.obj); // dodaj u listu
                    //    console.log(DataService.listStanovi);
                    //}
                    //else {
                    //    DataService.listStanovi.forEach(function (obj) {
                    //        if (obj.Id == result.data)
                    //            DataService.listStanovi.obj = $scope.obj;
                    //    })
                    //}
                    $rootScope.loaderActive = false;
                    toastr.success('Promjene su snimljene!', '');
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
        $scope.deleteDio = function (dio) {
            //var index = $scope.stan.Stanovi_PosebniDijelovi.indexOf(dio)
            //$scope.stan.Stanovi_PosebniDijelovi.splice(index, 1);
            dio.Status = "d";
        }
        
        $scope.deleteStanar = function (stanar) {
            //$scope.obj.Stanovi_Stanari.splice($scope.obj.Stanovi_Stanari.indexOf(stanar), 1);
            stanar.Status = "d";
        }

        $scope.deletePripadak = function (pripadak) {
            $scope.stan.Stanovi_Pripadci.forEach(function (p) {
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
        $scope.newItemDio = { Id: 0, StanId: 0, Oznaka: "", PosebniDioId: null, PovrsinaM2: 0, Koef: 0, PovrsinaSaKoef: 0 };
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
                    },
                    posebniDijelovi: function () {
                        return _posebniDijelovi;
                    }
                }
            });

            modalInstance.result.then(function (item) {
                console.log(item);
                if (item.Id == 0) {
                    // add new
                    var maxId = 0;
                    $scope.stan.Stanovi_PosebniDijelovi.forEach(function (obj) {
                        if (obj.Id > maxId)
                            maxId = obj.Id;
                    });
                    item.Id = maxId + 1;
                    item.StanId = $scope.stan.Id;
                    item.Status = "a";
                    $scope.stan.Stanovi_PosebniDijelovi.push(item);
                    //console.log($scope.obj.Stanovi_PosebniDijelovi);
                }
                else {
                //    $scope.obj.Stanovi_PosebniDijelovi.forEach(function (dio) {
                //        if (dio.Id == item.Id)
                //            $scope.obj.Stanovi_PosebniDijelovi.dio = item;
                //    });
                    item.Status = "u";
                }
                IzracunajPovrsineNG();
            }, function () {
                if (item.Id > 0) {
                    // vrati objekt u prethodno stanje (tempObj)
                    $scope.stan.Stanovi_PosebniDijelovi.forEach(function (dio) {
                        if (dio.Id == item.Id) {
                            dio.PosebniDioId = tempObj.PosebniDioId;
                            dio.Oznaka = tempObj.Oznaka;
                            dio.PovrsinaM2 = tempObj.PovrsinaM2;
                            dio.Koef = tempObj.Koef;
                            dio.PovrsinaSaKoef = tempObj.PovrsinaSaKoef;
                        }
                    });
                }
            });
            $scope.newItemDio = { Id: 0, StanId: 0, Oznaka: "", PosebniDioId: null, PovrsinaM2: 0, Koef: 0, PovrsinaSaKoef: 0 };
        };


        //// _________________________
        ////      pripadci
        //// _________________________
        $scope.newItemPripadak = { Id: 0, StanId: $routeParams.id, PripadakId: null, Naziv: "", VrstaNaziv: "", Koef: 0, PovrsinaSaKef: 0 };
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
                backdrop: 'static',
                keyboard: false,
                resolve: {
                    item: function () {
                        return item;
                    },
                    zgrada: function () {
                        //console.log("_zgrada " + _zgrada);
                        return $scope.obj;
                    },
                    stanovi: function () {
                        //console.log("_stanovi " + _stanovi);
                        return $scope.obj.Stanovi;
                    },
                    currentStan: function () {
                        return $scope.stan;
                    }
                }
            });

            modalInstance.result.then(function (item) {
                console.log("modal result fn");
                if (item.Id == 0) {
                    // add new
                    var maxId = 0;
                    $scope.stan.Stanovi_Pripadci.forEach(function (obj) {
                        if (obj.Id > maxId)
                            maxId = obj.Id;
                    });
                    item.Id = maxId + 1;
                    item.Status = "a";
                    item.StanId = $scope.stan.Id;
                    // ako je VrijediOdMjesec null, nije bilo prijenosta, daj ima current mjesec i godinu
                    if (item.VrijediOdMjesec == null || item.VrijediOdMjesec == undefined)
                    {
                        item.VrijediOdMjesec = new Date().getMonth();
                        item.VrijediOdGodina = new Date().getFullYear();
                    }
                    $scope.stan.Stanovi_Pripadci.push(item);
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
                    $scope.stan.Stanovi_Pripadci.forEach(function (dio) {
                        if (dio.Id == item.Id) {
                            dio.Naziv = tempObj.Naziv;
                            dio.Koef = tempObj.Koef;
                            dio.PovrsinaSaKef = tempObj.PovrsinaSaKef;
                            Stanovi_PrijenosPripadaka = tempObj.Stanovi_PrijenosPripadaka;
                        }
                    });
                }
            });
            $scope.newItemPripadak = { Id: 0, StanId: $routeParams.id, PripadakId: null, Naziv: "", VrstaNaziv: "", Koef: 0, PovrsinaSaKef: 0 };
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
                backdrop: 'static',
                keyboard: false,
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
                    $scope.stan.Stanovi_Stanari.forEach(function (obj) {
                        if (obj.Id > maxId)
                            maxId = obj.Id;
                    });
                    item.Id = maxId + 1;
                    $scope.stan.Stanovi_Stanari.push(item);
                    item.Status = "a";
                }
                else { item.Status = "u"; }

            }, function () {
                // modal dismiss
                if (item.Id > 0) {
                    // vrati objekt u prethodno stanje (tempObj)
                    $scope.stan.Stanovi_Stanari.forEach(function (stanar) {
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
                $scope.stan.Stanovi.forEach(function (stan) {
                    if (stan.Id != $scope.obj.Id) {
                        suma_svihPovrsinaM2_uZgradi = parseFloat(suma_svihPovrsinaM2_uZgradi) + parseFloat(stan.PovrsinaM2)
                    }
                });
                suma_svihPovrsinaM2_uZgradi = parseFloat(suma_svihPovrsinaM2_uZgradi) + parseFloat($scope.obj.PovrsinaM2)
                console.log("suma_svihPovrsinaM2_uZgradi: " + suma_svihPovrsinaM2_uZgradi);
                $scope.stan.PovrsinaPosto = parseFloat(parseFloat($scope.obj.PovrsinaM2) / parseFloat(suma_svihPovrsinaM2_uZgradi) * 100).toFixed(2);

                // SumaPovrsinaM2 = PovrsinaM2 (od stana) + (PovrsinaM2 za pojedini pripadak * Koeficijent)
                // ovo ne valja - provjeriiti kako
                var pripadciRez = 0;
                $scope.obj.Zgrade_Pripadci.forEach(function (pripadak) {
                    // nadji PovrsinaM2 za svaki pripadak na zgradi
                    // nadji njegov koficijent
                    console.log($scope.obj.Stanovi_Pripadci);
                    $scope.stan.Stanovi_Pripadci.forEach(function (pripadakUStanu) {
                        if (pripadak.Id == pripadakUStanu.PripadakIZgradaId)
                            pripadciRez += parseFloat(pripadak.PovrsinaM2) * (parseFloat(pripadakUStanu.Koef) / 100 );

                    });
                });
                console.log("pripadciRez: " + pripadciRez);
                $scope.stan.SumaPovrsinaM2 = parseFloat(parseFloat($scope.obj.PovrsinaM2) + parseFloat(pripadciRez)).toFixed(2);

                // SumaPovrsinaPosto = SumaPovrsinaM2 (za stan) / suma svih  SumaPovrsinaM2 u zgradi * 100
                var suma_svihSumaPovrsinaM2_uZgradi = 0;
                $scope.stan.Stanovi.forEach(function (stan) {
                    if (stan.Id != $scope.stan.Id) {
                        suma_svihSumaPovrsinaM2_uZgradi = parseFloat(suma_svihSumaPovrsinaM2_uZgradi) + parseFloat(stan.SumaPovrsinaM2)
                    }
                });
                suma_svihSumaPovrsinaM2_uZgradi = parseFloat(suma_svihSumaPovrsinaM2_uZgradi) + parseFloat($scope.obj.SumaPovrsinaM2)
                $scope.stan.SumaPovrsinaPosto = parseFloat(parseFloat($scope.obj.SumaPovrsinaM2) / parseFloat(suma_svihSumaPovrsinaM2_uZgradi) * 100).toFixed(2);
            }
        }

        function IzracunajPovrsineNG() {
            // novi nacin - povrsonaM2 Povrsina sa koeficijentom
            var totalM2 = 0;
            var totalM2Koef = 0;
            var total = 0;

            var o = { };
            var tablePovrsine = [];

            $scope.stan.Stanovi_PosebniDijelovi.forEach(function (dio) {
                o = { class: "", Oznaka: "", PovrsinaM2: 0, Koef: 0, PovrsinaSaKoef: 0, Ukupno: 0 };
                o.class = 'info';
                o.Oznaka = dio.Oznaka;
                o.PovrsinaM2 = dio.PovrsinaM2;
                o.Koef = dio.Koef;
                o.PovrsinaSaKoef = dio.PovrsinaSaKoef;
                o.Ukupno = dio.PovrsinaM2 + dio.PovrsinaSaKoef;
                tablePovrsine.push(o);
                totalM2 += parseFloat(dio.PovrsinaM2);
                totalM2Koef += parseFloat(dio.PovrsinaSaKoef);
            });
            $scope.stan.Stanovi_Pripadci.forEach(function (sp) {
                console.log(sp);
                o = { class: "", Oznaka: "", PovrsinaM2: 0, Koef: 0, PovrsinaSaKoef: 0, Ukupno: 0 };
                o.class = 'warning';
                _zgradePripadci.forEach(function (zp) {
                    //console.log(sp.PripadakIZgradaId + " " + zp.Id);
                    if (sp.PripadakIZgradaId == zp.Id) {
                        o.Oznaka = zp.Naziv;
                        o.PovrsinaM2 = zp.PovrsinaM2;
                        totalM2 += parseFloat(zp.PovrsinaM2);
                    }
                });
                o.Koef = sp.Koef;
                o.PovrsinaSaKoef = sp.PovrsinaSaKef;
                o.Ukupno = o.PovrsinaM2 + sp.PovrsinaSaKef;
                tablePovrsine.push(o);
                totalM2Koef += parseFloat(sp.PovrsinaSaKef);
            });
            console.log("totalM2Koef " + totalM2Koef);
            $scope.totalM2 = totalM2;
            $scope.totalM2Koef = totalM2Koef;
            $scope.total = totalM2 + totalM2Koef;
            $scope.tablePovrisne = tablePovrsine;
        }
        
        $scope.getData = function (PripadakIZgradaId) {
            var o = {};
            $scope.obj.Zgrade_Pripadci.forEach(function (pripadakIzZgrade) {
                if (PripadakIZgradaId == pripadakIzZgrade.Id) {
                    o = pripadakIzZgrade;
                }
            });
            var ret = { VrstaNaziv: o.VrstaNaziv, Naziv: o.Naziv, PovrsinaM2: o.PovrsinaM2, PovrsinaPosto: o.PovrsinaPosto };
            return ret;
        }

        $scope.getDataDio = function (dioId) {
            var o = {};
            _posebniDijelovi.forEach(function (d) {
                if (d.Id == dioId)
                    o = d;
            });
            return o;
        }

      

    }; // if ($routeParams)
}]);