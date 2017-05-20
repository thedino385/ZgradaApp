angularApp.controller('rashodiUplatniceCtrl', ['$scope', '$mdDialog', 'orderByFilter', 'DataService', 'toastr', 'rashodi', 'mjesec', 'godina', 'sifarnikRashoda', 'posedbiDijelovi',
    function ($scope, $mdDialog, orderBy, DataService, toastr, rashodi, mjesec, godina, sifarnikRashoda, posedbiDijelovi) {

        $scope.sifarnikRashoda = sifarnikRashoda;
        $scope.rashodi = rashodi;
        $scope.posedbiDijelovi = posedbiDijelovi;

        $scope.mjesec = mjesec;
        $scope.godina = godina;
        $scope.period = getHeaderText();

        //var dateList = [];
        //var dateplacanjeList = [];
        //$scope.rashodi.forEach(function (raMjesec) {
        //    dateList.push(new Date(raMjesec.Datum));
        //    dateplacanjeList.push(raMjesec.DatumPlacanja != null ? new Date(raMjesec.DatumPlacanja) : null);
        //});
        //$scope.dateList = dateList;
        //$scope.dateplacanjeList = dateplacanjeList;

        // sort
        $scope.propertyName = 'PosebniDioMasterId';
        $scope.reverse = false;
        $scope.rashodi = orderBy(rashodi, $scope.propertyName, $scope.reverse);

        $scope.sortBy = function (propertyName) {
            $scope.reverse = (propertyName !== null && $scope.propertyName === propertyName)
                ? !$scope.reverse : false;
            $scope.propertyName = propertyName;
            $scope.rashodi = orderBy(rashodi, $scope.propertyName, $scope.reverse);
        };


        var tbl = [];

        var masterId = -1;
        var ukupno = 0;
        var index = 1;
        $scope.rashodi.forEach(function (r) {
            if (r.Mjesec == mjesec && r.Placen != true) {
                var row = {
                    zgradaId: DataService.selZgradaId, rashodId: 0, prihodiRashodiGodId: 0, godina: godina, mjesec: mjesec, masterId: 0, masterNaziv: '', rashod: '', iznos: 0, datum: null,
                    placeno: false, poslano: false, bold: 'normal', statusSlanja: '', datumSlanja: null, isUkupnoRow: false
                };
                row.rashodId = r.Id;
                row.prihodiRashodiGodId = r.PrihodiRashodiGodId;
                row.iznos = r.Iznos;
                row.rashod = findRashod(r.RashodId);
                row.datumSlanja = r.DatumSlanja != null ? parseDate(r.DatumSlanja) : '';
                row.placeno = r.Placeno;
                row.poslano = r.PoslanoZaMjesec;
                row.statusSlanja = r.StatusSlanja;
                row.mjesec = mjesec;

                //if (r.PosebniDioMasterId == masterId || masterId == -1 || index == rashodi.length) {
                //    ukupno += parseFloat(r.Iznos);
                //    console.log('ukupno izracun: ' + ukupno);
                //}

                if (r.PosebniDioMasterId != masterId) {
                    row.masterNaziv = findMaster(r.PosebniDioMasterId);
                }
                else
                    row.masterNaziv = '';

                row.masterId = r.PosebniDioMasterId;
                //console.log(r.PosebniDioMasterId + ' ' + masterId + ' ' + ukupno);

                if (r.PosebniDioMasterId != masterId && masterId != -1) {
                    //console.log('total');
                    var rowTotal = {
                        rashodId: 0, masterId, masterNaziv: 'Ukupno:', rashod: '', iznos: 0, datumSlanja: '',
                        placeno: '', poslano: true, bold: 'bold', isUkupnoRow: true
                    };
                    rowTotal.iznos = ukupno;
                    tbl.push(rowTotal);
                    ukupno = 0;
                    //var rowEmpty = {
                    //    rashodId: 0, masterNaziv: '', rashod: '', iznos: '', datum: '',
                    //    placeno: '', poslano: '', bold: 'bold'
                    //};
                    //tbl.push(rowEmpty);
                }
                tbl.push(row);
                masterId = r.PosebniDioMasterId;
                index++;
                ukupno += parseFloat(r.Iznos);
            }
        });
        //console.log('ukupno na kraju ' + ukupno);
        var rowTotal = {
            rashodId: 0, masterId, masterNaziv: 'Ukupno:', rashod: '', iznos: 0, datumSlanja: '',
            placeno: '', poslano: true, bold: 'bold', isUkupnoRow: true
        };
        rowTotal.iznos = ukupno;
        tbl.push(rowTotal);

        //console.log(tbl);
        $scope.tbl = tbl;

        function findMaster(masterId) {
            var ret = '';
            posedbiDijelovi.forEach(function (m) {
                if (m.Id == masterId)
                    ret = m.Naziv;
            });
            return ret;
        }

        function findRashod(rashoId) {
            var ret = '';
            sifarnikRashoda.forEach(function (sr) {
                if (sr.Id == rashoId)
                    ret = sr.Naziv;
            });
            return ret;
        }

        function parseDate(dejt) {
            console.log(dejt);
            var d = new Date(dejt);
            return d.getDate() + '.' + parseInt(d.getMonth() + 1) + '.' + d.getFullYear() + '.';
        }

        function parseDateJSON(dejt) {
            if (dejt == null)
                return '';
            var d = new Date(parseInt(dejt.substr(6)));
            return d.getDate() + '.' + parseInt(d.getMonth() + 1) + '.' + d.getFullYear() + '.';
        }

        

        $scope.send = function () {
            //var neplaceni = [];
            //$scope.tbl.forEach(function (r) {
            //    console.log(r);
            //    if (r.poslano != true && r.mjesec == mjesec)
            //        neplaceni.push(r);
            //});

            DataService.sendUplatniceRashodi($scope.tbl).then(
                function (result) {
                    //console.log(result.status);
                    //console.log(result.data.success);
                    console.log(result.data.response);

                    if (result.status == 200) {
                        if (result.data.success) {
                            var res = result.data.response;

                            var scopeFromServer = [];
                            res.forEach(function (row) {
                                row.datumSlanja =  parseDateJSON(row.datumSlanja);
                            });
                            $scope.tbl = res;

                            var poslaniSvi = true;
                            res.forEach(function (row) {
                                if (row.poslano == false)
                                    poslaniSvi = false;
                            });
                            if (poslaniSvi)
                                toastr.success('Svi mailovi su poslani');
                            else
                                toastr.error('Jedan ili više mailova nije poslan');
                        }
                        else
                            toastr.error('Nema rashoda za kreiranje i slanje uplatnica');
                    }
                    else
                        toastr.error('Došlo je do pogreške pri slanju');

                })
        }

        $scope.showMailStatus = function (masterId, ev) {
            var msg = '';
            var masterMsg = '';
            $scope.tbl.forEach(function (row) {
                if (row.masterId == masterId && row.isUkupnoRow == false && row.masterNaziv != '') {
                    masterMsg = row.masterNaziv;
                    msg = row.statusSlanja;
                }
            });
            //$scope.msgStatuSalanja = msg;
            $scope.msgEmailStatus = msg;
            $scope.masterMsg = masterMsg;
            $scope.showStatus = true;

            //$mdDialog.show(
            //$mdDialog.alert()
            //    //.parent(angular.element(document.querySelector('#alertId')))
            //    .clickOutsideToClose(true)
            //    .title('Status')
            //    .textContent(msg)
            //    .ariaLabel('Alert Dialog Demo')
            //    .ok('Ok')
            //.targetEvent(ev)
            //);
        }



        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        // provjeri lleap year
        function getFebDay() {
            var year = new Date().getFullYear();
            if (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0))
                return 29;
            return 28;
        }

        function getHeaderText() {
            switch (parseInt(mjesec)) {
                case 1:
                    return 'od 01.01. do 31.01. ' + $scope.godina + '.';
                case 2:
                    return 'od 01.02. do ' + getFebDay() + '.02. ' + $scope.godina + '.';
                case 3:
                    return 'od 01.03. do 31.03. ' + $scope.godina + '.';
                case 4:
                    return 'od 01.04. do 30.04. ' + $scope.godina + '.';
                case 5:
                    return 'od 01.05. do 31.05. ' + $scope.godina + '.';
                case 6:
                    return 'od 01.06. do 30.06. ' + $scope.godina + '.';
                case 7:
                    return 'od 01.07. do 31.07. ' + $scope.godina + '.';
                case 8:
                    return 'od 01.08. do 31.08. ' + $scope.godina + '.';
                case 9:
                    return 'od 01.09. do 30.09. ' + $scope.godina + '.';
                case 10:
                    return 'od 01.10. do 31.10. ' + $scope.godina + '.';
                case 11:
                    return 'od 01.11. do 30.11. ' + $scope.godina + '.';
                case 12:
                    return 'od 01.12. do 31.12. ' + $scope.godina + '.';
            }
        }
    }]);