angularApp.controller('posebniDioMasterVlasniciModalCtrl', ['$scope', '$mdDialog', 'periodId', 'pdMaster', 'zgrada',
    function ($scope, $mdDialog, periodId, pdMaster, zgrada) {

        $scope.stanari = zgrada.Zgrade_Stanari;

        //samo jedni vlasnik/vlasnici mogu biti aktivni !!!
        // ako je periodId == 0, dodaje se vlasnik - ako postoji vlasnik aktivan, disableati add btn
        var tempObj = {};
        angular.copy(pdMaster, tempObj);
        if (periodId == 0) {
            $scope.vlasniciPeriod = {
                Id: 0, PosebniDioMasterId: pdMaster.Id, VrijediOdMjesec: parseInt(new Date().getMonth() + 1),
                VrijediOdGodina: new Date().getFullYear(),
                VrijediDoMjesec: null, VrijediDoGodina: null, Status: 'a',
                Zgrade_PosebniDijeloviMaster_VlasniciPeriod_Vlasnici: []
            };
            $scope.msg = 'Dodaj vlasnike';
        }
        else {
            pdMaster.Zgrade_PosebniDijeloviMaster_VlasniciPeriod.forEach(function (period) {
                if (period.Ugasen != false) {
                    $scope.vlasniciPeriod = period;
                    $scope.vlasnici = period.Zgrade_PosebniDijeloviMaster_VlasniciPeriod_Vlasnici[0];
                }
            });
            $scope.msg = 'Uredi vlasnike';
        }

        $scope.dodajVlasnika = function () {
            var maxId = 0;
            $scope.vlasniciPeriod.Zgrade_PosebniDijeloviMaster_VlasniciPeriod_Vlasnici.forEach(function (vlasnik) {
                if (vlasnik.Id > maxId)
                    maxId = vlasnik.Id;
            });

            var vlasnikObj = { Id: maxId+1, VlasniciPeriodId: $scope.vlasniciPeriod.Id, StanarId: 0, Udio: 0 };
            $scope.vlasniciPeriod.Zgrade_PosebniDijeloviMaster_VlasniciPeriod_Vlasnici.push(vlasnikObj);
        }

        $scope.obrisiVlasnika = function (vlasnikId) {
            var v = null;
            $scope.vlasniciPeriod.Zgrade_PosebniDijeloviMaster_VlasniciPeriod_Vlasnici.forEach(function (vlasnik) {
                if (vlasnik.Id == vlasnikId)
                    v = vlasnik;
            });
            var index = $scope.vlasniciPeriod.Zgrade_PosebniDijeloviMaster_VlasniciPeriod_Vlasnici.indexOf(v);
            $scope.vlasniciPeriod.Zgrade_PosebniDijeloviMaster_VlasniciPeriod_Vlasnici.splice(index, 1);
        }

        $scope.save = function () {
            if (periodId == 0) {
                maxId = 0;
                pdMaster.Zgrade_PosebniDijeloviMaster_VlasniciPeriod.forEach(function (period) {
                    if (period.Id > maxId)
                        maxId = period.Id;
                });
                $scope.vlasniciPeriod.Id = maxId + 1
                $scope.vlasniciPeriod.Status = 'a';
                pdMaster.Zgrade_PosebniDijeloviMaster_VlasniciPeriod.push($scope.vlasniciPeriod);
            }
            else {
                pdMaster.Zgrade_PosebniDijeloviMaster_VlasniciPeriod.forEach(function (period) {
                    if (period.Id == $scope.vlasniciPeriod.Id) {
                        period.Status = 'u';
                        period = $scope.vlasniciPeriod;
                    }
                });
            }
            $mdDialog.hide(pdMaster);
        };

        $scope.cancel = function () {
            $mdDialog.cancel(tempObj);
        };

    }]);