angularApp.factory('CalcService', ['$http', '$rootScope', 'DataService', 'LocalizationService',
    function ($http, $rootScope, ds, ls) {

    var povrsinaZgrade = function (PricuvaRezijeZaMjesec) {
        var total = 0;
        var k = 1;
            PricuvaRezijeZaMjesec.PricuvaRezijePosebniDioMasteri.forEach(function (pdMaster) {
                pdMaster.PricuvaRezijePosebniDioMasterPovrsine.forEach(function (povrsina) {
                    if (PricuvaRezijeZaMjesec.SaKoef == true)
                        k = ls.myParseFloat(povrsina.Koef);
                    //console.log('povrsina: ' + povrsina);
                    //total += DataService.myParseFloat(povrsina.Povrsina) * (saKoef == true ? DataService.myParseFloat(povrsina.Koef) : 1);
                    total += ls.myParseFloat(povrsina.Povrsina) * ls.myParseFloat(k);

                });
                pdMaster.PricuvaRezijePosebniDioMasterPripadci.forEach(function (prip) {
                    if (PricuvaRezijeZaMjesec.SaKoef == true)
                        k = ls.myParseFloat(prip.Koef);
                    total += ls.myParseFloat(prip.Povrsina) * ls.myParseFloat(k);
                    //console.log('prip: ' + prip);
                    //total += DataService.myParseFloat(prip.Povrsina) * (saKoef == true ? DataService.myParseFloat(prip.Koef) : 1);
                    //total += DataService.myParseFloat(prip.Povrsina);
                });
            });
            //console.log('Povrisna zgrade: ' + total);
            return total;
    }


    var povrsinaPda = function (PricuvaRezijeZaMjesec, pdMasterId) {
        console.log(povrsinaPda);
        console.log(PricuvaRezijeZaMjesec);
        var povrsina = 0;
        var k = 1;
        if (PricuvaRezijeZaMjesec.SaKoef == true)
            k = ls.myParseFloat(p.Koef);
        PricuvaRezijeZaMjesec.PricuvaRezijePosebniDioMasteri.forEach(function (prMaster) {
            if (prMaster.PosebniDioMasterId == pdMasterId) {
                prMaster.PricuvaRezijePosebniDioMasterPovrsine.forEach(function (p) {
                    povrsina += ls.myParseFloat(p.Povrsina) * k;
                });
                prMaster.PricuvaRezijePosebniDioMasterPripadci.forEach(function (p) {
                    povrsina += ls.myParseFloat(p.Povrsina) * k;
                });
            }
        });
        //return povrsina.toString().replace('.', ',');
        return povrsina;
    }

    var brojStanovauZgradi = function (PricuvaRezijeZaMjesec) {
        var count = 0;
        PricuvaRezijeZaMjesec.PricuvaRezijePosebniDioMasteri.forEach(function (m) {
            count++;
        });
        return count;
    }


    return {
        povrsinaZgrade: povrsinaZgrade,
        povrsinaPda: povrsinaPda,
        brojStanovauZgradi: brojStanovauZgradi
    }

}]);