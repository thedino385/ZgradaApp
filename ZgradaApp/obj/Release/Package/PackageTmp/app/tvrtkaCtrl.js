angularApp.controller('tvrtkaCtrl', ['$scope', '$rootScope', 'toastr', 'DataService', function ($scope, $rootScope, toastr, DataService) {

    var active = null;

    $rootScope.loaderActive = true;
    DataService.getTvrtka().then(
        function (result) {
            $scope.tvrtka = result.data;
            active = result.data.Active;
            $rootScope.loaderActive = false;
        },
        function (result) {
            $rootScope.loaderActive = false;
            toastr.error('Pogreška kod dohvaćanja podataka.');
        }
    )

    $scope.save = function () {
        $rootScope.loaderActive = true;
        $scope.tvrtka.Active = active;
        DataService.tvrtkaUpdate($scope.tvrtka).then(
            function (result) {
                $rootScope.loaderActive = false;
                toastr.success('Podaci su snimljeni.');
            },
            function (result) {
                $rootScope.loaderActive = false;
                toastr.error('Pogreška kod snimanja.');
            }
        )
    }

}]);