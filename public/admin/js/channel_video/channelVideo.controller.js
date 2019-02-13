angular.module('myApp').controller('channel_video',['$scope', '$http','Upload','notification','$uibModal','moment','$window','$rootScope',
    function ($scope,$http,Upload,notification,$uibModal,moment,$window,$rootScope) {
        $scope.channelDay={};
        $scope.channelDay.author=$window.localStorage.userName;
        $scope.videoLists = [ {videos: []}];
        $scope.addChannelday = function(){
            $http.post('http://localhost:8001/api/channel_video',{channelDay:$scope.channelDay,videos:$scope.videoLists[0].videos}).then(function (result) {
                notification.log('Success', { addnCls: 'humane-flatty-success' })
            },function () {

            })
        }
        $scope.$watch('videoLists', function(model) {

        }, true);
        // Model to JSON for demo purpose
        $scope.submit = function() {
            if ($scope.form.file.$valid && $scope.file) {
                $scope.upload($scope.file);
            }
        };
        $scope.showProgressBar = function(progress) {
            return true
        };
        // upload on file select or drop
        $scope.upload = function (file) {
            Upload.dataUrl(file, false).then(function(url){
                document.querySelector('#videoID').setAttribute("src",url);
            });
            Upload.upload({
                url: 'http://localhost:8001/api/channel_video/upload',
                data: {file: file}
            }).then(function (resp) {
                notification.log('Success', { addnCls: 'humane-flatty-success' })
                $scope.videoLists[0].videos.push({
                    name:resp.data.result.title,
                    id:resp.data.result.id,
                    dur:resp.data.result.dur,
                    order: 1
                });
                console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
            }, function (resp) {
                console.log('Error status: ' + resp.status);
            }, function (evt) {
                file.progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                console.log('progress: ' + file.progressPercentage + '% ' + evt.config.data.file.name);
            });
        };

        $scope.deleteVideo = function (index,video) {
            $scope.videoLists[0].videos.splice(index, 1)
            
        }
        
        function deleteVideoFromServer() {
            $http.delete('')
        }
        function getDate(d){
            return d.getDate()  + "-" + (d.getMonth()+1) + "-" + d.getFullYear()
        }
    }]);


