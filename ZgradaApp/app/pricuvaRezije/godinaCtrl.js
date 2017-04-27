angularApp.controller('godinaCtrl', ['$scope', '$routeParams', '$location', '$route', '$rootScope', 'toastr', 'DataService', '$mdDialog',
    function ($scope, $routeParams, $location, $route, $rootScope, toastr, DataService, $mdDialog) {

        $scope.msg = '';
        $scope.selectedGodina = null;
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
            DataService.getPricuvaRezijeGodinaTable($scope.zgradaObj.Id, godina).then(
                function (result) {
                    // success
                    $scope.godinaTable = result.data;
                    $scope.zgradaObj.PricuvaRezijeGodina.forEach(function (pr) {
                        if (pr.Godina == godina) {
                            $scope.selectedGodina = godina;
                            console.log(pr);
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


        $scope.saveAll = function () {
            save();
        }

        function save () {
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

      

    }])
    //.config(function ($mdThemingProvider) {
    //    $mdThemingProvider.theme('dark-grey').backgroundPalette('grey').dark();
    //    $mdThemingProvider.theme('dark-orange').backgroundPalette('orange').dark();
    //    $mdThemingProvider.theme('dark-purple').backgroundPalette('deep-purple').dark();
    //    $mdThemingProvider.theme('dark-blue').backgroundPalette('blue').dark();
    //});