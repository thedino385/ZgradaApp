angularApp.controller('dodajOglasModalCtrl', ['$scope', '$mdDialog', 'toastr', 'DataService',  'id', 'oglasna',
    function ($scope, $mdDialog, toastr, DataService, id, oglasna) {

        var tempList = [];
        angular.copy(oglasna, tempList);
        if (id == 0) {
            $scope.oglas = {
                Id: 0, ZgradaId: DataService.selZgradaId, Datum: new Date(), Naslov: '', Oglas: '',
                UserId: DataService.userId, Status: 'a'
            };
            $scope.msg = 'Predaj oglas';
        }
        else {
            oglasna.forEach(function (o) {
                if (o.Id == id) {
                    o.Status = 'u';
                    $scope.oglas = o;
                }
            });
            $scope.msg = 'Uredi oglas';
        }

        $scope.save = function () {
            $('nav').fadeIn();
            $scope.oglas.Oglas = $('#summernote').summernote('code');
            console.log($scope.oglas);
            $mdDialog.hide($scope.oglas);
        };

        $scope.cancel = function (tempList) {
            $('nav').fadeIn();
            $mdDialog.cancel(oglasna);
        };

    }]);