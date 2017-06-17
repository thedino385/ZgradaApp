angularApp.controller('useriModalCtrl', ['$scope', '$mdDialog', 'toastr', 'id', 'useri',
    function ($scope, $mdDialog, toastr, id, useri) {

        $scope.passwordAgain = '';
        var tempObj = [];
        angular.copy(useri, tempObj);
        if (id == 0) {
            $scope.user = {
                Id: 0, CompanyId: 0, Ime: '', Prezime: '', Email: '',
                MasterAcc: false, Stanarid: null, ZgradaId: null, Password: '', Status: 'a'
            };
            $scope.msg = 'Novi korisnik';
        }
        else {
            useri.forEach(function (user) {
                if (user.Id == id) {
                    user.Status = 'u';
                    $scope.user = user;
                }
            });
            $scope.user.Password = 'dummy'; // ako je postojeci nece se snimati, samo da frm bude validan
            $scope.passwordAgain = 'dummy';
            $scope.msg = 'Uredi korisnika';
        }

        $scope.save = function () {
            $('nav').fadeIn();
            if ($scope.user.Password != $scope.passwordAgain) {
                toastr.error('Lozinke nisu iste');
            }
            $mdDialog.hide($scope.user);
        };

        $scope.cancel = function () {
            $('nav').fadeIn();
            $mdDialog.cancel(tempObj);
        };

    }]);