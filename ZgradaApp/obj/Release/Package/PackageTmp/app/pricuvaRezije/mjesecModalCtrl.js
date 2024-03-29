﻿angularApp.controller('mjesecModalCtrl', ['$scope', '$rootScope', '$mdDialog', '$filter', 'toastr', 'DataService', 'CalcService', 'LocalizationService', 'zgradaObj', 'mjesec', 'godina',
    function ($scope, $rootScope, $mdDialog, $filter, toastr, DataService, CalcService, ls, zgradaObj, mjesec, godina) {

        $scope.zgradaObj = zgradaObj;
        console.log(zgradaObj);

        var tempObj = {};
        angular.copy($scope.zgradaObj, tempObj);
        $scope.mjesec = mjesec;
        $scope.godina = godina;
        $scope.period = getHeaderText();
        $scope.settingsExpanded = false;
        $scope.cijenaPricuvaVisible = false;
        $scope.cijenaRezijePoBrojuVisible = false;
        $scope.cijenaRezijeZaSvakiVisible = false;
        $scope.obracunKreiran = false;
        $scope.PricuvaRezijeZaMjesec = {};
        $scope.areSettingsCollapsed = true;


        // ako nema pricuveRezije za odabrani mjesec, kreiraj praznu kolekciju za mjesecom i statusom
        $scope.found = false;
        var master = [];
        zgradaObj.PricuvaRezijeGodina.forEach(function (prGod) {
            if (prGod.Godina == godina) {
                master = prGod;
                prGod.PricuvaRezijeMjesec.forEach(function (prMj) {
                    if (prMj.Mjesec == mjesec) {
                        //$scope.PricuvaRezijeZaMjesec = pretify(prMj);

                        // izracunaj uplate (prihodi) i dug/pretplatu on the fly
                        prMj.PricuvaRezijePosebniDioMasteri.forEach(function (pdMaster) {
                            pdMaster.Uplaceno = getUplaceno(pdMaster.PosebniDioMasterId);

                            var ps = 0;
                            if (pdMaster.PocetnoStanje != null)
                                ps = ls.myParseFloat(pdMaster.PocetnoStanje);

                            pdMaster.DugPretplata = ls.toHrDecimalCalc(
                                ls.myParseFloat(pdMaster.Uplaceno) +
                                ls.myParseFloat(pdMaster.StanjeOd) -
                                ls.myParseFloat(pdMaster.ZaduzenjePricuva) -
                                ls.myParseFloat(pdMaster.ZaduzenjeRezije) +
                                ls.myParseFloat(ps));
                        });
                        $scope.PricuvaRezijeZaMjesec = prMj;
                        $scope.found = true;
                        tBoxesVissible($scope.PricuvaRezijeZaMjesec);
                    }
                });
            }
        });
        if (!$scope.found) { // znaci da je novi mjesec za koji nije kreiran obracun
            // okvako se poziva filter iz controllera
            //$scope.PricuvaRezijeZaMjesec = $filter('pricuvaRezijeMjesec')(master.PricuvaRezijeMjesec, mjesec, master.Godina, zgradaObj, master.Id);
            // ovako iz view-a
            // <tr ng-repeat="periodVlasnici in pdMaster.Zgrade_PosebniDijeloviMaster_VlasniciPeriod | validZaMjesec:mjesec:godina ">

            // na serveru se kreira sve
            $rootScope.loaderActive = true;
            DataService.pricuvaZaMjesecCreate(zgradaObj.Id, master.Id, mjesec, godina).then(
                function (result) {
                    $scope.PricuvaRezijeZaMjesec = result.data;
                    $rootScope.loaderActive = false;
                    tBoxesVissible($scope.PricuvaRezijeZaMjesec);
                },
                function (result) {
                    toastr.error('Kreiranje pričuve i režija nije uspjelo');
                }
            )
        }


        function pretify(PricuvaRezijeZaMjesec) {
            //return x.toLocaleString('hr-HR', { minimumFractionDigits: 2 });
            PricuvaRezijeZaMjesec.PricuvaRezijePosebniDioMasteri.forEach(function (rec) {
                rec.Uplaceno = ls.toHrDecimalCalc(rec.Uplaceno);
                rec.ZaduzenjeRezije = ls.toHrDecimalCalc(rec.ZaduzenjeRezije);
                rec.ZaduzenjePricuva = ls.toHrDecimalCalc(rec.ZaduzenjePricuva);
                console.log('rec.ZaduzenjeRezije ' + rec.ZaduzenjeRezije);
                console.log('rec.ZaduzenjePricuva ' + rec.ZaduzenjePricuva);
            });
            return PricuvaRezijeZaMjesec;
        }


        function tBoxesVissible(mj) {
            if (mj.NacinObracunaPricuva == 2) {
                $scope.cijenaPricuvaPostoVisible = false;
                $scope.cijenaPricuvaVisible = true;
            }
            else if (mj.NacinObracunaPricuva == 3) {
                $scope.cijenaPricuvaPostoVisible = true;
                $scope.cijenaPricuvaVisible = false;
            }
            else {
                $scope.cijenaPricuvaPostoVisible = false;
                $scope.cijenaPricuvaVisible = false;
            }

            if (mj.NacinObracunaRezije == 0) {
                $scope.cijenaRezijePoBrojuVisible = false;
                $scope.cijenaRezijeZaSvakiVisible = false;
            }
            else if (mj.NacinObracunaRezije == 1) {
                $scope.cijenaRezijePoBrojuVisible = true;
                $scope.cijenaRezijeZaSvakiVisible = false;
            }
            else {
                $scope.cijenaRezijePoBrojuVisible = false;
                $scope.cijenaRezijeZaSvakiVisible = true;
            }
        }

        // begin saldo stutt
        // nadji mastera iz proslog mjeseca i prenesi Saldo u PocetnoStanje
        //var saldoIzProslog = 0;
        //if ($scope.mjesec == 1) {
        //    // trazi 12.mj prosle godine
        //    $scope.zgradaObj.PricuvaRezijeGodina.forEach(function (prGod) {
        //        if (parseInt(prGod.Godina) == parseInt(godina) - 1) {
        //            // sad nadji 12. mj
        //            prGod.PricuvaRezijeMjesec.forEach(function (prMj) {
        //                if (parseInt(prMj.Mjesec) == 12) {

        //                }

        //            })
        //        }
        //    });
        //}


        $scope.delete = function (ev) {
            var c = confirm("potvrdire da želite obrisati obračuni kreirati ponovo");
            if (c) {
                DataService.pricuvaRezijeDeleteAndCreate($scope.zgradaObj.Id, mjesec, godina).then(
                    function (result) {
                        $scope.PricuvaRezijeZaMjesec = result.data;
                        $scope.PricuvaRezijeZaMjesec.Id = 0;
                    },
                    function (result) {
                        toastr.error('Brisanje obracuna nije uspjelo');
                    }
                )
            }

        };

        $scope.save = function () {
            $('nav').fadeIn();
            if ($scope.PricuvaRezijeZaMjesec.Id == 0) {
                zgradaObj.PricuvaRezijeGodina.forEach(function (prGod) {
                    if (prGod.Godina == godina) {
                        $scope.PricuvaRezijeZaMjesec.Status = 'a';
                        prGod.PricuvaRezijeMjesec.push($scope.PricuvaRezijeZaMjesec);
                    }
                });
            }
            else {
                zgradaObj.PricuvaRezijeGodina.forEach(function (prGod) {
                    if (prGod.Godina == godina) {
                        prGod.PricuvaRezijeMjesec.forEach(function (prMj) {
                            if (prMj.Mjesec == mjesec) {
                                $scope.PricuvaRezijeZaMjesec.Status = 'u';
                                prMj = $scope.PricuvaRezijeZaMjesec;
                            }
                        });
                    }
                });
            }
            $mdDialog.hide($scope.zgradaObj);
            console.log($scope.zgradaObj);
        };

        $scope.cancel = function () {
            $('nav').fadeIn();
            $mdDialog.cancel(tempObj);
        };

        $scope.obracunaj = function () {
            if ($scope.PricuvaRezijeZaMjesec.NacinObracunaPricuva == null) {
                toastr.error('Obračun za pričuvu nije definiran!');
                return;
            }
            if ($scope.PricuvaRezijeZaMjesec.NacinObracunaRezije == null) {
                toastr.error('Obračun za režije nije definiran!');
                return;
            }
            var pricuvaZaMaster = 0;
            var rezijeZaMaster = 0;

            /*
                                DECIMALS, ENG/HR, DOT/COMMA
                    _________________________________________________________________________________

                    1. dohvat podataka sa servera:
                        DataService.decimalToHr(result.data.Zgrada, 'prihodiRashodi');
                    2. proracuni (samo za racunanje):
                            DataService.myParseFloat(hrDecimal)
                    3. ako se rezultat proracuna ispisuje u UI, DataService.toHrDecimalCalc(jsDecimal)
                        DataService.myParseFloat(decimal_with_commas)
                    4. slanje/snimanje na server:
                        (DataService.decimalToEng($scope.zgradaObj, 'prihodiRashodi')

            */


            // pricuva
            // po m2
            $scope.PricuvaRezijeZaMjesec.PricuvaRezijePosebniDioMasteri.forEach(function (pdMaster) {
                pricuvaZaMaster = 0;
                rezijeZaMaster = 0;
                if ($scope.PricuvaRezijeZaMjesec.NacinObracunaPricuva == 0) {
                    // povrsina pdMastera je zbroj svhi povrsina pdChildova i povrsina pripadaka
                    pdMaster.PricuvaRezijePosebniDioMasterPovrsine.forEach(function (povrsina) {
                        pricuvaZaMaster += ls.myParseFloat(povrsina.Povrsina) * ($scope.PricuvaRezijeZaMjesec.SaKoef == true ? ls.myParseFloat(povrsina.Koef) : 1);
                        // console.log('PricuvaRezije, povrsine ' + pricuvaZaMaster);
                    });
                    pdMaster.PricuvaRezijePosebniDioMasterPripadci.forEach(function (prip) {
                        pricuvaZaMaster += ls.myParseFloat(prip.Povrsina) * ($scope.PricuvaRezijeZaMjesec.SaKoef == true ? ls.myParseFloat(prip.Koef) : 1);
                    });
                    pricuvaZaMaster = parseFloat(parseFloat(pricuvaZaMaster) * ls.myParseFloat($scope.PricuvaRezijeZaMjesec.ObracunPricuvaCijenaM2));
                    //console.log('pricuvaZaMaster Pricuva po m2: ' + pricuvaZaMaster);
                }
                else if ($scope.PricuvaRezijeZaMjesec.NacinObracunaPricuva == 1) {
                    // ukupno za zgradu, raspodjela ovisno o povrisni
                    var povrsinaPD = 0;
                    pdMaster.PricuvaRezijePosebniDioMasterPovrsine.forEach(function (povrsina) {
                        povrsinaPD += ls.myParseFloat(povrsina.Povrsina) * ($scope.PricuvaRezijeZaMjesec.SaKoef == true ? ls.myParseFloat(povrsina.Koef) : 1);
                        // console.log('PricuvaRezije, povrsine ' + pricuvaZaMaster);
                    });
                    pdMaster.PricuvaRezijePosebniDioMasterPripadci.forEach(function (prip) {
                        povrsinaPD += ls.myParseFloat(prip.Povrsina) * ($scope.PricuvaRezijeZaMjesec.SaKoef == true ? ls.myParseFloat(prip.Koef) : 1);
                    });
                    //console.log('povrsinaPD ' + povrsinaPD);
                    //console.log(DataService.myParseFloat($scope.PricuvaRezijeZaMjesec.ObracunPricuvaCijenaUkupno));
                    pricuvaZaMaster = parseFloat(povrsinaPD / ls.myParseFloat(CalcService.povrsinaZgrade($scope.PricuvaRezijeZaMjesec)) * ls.myParseFloat($scope.PricuvaRezijeZaMjesec.ObracunPricuvaCijenaUkupno));
5                }
                else if ($scope.PricuvaRezijeZaMjesec.NacinObracunaPricuva == 2) {
                    // cijena za svaki pdMaster
                    //pricuvaZaMaster = parseFloat(DataService.myParseFloat(pdMaster.ObracunPricuvaCijenaSlobodanUnos));
                    // zaduzenje za svakog = cijena ulupno / posto za PD * 100
                    var cijenUkupno = ls.myParseFloat($scope.PricuvaRezijeZaMjesec.ObracunPricuvaCijenaUkupnoZaPostotak);
                    pricuvaZaMaster = cijenUkupno / ls.myParseFloat(pdMaster.ObracunPricuvaPostoSlobodanUnos) * 100;
                    // CalcService
                }

                // rezije
                if ($scope.PricuvaRezijeZaMjesec.NacinObracunaRezije == 0) {
                    // ukupno za zgradu, raspodjela ovisno o povrisni
                    var povrsinaPD = 0;
                    pdMaster.PricuvaRezijePosebniDioMasterPovrsine.forEach(function (povrsina) {
                        povrsinaPD += ls.myParseFloat(povrsina.Povrsina) * ($scope.PricuvaRezijeZaMjesec.SaKoef == true ? ls.myParseFloat(povrsina.Koef) : 1);
                        // console.log('PricuvaRezije, povrsine ' + pricuvaZaMaster);
                    });
                    pdMaster.PricuvaRezijePosebniDioMasterPripadci.forEach(function (prip) {
                        povrsinaPD += ls.myParseFloat(prip.Povrsina) * ($scope.PricuvaRezijeZaMjesec.SaKoef == true ? ls.myParseFloat(prip.Koef) : 1);
                    });
                    //console.log('$scope.PricuvaRezijeZaMjesec.ObracunRezijeCijenaUkupno ' + $scope.PricuvaRezijeZaMjesec.ObracunRezijeCijenaUkupno);
                    //console.log('povrsinaPD ' + povrsinaPD);
                    //console.log('povrsinaZgrade ' + povrsinaZgrade());
                    rezijeZaMaster = parseFloat(povrsinaPD / ls.myParseFloat(CalcService.povrsinaZgrade($scope.PricuvaRezijeZaMjesec)) * ls.myParseFloat($scope.PricuvaRezijeZaMjesec.ObracunRezijeCijenaUkupno));
                    //console.log('PricuvaRezije, rezije raspodjela od ukupno: ' + rezijeZaMaster);
                }
                else if ($scope.PricuvaRezijeZaMjesec.NacinObracunaRezije == 1) {
                    // po broju clanova
                    var povrsinaPD = 0;
                    //console.log('pdMaster.ObracunRezijeBrojClanova ' + pdMaster.ObracunRezijeBrojClanova);
                    rezijeZaMaster = parseFloat(parseInt(pdMaster.ObracunRezijeBrojClanova) / parseInt(ukupanBrojLjudi()) * ls.myParseFloat($scope.PricuvaRezijeZaMjesec.ObracunRezijaCijenaUkupnoPoBrojuClanova));
                    //console.log('PricuvaRezije, Rezije po bruju clanova: ' + rezijeZaMaster);
                }
                else if ($scope.PricuvaRezijeZaMjesec.NacinObracunaRezije == 2) {
                    // cijena za svaki pd
                    rezijeZaMaster = ls.myParseFloat(pdMaster.ObracunRezijeCijenaSlobodanUnos);
                }

                //pdMaster.Zaduzenje = parseFloat(pricuvaZaMaster + rezijeZaMaster).toFixed(2);
                if (pricuvaZaMaster != null && pricuvaZaMaster != undefined)
                    pdMaster.ZaduzenjePricuva = pricuvaZaMaster;
                if (rezijeZaMaster != null && rezijeZaMaster != undefined)
                    pdMaster.ZaduzenjeRezije = rezijeZaMaster;



                // Uplaceno  se vuse iz Prihoda - suma prihoda za pdMasterId za ovaj mjesec
                
                //$scope.zgradaObj.PrihodiRashodi.forEach(function (prihodiRashodi) {
                //    if (prihodiRashodi.Godina == $scope.godina) {
                //        prihodiRashodi.PrihodiRashodi_Prihodi.forEach(function (prihodi) {
                //            if (prihodi.Mjesec == $scope.mjesec && prihodi.PosebniDioMasterId == pdMaster.PosebniDioMasterId) {
                //                uplaceno += parseFloat(ls.myParseFloat(prihodi.Iznos));
                //            }
                //        });
                //    }
                //});



                console.log('Uplaceno: ' + pdMaster.Uplaceno);
                console.log('Rezije ' + pdMaster.ZaduzenjeRezije);

                //pdMaster.ZaduzenjeRezije = DataService.toHrDecimalCalc(pdMaster.ZaduzenjeRezije);

                // Dug/Pretplata = Uplaceno + StanjeOd - Zaduzenje - PocetnoStanje
                var ps = 0;
                if (pdMaster.PocetnoStanje != null)
                    ps = ls.myParseFloat(pdMaster.PocetnoStanje);

                pdMaster.Uplaceno = getUplaceno(pdMaster.PosebniDioMasterId);

                pdMaster.DugPretplata = ls.toHrDecimalCalc(
                    ls.myParseFloat(pdMaster.Uplaceno) +
                    ls.myParseFloat(pdMaster.StanjeOd) -
                    ls.myParseFloat(pdMaster.ZaduzenjePricuva) -
                    ls.myParseFloat(pdMaster.ZaduzenjeRezije) +
                    ls.myParseFloat(ps));
                //pdMaster.DugPretplata = DataService.toHrDecimalCalc(pdMaster.DugPretplata);

                //pdMaster.Uplaceno = DataService.toHrDecimalCalc(uplaceno);
                //if (pricuvaZaMaster != null && pricuvaZaMaster != undefined)
                //    pdMaster.ZaduzenjePricuva = DataService.toHrDecimalCalc(pricuvaZaMaster);
                //if (rezijeZaMaster != null && rezijeZaMaster != undefined)
                //    pdMaster.ZaduzenjeRezije = DataService.toHrDecimalCalc(rezijeZaMaster);

                //pdMaster.DugPretplata = pdMaster.Uplaceno;
                //console.log('uplaceno' + parseFloat(pdMaster.Uplaceno));
                //console.log('stanjeOd' + parseFloat(DataService.myParseFloat(pdMaster.StanjeOd)));
                //console.log('ZaduzenjePricuva' + parseFloat(pdMaster.ZaduzenjePricuva));
                //console.log('ZaduzenjeRezije' + parseFloat(pdMaster.ZaduzenjeRezije));
                //console.log('ps' + ps);
            });
            ls.decimalToHr(zgradaObj, 'pricuva');
            $scope.obracunKreiran = true;
        }


        function getUplaceno(masterId) {
            var uplaceno = 0;
            $scope.zgradaObj.PrihodiRashodi.forEach(function (prihodiRashodi) {
                if (prihodiRashodi.Godina == $scope.godina) {
                    prihodiRashodi.PrihodiRashodi_Prihodi.forEach(function (prihodi) {
                        if (prihodi.Mjesec == $scope.mjesec && prihodi.PosebniDioMasterId == masterId) {
                            uplaceno += prihodi.IznosUplacen != null ? parseFloat(ls.myParseFloat(prihodi.IznosUplacen)) : 0;
                        }
                    });
                }
            });
            return ls.toHrDecimalCalc(uplaceno);
        }
        
        var ukupanBrojLjudi = function () {
            var total = 0;
            $scope.PricuvaRezijeZaMjesec.PricuvaRezijePosebniDioMasteri.forEach(function (pdMaster) {
                total += parseInt(pdMaster.ObracunRezijeBrojClanova);
            });
            console.log('Ukupno ljudi:' + total);
            return total;
        }

        $scope.nacinObracunaPricuvaChanged = function (nacin) {
            if (nacin == 2) {
                $scope.cijenaPricuvaPostoVisible = false;
                $scope.cijenaPricuvaVisible = true;
            }
            else if (nacin == 3) {
                $scope.cijenaPricuvaPostoVisible = true;
                $scope.cijenaPricuvaVisible = false;
            }
            else {
                $scope.cijenaPricuvaPostoVisible = false;
                $scope.cijenaPricuvaVisible = false;
            }
        }

        $scope.nacinObracunaRezijeChanged = function (nacin) {
            switch (nacin) {
                case 0:
                    $scope.cijenaRezijePoBrojuVisible = false;
                    $scope.cijenaRezijeZaSvakiVisible = false;
                    break;
                case 1:
                    $scope.cijenaRezijePoBrojuVisible = true;
                    $scope.cijenaRezijeZaSvakiVisible = false;
                    break
                case 2:
                    $scope.cijenaRezijePoBrojuVisible = false;
                    $scope.cijenaRezijeZaSvakiVisible = true;
                    break;
            }
        }

        //$scope.toDecimalHrFn = function (x) {
        //    alert(DataService.toHrDecimalCalc(x));
        //    if (x != null && x != undefined)
        //        return x.toLocaleString('hr-HR', { minimumFractionDigits: 2 });
        //}

        function getFebDay() {
            var year = new Date().getFullYear();
            if (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0))
                return 29;
            return 28;
        }

        function getHeaderText() {
            switch (parseInt(mjesec)) {
                case 1:
                    return 'od 01.01. do 31.01. ' + godina + '.';
                case 2:
                    return 'od 01.02. do ' + getFebDay() + '.02. ' + godina + '.';
                case 3:
                    return 'od 01.03. do 31.03. ' + godina + '.';
                case 4:
                    return 'od 01.04. do 30.04. ' + godina + '.';
                case 5:
                    return 'od 01.05. do 31.05. ' + godina + '.';
                case 6:
                    return 'od 01.06. do 30.06. ' + godina + '.';
                case 7:
                    return 'od 01.07. do 31.07. ' + godina + '.';
                case 8:
                    return 'od 01.08. do 31.08. ' + godina + '.';
                case 9:
                    return 'od 01.09. do 30.09. ' + godina + '.';
                case 10:
                    return 'od 01.10. do 31.10. ' + godina + '.';
                case 11:
                    return 'od 01.11. do 30.11. ' + godina + '.';
                case 12:
                    return 'od 01.12. do 31.12. ' + godina + '.';
            }
        }
    }]);