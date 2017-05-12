angularApp.controller('indexUseriCtrl', ['$scope', '$rootScope', '$location', '$route', 'toastr', '$mdDialog', 'DataService',
    function ($scope, $rootScope, $location, $route, toastr, $mdDialog, DataService) {

    $rootScope.loaderActive = true;
    DataService.getUseri().then(
        function (result) {
            $scope.useri = result.data;
            $rootScope.loaderActive = false;
        },
        function (result) {
            toastr.error('Greška kod dohvačanja podataka');
        }
    )

    $scope.openModal = function (id, ev) {
        $mdDialog.show({
            controller: 'useriModalCtrl',
            templateUrl: 'app/useri/useriModal.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
            , locals: {
                id: id,
                useri: $scope.useri
            }
        }).then(function (user) {
            DataService.editUser(user).then(
                function (result) {
                    toastr.success('Podaci su snimljeni.');
                    $route.reload();
                },
                function (result) {
                    toastr.error('Pogreška kod snimanja.');
                }
            )
        }, function (useri) {
            // cancel
            $scope.useri = useri;
        });
    }


    $scope.openModalPass = function (id, ev) {
        $mdDialog.show({
            controller: 'useriModalPassCtrl',
            templateUrl: 'app/useri/useriModalPass.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: false,
            fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
            , locals: {
                id: id,
            }
        }).then(function (pass) {
            DataService.editUserPass(user).then(
                function (result) {
                    toastr.success('Podaci su snimljeni.');
                    //$route.reload();
                },
                function (result) {
                    toastr.error('Pogreška kod snimanja.');
                }
            )
        }, function () {
            // cancel
        });
    }

}]);