angularApp.controller('modalPrihodCtrl', ['$scope', '$uibModalInstance', 'DataService', 'obj', 'mjesec',
    function ($scope, $uibModalInstance, DataService, obj, mjesec) {

        // prosljedjen je cijeli objekt, nadji samo prihode iz mjeseca (godina je vec ranije odabrana)
        //var prihodiMjesec = [];
        //obj.PrihodiRashodiDetails.forEach(function (prihod) {
        //    if (prihod.Mjesec == mjesec && prihod.Vrsta == "p")
        //        prihodiMjesec.push(prihod);
        //});
        //$scope.prihodiMjesec = prihodiMjesec;
        $scope.obj = obj;
        $scope.mjesec = mjesec;

        $scope.dodajRecord = function () {
            var maxId = 0;
            obj.PrihodiRashodiDetails.forEach(function (prihod) {
                if (prihod.Mjesec == mjesec && prihod.Vrsta == 'p')
                    maxId = prihod.Id;
            });
            var noviRecord = {
                Id: maxId+1, PrihodiRashodiMasterId: obj.Id, Mjesec: mjesec,
                Opis: "", Iznos: 0, Vrsta: "p", Status: 'a'
            };
            $scope.obj.PrihodiRashodiDetails.push(noviRecord);
        }

        $scope.delete = function (Id) {
            // ako je obj.Id == 0, obrisi zadnji rec u kolekciji (nije u bazi)
            if ($scope.obj.Id == 0) {
                $scope.obj.PrihodiRashodiDetails.forEach(function (rec) {
                    console.log(rec);
                    if (rec.Vrsta == 'p' && rec.Id == Id) {
                        var index = $scope.obj.PrihodiRashodiDetails.indexOf(rec)
                        $scope.obj.PrihodiRashodiDetails.splice(index, 1);
                    }
                })
            }
            // ako nije, u bazi je, stavi status na 'd'
            else {
                $scope.obj.PrihodiRashodiDetails.forEach(function (rec) {
                    if (rec.Type == 'p' && rec.Id == Id) 
                        rec.Status = 'd';       
                })
            }
                
        }

        $scope.save = function () {
            // za sve ostale recorde, stavi status 'u'
            var Placeno_u_currMjesecu = 0;
            $scope.obj.PrihodiRashodiDetails.forEach(function (rec) {
                if (rec.Vrsta == 'p' && rec.Status.length == 0)
                    rec.Status = 'u';
                if (rec.Vrsta == 'p' && rec.Mjesec == mjesec)
                    Placeno_u_currMjesecu += parseFloat(rec.Iznos);
            })
            // za prihode treba izracunati samo PlacenoPrihodMj2 za mjesec (godina je odabrana ranije)
            switch (mjesec)
            {
                case '1':
                    $scope.obj.PlacenoPrihodMj1 = Placeno_u_currMjesecu.toFixed(2);
                    break;
                case '2':
                    alert('mjesec 2');
                    break;
            }
            $uibModalInstance.close($scope.obj);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        }

    }]);