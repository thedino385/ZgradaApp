// https://angular-ui.github.io/bootstrap/

angularApp.controller('pripadakStanCtrl', ['$scope', '$uibModalInstance', 'DataService', 'item', 'zgrada', 'stanovi', 'currentStan',
    function ($scope, $uibModalInstance, DataService, item, zgrada, stanovi, currentStan) {

        $scope.isPrijenos = false;
        $scope.prijenosSaStana = {};
        $scope.vrijediOdGod = (new Date().getFullYear()).toString();
        $scope.vrijediOdMj = (new Date().getMonth() + 1).toString();

        console.log("modal item");
        console.log(item);

        $scope.item = item;

        console.log("pripadci u zgradi MODALLLLL");
        


        var pripadciSelect = [];
        //$scope.pripadci = zgrada.Zgrade_Pripadci;
        // izbaci iz scope-a pripadke koji su vec na stanu
        zgrada.Zgrade_Pripadci.forEach(function (p) {
            //if (currentStan.Stanovi_Pripadci.indexOf(p) == -1)
            //    pripadciSelect.push(p);
            var ok = true;
            currentStan.Stanovi_Pripadci.forEach(function (ps) {
                if (p.Id == ps.PripadakIZgradaId)
                    ok = false;
            });
            if (ok)
                pripadciSelect.push(p);
        });
        //    //if (zgrada.Zgrade_Pripadci.indexOf(p) != -1)
        //    zgrada.Zgrade_Pripadci.splice(zgrada.Zgrade_Pripadci.indexOf(p), 1);
        //    console.log("Obrisano: ");
        //    console.log(p);
        //});
        console.log(pripadciSelect);
        $scope.pripadci = pripadciSelect;

        if ($scope.item.Id > 0)
        {
            napuniPodatkeIzPripatkaOdZgrade();
        }
        
        var idKojiSeZatvara = 0;
        $scope.pripadakIdChanged = function () {
            // provjeriti da li pripadak vec vezan za neki stan
            stanovi.forEach(function (stan) {
                stan.Stanovi_Pripadci.forEach(function (stan_pripadak) {
                    if (stan_pripadak.PripadakIZgradaId == $scope.item.PripadakIZgradaId) { // ovdje jos treba provjeriti Vrijedi***
                        $scope.isPrijenos = true;
                        $scope.prijenosSaStana = stan;
                        idKojiSeZatvara = stan_pripadak.Id
                    }
                })
            });
            napuniPodatkeIzPripatkaOdZgrade();
        }

        //$scope.prebaci = function () {
        //    var obj = {
        //        PripadakIZgradaId: $scope.item.PripadakIZgradaId, FromStan: $scope.prijenosSaStana.Id, ToStan: currentStan.Id,
        //        VrijediOdGodina: $scope.vrijediOdGod, VrijediOdMjesec: $scope.vrijediOdMj
        //    };
        //    currentStan.Stanovi_PrijenosPripadaka.push(obj);
        //}

        function napuniPodatkeIzPripatkaOdZgrade()
        {
            zgrada.Zgrade_Pripadci.forEach(function (p) {
                if (p.Id == $scope.item.PripadakIZgradaId) {
                    $scope.pripadakPovrsinaM2 = p.PovrsinaM2;
                    $scope.pripadakPovrsinaPosto = p.PovrsinaPosto;
                    $scope.pripadakNapomena = p.Napomena
                }
            })
        }
        


        $scope.save = function () {
            console.log('save');
            var arr = [];
            if ($scope.isPrijenos == true) {
                var obj = {
                    PripadakIZgradaId: $scope.item.PripadakIZgradaId, FromStan: $scope.prijenosSaStana.Id, ToStan: currentStan.Id,
                    VrijediOdGodina: $scope.vrijediOdGod, VrijediOdMjesec: $scope.vrijediOdMj, IdKojiSeZatvara: idKojiSeZatvara
                };
                
                if (currentStan.Stanovi_PrijenosPripadaka == null) {
                    currentStan.Stanovi_PrijenosPripadaka = arr;
                    arr.push(obj);
                }
                else
                    currentStan.Stanovi_PrijenosPripadaka.push(obj);
            }
            $uibModalInstance.close(item);
        };

        $scope.cancel = function () {
            console.log('cancel');
            //$scope.item = { Id: 0, InvoiceId: 0, ProductId: 0, Quantity: 1, Price: 0, Tax: 0, Total: 0 };
            $uibModalInstance.dismiss('cancel');
        }


    }]);