angularApp.controller('sifarnikRashodaModalCtrl', ['$scope', '$mdDialog', 'DataService', 'sifarnikRashoda',
    function ($scope, $mdDialog, DataService, sifarnikRashoda) {

        $scope.sifarnikRashoda = sifarnikRashoda;
        console.log($scope.sifarnikRashoda);
        var tempObj = [];
        angular.copy($scope.sifarnikRashoda, tempObj);


        $scope.dodajRecord = function () {
            var maxId = 0;
            $scope.sifarnikRashoda.forEach(function (rec) {
                if (rec.Id > maxId)
                    maxId = rec.Id;
            })
            var noviRecord = {
                Id: maxId + 1, Naziv: '', Status: 'a', Active: true
            };
            $scope.sifarnikRashoda.push(noviRecord);
        }

      
        $scope.delete = function (Id) {
            // ako je obj.Id == 0, obrisi zadnji rec u kolekciji (nije u bazi)
            if ($scope.sifarnikRashoda.Id == 0) {
                $scope.sifarnikRashoda.forEach(function (rec) {
                    if (rec.Id == Id) {
                        var index = $scope.sifarnikRashoda.indexOf(rec)
                        $scope.sifarnikRashoda.splice(index, 1);
                    }
                });
            }
            // ako nije, ako je status 'a', brisi, u suprotnom stavi status na 'd'
            else {
                $scope.sifarnikRashoda.forEach(function (rec) {
                    if (rec.Id == Id) {
                        if (rec.Status == 'a') {
                            var index = $scope.sifarnikRashoda.indexOf(rec)
                            $scope.sifarnikRashoda.splice(index, 1);
                        }
                        else
                            rec.Status = 'd';
                    }
                })
            }
        }

        $scope.save = function () {
            // za sve ostale recorde, stavi status 'u'
            $scope.sifarnikRashoda.forEach(function (rec) {
                if (rec.Status == null)
                    rec.Status = 'u';
            })
            $mdDialog.hide($scope.sifarnikRashoda);
        };

        $scope.cancel = function () {
            $mdDialog.cancel(tempObj);
        };

    }]);