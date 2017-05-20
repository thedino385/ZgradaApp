angularApp.controller('zgradaPosebniDijeloviMasterModalCtrl', ['$scope', '$mdDialog', 'id', 'zgradaObj',
    function ($scope, $mdDialog, id, zgradaObj) {

        //$scope.zgradaObj = zgradaObj;
        var tempObj = {};
        angular.copy(zgradaObj, tempObj);
        if (id == 0) {
            $scope.posebniDioMasterObj = { Id: 0, ZgradaId: zgradaObj.Id, Naziv: '', Oznaka: '', Zatvoren: false, Status: '' };
            $scope.msg = 'Novi posebni dio';
        }
        else {
            zgradaObj.Zgrade_PosebniDijeloviMaster.forEach(function (posebniDioMaster) {
                if (posebniDioMaster.Id == id)
                    $scope.posebniDioMasterObj = posebniDioMaster;
            });
            $scope.msg = 'Uredi posebni dio';
        }

        $scope.save = function () {
            if (id == 0) {
                maxId = 1;
                zgradaObj.Zgrade_PosebniDijeloviMaster.forEach(function (posebniDioMaster) {
                    if (posebniDioMaster.Id > maxId)
                        maxId = posebniDioMaster.Id;
                });
                $scope.posebniDioMasterObj.Id = maxId;
                $scope.posebniDioMasterObj.Status = 'a';
                $scope.posebniDioMasterObj.Zatvoren = false;
                zgradaObj.Zgrade_PosebniDijelovi.push($scope.posebniDioMasterObj);
            }
            else {
                zgradaObj.Zgrade_PosebniDijeloviMaster.forEach(function (posebniDioMaster) {
                    if (posebniDioMaster.Id == $scope.posebniDioMasterObj.Id) {
                        posebniDioMaster.Status = 'u';
                        posebniDioMaster.Zatvoren = false;
                        posebniDioMaster = $scope.posebniDioMasterObj;
                    }
                });
            }
            $mdDialog.hide(zgradaObj);
        };

        $scope.cancel = function () {
            $mdDialog.cancel(tempObj);
        };

    }]);