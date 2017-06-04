angularApp.controller('prihodiModalCtrl', ['$scope', '$mdDialog', 'DataService', 'prihodRashodZaGodinu', 'mjesec', 'godina', 'posedbiDijelovi', 'zgrada',
    function ($scope, $mdDialog, DataService, prihodRashodZaGodinu, mjesec, godina, posedbiDijelovi, zgrada) {



        //zgradaObj.PrihodiRashodi.forEach(function (pr) {
        //console.log(pr);
        //if (pr.Godina == godina) {
        //    $scope.prihodRashodZaGodinu = pr; // ovo je master - sa kolekcijama prihoda i rashoda
        //    console.log($scope.prihodRashodZaGodinu);
        //}
        //});
        $scope.posedbiDijelovi = posedbiDijelovi;
        $scope.prihodRashodZaGodinu = prihodRashodZaGodinu;

        var tempObj = {};
        angular.copy($scope.prihodRashodZaGodinu, tempObj);

        // prosljedjen je cijeli objekt, nadji samo prihode iz mjeseca (godina je vec ranije odabrana)
        //$scope.zgradaObj = zgradaObj;
        $scope.mjesec = mjesec;
        $scope.godina = godina;
        $scope.period = getHeaderText();


        var dateUnosList = [];
        var dateObracunList = [];
        $scope.prihodRashodZaGodinu.PrihodiRashodi_Prihodi.forEach(function (prMjesec) {
            if (prMjesec.Mjesec == mjesec) {
                if (prMjesec.DatumUnosa != null) {
                    dateUnosList.push(new Date(prMjesec.DatumUnosa));
                }
                else {
                    var dejt = new Date();
                    console.log(dejt);
                    dateUnosList.push(dejt);
                    console.log(dateUnosList);
                }

                if (prMjesec.DatumObracuna != null) {
                    dateObracunList.push(new Date(prMjesec.DatumObracuna));
                }
                else {
                    var dejt = new Date();
                    console.log(dejt);
                    dateObracunList.push(dejt);
                }

                //dateUnosList.push(prMjesec.DatumUnosa != null ? new Date(prMjesec.DatumUnosa) : new Date());
                //dateplacanjeList.push(new Date(raMjesec.Datum.DatumPlacanja));
                //dateObracunList.push(prMjesec.DatumObracuna != null ? new Date(prMjesec.DatumObracuna) : new Date());
            }
            
        });
        $scope.dateUnosList = dateUnosList;
        $scope.dateObracunList = dateObracunList;
        //console.log($scope.dateUnosList);


        //izracunajUkupno();
        sumamry();

        $scope.dodajRecord = function () {
            dodajRec(false);
        }

        function dodajRec(PrijenosIzProlse) {
            var maxId = 0;

            $scope.prihodRashodZaGodinu.PrihodiRashodi_Prihodi.forEach(function (prMjesec) {
                if (prMjesec.Id > maxId)
                    maxId = prMjesec.Id;
            })
            var noviRecord = {
                Id: maxId + 1, PrihodiRashodiGodId: $scope.prihodRashodZaGodinu.Id, Mjesec: mjesec,
                Opis: '', Iznos: 0, Status: 'a', PosebniDioMasterId: null, DatumUnosa: new Date(),
                DatumObracuna: new Date()
            };
            $scope.prihodRashodZaGodinu.PrihodiRashodi_Prihodi.push(noviRecord);
            $scope.dateUnosList.push(new Date());
            $scope.dateObracunList.push(new Date());
            //sumamry();
        }

        $scope.delete = function (Id) {
            // ako je obj.Id == 0, obrisi zadnji rec u kolekciji (nije u bazi)
            if ($scope.prihodRashodZaGodinu.Id == 0) {
                $scope.prihodRashodZaGodinu.PrihodiRashodi_Prihodi.forEach(function (rec) {
                    if (rec.Id == Id) {
                        var index = $scope.prihodRashodZaGodinu.PrihodiRashodi_Prihodi.indexOf(rec)
                        $scope.prihodRashodZaGodinu.PrihodiRashodi_Prihodi.splice(index, 1);
                    }
                });
            }
            // ako nije, ako je status 'a', brisi, u suprotnom stavi status na 'd'
            else {
                $scope.prihodRashodZaGodinu.PrihodiRashodi_Prihodi.forEach(function (rec) {
                    if (rec.Id == Id) {
                        if (rec.Status == 'a') {
                            var index = $scope.prihodRashodZaGodinu.PrihodiRashodi_Prihodi.indexOf(rec)
                            $scope.prihodRashodZaGodinu.PrihodiRashodi_Prihodi.splice(index, 1);
                        }
                        else
                            rec.Status = 'd';
                    }
                })
            }
            //izracunajUkupno();
            //sumamry();
        }

        //$scope.ukupno = function () {
        //    izracunajUkupno();
        //}

        //function izracunajUkupno() {
        //    if ($scope.prihodRashodZaGodinu == undefined)
        //        return;
        //    var ukupno = 0;
        //    $scope.prihodRashodZaGodinu.PrihodiRashodi_Prihodi.forEach(function (rec) {
        //        if (rec.Mjesec == mjesec && rec.Status != 'd')
        //            ukupno += parseFloat(rec.Iznos);
        //    })
        //    $scope.total = (ukupno + parseFloat($scope.uplataPricuve != null ? $scope.uplataPricuve : 0)).toFixed(2);
        //    //console.log($scope.total);
        //}

        $scope.save = function () {
            $('nav').fadeIn();
            // za sve ostale recorde, stavi status 'u'
            var Placeno_u_currMjesecu = 0;
            $scope.prihodRashodZaGodinu.PrihodiRashodi_Prihodi.forEach(function (rec) {
                if (rec.Status == null)
                    rec.Status = 'u';
                if (rec.Mjesec == mjesec)
                    Placeno_u_currMjesecu += parseFloat(rec.Iznos);
            })

            var index = 0;
            $scope.prihodRashodZaGodinu.PrihodiRashodi_Prihodi.forEach(function (rec) {
                if (rec.Mjesec == mjesec) {
                    console.log($scope.dateUnosList);
                    //console.log($scope.dateObracunList);
                    for (var i = 0; i < $scope.prihodRashodZaGodinu.PrihodiRashodi_Prihodi.length; i++) {
                        if (index == i) {
                            rec.DatumUnosa = $scope.dateUnosList[i] != null ? new Date($scope.dateUnosList[i]) : null;
                            //alert(new Date($scope.dateUnosList[i]));
                            rec.DatumObracuna = $scope.dateObracunList[i] != null ? new Date($scope.dateObracunList[i]) : null;
                            break;
                        }
                    }
                    if (rec.Status == null)
                        rec.Status = 'u';
                    index++;
                }
            })


            $scope.prihodRashodZaGodinu.Godina = godina;
            $mdDialog.hide($scope.prihodRashodZaGodinu);
            console.log($scope.prihodRashodZaGodinu);


            $scope.parseDate = function (d) {
                return new Date(d);
            }

            // za prihode treba izracunati samo PlacenoPrihodMj2 za mjesec (godina je odabrana ranije)
            //switch (parseInt(mjesec)) {
            //    case 1:
            //        $scope.prihodRashodZaGodinu.PlacenoPrihodMj1 = Placeno_u_currMjesecu.toFixed(2);
            //        break;
            //    case 2:
            //        $scope.prihodRashodZaGodinu.PlacenoPrihodMj2 = Placeno_u_currMjesecu.toFixed(2);
            //        break;
            //    case 3:
            //        $scope.prihodRashodZaGodinu.PlacenoPrihodMj3 = Placeno_u_currMjesecu.toFixed(2);
            //        break;
            //    case 4:
            //        $scope.prihodRashodZaGodinu.PlacenoPrihodMj4 = Placeno_u_currMjesecu.toFixed(2);
            //        break;
            //    case 5:
            //        $scope.prihodRashodZaGodinu.PlacenoPrihodMj5 = Placeno_u_currMjesecu.toFixed(2);
            //        break;
            //    case 6:
            //        $scope.prihodRashodZaGodinu.PlacenoPrihodMj6 = Placeno_u_currMjesecu.toFixed(2);
            //        break;
            //    case 7:
            //        $scope.prihodRashodZaGodinu.PlacenoPrihodMj7 = Placeno_u_currMjesecu.toFixed(2);
            //        break;
            //    case 8:
            //        $scope.prihodRashodZaGodinu.PlacenoPrihodMj8 = Placeno_u_currMjesecu.toFixed(2);
            //        break;
            //    case 9:
            //        $scope.prihodRashodZaGodinu.PlacenoPrihodMj9 = Placeno_u_currMjesecu.toFixed(2);
            //        break;
            //    case 10:
            //        $scope.prihodRashodZaGodinu.PlacenoPrihodMj10 = Placeno_u_currMjesecu.toFixed(2);
            //        break;
            //    case 11:
            //        $scope.prihodRashodZaGodinu.PlacenoPrihodMj11 = Placeno_u_currMjesecu.toFixed(2);
            //        break;
            //    case 12:
            //        $scope.prihodRashodZaGodinu.PlacenoPrihodMj12 = Placeno_u_currMjesecu.toFixed(2);
            //        break;
            //}
            //$uibModalInstance.close($scope.prihodRashodZaGodinu);
        };

        $scope.cancel = function () {
            $('nav').fadeIn();
            $mdDialog.cancel(tempObj);
        };

        // provjeri lleap year
        function getFebDay() {
            var year = new Date().getFullYear();
            if (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0))
                return 29;
            return 28;
        }

        function getHeaderText() {
            switch (parseInt(mjesec)) {
                case 1:
                    return 'od 01.01. do 31.01. ' + $scope.godina + '.';
                case 2:
                    return 'od 01.02. do ' + getFebDay() + '.02. ' + $scope.godina + '.';
                case 3:
                    return 'od 01.03. do 31.03. ' + $scope.godina + '.';
                case 4:
                    return 'od 01.04. do 30.04. ' + $scope.godina + '.';
                case 5:
                    return 'od 01.05. do 31.05. ' + $scope.godina + '.';
                case 6:
                    return 'od 01.06. do 30.06. ' + $scope.godina + '.';
                case 7:
                    return 'od 01.07. do 31.07. ' + $scope.godina + '.';
                case 8:
                    return 'od 01.08. do 31.08. ' + $scope.godina + '.';
                case 9:
                    return 'od 01.09. do 30.09. ' + $scope.godina + '.';
                case 10:
                    return 'od 01.10. do 31.10. ' + $scope.godina + '.';
                case 11:
                    return 'od 01.11. do 30.11. ' + $scope.godina + '.';
                case 12:
                    return 'od 01.12. do 31.12. ' + $scope.godina + '.';
            }
        }


        var raspSredstvaMj1 = 0; var raspSredstvaMj2 = 0; var raspSredstvaMj3 = 0; var raspSredstvaMj4 = 0;
        var raspSredstvaMj5 = 0; var raspSredstvaMj6 = 0; var raspSredstvaMj7 = 0; var raspSredstvaMj8 = 0;
        var raspSredstvaMj9 = 0; var raspSredstvaMj10 = 0; var raspSredstvaMj11 = 0; var raspSredstvaMj12 = 0;

        //$scope.pricuvaOd = 0;
        //$scope.pricuvaNavedenom = 0;
        //$scope.ostaliPrihodi = 0;
        //$scope.rashodi = 0;
        //$scope.orocena = 0;

        function sumamry() {

            
            

            //console.log('prihodiZaMjesec');
            //console.log(prihodiZaMjesec);

            raspSredstvaMj1 = createSummaryForMonth(1);
            raspSredstvaMj2 = createSummaryForMonth(2);
            raspSredstvaMj3 = createSummaryForMonth(3);
            raspSredstvaMj4 = createSummaryForMonth(4);
            raspSredstvaMj5 = createSummaryForMonth(5);
            raspSredstvaMj6 = createSummaryForMonth(6);
            raspSredstvaMj7 = createSummaryForMonth(7);
            raspSredstvaMj8 = createSummaryForMonth(8);
            raspSredstvaMj9 = createSummaryForMonth(9);
            raspSredstvaMj10 = createSummaryForMonth(10);
            raspSredstvaMj11 = createSummaryForMonth(11);
            raspSredstvaMj12 = createSummaryForMonth(12);


            

        }

        function createSummaryForMonth(mj) {
            var prihodiZaMjesec = [];
            var rashodiZaMjesec = [];
            prihodRashodZaGodinu.PrihodiRashodi_Prihodi.forEach(function (prMj) {
                if (prMj.Mjesec == mj)
                    prihodiZaMjesec.push(prMj);
            });
            prihodRashodZaGodinu.PrihodiRashodi_Rashodi.forEach(function (prMj) {
                if (prMj.Mjesec == mj)
                    rashodiZaMjesec.push(prMj);
            });

            // 1. pricuva od 31.12
            var pricuvaOd = 0;
            if (mj == 1) {
                prihodiZaMjesec.forEach(function (p) {
                    if (p.PrijenosPricuve == true && p.Iznos != null)
                        pricuvaOd += p.iznos;
                });
            }
            else {
                switch (mj) {
                    case 2:
                        pricuvaOd = raspSredstvaMj1;
                        break;
                    case 3:
                        pricuvaOd = raspSredstvaMj2;
                        break;
                    case 4:
                        pricuvaOd = raspSredstvaMj3;
                        break;
                    case 5:
                        pricuvaOd = raspSredstvaMj4;
                        break;
                    case 6:
                        pricuvaOd = raspSredstvaMj5;
                        break;
                    case 7:
                        pricuvaOd = raspSredstvaMj6;
                        break;
                    case 8:
                        pricuvaOd = raspSredstvaMj7;
                        break;
                    case 9:
                        pricuvaOd = raspSredstvaMj8;
                        break;
                    case 10:
                        pricuvaOd = raspSredstvaMj9;
                        break;
                    case 11:
                        pricuvaOd = raspSredstvaMj10;
                        break;
                    case 12:
                        pricuvaOd = raspSredstvaMj11;
                        break;
                }
            }
            // 2. privuva u nevedenom
            var pricuvaNavedenom = 0;
            prihodiZaMjesec.forEach(function (rec) {
                if (rec.PrijenosPricuve != true && rec.Iznos != null) {
                    pricuvaNavedenom += parseFloat(rec.Iznos);
                }
            });

            // 3. ostali prihodi u navedenom
            var ostaliPrihodiuNR = 0;
            var prijenos = 0;
            var uplata = 0;
            prihodiZaMjesec.forEach(function (rec) {
                if (rec.PrijenosPricuve == true && rec.Iznos != null)
                    prijenos += parseFloat(rec.Iznos);
                if (rec.UplataPricuve == true && rec.Iznos != null)
                    uplata = rec.Iznos;
            });
            if (mj == 1)
                ostaliPrihodiuNR = pricuvaNavedenom - prijenos - uplata;
            else
                ostaliPrihodiuNR = pricuvaNavedenom - uplata;
            // 4. rashodi u navedenom
            var rashodiNavedenom = 0;
            rashodiZaMjesec.forEach(function (rec) {
                if (rec.Placeno != null)
                    rashodiNavedenom += parseFloat(rec.Placeno);
            });
            // 5. Orocena sredstva pricuve - unos
            var orocena = 0;
            zgrada.PricuvaRezijeGodina.forEach(function (prGod) {
                if (prGod.Godina == godina) {
                    prGod.PricuvaRezijeMjesec.forEach(function (prMj) {
                        if (prMj.Mjesec == mj && prMj.OrocenaSredstva != null)
                            orocena = prMj.OrocenaSredstva;
                    });
                }
            });

            if (mjesec == mj)
            {
                console.log(mjesec + ' ' + mj);
                $scope.pricuvaOd = pricuvaOd;
                $scope.pricuvaNavedenom = pricuvaNavedenom;
                $scope.ostaliPrihodi = ostaliPrihodiuNR;
                $scope.rashodi = rashodiNavedenom;
                $scope.orocena = orocena;
                $scope.raspoloziva = parseFloat(pricuvaOd) + parseFloat(pricuvaNavedenom) + parseFloat(ostaliPrihodiuNR) - parseFloat(rashodiNavedenom) - parseFloat(orocena);
                console.log('$scope.pricuvaNavedenom ' + $scope.pricuvaNavedenom);
            }

            return parseFloat(pricuvaOd) + parseFloat(pricuvaNavedenom) + parseFloat(ostaliPrihodiuNR) - parseFloat(rashodiNavedenom) - parseFloat(orocena);
        }
    

        // __________________________ SUMMARY_____________________________

        //var raspolozivaSrMj1 = 0; var raspolozivaSrMj2 = 0; var raspolozivaSrMj3 = 0; var raspolozivaSrMj4 = 0;
        //var raspolozivaSrMj5 = 0; var raspolozivaSrMj6 = 0; var raspolozivaSrMj7 = 0; var raspolozivaSrMj8 = 0;
        //var raspolozivaSrMj9 = 0; var raspolozivaSrMj10 = 0; var raspolozivaSrMj11 = 0;

        //var _pricuvaRezijeZaGodinu;
        //zgrada.PricuvaRezijeGodina.forEach(function (godina) {
        //    if (godina.Godina == godina)
        //        _pricuvaRezijeZaGodinu = godina;
        //});

        //if ($scope.prihodRashodZaGodinu != undefined && prihodRashodZaGodinu.PrihodiRashodi_Prihodi != undefined) {
        //    // ako nema unesenih prihoda i rashoda, nemoj racunati, jer ce puknuti
        //    raspolozivaSrMj1 = izracunSummary(1, false);
        //    raspolozivaSrMj2 = izracunSummary(2, false);
        //    raspolozivaSrMj3 = izracunSummary(3, false);
        //    raspolozivaSrMj4 = izracunSummary(4, false);
        //    raspolozivaSrMj5 = izracunSummary(5, false);
        //    raspolozivaSrMj6 = izracunSummary(6, false);
        //    raspolozivaSrMj7 = izracunSummary(7, false);
        //    raspolozivaSrMj8 = izracunSummary(8, false);
        //    raspolozivaSrMj9 = izracunSummary(9, false);
        //    raspolozivaSrMj10 = izracunSummary(10, false);
        //    raspolozivaSrMj11 = izracunSummary(11, false);
        //}
        //else
        //    console.log('PricuvaModal prihodiRashodi.PrihodiRashodiDetails su undef');


        //$scope.izracunSummaryScope = function (mjesec, uzmiOrocenaSredstvaSaScopea) {
    //    izracunSummary(mjesec, uzmiOrocenaSredstvaSaScopea);
    //    $scope.OkZaSimanje = true;
    //}

    //    function izracunSummary(mjesec, uzmiOrocenaSredstvaSaScopea) {
    //    console.log('PricuvaModal izracunSummary');
    //    // 1. Pricuva od
    //    var pricuvaOd = 0;
    //    if (mjesec == 1) {
    //        console.log('1mj');
    //        prihodRashodZaGodinu.PrihodiRashodi_Prihodi.forEach(function (pr) {
    //            if (pr.Mjesec == mjesec && pr.PrijenosIzProlse == true && pr.Iznos != null)
    //                pricuvaOd = parseFloat(pr.Iznos);
    //        });
    //    }
    //    else {
    //        switch (mjesec) {
    //            case 2:
    //                pricuvaOd = raspolozivaSrMj1;
    //                break;
    //            case 3:
    //                pricuvaOd = raspolozivaSrMj2;
    //                break;
    //            case 4:
    //                pricuvaOd = raspolozivaSrMj3;
    //                break;
    //            case 5:
    //                pricuvaOd = raspolozivaSrMj4;
    //                break;
    //            case 6:
    //                pricuvaOd = raspolozivaSrMj5;
    //                break;
    //            case 7:
    //                pricuvaOd = raspolozivaSrMj6;
    //                break;
    //            case 8:
    //                pricuvaOd = raspolozivaSrMj7;
    //                break;
    //            case 9:
    //                pricuvaOd = raspolozivaSrMj8;
    //                break;
    //            case 10:
    //                pricuvaOd = raspolozivaSrMj9;
    //                break;
    //            case 11:
    //                pricuvaOd = raspolozivaSrMj10;
    //                break;
    //            case 12:
    //                pricuvaOd = raspolozivaSrMj11;
    //                break;
    //        }
    //    }

    //    // 2. Pricuva u navedenom razdoblju
    //    var totalUplaceno = 0;
    //    _pricuvaRezijeZaGodinu.PricuvaRezijeMjesec.forEach(function (rec) {
    //        if (rec.Mjesec == mjesec) {
    //            rec.PricuvaRezijePosebniDioMasteri.forEach(function (master) {
    //                master.Uplaceno != null && !isNaN(master.Uplaceno) ? totalUplaceno += parseFloat(master.Uplaceno) : totalUplaceno = totalUplaceno;
    //            });
    //        }
    //    });

    //    // 3. Ostali prihodi u navedenom rezd ???

    //    // 4. Rashodi u navedenom razdoblju
    //    // 5. orocena sredstva
    //    var rashodi = 0;
    //    var orocenaSredstva = 0;
    //    switch (parseInt(mjesec)) {
    //        case 1:
    //            //$scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj1 != null ? orocenaSredstva = $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj1 : 0;
    //            currPrihodRashod.PlacenoRashodMj1 != null ? rashodi = currPrihodRashod.PlacenoRashodMj1 : 0;
    //            break;
    //        case 2:
    //            $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj2 != null ? orocenaSredstva = $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj2 : 0;
    //            currPrihodRashod.PlacenoRashodMj2 != null ? rashodi = currPrihodRashod.PlacenoRashodMj2 : 0;
    //            break;
    //        case 3:
    //            $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj3 != null ? orocenaSredstva = $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].M32 : 0;
    //            currPrihodRashod.PlacenoRashodMj3 != null ? rashodi = currPrihodRashod.PlacenoRashodMj3 : 0;
    //            break;
    //        case 4:
    //            $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj4 != null ? orocenaSredstva = $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj4 : 0;
    //            currPrihodRashod.PlacenoRashodMj4 != null ? rashodi = currPrihodRashod.PlacenoRashodMj4 : 0;
    //            break;
    //        case 5:
    //            $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj5 != null ? orocenaSredstva = $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj5 : 0;
    //            currPrihodRashod.PlacenoRashodMj5 != null ? rashodi = currPrihodRashod.PlacenoRashodMj5 : 0;
    //            break;
    //        case 6:
    //            $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj6 != null ? orocenaSredstva = $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj6 : 0;
    //            currPrihodRashod.PlacenoRashodMj6 != null ? rashodi = currPrihodRashod.PlacenoRashodMj6 : 0;
    //            break;
    //        case 7:
    //            $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj7 != null ? orocenaSredstva = $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj7 : 0;
    //            currPrihodRashod.PlacenoRashodMj7 != null ? rashodi = currPrihodRashod.PlacenoRashodMj7 : 0;
    //            break;
    //        case 8:
    //            $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj8 != null ? orocenaSredstva = $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj8 : 0;
    //            currPrihodRashod.PlacenoRashodMj8 != null ? rashodi = currPrihodRashod.PlacenoRashodMj8 : 0;
    //            break;
    //        case 9:
    //            $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj9 != null ? orocenaSredstva = $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj9 : 0;
    //            currPrihodRashod.PlacenoRashodMj9 != null ? rashodi = currPrihodRashod.PlacenoRashodMj9 : 0;
    //            break;
    //        case 10:
    //            $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj10 != null ? orocenaSredstva = $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj10 : 0;
    //            currPrihodRashod.PlacenoRashodMj10 != null ? rashodi = currPrihodRashod.PlacenoRashodMj10 : 0;
    //            break;
    //        case 11:
    //            $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj11 != null ? orocenaSredstva = $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj11 : 0;
    //            currPrihodRashod.PlacenoRashodMj11 != null ? rashodi = currPrihodRashod.PlacenoRashodMj11 : 0;
    //            break;
    //        case 12:
    //            pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj12 != null ? orocenaSredstva = $scope.pricuveZaZgraduGodina.PricuvaGod_OrocenaSredstva[0].Mj12 : 0;
    //            prihodiRashodi.PlacenoPrihodMj12 != null ? rashodi = prihodiRashodi.PlacenoPrihodMj12 : rashodi = 0;
    //            break;
    //    }

    //    if (uzmiOrocenaSredstvaSaScopea == true)
    //        orocenaSredstva = parseFloat($scope.orocenaSredstva);

    //    // 6. Raspoloziva sredstva pricuve
    //    var raspolozivaSredstva = parseFloat(pricuvaOd) + parseFloat(totalUplaceno) - parseFloat(rashodi) - parseFloat(orocenaSredstva);
    //    if ($scope.mjesec == mjesec) {
    //        $scope.pricuvaOd = pricuvaOd.toFixed(2);
    //        $scope.totalUplacenoSumm = totalUplaceno.toFixed(2);
    //        $scope.rashodi = rashodi.toFixed(2);
    //        if (uzmiOrocenaSredstvaSaScopea != true)
    //            $scope.orocenaSredstva = orocenaSredstva.toFixed(2);
    //        $scope.raspolozivaSredstva = raspolozivaSredstva = parseFloat(pricuvaOd) + parseFloat(totalUplaceno) - parseFloat(rashodi) - parseFloat($scope.orocenaSredstva).toFixed(2);
    //    }
    //    else
    //        return raspolozivaSredstva;
    //}
    }]);