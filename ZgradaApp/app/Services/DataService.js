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

        sendUplatniceRashodi: sendUplatniceRashodi 
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