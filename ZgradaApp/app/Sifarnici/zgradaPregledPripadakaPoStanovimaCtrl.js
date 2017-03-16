angularApp.controller('zgradaPregledPripadakaPoStanovimaCtrl', ['$scope', '$location', '$routeParams', 'DataService', function ($scope, $location, $routeParams, DataService) {


    if ($routeParams) { // zgradaId
        var zgradaId = $routeParams.id;
        var stanovi = [];


        var _zgrada = {};
        DataService.getZgrade().then(function (zgrade) {
            zgrade.forEach(function (zgrada) {
                if (zgradaId == zgrada.Id) {
                    _zgrada = zgrada;
                    $scope.msg = "Pregled u zgrad " + zgrada.Naziv + ", " + zgrada.Adresa + ", " + zgrada.Mjesto;
                }


            })
            DataService.getStanovi().then(function (result) {
                result.forEach(function (stan) {
                    if (stan.ZgradaId == zgradaId)
                        stanovi.push(stan);
                });
                $scope.stanovi = stanovi;
            });

            $scope.getData = function (PripadakIZgradaId) {
                var o = {};
                _zgrada.Zgrade_Pripadci.forEach(function (pripadakIzZgrade) {
                    if (PripadakIZgradaId == pripadakIzZgrade.Id) {
                        //console.log('pripadakIzZgrade');
                        //console.log(pripadakIzZgrade);
                        o = pripadakIzZgrade;
                    }

                });
                var ret = { VrstaNaziv: o.VrstaNaziv, Naziv: o.Naziv, PovrsinaM2: o.PovrsinaM2, PovrsinaPosto: o.PovrsinaPosto };

                //var o = { Vrsta: "a", Naziv: "b" }
                return ret;
            }
        }
        )


    }
}]);