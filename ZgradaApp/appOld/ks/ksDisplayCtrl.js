angularApp.controller('ksDisplayCtrl', ['$scope', '$route', '$rootScope', '$routeParams', '$location', '$uibModal', 'toastr', 'DataService',
    function ($scope, $route, $rootScope, $routeParams, $location, $uibModal, toastr, DataService) {

        // $scope.pricuveZaZgraduSveGodine - sve godine za zgradu
        // $scope.pricuveZaZgraduGodina - jedna godina za zgradu
        if (DataService.selZgradaId == null) {
            $location.path('/zgrade');
            return;
        }

        $scope.SelectedGodina = '';
        $scope.zgrada = {};
        $scope.godine = [];
        var gList = [];
        $scope.novaGodina = null; // godina koju user dodaje

        $scope.dodajGodinu = function () {
            var ok = true;
            $scope.pricuveZaZgraduSveGodine.forEach(function (obj) {
                if (obj.Godina == $scope.novaGodina) {
                    toastr.error('Godina postoji!');
                    ok = false;
                }
            });
            if (!ok)
                return;

            if (isFinite($scope.novaGodina)) {
                // kreiraj prazan prihodRashod za Tvrtku i godinu
                DataService.createEmptyPricuva($scope.zgrada.Id, $scope.novaGodina).then(
                    function (result) {
                        $scope.pricuveZaZgraduGodina = result.data;
                        //$scope.obj.Status = 'a';
                        $scope.SelectedGodina = $scope.novaGodina
                        $scope.tableVisible = true;
                        $scope.godine.push($scope.novaGodina);
                        $scope.pricuveZaZgraduSveGodine.push(result.data);
                        $scope.novaGodina = '';
                    },
                    function (result) {
                        // err
                        toastr.error('Godina nije kreirana!', result.data);
                    }
                )
            }
        }


        //if ($routeParams) {
        $rootScope.loaderActive = true;
        DataService.getPricuva($routeParams.id).then(
            function (result) {
                // on success
                DataService.getZgrada(DataService.selZgradaId, false, false).then(
                    function (resultZgrada) {
                        $scope.zgrada = resultZgrada.data;
                        $scope.pricuveZaZgraduSveGodine = result.data; // ovo su sve godine selected zgrade
                        $rootScope.loaderActive = false;
                        if ($scope.pricuveZaZgraduSveGodine.length > 0) {
                            $scope.pricuveZaZgraduSveGodine.forEach(function (g) {
                                gList.push(g.Godina)
                            });
                            $scope.godine = gList;
                        }
                        else {
                            $scope.tableVisible = false;
                        }
                    },
                    function (resultZgrada) {
                        alert('Greska kod dohvacanja podataka za zgradu');
                    },
                )
            },
            function (result) {
                // on errr - err kod pricuve
                alert('Greska kod dohvacanja podataka za pricuvu');
                $rootScope.errMsg = result.Message;
            }
        );
        //}

        $scope.godinaChanged = function (godina) {
            $scope.SelectedGodina = godina;
            $scope.pricuveZaZgraduSveGodine.forEach(function (pr) {
                if (pr.Godina == $scope.SelectedGodina) {
                    $scope.pricuveZaZgraduGodina = pr;
                    $scope.tableVisible = true;
                }
            });
        };

        // _______________________________________________________________
        //      KS
        // _______________________________________________________________
        $scope.openKs = function (stanarId) {
            if ($scope.SelectedGodina == '') {
                alert('Odaverite godinu');
                return;
            }
            // za cancel event
            var tempObj = {};
            angular.copy($scope.pricuveZaZgraduGodina, tempObj);

            var modalInstance = $uibModal.open({
                templateUrl: '../app/ks/ksksModal.html',
                controller: 'ksksModalCtrl',
                size: 'lg',
                backdrop: 'static',
                keyboard: false,
                resolve: {
                    pricuveZaZgraduGodina: function () {
                        return $scope.pricuveZaZgraduGodina;
                    },
                    zgrada: function () {
                        return $scope.zgrada;
                    },
                    godina: function () { return $scope.SelectedGodina; },
                    stanarId: function () { return stanarId; },
                }
            });

            modalInstance.result.then(function (item) {
                console.log("modal result fn");
                // Save
                // ovdje ne moram nista radiit, modal controller vodi brigu o CRUD-u za KS

            }, function () {
                // modal dismiss = Cancel
                angular.copy(tempObj, $scope.pricuveZaZgraduGodina);
            });
        }; // end of ks modal

        $scope.save = function () {
            DataService.pricuvaCreateUpdate($scope.pricuveZaZgraduSveGodine).then(
                function (result) {
                    toastr.success('Promjene su snimljene!', '');
                },
                function (result) {
                    toastr.error('Greška kod snimanja!', '');
                }
            )
        }

        $scope.cancelReload = function () {
            $route.reload();
        }


    }]);