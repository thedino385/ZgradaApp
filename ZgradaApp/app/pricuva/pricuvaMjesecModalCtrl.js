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

        $scope.totalDugPretplata = 0;
        $scope.totalZaduzenje = 0;
        $scope.totalUplaceno = 0;
        $scope.totalStanjeOd = 0;
        $scope.pricuvaKreirana = false;

        //$scope.$watch($scope.pricuveZaZgraduGodina.PricuvaMj , function () { alert("chenged"); });
        //$scope.$watch($scope.pricuveZaZgraduGodina, function () {
        //    console.log(newValue + " " + oldValue)
        //    if (newValue != oldValue) {
        //        alert("chenged");
        //    }
        //});

        // prvo moramo naci TipObracuna
        nadjiVrstuObracuna();
        checkOkZaSnimanje();
        //$scope.pricuveZaZgraduGodina.PricuvaMj.forEach(function (rec) {
        //    $scope.tipObr = rec.TipObracuna;
        //    $scope.CijenaPoM2 = rec.CijenaPoM2;
        //    $scope.CijenaUkupno = rec.CijenaUkupno;
        //});

        povuciStanjeOd();


        $scope.kreirajPricuvuZaMjesec = function () {
            $scope.pricuvaKreirana = true;
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
                                //povrisnaPrip += parseFloat(pripadak.PovrsinaSaKef);
                                console.log(pripadak.PovrsinaSaKef);
                                console.log(isFinite(pripadak.PovrsinaSaKef));
                                isFinite(pripadak.PovrsinaSaKef) && pripadak.PovrsinaSaKef != null ? povrisnaPrip += parseFloat(pripadak.PovrsinaSaKef) : povrisnaPrip = povrisnaPrip;
                            });
                            stan.Stanovi_PosebniDijelovi.forEach(function (dio) {
                                //povrsinaDijelovi += parseFloat(dio.PovrsinaSaKoef);
                                isFinite(dio.PovrsinaSaKoef) && dio.PovrsinaSaKoef != null ? povrsinaDijelovi += parseFloat(dio.PovrsinaSaKoef) : povrsinaDijelovi = povrsinaDijelovi;
                            });

                            // 1
                            $scope.pricuveZaZgraduGodina.KS.forEach(function (ks) {
                                if (rec.VlasnikId == ks.StanarId && rec.Mjesec == ks.Mjesec) {
                                    //rec.Uplaceno = ks.Uplata;
                                    isFinite(rec.Uplaceno) && rec.Uplaceno != null ? rec.Uplaceno = parseFloat(ks.Uplata) : rec.Uplaceno = 0;
                                }
                            });
                            // 2
                            if ($scope.tipObr == 0) // m2
                                rec.Zaduzenje = ((parseFloat(povrisnaPrip) + parseFloat(povrsinaDijelovi)) * parseFloat($scope.Cijena)).toFixed(2);
                            else // ukupna cijena
                                rec.Zaduzenje = (((parseFloat(povrisnaPrip) + parseFloat(povrsinaDijelovi)) / parseFloat(zgrada.Povrsinam2) * parseFloat($scope.Cijena))).toFixed(2);

                            // 3
                            rec.DugPretplata = parseFloat(rec.Uplaceno) + parseFloat(rec.StanjeOd) - parseFloat(rec.Zaduzenje);
                            rec.Dirty = false;
                        }
                    });
                    // ako ima promjena i user klikne cancel - upozori ga
                }
            });
            //}
            //else {
            //    alert('po ukupnoj povrisini zgrade');
            //    // povrsina stana (sa pripadcima) / ukupno(kuna) * 100
            //}
            izracunajUkupno();
            checkOkZaSnimanje();
        }

        function povuciStanjeOd() {
            $scope.pricuveZaZgraduGodina.PricuvaMj.forEach(function (rec) {
                // StanjeOd:
                //  - ako je prvi mjesec, vuci iz kolekcije StanjeOd (na godisnjoj razini)
                //  - ako nije, stanjeOd current mjeseca je DugPretplata iz proslog mjeseca
                console.log('vucem');
                if ($scope.mjesec == 1) {
                    console.log('mjesec 1');
                    $scope.pricuveZaZgraduGodina.PricuvaGod_StanjeOd.forEach(function (stanje) {
                        console.log(stanje);
                        console.log(rec);
                        if (rec.PricuvaGodId == stanje.PricuvaGodId && stanje.VlasnikId == rec.VlasnikId) {
                            console.log('match');
                            rec.StanjeOd = stanje.StanjeOd;
                        }
                    });
                }
                else {
                    $scope.pricuveZaZgraduGodina.PricuvaMj.forEach(function (recmj) {
                        if (recmj.Mjesec == $scope.mjesec - 1 && rec.VlasnikId == recmj.VlasnikId) {
                            // prosli mjesec
                            rec.StanjeOd = recmj.DugPretplata;
                        }
                    });
                }
            });
            izracunajUkupno();
        }

        function izracunajUkupno() {
            var totalDug = 0;
            var totalZaduzenje = 0;
            var totalUplaceno = 0;
            var totalStanjeOd = 0;
            $scope.pricuveZaZgraduGodina.PricuvaMj.forEach(function (rec) {
                if (rec.Mjesec == $scope.mjesec) {
                    rec.DugPretplata != null && !isNaN(rec.DugPretplata) ? totalDug += parseFloat(rec.DugPretplata) : totalDug = totalDug;
                    rec.Zaduzenje != null ? totalZaduzenje += parseFloat(rec.Zaduzenje) : totalZaduzenje = totalZaduzenje;
                    rec.Uplaceno != null ? totalUplaceno += parseFloat(rec.Uplaceno) : totalUplaceno = totalUplaceno;
                    rec.StanjeOd != null ? totalStanjeOd += parseFloat(rec.StanjeOd) : totalStanjeOd = totalStanjeOd;
                }
            });
            $scope.totalDugPretplata = totalDug;
            $scope.totalZaduzenje = totalZaduzenje;
            $scope.totalUplaceno = totalUplaceno;
            $scope.totalStanjeOd = totalStanjeOd;
        }

        //function summary()


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
            if ($scope.pricuvaKreirana) {
                var c = confirm("Pricuva je promjenjena, zelite oddbaciti promjene?")
                if (c)
                    $uibModalInstance.dismiss('cancel');
            }
            else
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