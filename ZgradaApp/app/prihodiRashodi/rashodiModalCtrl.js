angularApp.controller('rashodiModalCtrl', ['$scope', '$mdDialog', 'DataService', 'prihodRashodZaGodinu', 'mjesec', 'godina', 'sifarnikRashoda', 'posedbiDijelovi',
    function ($scope, $mdDialog, DataService, prihodRashodZaGodinu, mjesec, godina, sifarnikRashoda, posedbiDijelovi) {

        $scope.sifarnikRashoda = sifarnikRashoda;
        $scope.prihodRashodZaGodinu = prihodRashodZaGodinu;
        $scope.posedbiDijelovi = posedbiDijelovi;

        var tempObj = {};
        angular.copy($scope.prihodRashodZaGodinu, tempObj);
        $scope.mjesec = mjesec;
        $scope.godina = godina;
        $scope.period = getHeaderText();

        //izracunajUkupno();
        $scope.dodajRecord = function () {
            dodajRec();
        }

        var dateList = [];
        var dateplacanjeList = [];
        $scope.prihodRashodZaGodinu.PrihodiRashodi_Rashodi.forEach(function (raMjesec) {
            dateList.push(new Date(raMjesec.Datum));
            //dateplacanjeList.push(new Date(raMjesec.Datum.DatumPlacanja));
            dateplacanjeList.push(raMjesec.DatumPlacanja != null ? new Date(raMjesec.DatumPlacanja) : null);
        });
        $scope.dateList = dateList;
        $scope.dateplacanjeList = dateplacanjeList;

        function dodajRec(PrijenosIzProlse) {
            var maxId = 0;
            $scope.prihodRashodZaGodinu.PrihodiRashodi_Rashodi.forEach(function (raMjesec) {

                if (raMjesec.Id > maxId)
                    maxId = raMjesec.Id;
            })
            var noviRecord = {
                Id: maxId + 1, PrihodiRashodiGodId: $scope.prihodRashodZaGodinu.Id, Mjesec: mjesec,
                Datum: new Date(), Iznos: 0, Status: 'a', PosebniDioMasterId: null, RashodId: null
            };
            $scope.prihodRashodZaGodinu.PrihodiRashodi_Rashodi.push(noviRecord);
            $scope.dateList.push(new Date());
            $scope.dateplacanjeList.push(new Date());
            //console.log($scope.prihodRashodZaGodinu.PrihodiRashodi_Prihodi.length);
        }

        $scope.delete = function (Id) {
            // ako je obj.Id == 0, obrisi zadnji rec u kolekciji (nije u bazi)
            if ($scope.prihodRashodZaGodinu.Id == 0) {
                $scope.prihodRashodZaGodinu.PrihodiRashodi_Rashodi.forEach(function (rec) {
                    if (rec.Id == Id) {
                        var index = $scope.prihodRashodZaGodinu.PrihodiRashodi_Rashodi.indexOf(rec)
                        $scope.prihodRashodZaGodinu.PrihodiRashodi_Rashodi.splice(index, 1);
                    }
                });
            }
            // ako nije, ako je status 'a', brisi, u suprotnom stavi status na 'd'
            else {
                $scope.prihodRashodZaGodinu.PrihodiRashodi_Rashodi.forEach(function (rec) {
                    if (rec.Id == Id) {
                        if (rec.Status == 'a') {
                            var index = $scope.prihodRashodZaGodinu.PrihodiRashodi_Rashodi.indexOf(rec)
                            $scope.prihodRashodZaGodinu.PrihodiRashodi_Rashodi.splice(index, 1);
                        }
                        else
                            rec.Status = 'd';
                    }
                })
            }
            //izracunajUkupno();
        }

        //$scope.ukupno = function () {
        //    izracunajUkupno();
        //}

        //function izracunajUkupno() {
        //    if ($scope.prihodRashodZaGodinu == undefined)
        //        return;
        //    var ukupno = 0;
        //    $scope.prihodRashodZaGodinu.PrihodiRashodi_Rashodi.forEach(function (rec) {
        //        if (rec.Status != 'd' && rec.Placen != true)
        //            ukupno += parseFloat(rec.Iznos);
        //    })
        //    $scope.total = ukupno.toFixed(2);
        //    //console.log($scope.total);
        //}

        $scope.save = function () {
            // za sve ostale recorde, stavi status 'u'
            //var Placeno_u_currMjesecu = 0;
            var index = 0;
            $scope.prihodRashodZaGodinu.PrihodiRashodi_Rashodi.forEach(function (rec) {
                for (var i = 0; i < $scope.prihodRashodZaGodinu.PrihodiRashodi_Rashodi.length; i++) {
                    if (index == i) {
                        rec.DatumPlacanja = $scope.dateplacanjeList[i] != null ? new Date($scope.dateplacanjeList[i]) : null;
                        rec.Datum = $scope.dateList[i] != null ? new Date($scope.dateList[i]) : null;
                        break;
                    }
                }
                if (rec.Status == null)
                    rec.Status = 'u';
                index++;
            })
            $scope.prihodRashodZaGodinu.Godina = godina;
            $mdDialog.hide($scope.prihodRashodZaGodinu);
            console.log($scope.prihodRashodZaGodinu);
        };

        $scope.cancel = function () {
            $mdDialog.cancel(tempObj);
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