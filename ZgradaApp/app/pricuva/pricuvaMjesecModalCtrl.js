// https://angular-ui.github.io/bootstrap/

angularApp.controller('pricuvaMjesecModalCtrl', ['$scope', '$uibModalInstance', 'DataService', 'pricuvaMjesec', 'zgrada', 'godina', 'mjesec',
    function ($scope, $uibModalInstance, DataService, pricuvaMjesec, zgrada, godina, mjesec) {

        $scope.pricuvaMjesec = pricuvaMjesec;
        $scope.zgrada = zgrada;

        $scope.godina = godina;
        $scope.mjesec = mjesec;

        $scope.save = function () {
            console.log('save');
            $uibModalInstance.close(item);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        }

    }]);