angularApp.controller('stanoviCtrl', ['$scope', '$location', '$routeParams', '$rootScope', '$window', 'DataService',
    function ($scope, $location, $routeParams, $rootScope, $window, DataService) {

        if ($routeParams) { // zgradaId
            console.log($routeParams.id);

            DataService.selectedZgradaId = $routeParams.id;
            DataService.listZgrade.forEach(function (zgrada) {
                if (zgrada.Id == $routeParams.id)
                    $scope.zgrada = zgrada;
            });

            //if (DataService.listStanovi.length == 0) {
            //    $rootScope.loaderActive = true;
            //    DataService.getStanovi().then(
            //        function (result) {
            //            // on success
            //            DataService.listStanovi = result.data; // skinut ce se svi stanovi (za sve zgrade)
            //            $rootScope.loaderActive = false;
            //            getStanoviFromZgrada($routeParams.id);
            //        },
            //        function (result) {
            //            // on errr
            //            $rootScope.errMsg = result.Message;
            //        }
            //    )
            //}
            //else {
            //    getStanoviFromZgrada($routeParams.id);
            //}


            //function getStanoviFromZgrada(zgradaId) {
            //    var stanovi = [];
            //    DataService.listStanovi.forEach(function (stan) {
            //        if (stan.ZgradaId == zgradaId)
            //            stanovi.push(stan);
            //        $scope.stanovi = stanovi;
            //    });
            //}

            var zgradaId = $routeParams.id;
            var stanovi = [];
            DataService.getStanovi().then(function (result) {
                result.forEach(function (stan) {
                    if (stan.ZgradaId == zgradaId)
                        stanovi.push(stan);
                });
                $scope.stanovi = stanovi;
            });

            $scope.noviStan = function () {
                $location.path('/stan/0');
            };

            $scope.edit = function (obj) {
                $location.path('/stan/' + obj.Id);
            }
        }
    }]);