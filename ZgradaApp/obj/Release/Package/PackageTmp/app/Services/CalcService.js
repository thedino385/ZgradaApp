angularApp.factory('CalcService', ['$http', '$rootScope', 'DataService', function ($http, $rootScope, DataService) {

    var povrsinaZgrade = function (PricuvaRezijeZaMjesec) {
            var total = 0;
            PricuvaRezijeZaMjesec.PricuvaRezijePosebniDioMasteri.forEach(function (pdMaster) {
                pdMaster.PricuvaRezijePosebniDioMasterPovrsine.forEach(function (povrsina) {
                    console.log('povrsina: ' + povrsina);
                    //total += parseFloat(povrsina.Povrsina) * ($scope.PricuvaRezijeZaMjesec.SaKoef == true ? parseFloat(povrsina.Koef) : 1);
                    total += DataService.myParseFloat(povrsina.Povrsina);
                });
                pdMaster.PricuvaRezijePosebniDioMasterPripadci.forEach(function (prip) {
                    console.log('prip: ' + prip);
                    //total += parseFloat(prip.Povrsina) * ($scope.PricuvaRezijeZaMjesec.SaKoef == true ? parseFloat(prip.Koef) : 1);
                    total += DataService.myParseFloat(prip.Povrsina);
                });
            });
            //console.log('Povrisna zgrade: ' + total);
            return total;
    }


    var povrsinaPda = function (PricuvaRezijeZaMjesec, pdMasterId, saKoef) {
        var povrsina = 0;
        var k = 1;
        if (saKoef == true)
            k = ds.myParseFloat(p.Koef);
        PricuvaRezijeZaMjesec.PricuvaRezijePosebniDioMasteri.forEach(function (prMaster) {
            if (prMaster.PosebniDioMasterId == pdMasterId) {
                prMaster.PricuvaRezijePosebniDioMasterPovrsine.forEach(function (p) {
                    povrsina += ds.myParseFloat(p.Povrsina) * k;
                });
                prMaster.PricuvaRezijePosebniDioMasterPripadci.forEach(function (p) {
                    povrsina += ds.myParseFloat(p.Povrsina) * k;
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