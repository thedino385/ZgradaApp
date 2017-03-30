angularApp.controller('modalPrihodCtrl', ['$scope', '$uibModalInstance', 'DataService', 'prihodRashodZaGodinu', 'mjesec', 'godina', 'pricuvaZaZgraduSveGodine',
    function ($scope, $uibModalInstance, DataService, prihodRashodZaGodinu, mjesec, godina, pricuvaZaZgraduSveGodine) {

        console.log(pricuvaZaZgraduSveGodine);

        // prosljedjen je cijeli objekt, nadji samo prihode iz mjeseca (godina je vec ranije odabrana)
        $scope.prihodRashodZaGodinu = prihodRashodZaGodinu;
        $scope.mjesec = mjesec;
        $scope.godina = godina;
        $scope.period = getHeaderText();
        $scope.pricuvaZaZgraduSveGodine = pricuvaZaZgraduSveGodine;
        $scope.uplataPricuve = 0;

        // uplata pricuve, samo se mapira, ne snima se
        var uplataPricuve = 0;
        $scope.pricuvaZaZgraduSveGodine.forEach(function (prGod) {
            if (prGod.Godina == $scope.godina) {
                var masterId = prGod.Id;
                prGod.KS.forEach(function (ks) {
                    if (ks.PricuvaGodId == masterId && ks.Mjesec == $scope.mjesec) {
                        uplataPricuve += parseFloat(ks.Uplata);
                    }
                });
            }
        })
        $scope.uplataPricuve = uplataPricuve;

        if ($scope.mjesec == 1) {
            // ako je prvi mjesec, onda postoji prijeno procuve iz pr. godine
            // ako nema recorda, dodaj ga
            var found = false;
            prihodRashodZaGodinu.PrihodiRashodiDetails.forEach(function (prihod) {
                if (rec.mjesec == 1 && rec.PrijenosIzProlse)
                    found = true;
            });
            if (!found)
                dodajRec(true);
        }

        izracunajUkupno();

        $scope.dodajRecord = function (PrijenosIzProlse) {
            dodajRec(PrijenosIzProlse);
        }

        function dodajRec(PrijenosIzProlse) {
            var maxId = 0;
            prihodRashodZaGodinu.PrihodiRashodiDetails.forEach(function (prihod) {
                if (prihod.Mjesec == mjesec && prihod.Vrsta == 'p')
                    maxId = prihod.Id;
            });
            var noviRecord = {
                Id: maxId + 1, PrihodiRashodiMasterId: prihodRashodZaGodinu.Id, Mjesec: mjesec,
                Opis: "", Iznos: 0, Vrsta: "p", Status: 'a', PrijenosIzProlse: PrijenosIzProlse
            };
            $scope.prihodRashodZaGodinu.PrihodiRashodiDetails.push(noviRecord);
        }

        $scope.delete = function (Id) {
            // ako je obj.Id == 0, obrisi zadnji rec u kolekciji (nije u bazi)
            if ($scope.prihodRashodZaGodinu.Id == 0) {
                $scope.prihodRashodZaGodinu.PrihodiRashodiDetails.forEach(function (rec) {
                    console.log(rec);
                    if (rec.Vrsta == 'p' && rec.Id == Id) {
                        var index = $scope.prihodRashodZaGodinu.PrihodiRashodiDetails.indexOf(rec)
                        $scope.prihodRashodZaGodinu.PrihodiRashodiDetails.splice(index, 1);
                    }
                })
            }
            // ako nije, u bazi je, stavi status na 'd'
            else {
                $scope.prihodRashodZaGodinu.PrihodiRashodiDetails.forEach(function (rec) {
                    if (rec.Type == 'p' && rec.Id == Id) 
                        rec.Status = 'd';       
                })
            }
            izracunajUkupno();
        }

        $scope.ukupno = function () {
            izracunajUkupno();
        }

        function izracunajUkupno() {
            var ukupno = 0;
            $scope.prihodRashodZaGodinu.PrihodiRashodiDetails.forEach(function (rec) {
                if (rec.Vrsta == 'p' && rec.Status != 'd' && rec.Mjesec == mjesec)
                    ukupno += parseFloat(rec.Iznos);
            })
            $scope.total = (ukupno + parseFloat($scope.uplataPricuve)).toFixed(2);
        }

        $scope.save = function () {
            // za sve ostale recorde, stavi status 'u'
            var Placeno_u_currMjesecu = 0;
            $scope.prihodRashodZaGodinu.PrihodiRashodiDetails.forEach(function (rec) {
                if (rec.Vrsta == 'p' && rec.Status.length == 0)
                    rec.Status = 'u';
                if (rec.Vrsta == 'p' && rec.Mjesec == mjesec)
                    Placeno_u_currMjesecu += parseFloat(rec.Iznos);
            })
            // za prihode treba izracunati samo PlacenoPrihodMj2 za mjesec (godina je odabrana ranije)
            switch (parseInt(mjesec))
            {
                case 1:
                    $scope.prihodRashodZaGodinu.PlacenoPrihodMj1 = Placeno_u_currMjesecu.toFixed(2);
                    break;
                case 2:
                    $scope.prihodRashodZaGodinu.PlacenoPrihodMj2 = Placeno_u_currMjesecu.toFixed(2);
                    break;
                case 3:
                    $scope.prihodRashodZaGodinu.PlacenoPrihodMj3 = Placeno_u_currMjesecu.toFixed(2);
                    break;
                case 4:
                    $scope.prihodRashodZaGodinu.PlacenoPrihodMj4 = Placeno_u_currMjesecu.toFixed(2);
                    break;
                case 5:
                    $scope.prihodRashodZaGodinu.PlacenoPrihodMj5 = Placeno_u_currMjesecu.toFixed(2);
                    break;
                case 6:
                    $scope.prihodRashodZaGodinu.PlacenoPrihodMj6 = Placeno_u_currMjesecu.toFixed(2);
                    break;
                case 7:
                    $scope.prihodRashodZaGodinu.PlacenoPrihodMj7 = Placeno_u_currMjesecu.toFixed(2);
                    break;
                case 8:
                    $scope.prihodRashodZaGodinu.PlacenoPrihodMj8 = Placeno_u_currMjesecu.toFixed(2);
                    break;
                case 9:
                    $scope.prihodRashodZaGodinu.PlacenoPrihodMj9 = Placeno_u_currMjesecu.toFixed(2);
                    break;
                case 10:
                    $scope.prihodRashodZaGodinu.PlacenoPrihodMj10 = Placeno_u_currMjesecu.toFixed(2);
                    break;
                case 11:
                    $scope.prihodRashodZaGodinu.PlacenoPrihodMj11 = Placeno_u_currMjesecu.toFixed(2);
                    break;
                case 12:
                    $scope.prihodRashodZaGodinu.PlacenoPrihodMj12 = Placeno_u_currMjesecu.toFixed(2);
                    break;
            }
            $uibModalInstance.close($scope.prihodRashodZaGodinu);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        }

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
                    return 'od 01.02. do ' + getFebDay(mjesec) + '.02. ' + $scope.godina + '.';
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