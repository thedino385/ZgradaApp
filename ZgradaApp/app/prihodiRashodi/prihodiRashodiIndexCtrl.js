angularApp.controller('prihodiRashodiIndexCtrl', ['$scope', '$route', '$routeParams', '$location', '$rootScope', 'toastr', 'DataService', '$mdDialog',
    function ($scope, $route, $routeParams, $location, $rootScope, toastr, DataService, $mdDialog) {

        $scope.msg = '';
        if (DataService.selZgradaId == null) {
            $location.path('/zgrade');
            return;
        }


        //if ($routeParams) {
        $rootScope.loaderActive = true;
        DataService.getZgrada(DataService.selZgradaId, true).then(
            function (result) {
                // on success
                $scope.zgradaObj = result.data.Zgrada;
                //DataService.currZgrada = result.data.Zgrada;
                //DataService.zgradaUseri = result.data.Useri;
                //DataService.userId = result.data.userId;
                $rootScope.loaderActive = false;

                //$scope.zgradaObj = zgradaObj;
                var godineList = [];
                $scope.zgradaObj.PrihodiRashodi.forEach(function (pr) {
                    godineList.push(pr.Godina);
                });
                $scope.posedbiDijelovi = $scope.zgradaObj.Zgrade_PosebniDijeloviMaster;
                $scope.godine = godineList;
                $scope.msg = $scope.zgradaObj.Naziv + ' ' + $scope.zgradaObj.Adresa;
                $rootScope.loaderActive = false;
                $scope.msg = "Uredi zgradu";

                DataService.getSifarnikRashoda().then(
                    function (result) {
                        $scope.sifarnikRashoda = result.data;
                    },
                    function (result) {
                        toastr.error('Dohvat šifarnika rashoda nije uspio');
                    });

            },
            function (result) {
                // on errr
                alert(result.Message);
                $rootScope.errMsg = result.Message;
            }
        );

        //}



        $scope.godinaChanged = function (godina) {
            $scope.selectedGodina = godina;
            $scope.tableVisible = true;
            console.log($scope.zgradaObj);
            $scope.prihodRashodZaGodinu = { Id: 0, ZgradaId: $scope.zgradaObj.Id, Godina: godina, PrihodiRashodi_Prihodi: [], PrihodiRashodi_Rashodi: [] }
            $scope.zgradaObj.PrihodiRashodi.forEach(function (pr) {
                if (pr.Godina == godina) {
                    console.log('godina changed, prihosdiRashodiza godinu');
                    console.log(pr);
                    $scope.prihodRashodZaGodinu = pr;
                    DataService.selGodina = godina;
                }
            });
        }


        $scope.iznosZaMjesec = function (mjesec, vrsta) {
            if ($scope.prihodRashodZaGodinu == undefined)
                return;
            var suma = 0;
            if (vrsta == 'p' && $scope.prihodRashodZaGodinu.PrihodiRashodi_Prihodi != undefined) {
                $scope.prihodRashodZaGodinu.PrihodiRashodi_Prihodi.forEach(function (prihodMjesec) {
                    if (prihodMjesec.Mjesec == mjesec)
                        suma += parseFloat(prihodMjesec.Iznos);
                });
            }
            else if (vrsta == 'r' && $scope.prihodRashodZaGodinu.PrihodiRashodi_Rashodi != undefined) {
                $scope.prihodRashodZaGodinu.PrihodiRashodi_Rashodi.forEach(function (rashodMjesec) {
                    if (rashodMjesec.Mjesec == mjesec)
                        suma += parseFloat(rashodMjesec.Iznos);
                });
            }
            return suma;
        }

        $scope.iznosZaMjesecRashod = function (mjesec, vrsta) {
            if ($scope.prihodRashodZaGodinu == undefined)
                return;
            var suma = 0;
            if ($scope.prihodRashodZaGodinu.PrihodiRashodi_Rashodi != undefined) {
                $scope.prihodRashodZaGodinu.PrihodiRashodi_Rashodi.forEach(function (rashodMjesec) {
                    if (rashodMjesec.Mjesec == mjesec)
                        suma += parseFloat(rashodMjesec.Iznos);
                });
            }

            //else if (vrsta == 'r' && $scope.prihodRashodZaGodinu.PrihodiRashodi_Rashodi != undefined) {
            //    $scope.prihodRashodZaGodinu.PrihodiRashodi_Rashodi.forEach(function (rashodMjesec) {
            //        if (rashodMjesec.Mjesec == mjesec)
            //            suma += parseFloat(rashodMjesec.Iznos);
            //    });
            //}
            return suma;
        }

        $scope.dodajGodinu = function () {
            if ($scope.novaGodina == undefined || $scope.novaGodina == '')
                return;
            console.log($scope.novaGodina);
            console.log($scope.godine.indexOf($scope.novaGodina));
            if ($scope.godine.indexOf($scope.novaGodina) == -1) {
                $scope.godine.push($scope.novaGodina);
                var newMaster = { Id: 0, ZgradaId: $scope.zgradaObj.Id, Godina: $scope.novaGodina, Status: 'a', PrihodiRashodi_Prihodi: [], PrihodiRashodi_Rashodi: [] }
                $scope.zgradaObj.PrihodiRashodi.push(newMaster);
            }

            else
                toastr.error('Godina postoji');
            $scope.novaGodina = '';
        }

        // provjeri lleap year
        $scope.getFebDay = function () {
            var year = new Date().getFullYear();
            if (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0))
                return 29;
            return 28;
        }

        // _________________________________________________________
        //              Modal prihodi
        // _________________________________________________________
        $scope.openModalPrihodi = function (mjesec, ev) {
            $mdDialog.show({
                controller: 'prihodiModalCtrl',
                templateUrl: 'app/prihodiRashodi/prihodiModal.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
                , locals: {
                    prihodRashodZaGodinu: $scope.prihodRashodZaGodinu,
                    mjesec: mjesec,
                    godina: $scope.selectedGodina,
                    posedbiDijelovi: $scope.posedbiDijelovi,
                    zgrada: $scope.zgradaObj
                }
            }).then(function (prihodRashodZaGodinu) {
                // save (hide)
                $scope.prihodRashodZaGodinu = prihodRashodZaGodinu;
                console.log($scope.prihodRashodZaGodinu);
            }, function (prihodRashodZaGodinu) {
                // cancel
                console.log(prihodRashodZaGodinu);
                $scope.prihodRashodZaGodinu = prihodRashodZaGodinu;
            });
        };


        // _________________________________________________________
        //              Modal rashodi
        // _________________________________________________________
        $scope.openModalRashodi = function (mjesec) {
            $mdDialog.show({
                controller: 'rashodiModalCtrl',
                templateUrl: 'app/prihodiRashodi/rashodiModal.html',
                //parent: angular.element(document.body),
                //targetEvent: ev,
                clickOutsideToClose: false,
                fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
                , locals: {
                    prihodRashodZaGodinu: $scope.prihodRashodZaGodinu,
                    mjesec: mjesec,
                    godina: $scope.selectedGodina,
                    sifarnikRashoda: $scope.sifarnikRashoda,
                    posedbiDijelovi: $scope.posedbiDijelovi,
                }
            }).then(function (prihodRashodZaGodinu) {
                // save (hide)
                $scope.prihodRashodZaGodinu = prihodRashodZaGodinu;
                console.log($scope.prihodRashodZaGodinu);
            }, function (prihodRashodZaGodinu) {
                // cancel
                console.log(prihodRashodZaGodinu);
                $scope.prihodRashodZaGodinu = prihodRashodZaGodinu;
            });
        };

        $scope.saveAll = function () {
            $rootScope.loaderActive = true;
            DataService.prihodiRashodiCreateOrUpdate($scope.zgradaObj).then(
                function (result) {
                    // on success
                    $rootScope.loaderActive = false;
                    toastr.success('Promjene su snimljene!', '');
                    $scope.zgradaObj = result.data;
                    $scope.selectedGodina = DataService.selGodina;
                    $scope.tableVisible = true;
                    //$location.path('/zgrade');
                    //$route.reload();
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

        // _________________________________________________________
        //              Modal sifarnik prihoda
        // _________________________________________________________
        $scope.openModalSifarnik = function (ev) {
            $mdDialog.show({
                controller: 'sifarnikRashodaModalCtrl',
                templateUrl: 'app/prihodiRashodi/sifarnikRashodaModal.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
                , locals: {
                    sifarnikRashoda: $scope.sifarnikRashoda,
                }
            }).then(function (sifarnikRashoda) {
                // save (hide)
                $scope.sifarnikRashoda = sifarnikRashoda;
                DataService.sifarnikRashodaCrateOrUpdate(sifarnikRashoda).then(
                    function (result) {
                        toastr.success('Šifarnik rashoda je snimljen.');
                    },
                    function (result) {
                        toastr.error('Snimanje šiarnika rahoda nije uspjelo!');
                    });
                //console.log($scope.prihodRashodZaGodinu);
            }, function (sifarnikRashoda) {
                // cancel
                $scope.sifarnikRashoda = sifarnikRashoda;
                //console.log(prihodRashodZaGodinu);
                //$scope.prihodRashodZaGodinu = prihodRashodZaGodinu;
            });
        };




    }])
    //.config(function ($mdThemingProvider) {
    //    $mdThemingProvider.theme('dark-grey').backgroundPalette('grey').dark();
    //    $mdThemingProvider.theme('dark-orange').backgroundPalette('orange').dark();
    //    $mdThemingProvider.theme('dark-purple').backgroundPalette('deep-purple').dark();
    //    $mdThemingProvider.theme('dark-blue').backgroundPalette('blue').dark();
    //});