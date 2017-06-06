angularApp.controller('uplatnicaModalCtrl', ['$scope', '$mdDialog', 'orderByFilter', 'DataService', 'zgradaObj', 'mjesec', 'godina',
    function ($scope, $mdDialog, orderBy, DataService, zgradaObj, mjesec, godina) {

        $scope.zgradaObj = zgradaObj;
        $scope.godina = godina;
        $scope.mjesec = mjesec;

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

        var napomenaTmpl = 'Napomena: Novčani doprinos (sredstva pričuve) nisu predmet oporezivanja!<br>';
        napomenaTmpl += '<b>Upozorenje kupcu: U slučaju neispunjenja dospjele novčane obveze, prodavatelj može zatražiti određivanje ovrhe na temelju ovog računa.</b><br>';
        napomenaTmpl += 'Račun je ispisan na računalu te je pravovaljan bez pečata i potpisa.<br><br>'
        napomenaTmpl += '<b><u>Kod uplate napisati</u></b><br>'
        napomenaTmpl += '<b>Primatelj: Sredstva zajedničke pričuve SZ Sjenjak 28</b><br>';
        napomenaTmpl += '<b>IBAN: HR 05 2402 0061 5000 4605 0</b></br>';
        napomenaTmpl += 'MODEL: HR 00<br>';
        napomenaTmpl += 'ŠIFRA NAMJENE: OTHR<br>';
        napomenaTmpl += 'POZIV NA BROJ ODOBRENJA: 1606-091022017<br>';
        napomenaTmpl += 'OPIS PLAĆANJA: Pričuva, Stan ???, $mjesec<br>';


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
                        index: index, Id: 0, PricuvaRezijeMjesecId: $scope.PricuvaRezijeZaMjesec, PosebniDioMasterId: m.PosebniDioMasterId, PlatiteljId: v.VlasnikId,
                        PrimateljId: 0, TipDuga: '-', TipPlacanja: '-', UdioPricuva: 0, UdioRezije: 0, IznosRezije: 0, IznosPricuva: 0, Uplatnica: '',
                        displayLine: false, displayBtnAdd: false, platitelji: [], primatelji: [],
                        BrojRacuna: '', DatumRacuna: zadnjiDanUMjesecu(), DatumIsporuke: zadnjiDanUMjesecu(), DatumDospijeca: zadnjiDanUMjesecu(),
                        JedMjera: '', Opis: '', JedCijena: '', Kolicina: '', Ukupno: '', Napomena: napomenaTmpl
                    }

                    // udio pricuva/rezije - povlaci se udio iz vlasnistva
                    m.PricuvaRezijePosebniDioMasterVlasnici.forEach(function (prVlasnik) {
                        if (m.PeriodId == prVlasnik.PeriodId) {
                            if (prVlasnik.Udio != null && prVlasnik.Udio != undefined) {
                                if (prVlasnik.Udio.toString().indexOf('/') != -1) {
                                    var val1 = parseInt(prVlasnik.Udio.toString().split('/')[0].replace(',', '.'));
                                    var val2 = parseInt(prVlasnik.Udio.toString().split('/')[1].replace(',', '.'));
                                    var udio = parseFloat(val1 / val2).toFixed(2);
                                    o.UdioPricuva = parseFloat(udio * 100).toFixed(2).toString().replace('.', ',');
                                    o.UdioRezije = parseFloat(udio * 100).toFixed(2).toString().replace('.', ',');
                                    // iznos pricuve i rezija = iznos * udio
                                    o.IznosPricuva = parseFloat(DataService.myParseFloat(m.ZaduzenjePricuva) * udio).toFixed(2).toString().replace('.', ',');
                                    o.IznosRezije = parseFloat(DataService.myParseFloat(m.ZaduzenjeRezije) * udio).toFixed(2).toString().replace('.', ',');

                                }
                            }
                        }
                    });

                    // opis za racun
                    zgradaObj.Zgrade_PosebniDijeloviMaster.forEach(function (zgradamaster) {
                        console.log(zgradamaster.OpisRacun);
                        if (zgradamaster.Id == o.PosebniDioMasterId && zgradamaster.OpisRacun != null) {
                            console.log(zgradamaster.OpisRacun);
                            o.Opis = zgradamaster.OpisRacun.replace('$mjesec', prettifyMjesec());
                            o.Napomena = o.Napomena.replace('$mjesec', prettifyMjesec());
                        }

                    });

                    

                    console.log(o);

                    m.PricuvaRezijePosebniDioMasterVlasnici.forEach(function (v) {
                        zgradaObj.Zgrade_Stanari.forEach(function (s) {
                            if (s.Id == v.VlasnikId) {
                                var k = { Naziv: s.Ime + ' ' + s.Prezime, Id: s.Id };
                                o.platitelji.push(k);

                                o.primatelji.push(k);
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
            $scope.PricuvaRezijeZaMjesec.PricuvaRezijeMjesec_Uplatnice = prepraviHrove($scope.PricuvaRezijeZaMjesec.PricuvaRezijeMjesec_Uplatnice);
        }

        function fnRacunStuff(o) {
            // TipDuga: 'p', TipPlacanja: 'r'
            if (o.TipPlacanja == 'r') {
                alert('racunam racun');

                $scope.PricuvaRezijeZaMjesec.PricuvaRezijePosebniDioMasteri.forEach(function (masterPricuva) {
                    if (masterPricuva.PosebniDioMasterId == o.PosebniDioMasterId) {
                        // jedinicna mjera - 
                        if (o.TipDuga == 'p') {
                            var nacinObracunaPricuva = $scope.PricuvaRezijeZaMjesec.NacinObracunaPricuva;
                            if (nacinObracunaPricuva == 0 || nacinObracunaPricuva == 3)
                                o.JedMjera = 1;
                            else
                                o.JedMjera = 2;

                            o.JedCijena = masterPricuva.ZaduzenjePricuva;
                        }
                        else if (o.TipDuga == 'r') {
                            var nacinObracunaRezije = $scope.PricuvaRezijeZaMjesec.NacinObracunaRezije;
                            if (nacinObracunaRezije == 0 || nacinObracunaRezije == 1)
                                o.JedMjera = 2;
                            else
                                o.JedMjera = 1;

                            o.JedCijena = masterPricuva.ZaduzenjeRezije;
                        }

                        o.Kolicina = izracunaPdPovrsinu(masterPricuva.PosebniDioMasterId, $scope.PricuvaRezijeZaMjesec.SaKoef);
                        o.Ukupno = (DataService.myParseFloat(o.JedCijena) * DataService.myParseFloat(o.Kolicina)).toString().replace('.', ',');
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
            var upravitelj = { Naziv: "Upravitelj", Id: -1 }; // TODOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
            var rh = { Naziv: "RH", Id: -2 }; // TODOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
            o.primatelji.push(rh);
            o.primatelji.push(upravitelj);
            o.platitelji.push(rh);
            o.platitelji.push(upravitelj);
        }

        $scope.dodajRecord = function (obj) {

            var index = $scope.PricuvaRezijeZaMjesec.PricuvaRezijeMjesec_Uplatnice.indexOf(obj);

            var o = {
                index: index, Id: 0, PricuvaRezijeMjesecId: $scope.PricuvaRezijeZaMjesec, PosebniDioMasterId: obj.PosebniDioMasterId, PlatiteljId: obj.PlatiteljId,
                PrimateljId: 0, TipDuga: '-', TipPlacanja: '-', UdioPricuva: 0, UdioRezije: 0, IznosRezije: 0, IznosPricuva: 0, Uplatnica: '', displayLine: false,
                displayBtnAdd: false, platitelji: obj.platitelji, primatelji: obj.primatelji,
                BrojRacuna: '', DatumRacuna: zadnjiDanUMjesecu(), DatumIsporuke: zadnjiDanUMjesecu(), DatumDospijeca: zadnjiDanUMjesecu(), JedMjera: '', Opis: '', JedCijena: '', Kolicina: '',
                Ukupno: '', Napomena: napomenaTmpl
            }
            // opis za racun
            zgradaObj.Zgrade_PosebniDijeloviMaster.forEach(function (zgradamaster) {
                if (zgradamaster.Id == o.PosebniDioMasterId && zgradamaster.OpisRacun != null) {
                    o.Opis = zgradamaster.OpisRacun.replace('$mjesec', prettifyMjesec());
                    o.Napomena = o.Napomena.replace('$mjesec', prettifyMjesec());
                }
                    
            });
            // jedinicna mjera - 
            if (o.TipDuga == 'p') {
                var nacinObracunaPricuva = $scope.PricuvaRezijeZaMjesec.NacinObracunaPricuva;
                if (nacinObracunaPricuva == 0 || nacinObracunaPricuva == 3)
                    o.JedMjera = 1;
                else
                    o.JedMjera = 2;

                o.JedCijena = m.IznosPricuva;
            }
            else if (o.TipDuga == 'r') {
                var nacinObracunaRezije = $scope.PricuvaRezijeZaMjesec.NacinObracunaRezije;
                if (nacinObracunaRezije == 0 || nacinObracunaRezije == 1)
                    o.JedMjera = 2;
                else
                    o.JedMjera = 1;

                o.JedCijena = m.IznosRezije;
            }

            o.Kolicina = izracunaPdPovrsinu(obj.PosebniDioMasterId, $scope.PricuvaRezijeZaMjesec.SaKoef);
            o.Ukupno = (DataService.myParseFloat(o.JedCijena) * DataService.myParseFloat(o.Kolicina)).toString().replace('.', ',');
            $scope.PricuvaRezijeZaMjesec.PricuvaRezijeMjesec_Uplatnice.splice(index + 1, 0, o);

            $scope.PricuvaRezijeZaMjesec.PricuvaRezijeMjesec_Uplatnice = prepraviHrove($scope.PricuvaRezijeZaMjesec.PricuvaRezijeMjesec_Uplatnice);
        }

        //$scope.stanari = DataService.zgradaUseri;
        //var primatelji = [];
        //zgradaObj.Zgrade_Stanari.forEach(function (s) {
        //    var k = { Naziv: s.Ime + ' ' + s.Prezime, Id: s.Id };
        //    korisnici.push(k);
        //});
        //$scope.korisnici = korisnici;

        


        function prepraviHrove(uList) {
            for (var i = 0; i < uList.length; i++) {
                uList[i].displayLine = false;
                uList[i].displayBtnAdd = false;
            }

            if (uList.length >= 2) {
                var prviMasterId = uList[0].PosebniDioMasterId;
                for (var i = 0; i < uList.length; i++) {
                    if (uList[i].PosebniDioMasterId != prviMasterId) {
                        uList[parseInt(i) - 1].displayLine = true;
                        uList[parseInt(i) - 1].displayBtnAdd = true;
                        prviMasterId = uList[i].PosebniDioMasterId;
                    }
                }
            }
            return uList;
        }

        function izracunaPdPovrsinu(pdMasterId, saKoef) {
            var povrsina = 0;
            var k = 1;
            if (saKoef == true)
                k = DataService.myParseFloat(p.Koef);
            $scope.PricuvaRezijeZaMjesec.PricuvaRezijePosebniDioMasteri.forEach(function (prMaster) {
                if (prMaster.PosebniDioMasterId == pdMasterId) {
                    prMaster.PricuvaRezijePosebniDioChildren.forEach(function (child) {
                        child.PricuvaRezijePosebniDioChildPovrsine.forEach(function (p) {
                            povrsina += DataService.myParseFloat(p.Povrsina) * k;
                            //console.log('povrsina ' + DataService.myParseFloat(p.Povrsina) + ' ' + DataService.myParseFloat(p.Koef) + ' ' + povrsina);
                        });
                        child.PricuvaRezijePosebniDioChildPripadci.forEach(function (p) {
                            povrsina += DataService.myParseFloat(p.Povrsina) * k;
                        });
                    });
                }
            });
            return povrsina.toString().replace('.', ',');
        }



        //function findMasterNaziv(mId) {
        //    var ret = '';
        //    zgradaObj.Zgrade_PosebniDijeloviMaster.forEach(function (m) {
        //        if (mId == m.Id)
        //            ret = m.Naziv;
        //    });
        //    return ret;
        //}

        //$scope.openModalDetailsUplatnica = function (mjesec, ev) {
        //    $('nav').fadeOut();
        //    $mdDialog.show({
        //        controller: 'uplatnicaDetailsModalCtrl',
        //        templateUrl: 'app/pricuvaRezije/uplatnicaDetailsModal.html?p=' + new Date().getTime() / 1000,
        //        parent: angular.element(document.body),
        //        targetEvent: ev,
        //        clickOutsideToClose: false,
        //        fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        //        , locals: {
        //            zgradaObj: $scope.zgradaObj,
        //            mjesec: mjesec,
        //            godina: $scope.selectedGodina,
        //            ev: ev
        //        }
        //    }).then(function () {
        //    }, function (tempObj) {
        //        $scope.zgradaObj = tempObj;
        //    });
        //};

        function zadnjiDanUMjesecu() {
            return new Date((new Date(godina, mjesec)) - 1);


            //switch (mjesec) {
            //    case 1:
            //        return new Date((new Date(godina, mjesec)) - 1)
            //        //return new Date(parseInt(godina), parseInt(mjesec + 1), 31);
            //    case 2:
            //        return new Date(parseInt(godina), parseInt(mjesec + 1), getFebDay()); 
            //    case 3:
            //        return new Date(parseInt(godina), parseInt(mjesec + 1), 31);
            //    case 4:
            //        return new Date(parseInt(godina), parseInt(mjesec + 1), 30);
            //    case 5:
            //        return new Date(parseInt(godina), parseInt(mjesec + 1), 31);
            //    case 6:
            //        return new Date(parseInt(godina), parseInt(mjesec + 1), 30);
            //    case 7:
            //        return new Date(parseInt(godina), parseInt(mjesec + 1), 31);
            //    case 8:
            //        return new Date(parseInt(godina), parseInt(mjesec + 1), 31);
            //    case 9:
            //        return new Date(parseInt(godina), parseInt(mjesec + 1), 30);
            //    case 10:
            //        return new Date(parseInt(godina), parseInt(mjesec + 1), 31);
            //    case 11:
            //        return new Date(parseInt(godina), parseInt(mjesec + 1), 30);
            //    case 12:
            //        return new Date(parseInt(godina), parseInt(mjesec + 1), 31);

            //}
        }

        // provjeri lleap year
        function getFebDay() {
            var year = new Date().getFullYear();
            if (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0))
                return 29;
            return 28;
        }

        $scope.cancel = function () {
            $('nav').fadeIn();
            $mdDialog.cancel(tempObj);
        };
    }]);