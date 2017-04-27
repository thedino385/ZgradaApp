angularApp.controller('indexKsCtrl', ['$scope', '$mdDialog', 'zgradaObj', 'pdMaster',
    function ($scope, $mdDialog, zgradaObj, pdMaster) {

        $scope.zgradaObj = zgradaObj;

        zgradaObj.PricuvaRezijeGodina.forEach(function (prGod) {
            var godineList = [];
            $scope.zgradaObj.PricuvaRezijeGodina.forEach(function (pr) {
                godineList.push(pr.Godina);
            });
            //$scope.posedbiDijelovi = $scope.zgradaObj.Zgrade_PosebniDijeloviMaster;
            $scope.godine = godineList;
        });
        
        $scope.godinaChanged = function (godina) {
            $scope.selectedGodina = godina;
            $scope.tableVisible = true;
        }
    }]);