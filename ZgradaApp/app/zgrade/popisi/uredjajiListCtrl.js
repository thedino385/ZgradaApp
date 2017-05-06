﻿angularApp.controller('uredjajiListCtrl', ['$scope', '$rootScope', '$location', 'toastr', '$mdDialog', 'DataService',
    function ($scope, $rootScope, $location, toastr, $mdDialog, DataService) {

        var zgradaObj = DataService.currZgrada;
        if (zgradaObj == null) {
            $location.path('/zgrade');
            return;
        }

        $scope.zgradaObj = zgradaObj;
        $scope.zgradaMsg = 'Popis zajedničkih uređaja';
        $scope.SakrijZatvorene = false;


        $scope.SakrijZatvoreneChanged = function () {
            if ($scope.SakrijZatvorene)
                $scope.SakrijZatvorene = false;
            else
                $scope.SakrijZatvorene = true;
        }

        $scope.openModal = function (uId, ev) {
            $mdDialog.show({
                controller: 'uredjajiModalCtrl',
                templateUrl: 'app/zgrade/popisi/uredjajiModal.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
                , locals: {
                    id: uId,
                    zgradaObj: $scope.zgradaObj
                }
            }).then(function (zgradaObj) {
                $scope.zgradaObj = zgradaObj;
            }, function (zgradaObj) {
                $scope.zgradaObj = zgradaObj;
            });
        };


        // __________________________________________________________
        //          Kill / Zatvori zajednicki dio
        // __________________________________________________________
        $scope.kill = function (uredjaj, ev) {
            // ako je Status pdChilda 'a' ili ako je status povrsine 'a' - mozes brisati povrsinu
            // u suprotnom, gasi je
            var brisanjeOk = false;
            var nazivZajednickogDijela = {};
            $scope.zgradaObj.Zgrade_PopisUredjaja.forEach(function (u) {
                if (u.Id == u.Id && u.Status == 'a')
                    brisanjeOk = true;
            });
            var title = brisanjeOk ? 'Želite li obrisati zajednički uređaj?' : 'Želite li zatvoriti zajednički uređaj?';
            var textContent = 'Odabran zajednički uređaj: ' + u.Naziv;
            //var desc = "Odabrana površina ulazi u obračun zaključno sa godinom i mjesecom koji ćete definirati (uključujući godinu i mjesec)!";
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
                    desc: '',
                    brisanjeOk: brisanjeOk,
                    okBtnCaption: okBtnCaption
                }
            })
                .then(function (o) {
                    $scope.zgradaObj.Zgrade_PopisUredjaja.forEach(function (u) {
                        if (u.Id == u.Id) {
                            if (brisanjeOk) {
                                var index = $scope.zgradaObj.Zgrade_PopisUredjaja.indexOf(u)
                                $scope.zgradaObj.Zgrade_PopisUredjaja.splice(index, 1);
                            }
                            else {
                                u.Status = 'u';
                                u.Zatvoren = true;
                                u.ZatvorenGodina = o.godina;
                                u.ZatvorenMjesec = o.mjesec;
                            }
                        }
                    });
                }
                , function () {
                    //alert('cancel je kliknut');
                });
        }


        // __________________________________________________________
        //          prikazi napomenu
        // __________________________________________________________
        $scope.showDesc = function (u, ev) {
            var title = u.Naziv;
            $mdDialog.show({
                controller: napomenaController,
                templateUrl: 'app/zgrade/popisi/napomenaModal.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
                , locals: {
                    title: title,
                    napomena: u.Napomena,
                }
            })
                .then(function () {
                }
                , function () {
                    //alert('cancel je kliknut');
                });
        }

        $scope.save = function () {
            $rootScope.loaderActive = true;
            DataService.zajednickiUredjajiCreateOrUpdate($scope.zgradaObj).then(
                function (result) {
                    $rootScope.loaderActive = false;
                    toastr.success('Promjene su snimljene!', '');
                },
                function (result) {
                    $rootScope.loaderActive = false;
                    toastr.error('Greška kod snimanja!', '');
                }
            )
        }

        $scope.goBack = function () {
            $location.path('/posebniDijeloviMasterList/' + $scope.zgradaObj.Id);
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

        function napomenaController($scope, $mdDialog, title, napomena) {

            $scope.title = title;
            $scope.napomena = napomena;

            $scope.cancel = function () {
                $mdDialog.cancel();
            };

            $scope.save = function () {
                $mdDialog.hide();
            };
        }

    }]).filter('isZajednickiDioVisible', function () {
        return function (items, SakrijZatvorene) {

            var ret = [];
            if (SakrijZatvorene) {
                items.forEach(function (item) {
                    if (!item.Zatvoren)
                        ret.push(item);
                });
                return ret;
            }
            else
                return items;
        }
    });