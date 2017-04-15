angularApp.controller('posebniDioChildrenCtrl', ['$scope', '$routeParams', '$location', '$rootScope', 'toastr', 'DataService', '$mdDialog',
    function ($scope, $routeParams, $location, $rootScope, toastr, DataService, $mdDialog) {

        $scope.msg = '';
        console.log(DataService.currZgrada);
        if (DataService.currZgrada == null) {
            $location.path('/zgrade');
            return;
        }

        if ($routeParams) {
            if ($routeParams.id > 0) { // pa uvijek ce i biti, master postoji
                // nadji posebniDioMaster
                DataService.currZgrada.Zgrade_PosebniDijeloviMaster.forEach(function (pdMaster) {
                    if (pdMaster.Id == $routeParams.id) {
                        $scope.pdMaster = pdMaster;
                        $scope.msg = pdMaster.Naziv + ' ' + pdMaster.Oznaka;
                    }
                });
            }
            //else {
            //    $scope.msg = "Nova zgrada";
            //    $scope.zgradaObj = {
            //        Id: 0, Naziv: "", Adresa: "", Mjesto: "", Povrsinam2: 0, Zgrade_PosebniDijelovi: [], Zgrade_Stanari: [], Status: ''
            //    };
            //}
        }

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


        //$scope.killPripadak = function (pdChildId, pripadakId, ev) {
        //    // ako je Status pdChilda 'a' ili ako je status pripadka 'a' - mozes brisati povrsinu
        //    // u suprotnom, gasi je
        //    var brisanjeOk = false;
        //    var pripadakNaziv = '';
        //    $scope.pdMaster.Zgrade_PosebniDijeloviChild.forEach(function (pdChild) {
        //        if (pdChild.Id == pdChildId && pdChild.Status == 'a')
        //            brisanjeOk = true;
        //        pdChild.Zgrade_PosebniDijeloviChild_Pripadci.forEach(function (prip) {
        //            if (prip.Id == pripadakId) {
        //                if (prip.Status == 'a')
        //                    brisanjeOk = true;
        //                pripadakNaziv = prip.Naziv;
        //            }
        //        });
        //    });

        //    var title = brisanjeOk ? 'Želite li obrisati pripadak?' : 'Želite li zatvoriti pripadak?';
        //    var textContent = 'Odabrani pripadak: ' + pripadakNaziv;

        //    var confirm = $mdDialog.confirm()
        //        .title(title)
        //        .textContent(textContent)
        //        .ariaLabel('Lucky day')
        //        .targetEvent(ev)
        //        .ok('Ok')
        //        .cancel('Odustani');

        //    $mdDialog.show(confirm).then(function () {
        //        $scope.pdMaster.Zgrade_PosebniDijeloviChild.forEach(function (pdChild) {
        //            if (pdChild.Id == pdChildId) {
        //                pdChild.Zgrade_PosebniDijeloviChild_Pripadci.forEach(function (prip) {
        //                    if (prip.Id == pripadakId) {
        //                        if (brisanjeOk) {
        //                            var index = pdChild.Zgrade_PosebniDijeloviChild_Pripadci.indexOf(prip)
        //                            pdChild.Zgrade_PosebniDijeloviChild_Pripadci.splice(index, 1);
        //                        }
        //                        else {
        //                            prip.Zatvoren = true;
        //                            prip.ZatvorenGodina = new Date().getFullYear();
        //                            prip.ZatvorenMjesec = parseInt(new Date().getMonth() + 1);
        //                        }
        //                    }
        //                });
        //            }
        //        });

        //    }, function () {
        //        //alert('cancel');
        //    });
        //};



        //var confirm = $mdDialog.confirm()
        //    .title(title)
        //    .textContent(textContent)
        //    .ariaLabel('Lucky day')
        //    .targetEvent(ev)
        //    .ok('Ok')
        //    .cancel('Odustani');

        //$mdDialog.show(confirm).then(function () {
        //    $scope.pdMaster.Zgrade_PosebniDijeloviChild.forEach(function (pdChild) {
        //        if (pdChild.Id == pdChildId) {
        //            pdChild.Zgrade_PosebniDijeloviChild_Povrsine.forEach(function (povrsina) {
        //                if (povrsina.Id == povrsinaId) {
        //                    if (brisanjeOk) {
        //                        var index = pdChild.Zgrade_PosebniDijeloviChild_Povrsine.indexOf(povrsina)
        //                        pdChild.Zgrade_PosebniDijeloviChild_Povrsine.splice(index, 1);
        //                    }
        //                    else {
        //                        povrsina.Zatvoren = true;
        //                        povrsina.ZatvorenGodina = new Date().getFullYear();
        //                        povrsina.ZatvorenMjesec = parseInt(new Date().getMonth() + 1);
        //                    }
        //                }
        //            });
        //        }
        //    });

        //}, function () {
        //    //alert('cancel');
        //});

        

        $scope.save = function () {
            $rootScope.loaderActive = true;
            DataService.zgradaCreateOrUpdate($scope.zgradaObj).then(
                function (result) {
                    // on success
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

        $scope.goBack = function () {
            $location.path('/zgrade');
        }


        //// test
        //$scope.showAdvanced = function (id) {
        //    $mdDialog.show({
        //        controller: DialogController,
        //        templateUrl: 'app/zgrade/dialog1.html',
        //        parent: angular.element(document.body),
        //        //targetEvent: ev,
        //        clickOutsideToClose: true,
        //        fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        //        , locals: {
        //            id: id, obj: 'pero'
        //        }
        //    })
        //        .then(function (answer) {
        //            alert(answer);
        //        }, function () {
        //            alert('cancel je kliknut');
        //        });
        //};


        function confirmController($scope, $mdDialog, title, textContent, desc, brisanjeOk, okBtnCaption) {

            $scope.vrijediDoGodina = new Date().getFullYear();
            $scope.vrijediDoMjesec = parseInt(new Date().getMonth());
            $scope.title = title;
            $scope.textContent = textContent;
            $scope.desc = desc;
            $scope.brisanjeOk = brisanjeOk;
            $scope.okBtnCaption = okBtnCaption;

            //$scope.hide = function () {
            //    $mdDialog.hide();
            //};

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