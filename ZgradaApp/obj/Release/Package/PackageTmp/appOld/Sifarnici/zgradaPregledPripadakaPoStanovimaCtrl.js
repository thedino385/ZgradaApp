angularApp.controller('zgradaPregledPripadakaPoStanovimaCtrl', ['$scope', '$location', '$routeParams', '$rootScope', 'DataService',
    function ($scope, $location, $routeParams, $rootScope, DataService) {


    if ($routeParams) { // zgradaId
        var zgradaId = $routeParams.id;
        var stanovi = [];

        $rootScope.loaderActive = true;
        DataService.getZgrada($routeParams.id).then(
            function (result) {
                // on success
                $scope.obj = result.data;
                $rootScope.loaderActive = false;
                $scope.msg = "Pregled u zgrad " + $scope.obj.Naziv + ", " + $scope.obj.Adresa + ", " + $scope.obj.Mjesto;
                $scope.stanovi = $scope.obj.Stanovi;

                $scope.getData = function (PripadakIZgradaId) {
                    var o = {};
                    $scope.obj.Zgrade_Pripadci.forEach(function (pripadakIzZgrade) {
                        if (PripadakIZgradaId == pripadakIzZgrade.Id) {
                            o = pripadakIzZgrade;
                        }

                    });
                    var ret = { VrstaNaziv: o.VrstaNaziv, Naziv: o.Naziv, PovrsinaM2: o.PovrsinaM2, PovrsinaPosto: o.PovrsinaPosto };
                    return ret;
                }
            },
            function (result) {
                // on errr
                alert(result.Message);
                $rootScope.errMsg = result.Message;
            }
        );


        //var _zgrada = {};
        //DataService.getZgrade().then(function (zgrade) {
            //zgrade.forEach(function (zgrada) {
            //    if (zgradaId == zgrada.Id) {
            //        _zgrada = zgrada;
            //        $scope.msg = "Pregled u zgrad " + zgrada.Naziv + ", " + zgrada.Adresa + ", " + zgrada.Mjesto;
            //    }


            //})
            //DataService.getStanovi().then(function (result) {
            //    result.forEach(function (stan) {
            //        if (stan.ZgradaId == zgradaId)
            //            stanovi.push(stan);
            //    });
            //    $scope.stanovi = stanovi;
            //});

            
        //}
        //)


    }
}]);