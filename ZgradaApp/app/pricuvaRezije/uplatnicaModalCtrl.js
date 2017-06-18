angularApp.controller('uplatnicaModalCtrl', ['$scope', '$rootScope', '$mdDialog', 'orderByFilter', 'DataService', 'CalcService', 'LocalizationService', 'zgradaObj', 'mjesec', 'godina',
    function ($scope, $rootScope, $mdDialog, orderBy, ds, cs, ls, zgradaObj, mjesec, godina) {

        $scope.zgradaObj = zgradaObj;
        $scope.godina = godina;
        $scope.mjesec = mjesec;
        var _badColor = '#E65100';
        $scope.isInvalid = false;

        var tempObj = {};
        angular.copy($scope.zgradaObj, tempObj);

        zgradaObj.PricuvaRezijeGodina.forEach(function (prGod) {
            if (prGod.Godina == godina) {
                prGod.PricuvaRezijeMjesec.forEach(function (prMj) {
                    if (prMj.Mjesec == mjesec)
                        $scope.PricuvaRezijeZaMjesec = prMj;
                });
            }
        });

        $scope.msg = 'mjesec: ' + mjesec + ', godina: ' + godina;

        $scope.tipoviDuga = [{ Id: 'r', Naziv: 'Režije' }, { Id: 'p', Naziv: 'Pričuva' }, { Id: 'a', Naziv: 'Režije i pričuva' }, { Id: '-', Naziv: 'Ništa' }];
        $scope.tipoviPlacanja = [{ Id: 'r', Naziv: 'Račun' }, { Id: 'u', Naziv: 'Uplatnica' }, { Id: '-', Naziv: 'Ništa' }];
        $scope.jedinicneMjere = [{ Id: 1, Naziv: 'm2' }, { Id: 2, Naziv: '%' }];

        console.log($scope.PricuvaRezijeZaMjesec.PricuvaRezijeMjesec_Uplatnice);
        if ($scope.PricuvaRezijeZaMjesec.PricuvaRezijeMjesec_Uplatnice == undefined || $scope.PricuvaRezijeZaMjesec.PricuvaRezijeMjesec_Uplatnice.length == 0) {
            var uList = [];

            propertyName = 'PosebniDioMasterId';
            reverse = false;
            var masteriList = orderBy($scope.PricuvaRezijeZaMjesec.PricuvaRezijePosebniDioMasteri, propertyName, reverse);

            sortBy = function (propertyName) {
                reverse = (propertyName !== null && propertyName === propertyName)
                    ? !reverse : false;
                propertyName = propertyName;
                masteriList = orderBy(masteriList, propertyName, reverse);
            };
            //console.log('masteriList');
            //console.log(masteriList);


            var mId = -1;
            var index = 1;
            masteriList.forEach(function (m) {
                m.PricuvaRezijePosebniDioMasterVlasnici.forEach(function (v) {
                    var o = {
                        index: index, Id: 0, PricuvaRezijeMjesecId: $scope.PricuvaRezijeZaMjesec.Id, PosebniDioMasterId: m.PosebniDioMasterId, PlatiteljId: v.VlasnikId,
                        TipDuga: '-', TipPlacanja: '-', UdioPricuva: 0, UdioRezije: 0, IznosRezije: 0, IznosPricuva: 0, PdfUrl: '',
                        displayLine: false, displayBtnAdd: false, displayBtnRemove: false, platitelji: [], tdColorPricuva: '#ffffff', tdColorRezije: '#ffffff',
                        BrojRacuna: '', DatumRacuna: zadnjiDanUMjesecu(), DatumIsporuke: zadnjiDanUMjesecu(), DatumDospijeca: zadnjiDanUMjesecu(),
                        JedMjera: '', Opis: '', JedCijena: '', Kolicina: '', Ukupno: '', Napomena: '', url: null,
                        IznosRezijeOrig: 0, IznosPricuvaOrig: 0
                    }
                    o.BrojRacuna = genBrojRacunaPozivnaBroj(m.BrojStana);
                    // udio pricuva/rezije - povlaci se udio iz vlasnistva
                    m.PricuvaRezijePosebniDioMasterVlasnici.forEach(function (prVlasnik) {
                        if (m.PeriodId == prVlasnik.PeriodId) {
                            if (prVlasnik.Udio != null && prVlasnik.Udio != undefined) {
                                if (prVlasnik.Udio.toString().indexOf('/') != -1) {
                                    var val1 = parseInt(prVlasnik.Udio.toString().split('/')[0].replace(',', '.'));
                                    var val2 = parseInt(prVlasnik.Udio.toString().split('/')[1].replace(',', '.'));
                                    var udio = parseFloat(val1 / val2);
                                    o.UdioPricuva = parseFloat(udio * 100).toString().replace('.', ',');
                                    o.UdioRezije = parseFloat(udio * 100).toString().replace('.', ',');
                                    // iznos pricuve i rezija = iznos * udio
                                    o.IznosPricuva = parseFloat(ls.myParseFloat(m.ZaduzenjePricuva) * udio).toString().replace('.', ',');
                                    o.IznosRezije = parseFloat(ls.myParseFloat(m.ZaduzenjeRezije) * udio).toString().replace('.', ',');
                                    o.IznosRezijeOrig = o.IznosRezije;
                                    o.IznosPricuvaOrig = o.IznosPricuva;
                                }
                            }
                        }
                    });

                    // opis za racun
                    zgradaObj.Zgrade_PosebniDijeloviMaster.forEach(function (zgradamaster) {
                        console.log(zgradamaster.OpisRacun);
                        if (zgradamaster.Id == o.PosebniDioMasterId && zgradamaster.OpisRacun != null) {
                            console.log(zgradamaster.OpisRacun);
                            o.Opis = zgradamaster.OpisRacun.replace('$DATUM', prettifyMjesec());
                            //o.Napomena = o.Napomena.replace('$mjesec', prettifyMjesec());
                        }
                    });
                    // maponema racun - zgrada level
                    o.Napomena = dodajDatumuNapomenu();
                    console.log(o);
                    m.PricuvaRezijePosebniDioMasterVlasnici.forEach(function (v) {
                        zgradaObj.Zgrade_Stanari.forEach(function (s) {
                            if (s.Id == v.VlasnikId) {
                                var k = { Naziv: s.Ime + ' ' + s.Prezime, Id: s.Id };
                                o.platitelji.push(k);

                                //o.primatelji.push(k);
                            }
                        });
                    });
                    //var upravitelj = { Naziv: "Upravitelj", Id: 1000 }; // TODOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
                    //o.primatelji.push(upravitelj);
                    //var rh = { Naziv: "RH", Id: 10001 }; // TODOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
                    //o.primatelji.push(rh);
                    dodajUpraviteljaiRH(o);
                    uList.push(o);
                    index++;
                });
            });
            //console.clear();
            //console.log(uList);
            $scope.PricuvaRezijeZaMjesec.PricuvaRezijeMjesec_Uplatnice = prepraviHrove(uList);
        }
        else {
            // uplatnice kolekcija vec postoji u bazi
            var index = 1;
            $scope.PricuvaRezijeZaMjesec.PricuvaRezijeMjesec_Uplatnice.forEach(function (rec) {
                rec.DatumDospijeca = new Date(rec.DatumDospijeca);
                rec.DatumIsporuke = new Date(rec.DatumIsporuke);
                rec.DatumRacuna = new Date(rec.DatumRacuna);
                rec.PdfUrl = '/Content/download/racuniUplatnice/' + zgradaObj.CompanyId + '/' + godina + '/' + mjesec + '/' + rec.PdfUrl;
                rec.index = index;
                index++;

                // platitelji stuff
                $scope.PricuvaRezijeZaMjesec.PricuvaRezijePosebniDioMasteri.forEach(function (master) {
                    master.PricuvaRezijePosebniDioMasterVlasnici.forEach(function (v) {
                        zgradaObj.Zgrade_Stanari.forEach(function (s) {
                            if (s.Id == v.VlasnikId) {
                                var k = { Naziv: s.Ime + ' ' + s.Prezime, Id: s.Id };
                                rec.platitelji.push(k);
                            }
                        });
                        // spremi iznos prizuve i rezija
                        rec.IznosRezijeOrig = master.ZaduzenjeRezije;
                        rec.IznosPricuvaOrig = master.ZaduzenjePricuva;
                    });
                })
                var rh = { Naziv: "RH", Id: -1 }; // TODOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
                rec.platitelji.push(rh);
                

            })
            $scope.PricuvaRezijeZaMjesec.PricuvaRezijeMjesec_Uplatnice = prepraviHrove($scope.PricuvaRezijeZaMjesec.PricuvaRezijeMjesec_Uplatnice);
        }

        function fnRacunStuff(o) {
            // TipDuga: 'p', TipPlacanja: 'r'
            if (o.TipPlacanja == 'r') {

                $scope.PricuvaRezijeZaMjesec.PricuvaRezijePosebniDioMasteri.forEach(function (masterPricuva) {
                    if (masterPricuva.PosebniDioMasterId == o.PosebniDioMasterId) {
                        var nacinObracunaPricuva = $scope.PricuvaRezijeZaMjesec.NacinObracunaPricuva;
                        var nacinObracunaRezije = $scope.PricuvaRezijeZaMjesec.NacinObracunaRezije;
                        if (o.TipDuga == 'p') {
                            // o.Ukupno = ds.toHrDecimalReadOnly(masterPricuva.ZaduzenjePricuva);
                            // ukupno nije iz pricuve jer se mogao promijeniti postotak - trazi u uplatnicama
                            o.Ukupno = ls.toHrDecimalReadOnly(o.IznosPricuva);

                            switch (nacinObracunaPricuva) {
                                case 0:
                                    // cijena po m2
                                    o.JedMjera = 'm2';
                                    o.JedCijena = ls.toHrDecimalReadOnly($scope.PricuvaRezijeZaMjesec.ObracunPricuvaCijenaM2);
                                    o.Kolicina = ls.toHrDecimalReadOnly(cs.povrsinaPda($scope.PricuvaRezijeZaMjesec, masterPricuva.PosebniDioMasterId));
                                    break;
                                case 1:
                                    // raspodjela iznosa po povrsini, zadaje se ukupna cijena za zgradu, 
                                    // jedMj = m2
                                    // jedCijena = o.Ukupno / broj kvadrata
                                    // kolicina = broj kvadrata
                                    o.JedMjera = 'm2';
                                    var povrsinaStana = cs.povrsinaPda($scope.PricuvaRezijeZaMjesec, masterPricuva.PosebniDioMasterId);
                                    o.jedCijena = ls.toHrDecimalReadOnly(ls.myParseFloat(o.Ukupno) / povrsinaStana);
                                    o.Kolicina = ls.toHrDecimalReadOnly(povrsinaStana);
                                    break;
                                case 2:
                                    // % za svaki PD - cijena za zgradu se unosi
                                    o.JedMjera = 'm2';
                                    var povrsinaStana = cs.povrsinaPda($scope.PricuvaRezijeZaMjesec, masterPricuva.PosebniDioMasterId);
                                    o.Kolicina = ls.toHrDecimalReadOnly(povrsinaStana);
                                    o.jedCijena = ls.toHrDecimalReadOnly(ls.myParseFloat(o.Ukupno) / povrsinaStana);
                                    break;
                                case 3:
                                    o.JedMjera = 'm2';
                                    var povrsinaStana = cs.povrsinaPda($scope.PricuvaRezijeZaMjesec, masterPricuva.PosebniDioMasterId);
                                    o.Kolicina = ls.toHrDecimalReadOnly(povrsinaStana);
                                    o.jedCijena = ls.toHrDecimalReadOnly(ls.myParseFloat(o.Ukupno) / povrsinaStana);
                                    break;
                            }
                            //o.Ukupno = ds.toHrDecimalReadOnly(masterPricuva.ZaduzenjePricuva); - ne valja
                        }
                        else {
                            // rezije
                            o.Ukupno = ls.toHrDecimalReadOnly(o.IznosRezije);
                            switch (nacinObracunaRezije) {
                                case 0:
                                    // raspodjela iznosa po povrsini, zadaje se ukupna cijena za zgradu, 
                                    // jedMj = m2
                                    // jedCijena = o.Ukupno / broj kvadrata
                                    // kolicina = broj kvadrata
                                    o.JedMjera = 'm2';
                                    var povrsinaStana = cs.povrsinaPda($scope.PricuvaRezijeZaMjesec, masterPricuva.PosebniDioMasterId);
                                    o.JedCijena = ls.toHrDecimalReadOnly(ls.myParseFloat(o.Ukupno) / povrsinaStana);
                                    o.Kolicina = ls.toHrDecimalReadOnly(povrsinaStana);
                                    // raspodjela iznosa po povrsini, zadaje se ukupna cijena za zgradu, 
                                    // jedCijena = povrsinaPd(sa ili bez koef) / povrsinaZgrade 
                                    // kolicina = povrsinaPd-a(sa ili bez koef)
                                    // zaduzenje je postotak ukpnog po povrsini
                                    //o.JedMjera = '%';
                                    //var povrsinaStana = cs.povrsinaPda($scope.PricuvaRezijeZaMjesec, masterPricuva.PosebniDioMasterId, $scope.PricuvaRezijeZaMjesec.SaKoef);
                                    //var jedCijena = parseFloat(ds.myParseFloat($scope.PricuvaRezijeZaMjesec.ObracunRezijeCijenaUkupno) / ds.myParseFloat(povrsinaStana));
                                    //o.JedCijena = ds.toHrDecimalReadOnly(jedCijena.toString().replace('.', ','));
                                    //o.Kolicina = ds.toHrDecimalReadOnly(povrsinaStana);
                                    break;
                                case 1:
                                    // po broju clanova
                                    o.JedMjera = 'član';
                                    o.Kolicina = masteriList.ObracunRezijeBrojClanova;
                                    o.JedCijena = ls.toHrDecimalReadOnly(ls.parseFloat(o.Ukupno) / ls.parseFloat(o.Kolicina));
                                    break;
                                case 2:
                                    o.JedMjera = 'posebni dio';
                                    o.Kolicina = 1;
                                    o.JedCijena = ls.toHrDecimalReadOnly(ls.parseFloat(o.Ukupno));
                                    break;
                            }
                            //o.Ukupno = masterRezije.ZaduzenjeRezije;
                        }
                    }
                });
            }
        }
        $scope.RacunStuff = function (obj) {
            fnRacunStuff(obj);
        }

        function prettifyMjesec() {
            return parseInt(mjesec) < 10 ? '0' + mjesec.toString() + '/' + godina : mjesec.toString() + '/' + godina;
        }

        function dodajUpraviteljaiRH(o) {
            //var upravitelj = { Naziv: "Upravitelj", Id: -1 }; // TODOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
            var rh = { Naziv: "RH", Id: -1 }; // TODOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
            //o.primatelji.push(rh);
            //o.primatelji.push(upravitelj);
            o.platitelji.push(rh);
            //o.platitelji.push(upravitelj);
        }

        $scope.dodajRecord = function (obj) {

            var index = $scope.PricuvaRezijeZaMjesec.PricuvaRezijeMjesec_Uplatnice.indexOf(obj);

            var o = {
                index: index, Id: 0, PricuvaRezijeMjesecId: $scope.PricuvaRezijeZaMjesec.Id, PosebniDioMasterId: obj.PosebniDioMasterId, PlatiteljId: obj.PlatiteljId,
                TipDuga: '-', TipPlacanja: '-', UdioPricuva: 0, UdioRezije: 0, IznosRezije: 0, IznosPricuva: 0, PdfUrl: '', displayLine: false,
                displayBtnAdd: false, displayBtnRemove: true, platitelji: obj.platitelji, tdColorPricuva: '#ffffff', tdColorRezije: '#ffffff',
                BrojRacuna: '', DatumRacuna: zadnjiDanUMjesecu(), DatumIsporuke: zadnjiDanUMjesecu(), DatumDospijeca: zadnjiDanUMjesecu(), JedMjera: '', Opis: '', JedCijena: '', Kolicina: '',
                Ukupno: '', Napomena: dodajDatumuNapomenu(), url: null,
                IznosRezijeOrig: 0, IznosPricuvaOrig: 0
            }
            // opis za racun
            zgradaObj.Zgrade_PosebniDijeloviMaster.forEach(function (zgradamaster) {
                if (zgradamaster.Id == o.PosebniDioMasterId && zgradamaster.OpisRacun != null) {
                    o.Opis = zgradamaster.OpisRacun.replace('$DATUM ', prettifyMjesec());
                    //o.Napomena = o.Napomena.replace('$mjesec', prettifyMjesec());
                }
                if (zgradamaster.Id == o.PosebniDioMasterId) {
                    o.BrojRacuna = genBrojRacunaPozivnaBroj(mzgradamaster.Broj);
                }
                
            });
            o.Napomena = zgradaObj.NapomenaRacun;
            $scope.PricuvaRezijeZaMjesec.PricuvaRezijeMjesec_Uplatnice.push(o);
            $scope.PricuvaRezijeZaMjesec.PricuvaRezijeMjesec_Uplatnice = prepraviHrove($scope.PricuvaRezijeZaMjesec.PricuvaRezijeMjesec_Uplatnice);
            validacijaUdjela(obj.PosebniDioMasterId);
        }

        $scope.removeRecord = function (rec) {
            var list = $scope.PricuvaRezijeZaMjesec.PricuvaRezijeMjesec_Uplatnice;
            list.splice($scope.PricuvaRezijeZaMjesec.PricuvaRezijeMjesec_Uplatnice.indexOf(rec), 1);
            list[list.length - 1].displayBtnAdd = true;
            $scope.PricuvaRezijeZaMjesec.PricuvaRezijeMjesec_Uplatnice = list;
            validacijaUdjela(rec.PosebniDioMasterId);
        }

        $scope.createRacun = function (obj) {
            $rootScope.loaderActive = true;

            var o = {
                Id: obj.Id, index: obj.index,
                BrojRacuna: obj.BrojRacuna, DatumRacuna: obj.DatumRacuna, DatumIsporuke: obj.DatumIsporuke, DatumDospijeca: obj.DatumDospijeca,
                JedMjera: null, Opis: obj.Opis, JedCijena: obj.JedCijena, Kolicina: obj.Kolicina, Ukupno: obj.Ukupno, Napomena: obj.Napomena
            }

            if (obj.JedMjera == 1)
                o.JedMjera = 'm2'
            else if (obj.JedMjera == 2)
                o.JedMjera = '%'

            ds.createRacun(o).then(
                function (result) {
                    $rootScope.loaderActive = false;
                    $scope.PricuvaRezijeZaMjesec.PricuvaRezijeMjesec_Uplatnice.forEach(function (u) {
                        if (obj.index == o.index)
                            u.url = result.data;
                    });
                },
                function (result) {
                    $rootScope.loaderActive = false;
                }
            )
        }



        function prepraviHrove(uList) {
            var masteri = [];
            //var indexi = [];

            for (var i = 0; i < uList.length; i++) {
                uList[i].displayLine = false;
                uList[i].displayBtnAdd = false;
            }

            for (var i = 0; i < uList.length; i++) {
                if (masteri.indexOf(uList[i].PosebniDioMasterId) == -1) {
                    uList[i].displayBtnAdd = true;
                    uList[i].displayLine = true;
                    masteri.push(uList[i].PosebniDioMasterId);
                }
                else {
                    var index = masteri.indexOf(uList[i].PosebniDioMasterId);
                    uList[parseInt(i) - 1].displayBtnAdd = false;
                    uList[parseInt(i) - 1].displayLine = false;
                    uList[i].displayBtnAdd = true;
                    uList[i].displayLine = true;
                    masteri[index] = uList[i].PosebniDioMasterId;
                }


            }



            //if (uList.length >= 2) {
            //    var prviMasterId = uList[0].PosebniDioMasterId;
            //    for (var i = 0; i < uList.length; i++) {
            //        if (uList[i].PosebniDioMasterId != prviMasterId) {
            //            uList[parseInt(i) - 1].displayLine = true;
            //            uList[parseInt(i) - 1].displayBtnAdd = true;
            //            prviMasterId = uList[i].PosebniDioMasterId;
            //        }
            //    }
            //}


            return uList;
        }



        function dodajDatumuNapomenu() {
            return zgradaObj.NapomenaRacun.replace("$DATUM", prettifyDate());
        }

        function prettifyDate() {
            return parseInt(mjesec) < 10 ? '0' + mjesec + '/' + godina : mjesec + '/' + godina;
        }

        function zadnjiDanUMjesecu() {
            return new Date((new Date(godina, mjesec)) - 1);
        }

        $scope.udioChanged = function (masterId) {
            $scope.PricuvaRezijeZaMjesec.PricuvaRezijeMjesec_Uplatnice.forEach(function (rec) {
                if (rec.PosebniDioMasterId == masterId) {
                    var udioR = rec.UdioRezije;
                    var udioP = rec.UdioPricuva;
                    if (rec.UdioRezije == undefined || rec.UdioRezije == null || rec.UdioRezije == '')
                        udioR = 0;
                    if (rec.UdioPricuva == undefined || rec.UdioPricuva == null || rec.UdioPricuva == '')
                        udioP = 0;
                    //rec.IznosPricuva = parseFloat(ls.myParseFloat(rec.IznosPricuvaOrig) * ls.myParseFloat(udioP) / 100).toString().replace('.', ',');
                    //rec.IznosRezije = parseFloat(ls.myParseFloat(rec.IznosRezijeOrig) * ls.myParseFloat(udioR) / 100).toString().replace('.', ',');
                    rec.IznosPricuva = ls.toHrDecimalReadOnly(ls.myParseFloat(rec.IznosPricuvaOrig) * ls.myParseFloat(udioP) / 100);
                    rec.IznosRezije = ls.toHrDecimalReadOnly(ls.myParseFloat(rec.IznosRezijeOrig) * ls.myParseFloat(udioR) / 100);

                    
                    validacijaUdjela(masterId);
                }
            });
        }

        function validacijaUdjela(masterId) {
            // provjeri za ovaj master da li je sve ok
            var p = 0;
            var r = 0;
            var invalidP = false;
            var invalidR = false;
            $scope.PricuvaRezijeZaMjesec.PricuvaRezijeMjesec_Uplatnice.forEach(function (rec) {
                //rec.tdColorPricuva = '#ffffff';
                //rec.tdColorRezije = '#ffffff';

                if (rec.PosebniDioMasterId == masterId) {
                    p += ls.myParseFloat(rec.UdioPricuva);
                    r += ls.myParseFloat(rec.UdioRezije);
                }

                // redColorPricuva = false, redColorRezije = false,
            });
            if (parseFloat(p) != parseFloat(100)) {
                $scope.PricuvaRezijeZaMjesec.PricuvaRezijeMjesec_Uplatnice.forEach(function (rec) {
                    if (rec.PosebniDioMasterId == masterId) {
                        rec.tdColorPricuva = _badColor;
                        invalidR = true;
                    }
                });
            }
            else {
                $scope.PricuvaRezijeZaMjesec.PricuvaRezijeMjesec_Uplatnice.forEach(function (rec) {
                    if (rec.PosebniDioMasterId == masterId) {
                        rec.tdColorPricuva = 'transparent';
                        invalidR = false;
                        fnRacunStuff(rec);
                    }

                });
            }

            if (parseFloat(r) != parseFloat(100)) {
                $scope.PricuvaRezijeZaMjesec.PricuvaRezijeMjesec_Uplatnice.forEach(function (rec) {
                    if (rec.PosebniDioMasterId == masterId) {
                        rec.tdColorRezije = _badColor;
                        invalidP = true;
                    }

                });
            }
            else {
                $scope.PricuvaRezijeZaMjesec.PricuvaRezijeMjesec_Uplatnice.forEach(function (rec) {
                    if (rec.PosebniDioMasterId == masterId) {
                        rec.tdColorRezije = 'transparent';
                        invalidP = false;
                        fnRacunStuff(rec);
                    }
                });
            }
            if (invalidP || invalidR)
                $scope.isInvalid = true;
            else
                $scope.isInvalid = false;
        }

        // provjeri lleap year
        function getFebDay() {
            var year = new Date().getFullYear();
            if (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0))
                return 29;
            return 28;
        }

        function genBrojRacunaPozivnaBroj(brojStana) {
            var mj = parseInt(mjesec) < 10 ? '0' + mjesec : mjesec;
            return zgradaObj.Naziv + '-' + brojStana + '-' + mj + '-' + godina;
        }

        var success = false;
        $scope.saveAndKreraj = function () {
            // $scope.PricuvaRezijeZaMjesec.PricuvaRezijeMjesec_Uplatnice
            var objToEng = ls.decimalToEng($scope.PricuvaRezijeZaMjesec.PricuvaRezijeMjesec_Uplatnice, "uplatniceRacuniOnly");
            console.log(objToEng);
            ds.snimiKreirajUplatniceRacune(objToEng).then(
                function (result) {
                    toastr.success('Projene su snimljene');
                    //$scope.PricuvaRezijeZaMjesec.PricuvaRezijeMjesec_Uplatnice = result.data;
                    console.clear();
                    result.data.forEach(function (rec) {
                        rec.PdfUrl = '/Content/download/racuniUplatnice/' + zgradaObj.CompanyId + '/' + godina + '/' + mjesec + '/' + rec.PdfUrl;
                        rec.DatumDospijeca = new Date(rec.DatumDospijeca);
                        rec.DatumIsporuke = new Date(rec.DatumIsporuke);
                        rec.DatumRacuna = new Date(rec.DatumRacuna);
                    })
                    $scope.PricuvaRezijeZaMjesec.PricuvaRezijeMjesec_Uplatnice = ls.decimalToHr(result.data, "uplatniceRacuniOnly");
                    success = true;

                    //$scope.PricuvaRezijeZaMjesec.PricuvaRezijeMjesec_Uplatnice.forEach(function (o) {
                    //    result.data.forEach(function (res) {
                    //        console.log(res);
                    //        if (o.index == res.index) {
                    //            o.PdfUrl = '/Content/download/racuniUplatnice/' + zgradaObj.CompanyId + '/' + godina + '/' + mjesec + '/' + res.PdfUrl;
                    //            alert(o.PdfUrl);
                    //        }

                    //    });
                    //});
                },
                function (result) {
                    toastr.error('Greška kod snimanja');
                }
            )
        }

        $scope.zatvori = function () {
            $('nav').fadeIn();
            if (!success)
                $mdDialog.cancel(tempObj);
            else {
                zgradaObj.PricuvaRezijeGodina.forEach(function (prGod) {
                    if (prGod.Godina == godina) {
                        prGod.PricuvaRezijeMjesec.forEach(function (prMj) {
                            if (prMj.Mjesec == mjesec)
                                prMj = $scope.PricuvaRezijeZaMjesec;
                        });
                    }
                });
            }
            $mdDialog.hide($scope.PricuvaRezijeZaMjesec);
        };
    }]);