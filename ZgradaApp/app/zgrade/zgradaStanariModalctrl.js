angularApp.controller('zgradaStanariModalCtrl', ['$scope', '$mdDialog', 'id', 'zgradaObj',
    function ($scope, $mdDialog, id, zgradaObj) {

        //$scope.zgradaObj = zgradaObj;
        var tempObj = {};
        angular.copy(zgradaObj, tempObj);
        if (id == 0) {
            $scope.stanarObj = { Id: 0, ZgradaId: zgradaObj.Id, Ime: '', Prezime: '', OIB: '', Email: '', Status: '' };
            $scope.msg = 'Novi stanar';
        }
        else {
            zgradaObj.Zgrade_Stanari.forEach(function (stanar) {
                if (stanar.Id == id)
                    $scope.stanarObj = stanar;
            });
            $scope.msg = 'Uredi stanara';
        }

        $scope.save = function () {
            if (id == 0) {
                maxId = 1;
                zgradaObj.Zgrade_Stanari.forEach(function (stanar) {
                    if (stanar.Id > maxId)
                        maxId = stanar.Id;
                });
                $scope.stanarObj.Id = maxId;
                $scope.stanarObj.Status = 'a';
                zgradaObj.Zgrade_Stanari.push($scope.stanarObj);
            }
            else {
                zgradaObj.Zgrade_Stanari.forEach(function (stanar) {
                    if (stanar.Id > $scope.stanarObj.Id) {
                        stanar.Status = 'u';
                        stanar = $scope.stanarObj;
                    }
                });
            }
            $mdDialog.hide(zgradaObj);
        };

        $scope.cancel = function () {
            $mdDialog.cancel(tempObj);
        };

}]);