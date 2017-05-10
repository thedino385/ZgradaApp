angularApp.controller('dnevnikIndexCtrl', ['$scope', '$rootScope', '$routeParams', '$location', '$mdDialog', 'DataService', function ($scope, $rootScope, $routeParams, $location, $mdDialog, DataService) {


    if ($routeParams) {
        $rootScope.loaderActive = true;
        DataService.getZgrada($routeParams.id).then(
            function (result) {
                // on success
                $scope.zgradaObj = result.data.Zgrada;
                DataService.currZgrada = result.data.Zgrada;
                $scope.useri = result.data.Useri;
                DataService.userId = result.data.userId;
                $rootScope.loaderActive = false;

                var godine = [];
                $scope.zgradaObj.Zgrade_DnevnikRada.forEach(function (d) {
                    //if (mjeseci.indexOf(d.Mjesec) == -1)
                    //    mjeseci.push(d.Mjesec);
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


        $scope.godinaChanged = function (god) {
            var mjeseci = [];
            $scope.zgradaObj.Zgrade_DnevnikRada.forEach(function (d) {
                if(d.Godina == god && mjeseci.indexOf(d.Mjesec) == -1)
                    mjeseci.push(d.Mjesec);
            });
            $scope.mjeseci = mjeseci;
            $scope.selectedGodina = god;
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
    }

}]);