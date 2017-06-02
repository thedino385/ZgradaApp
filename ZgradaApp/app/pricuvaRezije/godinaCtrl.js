angularApp.controller('godinaCtrl', ['$scope', '$routeParams', '$location', '$route', '$rootScope', 'toastr', 'DataService', '$mdDialog',
    function ($scope, $routeParams, $location, $route, $rootScope, toastr, DataService, $mdDialog) {

        $scope.msg = '';
        $scope.selectedGodina = null;
        if (DataService.selZgradaId == null) {
            $location.path('/zgrade');
            return;
        }


        //if ($routeParams) {
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

                if (DataService.selGodina != null && DataService.selGodina > 0)
                    getDataForGodina(DataService.selGodina);
            },
            function (result) {
                toastr.error('Greška pri dohvačanju podataka sa servera');
            }
        );

        $scope.godinaChanged = function (godina) {
            DataService.selGodina = godina;
            getDataForGodina(godina);
        }

        function getDataForGodina(godina) {
            $rootScope.loaderActive = true;
            $scope.selectedGodina = godina;
            //console.log($scope.zgradaObj);
            DataService.getPricuvaRezijeGodinaTable($scope.zgradaObj.Id, godina).then(
                function (result) {
                    // success
                    $scope.godinaTable = result.data;
                    $scope.zgradaObj.PricuvaRezijeGodina.forEach(function (pr) {
                        if (pr.Godina == godina) {
                            $scope.selectedGodina = godina;
                            //console.log(pr.Godina);
                            farbajMjesece();
                            $scope.tableVisible = true;
                            $rootScope.loaderActive = false;
                        }
                    });
                },
                function (result) {
                    // error
                    $rootScope.loaderActive = false;
                    toastr.error('Dohvat godišnjih posataka sa servera nije uspio');
                }
            )
        }

        $scope.dodajGodinu = function () {
            if ($scope.novaGodina == undefined || $scope.novaGodina == '')
                return;
            //console.log($scope.novaGodina);
            //console.log($scope.godine.indexOf($scope.novaGodina));
            //console.log($scope.godine);
            if ($scope.godine.indexOf($scope.novaGodina) == -1) {
                DataService.praznaPricuvaRezijeCreate($scope.zgradaObj.Id, $scope.novaGodina).then(
                    function (result) {
                        $scope.zgradaObj.PricuvaRezijeGodina.push(result.data);
                        $scope.godine.push($scope.novaGodina);
                        //console.log('$scope.novaGodina: ' + $scope.novaGodina);
                        $scope.novaGodina = '';
                    },
                    function (result) {
                        toastr.error('Godina nije kreriana');
                    }
                )
            }

            else
                toastr.error('Godina postoji');
        }

        // provjeri lleap year
        $scope.getFebDay = function () {
            var year = new Date().getFullYear();
            if (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0))
                return 29;
            return 28;
        }

        // _________________________________________________________
        //              Modal openMjesecno
        // _________________________________________________________
        $scope.openMjesecno = function (mjesec, ev) {
            $('nav').fadeOut();
            $mdDialog.show({
                controller: 'mjesecModalCtrl',
                templateUrl: 'app/pricuvaRezije/mjesecModal.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
                , locals: {
                    zgradaObj: $scope.zgradaObj,
                    mjesec: mjesec,
                    godina: $scope.selectedGodina
                }
            }).then(function (zgradaObj) {
                // save (hide)
                $scope.zgradaObj = zgradaObj;
                save();
                //console.log($scope.prihodRashodZaGodinu);
            }, function (zgradaObj) {
                // cancel
                //console.log(prihodRashodZaGodinu);
                $scope.zgradaObj = zgradaObj;
            });
        };


        // _________________________________________________________
        //              Modal stanjeZgrade
        // _________________________________________________________
        $scope.openStanjeZgrade = function (mjesec, ev) {
            $('nav').fadeOut();
            $mdDialog.show({
                controller: 'stanjeZgradeModalCtrl',
                templateUrl: 'app/pricuvaRezije/stanjeZgradeModal.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
                , locals: {
                    zgradaObj: $scope.zgradaObj,
                    mjesec: mjesec,
                    godina: $scope.selectedGodina
                }
            }).then(function () {

            }, function () {

            });
        };


        // _________________________________________________________
        //              Modal uplatnice
        // _________________________________________________________
        $scope.openModalUplatnica = function (mjesec, ev) {
            $('nav').fadeOut();
            $mdDialog.show({
                controller: 'uplatnicaModalCtrl',
                templateUrl: 'app/pricuvaRezije/uplatnicaModal.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
                , locals: {
                    zgradaObj: $scope.zgradaObj,
                    mjesec: mjesec,
                    godina: $scope.selectedGodina
                }
            }).then(function () {

            }, function () {

            });
        };


        // _________________________________________________________
        //              Modal stanjeOd
        // _________________________________________________________
        $scope.modalStanje = function (ev) {
            $('nav').fadeOut();
            $mdDialog.show({
                controller: 'stanjeOdModalCtrl',
                templateUrl: 'app/pricuvaRezije/stanjeOdModal.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
                , locals: {
                    zgradaObj: $scope.zgradaObj,
                    godinaTable: $scope.godinaTable,
                }
            }).then(function (zgradaObj) {
                $scope.zgradaObj = zgradaObj;
                console.log($scope.zgradaObj);
                //save();
                DataService.pricuvaRezijeStanjeOdCreateOrUpdate(zgradaObj.PricuvaRezijeGodina[0].PricuvaRezijeGodina_StanjeOd).then(
                    function (result) {
                        toastr.success('Promjene su snimljene!', '');
                    },
                    function (result) {
                        toastr.error('Promjene nisu snimljene!', '');
                    }
                )
            }, function () {

            });
        };

        $scope.saveAll = function () {
            save();
        }

        function save() {
            $rootScope.loaderActive = true;
            console.log($scope.zgradaObj);
            DataService.pricuvaRezijeCreateOrUpdate($scope.zgradaObj).then(
                function (result) {
                    // on success
                    $rootScope.loaderActive = false;
                    toastr.success('Promjene su snimljene!', '');
                    //$location.path('/posebniDijeloviMasterList/' + $scope.zgradaObj.Id);
                    $route.reload();
                },
                function (result) {
                    // on error
                    $rootScope.errMsg = result.Message;
                    toastr.error('Promjene nisu snimljene!', '');
                }
            )
        };

        $scope.goBack = function () {
            $location.path('/zgrade');
        }

        // _________________________________________________________
        //              Modal kartica
        // _________________________________________________________
        $scope.kartica = function (pdMasterId, ev) {
            //console.log(pdMasterId);
            var pdmaster = null;
            $scope.zgradaObj.Zgrade_PosebniDijeloviMaster.forEach(function (master) {
                //console.log(master.Id == pdMasterId);
                if (parseInt(master.Id) == parseInt(pdMasterId))
                    pdmaster = master;
            });
            //console.log(pdmaster);
            $mdDialog.show({
                controller: 'indexKsCtrl',
                templateUrl: 'app/ks/indexKs.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
                , locals: {
                    zgradaObj: $scope.zgradaObj,
                    pdMaster: pdmaster,
                }
            }).then(function () {
            }, function () {
            });
        };

        function farbajMjesece(prGodina) {
            $scope.clsMjesec1 = 'btn btn-default';
            $scope.clsMjesec2 = 'btn btn-default';
            $scope.clsMjesec3 = 'btn btn-default';
            $scope.clsMjesec4 = 'btn btn-default';
            $scope.clsMjesec5 = 'btn btn-default';
            $scope.clsMjesec6 = 'btn btn-default';
            $scope.clsMjesec7 = 'btn btn-default';
            $scope.clsMjesec8 = 'btn btn-default';
            $scope.clsMjesec9 = 'btn btn-default';
            $scope.clsMjesec10 = 'btn btn-default';
            $scope.clsMjesec11 = 'btn btn-default';
            $scope.clsMjesec12 = 'btn btn-default';

            $scope.zgradaObj.PricuvaRezijeGodina.forEach(function (pr) {
                if (pr.Godina == $scope.selectedGodina) {
                    pr.PricuvaRezijeMjesec.forEach(function (mj) {
                        switch (mj.Mjesec) {
                            case 1:
                                if (mj.DugPretplata != 0)
                                    // ok, nema promjena, pricuva postoji
                                    $scope.clsMjesec1 = 'btn btn-success';
                                break;
                            case 2:
                                if (mj.DugPretplata != 0)
                                    $scope.clsMjesec2 = 'btn btn-success';
                                break;
                            case 3:
                                if (mj.DugPretplata != 0)
                                    $scope.clsMjesec3 = 'btn btn-success';
                                break;
                            case 4:
                                if (mj.DugPretplata != 0)
                                    $scope.clsMjesec4 = 'btn btn-success';
                                break;
                            case 5:
                                if (mj.DugPretplata != 0)
                                    $scope.clsMjesec5 = 'btn btn-success';
                                break;
                            case 6:
                                if (mj.DugPretplata != 0)
                                    $scope.clsMjesec6 = 'btn btn-success';
                                break;
                            case 7:
                                if (mj.DugPretplata != 0)
                                    $scope.clsMjesec7 = 'btn btn-success';
                                break;
                            case 8:
                                if (mj.DugPretplata != 0)
                                    $scope.clsMjesec8 = 'btn btn-success';
                                break;
                            case 9:
                                if (mj.DugPretplata != 0)
                                    $scope.clsMjesec9 = 'btn btn-success';
                                break;
                            case 10:
                                if (mj.DugPretplata != 0)
                                    $scope.clsMjesec10 = 'btn btn-success';
                                break;
                            case 11:
                                if (mj.DugPretplata != 0)
                                    $scope.clsMjesec11 = 'btn btn-success';
                                break;
                            case 12:
                                if (mj.DugPretplata != 0)
                                    $scope.clsMjesec12 = 'btn btn-success';
                                break;
                        }
                    });
                }
            });
        }

        $scope.setColor = function (index) {
            switch (index) {
                //case 0:
                //    return { color: "darkgreen" };
                case 0:
                    return { color: "chocolate" };
                case 1:
                    return { color: "blue" };
                case 2:
                    return { color: "magenta" };
                case 3:
                    return { color: "darkred" };
            }
        }

    }])
    //.config(function ($mdThemingProvider) {
    //    $mdThemingProvider.theme('dark-grey').backgroundPalette('grey').dark();
    //    $mdThemingProvider.theme('dark-orange').backgroundPalette('orange').dark();
    //    $mdThemingProvider.theme('dark-purple').backgroundPalette('deep-purple').dark();
    //    $mdThemingProvider.theme('dark-blue').backgroundPalette('blue').dark();
    //});