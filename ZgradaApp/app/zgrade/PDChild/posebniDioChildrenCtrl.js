angularApp.controller('posebniDioChildrenCtrl', ['$scope', '$routeParams', '$location', '$rootScope', 'toastr', 'DataService', '$mdDialog',
    function ($scope, $routeParams, $location, $rootScope, toastr, DataService, $mdDialog) {

        $scope.msg = '';
        console.log(DataService.currZgrada);
        if (DataService.currZgrada == null) {
            $location.path('/zgrade');
            return;
        }

        if ($routeParams) {
            if ($routeParams.id > 0) { // pa uvijek ce i biti, master postoji
                // nadji posebniDioMaster
                DataService.currZgrada.Zgrade_PosebniDijeloviMaster.forEach(function (pdMaster) {
                    if (pdMaster.Id == $routeParams.id) {
                        $scope.pdMaster = pdMaster;
                        $scope.msg = pdMaster.Naziv + ' ' + pdMaster.Oznaka;
                    }
                });
            }
            //else {
            //    $scope.msg = "Nova zgrada";
            //    $scope.zgradaObj = {
            //        Id: 0, Naziv: "", Adresa: "", Mjesto: "", Povrsinam2: 0, Zgrade_PosebniDijelovi: [], Zgrade_Stanari: [], Status: ''
            //    };
            //}
        }

        // _________________________________________________________
        //              Modal posebni dio
        // _________________________________________________________
        $scope.openModalPosebniDioChild = function (id) {
            $mdDialog.show({
                controller: 'posebniDioChildModalCtrl',
                templateUrl: 'app/zgrade/PDChild/posebniDioChildModal.html',
                //parent: angular.element(document.body),
                //targetEvent: ev,
                clickOutsideToClose: false,
                fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
                , locals: {
                    id: id,
                    pdMaster: $scope.pdMaster
                }
            }).then(function (pdMaster) {
                // save (hide)
                $scope.pdMaster = pdMaster;
                console.log('pdMaster');
                console.log($scope.pdMaster);
                }, function (pdMaster) {
                // cancel
                    console.log(pdMaster);
                    $scope.pdMaster = pdMaster;
            });
        };


        // _________________________________________________________
        //              Modal povrsine
        // _________________________________________________________
        $scope.openModalPosebniDioChildPovrsina = function (posebniDioChildId, povrsinaId) {
            $mdDialog.show({
                controller: 'posebniDioChildPovrsinaModalCtrl',
                templateUrl: 'app/zgrade/PDChild/posebniDioChildPovrsinaModal.html',
                //parent: angular.element(document.body),
                //targetEvent: ev,
                clickOutsideToClose: false,
                fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
                , locals: {
                    posebniDioChildId: posebniDioChildId,
                    povrsinaId: povrsinaId,
                    pdMaster: $scope.pdMaster
                }
            }).then(function (pdMaster) {
                // save (hide)
                $scope.pdMaster = pdMaster;
                }, function (pdMaster) {
                // cancel
                console.log(pdMaster);
                $scope.pdMaster = pdMaster;
            });
        };


        // _________________________________________________________
        //              Modal pripadci
        // _________________________________________________________
        $scope.openModalPosebniDioChildPripadak = function (posebniDioChildId, pripadakId) {
            $mdDialog.show({
                controller: 'posebniDioChildPripadciModalCtrl',
                templateUrl: 'app/zgrade/PDChild/posebniDioChildPripadciModal.html',
                //parent: angular.element(document.body),
                //targetEvent: ev,
                clickOutsideToClose: false,
                fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
                , locals: {
                    posebniDioChildId: posebniDioChildId,
                    pripadakId: pripadakId,
                    pdMaster: $scope.pdMaster
                }
            }).then(function (pdMaster) {
                // save (hide)
                $scope.pdMaster = pdMaster;
            }, function (pdMaster) {
                // cancel
                console.log(pdMaster);
                $scope.pdMaster = pdMaster;
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