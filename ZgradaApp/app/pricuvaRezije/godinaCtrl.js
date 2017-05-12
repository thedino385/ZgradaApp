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
        DataService.getZgrada(DataService.selZgradaId).then(
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

        $scope.godinaChanged = function (godina) {
            $scope.selectedGodina = godina;
            $scope.tableVisible = true;
            console.log($scope.zgradaObj);
            DataService.getPricuvaRezijeGodinaTable($scope.zgradaObj.Id, godina).then(
                function (result) {
                    // success
                    $scope.godinaTable = result.data;
                    $scope.zgradaObj.PricuvaRezijeGodina.forEach(function (pr) {
                        if (pr.Godina == godina) {
                            $scope.selectedGodina = godina;
                            console.log(pr.Godina);
                            farbajMjesece();
                        }
                    });
                },
                function (result) {
                    // error
                    toastr.error('Dohvat godišnjih posataka sa servera nije uspio');
                }
            )
        }




        $scope.dodajGodinu = function () {
            if ($scope.novaGodina == undefined || $scope.novaGodina == '')
                return;
            console.log($scope.novaGodina);
            console.log($scope.godine.indexOf($scope.novaGodina));
            console.log($scope.godine);
            if ($scope.godine.indexOf($scope.novaGodina) == -1) {
                DataService.praznaPricuvaRezijeCreate($scope.zgradaObj.Id, $scope.novaGodina).then(
                    function (result) {
                        $scope.zgradaObj.PricuvaRezijeGodina.push(result.data);
                        $scope.godine.push($scope.novaGodina);
                        console.log('$scope.novaGodina: ' + $scope.novaGodina);
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

        $scope.saveAll = function () {
            save();
        }

        function save() {
            $rootScope.loaderActive = true;
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
            console.log(pdMasterId);
            var pdmaster = null;
            $scope.zgradaObj.Zgrade_PosebniDijeloviMaster.forEach(function (master) {
                console.log(master.Id == pdMasterId);
                if (parseInt(master.Id) == parseInt(pdMasterId))
                    pdmaster = master;
            });
            console.log(pdmaster);
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
            $scope.clsMjesec1 = 'transCellBack';
            $scope.clsMjesec2 = 'transCellBack';
            $scope.clsMjesec3 = 'transCellBack';
            $scope.clsMjesec4 = 'transCellBack';
            $scope.clsMjesec5 = 'transCellBack';
            $scope.clsMjesec6 = 'transCellBack';
            $scope.clsMjesec7 = 'transCellBack';
            $scope.clsMjesec8 = 'transCellBack';
            $scope.clsMjesec9 = 'transCellBack';
            $scope.clsMjesec10 = 'transCellBack';
            $scope.clsMjesec11 = 'transCellBack';
            $scope.clsMjesec12 = 'transCellBack';

            $scope.zgradaObj.PricuvaRezijeGodina.forEach(function (pr) {
                if (pr.Godina == $scope.selectedGodina) {
                    pr.PricuvaRezijeMjesec.forEach(function (mj) {
                        switch (mj.Mjesec) {
                            case 1:
                                if (mj.DugPretplata != 0)
                                    // ok, nema promjena, pricuva postoji
                                    $scope.clsMjesec1 = 'greenCellBack';
                                break;
                            case 2:
                                if (mj.DugPretplata != 0)
                                    $scope.clsMjesec2 = 'greenCellBack';
                                break;
                            case 3:
                                if (mj.DugPretplata != 0)
                                    $scope.clsMjesec3 = 'greenCellBack';
                                break;
                            case 4:
                                if (mj.DugPretplata != 0)
                                    $scope.clsMjesec4 = 'greenCellBack';
                                break;
                            case 5:
                                if (mj.DugPretplata != 0)
                                    $scope.clsMjesec5 = 'greenCellBack';
                                break;
                            case 6:
                                if (mj.DugPretplata != 0)
                                    $scope.clsMjesec6 = 'greenCellBack';
                                break;
                            case 7:
                                if (mj.DugPretplata != 0)
                                    $scope.clsMjesec7 = 'greenCellBack';
                                break;
                            case 8:
                                if (mj.DugPretplata != 0)
                                    $scope.clsMjesec8 = 'greenCellBack';
                                break;
                            case 9:
                                if (mj.DugPretplata != 0)
                                    $scope.clsMjesec9 = 'greenCellBack';
                                break;
                            case 10:
                                if (mj.DugPretplata != 0)
                                    $scope.clsMjesec10 = 'greenCellBack';
                                break;
                            case 11:
                                if (mj.DugPretplata != 0)
                                    $scope.clsMjesec11 = 'greenCellBack';
                                break;
                            case 12:
                                if (mj.DugPretplata != 0)
                                    $scope.clsMjesec12 = 'greenCellBack';
                                break;
                        }
                    });
                }
            });
        }

        $scope.setColor = function (index) {
            switch (index) {
                case 0:
                    return { color: "orange" };
                case 1:
                    return { color: "blue" };
                case 2:
                    return { color: "magenta" };
                case 3:
                    return { color: "black" };
            }
        }

    }])
    //.config(function ($mdThemingProvider) {
    //    $mdThemingProvider.theme('dark-grey').backgroundPalette('grey').dark();
    //    $mdThemingProvider.theme('dark-orange').backgroundPalette('orange').dark();
    //    $mdThemingProvider.theme('dark-purple').backgroundPalette('deep-purple').dark();
    //    $mdThemingProvider.theme('dark-blue').backgroundPalette('blue').dark();
    //});