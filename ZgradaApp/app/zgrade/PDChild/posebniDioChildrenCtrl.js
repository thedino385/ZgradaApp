angularApp.controller('posebniDioChildrenCtrl', ['$scope', '$routeParams', '$location', '$rootScope', 'toastr', 'DataService', '$mdDialog',
    function ($scope, $routeParams, $location, $rootScope, toastr, DataService, $mdDialog) {

        $scope.msg = '';
        $scope.dodajVlasnikeBtnDisabled = false;
        if (DataService.selZgradaId == null) {
            $location.path('/zgrade');
            return;
        }

        $scope.isVlasniciCollapsed = true;
        $scope.nePrikazujZatvorene = true;
        $scope.cb = true;

        //if ($routeParams) {
        //if ($routeParams.id > 0) { // pa uvijek ce i biti, master postoji
        // nadji posebniDioMaster
        $rootScope.loaderActive = true;
        DataService.getZgrada(DataService.selZgradaId, false, false).then(
            function (result) {
                console.log(result);
                result.data.Zgrada.Zgrade_PosebniDijeloviMaster.forEach(function (pdMaster) {
                    if (pdMaster.Id == $routeParams.id) {
                        $scope.pdMaster = pdMaster;
                        $scope.msg = pdMaster.Naziv + ' ' + pdMaster.Oznaka;

                        // da li se mogu dodati vlasnici, ne smije biti aktivan period, there can be only one
                        pdMaster.Zgrade_PosebniDijeloviMaster_VlasniciPeriod.forEach(function (period) {
                            if (period.Ugasen != true)
                                $scope.dodajVlasnikeBtnDisabled = true;
                        });
                    }
                });
                $scope.stanari = DataService.zgradaUseri;
                $rootScope.loaderActive = false;
            },
            function (result) {
                $rootScope.loaderActive = false;
                toastr.error('Dohvat podataka sa servera nije uspiio.');
            }
        );


        //}
        //else {
        //    $scope.msg = "Nova zgrada";
        //    $scope.zgradaObj = {
        //        Id: 0, Naziv: "", Adresa: "", Mjesto: "", Povrsinam2: 0, Zgrade_PosebniDijelovi: [], Zgrade_Stanari: [], Status: ''
        //    };
        //}
        //}

        // _________________________________________________________
        //              Modal posebni dio
        // _________________________________________________________
        $scope.openModalPosebniDioChild = function (id) {
            $mdDialog.show({
                controller: 'posebniDioChildModalCtrl',
                templateUrl: 'app/zgrade/PDChild/posebniDioChildModal.html',
                //parent: angular.element(document.body),
                //targetEvent: ev,
                clickOutsideToClose: false,
                fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
                , locals: {
                    id: id,
                    pdMaster: $scope.pdMaster
                }
            }).then(function (pdMaster) {
                // save (hide)
                $scope.pdMaster = pdMaster;
                console.log('pdMaster');
                console.log($scope.pdMaster);
            }, function (pdMaster) {
                // cancel
                console.log(pdMaster);
                $scope.pdMaster = pdMaster;
            });
        };


        // _________________________________________________________
        //              Modal vlasnici
        // _________________________________________________________
        $scope.openModalVlasnici = function (periodId) {
            $mdDialog.show({
                controller: 'posebniDioMasterVlasniciModalCtrl',
                templateUrl: 'app/zgrade/PDChild/posebniDioMasterVlasniciModal.html',
                //parent: angular.element(document.body),
                //targetEvent: ev,
                clickOutsideToClose: false,
                fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
                , locals: {
                    periodId: periodId,
                    pdMaster: $scope.pdMaster,
                    zgrada: DataService.currZgrada
                }
            }).then(function (pdMaster) {
                // save (hide)
                $scope.pdMaster = pdMaster;
                $scope.dodajVlasnikeBtnDisabled = true;
            }, function (pdMaster) {
                // cancel
                console.log(pdMaster);
                $scope.pdMaster = pdMaster;
            });
        };


        // _________________________________________________________
        //              Modal povrsine
        // _________________________________________________________
        $scope.openModalPosebniDioChildPovrsina = function (posebniDioChildId, povrsinaId) {
            $mdDialog.show({
                controller: 'posebniDioChildPovrsinaModalCtrl',
                templateUrl: 'app/zgrade/PDChild/posebniDioChildPovrsinaModal.html',
                //parent: angular.element(document.body),
                //targetEvent: ev,
                clickOutsideToClose: false,
                fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
                , locals: {
                    posebniDioChildId: posebniDioChildId,
                    povrsinaId: povrsinaId,
                    pdMaster: $scope.pdMaster
                }
            }).then(function (pdMaster) {
                // save (hide)
                $scope.pdMaster = pdMaster;
                console.log(pdMaster);
            }, function (pdMaster) {
                // cancel
                console.log(pdMaster);
                $scope.pdMaster = pdMaster;
            });
        };


        // _________________________________________________________
        //              Modal pripadci
        // _________________________________________________________
        $scope.openModalPosebniDioChildPripadak = function (posebniDioChildId, pripadakId) {
            $mdDialog.show({
                controller: 'posebniDioChildPripadciModalCtrl',
                templateUrl: 'app/zgrade/PDChild/posebniDioChildPripadciModal.html',
                //parent: angular.element(document.body),
                //targetEvent: ev,
                clickOutsideToClose: false,
                fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
                , locals: {
                    posebniDioChildId: posebniDioChildId,
                    pripadakId: pripadakId,
                    pdMaster: $scope.pdMaster
                }
            }).then(function (pdMaster) {
                // save (hide)
                $scope.pdMaster = pdMaster;
            }, function (pdMaster) {
                // cancel
                console.log(pdMaster);
                $scope.pdMaster = pdMaster;
            });
        };

        // __________________________________________________________
        //      Kill Master
        // __________________________________________________________
        $scope.killMaster = function (ev) {
            var brisanjeOk = false;
            if ($scope.pdMaster.Status == 'a')
                brisanjeOk = true;
            var title = brisanjeOk ? 'Želite li obrisati posebni dio?' : 'Želite li zatvoriti posebni dio?';
            var textContent = 'Odabrani posebni dio: ' + $scope.pdMaster.Naziv;
            var desc = "Odabrana površina ulazi u obračun zaključno sa godinom i mjesecom koji ćete definirati (uključujući godinu i mjesec)!";
            var okBtnCaption = brisanjeOk ? 'Obriši' : 'Zatvori';

            $mdDialog.show({
                controller: confirmController,
                templateUrl: 'app/zgrade/PDChild/confirmDialog.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
                , locals: {
                    title: title,
                    textContent: textContent,
                    desc: desc,
                    brisanjeOk: brisanjeOk,
                    okBtnCaption: okBtnCaption
                }
            })
                .then(function (o) {
                    if (brisanjeOk) {
                        var index = DataService.currZgrada.Zgrade_PosebniDijeloviMaster.indexOf($scope.pdMaster)
                        DataService.currZgrada.Zgrade_PosebniDijeloviMaster.splice(index, 1);
                    }
                    else {
                        $scope.pdMaster.Zatvoren = true;
                        $scope.pdMaster.ZatvorenGodina = o.godina;
                        $scope.pdMaster.ZatvorenMjesec = o.mjesec;
                        $scope.pdMaster.Zgrade_PosebniDijeloviChild.forEach(function (child) {
                            child.Zatvoren = true;
                            child.ZatvorenGodina = o.godina;
                            child.ZatvorenMjesec = o.mjesec;

                            child.Zgrade_PosebniDijeloviChild_Povrsine.forEach(function (povrsina) {
                                povrsina.Zatvoren = true;
                                povrsina.ZatvorenGodina = o.godina;
                                povrsina.ZatvorenMjesec = o.mjesec;
                            });
                            child.Zgrade_PosebniDijeloviChild_Pripadci.forEach(function (prip) {
                                prip.Zatvoren = true;
                                prip.ZatvorenGodina = o.godina;
                                prip.ZatvorenMjesec = o.mjesec;
                            });
                        });

                        $scope.pdMaster.Zgrade_PosebniDijeloviMaster_VlasniciPeriod.forEach(function (period) {
                            period.Zatvoren = true;
                            period.VrijediDoMjesec = o.mjesec;
                            period.VrijediDoGodina = o.godina;

                        });
                    }
                }
                , function () {
                    //alert('cancel je kliknut');
                });
        }


        // __________________________________________________________
        //          Kill / Zatvori posebni dio child
        // __________________________________________________________
        $scope.killpoChild = function (pdChild, ev) {
            // ako je Status pdChilda 'a' ili ako je status povrsine 'a' - mozes brisati povrsinu
            // u suprotnom, gasi je
            var brisanjeOk = false;
            if (pdChild.Status == 'a')
                brisanjeOk = true;
            var title = brisanjeOk ? 'Želite li obrisati posebni dio?' : 'Želite li zatvoriti posebni dio?';
            var textContent = 'Odabrani posebni dio: ' + pdChild.Naziv;
            var desc = "Odabrana površina ulazi u obračun zaključno sa godinom i mjesecom koji ćete definirati (uključujući godinu i mjesec)!";
            var okBtnCaption = brisanjeOk ? 'Obriši' : 'Zatvori';

            $mdDialog.show({
                controller: confirmController,
                templateUrl: 'app/zgrade/PDChild/confirmDialog.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
                , locals: {
                    title: title,
                    textContent: textContent,
                    desc: desc,
                    brisanjeOk: brisanjeOk,
                    okBtnCaption: okBtnCaption
                }
            })
                .then(function (o) {
                    if (brisanjeOk) {
                        var index = $scope.pdMaster.Zgrade_PosebniDijeloviChild.indexOf(pdChild)
                        $scope.pdMaster.Zgrade_PosebniDijeloviChild.splice(index, 1);
                    }
                    else {
                        pdChild.Zatvoren = true;
                        pdChild.ZatvorenGodina = o.godina;
                        pdChild.ZatvorenMjesec = o.mjesec;
                        pdChild.Zgrade_PosebniDijeloviChild_Povrsine.forEach(function (povrsina) {
                            povrsina.Zatvoren = true;
                            povrsina.ZatvorenGodina = o.godina;
                            povrsina.ZatvorenMjesec = o.mjesec;
                        });
                        pdChild.Zgrade_PosebniDijeloviChild_Pripadci.forEach(function (prip) {
                            prip.Zatvoren = true;
                            prip.ZatvorenGodina = o.godina;
                            prip.ZatvorenMjesec = o.mjesec;
                        });
                    }
                }
                , function () {
                    //alert('cancel je kliknut');
                });
        }

        // __________________________________________________________
        //          Kill / Zatvori povrsinu
        // __________________________________________________________
        $scope.killPovrsina = function (pdChildId, povrsinaId, ev) {
            // ako je Status pdChilda 'a' ili ako je status povrsine 'a' - mozes brisati povrsinu
            // u suprotnom, gasi je
            var brisanjeOk = false;
            var povrsina = {};
            $scope.pdMaster.Zgrade_PosebniDijeloviChild.forEach(function (pdChild) {
                if (pdChild.Id == pdChildId && pdChild.Status == 'a')
                    brisanjeOk = true;
                pdChild.Zgrade_PosebniDijeloviChild_Povrsine.forEach(function (povrsina) {
                    if (povrsina.Id == povrsinaId) {
                        if (povrsina.Status == 'a')
                            brisanjeOk = true;
                        povrsinaNaziv = povrsina.Naziv;
                        povrsina = povrsina;
                    }
                });
            });
            var title = brisanjeOk ? 'Želite li obrisati površinu?' : 'Želite li zatvoriti površinu?';
            var textContent = 'Odabrana površina: ' + povrsinaNaziv;
            var desc = "Odabrana površina ulazi u obračun zaključno sa godinom i mjesecom koji ćete definirati (uključujući godinu i mjesec)!";
            var okBtnCaption = brisanjeOk ? 'Obriši' : 'Zatvori';

            $mdDialog.show({
                controller: confirmController,
                templateUrl: 'app/zgrade/PDChild/confirmDialog.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
                , locals: {
                    title: title,
                    textContent: textContent,
                    desc: desc,
                    brisanjeOk: brisanjeOk,
                    okBtnCaption: okBtnCaption
                }
            })
                .then(function (o) {
                    $scope.pdMaster.Zgrade_PosebniDijeloviChild.forEach(function (pdChild) {
                        if (pdChild.Id == pdChildId) {
                            pdChild.Zgrade_PosebniDijeloviChild_Povrsine.forEach(function (povrsina) {
                                if (povrsina.Id == povrsinaId) {
                                    if (brisanjeOk) {
                                        var index = pdChild.Zgrade_PosebniDijeloviChild_Povrsine.indexOf(povrsina)
                                        pdChild.Zgrade_PosebniDijeloviChild_Povrsine.splice(index, 1);
                                    }
                                    else {
                                        povrsina.Zatvoren = true;
                                        povrsina.ZatvorenGodina = o.godina;
                                        povrsina.ZatvorenMjesec = o.mjesec;
                                    }
                                }
                            });
                        }
                    });
                }
                , function () {
                    //alert('cancel je kliknut');
                });
        }

        // __________________________________________________________
        //          Kill / Zatvori pripadak
        // __________________________________________________________
        $scope.killPripadak = function (pdChildId, pripadakId, ev) {
            // ako je Status pdChilda 'a' ili ako je status povrsine 'a' - mozes brisati povrsinu
            // u suprotnom, gasi je
            var brisanjeOk = false;
            var pripadak = {};
            $scope.pdMaster.Zgrade_PosebniDijeloviChild.forEach(function (pdChild) {
                if (pdChild.Id == pdChildId && pdChild.Status == 'a')
                    brisanjeOk = true;
                pdChild.Zgrade_PosebniDijeloviChild_Pripadci.forEach(function (prip) {
                    if (prip.Id == pripadakId) {
                        if (prip.Status == 'a')
                            brisanjeOk = true;
                        pripadakNaziv = prip.Naziv;
                        pripadak = prip;
                    }
                });
            });
            var title = brisanjeOk ? 'Želite li obrisati pripadak?' : 'Želite li zatvoriti pripadak?';
            var textContent = 'Odabrani pripadak: ' + pripadakNaziv;
            var desc = "Odabrani pripadak ulazi u obračun zaključno sa godinom i mjesecom koji ćete definirati (uključujući godinu i mjesec)!";
            var okBtnCaption = brisanjeOk ? 'Obriši' : 'Zatvori';

            $mdDialog.show({
                controller: confirmController,
                templateUrl: 'app/zgrade/PDChild/confirmDialog.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
                , locals: {
                    title: title,
                    textContent: textContent,
                    desc: desc,
                    brisanjeOk: brisanjeOk,
                    okBtnCaption: okBtnCaption
                }
            })
                .then(function (o) {
                    $scope.pdMaster.Zgrade_PosebniDijeloviChild.forEach(function (pdChild) {
                        if (pdChild.Id == pdChildId) {
                            pdChild.Zgrade_PosebniDijeloviChild_Pripadci.forEach(function (prip) {
                                if (prip.Id == pripadakId) {
                                    if (brisanjeOk) {
                                        var index = pdChild.Zgrade_PosebniDijeloviChild_Pripadci.indexOf(prip)
                                        pdChild.Zgrade_PosebniDijeloviChild_Pripadci.splice(index, 1);
                                    }
                                    else {
                                        prip.Zatvoren = true;
                                        prip.ZatvorenGodina = o.godina;
                                        prip.ZatvorenMjesec = o.mjesec;
                                    }
                                }
                            });
                        }
                    });
                }
                , function () {
                    //alert('cancel je kliknut');
                });
        }


        $scope.killVlasniciPeriod = function (periodId, ev) {
            // ako je Status pdChilda 'a' ili ako je status povrsine 'a' - mozes brisati povrsinu
            // u suprotnom, gasi je
            var brisanjeOk = false;
            var period = {};
            var title = brisanjeOk ? 'Želite li obrisati vlasnike?' : 'Želite li zatvoriti vlasnike?';
            var textContent = '';
            $scope.pdMaster.Zgrade_PosebniDijeloviMaster_VlasniciPeriod.forEach(function (period) {
                if (period.Id == periodId && period.Status == 'a') {
                    brisanjeOk = true;
                    period = period;
                    period.Zgrade_PosebniDijeloviMaster_VlasniciPeriod_Vlasnici.forEach(function (vlasnik) {
                        DataService.currZgrada.Zgrade_Stanari.forEach(function (stanar) {
                            if (vlasnik.Id == stanar.Id) {
                                textContent += stanar.Ime + ' ' + stanar.Prezime + ', ';
                            }
                        });
                    });
                }
            });

            var desc = "Odabrani pripadak ulazi u obračun zaključno sa godinom i mjesecom koji ćete definirati (uključujući godinu i mjesec)!";
            var okBtnCaption = brisanjeOk ? 'Obriši' : 'Zatvori';

            $mdDialog.show({
                controller: confirmController,
                templateUrl: 'app/zgrade/PDChild/confirmDialog.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
                , locals: {
                    title: title,
                    textContent: textContent,
                    desc: desc,
                    brisanjeOk: brisanjeOk,
                    okBtnCaption: okBtnCaption
                }
            })
                // od davde
                .then(function (o) {
                    $scope.pdMaster.Zgrade_PosebniDijeloviMaster_VlasniciPeriod.forEach(function (period) {
                        if (period.Id == periodId) {
                            if (brisanjeOk) {
                                var index = $scope.pdMaster.Zgrade_PosebniDijeloviMaster_VlasniciPeriod.indexOf(period)
                                $scope.pdMaster.Zgrade_PosebniDijeloviMaster_VlasniciPeriod.splice(index, 1);
                            }
                            else {
                                period.Zatvoren = true;
                                period.ZatvorenGodina = o.godina;
                                period.ZatvorenMjesec = o.mjesec;
                            }
                        }
                    })
                }
                , function () {
                    //alert('cancel je kliknut');
                });

            // do tu

        };


        $scope.save = function () {
            $rootScope.loaderActive = true;
            DataService.posebniDioChildrenCreateOrUpdate($scope.pdMaster).then(
                function (result) {
                    // on success
                    $rootScope.loaderActive = false;
                    toastr.success('Promjene su snimljene!', '');
                    $location.path('/posebniDijeloviMasterList');
                },
                function (result) {
                    // on error
                    $rootScope.errMsg = result.Message;
                }
            )
        };

        $scope.goBack = function () {
            $location.path('/posebniDijeloviMasterList');
        }



        function confirmController($scope, $mdDialog, title, textContent, desc, brisanjeOk, okBtnCaption) {

            $scope.vrijediDoGodina = new Date().getFullYear();
            $scope.vrijediDoMjesec = parseInt(new Date().getMonth());
            $scope.title = title;
            $scope.textContent = textContent;
            $scope.desc = desc;
            $scope.brisanjeOk = brisanjeOk;
            $scope.okBtnCaption = okBtnCaption;

            $scope.cancel = function () {
                $mdDialog.cancel();
            };

            $scope.save = function () {
                var o = { godina: $scope.vrijediDoGodina, mjesec: $scope.vrijediDoMjesec };
                $mdDialog.hide(o);
            };
        }

    }])
    .config(function ($mdThemingProvider) {
        $mdThemingProvider.theme('dark-grey').backgroundPalette('grey').dark();
        $mdThemingProvider.theme('dark-orange').backgroundPalette('orange').dark();
        $mdThemingProvider.theme('dark-purple').backgroundPalette('deep-purple').dark();
        $mdThemingProvider.theme('dark-blue').backgroundPalette('blue').dark();
    });