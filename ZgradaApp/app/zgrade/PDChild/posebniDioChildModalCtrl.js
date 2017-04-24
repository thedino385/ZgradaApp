﻿angularApp.controller('posebniDioChildModalCtrl', ['$scope', '$mdDialog', 'id', 'pdMaster',
    function ($scope, $mdDialog, id, pdMaster) {

        //$scope.zgradaObj = zgradaObj;
        var tempObj = {};
        angular.copy(pdMaster, tempObj);
        if (id == 0) {
            $scope.posebniDioChildObj = {
                Id: 0, ZgradaPosDioMasterId: pdMaster.Id, Naziv: '', Oznaka: '', Napomena: '', Status: '',
                Zgrade_PosebniDijeloviChild_Povrsine: [], Zgrade_PosebniDijeloviChild_Pripadci: []
            };
            $scope.msg = 'Novi posebni dio';
        }
        else {
            pdMaster.Zgrade_PosebniDijeloviChild.forEach(function (posebniDioChild) {
                if (posebniDioChild.Id == id)
                    $scope.posebniDioChildObj = posebniDioChild;
            });
            $scope.msg = 'Uredi posebni dio';
        }

        $scope.save = function () {
            if (id == 0) {
                maxId = 0;
                pdMaster.Zgrade_PosebniDijeloviChild.forEach(function (posebniDioChild) {
                    if (posebniDioChild.Id > maxId)
                        maxId = posebniDioChild.Id;
                });
                $scope.posebniDioChildObj.Id = maxId + 1
                $scope.posebniDioChildObj.Status = 'a';
                pdMaster.Zgrade_PosebniDijeloviChild.push($scope.posebniDioChildObj);
            }
            else {
                pdMaster.Zgrade_PosebniDijeloviChild.forEach(function (posebniDioChild) {
                    if (posebniDioChild.Id == $scope.posebniDioChildObj.Id) {
                        posebniDioChild.Status = 'u';
                        posebniDioChild = $scope.posebniDioChildObj;
                    }
                });
            }
            $mdDialog.hide(pdMaster);
        };

        $scope.cancel = function () {
            $mdDialog.cancel(tempObj);
        };

    }]);