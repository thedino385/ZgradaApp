angularApp.controller('dnevnikIndexCtrl', ['$scope', '$rootScope', '$routeParams', '$location', '$window', '$mdDialog', 'DataService',
    function ($scope, $rootScope, $routeParams, $location, $window, $mdDialog, DataService) {

    if (DataService.selZgradaId == null) {
        $location.path('/zgrade');
        return;
    }
    $scope.selAllObj = { checked: false };
    //$scope.selectAll = false;

    if ($routeParams && $routeParams.id > 0) {
        $scope.zgradaObj = DataService.currZgrada;
        $scope.useri = DataService.zgradaUseri;
        var mjeseci = [];
        $scope.zgradaObj.Zgrade_DnevnikRada.forEach(function (d) {
            if (d.Godina == DataService.selGodina && mjeseci.indexOf(d.Mjesec) == -1)
                mjeseci.push(d.Mjesec);
        });
        $scope.mjeseci = mjeseci;
        $scope.selectedGodina = DataService.selGodina;
        var godine = [];
        $scope.zgradaObj.Zgrade_DnevnikRada.forEach(function (d) {
            if (godine.indexOf(d.Godina) == -1)
                godine.push(d.Godina);
        });
        $scope.godine = godine;
    }
    else {

        $rootScope.loaderActive = true;
        DataService.getZgrada(DataService.selZgradaId, false, true).then(
            function (result) {
                // on success
                $scope.zgradaObj = result.data.Zgrada;
                DataService.currZgrada = result.data.Zgrada;
                DataService.zgradaUseri = result.data.Useri;
                DataService.userId = result.data.userId;
                $scope.useri = result.data.Useri;
                $rootScope.loaderActive = false;
                $scope.msg = $scope.zgradaObj.Naziv + ' ' + $scope.zgradaObj.Adresa;

                var godine = [];
                $scope.zgradaObj.Zgrade_DnevnikRada.forEach(function (d) {
                    if (godine.indexOf(d.Godina) == -1)
                        godine.push(d.Godina);
                });
                $scope.godine = godine;

                // nakon snimanja, prikazi istu godinu da se ne mora birati
                if (DataService.selGodina != 0 && godine.indexOf(DataService.selGodina) != -1) {
                    var mjeseci = [];
                    $scope.selectedGodina = DataService.selGodina;
                    $scope.zgradaObj.Zgrade_DnevnikRada.forEach(function (d) {
                        if (d.Godina == DataService.selGodina && mjeseci.indexOf(d.Mjesec) == -1)
                            mjeseci.push(d.Mjesec);
                    });
                    $scope.mjeseci = mjeseci;
                }
            },
            function (result) {
                // on errr
                alert(result.Message);
                $rootScope.errMsg = result.Message;
            }
        );
    }

    $scope.godinaChanged = function (god) {
        var mjeseci = [];
        $scope.zgradaObj.Zgrade_DnevnikRada.forEach(function (d) {
            if (d.Godina == god && mjeseci.indexOf(d.Mjesec) == -1)
                mjeseci.push(d.Mjesec);
        });
        $scope.mjeseci = mjeseci;
        $scope.selectedGodina = god;
        DataService.selGodina = god;
    }

    $scope.gotoDetails = function (id) {
        $location.path('/dnevnikDetails/' + id);
    }

    $scope.parseDate = function (d) {
        var date = new Date(d);
        return dodajNulu(date.getDate()) + '. ' + dodajNulu(date.getMonth() + 1) + '. ' + date.getFullYear() + '.';
    }

    function parseDate(d) {
        var date = new Date(d);
        return dodajNulu(date.getDate()) + '. ' + dodajNulu(date.getMonth() + 1) + '. ' + date.getFullYear() + '.';
    }

    function dodajNulu(d) {
        if (parseInt(d) < 10)
            return '0' + d;
        return d;
    }

    $scope.getStatusText = function (odradjeno) {
        return odradjeno == true ? 'Zatvoren' : 'Otvoren';
    }

    $scope.getZadnjiOdgovor = function (dnevnikId) {
        var max = {};
        var maxId = 0;
        var user = '';
        $scope.zgradaObj.Zgrade_DnevnikRada.forEach(function (d) {
            if (d.Id == dnevnikId) {
                d.Zgrade_DnevnikRadaDetails.forEach(function (detail) {
                    if (detail.Id > maxId) {
                        maxId = detail.Id;
                        max = detail;
                    }
                });
            }
        });
        if (max.Id == undefined)
            return 'Nema poruka';
        $scope.useri.forEach(function (userObj) {
            if (userObj.Id == max.UserId)
                user = userObj.Ime + ' ' + userObj.Prezime;
        });
        return 'Zadnji odgovor: ' + user + ' dana ' + parseDate(max.Datum);
    }

    var selected = [];
    $scope.toggle = function (mj) {
        var idx = selected.indexOf(mj);
        if (idx > -1) {
            selected.splice(idx, 1);
        }
        else {
            selected.push(mj);
        }
        console.log(selected);
    };
    $scope.isChecked = function (mjesec) {
        return selected.indexOf(mjesec) > -1;
    };

    $scope.toggleAll = function () {
        selected = [];
        console.log($scope.selAllObj.checked);
        if (!$scope.selAllObj.checked) {
            $scope.zgradaObj.Zgrade_DnevnikRada.forEach(function (d) {
                if (d.Godina == $scope.selectedGodina && selected.indexOf(d.Mjesec) == -1)
                    selected.push(d.Mjesec);
            });
        }
        console.log(selected);
    }

    $scope.genPdf = function () {
        var o = { zgradaId: $scope.zgradaObj.Id, godina: $scope.selectedGodina, mjeseci: selected };
        $rootScope.loaderActive = true;
        DataService.genPdfDnevnik(o).then(
            function (result) {
                $window.open('../pdf/GetPdfDnevnik');
                $rootScope.loaderActive = false;
            },
            function (result) {
                $rootScope.loaderActive = false;
                toastr.error('Pogreška kod kreiranja izvještaja');
            }
        )
    }
}]);