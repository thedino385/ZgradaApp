angularApp.controller('uredjajiModalCtrl', ['$scope', '$mdDialog', 'id', 'zgradaObj',
    function ($scope, $mdDialog, id, zgradaObj) {

        //$scope.zgradaObj = zgradaObj;
        var tempObj = {};
        angular.copy(zgradaObj, tempObj);
        if (id == 0) {
            $scope.zajednickiUredjaj = {
                Id: 0, ZgradaId: zgradaObj.Id, Naziv: '', Napomena: '',
                VrijediOdMjesec: parseInt(new Date().getMonth()) + 1, VrijediOdGodina: new Date().getFullYear(),
                Zatvoren: false, Status: 'a', ZatvorenGodina: null, ZatvorenMjesec: null, Notifikacija_dt: null, NotifikacijaText: null
            };
            $scope.msg = 'Novi zajednički uređaj';
            $scope.Notifikacija_dt = null;
        }
        else {
            console.log(id);
            zgradaObj.Zgrade_PopisUredjaja.forEach(function (u) {
                if (u.Id == id) {
                    $scope.zajednickiUredjaj = u;
                    $scope.Notifikacija_dt = new Date(u.Notifikacija_dt);
                }
                    
            });
            $scope.msg = 'Uredi zajednički dio';
        }

        $scope.save = function () {
            $('nav').fadeIn();
            if (id == 0) {
                maxId = 1;
                zgradaObj.Zgrade_PopisUredjaja.forEach(function (u) {
                    if (u.Id > maxId)
                        maxId = u.Id;
                });
                //console.log($scope.Notifikacija_dt);
                $scope.zajednickiUredjaj.Id = maxId;
                $scope.zajednickiUredjaj.Notifikacija_dt = $scope.Notifikacija_dt;
                zgradaObj.Zgrade_PopisUredjaja.push($scope.zajednickiUredjaj);
            }
            else {
                zgradaObj.Zgrade_PopisUredjaja.forEach(function (u) {
                    if (u.Id == $scope.zajednickiUredjaj.Id) {
                        u = $scope.zajednickiUredjaj;
                        u.Status = 'u';
                        u.Zatvoren = false;
                        u.Notifikacija_dt = $scope.Notifikacija_dt;
                    }
                });
            }
            $mdDialog.hide(zgradaObj);
        };

        $scope.cancel = function () {
            $('nav').fadeIn();
            $mdDialog.cancel(tempObj);
        };

    }]);