angularApp.controller('prihodiRashodiIndexCtrl', ['$scope', '$routeParams', '$location', '$rootScope', 'toastr', 'DataService', '$mdDialog',
    function ($scope, $routeParams, $location, $rootScope, toastr, DataService, $mdDialog) {

        $scope.msg = '';
        //$scope.dodajVlasnikeBtnDisabled = false;
        //if (DataService.currZgrada == null) {
        //    $location.path('/zgrade');
        //    return;
        //}

        if ($routeParams) {
            $rootScope.loaderActive = true;
            DataService.getZgrada($routeParams.id).then(
                function (result) {
                    // on success
                    $scope.zgradaObj = result.data;
                    var godineList = [];
                    $scope.zgradaObj.PrihodiRashodi.forEach(function (pr) {
                        godineList.push(pr.Godina);
                    });
                    $scope.posedbiDijelovi = $scope.zgradaObj.Zgrade_PosebniDijeloviMaster;
                    $scope.godine = godineList;
                    $scope.msg = $scope.zgradaObj.Naziv + ' ' + $scope.zgradaObj.Adresa;
                    $rootScope.loaderActive = false;
                    $scope.msg = "Uredi zgradu";
                },
                function (result) {
                    // on errr
                    alert(result.Message);
                    $rootScope.errMsg = result.Message;
                }
            );
        }



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
                }
            });
        }


        $scope.iznosZaMjesec = function (mjesec, vrsta) {
            if ($scope.prihodRashodZaGodinu == undefined)
                return;
            //console.log($scope.prihodRashodZaGodinu);
            var suma = 0;
            if ($scope.prihodRashodZaGodinu.PrihodiRashodi_Prihodi != undefined) {
                //$scope.zgradaObj.PrihodiRashodi.forEach(function (pr) {
                //    if (pr.Godina == $scope.selectedGodina) {
                $scope.prihodRashodZaGodinu.PrihodiRashodi_Prihodi.forEach(function (prihodMjesec) {
                    if (prihodMjesec.Mjesec == mjesec)
                        suma += parseFloat(prihodMjesec.Iznos);
                });
                //    }
                //});
            }
            else if (vrsta == 'r' && $scope.prihodRashodZaGodinu.PrihodiRashodi_Rashodi != undefined) {
                //$scope.zgradaObj.PrihodiRashodi.forEach(function (pr) {
                //    if (pr.Godina == $scope.selectedGodina) {
                $scope.prihodRashodZaGodinu.PrihodiRashodi_Rashodi.forEach(function (rashodMjesec) {
                    if (rashodMjesec.Mjesec == mjesec)
                        suma += parseFloat(rashodMjesec.Iznos);
                });
                //    }
                //});
            }
            return suma;
        }

        $scope.dodajGodinu = function () {
            if ($scope.novaGodina == undefined || $scope.novaGodina == '')
                return;
            console.log($scope.novaGodina);
            console.log($scope.godine.indexOf($scope.novaGodina));
            if ($scope.godine.indexOf($scope.novaGodina) == -1)
                $scope.godine.push($scope.novaGodina);
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
        $scope.openModalPrihodi = function (mjesec) {
            $mdDialog.show({
                controller: 'prihodiModalCtrl',
                templateUrl: 'app/prihodiRashodi/prihodiModal.html',
                //parent: angular.element(document.body),
                //targetEvent: ev,
                clickOutsideToClose: false,
                fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
                , locals: {
                    prihodRashodZaGodinu: $scope.prihodRashodZaGodinu,
                    mjesec: mjesec,
                    godina: $scope.selectedGodina,
                    posedbiDijelovi: $scope.posedbiDijelovi
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




        $scope.save = function () {
            $rootScope.loaderActive = true;
            DataService.prihodiRashodiCreateOrUpdate($scope.pdMaster).then(
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



        //function confirmController($scope, $mdDialog, title, textContent, desc, brisanjeOk, okBtnCaption) {

        //    $scope.vrijediDoGodina = new Date().getFullYear();
        //    $scope.vrijediDoMjesec = parseInt(new Date().getMonth());
        //    $scope.title = title;
        //    $scope.textContent = textContent;
        //    $scope.desc = desc;
        //    $scope.brisanjeOk = brisanjeOk;
        //    $scope.okBtnCaption = okBtnCaption;

        //    $scope.cancel = function () {
        //        $mdDialog.cancel();
        //    };

        //    $scope.save = function () {
        //        var o = { godina: $scope.vrijediDoGodina, mjesec: $scope.vrijediDoMjesec };
        //        $mdDialog.hide(o);
        //    };
        //}

    }])
    //.config(function ($mdThemingProvider) {
    //    $mdThemingProvider.theme('dark-grey').backgroundPalette('grey').dark();
    //    $mdThemingProvider.theme('dark-orange').backgroundPalette('orange').dark();
    //    $mdThemingProvider.theme('dark-purple').backgroundPalette('deep-purple').dark();
    //    $mdThemingProvider.theme('dark-blue').backgroundPalette('blue').dark();
    //});