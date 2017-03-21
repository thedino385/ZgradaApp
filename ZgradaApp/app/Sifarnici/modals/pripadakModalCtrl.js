// https://angular-ui.github.io/bootstrap/

angularApp.controller('pripadakModalCtrl', ['$scope', '$uibModalInstance', 'DataService', 'item', 'pripadci',
    function ($scope, $uibModalInstance, DataService, item, pripadci) {

        var _povrsinaM2 = 0;
        $scope.pripadakIdChanged = function () {
            pripadci.forEach(function (p) {
                console.log(p);
                if (p.Id == $scope.item.PripadakId) {
                    $scope.item.Naziv = p.Oznaka + "-";
                    $scope.item.VrstaNaziv = p.Naziv;
                    var _povrsinaM2 = parseFloat(p.PovrsinaM2);
                }
                    
            })
        }

        
        $scope.item = item;
        $scope.pripadci = pripadci;

        $scope.save = function () {
            item.PovrsinaSaKoef = parseFloat(_povrsinaM2 * item.Koef / 100).toFixed(2);
            console.log('save');
            $uibModalInstance.close(item);
        };

        $scope.cancel = function () {
            console.log('cancel');
            //$scope.item = { Id: 0, InvoiceId: 0, ProductId: 0, Quantity: 1, Price: 0, Tax: 0, Total: 0 };
            $uibModalInstance.dismiss('cancel');
        }


    }]);