angularApp.filter('toDecimalEngFilter', function () {
    return function (x) {
        if (parseFloat(x) < 0)
            return 'redCell';
        else
            return 'greenCell';
    }
});


angularApp.filter('to2Decimals', function () {
    return function (x) {
        return parseFloat(x.toString().replace(',', '.')).toFixed(2).toString().replace('.', ',');
    }
});


angularApp.filter('toDecimalHrFilter', function () {
    return function (x) {
        var y = '';
        //alert(x);
        //alert(x.toString().toLocaleString('hr-HR', { minimumFractionDigits: 2 }));
        if (x != null && x != undefined) {
            //y = (parseFloat(x)).toLocaleString('hr-HR', { minimumFractionDigits: 2 });
            //var decimals = x.toString().split(',')[1];
            //if (decimals != undefined)
            //    y += parseFloat(decimals / 1000).toFixed(2);
            //else
            //    y = parseFloat(y).toFixed(2);
            //var y = x.toString();
            //y = x.replace(',', '').replace('.', '');
            //return x.toLocaleString('hr-HR', { minimumFractionDigits: 2 });
            //alert(x);
            return x;

            y = x.toString();
            if (y.indexOf('.') == -1)
            {
                if (y.indexOf(',') != -1) {
                    // prije kreiranja, provjeri da li treba dodati nule
                    var val2 = y.split(',')[1];
                    if (val2.length == 1)
                        return y + '0';
                    else
                        return y + ',00';
                }
                else
                    return y + ',00';
            }
            else if (y.indexOf(',') != -1)
                return y.replace('.', ',');

           
            //else if (y.indexOf('.') != -1) {
            //    return y.replace('.', ',');
            //}
            //y = y.replace(',', '');
            //if (y.indexOf('.') == -1)
            //    return y + ',00';
            //return x.toString().replace('.', ',');
        }
            
        //alert(y);
        return y;       
    }
});

angularApp.filter('dugColorFilter', function () {
    return function (dug) {

        if (parseFloat(dug) < 0)
            return 'redCell';
        else
            return 'greenCell';

    }
});


angularApp.filter('validZaMjesec', function () {
    return function (vlasniciPeriod, mjesec, godina) {

        // http://stackoverflow.com/questions/15196161/angularjs-how-to-structure-a-custom-filter-with-ng-repeat-to-return-items-cond

        var ret = [];
        var currGod = parseInt(godina);
        var currMj = parseInt(mjesec);
        if (vlasniciPeriod != []) {
            vlasniciPeriod.forEach(function (period) {
                // 1. nije zatvoren i VrijediOdGodina < god - VRIJEDI
                // 2. nije zatvoren i VrijediOdGodina == god - PROVJERI VrijediOdMjesec (vrijedi pocevsi sa mjesecom)
                // 3. zatvoren je => VrijediDoGodina > god - VRIJEDI
                // 4. zatvoren je => VrijediDoGodina == god && VrijediDoMjesec <= mj

                // VrijediDo - sa tim mjesecom -- koji je upisan
                // VrijediOd - od tog mjeseca (koji je upisan)  -- od kad vrijedi

                if (period.Zatvoren != true) {
                    // NIJE ZATVOREN
                    if (parseInt(period.VrijediOdGodina) < currGod) {
                        ret.push(period);
                        // ovo vrijedi
                    }
                    else if (parseInt(period.VrijediOdGodina) == currGod && parseInt(period.VrijediOdMjesec) <= currMj) {
                        ret.push(period);
                        // vrijedi za godinu, zakljucno sa mjesecom
                    }
 
                }
                else {
                    if (parseInt(period.VrijediDoGodina) > currGod) {
                        ret.push(period);
                        // ovo vrijedi
                    }
                    // ok, zatvoren je, vrijedi za godinu i mjesecom koji pise
                    else if (parseInt(period.VrijediDoGodina) == currGod && parseInt(period.VrijediDoMjesec) >= currMj) {
                        ret.push(period);
                    }
                        
                }
            })
        }
        //console.log(vlasniciPeriod);
        //alert(mjesec + ' ' + godina);

        return ret;
    }
});


angularApp.filter('pricuvaRezijeMjesec', function () {
    return function (prZaMjesec, mjesec, godina, zgradaObj, prGodinaId) {
        // prMjesec je sto ce se vratiti
        // ono iz cega se podaci cupaju i pune prMjesec je zgradaObj

        //var _prZaMjesec = { Id: 0, PrivuvaRezijeGodId: prGodinaId,  };

        /*
            - da li master vrijedi
        */
        var prZaMjesec = {
            Id: 0, PrivuvaRezijeGodId: prGodinaId, Mjesec: mjesec, NacinObracunaPricuva: null, NacinObracunaRezije: null,
            SaKoef: null, ObracunPricuvaCijenaM2: null, ObracunPricuvaCijenaUkupno: null, ObracunRezijeCijenaUkupno: null,
            PricuvaRezijePosebniDioMasteri: []
            // ikolekcije
        };
        var prMasteri = {Id: 0, }


        zgradaObj.Zgrade_PosebniDijeloviMaster.forEach(function (pdMaster) {
            if (daLiVrijedi(pdMaster)) {
                
                prZaMjesec.PricuvaRezijePosebniDioMasteri.push()
                // ok, vrijedi
                pdMaster.Zgrade_PosebniDijeloviChild.forEach(function (pdChild) {
                    // da li childovi vrijede
                    if (daLiVrijedi(pdChild))
                        pdMaster.push(pdChild);
                });
               

            }
        });


        //alert(mjesec + ' ' + godina);
        var ret = false;

        return ret;

    }

    function daLiVrijedi(obj)
    {
        if (obj.Zatvoren != true) {
            // NIJE ZATVOREN
            if (parseInt(obj.VrijediOdGodina) < godina) {
                return true;
                // ovo vrijedi
            }
            else if (parseInt(obj.VrijediOdGodina) == godina && parseInt(obj.VrijediOdMjesec) <= mjesec) {
                return true;
                // vrijedi za godinu, zakljucno sa mjesecom
            }
        }
        else {
            if (parseInt(obj.VrijediDoGodina) > godina) {
                return true;
                // ovo vrijedi
            }
            // ok, zatvoren je, vrijedi za godinu i mjesecom koji pise
            else if (parseInt(obj.VrijediDoGodina) == godina && parseInt(obj.VrijediDoMjesec) >= mjesec) {
                return true;
                //ret.push(period);
            }

        }
    }
});