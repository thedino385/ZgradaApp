angularApp.factory('DataService', ['$http', '$rootScope', '$q', function ($http, $rootScope, $q) {

    var currZgrada = null;
    var zgradaUseri = [];
    var userId = null;
    var selZgradaId = null;
    var selGodina = 0;

    // zgrade
    var getZgrade = function () {
        return $http.get('../api/data/getzgrade');
    }

    var getZgrada = function (zgradaId, prenesiRashodeuTekuciMjesec, prenesiDnevnikuTekuciMjesec) {
        //return $http.get('../api/data/getzgrada?Id=' + zgradaId);
        return $http({
            url: '../api/data/getzgrada',
            method: "GET",
            params: { Id: zgradaId, prenesiRashodeuTekuciMjesec: prenesiRashodeuTekuciMjesec, prenesiDnevnikuTekuciMjesec: prenesiDnevnikuTekuciMjesec }
        });
    }

    //var getZgradaPrihodiRashodi = function (zgradaId) {
    //    return $http.get('../api/data/getZgradaPrihodiRashodi?Id=' + zgradaId);
    //    // isto kao i getZgrada, ali ovdje ce se neplaceni rashodi iz proslog mjeseca prenijeti u tekuci
    //}
    

    var zgradaCreateOrUpdate = function (zgrada) {
        return $http.post('../api/data/zgradaCreateOrUpdate', zgrada);
    }

    var posebniDioChildrenCreateOrUpdate = function (posebniDioMaster) {
        console.log(posebniDioMaster);
        return $http.post('../api/data/posebniDioChildrenCreateOrUpdate', posebniDioMaster);
    }

    var getSifarnikRashoda = function () {
        return $http.get('../api/data/getSifarnikRashoda');
    }

    var sifarnikRashodaCrateOrUpdate = function (list) {
        return $http.post('../api/data/sifarnikRashodaCrateOrUpdate', list);
    }

    var prihodiRashodiCreateOrUpdate = function (zgradaObj) {
        return $http.post('../api/data/prihodiRashodiCreateOrUpdate', zgradaObj)
    }

    var praznaPricuvaRezijeCreate = function (zgradaId, godina) {
        return $http({
            url: '../api/data/praznaPricuvaRezijeCreate',
            method: "GET",
            params: { zgradaId: zgradaId, godina: godina }
        });
    }

    var pricuvaZaMjesecCreate = function (zgradaId, pricuvaRezijeGodId, mjesec, godina) {
        return $http({
            url: '../api/data/pricuvaZaMjesecCreate',
            method: "GET",
            params: { zgradaId: zgradaId, prGodId: pricuvaRezijeGodId, mjesec: mjesec, godina: godina }
        });
    }

    var pricuvaRezijeCreateOrUpdate = function (zgradaObj) {
        return $http.post('../api/data/pricuvaRezijeCreateOrUpdate', zgradaObj);
    }

    var pricuvaRezijeStanjeOdCreateOrUpdate = function (stanjeOdList) {
        console.log(stanjeOdList);
        return $http.post('../api/data/pricuvaRezijeStanjeOdCreateOrUpdate', stanjeOdList);
    }

    var getPricuvaRezijeGodinaTable = function (zgradaId, godina) {
        return $http({
            url: '../api/data/getPricuvaRezijeGodinaTable',
            method: "GET",
            params: { zgradaId: zgradaId, godina: godina }
        });
    }

    var pricuvaRezijeDeleteAndCreate = function (zgradaId, mjesec, godina) {
        return $http({
            url: '../api/data/pricuvaRezijeDeleteAndCreate',
            method: "POST",
            params: { zgradaId: zgradaId, mjesec: mjesec, godina: godina }
        });
    }

    var zajednickiDijeloviCreateOrUpdate = function (zgradaObj) {
        return $http.post('../api/data/zajednickiDijeloviCreateOrUpdate', zgradaObj);
    }

    var zajednickiUredjajiCreateOrUpdate = function (zgradaObj) {
        return $http.post('../api/data/zajednickiUredjajiCreateOrUpdate', zgradaObj);
    }

    var genPdfKarticePd = function (tBodyObj) {
        //return $http.post('../api/pdfgenerator/genPdfKarticePd', tBodyObj);
        return $http.post('../pdf/genPdfKarticePd', tBodyObj);
    }

    var genPdfDnevnik = function (paramObj) {
        //return $http.post('../api/pdfgenerator/genPdfKarticePd', tBodyObj);
        return $http.post('../pdf/genDnevnik', paramObj);
    }

    var dnevnikRadaCreateOrUpdate = function (dnevnik) {
        return $http.post('../api/data/dnevnikRadaCreateOrUpdate', dnevnik);
    }

    var getUseri = function () {
        return $http.get('../Account/getUseri');
    }

    var editUser = function (user) {
        return $http.post('../Account/editUser', user);
    }

    var sendUplatniceRashodi = function (list) {
        return $http.post('../Email/SendRashodi', list);
    }

    var createUplatnicaManually = function (masterId, godina, mjesec, zgradaId) {
        return $http({
            url: '../Email/createUplatnicaManually',
            method: "POST",
            params: { masterId: masterId, godina: godina, mjesec: mjesec, zgradaId: zgradaId }
        });
    }

    var getTvrtka = function () {
        return $http.get('../api/data/getTvrtka');
    }

    var tvrtkaUpdate = function (tvrtka) {
        return $http.post('../api/data/tvrtkaUpdate', tvrtka);
    }

    var getOglasna = function (zgradaId) {
        return $http.get('../api/data/getOglasna?zgradaId=' + zgradaId);
    }

    var oglasnaEditOrCreate = function (oglas) {
        return $http.post('../api/data/oglasnaEditOrCreate', oglas);
    }

    var getuseriStanari = function (zgradaId) {
        return $http.get('../api/data/getuseriStanari?zgradaId=' + zgradaId);
    }

    var getPopisStanari = function (zgradaId) {
        console.log(zgradaId);
        return $http.get('../api/data/getPopisStanari?zgradaId=' + zgradaId);
    }


    var myParseFloat = function (decimalComma) {
        if (decimalComma == null || decimalComma == undefined)
            return 0;
        return parseFloat(decimalComma.toString().replace(',', '.')).toFixed(2);
    }

    var toHrDecimal = function (decimal) { 
        // decimal je vec fixedto 2
        if (decimal == null || decimal == undefined)
            return 0;
        return decimalComma.toString().replace(',', '.');
    }


    var decimalToEng = function (zgrada, modul) {
        switch (modul) {
            case "prihodiRashodi":
                zgrada.PrihodiRashodi.forEach(function (prGod) {
                    prGod.PrihodiRashodi_Rashodi.forEach(function (rashod) {
                        rashod.Iznos != null ? rashod.Iznos = rashod.Iznos.toString().replace(',', '.') : 0;
                    })
                    prGod.PrihodiRashodi_Prihodi.forEach(function (prihod) {
                        prihod.Iznos != null ? prihod.Iznos = prihod.Iznos.toString().replace(',', '.') : 0;
                    })
                })
                break;
            case "pricuva":
                zgrada.PricuvaRezijeGodina(function (prGod) {
                    prGod.PricuvaRezijeGodina_StanjeOd.forEach(function (stanje) {
                        stanje.StanjeOd != null ? stanje.StanjeOd = stanje.StanjeOd.toString().replace(',', '.') : 0;
                    });
                    prGod.PricuvaRezijeMjesec.forEach(function (prMj) {
                        prMj.ObracunPricuvaCijenaM2 != null ? prMj.ObracunPricuvaCijenaM2 = prMj.ObracunPricuvaCijenaM2.toString().replace(',', '.') : 0;
                        prMj.ObracunPricuvaCijenaUkupno != null ? prMj.ObracunPricuvaCijenaUkupno = prMj.ObracunPricuvaCijenaUkupno.toString().replace(',', '.') : 0;
                        prMj.ObracunRezijeCijenaUkupno != null ? prMj.ObracunRezijeCijenaUkupno = prMj.ObracunRezijeCijenaUkupno.toString().replace(',', '.') : 0;
                        prMj.ObracunRezijaCijenaUkupnoPoBrojuClanova != null ? prMj.ObracunRezijaCijenaUkupnoPoBrojuClanova = prMj.ObracunRezijaCijenaUkupnoPoBrojuClanova.toString().replace(',', '.') : 0;
                        prMj.OrocenaSredstva != null ? prMj.OrocenaSredstva = prMj.OrocenaSredstva.toString().replace(',', '.') : 0;

                        prMj.PricuvaRezijeMjesec_Uplatnice.forEach(function (upl) {
                            upl.UdioPricuva != null ? upl.UdioPricuva = upl.UdioPricuva.toString().replace(',', '.') : 0;
                            upl.UdioRezije != null ? upl.UdioRezije = upl.UdioRezije.toString().replace(',', '.') : 0;
                            upl.IznosRezije != null ? upl.IznosRezije = upl.IznosRezije.toString().replace(',', '.') : 0;
                            upl.IznosPricuva != null ? upl.IznosPricuva = upl.IznosPricuva.toString().replace(',', '.') : 0;
                        });

                        prMj.PricuvaRezijePosebniDioMasteri.forEach(function (master) {
                            master.ObracunPricuvaCijenaSlobodanUnos != null ? master.ObracunPricuvaCijenaSlobodanUnos = master.ObracunPricuvaCijenaSlobodanUnos.toString().replace(',', '.') : 0;
                            master.ObracunRezijeCijenaSlobodanUnos != null ? master.ObracunRezijeCijenaSlobodanUnos = master.ObracunRezijeCijenaSlobodanUnos.toString().replace(',', '.') : 0;
                            master.ObracunPricuvaPostoSlobodanUnos != null ? master.ObracunPricuvaPostoSlobodanUnos = master.ObracunPricuvaPostoSlobodanUnos.toString().replace(',', '.') : 0;
                            master.DugPretplata != null ? master.DugPretplata = master.DugPretplata.toString().replace(',', '.') : 0;
                            master.ZaduzenjePricuva != null ? master.ZaduzenjePricuva = master.ZaduzenjePricuva.toString().replace(',', '.') : 0;
                            master.ZaduzenjeRezije != null ? master.ZaduzenjeRezije = master.ZaduzenjeRezije.toString().replace(',', '.') : 0;
                            master.Uplaceno != null ? master.Uplaceno = master.Uplaceno.toString().replace(',', '.') : 0;
                            master.PocetnoStanje != null ? master.PocetnoStanje = master.PocetnoStanje.toString().replace(',', '.') : 0;
                            master.StanjeOd != null ? master.StanjeOd = master.StanjeOd.toString().replace(',', '.') : 0;
                        });
                    });
                });
                break;
            case "ZgradaStanovi":
                zgrada.Zgrade_PosebniDijeloviChild_Povrsine.forEach(function (p) {
                    p.Povrsina != null ? p.Povrsina = p.Povrsina.toString().replace(',', '.') : 0;
                    p.Koef != null ? p.Koef = p.Koef.toString().replace(',', '.') : 0;
                });
                zgrada.Zgrade_PosebniDijeloviChild_Pripadci.forEach(function (p) {
                    p.Povrsina != null ? p.Povrsina = p.Povrsina.toString().replace(',', '.') : 0;
                    p.Koef != null ? p.Koef = p.Koef.toString().replace(',', '.') : 0;
                });
                break;
        }
        // prihodi rashodi
        

        return zgrada;
    }

    var decimalToHr = function (zgrada, modul) {
        // prihodi rashodi
        //zgrada.PrihodiRashodi.forEach(function (prGod) {
        //    prGod.PrihodiRashodi_Rashodi.forEach(function (rashod) {
        //        rashod.Iznos != null ? rashod.Iznos = rashod.Iznos.toString().replace('.', ',') : 0;
        //        console.log(rashod.Iznos);
        //    })
        //})
        switch (modul) {
            case "prihodiRashodi":
                zgrada.PrihodiRashodi.forEach(function (prGod) {
                    prGod.PrihodiRashodi_Rashodi.forEach(function (rashod) {
                        rashod.Iznos != null ? rashod.Iznos = rashod.Iznos.toString().replace('.', ',') : 0;
                    })
                    prGod.PrihodiRashodi_Prihodi.forEach(function (prihod) {
                        prihod.Iznos != null ? prihod.Iznos = prihod.Iznos.toString().replace('.', ',') : 0;
                    })
                })
                break;
            case "pricuva":
                zgrada.PricuvaRezijeGodina(function (prGod) {
                    prGod.PricuvaRezijeGodina_StanjeOd.forEach(function (stanje) {
                        stanje.StanjeOd != null ? stanje.StanjeOd = stanje.StanjeOd.toString().replace('.', ',') : 0;
                    });
                    prGod.PricuvaRezijeMjesec.forEach(function (prMj) {
                        prMj.ObracunPricuvaCijenaM2 != null ? prMj.ObracunPricuvaCijenaM2 = prMj.ObracunPricuvaCijenaM2.toString().replace('.', ',') : 0;
                        prMj.ObracunPricuvaCijenaUkupno != null ? prMj.ObracunPricuvaCijenaUkupno = prMj.ObracunPricuvaCijenaUkupno.toString().replace('.', ',') : 0;
                        prMj.ObracunRezijeCijenaUkupno != null ? prMj.ObracunRezijeCijenaUkupno = prMj.ObracunRezijeCijenaUkupno.toString().replace('.', ',') : 0;
                        prMj.ObracunRezijaCijenaUkupnoPoBrojuClanova != null ? prMj.ObracunRezijaCijenaUkupnoPoBrojuClanova = prMj.ObracunRezijaCijenaUkupnoPoBrojuClanova.toString().replace('.', ',') : 0;
                        prMj.OrocenaSredstva != null ? prMj.OrocenaSredstva = prMj.OrocenaSredstva.toString().replace('.', ',') : 0;

                        prMj.PricuvaRezijeMjesec_Uplatnice.forEach(function (upl) {
                            upl.UdioPricuva != null ? upl.UdioPricuva = upl.UdioPricuva.toString().replace('.', ',') : 0;
                            upl.UdioRezije != null ? upl.UdioRezije = upl.UdioRezije.toString().replace('.', ',') : 0;
                            upl.IznosRezije != null ? upl.IznosRezije = upl.IznosRezije.toString().replace('.', ',') : 0;
                            upl.IznosPricuva != null ? upl.IznosPricuva = upl.IznosPricuva.toString().replace('.', ',') : 0;
                        });

                        prMj.PricuvaRezijePosebniDioMasteri.forEach(function (master) {
                            master.ObracunPricuvaCijenaSlobodanUnos != null ? master.ObracunPricuvaCijenaSlobodanUnos = master.ObracunPricuvaCijenaSlobodanUnos.toString().replace('.', ',') : 0;
                            master.ObracunRezijeCijenaSlobodanUnos != null ? master.ObracunRezijeCijenaSlobodanUnos = master.ObracunRezijeCijenaSlobodanUnos.toString().replace('.', ',') : 0;
                            master.ObracunPricuvaPostoSlobodanUnos != null ? master.ObracunPricuvaPostoSlobodanUnos = master.ObracunPricuvaPostoSlobodanUnos.toString().replace('.', ',') : 0;
                            master.DugPretplata != null ? master.DugPretplata = master.DugPretplata.toString().replace('.', ',') : 0;
                            master.ZaduzenjePricuva != null ? master.ZaduzenjePricuva = master.ZaduzenjePricuva.toString().replace('.', ',') : 0;
                            master.ZaduzenjeRezije != null ? master.ZaduzenjeRezije = master.ZaduzenjeRezije.toString().replace('.', ',') : 0;
                            master.Uplaceno != null ? master.Uplaceno = master.Uplaceno.toString().replace('.', ',') : 0;
                            master.PocetnoStanje != null ? master.PocetnoStanje = master.PocetnoStanje.toString().replace('.', ',') : 0;
                            master.StanjeOd != null ? master.StanjeOd = master.StanjeOd.toString().replace('.', ',') : 0;
                        });
                    });
                });
                break;
            case "ZgradaStanovi":
                zgrada.Zgrade_PosebniDijeloviChild_Povrsine.forEach(function (p) {
                    p.Povrsina != null ? p.Povrsina = p.Povrsina.toString().replace('.', ',') : 0;
                    p.Koef != null ? p.Koef = p.Koef.toString().replace('.', ',') : 0;
                });
                zgrada.Zgrade_PosebniDijeloviChild_Pripadci.forEach(function (p) {
                    p.Povrsina != null ? p.Povrsina = p.Povrsina.toString().replace('.', ',') : 0;
                    p.Koef != null ? p.Koef = p.Koef.toString().replace('.', ',') : 0;
                });
                break;
        }

        return zgrada;
    }

    return {
        getZgrade: getZgrade,
        getZgrada: getZgrada,
        zgradaUseri: zgradaUseri,
        zgradaCreateOrUpdate: zgradaCreateOrUpdate,
        prihodiRashodiCreateOrUpdate: prihodiRashodiCreateOrUpdate,
        posebniDioChildrenCreateOrUpdate, posebniDioChildrenCreateOrUpdate,

        zajednickiDijeloviCreateOrUpdate: zajednickiDijeloviCreateOrUpdate,
        zajednickiUredjajiCreateOrUpdate: zajednickiUredjajiCreateOrUpdate,

        praznaPricuvaRezijeCreate: praznaPricuvaRezijeCreate,
        pricuvaZaMjesecCreate: pricuvaZaMjesecCreate,
        pricuvaRezijeCreateOrUpdate: pricuvaRezijeCreateOrUpdate,
        getPricuvaRezijeGodinaTable: getPricuvaRezijeGodinaTable,
        pricuvaRezijeDeleteAndCreate: pricuvaRezijeDeleteAndCreate,

        getSifarnikRashoda: getSifarnikRashoda,
        sifarnikRashodaCrateOrUpdate: sifarnikRashodaCrateOrUpdate,
        currZgrada: currZgrada,
        userId: userId,
        selGodina: selGodina,

        genPdfKarticePd: genPdfKarticePd,
        dnevnikRadaCreateOrUpdate: dnevnikRadaCreateOrUpdate,
        selZgradaId: selZgradaId,

        getUseri: getUseri,
        editUser: editUser,
        genPdfDnevnik: genPdfDnevnik,

        sendUplatniceRashodi: sendUplatniceRashodi,
        createUplatnicaManually: createUplatnicaManually,
        getTvrtka: getTvrtka,
        tvrtkaUpdate: tvrtkaUpdate,
        getOglasna: getOglasna,
        oglasnaEditOrCreate: oglasnaEditOrCreate,
        getuseriStanari: getuseriStanari,

        pricuvaRezijeStanjeOdCreateOrUpdate: pricuvaRezijeStanjeOdCreateOrUpdate,
        getPopisStanari: getPopisStanari,

        decimalToEng: decimalToEng,
        decimalToHr: decimalToHr,
        myParseFloat: myParseFloat,
        toHrDecimal: toHrDecimal
    }


    // --------------------------------------------------------------------------------------
    //    O B S O L E T E 

    //var getZgrade = function () {
    //    var defer = $q.defer();
    //    //if (listZgrade.length == 0) {
    //        $rootScope.loaderActive = true;
    //        $http.get('../api/data/getzgrade').then(
    //            function (result) {
    //                // on success
    //                listZgrade = result.data;
    //                console.log('dataService zgrade, pullilng from the server');
    //                $rootScope.loaderActive = false;
    //                defer.resolve(result.data);
    //            },
    //            function (result) {
    //                // on error
    //                defer.reject(result.data);
    //                $rootScope.errMsg = result.Message;
    //            }
    //        )
    //    //}
    //    //else {
    //    //    console.log("dataService listZgrade.length: " + listZgrade.length);
    //    //    defer.resolve(listZgrade);
    //    //}

    //    return defer.promise;
    //}



    //var getPripadci = function () {
    //    return $http.get('../api/data/getpripadci');
    //}

    //var getPripadak = function (id) {
    //    return $http.get('../api/data/getpripadak?Id=' + id);
    //}

    //var getPosebiDijelovi = function () {
    //    return $http.get('../api/data/getPosebiDijelovi');
    //}

    //var getPripadci = function () {
    //    var defer = $q.defer();
    //    if (listPripadci.length == 0) {
    //        $rootScope.loaderActive = true;
    //        $http.get('../api/data/getpripadci').then(
    //            function (result) {
    //                // on success
    //                listPripadci = result.data;
    //                console.log('dataService pripadci, pullilng from the server');
    //                $rootScope.loaderActive = false;
    //                defer.resolve(result.data);
    //            },
    //            function (result) {
    //                // on error
    //                defer.reject(result.data);
    //                $rootScope.errMsg = result.Message;
    //            }
    //        )
    //    }
    //    else
    //        defer.resolve(listPripadci);
    //    return defer.promise;
    //}

    //var pripadakCreateUpdate = function (pripadak) {
    //    return $http.post('../api/data/pripadakCreateUpdate', pripadak);
    //}

    //var posebniDioCreateUpdate = function (dio) {
    //    return $http.post('../api/data/posebniDioCreateUpdate', dio);
    //}

    //var getStanovi = function () {
    //    return $http.get('../api/data/getstanovi');
    //};
    //var getStanovi = function () {
    //    var defer = $q.defer();
    //    //if (listStanovi.length == 0) {
    //        $rootScope.loaderActive = true;
    //        $http.get('../api/data/getstanovi').then(
    //            function (result) {
    //                // on success
    //                listStanovi = result.data;
    //                console.log('dataService stanovi, pullilng from the server');
    //                $rootScope.loaderActive = false;
    //                defer.resolve(result.data);
    //            },
    //            function (result) {
    //                // on error
    //                defer.reject(result.data);
    //                $rootScope.errMsg = result.Message;
    //            }
    //        )
    //    //}
    //    //else {
    //    //    defer.resolve(listStanovi);
    //    //}

    //        return defer.promise;
    //}


    //var stanCreateUpdate = function (stan) {
    //    // ovo je master - detail relationship
    //    return $http.post('../api/data/stanCreateUpdate', stan);
    //}

    //var zaduzenjeCreateUpdate = function (z) {
    //    return $http.post('../api/data/zaduzivanjeCreateUpdate', z);
    //}

    //var getPr = function (ZgradaId) {
    //    return $http({
    //        url: '../api/data/getprihodirashodi',
    //        method: "GET",
    //        params: { ZgradaId: ZgradaId }
    //    });
    //}

    //var pRCreateUpdate = function (pr) {
    //    return $http.post('../api/data/pRCreateUpdate', pr);
    //}

    //var createEmptyPricuva  = function (ZgradaId, Godina, Mjesec) {
    //    return $http({
    //        url: '../api/data/createEmptyPricuva',
    //        method: "GET",
    //        params: { ZgradaId: ZgradaId, Godina: Godina }
    //    });
    //}


    //var createEmptyPrihodRashod = function (ZgradaId, Godina) {
    //    return $http({
    //        url: '../api/data/createEmptyPrihodRashod',
    //        method: "GET",
    //        params: { ZgradaId: ZgradaId, Godina: Godina }
    //    });
    //}


    //var getPricuva = function (ZgradaId) {
    //    return $http({
    //        url: '../api/data/getpricuva',
    //        method: "GET",
    //        params: { ZgradaId: ZgradaId }
    //    });
    //}

    //var pricuvaCreateUpdate = function (pricuve) {
    //    return $http.post('../api/data/pricuvaCreateUpdate', pricuve);
    //}

    //return {
    //    getZgrade: getZgrade,
    //    zgradaCreateOrUpdate: zgradaCreateOrUpdate,
    //    listZgrade: listZgrade,
    //    getZgrada: getZgrada,
    //    listPripadci: listPripadci,
    //    getPripadci: getPripadci,
    //    getPripadak: getPripadak,
    //    getPosebiDijelovi: getPosebiDijelovi,
    //    posebniDioCreateUpdate: posebniDioCreateUpdate,
    //    pripadakCreateUpdate: pripadakCreateUpdate,
    //    listStanovi: listStanovi,
    //    zaduzenjeCreateUpdate: zaduzenjeCreateUpdate,
    //    selectedZgrada: selectedZgrada,
    //    stanCreateUpdate: stanCreateUpdate,
    //    getPr: getPr,
    //    selectedPosebniDio: selectedPosebniDio,
    //    selectedStan: selectedStan,
    //    createEmptyPricuva: createEmptyPricuva ,
    //    createEmptyPrihodRashod: createEmptyPrihodRashod,
    //    getPricuva: getPricuva,
    //    pricuvaCreateUpdate: pricuvaCreateUpdate,
    //    pRCreateUpdate: pRCreateUpdate
    //}

}]);