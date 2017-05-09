angularApp.controller('indexKsCtrl', ['$scope', '$mdDialog', '$window',  'DataService', 'toastr', 'zgradaObj', 'pdMaster',
    function ($scope, $mdDialog, $window, DataService, toastr, zgradaObj, pdMaster) {

        $scope.zgradaObj = zgradaObj;
        $scope.tableVisible = false;
        $scope.pdMaster = pdMaster;
        var tBodyObj = { master: '', godina: null, mjeseci: [], tBodyList: [] };

        zgradaObj.PricuvaRezijeGodina.forEach(function (prGod) {
            var godineList = [];
            $scope.zgradaObj.PricuvaRezijeGodina.forEach(function (pr) {
                godineList.push(pr.Godina);
            });
            //$scope.posedbiDijelovi = $scope.zgradaObj.Zgrade_PosebniDijeloviMaster;
            $scope.godine = godineList;
        });

        $scope.godinaChanged = function (godina) {
            $scope.selectedGodina = godina;
            $scope.tableVisible = true;

            var prihodi = [];
            var maxMjesec = 0;
            var prihodiUkupno = 0;
            var zaduzenjaUkupno = 0;
            $scope.zgradaObj.PrihodiRashodi.forEach(function (pr) {
                if (godina == pr.Godina) {
                    pr.PrihodiRashodi_Prihodi.forEach(function (prihod) {
                        if (prihod.PosebniDioMasterId == pdMaster.Id) {
                            prihodi.push(prihod);
                            prihodiUkupno += parseFloat(prihod.Iznos);
                            if (parseInt(prihod.Mjesec) > parseInt(maxMjesec))
                                maxMjesec = parseInt(prihod.Mjesec);
                        }

                    });
                }
            });
            $scope.prihodi = prihodi;

            var zaduzenja = [];
            var childovi = [];
            var tBody = [];

            $scope.zgradaObj.PricuvaRezijeGodina.forEach(function (pr) {
                if (pr.Godina == godina) {
                    pr.PricuvaRezijeMjesec.forEach(function (mjesecPR) {
                        mjesecPR.PricuvaRezijePosebniDioMasteri.forEach(function (master) {
                            if (master.PosebniDioMasterId == pdMaster.Id) {
                                var o = {
                                    periodId: null, mjesec: 0, prihodi: [],
                                    zaduzenje: 0, pocStanje: 0, stanjeOd: 0, dugPretplata: 0,
                                    vlasnici: [], posDijelovi: [], displayTotal: false,
                                    ukupnoPrihodi: 0, ukupnoZaduzenje: 0, ukupnoDugPretplata: 0, ukupno: 0
                                };
                                o.mjesec = mjesecPR.Mjesec;


                                //zaduzenjaUkupno += parseFloat(master.Zaduzenje);
                                var zaduzenje = { iznos: 0, pocetnoStanje: 0, stanjeOd: 0, dugPretplata: 0 };
                                o.zaduzenje = master.Zaduzenje;
                                o.pocStanje = master.PocetnoStanje != null ? master.PocetnoStanje : 0;
                                o.stanjeOd = master.StanjeOd;
                                o.dugPretplata = master.DugPretplata;
                                //o.zaduzenja.push(zaduzenje);
                                o.periodId = master.PeriodId;

                                // prihodi
                                $scope.zgradaObj.PrihodiRashodi.forEach(function (god) {
                                    if (god.Godina == godina) {
                                        god.PrihodiRashodi_Prihodi.forEach(function (prihod) {
                                            if (prihod.Mjesec == mjesecPR.Mjesec && prihod.PosebniDioMasterId == pdMaster.Id) {
                                                var prihodObj = { naziv: '', iznos: 0 };
                                                prihodObj.naziv = prihod.Opis;
                                                prihodObj.iznos = prihod.Iznos;
                                                o.prihodi.push(prihodObj);
                                            }
                                        });
                                    }
                                });


                                // vlanici
                                master.PricuvaRezijePosebniDioMasterVlasnici.forEach(function (vlasnik) {
                                    if (vlasnik.PeriodId == master.PeriodId) {
                                        var vlasnikObj = { imePrezime: '' };
                                        //alert(getVlasnik(vlasnik.VlasnikId));
                                        vlasnikObj.imePrezime = getVlasnik(vlasnik.VlasnikId);
                                        o.vlasnici.push(vlasnikObj);
                                    }
                                });

                                // posebni dijelovi children
                                master.PricuvaRezijePosebniDioChildren.forEach(function (pdChild) {
                                    var pd = { naziv: '' };
                                    pd.naziv = getPdChild(pdChild.PosebniDioChildId);
                                    o.posDijelovi.push(pd);
                                });

                                // displayTotal?
                                pr.PricuvaRezijeMjesec.forEach(function (pricRezMjesec) {
                                    if (parseInt(mjesecPR.Mjesec) + 1 == parseInt(pricRezMjesec.Mjesec)) {
                                        pricRezMjesec.PricuvaRezijePosebniDioMasteri.forEach(function (master) {
                                            if (master.PosebniDioMasterId == pdMaster.Id) {
                                                if (o.periodId == master.PeriodId) {
                                                    //if (isLastMaster(master.Id, master.PeriodId)) {
                                                    //    alert(master.Id + ' ' + o.periodId);
                                                    //    o.displayTotal = true;
                                                    //    var totals = calculateTotalsForPeriod(o.periodId);
                                                    //    o.ukupnoPrihodi = totals.totalPrihodi;
                                                    //    o.ukupnoZaduzenje = totals.totalZaduzenje;
                                                    //    o.ukupnoDugPretplata = totals.totalDugPretplata;
                                                    //}
                                                    //else
                                                    o.displayTotal = false;
                                                }
                                                else {
                                                    o.displayTotal = true;
                                                    var totals = calculateTotalsForPeriod(o.periodId);
                                                    // totalZaduzenje: 0, totalDugPretplata: 0, totalPrihodi: 0
                                                    // ukupnoPrihodi: 0, ukupnoZaduzenje: 0, ukupnoDugPretplata: 0, ukupno: 0
                                                    o.ukupnoPrihodi = totals.totalPrihodi;
                                                    o.ukupnoZaduzenje = totals.totalZaduzenje;
                                                    o.ukupnoDugPretplata = totals.totalDugPretplata;
                                                }
                                            }
                                        });
                                    }
                                });
                                if (isLastMaster(master)) {
                                    //alert(master.Id + ' ' + o.periodId);
                                    o.displayTotal = true;
                                    var totals = calculateTotalsForPeriod(o.periodId);
                                    o.ukupnoPrihodi = totals.totalPrihodi;
                                    o.ukupnoZaduzenje = totals.totalZaduzenje;
                                    o.ukupnoDugPretplata = totals.totalDugPretplata;
                                }
                                tBody.push(o);
                            }
                        });
                    });
                }
            });
            $scope.tBody = tBody;
            console.log($scope.tBody);

        }

        function getVlasnik(id) {
            var s = '';
            $scope.zgradaObj.Zgrade_Stanari.forEach(function (stanar) {
                if (stanar.Id == id) {
                    s = stanar.Ime + ' ' + stanar.Prezime;
                }
            });
            return s;
        }

        function getPdChild(childId) {
            var ret = '';
            $scope.zgradaObj.Zgrade_PosebniDijeloviMaster.forEach(function (m) {
                if (m.Id == pdMaster.Id) {
                    m.Zgrade_PosebniDijeloviChild.forEach(function (child) {
                        if (child.Id == childId)
                            ret = child.Naziv;
                    });
                }
            });
            return ret;
        }

        function isLastMaster(master) {
            var ret = false;
            var maxMasterId = 0;
            $scope.zgradaObj.PricuvaRezijeGodina.forEach(function (prGod) {
                prGod.PricuvaRezijeMjesec.forEach(function (prMj) {
                    prMj.PricuvaRezijePosebniDioMasteri.forEach(function (prMaster) {
                        if (prMaster.PeriodId == master.PeriodId && prMaster.PosebniDioMasterId == master.PosebniDioMasterId)
                            //ret = true;
                            if (prMaster.Id > maxMasterId)
                                maxMasterId = prMaster.Id;
                    });
                });
            });
            if (master.Id == maxMasterId)
                ret = true;
            return ret;
        }

        function calculateTotalsForPeriod(periodId) {
            var ret = { totalZaduzenje: 0, totalDugPretplata: 0, totalPrihodi: 0 };
            $scope.zgradaObj.PricuvaRezijeGodina.forEach(function (prGod) {
                prGod.PricuvaRezijeMjesec.forEach(function (prMj) {
                    prMj.PricuvaRezijePosebniDioMasteri.forEach(function (master) {
                        if (master.PosebniDioMasterId == pdMaster.Id && master.PeriodId == periodId) {
                            ret.totalZaduzenje += parseFloat(master.Zaduzenje);
                            ret.totalDugPretplata += parseFloat(master.DugPretplata);
                            ret.totalPrihodi += parseFloat(master.Uplaceno);
                        }
                    });
                });
            });
            return ret;
        }

        var selected = [];
        $scope.toggle = function (mj) {
            var idx = selected.indexOf(mj);
            if (idx > -1) {
                selected.splice(idx, 1);
            }
            else {
                selected.push(mj);
            }
        };

        // var tBodyObj = { master: '', mjeseci: [], tBody: [] };
        $scope.genPdf = function () {
            tBodyObj.master = pdMaster;
            tBodyObj.godina = $scope.selectedGodina;
            tBodyObj.mjeseci = selected;
            tBodyObj.tBodyList = $scope.tBody;
            DataService.genPdfKarticePd(tBodyObj).then(
                function (result) {
                    //$window.open('../pdf/GetPdfPosebniDio', '_blank');
                    $window.open('../pdf/GetPdfPosebniDio');
                },
                function (result) {
                    toastr.error('Pogreška kod kreiranja izvještaja');
                }
            )
        }

        $scope.cancel = function () {
            $mdDialog.cancel();
        };
    }]);