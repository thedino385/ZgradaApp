angularApp.controller('posebniDioMasterCtrl', ['$scope', '$routeParams', '$location', '$rootScope', 'toastr', 'DataService', 'LocalizationService', '$mdDialog',
    function ($scope, $routeParams, $location, $rootScope, toastr, DataService, ls, $mdDialog) {

        _isDirty = false;
        $scope.msg = '';

        if (DataService.selZgradaId == null) {
            $location.path('/zgrade');
            return;
        }
        $scope.dodajVlasnikeBtnDisabled = false;
        $scope.isVlasniciCollapsed = false;
        $scope.nePrikazujZatvorene = true;
        $scope.cb = true;

        if ($routeParams.id == 0) {
            var m = {
                Id: 0, ZgradaId: DataService.selZgradaId, Naziv: '', Broj: '',
                Napomena: '', Zatvoren: false, VrijediOdGodina: new Date().getFullYear(),
                VrijediOdMjesec: parseInt(new Date().getMonth() + 1),
                Zgrade_PosebniDijeloviMaster_Povrsine: [],
                Zgrade_PosebniDijeloviMaster_Pripadci: [],
                Zgrade_PosebniDijeloviMaster_VlasniciPeriod: []
            };
            $scope.pdMaster = m;
            $scope.msg = "Novi posebni dio";
        }
        else {
            DataService.currZgrada.Zgrade_PosebniDijeloviMaster.forEach(function (pdMaster) {
                if (pdMaster.Id == $routeParams.id) {
                    $scope.pdMaster = ls.decimalToHr(pdMaster, 'ZgradaStanovi');
                    $scope.msg = pdMaster.Naziv;

                    // da li se mogu dodati vlasnici, ne smije biti aktivan period, there can be only one
                    pdMaster.Zgrade_PosebniDijeloviMaster_VlasniciPeriod.forEach(function (period) {
                        if (period.Ugasen != true)
                            $scope.dodajVlasnikeBtnDisabled = true;
                    });
                }
            });
        }

        //$scope.stanari = DataService.zgradaUseri;
        $scope.stanari = DataService.currZgrada.Zgrade_Stanari;
        $rootScope.loaderActive = false;


        $scope.$on('$routeChangeStart', function (event) {
            //alert(_isDirty);
            //alert($scope.frm.$dirty);
            //event.preventDefault();
            //$scope.cancel = function (isPristine, ev) {
            //    console.log(isPristine);
            //    if (!isPristine) {
            //        // Appending dialog to document.body to cover sidenav in docs app
            //        var confirm = $mdDialog.confirm()
            //            .title('Promjene nisu snimljene!')
            //            .textContent('Želite li odustati i NE SNIMITI PROMJENE?')
            //            .ariaLabel('Lucky day')
            //            .targetEvent(ev)
            //            .ok('Ne želim snimiti')
            //            .cancel('Ostajem na stranici');

            //        $mdDialog.show(confirm).then(function () {
            //            //$scope.status = 'You decided to get rid of your debt.';
            //            toastr.info("Promjene nisu spremljene");
            //            $route.reload();
            //        }, function () {
            //            // ok, ostavljamo ga tamo gdje je
            //        });
            //    }
            //    else {
            //        toastr.info("Promjene nisu spremljene");
            //        $route.reload();
            //    }
            //}
        });

        // _________________________________________________________
        //              Modal vlasnici
        // _________________________________________________________
        $scope.openModalVlasnici = function (periodId, ev) {
            $('nav').fadeOut();
            $mdDialog.show({
                controller: 'posebniDioMasterVlasniciModalCtrl',
                templateUrl: 'app/zgrade/PDMasteri/posebniDioMasterVlasniciModal.html?p=' + new Date().getTime() / 1000,
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                escapeToClose: false,
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
        $scope.openModalPovrsina = function (povrsinaId, ev) {
            $('nav').fadeOut();
            $mdDialog.show({
                controller: 'posebniDioMasterPovrsinaModalCtrl',
                templateUrl: 'app/zgrade/PDMasteri/posebniDioMasterPovrsinaModal.html?p=' + new Date().getTime() / 1000,
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                escapeToClose: false,
                fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
                , locals: {
                    povrsinaId: povrsinaId,
                    pdMaster: $scope.pdMaster
                }
            }).then(function (pdMaster) {
                // save (hide)
                $scope.pdMaster = pdMaster;
                _isDirty = true;
            }, function (pdMaster) {
                // cancel
                console.log(pdMaster);
                $scope.pdMaster = pdMaster;
            });
        };


        // _________________________________________________________
        //              Modal pripadci
        // _________________________________________________________
        $scope.openModalPrip = function (pripadakId, ev) {
            $('nav').fadeOut();
            $mdDialog.show({
                controller: 'posebniDioMasterPripadciModalCtrl',
                templateUrl: 'app/zgrade/PDMasteri/posebniDioMasterPripadciModal.html?p=' + new Date().getTime() / 1000,
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                escapeToClose: false,
                fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
                , locals: {
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
            $('nav').fadeOut();
            var brisanjeOk = false;
            if ($scope.pdMaster.Status == 'a')
                brisanjeOk = true;
            var title = brisanjeOk ? 'Želite li obrisati posebni dio?' : 'Želite li zatvoriti posebni dio?';
            var textContent = 'Odabrani posebni dio: ' + $scope.pdMaster.Naziv;
            var desc = "Odabrana površina ulazi u obračun zaključno sa godinom i mjesecom koji ćete definirati (uključujući godinu i mjesec)!";
            var okBtnCaption = brisanjeOk ? 'Obriši' : 'Zatvori';

            $mdDialog.show({
                controller: confirmController,
                templateUrl: 'app/zgrade/PDChild/confirmDialog.html?p=' + new Date().getTime() / 1000,
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                escapeToClose: false,
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
                    $('nav').fadeIn();
                    if (brisanjeOk) {
                        var index = DataService.currZgrada.Zgrade_PosebniDijeloviMaster.indexOf($scope.pdMaster)
                        DataService.currZgrada.Zgrade_PosebniDijeloviMaster.splice(index, 1);
                    }
                    else {
                        $scope.pdMaster.Zatvoren = true;
                        $scope.pdMaster.ZatvorenGodina = o.godina;
                        $scope.pdMaster.ZatvorenMjesec = o.mjesec;
                        $scope.pdMaster.PricuvaRezijePosebniDioMasterPovrsine.forEach(function (child) {
                            child.Zatvoren = true;
                            child.ZatvorenGodina = o.godina;
                            child.ZatvorenMjesec = o.mjesec;

                            child.PricuvaRezijePosebniDioMasterPripadci.forEach(function (povrsina) {
                                povrsina.Zatvoren = true;
                                povrsina.ZatvorenGodina = o.godina;
                                povrsina.ZatvorenMjesec = o.mjesec;
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
                    $('nav').fadeIn();
                });
        }



        // __________________________________________________________
        //          Kill / Zatvori povrsinu
        // __________________________________________________________
        $scope.killPovrsina = function (povrsinaId, ev) {
            $('nav').fadeOut();
            // ako je Status pdChilda 'a' ili ako je status povrsine 'a' - mozes brisati povrsinu
            // u suprotnom, gasi je
            var brisanjeOk = false;
            var povrsina = {};
            $scope.pdMaster.Zgrade_PosebniDijeloviMaster_Povrsine.forEach(function (p) {
                if (p.Id == povrsinaId) {
                    //brisanjeOk = true;
                    povrsinaNaziv = p.Naziv;
                    povrsina = p.Povrsina;
                }
            });


            var title = brisanjeOk ? 'Želite li obrisati površinu?' : 'Želite li zatvoriti površinu?';
            var textContent = 'Odabrana površina: ' + povrsinaNaziv;
            var desc = "Odabrana površina ulazi u obračun zaključno sa godinom i mjesecom koji ćete definirati (uključujući godinu i mjesec)!";
            var okBtnCaption = brisanjeOk ? 'Obriši' : 'Zatvori';

            $mdDialog.show({
                controller: confirmController,
                templateUrl: 'app/zgrade/PDMasteri/confirmDialog.html?p=' + new Date().getTime() / 1000,
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                escapeToClose: false,
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
                    $('nav').fadeIn();
                    $scope.pdMaster.Zgrade_PosebniDijeloviMaster_Povrsine.forEach(function (p) {
                        if (p.Id == povrsinaId) {
                            alert('match');
                            p.Zatvoren = true;
                            p.ZatvorenGodina = o.godina;
                            p.ZatvorenMjesec = o.mjesec;
                        }
                    });
                }
                , function () {
                    $('nav').fadeIn();
                });
        }

        // __________________________________________________________
        //          Kill / Zatvori pripadak
        // __________________________________________________________
        $scope.killPrip = function (pripadakId, ev) {
            $('nav').fadeOut();
            // ako je Status pdChilda 'a' ili ako je status povrsine 'a' - mozes brisati povrsinu
            // u suprotnom, gasi je
            var brisanjeOk = false;
            var pripadak = {};
            $scope.pdMaster.Zgrade_PosebniDijeloviMaster_Pripadci.forEach(function (p) {
                if (p.Id == pripadakId ) {
                    //brisanjeOk = true;
                    pripadakNaziv = p.Naziv;
                    pripadak = p;
                }
            });
            var title = brisanjeOk ? 'Želite li obrisati pripadak?' : 'Želite li zatvoriti pripadak?';
            var textContent = 'Odabrani pripadak: ' + pripadakNaziv;
            var desc = "Odabrani period ulazi u obračun zaključno sa godinom i mjesecom koji ćete definirati (uključujući godinu i mjesec)!";
            var okBtnCaption = brisanjeOk ? 'Obriši' : 'Zatvori';

            $mdDialog.show({
                controller: confirmController,
                templateUrl: 'app/zgrade/PDMasteri/confirmDialog.html?p=' + new Date().getTime() / 1000,
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
                    $('nav').fadeIn();
                    $scope.pdMaster.Zgrade_PosebniDijeloviMaster_Pripadci.forEach(function (p) {
                        if (p.Id == pripadakId) {
                            p.Zatvoren = true;
                            p.ZatvorenGodina = o.godina;
                            p.ZatvorenMjesec = o.mjesec;
                        }
                    });
                }
                , function () {
                    $('nav').fadeIn();
                });
        }


        $scope.killVlasniciPeriod = function (periodId, ev) {
            $('nav').fadeOut();
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

            var desc = "Odabrani period ulazi u obračun zaključno sa godinom i mjesecom koji ćete definirati (uključujući godinu i mjesec)!";
            var okBtnCaption = brisanjeOk ? 'Obriši' : 'Zatvori';

            $mdDialog.show({
                controller: confirmController,
                templateUrl: 'app/zgrade/PDMasteri/confirmDialog.html?p=' + new Date().getTime() / 1000,
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
                    $('nav').fadeIn();
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
                    $('nav').fadeIn();
                });

            // do tu

        };


        $scope.save = function () {
            $rootScope.loaderActive = true;
            DataService.posebniDioChildrenCreateOrUpdate(DataService.decimalToEng($scope.pdMaster, 'ZgradaStanovi')).then(
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