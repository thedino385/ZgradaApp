angularApp.controller('pricuvaEditCtrl', ['$scope', '$rootScope', '$routeParams', '$location', '$uibModal', 'DataService',
    function ($scope, $rootScope, $routeParams, $location, $uibModal, DataService) {

        // $scope.pricuveZaZgraduSveGodine - sve godine za zgradu
        // $scope.pricuveZaZgraduGodina - jedna godina za zgradu

        $scope.SelectedGodina = '';
        var gList = [];
        var g = {};
        $scope.pricuveZaZgraduGodina = { KS: [] }; // ovo je object za izabranu godinu
        $scope.zgrada = {};

        $scope.godine = [];

        $scope.novaGodina = null; // godina koju user dodaje
        $scope.dodajGodinu = function () {
            if (isFinite($scope.novaGodina)) {
                // kreiraj prazan prihodRashod za Tvrtku i godinu
                DataService.createEmptyPricuva($scope.zgrada.Id, $scope.novaGodina).then(
                    function (result) {
                        $scope.pricuveZaZgraduGodina = result.data;
                        //$scope.obj.Status = 'a';
                        $scope.SelectedGodina = $scope.novaGodina
                        $scope.tableVisible = true;
                        g = { Godina: $scope.novaGodina };
                        $scope.godine.push(g);
                        //console.log(pricuveZaZgraduGodina);
                    },
                    function (result) {
                        // err
                    }

                )
            }
        }


        if ($routeParams) {
            $rootScope.loaderActive = true;
            DataService.getPricuva($routeParams.id).then(
                function (result) {
                    // on success
                    DataService.getZgrada($routeParams.id).then(
                        function (resultZgrada) {
                            $scope.zgrada = resultZgrada.data;
                            $scope.pricuveZaZgraduSveGodine = result.data; // ovo su sve godine selected zgrade
                            $rootScope.loaderActive = false;
                            if ($scope.pricuveZaZgraduSveGodine.length > 0) {
                                $scope.pricuveZaZgraduSveGodine.forEach(function (g) {
                                    g = { Godina: g.Godina };
                                    gList.push(g)
                                });
                                $scope.godine = gList;
                                $scope.SelectedGodina = $scope.pricuveZaZgraduSveGodine[$scope.pricuveZaZgraduSveGodine.length - 1].Godina;
                                $scope.pricuveZaZgraduGodina = $scope.pricuveZaZgraduSveGodine[$scope.pricuveZaZgraduSveGodine.length - 1]; // selektiraj zadnjega
                                $scope.tableVisible = true;
                            }
                            else {
                                $scope.tableVisible = false;
                            }
                        },
                        function (resultZgrada) {
                            alert('Greska kod dohvacanja podataka za zgradu');
                        },
                    )
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
                    // on errr - err kod pricuve
                    alert('Greska kod dohvacanja podataka za pricuvu');
                    $rootScope.errMsg = result.Message;
                }
            );
        }

        $scope.godinaChanged = function () {
            alert('ch');
            $scope.pricuveZaZgraduSveGodine.forEach(function (pr) {
                if (pr.Godina == $scope.SelectedGodina)
                    $scope.pricuveZaZgraduGodina = pr;
            });
        };

        
        //$scope.openMjesecno = function (mjesec) {
        //    if ($scope.SelectedGodina == '') {
        //        alert('Odaverite godinu');
        //        return;
        //    }

        //    var pricuvaMjesec = [];
        //    //$scope.zgrada.Zgrade_PricuvaMjesec.forEach(function (pricuva) {
        //    //    if (pricuva.Mjesec == mjesec && pricuva.Godina == $scope.godina)
        //    //        pricuvaMjesec = pricuva;
        //    //});

        //    if (pricuvaMjesec.length == 0) {
        //        DataService.createPricuvaZaMjesec($scope.zgrada.Id, $scope.godina, mjesec).then(
        //            function (result) {
        //                //console.log(result.data);
        //                //return result.data; // ovo je prazan mjesec
        //                openModal(result.data, mjesec);
        //            },
        //            function (result) {
        //                // err
        //                alert('err creating pricuva');
        //            }
        //        )
        //        //return CreatePricuvaZaMjesec(mjesec);
        //    }
        //    else
        //        openModal(pricuvaMjesec, mjesec);
        //};


        
        //function openModal(pricuvaMjesec, mjesec) {
        $scope.openMjesecno = function (mjesec) {
            if ($scope.SelectedGodina == '') {
                alert('Odaverite godinu');
                return;
            }
            var tempObj = {};
            angular.copy($scope.pricuveZaZgraduGodina, tempObj);
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
                    pricuveZaZgraduGodina: function () { 
                        return $scope.pricuveZaZgraduGodina;
                    },
                    zgrada: function () {
                        return $scope.zgrada;
                    },
                    godina: function () { return $scope.SelectedGodina; },
                    mjesec: function () { return mjesec; }
                }
            });

            modalInstance.result.then(function (item) {
                console.log("modal result fn");
                // sve se radi u modl controlleru
            }, function () {
                // modal dismiss
                angular.copy(tempObj, $scope.pricuveZaZgraduGodina);
            });
            //$scope.newItemStanar = { Id: 0, StanId: $routeParams.id, Ime: "", Prezime: "", OIB: "", Email: "", Udjel: 0, Vlasnik: false };
        }; // end of stanar modal

        //$scope.zbrojiDugove = function (stanId) {
        //    if ($scope.pricuveZaZgraduGodina.PricuvaMj == undefined)
        //        return;
        //    var dugObj = { dug: 0, color: 'red' };
        //    var dug = 0;
        //    $scope.pricuveZaZgraduGodina.PricuvaMj.forEach(function (rec) {
        //        if (rec.StanId == stanId)
        //            dug += parseFloat(rec.DugPretplata);
        //    });
        //    dugObj.dug = dug;
        //    if (dug >= 0)
        //        dugObj.color = 'green';
        //    return dugObj;
        //}

       

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
                templateUrl: '../app/pricuva/ksModal.html',
                controller: 'ksModalCtrl',
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

        // _________________________________________________________
        //                  izracuni


        $scope.MjesecnaZaduzenja = function (stanId) {
            // zbroj svih [Zaduzenje] za stanara u godini u mjesecnim pricuvama za zgradu (godina je vec odabrana)
            if ($scope.pricuveZaZgraduGodina.PricuvaMj == undefined)
                return;
            var mz = 0;
            //console.log(stanId);
            $scope.pricuveZaZgraduGodina.PricuvaMj.forEach(function (rec) {
                if (rec.StanId == stanId) {
                    mz += parseFloat(rec.Zaduzenje);
                    console.log('rec.Zaduzenje: ' +  rec.Zaduzenje);
                }

            });
            return mz;
        }

        $scope.SumaUplacenogUgodini = function (stanarId) {
            // ovo je suma KS[Uplata] u godini za stanara
            uplaceno = 0;
            $scope.pricuveZaZgraduGodina.KS.forEach(function (ks) {
                if (ks.StanarId == stanarId)
                    uplaceno += parseFloat(ks.Uplata);
            });
            return uplaceno;
        }
}]);