angularApp.controller('pricuvaEditCtrl', ['$scope', '$rootScope', '$routeParams', '$location', '$uibModal', 'DataService',
    function ($scope, $rootScope, $routeParams, $location, $uibModal, DataService) {

        $scope.godina = 2017;

        if ($routeParams) {
            $rootScope.loaderActive = true;
            DataService.getZgrada($routeParams.id).then(
                function (result) {
                    // on success
                    $scope.zgrada = result.data;
                    $rootScope.loaderActive = false;

                    // sa servera stile lista pricuva (zaduzenja) po mjesecima
                    // za godisnji view potrebno je pozbrajati property-je - to jos ne znam kako
                    // ako je kolekcija prazna, nemoj nista ispisivati
                    // kad se kreira picuva za mjesec, view ce se napuniti (po mogucnosti, zbrajanje raditi u view-u)
                    // ako je kolekcija prazna, kreiraj na serveru praznu listu za kliknuti mjesec

                    // old
                    // ovdje provjeriti postoji li record za ZgradaId i Godinu u zgrada.Zgrade_Pricuva. Ako
                    // ne potoji, kreiraj ga
                    //getpricuvaZaGodinu($routeParams.id, 2017);
                },
                function (result) {
                    // on errr
                    $rootScope.errMsg = result.Message;
                }
            );
        }

        function CreatePricuvaZaMjesec(mjesec) {
            DataService.createPricuvaZaMjesec($scope.zgrada.Id, $scope.godina, mjesec).then(
                function (result) {
                    //console.log("finished" + result.data);
                    return result.data; // ovo je prazan mjesec
                },
                function (result) {
                    // err
                    alert('err creating pricuva');
                }
            )
        }

        $scope.openMjesecno = function (mjesec) {
            var pricuvaMjesec = [];
            $scope.zgrada.Zgrade_PricuvaMjesec.forEach(function (pricuva) {
                if (pricuva.Mjesec == mjesec && pricuva.Godina == $scope.godina)
                    pricuvaMjesec = pricuva;
            });

            if (pricuvaMjesec.length == 0) {
                DataService.createPricuvaZaMjesec($scope.zgrada.Id, $scope.godina, mjesec).then(
                    function (result) {
                        //console.log(result.data);
                        //return result.data; // ovo je prazan mjesec
                        openModal(result.data, mjesec);
                    },
                    function (result) {
                        // err
                        alert('err creating pricuva');
                    }
                )
                //return CreatePricuvaZaMjesec(mjesec);
            }
            else
                openModal(pricuvaMjesec, mjesec);
        };


        //$scope.newItemStanar = { Id: 0, StanId: $routeParams.id, Ime: "", Prezime: "", OIB: "", Email: "", Udjel: 0, Vlasnik: false }
        //$scope.openModal = function (mjesec) {
        function openModal(pricuvaMjesec, mjesec) {

            var modalInstance = $uibModal.open({
                templateUrl: '../app/pricuva/pricuvaMjesecModal.html',
                //controller: function ($scope, $uibModalInstance, item) {
                //    $scope.item = item;
                //},
                controller: 'pricuvaMjesecModalCtrl',
                size: 'lg',
                backdrop: 'static',
                keyboard: false,
                resolve: {
                    pricuvaMjesec: function () {
                        return pricuvaMjesec;
                    },
                    zgrada: function () {
                        return $scope.zgrada;
                    },
                    godina: function () { return $scope.godina; },
                    mjesec: function () { return mjesec; }
                }
            });

            modalInstance.result.then(function (item) {
                console.log("modal result fn");
                if (item.Id == 0) {
                    // add new
                    var maxId = 0;
                    $scope.zgrada.Zgrade_PricuvaMjesec.forEach(function (obj) {
                        if (obj.Id > maxId)
                            maxId = obj.Id;
                    });
                    item.Id = maxId + 1;
                    $scope.zgrada.Zgrade_PricuvaMjesec.push(item);
                    item.Status = "a";
                }
                else {
                    $scope.zgrada.Zgrade_PricuvaMjesec.forEach(function (obj) {
                        if (obj.Id == item.Id)
                            obj = item;
                    });
                item.Status = "u";
                }

            }, function () {
                // modal dismiss
                //if (item.Id > 0) {
                //    // vrati objekt u prethodno stanje (tempObj)
                //    $scope.stan.Stanovi_Stanari.forEach(function (stanar) {
                //        if (stanar.Id == item.Id) {
                //            stanar.Ime = tempObj.Ime;
                //            stanar.Prezime = tempObj.Prezime;
                //            stanar.OIB = tempObj.OIB;
                //            stanar.Email = tempObj.Email;
                //            stanar.Udjel = tempObj.Udjel;
                //            stanar.Vlasnik = tempObj.Vlasnik;
                //        }

                //    });
                //}
            });
            //$scope.newItemStanar = { Id: 0, StanId: $routeParams.id, Ime: "", Prezime: "", OIB: "", Email: "", Udjel: 0, Vlasnik: false };
        }; // end of stanar modal

        
}]);