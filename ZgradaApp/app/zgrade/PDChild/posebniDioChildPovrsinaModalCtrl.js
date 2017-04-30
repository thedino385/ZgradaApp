angularApp.controller('posebniDioChildPovrsinaModalCtrl', ['$scope', '$mdDialog', 'posebniDioChildId', 'povrsinaId', 'pdMaster',
    function ($scope, $mdDialog, posebniDioChildId, povrsinaId, pdMaster) {

        // TODOOOOOOOOOOOOOO
        console.log(pdMaster);

        //$scope.zgradaObj = zgradaObj;
        var tempObj = {};
        angular.copy(pdMaster, tempObj);
        if (povrsinaId == 0) {
            $scope.povrsinaObj = {
                Id: 0, PosebniDioChildId: posebniDioChildId, Naziv: '', Oznaka: '', Povrsina: 0,
                Koef: 0, Status: '', VrijediOdGodina: new Date().getFullYear(), VrijediOdMjesec: parseInt(new Date().getMonth() + 1)
            };
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
                maxId = 0;
                pdMaster.Zgrade_PosebniDijeloviChild.forEach(function (child) {
                    child.Zgrade_PosebniDijeloviChild_Povrsine.forEach(function (povrsina) {
                        if (povrsina.Id > maxId) {
                            maxId = povrsina.Id;
                        }
                    });
                });
                $scope.povrsinaObj.Id = maxId + 1;
                $scope.povrsinaObj.Status = 'a';
                pdMaster.Zgrade_PosebniDijeloviChild.forEach(function (child) {
                    if (child.Id == posebniDioChildId) {
                        $scope.povrsinaObj.Status = 'a';
                        child.Status = 'u';
                        child.Zgrade_PosebniDijeloviChild_Povrsine.push($scope.povrsinaObj);
                    }
                });
            }
            else {
                pdMaster.Zgrade_PosebniDijeloviChild.forEach(function (child) {
                    child.Zgrade_PosebniDijeloviChild_Povrsine.forEach(function (povrsina) {
                        if (povrsina.Id == povrsinaId) {
                            povrsina.Status = 'u';
                            child.Status = 'u';
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