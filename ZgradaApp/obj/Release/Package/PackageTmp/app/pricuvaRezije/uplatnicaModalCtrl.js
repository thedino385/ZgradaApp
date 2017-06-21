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

        $scope.pdfUriTeplate = '/Content/download/racuniUplatnice/' + zgradaObj.CompanyId + '/' + godina + '/' + mjesec + '/';

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
                        IznosRezijeOrig: 0, IznosPricuvaOrig: 0,

                        UplatnicaZaPlatiti: '0,00', UplatnicaIBANPrimatelja: zgradaObj.IBAN, UplatnicaModel: 'HR01', UplatnicaPozivNaBroj: '',
                        UplatnicaSifraNamjene: 'OTLC', UplatnicaOpis: '', UplatnicaDatumUplatnice: zadnjiDanUMjesecu(), UplatnicaDatumDospijeca: zadnjiDanUMjesecu()
                    }
                    o.BrojRacuna = genBrojRacunaPozivnaBroj(m.BrojStana);
                    o.UplatnicaPozivNaBroj = genBrojRacunaPozivnaBroj(m.BrojStana);
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
                                    o.IznosRezijeOrig = m.ZaduzenjeRezije;
                                    o.IznosPricuvaOrig = m.ZaduzenjePricuva;
                                    o.IznosPricuva = parseFloat(ls.myParseFloat(m.ZaduzenjePricuva) * udio).toString().replace('.', ',');
                                    o.IznosRezije = parseFloat(ls.myParseFloat(m.ZaduzenjeRezije) * udio).toString().replace('.', ',');
                                    
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
        
            $scope.PricuvaRezijeZaMjesec.PricuvaRezijeMjesec_Uplatnice = prepraviHrove(uList);
        }
        else {
            // uplatnice kolekcija vec postoji u bazi
            var index = 1;
            $scope.PricuvaRezijeZaMjesec.PricuvaRezijeMjesec_Uplatnice.forEach(function (rec) {
                rec.DatumDospijeca = new Date(rec.DatumDospijeca);
                rec.DatumIsporuke = new Date(rec.DatumIsporuke);
                rec.DatumRacuna = new Date(rec.DatumRacuna);
                rec.UplatnicaDatumDospijeca = new Date(rec.DatumRacuna);
                rec.UplatnicaDatumUplatnice = new Date(rec.DatumRacuna);
                //rec.PdfUrl = '/Content/download/racuniUplatnice/' + zgradaObj.CompanyId + '/' + godina + '/' + mjesec + '/' + rec.PdfUrl;
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
            //if (o.TipPlacanja == 'r') {

            $scope.PricuvaRezijeZaMjesec.PricuvaRezijePosebniDioMasteri.forEach(function (masterPricuva) {
                if (masterPricuva.PosebniDioMasterId == o.PosebniDioMasterId) {
                    var nacinObracunaPricuva = $scope.PricuvaRezijeZaMjesec.NacinObracunaPricuva;
                    var nacinObracunaRezije = $scope.PricuvaRezijeZaMjesec.NacinObracunaRezije;
                    if (o.TipDuga == 'p') { // pricuva
                        o.UdioRezije = 0;

                        // o.Ukupno = ds.toHrDecimalCalc(masterPricuva.ZaduzenjePricuva);
                        // ukupno nije iz pricuve jer se mogao promijeniti postotak - trazi u uplatnicama
                        switch (nacinObracunaPricuva) {
                            case 0:
                                // cijena po m2
                                if (o.TipPlacanja == 'r') {
                                    o.JedMjera = 'm2';
                                    o.JedCijena = ls.toHrDecimalCalc($scope.PricuvaRezijeZaMjesec.ObracunPricuvaCijenaM2);
                                    //o.Kolicina = ls.toHrDecimalCalc(cs.povrsinaPda($scope.PricuvaRezijeZaMjesec, masterPricuva.PosebniDioMasterId));
                                    o.Kolicina = ls.toHrDecimalCalc(cs.povrsinaPda($scope.PricuvaRezijeZaMjesec, masterPricuva.PosebniDioMasterId) * ls.myParseFloat(o.UdioPricuva) / 100);
                                    o.Ukupno = ls.toHrDecimalCalc(o.IznosPricuva);
                                }
                                else if (o.TipPlacanja == 'u') {
                                    o.UplatnicaZaPlatiti = ls.toHrDecimalCalc(o.IznosPricuva);
                                    var opis = 'Pričuva za ' + prettifyMjesec(mjesec) + ' za ' + getNazivPdMastera(o.PosebniDioMasterId) + '.';
                                    opis += '\n';
                                    opis += 'Pričuva ' + o.UplatnicaZaPlatiti;
                                    opis += '\n';
                                    opis += 'Dospijeće ' + prettifyMjesec(o.UplatnicaDatumDospijeca);
                                    opis += '\n';
                                    o.UplatnicaOpis = opis;
                                    //o.UplatnicaOpis += 'Stanje od ' + getStanjeProsliMj();
                                }
                                break;
                            case 1:
                                // raspodjela iznosa po povrsini, zadaje se ukupna cijena za zgradu, 
                                // jedMj = m2
                                // jedCijena = o.Ukupno / broj kvadrata
                                // kolicina = broj kvadrata
                                if (o.TipPlacanja == 'r') {
                                    o.JedMjera = 'm2';
                                    //var povrsinaStana = cs.povrsinaPda($scope.PricuvaRezijeZaMjesec, masterPricuva.PosebniDioMasterId);
                                    //o.jedCijena = ls.toHrDecimalCalc(ls.myParseFloat(o.Ukupno) / povrsinaStana);
                                    //o.Kolicina = ls.toHrDecimalCalc(povrsinaStana * ls.myParseFloat(o.UdioPricuva) / 100);
                                    //o.Ukupno = ls.toHrDecimalCalc(o.IznosPricuva);
                                    var povrsinaZgrade = cs.povrsinaZgrade($scope.PricuvaRezijeZaMjesec);
                                    var povrsinaStana = cs.povrsinaPda($scope.PricuvaRezijeZaMjesec, masterPricuva.PosebniDioMasterId);
                                    var total = parseFloat(povrsinaStana / povrsinaZgrade) * ls.myParseFloat(o.IznosPricuva);
                                    o.JedCijena = ls.toHrDecimalCalc(total / povrsinaStana);
                                    o.Kolicina = ls.toHrDecimalCalc(povrsinaStana * ls.myParseFloat(o.UdioPricuva) / 100);
                                    o.Ukupno = ls.toHrDecimalCalc(total);
                                }
                                else if (o.TipPlacanja == 'u') {
                                    o.UplatnicaZaPlatiti = ls.toHrDecimalCalc(o.IznosPricuva);
                                    o.UplatnicaOpis = 'Pričuva za ' + prettifyMjesec(mjesec) + ' za ' + getNazivPdMastera(o.PosebniDioMasterId) + '.';
                                    o.UplatnicaOpis += '\n';
                                    o.UplatnicaOpis += 'Pričuva ' + o.UplatnicaZaPlatiti;
                                    o.UplatnicaOpis += '\n';
                                    o.UplatnicaOpis += 'Dospijeće ' + prettifyMjesec(o.UplatnicaDatumDospijeca);
                                    //o.UplatnicaOpis += '\n';
                                    //o.UplatnicaOpis += 'Stanje od ' + getStanjeProsliMj();
                                }
                                break;
                            case 2:
                                if (o.TipPlacanja == 'r') {
                                    // % za svaki PD - cijena za zgradu se unosi
                                    o.JedMjera = 'm2';
                                    var povrsinaStana = cs.povrsinaPda($scope.PricuvaRezijeZaMjesec, masterPricuva.PosebniDioMasterId);
                                    o.Kolicina = ls.toHrDecimalCalc(povrsinaStana * ls.myParseFloat(o.UdioPricuva) / 100);
                                    o.jedCijena = ls.toHrDecimalCalc(ls.myParseFloat(o.Ukupno) / povrsinaStana);
                                }
                                else if (o.TipPlacanja == 'u') {
                                    o.UplatnicaZaPlatiti = ls.toHrDecimalCalc(o.IznosPricuva);
                                    o.UplatnicaOpis = 'Pričuva za ' + prettifyMjesec(mjesec) + ' za ' + getNazivPdMastera(o.PosebniDioMasterId) + '.';
                                    o.UplatnicaOpis += '\n';
                                    o.UplatnicaOpis += 'Pričuva ' + o.UplatnicaZaPlatiti;
                                    o.UplatnicaOpis += '\n';
                                    o.UplatnicaOpis += 'Dospijeće ' + prettifyMjesec(o.UplatnicaDatumDospijeca);
                                    //o.UplatnicaOpis += '<br>';
                                    //o.UplatnicaOpis += 'Stanje od ' + getStanjeProsliMj();
                                }
                                break;
                            case 3:
                                if (o.TipPlacanja == 'r') {
                                    o.JedMjera = 'm2';
                                    var povrsinaStana = cs.povrsinaPda($scope.PricuvaRezijeZaMjesec, masterPricuva.PosebniDioMasterId);
                                    o.Kolicina = ls.toHrDecimalCalc(povrsinaStana * ls.myParseFloat(o.UdioPricuva) / 100);
                                    o.jedCijena = ls.toHrDecimalCalc(ls.myParseFloat(o.Ukupno) / povrsinaStana);
                                }
                                else if (o.TipPlacanja == 'u') {
                                    o.UplatnicaZaPlatiti = ls.toHrDecimalCalc(o.IznosPricuva);
                                    o.UplatnicaOpis = 'Pričuva za ' + prettifyMjesec(mjesec) + ' za ' + getNazivPdMastera(o.PosebniDioMasterId) + '.';
                                    o.UplatnicaOpis += '\n';
                                    o.UplatnicaOpis += 'Pričuva ' + o.UplatnicaZaPlatiti;
                                    o.UplatnicaOpis += '\n';
                                    o.UplatnicaOpis += 'Dospijeće ' + prettifyMjesec(o.UplatnicaDatumDospijeca);
                                    //o.UplatnicaOpis += '<br>';
                                    //o.UplatnicaOpis += 'Stanje od ' + getStanjeProsliMj();
                                }
                                break;
                        }
                        //o.Ukupno = ds.toHrDecimalCalc(masterPricuva.ZaduzenjePricuva); - ne valja
                    }
                    else if (o.TipDuga == 'r') {
                        o.UdioPricuva = 0;
                        // rezije
                        o.Ukupno = ls.toHrDecimalCalc(o.IznosRezije);
                        switch (nacinObracunaRezije) {
                            case 0:
                                if (o.TipPlacanja == 'r') {
                                    // raspodjela iznosa po povrsini, zadaje se ukupna cijena za zgradu, 
                                    // jedMj = m2
                                    // jedCijena = o.Ukupno / broj kvadrata
                                    // kolicina = broj kvadrata
                                    o.JedMjera = 'm2';
                                    var povrsinaZgrade = cs.povrsinaZgrade($scope.PricuvaRezijeZaMjesec);
                                    var povrsinaStana = cs.povrsinaPda($scope.PricuvaRezijeZaMjesec, masterPricuva.PosebniDioMasterId);
                                    var total = parseFloat(povrsinaStana / povrsinaZgrade) * ls.myParseFloat(o.IznosRezije);
                                    o.JedCijena = ls.toHrDecimalCalc(total / povrsinaStana);
                                    o.Kolicina = ls.toHrDecimalCalc(povrsinaStana);
                                    o.Ukupno = ls.toHrDecimalCalc(total);
                                }
                                else if (o.TipPlacanja == 'u') {
                                    o.UplatnicaZaPlatiti = ls.toHrDecimalCalc(o.IznosRezije);
                                    o.UplatnicaOpis = 'Režije za ' + prettifyMjesec(mjesec) + ' za ' + getNazivPdMastera(o.PosebniDioMasterId) + '.';
                                    o.UplatnicaOpis += '\n';
                                    o.UplatnicaOpis += 'Režije ' + o.UplatnicaZaPlatiti;
                                    o.UplatnicaOpis += '\n';
                                    o.UplatnicaOpis += 'Dospijeće ' + prettifyMjesec(o.UplatnicaDatumDospijeca);
                                    //o.UplatnicaOpis += '<br>';
                                    //o.UplatnicaOpis += 'Stanje od ' + getStanjeProsliMj();
                                }
                                break;
                            case 1:
                                if (o.TipPlacanja == 'r') {
                                    // po broju clanova
                                    o.JedMjera = 'član';
                                    o.Kolicina = masteriList.ObracunRezijeBrojClanova * ls.myParseFloat(o.UdioRezije) / 100;
                                    o.JedCijena = ls.toHrDecimalCalc(ls.parseFloat(o.Ukupno) / ls.parseFloat(o.Kolicina));
                                }
                                else if (o.TipPlacanja == 'u') {
                                    o.UplatnicaZaPlatiti = ls.toHrDecimalCalc(o.IznosRezije);
                                    o.UplatnicaOpis = 'Režije za ' + prettifyMjesec(mjesec) + ' za ' + getNazivPdMastera(o.PosebniDioMasterId) + '.';
                                    o.UplatnicaOpis += '\n';
                                    o.UplatnicaOpis += 'Režije ' + o.UplatnicaZaPlatiti;
                                    o.UplatnicaOpis += '\n';
                                    o.UplatnicaOpis += 'Dospijeće ' + prettifyMjesec(o.UplatnicaDatumDospijeca);
                                    //o.UplatnicaOpis += '<br>';
                                    //o.UplatnicaOpis += 'Stanje od ' + getStanjeProsliMj();
                                }
                                break;
                            case 2:
                                if (o.TipPlacanja == 'r') {
                                    o.JedMjera = 'posebni dio';
                                    o.Kolicina = 1;
                                    o.JedCijena = ls.toHrDecimalCalc(ls.parseFloat(o.Ukupno) * ls.myParseFloat(o.UdioRezije) / 100);
                                }
                                else if (o.TipPlacanja == 'u') {
                                    o.UplatnicaZaPlatiti = ls.toHrDecimalCalc(o.IznosRezije);
                                    o.UplatnicaOpis = 'Režije za ' + prettifyMjesec(mjesec) + ' za ' + getNazivPdMastera(o.PosebniDioMasterId) + '.';
                                    o.UplatnicaOpis += '\n';
                                    o.UplatnicaOpis += 'Režije ' + o.UplatnicaZaPlatiti;
                                    o.UplatnicaOpis += '\n';
                                    o.UplatnicaOpis += 'Dospijeće ' + prettifyMjesec(o.UplatnicaDatumDospijeca);
                                    //o.UplatnicaOpis += '<br>';
                                    //o.UplatnicaOpis += 'Stanje od ' + getStanjeProsliMj();
                                }
                                break;
                        }
                        //o.Ukupno = masterRezije.ZaduzenjeRezije;
                    }
                    else if (o.tipoviDuga == 'a') {
                        // rezije i pricuva - za sad samo uplatnica
                        if (o.TipPlacanja == 'u') {
                            var total = ld.myParseFloat(o.IznosRezije) + ls.myParseFloat(o.IznosPricuva);
                            o.UplatnicaZaPlatiti = ls.toHrDecimalCalc(total);
                            o.UplatnicaOpis = 'Pričuva i režije za ' + prettifyMjesec(mjesec) + ' za ' + getNazivPdMastera(o.PosebniDioMasterId) + '.';
                            o.UplatnicaOpis += '\n';
                            o.UplatnicaOpis += 'Režije ' + o.IznosRezije;
                            o.UplatnicaOpis += '\n';
                            o.UplatnicaOpis += 'Pričuva ' + o.IznosPricuva;
                            o.UplatnicaOpis += '\n';
                            o.UplatnicaOpis += 'Dospijeće ' + prettifyMjesec(o.UplatnicaDatumDospijeca);
                            //o.UplatnicaOpis += '<br>';
                            //o.UplatnicaOpis += 'Stanje od ' + getStanjeProsliMj();
                        }
                    }
                    validacijaUdjela(masterPricuva.PosebniDioMasterId, false);
                }
            });
            //}
            //else {
            //    // uplatnica
            //}
        }
        $scope.RacunStuff = function (obj) {
            fnRacunStuff(obj);
        }

        function prettifyMjesec() {
            return parseInt(mjesec) < 10 ? '0' + mjesec.toString() + '/' + godina : mjesec.toString() + '/' + godina;
        }

        function getNazivPdMastera(pricuvaRezijeMasterId) {
            ret = '';
            zgradaObj.Zgrade_PosebniDijeloviMaster.forEach(function (m) {
                if (m.Id == pricuvaRezijeMasterId)
                    ret = m.Naziv;
            });
            return ret;
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
                IznosRezijeOrig: 0, IznosPricuvaOrig: 0,

                UplatnicaZaPlatiti: '0,00', UplatnicaIBANPrimatelja: zgradaObj.IBAN, UplatnicaModel: 'HR01', UplatnicaPozivNaBroj: '',
                UplatnicaSifraNamjene: 'OTLC', UplatnicaOpis: '', UplatnicaDatumUplatnice: new Date(), UplatnicaDatumDospijeca: new Date()
            }
            // opis za racun
            zgradaObj.Zgrade_PosebniDijeloviMaster.forEach(function (zgradamaster) {
                if (zgradamaster.Id == o.PosebniDioMasterId && zgradamaster.OpisRacun != null) {
                    o.Opis = zgradamaster.OpisRacun.replace('$DATUM ', prettifyMjesec());
                    //o.Napomena = o.Napomena.replace('$mjesec', prettifyMjesec());
                }
                if (zgradamaster.Id == o.PosebniDioMasterId) {
                    o.BrojRacuna = genBrojRacunaPozivnaBroj(zgradamaster.Broj);
                    o.UplatnicaPozivNaBroj = genBrojRacunaPozivnaBroj(zgradamaster.Broj);
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
            if (zgradaObj.NapomenaRacun == null)
                return "";
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
                    rec.IznosPricuva = ls.toHrDecimalCalc(ls.myParseFloat(rec.IznosPricuvaOrig) * ls.myParseFloat(udioP) / 100);
                    rec.IznosRezije = ls.toHrDecimalCalc(ls.myParseFloat(rec.IznosRezijeOrig) * ls.myParseFloat(udioR) / 100);


                    validacijaUdjela(masterId, true);
                }
            });
        }

        function validacijaUdjela(masterId, callfnRacunStuff) {
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
                        if (callfnRacunStuff)
                            fnRacunStuff(rec);
                    }
                });
            }
            else {
                $scope.PricuvaRezijeZaMjesec.PricuvaRezijeMjesec_Uplatnice.forEach(function (rec) {
                    if (rec.PosebniDioMasterId == masterId) {
                        rec.tdColorPricuva = 'transparent';
                        invalidR = false;
                        if (callfnRacunStuff)
                            fnRacunStuff(rec);
                    }

                });
            }

            if (parseFloat(r) != parseFloat(100)) {
                $scope.PricuvaRezijeZaMjesec.PricuvaRezijeMjesec_Uplatnice.forEach(function (rec) {
                    if (rec.PosebniDioMasterId == masterId) {
                        rec.tdColorRezije = _badColor;
                        invalidP = true;
                        if (callfnRacunStuff)
                            fnRacunStuff(rec);
                    }

                });
            }
            else {
                $scope.PricuvaRezijeZaMjesec.PricuvaRezijeMjesec_Uplatnice.forEach(function (rec) {
                    if (rec.PosebniDioMasterId == masterId) {
                        rec.tdColorRezije = 'transparent';
                        invalidP = false;
                        if (callfnRacunStuff)
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
            $rootScope.loaderActive = true;
            ds.snimiKreirajUplatniceRacune(objToEng).then(
                function (result) {
                    toastr.success('Projene su snimljene');
                    //$scope.PricuvaRezijeZaMjesec.PricuvaRezijeMjesec_Uplatnice = result.data;
                    result.data.forEach(function (rec) {
                        //rec.PdfUrl = '/Content/download/racuniUplatnice/' + zgradaObj.CompanyId + '/' + godina + '/' + mjesec + '/' + rec.PdfUrl;
                        rec.DatumDospijeca = new Date(rec.DatumDospijeca);
                        rec.DatumIsporuke = new Date(rec.DatumIsporuke);
                        rec.DatumRacuna = new Date(rec.DatumRacuna);
                        rec.UplatnicaDatumDospijeca = new Date(rec.DatumRacuna);
                        rec.UplatnicaDatumUplatnice = new Date(rec.DatumRacuna);


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



                    $scope.PricuvaRezijeZaMjesec.PricuvaRezijeMjesec_Uplatnice = ls.decimalToHr(result.data, "uplatniceRacuniOnly");
                    success = true;
                    console.clear();
                    console.log($scope.PricuvaRezijeZaMjesec.PricuvaRezijeMjesec_Uplatnice);
                    $rootScope.loaderActive = false;
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
                    $rootScope.loaderActive = false;
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