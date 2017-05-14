angularApp.controller('dnevnikDetailsCtrl', ['$scope', '$rootScope', '$location', '$mdDialog', '$routeParams', 'toastr', 'DataService',
    function ($scope, $rootScope, $location, $mdDialog, $routeParams, toastr, DataService) {

        if ($routeParams) {
            var zgradaObj = DataService.currZgrada;
            if (zgradaObj == null) {
                $location.path('/zgrade');
                return;
            }
            $scope.zgradaObj = zgradaObj;
            $scope.useri = DataService.zgradaUseri;
            console.log($scope.useri);

            if ($routeParams.id == 0) {
                $scope.obj = {
                    Id: 0, ZgradaId: zgradaObj.Id, Godina: new Date().getFullYear(), Mjesec: parseInt(new Date().getMonth()) + 1, Datum: new Date(),
                    Naslov: '', Opis: '', Odradjeno: false, UserId: DataService.userId, Zgrade_DnevnikRadaDetails: []
                };
                $scope.showNewbtn = true;
            }
            else {
                var lastAuthor = null;
                zgradaObj.Zgrade_DnevnikRada.forEach(function (dn) {
                    if (dn.Id == $routeParams.id) {
                        var target = dn;
                        target.Datum = new Date(dn.Datum);
                        $scope.obj = target;

                        dn.Zgrade_DnevnikRadaDetails.forEach(function (msg) {
                            lastAuthor = msg.UserId;
                        });
                    }
                });
                console.log(lastAuthor);
                if (lastAuthor == null || lastAuthor != DataService.userId)
                    $scope.showNewbtn = true;
                else
                    $scope.showNewbtn = false;
            }
        }


        $scope.newMsg = function (id, ev) {
            var o = { Id: 0, DnevnikRadaId: $scope.obj.Id, Datum: new Date(), Poruka: '', UserId: DataService.userId };
            if (id > 0) {
                $scope.obj.Zgrade_DnevnikRadaDetails.forEach(function (m) {
                    if (m.Id == id)
                        o = m;
                });
            }

            $mdDialog.show({
                controller: msgController,
                templateUrl: 'app/zgrade/dnevnik/msgModal.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true,
                fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
                , locals: {
                    o: o
                }
            })
                .then(function (o) {
                    if (o.Id == 0) {
                        if (o.Poruka != '')
                            $scope.obj.Zgrade_DnevnikRadaDetails.push(o);
                    }
                    else {
                        $scope.obj.Zgrade_DnevnikRadaDetails.forEach(function (m) {
                            if (m.Id == id)
                                m = o;
                        });
                    }


                    //if (msg != '') {
                    //    var o = { Id: 0, DnevnikRadaId: $scope.obj.Id, Datum: new Date(), Poruka: msg, UserId: DataService.userId };
                    //    $scope.obj.Zgrade_DnevnikRadaDetails.push(o);
                    //    console.log(o);
                    //}
                }
                , function () {
                    //alert('cancel je kliknut');
                });
        }

        $scope.save = function () {
            $rootScope.loaderActive = true;

            // ako je user promjenio mjesec u datepickeru, ispravi
            var mjesec = $scope.obj.Datum.getMonth();
            var godina = $scope.obj.Datum.getFullYear();

            $scope.obj.Mjesec = parseInt(mjesec) + 1;
            $scope.obj.Godina = godina;

            DataService.dnevnikRadaCreateOrUpdate($scope.obj).then(
                function (result) {
                    toastr.success("Podaci su snimljeni");
                    $location.path('/dnevnik/0');
                    $rootScope.loaderActive = false;
                },
                function (result) {
                    toastr.error("Snimanje nije uspjelo");
                    $rootScope.loaderActive = false;
                }
            )
        }

        $scope.cancel = function () {
            $location.path('/dnevnik/' + DataService.selGodina);
        }

        $scope.parseDate = function (d) {
            var date = new Date(d);
            return dodajNulu(date.getDate()) + '. ' + dodajNulu(date.getMonth() + 1) + '. ' + date.getFullYear() + '.';
        }

        function dodajNulu(d) {
            if (parseInt(d) < 10)
                return '0' + d;
            return d;
        }


        function msgController($scope, $mdDialog, o) {

            $scope.o = o;

            $scope.cancel = function () {
                $mdDialog.cancel();
            };

            $scope.saveMsg = function () {
                $mdDialog.hide($scope.o);
            };
        }



    }]);