// https://angular-ui.github.io/bootstrap/

angularApp.controller('zaduzivanjeModalCtrl', ['$scope', '$uibModalInstance', 'item',
    function ($scope, $uibModalInstance, item) {

        $scope.item = item;

        $scope.save = function () {
            console.log('save');
            $uibModalInstance.close(item);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        }

}]);