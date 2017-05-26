angularApp.controller('stanjeOdModalCtrl', ['$scope', '$mdDialog', 'godinaTable', 'zgradaObj',
    function ($scope, $mdDialog, godinaTable, zgradaObj) {

        $scope.godinaTable = godinaTable;
        //$scope.PricuvaRezijeGodina = zgradaObj.PricuvaRezijeGodina

        var list = [];
        var dodani = [];
        var _action = '';
        console.log(zgradaObj.PricuvaRezijeGodina[0].PricuvaRezijeGodina_StanjeOd);
        console.log(zgradaObj.PricuvaRezijeGodina);

        if (zgradaObj.PricuvaRezijeGodina[0].PricuvaRezijeGodina_StanjeOd.length == 0) {
            _action = 'a';
            console.log('nema stanja');
            godinaTable.forEach(function (rec) {
                if (dodani.indexOf(rec.PosebniDioMasterId) == -1) {
                    alert('add ' + rec.PosebniDioMasterId);
                    var o = { Id: 0, PrivuvaRezijeGodId: zgradaObj.PricuvaRezijeGodina[0].Id, PosebniDioMasterId: null, StanjeOd: 0, pdMaster: '' };
                    o.PosebniDioMasterId = rec.PosebniDioMasterId;
                    o.pdMaster = rec.PosebniDioMasterNaziv;
                    list.push(o);
                    dodani.push(rec.PosebniDioMasterId);
                }
            });
            $scope.list = list;
            console.log($scope.list);
        }
        else {
            _action = 'u';
            console.log('stanje postoji');
            godinaTable.forEach(function (rec) {
                console.log(rec.PosebniDioMasterNaziv);
                zgradaObj.PricuvaRezijeGodina[0].PricuvaRezijeGodina_StanjeOd.forEach(function (stanje) {
                    if (rec.PosebniDioMasterId == stanje.PosebniDioMasterId)
                        stanje.pdMaster = rec.PosebniDioMasterNaziv;
                });
            });
            $scope.list = zgradaObj.PricuvaRezijeGodina[0].PricuvaRezijeGodina_StanjeOd;
            console.log($scope.list);
        }

        $scope.save = function () {
            if (_action == 'a')
                zgradaObj.PricuvaRezijeGodina[0].PricuvaRezijeGodina_StanjeOd.push($scope.list);
            else
                $scope.list.forEach(function (m) {
                    zgradaObj.PricuvaRezijeGodina[0].PricuvaRezijeGodina_StanjeOd.forEach(function (s) {
                        if (m.PosebniDioMasterId == s.PosebniDioMasterId)
                            s.StanjeOd = m.StanjeOd;
                    });
                })
            //console.log('save');
            //console.log(zgradaObj.PricuvaRezijeGodina[0].PricuvaRezijeGodina_StanjeOd);
            $mdDialog.hide(zgradaObj);
        }

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

    }]);