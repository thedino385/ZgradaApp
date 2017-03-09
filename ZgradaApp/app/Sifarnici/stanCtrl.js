angularApp.controller('stanCtrl', ['$scope', '$routeParams', '$location', '$rootScope', '$uibModal', 'DataService', function (
    $scope, $routeParams, $location, $rootScope, $uibModal, DataService) {

    if ($routeParams) {
        console.log($routeParams.id); // stanId

        var zgradaId = DataService.selectedZgradaId; // iz ove je zgrade

        if ($routeParams.id > 0) {
            $scope.msg = "Uredi stan";
            DataService.listStanovi.forEach(function (obj) {
                if ($routeParams.id == obj.Id) {
                    $scope.obj = obj;
                }
            });
        }
        else {
            $scope.msg = "Dodaj stan";
            $scope.obj = {
                Id: 0, ZgradaId: zgradaId, Naziv: "", PovrsinaM2: 0, PovrsinaPosto: 0, Povrsinam2: 0, SumaPovrsinaM2: 0, SumaPovrsinaPosto: 0,
                Stanovi_PosebniDijelovi: [], Stanovi_Pripadci: [], Stanovi_Stanari: []
            };
        }


        $scope.save = function () {
            console.log('save fn');
            $scope.obj.ZgradaId = zgradaId;
            $rootScope.loaderActive = true;
            DataService.stanCreateUpdate($scope.obj).then(
                function (result) {
                    // on success
                    if (result.data > 0) {
                        $scope.obj.Id = result.data; // insert, vrati Id sa servera, pukni u obj
                        DataService.listStanovi.push($scope.obj); // dodaj u listu
                    }
                    else {
                        DataService.listStanovi.forEach(function (obj) {
                            if (obj.Id == result.data)
                                DataService.listStanovi.obj = $scope.obj;
                        })
                    }
                    $rootScope.loaderActive = false;
                    $location.path('/stanovi/' + zgradaId);
                    console.log(DataService.listStanovi);
                },
                function (result) {
                    // on error
                    $rootScope.errMsg = result.Message;
                }
            )
        }

        // _________________________________________________________________
        // 
        //                  M O D A L I
        // _________________________________________________________________
        
        // posebni dio
        
        $scope.newItemDio = { Id: 0, StanId: $routeParams.id, Naziv: "", PovrsinaM2: 0, PovrsinaPosto: 0 }
        $scope.openModalDio = function (item) {
            console.log(item);
            var modalInstance = $uibModal.open({
                templateUrl: '../app/Sifarnici/modals/posebniDioModal.html',
                //controller: function ($scope, $uibModalInstance, item) {
                //    $scope.item = item;
                //},
                controller: 'posebniDioModalCtrl',
                size: 'lg',
                resolve: {
                    item: function () {
                        return item;
                    }
                }
            });

            modalInstance.result.then(function (item) {
                console.log(item);
                if (item.Id == 0) {
                    // add new
                    var maxId = 0;
                    $scope.obj.Stanovi_PosebniDijelovi.forEach(function (obj) {
                        if (obj.Id > maxId)
                            maxId = obj.Id;
                    });
                    item.Id = maxId + 1;
                    $scope.obj.Stanovi_PosebniDijelovi.push(item);
                    console.log($scope.obj.Stanovi_PosebniDijelovi);
                    $scope.newItemDio = { Id: 0, StanId: $routeParams.id, Naziv: "", PovrsinaM2: 0, PovrsinaPosto: 0 }
                }
                else {
                    $scope.obj.Stanovi_PosebniDijelovi.forEach(function (dio) {
                        if (dio.Id == item.Id)
                            $scope.obj.Stanovi_PosebniDijelovi.dio = item;
                    });
                }
            }, function () {
                //$scope.newItem = { Id: 0, InvoiceId: 0, ProductId: 0, Quantity: 1, Price: 0, Tax: 0, Total: 0 };
            });
        };




    };

}]);