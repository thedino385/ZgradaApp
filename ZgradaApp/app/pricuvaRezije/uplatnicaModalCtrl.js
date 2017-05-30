angularApp.controller('uplatnicaModalCtrl', ['$scope', '$mdDialog', 'DataService', 'zgradaObj', 'mjesec', 'godina',
    function ($scope, $mdDialog, DataService, zgradaObj, mjesec, godina) {

        $scope.zgradaObj = zgradaObj;
        $scope.godina = godina;
        $scope.mjesec = mjesec;

        zgradaObj.PricuvaRezijeGodina.forEach(function (prGod) {
            if (prGod.Godina == godina) {
                prGod.PricuvaRezijeMjesec.forEach(function (prMj) {
                    if (prMj.Mjesec == mjesec)
                        $scope.PricuvaRezijeZaMjesec = prMj;
                });
            }
        });

        $scope.stanari = DataService.zgradaUseri;

        $scope.cancel = function () {
            $('nav').fadeIn();
            $mdDialog.cancel();
        };
    }]);