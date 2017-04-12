angularApp.controller('zgradaCtrl', ['$scope', '$routeParams', '$location', '$rootScope', 'toastr', 'DataService', '$mdDialog',
    function ($scope, $routeParams, $location, $rootScope, toastr, DataService, $mdDialog) {

        if ($routeParams) {
            console.log($routeParams.id);
            //var _stanovi = [];
            //var _obj = {};

            //var _pripadci = [];
            //DataService.getPripadci().then(
            //    function (result) {
            //    _pripadci = result.data;
            //    },
            //    function (result) {
            //        $rootScope.errMsg = result.Message;
            //    }
            //);

            //DataService.getStanovi().then(
            //function (stanovi) {
            //    stanovi.forEach(function (obj) {
            //        if (obj.ZgradaId == $routeParams.id) {
            //            _stanovi.push(obj);
            //        }
            //    });
            //    IzracunajUkupnePovrsine();
            //});

            if ($routeParams.id > 0) {
                $rootScope.loaderActive = true;
                DataService.getZgrada($routeParams.id).then(
                    function (result) {
                        // on success
                        $scope.zgradaObj = result.data;
                        $rootScope.loaderActive = false;
                        //IzracunajUkupnePovrsine();
                    },
                    function (result) {
                        // on errr
                        alert(result.Message);
                        $rootScope.errMsg = result.Message;
                    }
                );


                //console.log(DataService.listZgrade);
                //DataService.getZgrade().then(function (zgrade) {
                //    console.log(zgrade);
                //    zgrade.forEach(function (obj) {
                //        if ($routeParams.id == obj.Id) {
                //            //angular.copy(obj, _obj);
                //            //console.log(_obj);
                //            console.log("samo obj:" + obj.Povrsinam2);
                //            $scope.obj = obj;
                //            console.log("POVRSSSSSSSSSSSS:" + $scope.obj.Povrsinam2);
                //        }
                //    })
                //})
            }
            else {
                $scope.msg = "Nova zgrada";
                $scope.zgradaObj = {
                    Id: 0, Naziv: "", Adresa: "", Mjesto: "", Povrsinam2: 0, Zgrade_PosebniDijelovi: [], Zgrade_Stanari: []
                };
            }
        }

        $scope.save = function () {
            $rootScope.loaderActive = true;
            // dodaj zgradu u db i DataService.listZgrade array
            DataService.zgradaCreateorUpdate($scope.zgradaObj).then(
                function (result) {
                    // on success
                    //if (result.data > 0) {
                    //    $scope.obj.Id = result.data; // insert, vrati Id sa servera, pukni u obj
                    //    //DataService.listZgrade.push($scope.obj); // dodaj u listu

                    //}
                    //else {
                    //    DataService.listZgrade.forEach(function (obj) {
                    //        if (obj.Id == result.data)
                    //            DataService.listZgrade.obj = $scope.obj;
                    //    })
                    //}
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


        // _________________________________________________________
        //              Modal stanar
        // _________________________________________________________
        $scope.openModalStanar = function (id) {
            $mdDialog.show({
                controller: 'zgradaStanariModalctrl',
                templateUrl: 'app/zgrade/zgradaStanariModal.html',
                //parent: angular.element(document.body),
                //targetEvent: ev,
                clickOutsideToClose: false,
                fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
                , locals: {
                    id: id,
                    zgradaObj: $scope.zgradaObj
                }
            }).then(function (zgradaObj) {
                // save
                $scope.zgradaObj = zgradaObj;
            }, function () {
                alert('cancel je kliknut');
            });
        };


        $scope.goBack = function () {
            $location.path('/zgrade');
        }


        // test
        $scope.showAdvanced = function (id) {
            $mdDialog.show({
                controller: DialogController,
                templateUrl: 'app/zgrade/dialog1.html',
                parent: angular.element(document.body),
                //targetEvent: ev,
                clickOutsideToClose: true,
                fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
                , locals: {
                    id: id, obj: 'pero'
                }
            })
                .then(function (answer) {
                    alert(answer);
                }, function () {
                    alert('cancel je kliknut');
                });
        };


        function DialogController($scope, $mdDialog, id, obj) {
            alert(obj);
            $scope.id = id;
            $scope.obj = obj;

            $scope.hide = function () {
                $mdDialog.hide();
            };

            $scope.cancel = function () {
                $mdDialog.cancel();
            };

            $scope.save = function (obj) {
                $mdDialog.hide('snimi');
            };
        }

    }]);