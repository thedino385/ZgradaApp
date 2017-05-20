angularApp.controller('zaduzivanjePoMjCtrl', ['$scope', '$routeParams', '$location', '$uibModal', '$rootScope', 'toastr', 'DataService',
    function ($scope, $routeParams, $location, $uibModal, $rootScope, toastr, DataService) {

    if ($routeParams.id > 0) {
        $scope.msg = "Uredi zgradu";
        $rootScope.loaderActive = true;
        DataService.getZgrada($routeParams.id).then(
            function (result) {
                // on success
                $scope.obj = result.data;
                $rootScope.loaderActive = false;
                $scope.msg = "Zaduživanje po mjesecima";
                $scope.msgZgrada = $scope.obj.Naziv + ", " + $scope.obj.Adresa + ", " + $scope.obj.Mjesto;
            },
            function (result) {
                // on errr
                $rootScope.errMsg = result.Message;
            }
        );

        //DataService.getZgrade().then(function (zgrade) {
        //    zgrade.forEach(function (obj) {
        //        if ($routeParams.id == obj.Id) {
        //            $scope.obj = obj;
        //        }
        //    })
        //    $scope.msg = "Zaduživanje po mjesecima";
        //    $scope.msgZgrada = $scope.obj.Naziv + ", " + $scope.obj.Adresa + ", " + $scope.obj.Mjesto;
        //})
    }

    $scope.save = function () {
        DataService.zaduzenjeCreateUpdate($scope.obj.Zgrade_ZaduzivanjePoMj).then(
            function (result) {
                // success
                toastr.success('Promjene su snimljene!', '');
            },
            function (result) {
                // on error
                alert('err');
            }
        )
    }

    $scope.novaGodina = { Id: 0, ZgradaId: $routeParams.id, Godina: 0, Mj1: 0, Mj2: 0, Mj3: 0, Mj4: 0, Mj5: 0, Mj6: 0, Mj7: 0, Mj8: 0, Mj9: 0, Mj10: 0, Mj11: 0, Mj12: 0 };
    $scope.openModal = function (item) {
        var tempObj = {};
        angular.copy(item, tempObj);
        var modalInstance = $uibModal.open({
            templateUrl: '../app/zaduzivanja/zaduzivanjeModal.html',
            //controller: function ($scope, $uibModalInstance, item) {
            //    $scope.item = item;
            //},
            controller: 'zaduzivanjeModalCtrl',
            size: 'lg',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                item: function () {
                    return item;
                },
            }
        });

        modalInstance.result.then(function (item) {
            console.log("modal result fn");
            if (item.Id == 0) {
                // add new
                var maxId = 0;
                item.Status = "a";
                $scope.obj.Zgrade_ZaduzivanjePoMj.forEach(function (obj) {
                    if (obj.Id > maxId)
                        maxId = obj.Id;
                });
                item.Id = maxId + 1;
                $scope.obj.Zgrade_ZaduzivanjePoMj.push(item);
            }
            else {
                item.Status = "u";
            }
        }, function () {
            // modal dismiss
            //$scope.newItemPripadak = { Id: 0, StanId: $routeParams.id, PripadakId: null, Naziv: "", PovrsinaM2: 0, PovrsinaPosto: 0 }
            if (item.Id > 0) {
                // vrati objekt u prethodno stanje (tempObj)
                $scope.obj.Zgrade_ZaduzivanjePoMj.forEach(function (dio) {
                    if (dio.Id == item.Id) {
                        dio.Id = tempObj.Id;
                        dio.Godina = tempObj.Godina;
                        dio.Mj1 = tempObj.Mj1;
                        dio.Mj2 = tempObj.Mj2;
                        dio.Mj3 = tempObj.Mj3;
                        dio.Mj4 = tempObj.Mj4;
                        dio.Mj5 = tempObj.Mj5;
                        dio.Mj6 = tempObj.Mj6;
                        dio.Mj7 = tempObj.Mj7;
                        dio.Mj8 = tempObj.Mj8;
                        dio.Mj9 = tempObj.Mj9;
                        dio.Mj10 = tempObj.Mj10;
                        dio.Mj11 = tempObj.Mj11;
                        dio.Mj12 = tempObj.Mj12;
                    }
                });
            }
        });
        $scope.novaGodina = { Id: 0, ZgradaId: $routeParams.id, Godina: 0, Mj1: 0, Mj2: 0, Mj3: 0, Mj4: 0, Mj5: 0, Mj6: 0, Mj7: 0, Mj8: 0, Mj9: 0, Mj10: 0, Mj11: 0, Mj12: 0 };
    };

}]);