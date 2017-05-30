angularApp.controller('indexKsCtrl', ['$scope', '$rootScope', '$mdDialog', '$window', 'orderByFilter', 'DataService', 'toastr', 'zgradaObj', 'pdMaster',
    function ($scope, $rootScope, $mdDialog, $window, orderBy, DataService, toastr, zgradaObj, pdMaster) {

        $scope.zgradaObj = zgradaObj;
        $scope.tableVisible = false;
        $scope.pdMaster = pdMaster;
        var tBodyObj = { master: '', godina: null, mjeseci: [], tBodyList: [] };
        $scope.selAllObj = { checked: false };

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
            // sort
            $scope.propertyName = 'DatumObracuna';
            $scope.reverse = false;
            $scope.prihodi = orderBy(prihodi, $scope.propertyName, $scope.reverse);

            $scope.sortBy = function (propertyName) {
                $scope.reverse = (propertyName !== null && $scope.propertyName === propertyName)
                    ? !$scope.reverse : false;
                $scope.propertyName = propertyName;
                $scope.prihodi = orderBy(rashodi, $scope.propertyName, $scope.reverse);
            };
            //$scope.prihodi = prihodi;

            var zaduzenja = [];
            var childovi = [];
            var tBody = [];
            var rb = 1;
            var ukupno = 0;
            var ukupnoUplata = 0;
            var ukupnoZaduzenje = 0;

            //$scope.zgradaObj.PricuvaRezijeGodina.forEach(function (pr) {
            //    if (pr.Godina == godina) {
            //        pr.PricuvaRezijeMjesec.forEach(function (mjesecPR) {
            //            mjesecPR.PricuvaRezijePosebniDioMasteri.forEach(function (master) {
            //                if (master.PosebniDioMasterId == pdMaster.Id) {

            //var o = {
            //    periodId: null, mjesec: 0, prihodi: [],
            //    zaduzenje: 0, pocStanje: 0, stanjeOd: 0, dugPretplata: 0,
            //    vlasnici: [], posDijelovi: [], displayTotal: false,
            //    ukupnoPrihodi: 0, ukupnoZaduzenje: 0, ukupnoDugPretplata: 0, ukupno: 0
            //};

            //$scope.zgradaObj.PrihodiRashodi.forEach(function (god) {
            // if (god.Godina == godina) {
            $scope.prihodi.forEach(function (prihod) {
                


                if (prihod.PosebniDioMasterId == pdMaster.Id) {

                    var o = {
                        periodId: null, mjesec: null, rb: null, datum: null, prihod: 0,
                        zaduzenje: null, displayTotal: false,
                        ukupnoPrihodi: 0, ukupnoZaduzenje: 0, ukupno: 0, showUplata: true, showZaduzenje: false
                    };
                    o.rb = rb;
                    rb++;
                    var oObr = {
                        periodId: null, mjesec: null, rb: null, datum: null, prihod: null,
                        zaduzenje: null, displayTotal: false,
                        ukupnoPrihodi: 0, ukupnoZaduzenje: 0, ukupno: 0, showUplata: false, showZaduzenje: true
                    };
                    oObr.rb = rb;

                    o.mjesec = prihod.Mjesec;
                    oObr.mjesec = prihod.Mjesec;
                    //o.mjesec = mjesecPR.Mjesec;
                    //oObr.mjesec = mjesecPR.Mjesec;

                    // prihodi
                    //$scope.zgradaObj.PrihodiRashodi.forEach(function (god) {
                    //    if (god.Godina == godina) {
                    //        god.PrihodiRashodi_Prihodi.forEach(function (prihod) {
                    //            if (prihod.Mjesec == mjesecPR.Mjesec && prihod.PosebniDioMasterId == pdMaster.Id) {
                    //                //var prihodObj = { naziv: '', iznos: 0 };
                    //                //prihodObj.naziv = prihod.Opis;
                    //                //prihodObj.iznos = prihod.Iznos;
                    //                //o.prihodi.push(prihodObj);
                    //                o.prihod = prihod.Iznos;
                    //                o.datum = prihod.DatumUnosa;

                    //                oObr.datum = prihod.DatumObracuna;
                    //                oObr.zaduzenje = o.zaduzenje = master.Zaduzenje;
                    //            }
                    //        });
                    //    }
                    //});
                    o.prihod = prihod.Iznos;
                    o.datum = parseDate(prihod.DatumUnosa);
                    oObr.datum = parseDate(prihod.DatumObracuna);
                    //var currMjesec = parseInt(new Date(prihod.DatumUnosa).getMonth()) + 1;


                    $scope.zgradaObj.PricuvaRezijeGodina.forEach(function (pr) {
                        if (pr.Godina == godina) {
                            //console.log('ch1');
                            pr.PricuvaRezijeMjesec.forEach(function (mjesecPR) {
                                if (mjesecPR.Mjesec == prihod.Mjesec) {
                                    mjesecPR.PricuvaRezijePosebniDioMasteri.forEach(function (master) {
                                        if (master.PosebniDioMasterId == pdMaster.Id) {
                                            //console.log(master.ZaduzenjePricuva + ' ' + master.ZaduzenjeRezije);
                                            oObr.zaduzenje = parseFloat(master.ZaduzenjePricuva) + parseFloat(master.ZaduzenjeRezije);
                                            o.periodId = master.PeriodId;
                                            oObr.periodId = master.PeriodId;
                                            ukupnoZaduzenje += parseFloat(oObr.zaduzenje);
                                            ukupnoUplata += parseFloat(prihod.Iznos);
                                            //ukupno += ukupnoZaduzenje - ukupnoUplata;
                                        }
                                    });
                                }
                            });
                        }
                    });


                    //oObr.zaduzenje = o.zaduzenje = master.Zaduzenje;


                    //zaduzenjaUkupno += parseFloat(master.Zaduzenje);
                    //var zaduzenje = { iznos: 0, pocetnoStanje: 0, stanjeOd: 0, dugPretplata: 0 };
                    //o.zaduzenje = master.Zaduzenje;
                    //o.pocStanje = master.PocetnoStanje != null ? master.PocetnoStanje : 0;
                    //o.stanjeOd = master.StanjeOd;
                    //o.dugPretplata = master.DugPretplata;
                    ////o.zaduzenja.push(zaduzenje);
                    //o.periodId = master.PeriodId;




                    // vlanici
                    //master.PricuvaRezijePosebniDioMasterVlasnici.forEach(function (vlasnik) {
                    //    if (vlasnik.PeriodId == master.PeriodId) {
                    //        var vlasnikObj = { imePrezime: '' };
                    //        //alert(getVlasnik(vlasnik.VlasnikId));
                    //        vlasnikObj.imePrezime = getVlasnik(vlasnik.VlasnikId);
                    //        o.vlasnici.push(vlasnikObj);
                    //    }
                    //});

                    // posebni dijelovi children
                    //master.PricuvaRezijePosebniDioChildren.forEach(function (pdChild) {
                    //    var pd = { naziv: '' };
                    //    pd.naziv = getPdChild(pdChild.PosebniDioChildId);
                    //    o.posDijelovi.push(pd);
                    //});

                    //var mjesecPR = null;
                    //var prMasterr = null;
                    //$scope.zgradaObj.PricuvaRezijeGodina.forEach(function (pr) {
                    //    if (pr.Godina == godina) {
                    //        pr.PricuvaRezijeMjesec.forEach(function (mjesecPR) {
                    //            mjesecPR.PricuvaRezijePosebniDioMasteri.forEach(function (master) {
                    //                if (master.PosebniDioMasterId == pdMaster.Id) {
                    //                    if (isLastMaster(master, mjesecPR.Mjesec)) {
                    //                            o.displayTotal = true;
                    //                            oObr.ukupnoPrihodi = 777;
                    //                    //    //var totals = calculateTotalsForPeriod(o.periodId);
                    //                    //    //o.ukupnoPrihodi = totals.totalPrihodi;
                    //                    //    //o.ukupnoZaduzenje = totals.totalZaduzenje;
                    //                    //    //o.ukupnoDugPretplata = totals.totalDugPretplata;
                    //                    }
                    //                }
                    //            });
                    //        });
                    //    }
                    //});


                    if (isLastMaster(pdMaster.Id, prihod.Mjesec)) {
                        oObr.displayTotal = true;
                        oObr.ukupnoUplata = ukupnoUplata;
                        oObr.ukupnoZaduzenje = ukupnoZaduzenje;
                        oObr.ukupno = ukupnoUplata - ukupnoZaduzenje;

                        ukupno = 0;
                        ukupnoUplata = 0;
                        ukupnoZaduzenje = 0;
                    }

                    // displayTotal?
                    //if (mjesecPR != null) {
                    //    $scope.zgradaObj.PricuvaRezijeGodina.forEach(function (pr) {
                    //        if (pr.Godina == godina) {
                    //            pr.PricuvaRezijeMjesec.forEach(function (pricRezMjesec) {
                    //                if (parseInt(mjesecPR.Mjesec) + 1 == parseInt(pricRezMjesec.Mjesec)) {
                    //                    pricRezMjesec.PricuvaRezijePosebniDioMasteri.forEach(function (master) {
                    //                        if (master.PosebniDioMasterId == pdMaster.Id) {
                    //                            console.log('o.periodId ' + o.periodId + ' master.PeriodId ' + master.PeriodId);
                    //                            if (o.periodId == master.PeriodId) {
                    //                                o.displayTotal = false;
                    //                            }
                    //                            else {
                    //                                o.displayTotal = true;
                    //                                console.log('displayTotal');
                    //                                var totals = calculateTotalsForPeriod(o.periodId);
                    //                                o.ukupnoPrihodi = totals.totalPrihodi;
                    //                                o.ukupnoZaduzenje = totals.totalZaduzenje;
                    //                                o.ukupnoDugPretplata = totals.totalDugPretplata;
                    //                            }
                    //                        }
                    //                    });
                    //                }
                    //            });
                    //        }
                    //    });
                    //}




                    tBody.push(o);
                    tBody.push(oObr);
                    rb++
                    //console.log(oObr);
                }
            });
            //}
            //});
            //                }
            //            });
            //        });
            //    }
            //});
            $scope.tBody = tBody;
            console.log($scope.tBody);
        }

        function parseDate(d) {
            var dejt = new Date(d);
            return dodajNulu(dejt.getDate()) + '.' + parseInt(dejt.getMonth() + 1) + '.' + dejt.getFullYear() + '.';
        }

        function dodajNulu(x) {
            if (parseInt(x) < 10)
                return '0' + x;
            return x;
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

        function isLastMaster(masterId, mjesec) {

            var ret = false;
            var maxMasterId = 0;

            var currPrMaster = null;
            var nextMonthPrMaster = null;

            // nadji prMaster objekt iz tekuceg mjeseca(mjesec)
            $scope.zgradaObj.PricuvaRezijeGodina.forEach(function (prGod) {
                prGod.PricuvaRezijeMjesec.forEach(function (prMj) {
                    if (prMj.Mjesec == mjesec) {
                        prMj.PricuvaRezijePosebniDioMasteri.forEach(function (m) {
                            //console.log('m.PosebniDioMasterId ' + m.PosebniDioMasterId + '  masterId ' + masterId);
                            if (m.PosebniDioMasterId == masterId) {
                                currPrMaster = m;
                                //if (m.PeriodId == prMaster.PeriodId)
                                //    return false;
                                //else
                                //    return true;

                            }
                        })

                    }
                });
            });

            $scope.zgradaObj.PricuvaRezijeGodina.forEach(function (prGod) {
                prGod.PricuvaRezijeMjesec.forEach(function (prMj) {
                    if (prMj.Mjesec == parseInt(mjesec + 1)) {
                        //console.log('ch1')
                        prMj.PricuvaRezijePosebniDioMasteri.forEach(function (m) {
                            //console.log('mjesec ' + mjesec + '  prMaster.PeriodId ' + prMaster.PeriodId + ' m.PeriodId ' + m.PeriodId);
                            if (m.PosebniDioMasterId == masterId) {
                                nextMonthPrMaster = m;
                                //console.log('ch2')
                                //if (m.PeriodId == prMaster.PeriodId)
                                //    return false;
                                //else
                                //    return true;

                            }
                        })

                    }
                });
            });

            //console.log(mjesec);
            //console.log(currPrMaster);
            //console.log(nextMonthPrMaster);

            if (nextMonthPrMaster == null)
                return true;

            if (currPrMaster.PeriodId == nextMonthPrMaster.PeriodId)
                return false;
            return true;

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

        //var selected = [];
        //$scope.toggle = function (mj) {
        //    var idx = selected.indexOf(mj);
        //    if (idx > -1) {
        //        selected.splice(idx, 1);
        //    }
        //    else {
        //        selected.push(mj);
        //    }
        //};

        var selected = [];
        $scope.toggle = function (mj) {
            var idx = selected.indexOf(mj);
            if (idx > -1) {
                selected.splice(idx, 1);
            }
            else {
                selected.push(mj);
            }
            //console.log(selected);
        };
        $scope.isChecked = function (mjesec) {
            return selected.indexOf(mjesec) > -1;
        };

        $scope.toggleAll = function () {
            selected = [];
            //console.log($scope.selAllObj.checked);
            if (!$scope.selAllObj.checked) {
                $scope.prihodi.forEach(function (d) {
                    if (selected.indexOf(d.Mjesec) == -1)
                        selected.push(d.Mjesec);
                });
            }
            //console.log(selected);
        }

        $scope.genPdf = function () {
            if (selected.length == 0) {
                toastr.info('Molimo, odaberite jedan ili više mjeseci za koje želite kreirati izvještaj');
                return;
            }


            tBodyObj.master = pdMaster;
            tBodyObj.godina = $scope.selectedGodina;
            tBodyObj.mjeseci = selected;
            tBodyObj.tBodyList = $scope.tBody;
            $rootScope.loaderActive = true;
            DataService.genPdfKarticePd(tBodyObj).then(
                function (result) {
                    //$window.open('../pdf/GetPdfPosebniDio', '_blank');
                    $window.open('../pdf/GetPdfPosebniDio');
                    $rootScope.loaderActive = false;
                },
                function (result) {
                    $rootScope.loaderActive = false;
                    toastr.error('Pogreška kod kreiranja izvještaja');
                }
            )
        }

        $scope.cancel = function () {
            $('nav').fadeIn();
            $mdDialog.cancel();
        };
    }]);