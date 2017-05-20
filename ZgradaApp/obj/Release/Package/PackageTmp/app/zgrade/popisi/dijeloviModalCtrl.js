angularApp.controller('dijeloviModalCtrl', ['$scope', '$mdDialog', 'id', 'zgradaObj',
    function ($scope, $mdDialog, id, zgradaObj) {

        //$scope.zgradaObj = zgradaObj;
        var tempObj = {};
        angular.copy(zgradaObj, tempObj);
        if (id == 0) {
            $scope.zajednickiDio = {
                Id: 0, ZgradaId: zgradaObj.Id, Naziv: '', Povrsina: 0, Napomena: '',
                VrijediOdMjesec: parseInt(new Date().getMonth()) + 1, VrijediOdGodina: new Date().getFullYear(),
                Zatvoren: false, Status: 'a', ZatvorenGodina: null, ZatvorenMjesec: null
            };
            $scope.msg = 'Novi zajednički dio';
        }
        else {
            zgradaObj.Zgrade_PopisZajednickihDijelova.forEach(function (dio) {
                if (dio.Id == id)
                    $scope.zajednickiDio = dio;
            });
            $scope.msg = 'Uredi zajednički dio';
        }

        $scope.save = function () {
            if (id == 0) {
                maxId = 1;
                zgradaObj.Zgrade_PopisZajednickihDijelova.forEach(function (dio) {
                    if (dio.Id > maxId)
                        maxId = dio.Id;
                });
                $scope.zajednickiDio.Id = maxId;
                zgradaObj.Zgrade_PopisZajednickihDijelova.push($scope.zajednickiDio);
            }
            else {
                zgradaObj.Zgrade_PopisZajednickihDijelova.forEach(function (dio) {
                    if (dio.Id == $scope.zajednickiDio.Id) {
                        dio = $scope.zajednickiDio;
                        dio.Status = 'u';
                        dio.Zatvoren = false;
                    }
                });
            }
            console.log(zgradaObj);
            $mdDialog.hide(zgradaObj);
        };

        $scope.cancel = function () {
            $mdDialog.cancel(tempObj);
        };

    }]);