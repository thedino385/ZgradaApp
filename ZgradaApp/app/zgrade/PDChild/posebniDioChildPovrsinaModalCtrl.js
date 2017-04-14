angularApp.controller('posebniDioChildPovrsinaModalCtrl', ['$scope', '$mdDialog', 'posebniDioChildId', 'povrsinaId', 'pdMaster',
    function ($scope, $mdDialog, posebniDioChildId, povrsinaId, pdMaster) {

        // TODOOOOOOOOOOOOOO
        console.log(pdMaster);

        //$scope.zgradaObj = zgradaObj;
        var tempObj = {};
        angular.copy(pdMaster, tempObj);
        if (povrsinaId == 0) {
            $scope.povrsinaObj = { Id: 0, PosebniDioChildId: pdMaster.Id, Naziv: '', Oznaka: '', Povrsina: 0, Koef: 0, Status: '' };
            $scope.msg = 'Nova površina';
        }
        else {
            pdMaster.Zgrade_PosebniDijeloviChild.forEach(function (child) {
                child.Zgrade_PosebniDijeloviChild_Povrsine.forEach(function (povrsina) {
                    if (povrsinaId == povrsina.Id)
                        $scope.povrsinaObj = povrsina;
                });
            });
            $scope.msg = 'Uredi površinu';
        }

        $scope.save = function () {
            if (povrsinaId == 0) {
                maxId = 1;
                pdMaster.Zgrade_PosebniDijeloviChild.forEach(function (child) {
                    child.Zgrade_PosebniDijeloviChild_Povrsine.forEach(function (povrsina) {
                        if (povrsina.Id > maxId) {
                            maxId = povrsina.Id;
                        }
                    });
                });
                $scope.povrsinaObj.Id = maxId;
                $scope.povrsinaObj.Status = 'a';
                pdMaster.Zgrade_PosebniDijeloviChild.forEach(function (child) {
                    if (child.Id == posebniDioChildId) {
                        child.Zgrade_PosebniDijeloviChild_Povrsine.push($scope.povrsinaObj);
                    }
                });
            }
            else {
                pdMaster.Zgrade_PosebniDijeloviChild.forEach(function (child) {
                    child.Zgrade_PosebniDijeloviChild_Povrsine.forEach(function (povrsina) {
                        if (povrsina.Id == povrsinaId) {
                            povrsina.Status = 'u';
                            povrsina = $scope.povrsinaObj;
                        }

                    });
                });
            }
            $mdDialog.hide(pdMaster);
        };

        $scope.cancel = function () {
            $mdDialog.cancel(tempObj);
        };

    }]);