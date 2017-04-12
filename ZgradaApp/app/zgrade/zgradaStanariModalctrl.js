angularApp.controller('zgradaStanariModalctrl', ['$scope', '$mdDialog', 'id', 'zgradaObj',
    function ($scope, $mdDialog, id, zgradaObj) {

        //$scope.zgradaObj = zgradaObj;
        if (id == 0) {
            $scope.stanarObj = { Id: 0, ZgradaId: zgradaObj.Id, Ime: '', Prezime: '', OIB: '', Email: '' };
            $scope.msg = 'Novi stanar';
        }


        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.save = function () {
            if (id == 0) {
                zgradaObj.Zgrade_Stanari.push($scope.stanarObj);
            }

            $mdDialog.hide(zgradaObj);
        };

}]);