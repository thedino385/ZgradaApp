angularApp.controller('stanjeZgradeModalCtrl', ['$scope', '$mdDialog', 'zgradaObj', 'mjesec', 'godina',
    function ($scope, $mdDialog, zgradaObj, mjesec, godina) {

        $scope.zgradaObj = zgradaObj;
        $scope.godina = godina;
        $scope.mjesec = mjesec;


        
        var table = [];

        zgradaObj.PricuvaRezijeGodina.forEach(function (prGod) {
            if (prGod.Godina == godina) {
                prGod.PricuvaRezijeMjesec.forEach(function (prMj) {
                    if (prMj.Mjesec == mjesec) {
                        prMj.PricuvaRezijePosebniDioMasteri.forEach(function (master) {
                            var udioUzgradi = 0; // udio sa povrsinom
                            var row = { master: '', vlasnici: [], pdChild: [], udioUzgradi: 0 };
                            console.log(row.master);
                            row.master = findMaster(master.PosebniDioMasterId);
                            console.log(findMaster(master.PosebniDioMasterId));
                            console.log(row.master);
                            //vlasnici
                            master.PricuvaRezijePosebniDioMasterVlasnici.forEach(function (vlasnik) {
                                var obj = { vlasnik: '', udio: 0 };
                                obj.vlasnik = findVlasnik(vlasnik.VlasnikId);
                                obj.udio = vlasnik.Udio;
                                row.vlasnici.push(obj);
                            });

                            //children
                            master.PricuvaRezijePosebniDioChildren.forEach(function (child) {
                                var pdChildObj = { child: '', povrsine: [], pripadci: [], ukupnoPovrsina: 0, ukupnoPovrsinaKoef: 0, ukupnoPrip: 0, ukupnoPripKoef: 0 };
                                pdChildObj.child = findChild(master.PosebniDioMasterId, child.PosebniDioChildId);
                                // povrsine
                                var ukupnoPovrsina = 0;
                                var ukupnoPovrsinaKoef = 0;
                                var ukupnoPrip = 0;
                                var ukupnoPripKoef = 0;
                                child.PricuvaRezijePosebniDioChildPovrsine.forEach(function (povrsina) {
                                    var pObj = { naziv: '', povrsina: 0, koef: '' };
                                    pObj.naziv = findPovrsina(master.PosebniDioMasterId, child.PosebniDioChildId, povrsina.PovrsinaId);
                                    pObj.povrsina = povrsina.Povrsina;
                                    pObj.koef = povrsina.Koef;
                                    pdChildObj.povrsine.push(pObj);
                                    ukupnoPovrsina += parseFloat(povrsina.Povrsina);
                                    ukupnoPovrsinaKoef += parseFloat(povrsina.Povrsina) * parseFloat(povrsina.Koef);
                                    udioUzgradi += parseFloat(povrsina.Povrsina);
                                });
                                pdChildObj.ukupnoPovrsina = ukupnoPovrsina;
                                pdChildObj.ukupnoPovrsinaKoef = ukupnoPovrsinaKoef;
                                // pripadci
                                child.PricuvaRezijePosebniDioChildPripadci.forEach(function (prip) {
                                    var pripObj = { naziv: '', povrsina: 0, koef: '' };
                                    pripObj.naziv = findPrip(master.PosebniDioMasterId, child.PosebniDioChildId, prip.PripadakId);
                                    pripObj.povrsina = prip.Povrsina;
                                    pripObj.koef = prip.Koef;
                                    pdChildObj.pripadci.push(pripObj);
                                    ukupnoPrip += parseFloat(prip.Povrsina);
                                    ukupnoPripKoef += parseFloat(prip.Povrsina) * parseFloat(prip.Koef);
                                    udioUzgradi += parseFloat(prip.Povrsina);
                                });
                                pdChildObj.ukupnoPrip = ukupnoPrip;
                                pdChildObj.ukupnoPripKoef = ukupnoPripKoef;
                                row.pdChild.push(pdChildObj);
                            });
                            // udio u zgradi - povrsina
                            row.udioUzgradi = parseFloat(udioUzgradi / povrsinaZgrade() * 100).toFixed(2);
                            table.push(row);
                        });
                        
                    }

                });
            }
        });
        $scope.table = table;
        console.log(table);

        function findMaster(masterId)
        {
            var m = '';
            $scope.zgradaObj.Zgrade_PosebniDijeloviMaster.forEach(function (master) {
                if (master.Id == masterId) {
                    console.log('found master: ' + master.Naziv);
                    m = master.Naziv;
                }
            });
            return m;
        }

        function findVlasnik(vlasnikId) {
            var s = '';
            $scope.zgradaObj.Zgrade_Stanari.forEach(function (stanar) {
                if (stanar.Id == vlasnikId)
                    s = stanar.Ime + ' ' + stanar.Prezime;
            });
            console.log(vlasnikId + ' ' + s);
            return s;
        }

        function findChild(masterId, childId) {
            var c = '';
            $scope.zgradaObj.Zgrade_PosebniDijeloviMaster.forEach(function (master) {
                if (master.Id == masterId)
                    master.Zgrade_PosebniDijeloviChild.forEach(function (child) {
                        if (child.Id == childId)
                            c= child.Naziv;
                    });
            });
            return c;
        }

        function findPovrsina(masterId, childId, povrsinaId) {
            var povr = '';
            $scope.zgradaObj.Zgrade_PosebniDijeloviMaster.forEach(function (master) {
                if (master.Id == masterId)
                    master.Zgrade_PosebniDijeloviChild.forEach(function (child) {
                        if (child.Id == childId)
                            child.Zgrade_PosebniDijeloviChild_Povrsine.forEach(function (p) {
                                if (p.Id == povrsinaId)
                                    povr = p.Naziv;
                            })
                    });
            });
            return povr;
        }

        function findPrip(masterId, childId, pripId) {
            var prip = '';
            $scope.zgradaObj.Zgrade_PosebniDijeloviMaster.forEach(function (master) {
                if (master.Id == masterId)
                    master.Zgrade_PosebniDijeloviChild.forEach(function (child) {
                        if (child.Id == childId)
                            child.Zgrade_PosebniDijeloviChild_Pripadci.forEach(function (p) {
                                if (p.Id == pripId)
                                    prip =  p.Naziv;
                            })
                    });
            });
            return prip;
        }

        function povrsinaZgrade() {
            var total = 0;
            zgradaObj.PricuvaRezijeGodina.forEach(function (prGod) {
                if (prGod.Godina == godina) {
                    prGod.PricuvaRezijeMjesec.forEach(function (prMj) {
                        if (prMj.Mjesec == mjesec) {
                            prMj.PricuvaRezijePosebniDioMasteri.forEach(function (pdMaster) {

                                //$scope.PricuvaRezijeZaMjesec.PricuvaRezijePosebniDioMasteri.forEach(function (pdMaster) {
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
                        }
                    });
                }
            });
            return total;
        }

        $scope.cancel = function () {
            $mdDialog.cancel();
        };
    }]);