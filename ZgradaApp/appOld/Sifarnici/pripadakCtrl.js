﻿angularApp.controller('pripadakCtrl', ['$scope', '$routeParams', '$location', '$rootScope', 'DataService', function (
    $scope, $routeParams, $location, $rootScope, DataService) {

    if ($routeParams) {
        console.log($routeParams.id);

        if ($routeParams.id > 0) {
            $scope.msg = "Uredi pripdadak";
            //DataService.listPripadci.forEach(function (obj) {
            DataService.getPripadak($routeParams.id).then(
                function (result) {
                    // on success
                    $scope.obj = result.data;
                },
                function (result) {
                    // on error
                    alert(result.message);
                }
            )
        }
        else {
            $scope.msg = "Dodaj pripadak";
            $scope.obj = {
                Id: 0, Naziv: "", Oznaka: ""
            };
        }
    }

    $scope.save = function () {
        console.log('save fn');
        console.log($scope.obj);
        $rootScope.loaderActive = true;
        DataService.pripadakCreateUpdate($scope.obj).then(
            function (result) {
                // on success
                //if (result.data > 0) {
                    $scope.obj.Id = result.data; // insert, vrati Id sa servera, pukni u obj
                    //DataService.listPripadci.push($scope.obj); // dodaj u listu
                //}
                //else {
                //    DataService.listPripadci.forEach(function (obj) {
                //        if (obj.Id == result.data)
                //            DataService.listPripadci.obj = $scope.obj;
                //    })
                //}
                $rootScope.loaderActive = false;
                $location.path('/pripadci');
            },
            function (result) {
                // on error
                $rootScope.errMsg = result.Message;
            }
        )
    };

}]);