angularApp.controller('zgradaCtrl', ['$scope', '$routeParams', '$location', '$rootScope', 'toastr', 'DataService', '$mdDialog',
    function ($scope, $routeParams, $location, $rootScope, toastr, DataService, $mdDialog) {



        if ($routeParams) {
            if ($routeParams.id > 0) {
                $rootScope.loaderActive = true;
                DataService.getZgrada($routeParams.id).then(
                    function (result) {
                        // on success
                        $rootScope.loaderActive = false;
                        $scope.zgradaObj = result.data.Zgrada;
                        $scope.msg = "Uredi zgradu";
                    },
                    function (result) {
                        // on errr
                        $rootScope.loaderActive = false;
                        alert(result.Message);
                        $rootScope.errMsg = result.Message;
                    }
                );
            }
            else {
                $scope.msg = "Nova zgrada";
                $scope.zgradaObj = {
                    Id: 0, Naziv: "", Adresa: "", Mjesto: "", Povrsinam2: 0, Zgrade_PosebniDijelovi: [], Zgrade_Stanari: [], Status: ''
                };
            }
        }

        // _________________________________________________________
        //              Modal stanar
        // _________________________________________________________
        $scope.openModalStanar = function (id) {
            $mdDialog.show({
                controller: 'zgradaStanariModalCtrl',
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
                // save (hide)
                $scope.zgradaObj = zgradaObj;
            }, function (zgradaObj) {
                // cancel
                console.log(zgradaObj);
                $scope.zgradaObj = zgradaObj;
            });
        };


        // _________________________________________________________
        //              Modal posebni dio
        // _________________________________________________________
        $scope.openModalPosebniDio = function (id) {
            $mdDialog.show({
                controller: 'zgradaPosebniDijeloviMasterModalCtrl',
                templateUrl: 'app/zgrade/zgradaPosebniDijeloviMasterModal.html',
                //parent: angular.element(document.body),
                //targetEvent: ev,
                clickOutsideToClose: false,
                fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
                , locals: {
                    id: id,
                    zgradaObj: $scope.zgradaObj
                }
            }).then(function (zgradaObj) {
                // save (hide)
                $scope.zgradaObj = zgradaObj;
            }, function (zgradaObj) {
                // cancel
                console.log(zgradaObj);
                $scope.zgradaObj = zgradaObj;
            });
        };


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


        //function DialogController($scope, $mdDialog, id, obj) {
        //    alert(obj);
        //    $scope.id = id;
        //    $scope.obj = obj;

        //    $scope.hide = function () {
        //        $mdDialog.hide();
        //    };

        //    $scope.cancel = function () {
        //        $mdDialog.cancel();
        //    };

        //    $scope.save = function (obj) {
        //        $mdDialog.hide('snimi');
        //    };
        //}

    }]);