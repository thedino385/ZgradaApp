angularApp.controller('uplatnicaModalCtrl', ['$scope', '$mdDialog', 'orderByFilter', 'DataService', 'zgradaObj', 'mjesec', 'godina',
    function ($scope, $mdDialog, orderBy, DataService, zgradaObj, mjesec, godina) {

        $scope.zgradaObj = zgradaObj;
        $scope.godina = godina;
        $scope.mjesec = mjesec;

        zgradaObj.PricuvaRezijeGodina.forEach(function (prGod) {
            if (prGod.Godina == godina) {
                prGod.PricuvaRezijeMjesec.forEach(function (prMj) {
                    if (prMj.Mjesec == mjesec)
                        $scope.PricuvaRezijeZaMjesec = prMj;
                });
            }
        });


        $scope.tipoviDuga = [{ Id: 'r', Naziv: 'Režije' }, { Id: 'p', Naziv: 'Pričuva' }, { Id: 'a', Naziv: 'Režije i pričuva' }, { Id: '-', Naziv: 'Ništa' }];
        $scope.tipoviPlacanja = [{ Id: 'r', Naziv: 'Račun' }, { Id: 'u', Naziv: 'Uplatnica' }, { Id: '-', Naziv: 'Ništa' } ];


        console.log($scope.PricuvaRezijeZaMjesec.PricuvaRezijeMjesec_Uplatnice);
        if ($scope.PricuvaRezijeZaMjesec.PricuvaRezijeMjesec_Uplatnice == undefined || $scope.PricuvaRezijeZaMjesec.PricuvaRezijeMjesec_Uplatnice.length == 0) {
            var uList = [];

            propertyName = 'PosebniDioMasterId';
            reverse = false;
            var masteriList = orderBy($scope.PricuvaRezijeZaMjesec.PricuvaRezijePosebniDioMasteri, propertyName, reverse);

            sortBy = function (propertyName) {
                reverse = (propertyName !== null && propertyName === propertyName)
                    ? !reverse : false;
                propertyName = propertyName;
                masteriList = orderBy(masteriList, propertyName, reverse);
            };
            //console.log('masteriList');
            //console.log(masteriList);
            var mId = -1;
            var index = 1;
            masteriList.forEach(function (m) {
                m.PricuvaRezijePosebniDioMasterVlasnici.forEach(function (v) {

                    var o = {
                        index: index, Id: 0, PricuvaRezijeMjesecId: $scope.PricuvaRezijeZaMjesec, PosebniDioMasterId: m.PosebniDioMasterId, PlatiteljId: v.VlasnikId,
                        PrimateljId: 0, TipDuga: 'r', TipPlacanja: 'r', UdioPricuva: 0, UdioRezije: 0, IznosRezije: 0, IznosPricuva: 0, Uplatnica: '',
                        displayLine: false, displayBtnAdd: false, platitelji: [], primatelji: []
                    }
                    m.PricuvaRezijePosebniDioMasterVlasnici.forEach(function (v) {
                        zgradaObj.Zgrade_Stanari.forEach(function (s) {
                            if (s.Id == v.VlasnikId) {
                                var k = { Naziv: s.Ime + ' ' + s.Prezime, Id: s.Id };
                                o.platitelji.push(k);

                                o.primatelji.push(k);
                            }
                        });
                    });
                    var upravitelj = { Naziv: "Upravitelj", Id: 1000 }; // TODOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
                    o.primatelji.push(upravitelj);
                    var rh = { Naziv: "RH", Id: 10001 }; // TODOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
                    o.primatelji.push(rh);
                    uList.push(o);
                    index++;
                });
            });


            console.clear();
            console.log(uList);
            $scope.PricuvaRezijeZaMjesec.PricuvaRezijeMjesec_Uplatnice = prepraviHrove(uList);
        }

       

        $scope.dodajRecord = function (obj) {

            var index = $scope.PricuvaRezijeZaMjesec.PricuvaRezijeMjesec_Uplatnice.indexOf(obj);

            var o = {
                index: index, Id: 0, PricuvaRezijeMjesecId: $scope.PricuvaRezijeZaMjesec, PosebniDioMasterId: obj.PosebniDioMasterId, PlatiteljId: obj.PlatiteljId,
                PrimateljId: 0, TipDuga: 'r', TipPlacanja: 'r', UdioPricuva: 0, UdioRezije: 0, IznosRezije: 0, IznosPricuva: 0, Uplatnica: '', displayLine: false,
                displayBtnAdd: false, platitelji: obj.platitelji, primatelji: obj.primatelji
            }

            $scope.PricuvaRezijeZaMjesec.PricuvaRezijeMjesec_Uplatnice.splice(index + 1, 0, o);

            $scope.PricuvaRezijeZaMjesec.PricuvaRezijeMjesec_Uplatnice = prepraviHrove($scope.PricuvaRezijeZaMjesec.PricuvaRezijeMjesec_Uplatnice);
        }

        //$scope.stanari = DataService.zgradaUseri;
        //var primatelji = [];
        //zgradaObj.Zgrade_Stanari.forEach(function (s) {
        //    var k = { Naziv: s.Ime + ' ' + s.Prezime, Id: s.Id };
        //    korisnici.push(k);
        //});
        //$scope.korisnici = korisnici;


        function prepraviHrove(uList) {
            for (var i = 0; i < uList.length; i++) {
                uList[i].displayLine = false;
                uList[i].displayBtnAdd = false;
            }

            if (uList.length >= 2) {
                var prviMasterId = uList[0].PosebniDioMasterId;
                for (var i = 0; i < uList.length; i++) {
                    if (uList[i].PosebniDioMasterId != prviMasterId) {
                        uList[parseInt(i) - 1].displayLine = true;
                        uList[parseInt(i) - 1].displayBtnAdd = true;
                        prviMasterId = uList[i].PosebniDioMasterId;
                    }
                }
            }
            return uList;
        }


        //function findMasterNaziv(mId) {
        //    var ret = '';
        //    zgradaObj.Zgrade_PosebniDijeloviMaster.forEach(function (m) {
        //        if (mId == m.Id)
        //            ret = m.Naziv;
        //    });
        //    return ret;
        //}


        $scope.cancel = function () {
            $('nav').fadeIn();
            $mdDialog.cancel();
        };
    }]);