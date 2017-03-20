angularApp.controller('editPrihRasCtrl', ['$scope', '$rootScope', '$location', '$uibModal', 'DataService',
    function ($scope, $rootScope, $location, $uibModal, DataService) {

    if (DataService.selectedZgrada == null) {
        $location.path('prihodirashodi');
        return;
    }
        
    //var godine = [];
    var gList = [];
    var g = {};
    $scope.obj = {}; // ovo je object za izabranu godinu
    $scope.zgrada = DataService.selectedZgrada;

    DataService.getPr(DataService.selectedZgrada.Id).then(
        function (result) {
            $scope.prihodiRashodi = result.data; // ovo su sve godine selected zgrade
            if ($scope.prihodiRashodi.length > 0) {
                var maxGodina = 0;
                $scope.prihodiRashodi.forEach(function (g) {
                    g = { Godina: g.Godina };
                    gList.push(g)
                    maxGodina = g.Godina;
                });
                g = { Godina: maxGodina };
                gList.push(g)
                $scope.godine = gList;
                $scope.SelectedGodina = $scope.prihodiRashodi[0].Godina;
                $scope.obj = $scope.prihodiRashodi[0];
            }
            else {
                g = { Godina: new Date().getFullYear() };
                gList.push(g)
                // dodaj josjednu godinu
                g = { Godina: parseInt(new Date().getFullYear()) + 1 };
                gList.push(g)
                $scope.godine = gList;
                $scope.SelectedGodina = new Date().getFullYear();
            }
                
        },
        function (result) {
            // on error
        }
    )
    $scope.godinaChanged = function () {
        alert($scope.SelectedGodina);
        $scope.prihodiRashodi.forEach(function (pr) {
            if (pr.Godina == $scope.SelectedGodina)
                $scope.obj = pr;
        });
    };

    // provjeri lleap year
    $scope.getFebDay = function () {
        var year = new Date().getFullYear();
        if (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0))
            return 29;
        return 28;
    }


    // _______________________________________________________________
    // modal Prihodi
    // _______________________________________________________________
    $scope.noviPrihod = {
        Id: 0, PrihodiRashodiMasterId: $scope.obj.Id, Datun: null, Opis: "", Iznos: 0, Razlika: 0, Placeno: 0, Vrsta: "p" };
    $scope.openModalPrihodi = function (item) {
        var tempObj = {};
        angular.copy(item, tempObj);
        var modalInstance = $uibModal.open({
            templateUrl: '../app/PihRas/modalPrihod.html',
            controller: 'modalPrihodCtrl',
            size: 'lg',
            backdrop: 'static',
            keyboard: false,
            resolve: {
                item: function () {
                    return item;
                },
                // TODO
               // pricuva: function () {
                    // za prihode se za svaki mjesec prenosi 'Uplata pricuve' - suma uplata svhih stanova za mjesec (PricuvaGod)
                    // zato sume ne snimati vec ih on the fly izracunati
                    //return $scope.obj;
                //},
            }
        });

        modalInstance.result.then(function (item) {
            console.log("modal result fn");
            if (item.Id == 0) {
                // add new
                var maxId = 0;
                $scope.obj.PrihodiRashodiDetails.forEach(function (obj) {
                    if (obj.Id > maxId)
                        maxId = obj.Id;
                });
                item.Id = maxId + 1;
                item.Status = "a";
            }
            else {
                item.Status = "u";
            }
        }, function () {
            // modal dismiss
            //$scope.newItemPripadak = { Id: 0, StanId: $routeParams.id, PripadakId: null, Naziv: "", PovrsinaM2: 0, PovrsinaPosto: 0 }
            if (item.Id > 0) {
                // vrati objekt u prethodno stanje (tempObj)
                $scope.obj.PrihodiRashodiDetails.forEach(function (dio) {
                    if (dio.Id == item.Id) {
                        dio.Datum = tempObj.Datum;
                        dio.Opis = tempObj.Opis;
                        dio.Iznos = tempObj.Iznos;
                        dio.Razlika = tempObj.Razlika;
                        dio.Placeno = tempObj.Placeno;
                    }
                });
            }
        });
        $scope.noviPrihod = {
            Id: 0, PrihodiRashodiMasterId: $scope.obj.Id, Datun: null, Opis: "", Iznos: 0, Razlika: 0, Placeno: 0, Vrsta: "p"
        };
    }; // end of prihod modal stuff

}]);