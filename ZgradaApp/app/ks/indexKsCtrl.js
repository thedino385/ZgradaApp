angularApp.controller('indexKsCtrl', ['$scope', '$mdDialog', 'zgradaObj', 'pdMaster',
    function ($scope, $mdDialog, zgradaObj, pdMaster) {

        $scope.zgradaObj = zgradaObj;
        $scope.tableVisible = false;
        $scope.pdMaster = pdMaster;


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
            $scope.zgradaObj.PricuvaRezijeGodina.forEach(function (pr) {
                if (pr.Godina == godina) {
                    pr.PricuvaRezijeMjesec.forEach(function (mjesec) {
                        zaduzenja.push(mjesec);
                        mjesec.PricuvaRezijePosebniDioMasteri.forEach(function (master) {
                            if (master.PosebniDioMasterId == pdMaster.Id) {
                                zaduzenjaUkupno += parseFloat(master.Zaduzenje);
                            }
                                
                        });
                        if (parseInt(mjesec.Mjesec) > parseInt(maxMjesec))
                            maxMjesec = parseInt(mjesec.Mjesec);
                    });
                }
            });
            $scope.zaduzenja = zaduzenja;
            console.log($scope.zaduzenja);
            var mjeseci = [];
            for (var i = 1; i <= maxMjesec; i++) {
                mjeseci.push(i);
            }
            $scope.mjeseci = mjeseci;
            $scope.prihodiUkupno = prihodiUkupno;
            $scope.zaduzenjaUkupno = zaduzenjaUkupno;
            $scope.stanje = parseFloat(prihodiUkupno) - parseFloat(zaduzenjaUkupno);

            // posebni dijelovi childovi
            //$scope.zgradaObj.PricuvaRezijeGodina.forEach(function (pr) {
            //    if (pr.Godina == godina) {
            //        pr.PricuvaRezijeMjesec.forEach(function (mjesec) {
            //            mjesec.PricuvaRezijePosebniDioMasteri.forEach(function (master) {
            //                if (master.PosebniDioMasterId == pdMaster.Id) {
            //                    zaduzenjaUkupno += parseFloat(master.Zaduzenje);
            //                    // posebni dijelovi
            //                    master.PricuvaRezijePosebniDioChildren.forEach(function (child) {
            //                        $scope.zgradaObj.Zgrade_PosebniDijeloviChild.forEach(function (zgradaChild) {
            //                            if (child.PosebniDioChildId == zgradaChild.Id)
            //                                childovi.push(zgradaChild.Naziv);
            //                        });
            //                    });
            //                }

            //            });
            //            if (parseInt(mjesec.Mjesec) > parseInt(maxMjesec))
            //                maxMjesec = parseInt(mjesec.Mjesec);
            //        });
            //    }
            //});
        } 

        $scope.cancel = function () {
            $mdDialog.cancel();
        };
    }]);