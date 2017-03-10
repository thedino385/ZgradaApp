angularApp.controller('stanCtrl', ['$scope', '$routeParams', '$location', '$rootScope', '$uibModal', 'DataService', function (
    $scope, $routeParams, $location, $rootScope, $uibModal, DataService) {

    if ($routeParams) {
        console.log($routeParams.id); // stanId

        var zgradaId = DataService.selectedZgradaId; // iz ove je zgrade

        var pripadci = [];
        DataService.getPripadci().then(function (result) {
            pripadci = result;
            console.log('pripadci: ' + pripadci);
        });
        

        //var stanovi = DataService.getStanovi();
        //console.log('stanovi: ' + stanovi);

        if ($routeParams.id > 0) {
            $scope.msg = "Uredi stan";
            DataService.getStanovi().then(
                function (stanovi) {
                    stanovi.forEach(function (obj) {
                        if ($routeParams.id == obj.Id) {
                            $scope.obj = obj;
                        }
                    });
              }
          )
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

        $scope.backToStanovi = function () {
            console.log(zgradaId + " stan back to stanovi");
            $location.path('/stanovi/' + zgradaId);
        }

        // _________________________________________________________________
        //
        //                  D E L E T E FNs
        // _________________________________________________________________
        $scope.deleteDio = function (dio) {
            var index = $scope.obj.Stanovi_PosebniDijelovi.indexOf(dio)
            $scope.obj.Stanovi_PosebniDijelovi.splice(index, 1);
        }
        $scope.deletePripadak = function (pripadak) {
            $scope.obj.Stanovi_Pripadci.splice($scope.obj.Stanovi_Pripadci.indexOf(pripadak), 1);
        }
        $scope.deleteStanar = function (stanar) {
            $scope.obj.Stanovi_Stanari.splice($scope.obj.Stanovi_Stanari.indexOf(stanar), 1);
        }

        

        // _________________________________________________________________
        // 
        //                  M O D A L I
        // _________________________________________________________________

        // _________________________
        //      posebni dio
        // _________________________
        $scope.newItemDio = { Id: 0, StanId: $routeParams.id, Naziv: "", PovrsinaM2: 0, PovrsinaPosto: 0 }
        $scope.openModalDio = function (item) {
            var tempObj = {};
            angular.copy(item, tempObj);
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
                //else {
                //    $scope.obj.Stanovi_PosebniDijelovi.forEach(function (dio) {
                //        if (dio.Id == item.Id)
                //            $scope.obj.Stanovi_PosebniDijelovi.dio = item;
                //    });
                //}
            }, function () {
                $scope.newItemDio = { Id: 0, StanId: $routeParams.id, Naziv: "", PovrsinaM2: 0, PovrsinaPosto: 0 }
                if (item.Id > 0) {
                    // vrati objekt u prethodno stanje (tempObj)
                    $scope.obj.Stanovi_PosebniDijelovi.forEach(function (dio) {
                        if (dio.Id == item.Id) {
                            dio.Naziv = tempObj.Naziv;
                            dio.PovrsinaM2 = tempObj.PovrsinaM2;
                            dio.PovrsinaPosto = tempObj.PovrsinaPosto
                        }
                    });
                }
            });
        };


        // _________________________
        //      pripadci
        // _________________________
        $scope.newItemPripadak = { Id: 0, StanId: $routeParams.id, PripadakId: null, Naziv: "", PovrsinaM2: 0, PovrsinaPosto: 0 }
        $scope.openModalPripadak = function (item) {
            var tempObj = {};
            angular.copy(item, tempObj);
            console.log(item);
            var modalInstance = $uibModal.open({
                templateUrl: '../app/Sifarnici/modals/pripadakModal.html',
                //controller: function ($scope, $uibModalInstance, item) {
                //    $scope.item = item;
                //},
                controller: 'pripadakModalCtrl',
                size: 'lg',
                resolve: {
                    item: function () {
                        return item;
                    },
                    pripadci: function () {
                        //console.log(pripadci);
                        return pripadci;
                    }
                }
            });

            modalInstance.result.then(function (item) {
                console.log("modal result fn");
                if (item.Id == 0) {
                    // add new
                    var maxId = 0;
                    $scope.obj.Stanovi_Pripadci.forEach(function (obj) {
                        if (obj.Id > maxId)
                            maxId = obj.Id;
                    });
                    item.Id = maxId + 1;
                    $scope.obj.Stanovi_Pripadci.push(item);
                    console.log($scope.obj.Stanovi_Pripadci);
                    $scope.openModalPripadak = { Id: 0, StanId: $routeParams.id, PripadakId: null, Naziv: "", PovrsinaM2: 0, PovrsinaPosto: 0 }
                }
                //else {
                //    $scope.obj.Stanovi_Pripadci.forEach(function (dio) {
                //        if (dio.Id == item.Id)
                //            $scope.obj.Stanovi_Pripadci.dio = item;
                //    });
                //}
            }, function () {
                // modal dismiss
                $scope.openModalPripadak = { Id: 0, StanId: $routeParams.id, PripadakId: null, Naziv: "", PovrsinaM2: 0, PovrsinaPosto: 0 }
                if (item.Id > 0) {
                    // vrati objekt u prethodno stanje (tempObj)
                    $scope.obj.Stanovi_Pripadci.forEach(function (dio) {
                        if (dio.Id == item.Id) {
                            dio.Naziv = tempObj.Naziv;
                            dio.PovrsinaM2 = tempObj.PovrsinaM2;
                            dio.PovrsinaPosto = tempObj.PovrsinaPosto
                        }
                            
                    });
                }
            });
        }; // end of pripadak modal

        // _________________________
        //       stanari
        // _________________________
        $scope.newItemStanar = { Id: 0, StanId: $routeParams.id, Ime: "", Prezime: "", OIB: "", Email: "", Udjel: 0 }
        $scope.openModalStanar = function (item) {
            var tempObj = {};
            angular.copy(item, tempObj);
            console.log(item);
            var modalInstance = $uibModal.open({
                templateUrl: '../app/Sifarnici/modals/stanarModal.html',
                //controller: function ($scope, $uibModalInstance, item) {
                //    $scope.item = item;
                //},
                controller: 'stanarModalCtrl',
                size: 'lg',
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
                    $scope.obj.Stanovi_Stanari.forEach(function (obj) {
                        if (obj.Id > maxId)
                            maxId = obj.Id;
                    });
                    item.Id = maxId + 1;
                    $scope.obj.Stanovi_Stanari.push(item);
                    console.log($scope.obj.Stanovi_Stanari);
                    $scope.newItemStanar = { Id: 0, StanId: $routeParams.id, Ime: "", Prezime: "", OIB: "", Email: "", Udjel: 0 }
                }
            }, function () {
                // modal dismiss
                $scope.newItemStanar = { Id: 0, StanId: $routeParams.id, Ime: "", Prezime: "", OIB: "", Email: "", Udjel: 0 }
                if (item.Id > 0) {
                    // vrati objekt u prethodno stanje (tempObj)
                    $scope.obj.Stanovi_Stanari.forEach(function (stanar) {
                        if (stanar.Id == item.Id) {
                            stanar.Ime = tempObj.Ime;
                            stanar.Prezime = tempObj.Prezime;
                            stanar.OIB = tempObj.OIB;
                            stanar.Email = tempObj.Email;
                            stanar.Udjel = tempObj.Udjel;
                        }

                    });
                }
            });
        }; // end of stanar modal



    }; // if ($routeParams)
}]);