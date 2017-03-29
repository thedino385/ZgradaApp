angularApp.controller('pricuvaEditCtrl', ['$scope', '$route', '$rootScope', '$routeParams', '$location', '$uibModal', 'toastr', 'DataService',
    function ($scope, $route, $rootScope, $routeParams, $location, $uibModal, toastr, DataService) {

        // $scope.pricuveZaZgraduSveGodine - sve godine za zgradu
        // $scope.pricuveZaZgraduGodina - jedna godina za zgradu

        $scope.SelectedGodina = '';
        var gList = [];
        var g = {};
        //$scope.pricuveZaZgraduGodina = { KS: [], PricuvaGod_StanjeOd: [] }; // ovo je object za izabranu godinu
        $scope.zgrada = {};

        $scope.godine = [];

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
                                    gList.push(g.Godina)
                                });
                                $scope.godine = gList;
                                //$scope.SelectedGodina = $scope.pricuveZaZgraduSveGodine[$scope.pricuveZaZgraduSveGodine.length - 1].Godina;
                                //$scope.pricuveZaZgraduGodina = $scope.pricuveZaZgraduSveGodine[$scope.pricuveZaZgraduSveGodine.length - 1]; // selektiraj zadnjega
                                //$scope.tableVisible = true;
                                //farbajMjesece();
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

        $scope.godinaChanged = function (godina) {
            $scope.SelectedGodina = godina;
            $scope.pricuveZaZgraduSveGodine.forEach(function (pr) {
                if (pr.Godina == $scope.SelectedGodina) {
                    $scope.pricuveZaZgraduGodina = pr;
                    farbajMjesece();
                    $scope.tableVisible = true;
                }
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
                farbajMjesece();
                //switch (parseInt(mjesec))
                //{
                //    case 1:
                //        $scope.mjesec1background = 'green';
                //        break;
                //}
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


        $scope.IzracunajMjesecnaZaduzenja = function (stanId) {
            // zbroj svih [Zaduzenje] za stanara u godini u mjesecnim pricuvama za zgradu (godina je vec odabrana)
            if ($scope.pricuveZaZgraduGodina == undefined)
                return;
            var mz = 0;
            //console.log(stanId);
            $scope.pricuveZaZgraduGodina.PricuvaMj.forEach(function (rec) {
                if (rec.StanId == stanId) {
                    mz += parseFloat(rec.Zaduzenje);
                    //console.log('rec.Zaduzenje: ' +  rec.Zaduzenje);
                }

            });
            return mz;
        }

        $scope.SumaUplacenogUgodini = function (stanarId) {
            if ($scope.pricuveZaZgraduGodina == undefined)
                return;
            // ovo je suma KS[Uplata] u godini za stanara
            uplaceno = 0;
            $scope.pricuveZaZgraduGodina.KS.forEach(function (ks) {
                if (ks.StanarId == stanarId)
                    uplaceno += parseFloat(ks.Uplata);
            });
            return uplaceno;
        }

        $scope.IzracunajDugPretplatu = function (stanar) {
            if ($scope.pricuveZaZgraduGodina == undefined)
                return;
            // formula: Uplaceno + StanjeOd - MjZaduzenje
            var uplaceno = $scope.SumaUplacenogUgodini(stanar.Id);
            var mjZad = $scope.IzracunajMjesecnaZaduzenja(stanar.StanId);
            var stanje = 0;
            $scope.pricuveZaZgraduGodina.PricuvaGod_StanjeOd.forEach(function (stanjeOd) {
                if (stanjeOd.VlasnikId == stanar.Id) {
                    stanje = stanjeOd.StanjeOd;
                    //console.log('naso vlasnika');
                }

            });
            //console.log('IzracunajDugPretplatu');
            //console.log($scope.pricuveZaZgraduGodina.PricuvaGod_StanjeOd);
            //console.log(stanar);
            //console.log(uplaceno);
            //console.log(mjZad);
            //console.log(stanje);
            return (parseFloat(uplaceno) + parseFloat(stanje) - parseFloat(mjZad));
        }

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

        function farbajMjesece() {
            $scope.clsMjesec1 = 'transCellBack';
            $scope.clsMjesec2 = 'transCellBack';
            $scope.clsMjesec3 = 'transCellBack';
            $scope.clsMjesec4 = 'transCellBack';
            $scope.clsMjesec5 = 'transCellBack';
            $scope.clsMjesec6 = 'transCellBack';
            $scope.clsMjesec7 = 'transCellBack';
            $scope.clsMjesec8 = 'transCellBack';
            $scope.clsMjesec9 = 'transCellBack';
            $scope.clsMjesec10 = 'transCellBack';
            $scope.clsMjesec11 = 'transCellBack';
            $scope.clsMjesec12 = 'transCellBack';

            $scope.pricuveZaZgraduGodina.PricuvaMj.forEach(function (mj) {
                if (mj.Mjesec == 1 && mj.DugPretplata != 0) 
                    $scope.clsMjesec1 = 'greenCellBack';
                if (mj.Mjesec == 2 && mj.DugPretplata != 0)
                    $scope.clsMjesec2 = 'greenCellBack';
                if (mj.Mjesec == 3 && mj.DugPretplata != 0)
                    $scope.clsMjesec3 = 'greenCellBack';
                if (mj.Mjesec == 4 && mj.DugPretplata != 0)
                    $scope.clsMjesec4 = 'greenCellBack';
                if (mj.Mjesec == 5 && mj.DugPretplata != 0)
                    $scope.clsMjesec5 = 'greenCellBack';
                if (mj.Mjesec == 6 && mj.DugPretplata != 0)
                    $scope.clsMjesec6 = 'greenCellBack';
                if (mj.Mjesec == 7 && mj.DugPretplata != 0)
                    $scope.clsMjesec7 = 'greenCellBack';
                if (mj.Mjesec == 8 && mj.DugPretplata != 0)
                    $scope.clsMjesec8 = 'greenCellBack';
                if (mj.Mjesec == 9 && mj.DugPretplata != 0)
                    $scope.clsMjesec9 = 'greenCellBack';
                if (mj.Mjesec == 10 && mj.DugPretplata != 0)
                    $scope.clsMjesec10 = 'greenCellBack';
                if (mj.Mjesec == 11 && mj.DugPretplata != 0)
                    $scope.clsMjesec11 = 'greenCellBack';
                if (mj.Mjesec == 12 && mj.DugPretplata != 0)
                    $scope.clsMjesec12 = 'greenCellBack';
            });
        }
    }]);