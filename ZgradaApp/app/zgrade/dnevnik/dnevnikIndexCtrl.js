angularApp.controller('dnevnikIndexCtrl', ['$scope', '$rootScope', '$routeParams', '$location', '$mdDialog', 'DataService', function ($scope, $rootScope, $routeParams, $location, $mdDialog, DataService) {

    if (DataService.selZgradaId == null) {
        $location.path('/zgrade');
        return;
    }


    if ($routeParams && $routeParams.id > 0) {
        $scope.zgradaObj = DataService.currZgrada;
        $scope.useri = DataService.zgradaUseri;
        var mjeseci = [];
        $scope.zgradaObj.Zgrade_DnevnikRada.forEach(function (d) {
            if (d.Godina == DataService.dnevnikSelGodina && mjeseci.indexOf(d.Mjesec) == -1)
                mjeseci.push(d.Mjesec);
        });
        $scope.mjeseci = mjeseci;
        $scope.selectedGodina = DataService.dnevnikSelGodina;
        var godine = [];
        $scope.zgradaObj.Zgrade_DnevnikRada.forEach(function (d) {
            if (godine.indexOf(d.Godina) == -1)
                godine.push(d.Godina);
        });
        $scope.godine = godine;
    }
    else {

        $rootScope.loaderActive = true;
        DataService.getZgrada(DataService.selZgradaId).then(
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
        DataService.dnevnikSelGodina = god;
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
    //}

}]);