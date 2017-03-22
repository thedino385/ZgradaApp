angularApp.controller('pricuvaEditCtrl', ['$scope', '$rootScope', '$routeParams', '$location', '$uibModal', 'DataService',
    function ($scope, $rootScope, $routeParams, $location, $uibModal, DataService) {
        console.log($routeParams.id);
        if ($routeParams) {
            $rootScope.loaderActive = true;
            DataService.getZgrada($routeParams.id).then(
                function (result) {
                    // on success
                    $scope.zgrada = result.data;
                    $rootScope.loaderActive = false;

                    // ovdje provjeriti postoji li record za ZgradaId i Godinu u zgrada.Zgrade_Pricuva. Ako
                    // ne potoji, kreiraj ga
                    getpricuvaZaGodinu($routeParams.id, 2017);
                },
                function (result) {
                    // on errr
                    $rootScope.errMsg = result.Message;
                }
            );
        }

        function getpricuvaZaGodinu(zgradaId, godina)
        {
            $scope.pricuvaList = [];
            var pricuvaList = [];
            $scope.zgrada.Zgrade_Pricuva.forEach(function (p) {
                if (p.Godina == godina)
                    pricuvaList.push(p);
            });

            if ($scope.pricuvaList.length == 0) {
                DataService.createPricuva(zgradaId, godina).then(
                    function (result) {
                        // success
                        //$scope.pricuvaObj = result.data;
                        //console.log($scope.pricuvaObj);
                        $scope.pricuvaList = nadjiVlasnike(result.data);

                    },
                    function (result) {
                        // err
                        alert('cannot create empty pricuva');
                    }
                )
            }
            else
                $scope.pricuvaList = nadjiVlasnike(pricuvaList);
        }

        function nadjiVlasnike(pricuvaList) {
            pricuvaList.forEach(function (obj) {
                $scope.zgrada.Stanovi.forEach(function (stan) {
                    if (stan.Id == obj.StanId) {
                        stan.Stanovi_Stanari.forEach(function (stanar) {
                            if (stanar.Vlasnik == true) {
                                var s = stanar.Ime + " " + stanar.Prezime;
                                console.log(s);
                                obj.ImePrezime = s;
                                obj.VlasnikId = stanar.Id;
                            }
                        });
                    }
                })
            });
            return pricuvaList;
        }


        $scope.nadjiVlasnika = function (stanId) {
            $scope.zgrada.Stanovi.forEach(function (stan) {
                if (stan.Id == stanId) {
                    stan.Stanovi_Stanari.forEach(function (stanar) {
                        if (stanar.Vlasnik == true) {
                            var s = stanar.Ime + " " + stanar.Prezime;
                            console.log(s);
                            return s;
                        }
                    });
                }
            })
        }

        
}]);