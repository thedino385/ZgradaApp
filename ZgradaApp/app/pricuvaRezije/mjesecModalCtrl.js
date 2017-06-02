angularApp.controller('mjesecModalCtrl', ['$scope', '$rootScope', '$mdDialog', '$filter', 'toastr', 'DataService', 'zgradaObj', 'mjesec', 'godina',
    function ($scope, $rootScope, $mdDialog, $filter, toastr, DataService, zgradaObj, mjesec, godina) {

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
                    3. ako se rezultat proracuna ispisuje u UI, DataService.toHrDecimal(jsDecimal)
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
                    pdMaster.PricuvaRezijePosebniDioChildren.forEach(function (pdChild) {
                        pdChild.PricuvaRezijePosebniDioChildPovrsine.forEach(function (povrsina) {
                            pricuvaZaMaster += parseFloat(povrsina.Povrsina) * ($scope.PricuvaRezijeZaMjesec.SaKoef == true ? parseFloat(povrsina.Koef) : 1);
                            // console.log('PricuvaRezije, povrsine ' + pricuvaZaMaster);
                        });
                        pdChild.PricuvaRezijePosebniDioChildPripadci.forEach(function (prip) {
                            pricuvaZaMaster += parseFloat(prip.Povrsina) * ($scope.PricuvaRezijeZaMjesec.SaKoef == true ? parseFloat(prip.Koef) : 1);
                        });
                    });
                    pricuvaZaMaster = pricuvaZaMaster * parseFloat($scope.PricuvaRezijeZaMjesec.ObracunPricuvaCijenaM2);
                    console.log('pricuvaZaMaster Pricuva po m2: ' + pricuvaZaMaster);
                }
                else if ($scope.PricuvaRezijeZaMjesec.NacinObracunaPricuva == 1) {
                    // ukupno za zgradu, raspodjela ovisno o povrisni
                    var povrsinaPD = 0;
                    pdMaster.PricuvaRezijePosebniDioChildren.forEach(function (pdChild) {
                        pdChild.PricuvaRezijePosebniDioChildPovrsine.forEach(function (povrsina) {
                            povrsinaPD += parseFloat(povrsina.Povrsina) * ($scope.PricuvaRezijeZaMjesec.SaKoef == true ? parseFloat(povrsina.Koef) : 1);
                        });
                        pdChild.PricuvaRezijePosebniDioChildPripadci.forEach(function (prip) {
                            povrsinaPD += parseFloat(prip.Povrsina) * ($scope.PricuvaRezijeZaMjesec.SaKoef == true ? parseFloat(prip.Koef) : 1);
                        });
                    });
                    console.log('povrsinaPD ' + povrsinaPD);
                    console.log(parseFloat($scope.PricuvaRezijeZaMjesec.ObracunPricuvaCijenaUkupno));
                    pricuvaZaMaster = parseFloat(povrsinaPD) / parseFloat(povrsinaZgrade()) * parseFloat($scope.PricuvaRezijeZaMjesec.ObracunPricuvaCijenaUkupno);
                    console.log('pricuvaZaMaster Pricuva - respodjela od ukupno: ' + pricuvaZaMaster);
                }
                else if ($scope.PricuvaRezijeZaMjesec.NacinObracunaPricuva == 2) {
                    // cijena za svaki pdMaster
                    pricuvaZaMaster = parseFloat(pdMaster.ObracunPricuvaCijenaSlobodanUnos);
                }

                // rezije
                if ($scope.PricuvaRezijeZaMjesec.NacinObracunaRezije == 0) {
                    // ukupno za zgradu, raspodjela ovisno o povrisni
                    var povrsinaPD = 0;
                    pdMaster.PricuvaRezijePosebniDioChildren.forEach(function (pdChild) {
                        pdChild.PricuvaRezijePosebniDioChildPovrsine.forEach(function (povrsina) {
                            povrsinaPD += parseFloat(povrsina.Povrsina) * ($scope.PricuvaRezijeZaMjesec.SaKoef == true ? parseFloat(povrsina.Koef) : 1);
                        });
                        pdChild.PricuvaRezijePosebniDioChildPripadci.forEach(function (prip) {
                            povrsinaPD += parseFloat(prip.Povrsina) * ($scope.PricuvaRezijeZaMjesec.SaKoef == true ? parseFloat(prip.Koef) : 1);
                        });
                    });
                    console.log('$scope.PricuvaRezijeZaMjesec.ObracunRezijeCijenaUkupno ' + $scope.PricuvaRezijeZaMjesec.ObracunRezijeCijenaUkupno);
                    console.log('povrsinaPD ' + povrsinaPD);
                    console.log('povrsinaZgrade ' + povrsinaZgrade());
                    rezijeZaMaster = parseFloat(povrsinaPD) / parseFloat(povrsinaZgrade()) * parseFloat($scope.PricuvaRezijeZaMjesec.ObracunRezijeCijenaUkupno);
                    console.log('PricuvaRezije, rezije raspodjela od ukupno: ' + rezijeZaMaster);
                }
                else if ($scope.PricuvaRezijeZaMjesec.NacinObracunaRezije == 1) {
                    // po broju clanova
                    var povrsinaPD = 0;
                    //pdMaster.PricuvaRezijePosebniDioChildren.forEach(function (pdChild) {
                    //    pdChild.PricuvaRezijePosebniDioChildPovrsine.forEach(function (povrsina) {
                    //        povrsinaPD += parseFloat(povrsina.Povrsina) * $scope.PricuvaRezijeZaMjesec.SaKoef == true ? parseFloat(povrsina.Koef)/100 : 1;
                    //    });
                    //    pdChild.PricuvaRezijePosebniDioChildPripadci.forEach(function (prip) {
                    //        povrsinaPD += parseFloat(prip.Povrsina) * $scope.PricuvaRezijeZaMjesec.SaKoef == true ? parseFloat(prip.Koef) : 1;
                    //    });
                    //});
                    //rezijeZaMaster = parseFloat(povrsinaPD) / parseInt(povrsinaZgrade()) * parseFloat(pdMaster.ObracunRezijeBrojClanova);
                    // broj ljudi (upisan) / ukupan broj * cijena
                    console.log('pdMaster.ObracunRezijeBrojClanova ' + pdMaster.ObracunRezijeBrojClanova);
                    rezijeZaMaster = parseInt(pdMaster.ObracunRezijeBrojClanova) / parseInt(ukupanBrojLjudi()) * parseFloat($scope.PricuvaRezijeZaMjesec.ObracunRezijaCijenaUkupnoPoBrojuClanova);
                    console.log('PricuvaRezije, Rezije po bruju clanova: ' + rezijeZaMaster);
                }
                else if ($scope.PricuvaRezijeZaMjesec.NacinObracunaRezije == 2) {
                    // cijena za svaki pd
                    rezijeZaMaster = parseFloat(pdMaster.ObracunRezijeCijenaSlobodanUnos);
                }

                //pdMaster.Zaduzenje = parseFloat(pricuvaZaMaster + rezijeZaMaster).toFixed(2);
                if (pricuvaZaMaster != null && pricuvaZaMaster != undefined)
                    pdMaster.ZaduzenjePricuva = parseFloat(pricuvaZaMaster).toFixed();
                if (rezijeZaMaster != null && rezijeZaMaster != undefined)
                    pdMaster.ZaduzenjeRezije = parseFloat(rezijeZaMaster).toFixed(2);



                // Uplaceno  se vuse iz Prihoda - suma prihoda za pdMasterId za ovaj mjesec
                var uplaceno = 0;
                $scope.zgradaObj.PrihodiRashodi.forEach(function (prihodiRashodi) {
                    if (prihodiRashodi.Godina == $scope.godina) {
                        console.log('CP1');
                        prihodiRashodi.PrihodiRashodi_Prihodi.forEach(function (prihodi) {
                            console.log('CP1');
                            console.log(prihodi.Mjesec == $scope.mjesec);
                            console.log(prihodi.PosebniDioMasterId == pdMaster.Id);
                            if (prihodi.Mjesec == $scope.mjesec && prihodi.PosebniDioMasterId == pdMaster.PosebniDioMasterId) {
                                uplaceno += parseFloat(prihodi.Iznos)
                            }
                        });
                    }
                });
                pdMaster.Uplaceno = parseFloat(uplaceno).toFixed(2);

                // Dug/Pretplata = Uplaceno + StanjeOd - Zaduzenje - PocetnoStanje
                var ps = 0;
                if (pdMaster.PocetnoStanje != null)
                    ps = parseFloat(pdMaster.PocetnoStanje);
                pdMaster.DugPretplata = (parseFloat(pdMaster.Uplaceno) + parseFloat(pdMaster.StanjeOd) - parseFloat(pdMaster.ZaduzenjePricuva) - parseFloat(pdMaster.ZaduzenjeRezije) + ps).toFixed(2);;
            });
            $scope.obracunKreiran = true;
        }



        var povrsinaZgrade = function () {
            var total = 0;
            $scope.PricuvaRezijeZaMjesec.PricuvaRezijePosebniDioMasteri.forEach(function (pdMaster) {
                pdMaster.PricuvaRezijePosebniDioChildren.forEach(function (pdChild) {
                    pdChild.PricuvaRezijePosebniDioChildPovrsine.forEach(function (povrsina) {
                        //total += parseFloat(povrsina.Povrsina) * ($scope.PricuvaRezijeZaMjesec.SaKoef == true ? parseFloat(povrsina.Koef) : 1);
                        total += parseFloat(povrsina.Povrsina);
                    });
                    pdChild.PricuvaRezijePosebniDioChildPripadci.forEach(function (prip) {
                        //total += parseFloat(prip.Povrsina) * ($scope.PricuvaRezijeZaMjesec.SaKoef == true ? parseFloat(prip.Koef) : 1);
                        total += parseFloat(prip.Povrsina);
                    });
                });
            });
            console.log('Povrisna zgrade: ' + total);
            return total;
        }

        //var povrsinaZgrade = function () {
        //    var total = 0;
        //    $scope.zgradaObj.Zgrade_PosebniDijeloviMaster.forEach(function (pdMaster) {
        //        pdMaster.Zgrade_PosebniDijeloviChild.forEach(function (pdChild) {
        //            pdChild.Zgrade_PosebniDijeloviChild_Povrsine.forEach(function (povrsina) {
        //                //total += parseFloat(povrsina.Povrsina) * ($scope.PricuvaRezijeZaMjesec.SaKoef == true ? parseFloat(povrsina.Koef) : 1);
        //                total += parseFloat(povrsina.Povrsina);
        //            });
        //            pdChild.Zgrade_PosebniDijeloviChild_Pripadci.forEach(function (prip) {
        //                //total += parseFloat(prip.Povrsina) * ($scope.PricuvaRezijeZaMjesec.SaKoef == true ? parseFloat(prip.Koef) : 1);
        //                total += parseFloat(prip.Povrsina);
        //            });
        //        });
        //    });
        //    console.log('Povrisna zgrade: ' + total);
        //    return total;
        //}


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