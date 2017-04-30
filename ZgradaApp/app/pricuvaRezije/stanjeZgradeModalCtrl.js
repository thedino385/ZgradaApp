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
                            var row = { master: '', vlasnici: [], pdChild: [] };
                            console.log(row.master);
                            row.master = findMaster(master.PosebniDioMasterId);
                            console.log(findMaster(master.PosebniDioMasterId));
                            console.log(row.master);
                            //vlasnici
                            master.PricuvaRezijePosebniDioMasterVlasnici.forEach(function (vlasnik) {
                                var obj = { vlasnik: '', udio: 0 };
                                obj.vlasnik = findVlasnik(vlasnik.Id);
                                obj.udio = vlasnik.Udio;
                                row.vlasnici.push(obj);
                            });

                            //children
                            master.PricuvaRezijePosebniDioChildren.forEach(function (child) {
                                var pdChildObj = { child: '', povrsine: [], pripadci: [] };
                                pdChildObj.child = findChild(master.PosebniDioMasterId, child.PosebniDioChildId);
                                // povrsine
                                child.PricuvaRezijePosebniDioChildPovrsine.forEach(function (povrsina) {
                                    var pObj = { naziv: '', povrsina: 0, koef: '' };
                                    pObj.naziv = findPovrsina(master.PosebniDioMasterId, child.PosebniDioChildId, povrsina.PovrsinaId);
                                    pObj.povrsina = povrsina.Povrsina;
                                    pObj.koef = povrsina.Koef;
                                    pdChildObj.povrsine.push(pObj);
                                });
                                // pripadci
                                child.PricuvaRezijePosebniDioChildPripadci.forEach(function (prip) {
                                    var pripObj = { naziv: '', povrsina: 0, koef: '' };
                                    pripObj.naziv = findPrip(master.PosebniDioMasterId, child.PosebniDioChildId, prip.PripadakId);
                                    pripObj.povrsina = prip.Povrsina;
                                    pripObj.koef = prip.Koef;
                                    pdChildObj.pripadci.push(pripObj);
                                });
                                row.pdChild.push(pdChildObj);
                            });
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

        

        //var masteri = [];
        //zgradaObj.PricuvaRezijeGodina.forEach(function (prGod) {
        //    if (prGod.Godina == godina) {
        //        prGod.PricuvaRezijeMjesec.forEach(function (prMj) {
        //            if (prMj.Mjesec == mjesec) {
        //                prMj.PricuvaRezijePosebniDioMasteri.forEach(function (master) {
        //                    masteri.push(master);
        //                });
        //            }
                        
        //        });
        //    }
        //});
        //var zgradaPovrsine = [];
        //zgradaObj.Zgrade_PosebniDijeloviMaster.forEach(function (master) {
        //    master.Zgrade_PosebniDijeloviChild.forEach(function (child) {
        //        child.Zgrade_PosebniDijeloviChild_Povrsine.forEach(function (povrsina) {
        //            zgradaPovrsine.push(povrsina);
        //        });
        //    });
        //});
        //$scope.masteri = masteri;
        //$scope.zgradaPovrsine = zgradaPovrsine;
        //console.log($scope.masteri);

        $scope.cancel = function () {
            $mdDialog.cancel();
        };
    }]);