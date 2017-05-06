angularApp.controller('uredjajiModalCtrl', ['$scope', '$mdDialog', 'id', 'zgradaObj',
    function ($scope, $mdDialog, id, zgradaObj) {

        //$scope.zgradaObj = zgradaObj;
        var tempObj = {};
        angular.copy(zgradaObj, tempObj);
        if (id == 0) {
            $scope.zajednickiUredjaj = {
                Id: 0, ZgradaId: zgradaObj.Id, Naziv: '', Napomena: '',
                VrijediOdMjesec: parseInt(new Date().getMonth()) + 1, VrijediOdGodina: new Date().getFullYear(),
                Zatvoren: false, Status: 'a', ZatvorenGodina: null, ZatvorenMjesec: null
            };
            $scope.msg = 'Novi zajednički uređaj';
        }
        else {
            zgradaObj.Zgrade_PopisUredjaja.forEach(function (u) {
                if (u.Id == id)
                    $scope.zajednickiUredjaj = u;
            });
            $scope.msg = 'Uredi zajednički dio';
        }

        $scope.save = function () {
            if (id == 0) {
                maxId = 1;
                zgradaObj.Zgrade_PopisUredjaja.forEach(function (u) {
                    if (u.Id > maxId)
                        maxId = u.Id;
                });
                $scope.zajednickiUredjaj.Id = maxId;
                zgradaObj.Zgrade_PopisUredjaja.push($scope.zajednickiUredjaj);
            }
            else {
                zgradaObj.Zgrade_PopisUredjaja.forEach(function (u) {
                    if (u.Id == $scope.zajednickiUredjaj.Id) {
                        u = $scope.zajednickiUredjaj;
                        u.Status = 'u';
                        u.Zatvoren = false;
                    }
                });
            }
            $mdDialog.hide(zgradaObj);
        };

        $scope.cancel = function () {
            $mdDialog.cancel(tempObj);
        };

    }]);