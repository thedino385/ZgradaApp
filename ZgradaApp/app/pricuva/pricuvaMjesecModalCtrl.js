// https://angular-ui.github.io/bootstrap/

angularApp.controller('pricuvaMjesecModalCtrl', ['$scope', '$uibModalInstance', 'DataService', 'pricuveZaZgraduGodina', 'zgrada', 'godina', 'mjesec',
    function ($scope, $uibModalInstance, DataService, pricuveZaZgraduGodina, zgrada, godina, mjesec) {

        // pricuveZaZgraduGodina = lista mastera za mjesec sa kolekcijama  

        // ako nema kolekcija za mjesec, kreiraj ih i dodaj na master
        // ZgradaId, Godina i PricuvaGodId su konstante
        pricuveZaZgraduGodina.forEach(function (prGod) {
            if (prGod.PricuvaMj.length == 0) {
                var prMj = {
                    Id: 0, PricuvaGodId: prGod.Id, StanId: prGod.StanId, VlasnikId: prGod.VlasnikId,
                    Mjesec: mjesec, DugPretplata: 0, Zaduzenje: 0, Uplaceno: 0, StanjeOd: 0
                };
                pricuveZaZgraduGodina.PricuvaMj.push(prMj);
            }
        });
        //if (count == 0) {
        //    pricuveZaZgraduGodina.forEach(function (prGod) {
        //        var prMj = {
        //            Id: 0, PricuvaGodId: prGod.Id, StanId: prGod.StanId, VlasnikId: prGod.VlasnikId,
        //            Mjesec: mjesec, DugPretplata: 0, Zaduzenje: 0, Uplaceno: 0, StanjeOd: 0
        //        };
        //        pricuveZaZgraduGodina.PricuvaMj.push(prMj);
        //    })
        //}

        $scope.pricuveZaZgraduGodina = pricuveZaZgraduGodina;
        $scope.zgrada = zgrada;

        $scope.godina = godina;
        $scope.mjesec = mjesec;

        $scope.save = function () {
            console.log('save');
            $uibModalInstance.close(item);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        }

    }]);