// https://angular-ui.github.io/bootstrap/

angularApp.controller('pricuvaMjesecModalCtrl', ['$scope', '$uibModalInstance', 'DataService', 'pricuveZaZgraduGodina', 'zgrada', 'godina', 'mjesec',
    function ($scope, $uibModalInstance, DataService, pricuveZaZgraduGodina, zgrada, godina, mjesec) {

        // pricuveZaZgraduGodina (sinle object)
        //      |----> pricuveZaZgraduGodina.PricuvaMj
        //      |----> KS


        $scope.pricuveZaZgraduGodina = pricuveZaZgraduGodina;
        $scope.zgrada = zgrada;
        $scope.godina = godina;
        $scope.mjesec = parseInt(mjesec);
        $scope.snimanjeDisabled = true;
        //$scope.tipObr = 0;
        checkOkZaSnimanje();
        $scope.tipObr = 0;
        $scope.CijenaPoM2 = 0;
        $scope.CijenaUkupno = 0;

        // prvo moramo naci TipObracuna
        $scope.pricuveZaZgraduGodina.PricuvaMj.forEach(function (rec) {
            $scope.tipObr = rec.TipObracuna;
            $scope.CijenaPoM2 = rec.CijenaPoM2;
            $scope.CijenaUkupno = rec.CijenaUkupno;
        });


        $scope.save = function () {
            console.log('save');
            $uibModalInstance.close(item);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        }

        $scope.kreirajPricuvuZaMjesec = function () {
            //PricuvaGodId
            //StanId
            //VlasnikId
            //Mjesec
            //DugPretplata - racuna se Upaceno + StanjeOd - Zaduzenje
            //Zaduzenje - racuna s obzirom na tip obracuna - po_m2/ukupno_pa_rasporedi
            //Uplaceno - vuce se iz KS [Uplata] iz current mjeseca
            //StanjeOd - [DugPretplata] iz proslog mjeseca

            // TipObracuna: 0 - po m2, 1 - ukupno po kvadraturi stana
            // CijenaPoM2
            // CijenaUkupno

            if ($scope.tipObr == 0) {
                alert('po m2')
                // po m2
                // formula = CijenaPoM2 * povrsina stana (sa pipadcima sa koeficijentom)
                $scope.pricuveZaZgraduGodina.PricuvaMj.forEach(function (rec) {
                    // za jedan i drugi obracun, treba povrsina stana, dijelovi + pripadci
                    var povrisnaPrip = 0;
                    var povrsinaDijelovi = 0;
                    zgrada.Stanovi.forEach(function (stan) {
                        stan.Zgrade_Pripadci.forEach(function (pripadakUstanu) {
                            if (pripadakUstanu.PripadakIZgradaId == stan.Id) {
                                zgrada.Zgrade_Pripadci.forEach(func)
                            }
                                
                        });
                    });

                    if (rec.Mjesec == mjesec) {
                        console.log(rec);
                        // ok, ovo je trazena pricuva za mjesec

                    }

                });
            }
            else {
                alert('po ukupnoj povrisini zgrade');
                // povrsina stana (sa pripadcima) / ukupno(kuna) * 100
            }
            checkOkZaSnimanje();
        }

        function checkOkZaSnimanje() {
            $scope.snimanjeDisabled = true;
            $scope.pricuveZaZgraduGodina.PricuvaMj.forEach(function (rec) {
                if (rec.Mjesec == mjesec) {
                    if (parseInt(rec.TipObracuna) == 0 && isFinite(rec.CijenaPoM2))
                        $scope.snimanjeDisabled = false;
                    if (parseInt(rec.TipObracuna) == 1 && isFinite(rec.CijenaUkupno))
                        $scope.snimanjeDisabled = false;
                }
            });
        }
    }]);