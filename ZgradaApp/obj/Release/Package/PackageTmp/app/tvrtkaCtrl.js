angularApp.controller('tvrtkaCtrl', ['$scope', '$rootScope', 'toastr', 'DataService', 'FileUploader', function ($scope, $rootScope, toastr, DataService, FileUploader) {

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

    // Upload stuff
    var uploader = $scope.uploader = new FileUploader({
        url: '../Upload/CompanyLogo'
    });

    // a sync filter
    uploader.filters.push({
        name: 'syncFilter',
        fn: function (item /*{File|FileLikeObject}*/, options) {
            console.log('syncFilter');
            return this.queue.length < 10;
        }
    });

    // an async filter
    uploader.filters.push({
        name: 'asyncFilter',
        fn: function (item /*{File|FileLikeObject}*/, options, deferred) {
            console.log('asyncFilter');
            setTimeout(deferred.resolve, 1e3);
        }
    });

    // CALLBACKS

    uploader.onWhenAddingFileFailed = function (item /*{File|FileLikeObject}*/, filter, options) {
        console.info('onWhenAddingFileFailed', item, filter, options);
    };
    uploader.onAfterAddingFile = function (fileItem) {
        console.info('onAfterAddingFile', fileItem);
    };
    uploader.onAfterAddingAll = function (addedFileItems) {
        console.info('onAfterAddingAll', addedFileItems);
    };
    uploader.onBeforeUploadItem = function (item) {
        console.info('onBeforeUploadItem', item);
    };
    uploader.onProgressItem = function (fileItem, progress) {
        console.info('onProgressItem', fileItem, progress);
    };
    uploader.onProgressAll = function (progress) {
        console.info('onProgressAll', progress);
    };
    uploader.onSuccessItem = function (fileItem, response, status, headers) {
        console.info('onSuccessItem', fileItem, response, status, headers);
        console.log('RECEIVED');
        console.log(response);
        console.log(status);
        if (response != null && response.logoNaziv != null) {
            toastr.success('Logo je snimljen.');
            $scope.tvrtka.Logo = response.logoNaziv + "?p=" + new Date().getMilliseconds();
            console.log($scope.tvrtka.Logo);
        }
        else
            toastr.error('Pogreška kod snimanja.');
    };
    uploader.onErrorItem = function (fileItem, response, status, headers) {
        console.info('onErrorItem', fileItem, response, status, headers);
    };
    uploader.onCancelItem = function (fileItem, response, status, headers) {
        console.info('onCancelItem', fileItem, response, status, headers);
    };
    uploader.onCompleteItem = function (fileItem, response, status, headers) {
        console.info('onCompleteItem', fileItem, response, status, headers);
    };
    uploader.onCompleteAll = function () {
        console.info('onCompleteAll');
    };

    console.info('uploader', uploader);

}]);