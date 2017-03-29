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

        $scope.tipObr = -1;
        $scope.Cijena = 0;
        //$scope.CijenaUkupno = 0;

        console.log($scope.pricuveZaZgraduGodina);

        // prvo moramo naci TipObracuna
        nadjiVrstuObracuna();
        checkOkZaSnimanje();
        //$scope.pricuveZaZgraduGodina.PricuvaMj.forEach(function (rec) {
        //    $scope.tipObr = rec.TipObracuna;
        //    $scope.CijenaPoM2 = rec.CijenaPoM2;
        //    $scope.CijenaUkupno = rec.CijenaUkupno;
        //});

        


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


            // po m2
            // formula = CijenaPoM2 * povrsina stana (sa pipadcima sa koeficijentom)
            $scope.pricuveZaZgraduGodina.PricuvaMj.forEach(function (rec) {
                if ($scope.mjesec == rec.Mjesec) {
                    // za jedan i drugi obracun, treba povrsina stana, dijelovi + pripadci
                    var povrisnaPrip = 0;
                    var povrsinaDijelovi = 0;

                    zgrada.Stanovi.forEach(function (stan) {
                        if (stan.Id == rec.StanId) {
                            stan.Stanovi_Pripadci.forEach(function (pripadak) {
                                povrisnaPrip += parseFloat(pripadak.PovrsinaSaKef);
                            });
                            stan.Stanovi_PosebniDijelovi.forEach(function (dio) {
                                povrsinaDijelovi += parseFloat(dio.PovrsinaSaKoef);
                            });

                            // 1
                            $scope.pricuveZaZgraduGodina.KS.forEach(function (ks) {
                                if (rec.VlasnikId == ks.StanarId && rec.Mjesec == ks.Mjesec) {
                                    rec.Uplaceno = ks.Uplata;
                                }
                            });
                            // 2
                            if ($scope.tipObr == 0) // m2
                                rec.Zaduzenje = ((parseFloat(povrisnaPrip) + parseFloat(povrsinaDijelovi)) * parseFloat($scope.Cijena)).toFixed(2);
                            else // ukupna cijena
                                rec.Zaduzenje = (((parseFloat(povrisnaPrip) + parseFloat(povrsinaDijelovi)) / parseFloat(zgrada.Povrsinam2) * parseFloat($scope.Cijena))).toFixed(2);

                            // StanjeOd:
                            //  - ako je prvi mjesec, vuci iz kolekcije StanjeOd (na godisnjoj razini)
                            //  - ako nije, stanjeOd current mjeseca je DugPretplata iz proslog mjeseca

                            // 3
                            rec.DugPretplata = parseFloat(rec.Uplaceno) + parseFloat(rec.StanjeOd) - parseFloat(rec.Zaduzenje);
                            rec.Dirty = false;
                        }
                    });
                }
            });
            //}
            //else {
            //    alert('po ukupnoj povrisini zgrade');
            //    // povrsina stana (sa pripadcima) / ukupno(kuna) * 100
            //}
            checkOkZaSnimanje();
        }

        function checkOkZaSnimanje() {
            $scope.snimanjeDisabled = true;
            if (($scope.tipObr == 0 || $scope.tipObr == 1) && $scope.Cijena > 0)
                $scope.snimanjeDisabled = false;
            //$scope.pricuveZaZgraduGodina.PricuvaMj.forEach(function (rec) {
            //    if (rec.Mjesec == mjesec) {
            //        if (parseInt(rec.TipObracuna) == 0 && isFinite(rec.CijenaPoM2))
            //            $scope.snimanjeDisabled = false;
            //        if (parseInt(rec.TipObracuna) == 1 && isFinite(rec.CijenaUkupno))
            //            $scope.snimanjeDisabled = false;
            //    }
            //});
        }

        $scope.IzracunajEfektivnuPovrsinuZaStan = function (stanId) {
            var p = 0;
            zgrada.Stanovi.forEach(function (stan) {
                if (stan.Id == stanId) {
                    stan.Stanovi_Pripadci.forEach(function (pripadak) {
                        p += parseFloat(pripadak.PovrsinaSaKef);
                    });
                    stan.Stanovi_PosebniDijelovi.forEach(function (dio) {
                        p += parseFloat(dio.PovrsinaSaKoef);
                    });
                }
            });
            return p.toFixed(2);
        }


        function nadjiVrstuObracuna() {
            // za mjesec
            var obr = $scope.pricuveZaZgraduGodina.PricuvaMj_VrstaObracuna[0];
            switch (mjesec) {
                case 1:
                    $scope.tipObr = obr.TipObracunaMj1;
                    $scope.Cijena = obr.CijenaMj1;
                    break;
                case 2:
                    $scope.tipObr = obr.TipObracunaMj2;
                    $scope.Cijena = obr.CijenaMj2;
                    break;
                case 3:
                    $scope.tipObr = obr.TipObracunaMj3;
                    $scope.Cijena = obr.CijenaMj3;
                    break;
                case 4:
                    $scope.tipObr = obr.TipObracunaMj4;
                    $scope.Cijena = obr.CijenaMj4;
                    break;
                case 5:
                    $scope.tipObr = obr.TipObracunaMj5;
                    $scope.Cijena = obr.CijenaMj5;
                    break;
                case 6:
                    $scope.tipObr = obr.TipObracunaMj6;
                    $scope.Cijena = obr.CijenaMj6;
                    break;
                case 7:
                    $scope.tipObr = obr.TipObracunaMj7;
                    $scope.Cijena = obr.CijenaMj7;
                    break;
                case 8:
                    $scope.tipObr = obr.TipObracunaMj8;
                    $scope.Cijena = obr.CijenaMj8;
                    break;
                case 9:
                    $scope.tipObr = obr.TipObracunaMj9;
                    $scope.Cijena = obr.CijenaMj9;
                    break;
                case 10:
                    $scope.tipObr = obr.TipObracunaMj10;
                    $scope.Cijena = obr.CijenaMj10;
                    break;
                case 11:
                    $scope.tipObr = obr.TipObracunaMj11;
                    $scope.Cijena = obr.CijenaMj11;
                    break;
                case 12:
                    $scope.tipObr = obr.TipObracunaMj12;
                    $scope.Cijena = obr.CijenaMj12;
                    break;
            }
        }

        $scope.save = function () {
            console.log('save');
            console.log($scope.pricuveZaZgraduGodina.PricuvaMj_VrstaObracuna);
            snimiVrstuObracuna();
            console.log($scope.pricuveZaZgraduGodina.PricuvaMj_VrstaObracuna);
            $uibModalInstance.close(pricuveZaZgraduGodina);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        }

        function snimiVrstuObracuna() {
            $scope.pricuveZaZgraduGodina.PricuvaMj_VrstaObracuna.forEach(function (obr) {
                switch (mjesec) {
                    case 1:
                        obr.TipObracunaMj1 = $scope.tipObr;
                        obr.CijenaMj1 = $scope.Cijena;
                        break;
                    case 2:
                        obr.TipObracunaMj2 = $scope.tipObr;
                        obr.CijenaMj2 = $scope.Cijena;
                        break;
                    case 3:
                        obr.TipObracunaMj3 = $scope.tipObr;
                        obr.CijenaMj3 = $scope.Cijena;
                        break;
                    case 4:
                        obr.TipObracunaMj4 = $scope.tipObr;
                        obr.CijenaMj4 = $scope.Cijena;
                        break;
                    case 5:
                        obr.TipObracunaMj5 = $scope.tipObr;
                        obr.CijenaMj5 = $scope.Cijena;
                        break;
                    case 6:
                        obr.TipObracunaMj6 = $scope.tipObr;
                        obr.CijenaMj6 = $scope.Cijena;
                        break;
                    case 7:
                        obr.TipObracunaMj7 = $scope.tipObr;
                        obr.CijenaMj7 = $scope.Cijena;
                        break;
                    case 8:
                        obr.TipObracunaMj8 = $scope.tipObr;
                        obr.CijenaMj8 = $scope.Cijena;
                        break;
                    case 9:
                        obr.TipObracunaMj9 = $scope.tipObr;
                        obr.CijenaMj9 = $scope.Cijena;
                        break;
                    case 10:
                        obr.TipObracunaMj10 = $scope.tipObr;
                        obr.CijenaMj10 = $scope.Cijena;
                        break;
                    case 11:
                        obr.TipObracunaMj11 = $scope.tipObr;
                        obr.CijenaMj11 = $scope.Cijena;
                        break;
                    case 12:
                        obr.TipObracunaMj12 = $scope.tipObr;
                        obr.CijenaMj12 = $scope.Cijena;
                        break;
                }
            });
        }

    }]);