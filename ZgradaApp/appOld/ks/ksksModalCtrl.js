// https://angular-ui.github.io/bootstrap/

angularApp.controller('ksksModalCtrl', ['$scope', '$uibModalInstance', 'DataService', 'pricuveZaZgraduGodina', 'zgrada', 'godina', 'stanarId',
    function ($scope, $uibModalInstance, DataService, pricuveZaZgraduGodina, zgrada, godina, stanarId) {

        // prosljedjena je pricuva, KS je child
        // pricuveZaZgraduGodina je object za zgradu, za godinu

        // pricuveZaZgraduGodina
        //          |-----> PricuvaMj
        //          |-----> KS


        // kod otvaranja, preracunati Zaduzenje i Stanje
        // Zaduzenje = pricuvaMj[Zaduzenje] (to se generira cijena/m2 ili ukupnaCijenaZaZgradu po stanu)
        // Stanje = Uplata - Zaduzenje

        $scope.pricuveZaZgraduGodina = pricuveZaZgraduGodina;
        $scope.zgrada = zgrada;
        $scope.stanarId = parseInt(stanarId);
        $scope.godina = parseInt(godina);
        $scope.snimanjeOk = false;

        console.log($scope.stanarId + " " + $scope.godina);

        $scope.dodajRecord = function () {
            var maxId = 0;
            pricuveZaZgraduGodina.KS.forEach(function (ks) {
                maxId = ks.Id;
            });
            var newDate = new Date().getDate() + '. ' + new Date().getMonth() + 1 + '. ' + godina;
            var noviRecord = {
                Id: maxId + 1, PricuvaGodId: pricuveZaZgraduGodina.Id, StanarId: stanarId,
                Mjesec: new Date().getMonth() + 1, Godina: godina, Datum: newDate,
                Uplata: 0, Status: 'a'
            };
            $scope.pricuveZaZgraduGodina.KS.push(noviRecord);
            OkZaSnimanje();
            console.log(pricuveZaZgraduGodina.PricuvaMj);
        }

        $scope.delete = function (Id) {
            // ako je obj.Id == 0, obrisi zadnji rec u kolekciji (nije u bazi)
            if ($scope.pricuveZaZgraduGodina.Id == 0) {
                $scope.pricuveZaZgraduGodina.KS.forEach(function (rec) {
                    console.log(rec);
                    if (rec.Id == Id) {
                        var index = $scope.pricuveZaZgraduGodina.KS.indexOf(rec);
                        $scope.pricuveZaZgraduGodina.KS.splice(index, 1);
                    }
                });
            }
            // ako nije, u bazi je, stavi status na 'd'
            else {
                $scope.pricuveZaZgraduGodina.KS.forEach(function (rec) {
                    if (rec.Id == Id)
                        rec.Status = 'd';
                });
            }
            OkZaSnimanje();
        }

        function OkZaSnimanje() {
            $scope.snimanjeOk = true;
            $scope.pricuveZaZgraduGodina.KS.forEach(function (rec) {
                if (!isFinite(rec.Uplata))
                    $scope.snimanjeOk = false;
            });
        }

        $scope.uplataChanged = function (ksId) {
            //console.log('uplata changet at KS.Id: ' + ksId);
            OkZaSnimanje();
        }

        $scope.save = function () {
            console.log('save');
            $uibModalInstance.close(pricuveZaZgraduGodina);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        }
    }]);