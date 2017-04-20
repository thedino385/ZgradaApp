angularApp.controller('godinaCtrl', ['$scope', '$routeParams', '$location', '$rootScope', 'toastr', 'DataService', '$mdDialog',
    function ($scope, $routeParams, $location, $rootScope, toastr, DataService, $mdDialog) {

        $scope.msg = '';
        if ($routeParams) {
            $rootScope.loaderActive = true;
            DataService.getZgrada($routeParams.id).then(
                function (result) {
                    // on success
                    $scope.zgradaObj = result.data;
                    var godineList = [];
                    $scope.zgradaObj.PricuvaRezijeGodina.forEach(function (pr) {
                        godineList.push(pr.Godina);
                    });
                    //$scope.posedbiDijelovi = $scope.zgradaObj.Zgrade_PosebniDijeloviMaster;
                    $scope.godine = godineList;
                    $scope.msg = $scope.zgradaObj.Naziv + ' ' + $scope.zgradaObj.Adresa;
                    $rootScope.loaderActive = false;

                    //DataService.getSifarnikRashoda().then(
                    //    function (result) {
                    //        $scope.sifarnikRashoda = result.data;
                    //    },
                    //    function (result) {
                    //        toastr.error('Dohvat šifarnika rashoda nije uspio');
                    //    });
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
            //$scope.prihodRashodZaGodinu = { Id: 0, ZgradaId: $scope.zgradaObj.Id, Godina: godina, PrihodiRashodi_Prihodi: [], PrihodiRashodi_Rashodi: [] }
            $scope.zgradaObj.PricuvaRezijeGodina.forEach(function (pr) {
                if (pr.Godina == godina) {
                    console.log('godina changed, prihosdiRashodiza godinu');
                    console.log(pr);
                    $scope.pricuvaRezijeGodina = pr;
                }
            });
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
        $scope.openMjesecno = function (mjesec) {
            $mdDialog.show({
                controller: 'mjesecModalCtrl',
                templateUrl: 'app/pricuvaRezije/mjesecModal.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: false,
                fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
                , locals: {
                    pricuvaRezijeGodina: $scope.pricuvaRezijeGodina,
                    mjesec: mjesec,
                }
            }).then(function (pricuvaRezijeGodina) {
                // save (hide)
                $scope.pricuvaRezijeGodina = pricuvaRezijeGodina;
                //console.log($scope.prihodRashodZaGodinu);
                }, function (pricuvaRezijeGodina) {
                // cancel
                //console.log(prihodRashodZaGodinu);
                    $scope.pricuvaRezijeGodina = pricuvaRezijeGodina;
            });
        };


       

        $scope.saveAll = function () {
            $rootScope.loaderActive = true;
            DataService.prihodiRashodiCreateOrUpdate($scope.zgradaObj).then(
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

       
        

    }])
    //.config(function ($mdThemingProvider) {
    //    $mdThemingProvider.theme('dark-grey').backgroundPalette('grey').dark();
    //    $mdThemingProvider.theme('dark-orange').backgroundPalette('orange').dark();
    //    $mdThemingProvider.theme('dark-purple').backgroundPalette('deep-purple').dark();
    //    $mdThemingProvider.theme('dark-blue').backgroundPalette('blue').dark();
    //});