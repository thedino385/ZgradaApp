// https://angular-ui.github.io/bootstrap/

angularApp.controller('pricuvaMjesecModalCtrl', ['$scope', '$uibModalInstance', 'DataService', 'pricuveZaZgraduGodina', 'zgrada', 'godina', 'mjesec', 'prihodiRashodi',
    function ($scope, $uibModalInstance, DataService, pricuveZaZgraduGodina, zgrada, godina, mjesec, prihodiRashodi) {

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

        var currPrihodRashod;
        prihodiRashodi.forEach(function (pr) {
            if (pr.Godina == $scope.godina) {
                currPrihodRashod = pr;
            }
        });

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
        getStanjeOdDatum();
        getorocenaSrZaMjesec();

        kreirajPricuvuZaMjesec(); // odmah izracunal

        $scope.kreirajPricuvuZaMjesecOnScope = function () { kreirajPricuvuZaMjesec(); }


        function kreirajPricuvuZaMjesec () {
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
                                //console.log(pripadak.PovrsinaSaKef);
                                //console.log(isFinite(pripadak.PovrsinaSaKef));
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
            izracunSummary($scope.mjesec);
            
        }

        function povuciStanjeOd() {
            $scope.pricuveZaZgraduGodina.PricuvaMj.forEach(function (rec) {
                // StanjeOd:
                //  - ako je prvi mjesec, vuci iz kolekcije StanjeOd (na godisnjoj razini)
                //  - ako nije, stanjeOd current mjeseca je DugPretplata iz proslog mjeseca
                console.log('vucem');
                if ($scope.mjesec == 1) {
                    //console.log('mjesec 1');
                    $scope.pricuveZaZgraduGodina.PricuvaGod_StanjeOd.forEach(function (stanje) {
                        //console.log(stanje);
                        //console.log(rec);
                        if (rec.PricuvaGodId == stanje.PricuvaGodId && stanje.VlasnikId == rec.VlasnikId) {
                            //console.log('match');
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
                    rec.Zaduzenje != null && !isNaN(rec.Zaduzenje) ? totalZaduzenje += parseFloat(rec.Zaduzenje) : totalZaduzenje = totalZaduzenje;
                    rec.Uplaceno != null && !isNaN(rec.Uplaceno) ? totalUplaceno += parseFloat(rec.Uplaceno) : totalUplaceno = totalUplaceno;
                    rec.StanjeOd != null && !isNaN(rec.StanjeOd) ? totalStanjeOd += parseFloat(rec.StanjeOd) : totalStanjeOd = totalStanjeOd;
                }
            });
            $scope.totalDugPretplata = totalDug;
            $scope.totalZaduzenje = totalZaduzenje;
            $scope.totalUplaceno = totalUplaceno;
            $scope.totalStanjeOd = totalStanjeOd;
        }



        function getStanjeOdDatum() {
            switch ($scope.mjesec) {
                case 1:
                    $scope.stanjeOdDatum = '31.12.' + parseInt($scope.godina - 1) + '.';
                    break;
                case 2:
                    $scope.stanjeOdDatum = '31.01.' + $scope.godina + '.';
                    break;
                case 3:
                    $scope.stanjeOdDatum = getFebDay() + '.02.' + $scope.godina + '.';
                    break;
                case 4:
                    $scope.stanjeOdDatum = '31.03.' + $scope.godina + '.';
                    break;
                case 5:
                    $scope.stanjeOdDatum = '30.04.' + $scope.godina + '.';
                    break;
                case 6:
                    $scope.stanjeOdDatum = '31.05.' + $scope.godina + '.';
                    break;
                case 7:
                    $scope.stanjeOdDatum = '30.06.' + $scope.godina + '.';
                    break;
                case 8:
                    $scope.stanjeOdDatum = '31.07.' + $scope.godina + '.';
                    break;
                case 9:
                    $scope.stanjeOdDatum = '31.08.' + $scope.godina + '.';
                    break;
                case 10:
                    $scope.stanjeOdDatum = '30.09.' + $scope.godina + '.';
                    break;
                case 11:
                    $scope.stanjeOdDatum = '31.10.' + $scope.godina + '.';
                    break;
                case 12:
                    $scope.stanjeOdDatum = '30.11.' + $scope.godina + '.';
                    break;
            }
        }

        // provjeri lleap year
        function getFebDay() {
            //var year = new Date().getFullYear();
            var year = $scope.godina;
            if (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0))
                return 29;
            return 28;
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
            snimiOrocenaSredstvapricuve();
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
                switch ($scope.mjesec) {
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

        function snimiOrocenaSredstvapricuve() {
            $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva.forEach(function (obr) {
                switch ($scope.mjesec) {
                    case 1:
                        obr.Mj1 = $scope.orocenaSredstva;
                        break;
                    case 2:
                        obr.Mj2 = $scope.orocenaSredstva;
                        break;
                    case 3:
                        obr.Mj3 = $scope.orocenaSredstva;
                        break;
                    case 4:
                        obr.Mj4 = $scope.orocenaSredstva;
                        break;
                    case 5:
                        obr.Mj5 = $scope.orocenaSredstva;
                        break;
                    case 6:
                        obr.Mj6 = $scope.orocenaSredstva;
                        break;
                    case 7:
                        obr.Mj7 = $scope.orocenaSredstva;
                        break;
                    case 8:
                        obr.Mj8 = $scope.orocenaSredstva;
                        break;
                    case 9:
                        obr.Mj9 = $scope.orocenaSredstva;
                        break;
                    case 10:
                        obr.Mj10 = $scope.orocenaSredstva;
                        break;
                    case 11:
                        obr.Mj11 = $scope.orocenaSredstva;
                        break;
                    case 12:
                        obr.Mj12 = $scope.orocenaSredstva;
                        break;
                }
            });
        }

        // __________________________ SUMMARY_____________________________

        var raspolozivaSrMj1 = 0; var raspolozivaSrMj2 = 0; var raspolozivaSrMj3 = 0; var raspolozivaSrMj4 = 0;
        var raspolozivaSrMj5 = 0; var raspolozivaSrMj6 = 0; var raspolozivaSrMj7 = 0; var raspolozivaSrMj8 = 0;
        var raspolozivaSrMj9 = 0; var raspolozivaSrMj10 = 0; var raspolozivaSrMj11 = 0;

        var currPrihodRashod;
        prihodiRashodi.forEach(function (pr) {
            if (pr.Godina == $scope.godina) {
                currPrihodRashod = pr;
            }
        });

        if (currPrihodRashod != undefined && currPrihodRashod.PrihodiRashodiDetails != undefined) {
            // ako nema unesenih prihoda i rashoda, nemoj racunati, jer ce puknuti
            raspolozivaSrMj1 = izracunSummary(1);
            raspolozivaSrMj2 = izracunSummary(2);
            raspolozivaSrMj3 = izracunSummary(3);
            raspolozivaSrMj4 = izracunSummary(4);
            raspolozivaSrMj5 = izracunSummary(5);
            raspolozivaSrMj6 = izracunSummary(6);
            raspolozivaSrMj7 = izracunSummary(7);
            raspolozivaSrMj8 = izracunSummary(8);
            raspolozivaSrMj9 = izracunSummary(9);
            raspolozivaSrMj10 = izracunSummary(10);
            raspolozivaSrMj11 = izracunSummary(11);
        }
        else
            console.log('PricuvaModal prihodiRashodi.PrihodiRashodiDetails su undef');


        $scope.izracunSummaryScope = function (mjesec) {
            izracunSummary(mjesec);
        }

        function izracunSummary(mjesec) {
            console.log('PricuvaModal izracunSummary');
            // 1. Pricuva od
            var pricuvaOd = 0;
            if (mjesec == 1) {
                console.log('1mj');
                console.log(currPrihodRashod);
                // povlaci se iz prihodaRashoda za 1. mjesec prijenos iz pricuve
                currPrihodRashod.PrihodiRashodiDetails.forEach(function (pr) {
                    //console.log("Mjesec check " + pr.Mjesec + " " + mjesec);
                    //console.log(pr.Mesec == mjesec);
                    //console.log(pr.PrijenosIzProlse == true);
                    //console.log(pr.Iznos != null);

                    if (pr.Mjesec == mjesec && pr.PrijenosIzProlse == true && pr.Iznos != null)
                        pricuvaOd = parseFloat(pr.Iznos);
                });
            }
            else {
                switch (mjesec) {
                    case 2:
                        pricuvaOd = raspolozivaSrMj1;
                        break;
                    case 3:
                        pricuvaOd = raspolozivaSrMj2;
                        break;
                    case 4:
                        pricuvaOd = raspolozivaSrMj3;
                        break;
                    case 5:
                        pricuvaOd = raspolozivaSrMj4;
                        break;
                    case 6:
                        pricuvaOd = raspolozivaSrMj5;
                        break;
                    case 7:
                        pricuvaOd = raspolozivaSrMj6;
                        break;
                    case 8:
                        pricuvaOd = raspolozivaSrMj7;
                        break;
                    case 9:
                        pricuvaOd = raspolozivaSrMj8;
                        break;
                    case 10:
                        pricuvaOd = raspolozivaSrMj9;
                        break;
                    case 11:
                        pricuvaOd = raspolozivaSrMj10;
                        break;
                    case 12:
                        pricuvaOd = raspolozivaSrMj11;
                        break;
                }
            }

            // 2. Pricuva u navedenom razdoblju
            var totalUplaceno = 0;
            $scope.pricuveZaZgraduGodina.PricuvaMj.forEach(function (rec) {
                if (rec.Mjesec == mjesec) {
                    rec.Uplaceno != null && !isNaN(rec.Uplaceno) ? totalUplaceno += parseFloat(rec.Uplaceno) : totalUplaceno = totalUplaceno;
                }
            });

            // 3. Ostali prihodi u navedenom rezd ???

            // 4. Rashodi u navedenom razdoblju
            // 5. orocena sredstva
            var rashodi = 0;
            var orocenaSredstva = 0;
            switch (parseInt(mjesec)) {
                case 1:
                    $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj1 != null ? orocenaSredstva = $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj1 : 0;
                    currPrihodRashod.PlacenoRashodMj1 != null ? rashodi = currPrihodRashod.PlacenoRashodMj1 : 0;
                    break;
                case 2:
                    $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj2 != null ? orocenaSredstva = $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj2 : 0;
                    currPrihodRashod.PlacenoRashodMj2 != null ? rashodi = currPrihodRashod.PlacenoRashodMj2 : 0;
                    break;
                case 3:
                    $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj3 != null ? orocenaSredstva = $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].M32 : 0;
                    currPrihodRashod.PlacenoRashodMj3 != null ? rashodi = currPrihodRashod.PlacenoRashodMj3 : 0;
                    break;
                case 4:
                    $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj4 != null ? orocenaSredstva = $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj4 : 0;
                    currPrihodRashod.PlacenoRashodMj4 != null ? rashodi = currPrihodRashod.PlacenoRashodMj4 : 0;
                    break;
                case 5:
                    $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj5 != null ? orocenaSredstva = $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj5 : 0;
                    currPrihodRashod.PlacenoRashodMj5 != null ? rashodi = currPrihodRashod.PlacenoRashodMj5 : 0;
                    break;
                case 6:
                    $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj6 != null ? orocenaSredstva = $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj6 : 0;
                    currPrihodRashod.PlacenoRashodMj6 != null ? rashodi = currPrihodRashod.PlacenoRashodMj6 : 0;
                    break;
                case 7:
                    $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj7 != null ? orocenaSredstva = $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj7 : 0;
                    currPrihodRashod.PlacenoRashodMj7 != null ? rashodi = currPrihodRashod.PlacenoRashodMj7 : 0;
                    break;
                case 8:
                    $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj8 != null ? orocenaSredstva = $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj8 : 0;
                    currPrihodRashod.PlacenoRashodMj8 != null ? rashodi = currPrihodRashod.PlacenoRashodMj8 : 0;
                    break;
                case 9:
                    $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj9 != null ? orocenaSredstva = $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj9 : 0;
                    currPrihodRashod.PlacenoRashodMj9 != null ? rashodi = currPrihodRashod.PlacenoRashodMj9 : 0;
                    break;
                case 10:
                    $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj10 != null ? orocenaSredstva = $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj10 : 0;
                    currPrihodRashod.PlacenoRashodMj10 != null ? rashodi = currPrihodRashod.PlacenoRashodMj10 : 0;
                    break;
                case 11:
                    $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj11 != null ? $scope.orocenaSredstva = $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj11 : 0;
                    currPrihodRashod.PlacenoRashodMj11 != null ? rashodi = currPrihodRashod.PlacenoRashodMj11 : 0;
                    break;
                case 12:
                    pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj12 != null ? orocenaSredstva = $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj12 : 0;
                    prihodiRashodi.PlacenoPrihodMj12 != null ? rashodi = prihodiRashodi.PlacenoPrihodMj12 : rashodi = 0;
                    break;
            }

            // 6. Raspoloziva sredstva pricuve
            var raspolozivaSredstva = parseFloat(pricuvaOd) + parseFloat(totalUplaceno) - parseFloat(rashodi) - parseFloat(orocenaSredstva);
            if ($scope.mjesec == mjesec) {
                $scope.pricuvaOd = pricuvaOd.toFixed(2);
                $scope.totalUplacenoSumm = totalUplaceno.toFixed(2);
                $scope.rashodi = rashodi.toFixed(2);
                //$scope.orocenaSredstva = orocenaSredstva.toFixed(2);
                $scope.raspolozivaSredstva = raspolozivaSredstva = parseFloat(pricuvaOd) + parseFloat(totalUplaceno) - parseFloat(rashodi) - parseFloat($scope.orocenaSredstva).toFixed(2);
            }
            else
                return raspolozivaSredstva;
        }


        function getorocenaSrZaMjesec() {
            switch ($scope.mjesec) {
                case 1:
                    $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj1 != null ? $scope.orocenaSredstva = $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj1 : 0;
                    console.log('$scope.orocenaSredstva ' + $scope.orocenaSredstva);
                    break;
                case 2:
                    $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj2 != null ? $scope.orocenaSredstva = $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj2 : 0;
                    break;
                case 3:
                    $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj3 != null ? $scope.orocenaSredstva = $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].M32 : 0;
                    break;
                case 4:
                    $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj4 != null ? $scope.orocenaSredstva = $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj4 : 0;
                    break;
                case 5:
                    $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj5 != null ? $scope.orocenaSredstva = $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj5 : 0;
                    break;
                case 6:
                    $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj6 != null ? $scope.orocenaSredstva = $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj6 : 0;
                    break;
                case 7:
                    $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj7 != null ? $scope.orocenaSredstva = $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj7 : 0;
                    break;
                case 8:
                    $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj8 != null ? $scope.orocenaSredstva = $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj8 : 0;
                    break;
                case 9:
                    $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj9 != null ? $scope.orocenaSredstva = $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj9 : 0;
                    break;
                case 10:
                    $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj10 != null ? $scope.orocenaSredstva = $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj10 : 0;
                    break;
                case 11:
                    $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj11 != null ? $scope.orocenaSredstva = $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj11 : 0;
                    break;
                case 12:
                    $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj12 != null ? $scope.orocenaSredstva = $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj12 : 0;
                    break;
            }
        }

    }]);