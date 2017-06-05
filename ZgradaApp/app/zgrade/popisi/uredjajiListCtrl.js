angularApp.controller('uredjajiListCtrl', ['$scope', '$rootScope', '$location', 'toastr', '$mdDialog', 'DataService',
    function ($scope, $rootScope, $location, toastr, $mdDialog, DataService) {

        if (DataService.selZgradaId == null) {
            $location.path('/zgrade');
            return;
        }
        $scope.SakrijZatvorene = false;

        $rootScope.loaderActive = true;
        DataService.getZgrada(DataService.selZgradaId, false, false).then(
            function (result) {
                // on success
                $scope.zgradaObj = result.data.Zgrada;
                var godineList = [];
                $scope.zgradaObj.PricuvaRezijeGodina.forEach(function (pr) {
                    godineList.push(pr.Godina);
                });
                //$scope.posedbiDijelovi = $scope.zgradaObj.Zgrade_PosebniDijeloviMaster;
                $scope.godine = godineList;
                $scope.msg = $scope.zgradaObj.Naziv + ' ' + $scope.zgradaObj.Adresa;
                $rootScope.loaderActive = false;
            },
            function (result) {
                toastr.error('Greška pri dohvačanju podataka sa servera');
            }
        );


        $scope.SakrijZatvoreneChanged = function () {
            if ($scope.SakrijZatvorene)
                $scope.SakrijZatvorene = false;
            else
                $scope.SakrijZatvorene = true;
        }

        $scope.openModal = function (uId, ev) {
            $('nav').fadeOut();
            $mdDialog.show({
                controller: 'uredjajiModalCtrl',
                templateUrl: 'app/zgrade/popisi/uredjajiModal.html?p=' + new Date().getTime() / 1000,
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
            $('nav').fadeOut();
            // ako je Status pdChilda 'a' ili ako je status povrsine 'a' - mozes brisati povrsinu
            // u suprotnom, gasi je
            var brisanjeOk = false;
            var nazivZajednickogDijela = {};
            $scope.zgradaObj.Zgrade_PopisUredjaja.forEach(function (u) {
                if (u.Id == uredjaj.Id && u.Status == 'a')
                    brisanjeOk = true;
            });
            var title = brisanjeOk ? 'Želite li obrisati zajednički uređaj?' : 'Želite li zatvoriti zajednički uređaj?';
            var textContent = 'Odabran zajednički uređaj: ' + uredjaj.Naziv;
            //var desc = "Odabrana površina ulazi u obračun zaključno sa godinom i mjesecom koji ćete definirati (uključujući godinu i mjesec)!";
            var okBtnCaption = brisanjeOk ? 'Obriši' : 'Zatvori';

            $mdDialog.show({
                controller: confirmController,
                templateUrl: 'app/zgrade/PDChild/confirmDialog.html?p=' + new Date().getTime() / 1000,
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
            $('nav').fadeOut();
            var title = u.Naziv;
            $mdDialog.show({
                controller: napomenaController,
                templateUrl: 'app/zgrade/popisi/napomenaModal.html?p=' + new Date().getTime() / 1000,
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
                $('nav').fadeIn();
                $mdDialog.cancel();
            };

            $scope.save = function () {
                $('nav').fadeIn();
                var o = { godina: $scope.vrijediDoGodina, mjesec: $scope.vrijediDoMjesec };
                $mdDialog.hide(o);
            };
        }

        function napomenaController($scope, $mdDialog, title, napomena) {

            $scope.title = title;
            $scope.napomena = napomena;

            $scope.cancel = function () {
                $('nav').fadeIn();
                $mdDialog.cancel();
            };

            $scope.save = function () {
                $('nav').fadeIn();
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