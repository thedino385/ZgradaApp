// https://angular-ui.github.io/bootstrap/

angularApp.controller('pripadakModalCtrl', ['$scope', '$uibModalInstance', 'DataService', 'item', 'pripadci',
    function ($scope, $uibModalInstance, DataService, item, pripadci) {

    $scope.item = item;
    console.log(item);
    console.log(pripadci);

    $scope.pripadci = pripadci;

    $scope.save = function () {
        console.log('save');
        $uibModalInstance.close(item);
    };

    $scope.cancel = function () {
        console.log('cancel');
        //$scope.item = { Id: 0, InvoiceId: 0, ProductId: 0, Quantity: 1, Price: 0, Tax: 0, Total: 0 };
        $uibModalInstance.dismiss('cancel');
    }

}]);