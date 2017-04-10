// https://angular-ui.github.io/bootstrap/

angularApp.controller('posebniDioModalCtrl', ['$scope', '$uibModalInstance', 'DataService', 'item', 'posebniDijelovi',
    function ($scope, $uibModalInstance, DataService, item, posebniDijelovi) {

    $scope.item = item;
    $scope.posebniDijelovi = posebniDijelovi;

    $scope.save = function () {
        console.log('save');
        item.PovrsinaSaKoef = parseFloat(item.PovrsinaM2 * item.Koef / 100).toFixed(2);
        $uibModalInstance.close(item);
    };

    $scope.cancel = function () {
        console.log('cancel');
        //$scope.item = { Id: 0, InvoiceId: 0, ProductId: 0, Quantity: 1, Price: 0, Tax: 0, Total: 0 };
        $uibModalInstance.dismiss('cancel');
    }

    $scope.posebniDioIdChanged = function () {
        posebniDijelovi.forEach(function (p) {
            if (p.Id == $scope.item.PosebniDioId) {
                $scope.item.Oznaka = p.Oznaka + "-";
                //$scope.item.VrstaNaziv = p.Naziv;
            }

        })
    }

}]);