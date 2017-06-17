angularApp.controller('templatesCtrl', ['$scope', '$route', '$routeParams', '$location', '$rootScope', 'toastr', 'DataService', '$mdDialog',
    function ($scope, $route, $routeParams, $location, $rootScope, toastr, DataService, $mdDialog) {

        if (DataService.selZgradaId == null) {
            $location.path('/index');
            return;
        }
        $scope.napomenaExpanded = false;

        $rootScope.loaderActive = true;
        DataService.getZgrada(DataService.selZgradaId, false, false).then(
            function (result) {
                // on success
                $rootScope.loaderActive = false;
                $scope.zgrada = result.data.Zgrada;
                $scope.msg = "Predlošci, zgrada: " + $scope.zgrada.Naziv + ', adresa ' + $scope.zgrada.Adresa + ', Mjesto ' + $scope.zgrada.Mjesto;
            },
            function (result) {
                // on errr
                $rootScope.loaderActive = false;
                alert(result.Message);
                $rootScope.errMsg = result.Message;
            }
        );

        var napomenaRendered = false;
        $scope.napomenaRacunZgrada = function () {
            $scope.napomenaExpanded == false ? $scope.napomenaExpanded = true : $scope.napomenaExpanded = false;
            if (!napomenaRendered) {
                $('#summernote').summernote();
                $('.note-btn').hide();
                $('.note-btn-bold').show();
            }
        }

        


        $scope.cancel = function (isPristine, ev) {
            toastr.info("Promjene nisu spremljene");
            $route.reload();
        }


        $scope.save = function () {
            $rootScope.loaderActive = true;
            $scope.zgrada.NapomenaRacun = $('#summernote').summernote('code');
            DataService.saveTeplates($scope.zgrada).then(
                function (result) {
                    toastr.success("Promjene su spremljene");
                    $rootScope.loaderActive = false;
                },
                function (resulr) {
                    toastr.error("Poreška kod snimanja!");
                    $rootScope.loaderActive = false;
                }
            )
        }

        //$scope.$on('$viewContentLoaded', function () {
        //    $('.summernote').summernote();
        //    $('.note-btn').hide();
        //    $('.note-btn-bold').show();
        //});

    }]);