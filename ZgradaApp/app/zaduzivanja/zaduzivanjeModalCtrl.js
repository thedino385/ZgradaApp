// https://angular-ui.github.io/bootstrap/

angularApp.controller('zaduzivanjeModalCtrl', ['$scope', '$uibModalInstance', 'item',
    function ($scope, $uibModalInstance, item) {

        console.log(item);

        $scope.godine = [];
        $scope.item = item;
        fillGodine();

        function fillGodine() {
            var currentGodina = new Date().getFullYear();
            for (var i = currentGodina-10; i <= currentGodina + 1; i++) {
                var g = { Id: i, Naziv: i };
                $scope.godine.push(g);
            }
            if ($scope.item.Godina == 0)
                $scope.item.Godina = currentGodina;
        }

        $scope.save = function () {
            console.log('save');
            $uibModalInstance.close(item);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        }

}]);