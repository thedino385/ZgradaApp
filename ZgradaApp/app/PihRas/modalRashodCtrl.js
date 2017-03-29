angularApp.controller('modalRashodCtrl', ['$scope', '$uibModalInstance', 'DataService', 'prihodRashodZaGodinu', 'mjesec', 'godina',
    function ($scope, $uibModalInstance, DataService, prihodRashodZaGodinu, mjesec, godina) {

        // prosljedjen je cijeli objekt, nadji samo prihode iz mjeseca (godina je vec ranije odabrana)
        $scope.prihodRashodZaGodinu = prihodRashodZaGodinu;
        $scope.mjesec = mjesec;
        $scope.godina = godina;
        $scope.period = getHeaderText();

        $scope.dodajRecord = function () {
            var maxId = 0;
            prihodRashodZaGodinu.PrihodiRashodiDetails.forEach(function (rashod) {
                if (rashod.Mjesec == mjesec && rashod.Vrsta == 'r')
                    maxId = rashod.Id;
            });
            var noviRecord = {
                Id: maxId + 1, PrihodiRashodiMasterId: prihodRashodZaGodinu.Id, Mjesec: mjesec,
                Opis: "", Iznos: 0, Vrsta: "r", Status: 'a'
            };
            $scope.prihodRashodZaGodinu.PrihodiRashodiDetails.push(noviRecord);
        }

        $scope.delete = function (Id) {
            // ako je obj.Id == 0, obrisi zadnji rec u kolekciji (nije u bazi)
            if ($scope.prihodRashodZaGodinu.Id == 0) {
                $scope.prihodRashodZaGodinu.PrihodiRashodiDetails.forEach(function (rec) {
                    console.log(rec);
                    if (rec.Vrsta == 'r' && rec.Id == Id) {
                        var index = $scope.prihodRashodZaGodinu.PrihodiRashodiDetails.indexOf(rec)
                        $scope.prihodRashodZaGodinu.PrihodiRashodiDetails.splice(index, 1);
                    }
                })
            }
            // ako nije, u bazi je, stavi status na 'd'
            else {
                $scope.prihodRashodZaGodinu.PrihodiRashodiDetails.forEach(function (rec) {
                    if (rec.Type == 'r' && rec.Id == Id)
                        rec.Status = 'd';
                })
            }

        }

        $scope.save = function () {
            // za sve ostale recorde, stavi status 'u'
            var Razlika_u_currMjesecu = 0;
            var Iznos_u_currMjesecu = 0;
            var Placeno_u_currMjesecu = 0;
            $scope.prihodRashodZaGodinu.PrihodiRashodiDetails.forEach(function (rec) {
                if (rec.Vrsta == 'r' && rec.Status.length == 0)
                    rec.Status = 'u';
                if (rec.Vrsta == 'r' && rec.Mjesec == mjesec) {
                    Razlika_u_currMjesecu += parseFloat(rec.Placeno) - parseFloat(rec.Iznos);
                    Iznos_u_currMjesecu += parseFloat(rec.Iznos);
                    Placeno_u_currMjesecu += parseFloat(rec.Placeno);
                }
                    
            })
            // za prihode treba izracunati samo PlacenoPrihodMj2 za mjesec (godina je odabrana ranije)
            switch (parseInt(mjesec)) {
                case 1:
                    $scope.prihodRashodZaGodinu.RazlikaRashodMj1 = Razlika_u_currMjesecu.toFixed(2);
                    $scope.prihodRashodZaGodinu.PlacenoRashodMj1 = Iznos_u_currMjesecu.toFixed(2);
                    $scope.prihodRashodZaGodinu.IznosRashodMj1 = Iznos_u_currMjesecu.toFixed(2);
                    break;
                case 2:
                    $scope.prihodRashodZaGodinu.RazlikaRashodMj2 = Razlika_u_currMjesecu.toFixed(2);
                    $scope.prihodRashodZaGodinu.PlacenoRashodMj2 = Iznos_u_currMjesecu.toFixed(2);
                    $scope.prihodRashodZaGodinu.IznosRashodMj2 = Iznos_u_currMjesecu.toFixed(2);
                    break;
                case 3:
                    $scope.prihodRashodZaGodinu.RazlikaRashodMj3 = Razlika_u_currMjesecu.toFixed(2);
                    $scope.prihodRashodZaGodinu.PlacenoRashodMj3 = Iznos_u_currMjesecu.toFixed(2);
                    $scope.prihodRashodZaGodinu.IznosRashodMj3 = Iznos_u_currMjesecu.toFixed(2);
                    break;
                case 4:
                    $scope.prihodRashodZaGodinu.RazlikaRashodMj4 = Razlika_u_currMjesecu.toFixed(2);
                    $scope.prihodRashodZaGodinu.PlacenoRashodMj4 = Iznos_u_currMjesecu.toFixed(2);
                    $scope.prihodRashodZaGodinu.IznosRashodMj4 = Iznos_u_currMjesecu.toFixed(2);
                    break;
                case 5:
                    $scope.prihodRashodZaGodinu.RazlikaRashodMj5 = Razlika_u_currMjesecu.toFixed(2);
                    $scope.prihodRashodZaGodinu.PlacenoRashodMj5 = Iznos_u_currMjesecu.toFixed(2);
                    $scope.prihodRashodZaGodinu.IznosRashodMj5 = Iznos_u_currMjesecu.toFixed(2);
                    break;
                case 6:
                    $scope.prihodRashodZaGodinu.RazlikaRashodMj6 = Razlika_u_currMjesecu.toFixed(2);
                    $scope.prihodRashodZaGodinu.PlacenoRashodMj6 = Iznos_u_currMjesecu.toFixed(2);
                    $scope.prihodRashodZaGodinu.IznosRashodMj6 = Iznos_u_currMjesecu.toFixed(2);
                    break;
                case 7:
                    $scope.prihodRashodZaGodinu.RazlikaRashodMj7 = Razlika_u_currMjesecu.toFixed(2);
                    $scope.prihodRashodZaGodinu.PlacenoRashodMj7 = Iznos_u_currMjesecu.toFixed(2);
                    $scope.prihodRashodZaGodinu.IznosRashodMj7 = Iznos_u_currMjesecu.toFixed(2);
                    break;
                case 8:
                    $scope.prihodRashodZaGodinu.RazlikaRashodMj8 = Razlika_u_currMjesecu.toFixed(2);
                    $scope.prihodRashodZaGodinu.PlacenoRashodMj8 = Iznos_u_currMjesecu.toFixed(2);
                    $scope.prihodRashodZaGodinu.IznosRashodMj8 = Iznos_u_currMjesecu.toFixed(2);
                    break;
                case 9:
                    $scope.prihodRashodZaGodinu.RazlikaRashodMj9 = Razlika_u_currMjesecu.toFixed(2);
                    $scope.prihodRashodZaGodinu.PlacenoRashodMj9 = Iznos_u_currMjesecu.toFixed(2);
                    $scope.prihodRashodZaGodinu.IznosRashodMj9 = Iznos_u_currMjesecu.toFixed(2);
                    break;
                case 10:
                    $scope.prihodRashodZaGodinu.RazlikaRashodMj10 = Razlika_u_currMjesecu.toFixed(2);
                    $scope.prihodRashodZaGodinu.PlacenoRashodMj10 = Iznos_u_currMjesecu.toFixed(2);
                    $scope.prihodRashodZaGodinu.IznosRashodMj10 = Iznos_u_currMjesecu.toFixed(2);
                    break;
                case 11:
                    $scope.prihodRashodZaGodinu.RazlikaRashodMj11 = Razlika_u_currMjesecu.toFixed(2);
                    $scope.prihodRashodZaGodinu.PlacenoRashodMj11 = Iznos_u_currMjesecu.toFixed(2);
                    $scope.prihodRashodZaGodinu.IznosRashodMj11 = Iznos_u_currMjesecu.toFixed(2);
                    break;
                case 12:
                    $scope.prihodRashodZaGodinu.RazlikaRashodMj12 = Razlika_u_currMjesecu.toFixed(2);
                    $scope.prihodRashodZaGodinu.PlacenoRashodMj12 = Iznos_u_currMjesecu.toFixed(2);
                    $scope.prihodRashodZaGodinu.IznosRashodMj12 = Iznos_u_currMjesecu.toFixed(2);
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