angular.module('myApp').controller('channel_video',['$scope', '$location', '$http','Upload','notification','$uibModal','moment','$window','$rootScope',
    function ($scope,$location,$http,Upload,notification,$uibModal,moment,$window,$rootScope) {
        $scope.channelDay={};
        $scope.channelDay.broadcast_day=moment().format('DD-MM-YYYY');
        $scope.channelDay.author=$window.localStorage.userName;
        $scope.videoLists = [];
        $scope.files=[]
        $scope.video={}
        //$scope.video.ads=false
        $scope.addChannelday = function(){
        
        function ordering(video, index){
                video.order = index;
            }
            $scope.videoLists.forEach(ordering)
            /*$http.post('http://5.196.74.69:8001/api/channel_video',{channelDay:$scope.channelDay,videos:$scope.videoLists[0].videos,files:$scope.files}).then(function (result) {
                console.log('contenue channelDay :  ',$scope.channelDay)
                console.log('contenue videos :  ',$scope.videoLists[0].videos)
                notification.log('Success', { addnCls: 'humane-flatty-success' })
                console.log('resultat d ajout :  ',result)
            },function () {

            })*/
            //console.log('channelDay done ',$scope.files)
            Upload.upload({
                url: 'http://188.165.194.82:8001/api/channel_video',
                data: {file: $scope.videoLists,details:{channelDay:$scope.channelDay}}

            }).then(function (resp) {
                notification.log('Success', { addnCls: 'humane-flatty-success' })
                $location.path('/hb7television/list');
            }, function (resp) {
            }, function (evt) {
                $scope.progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                console.log('progress: ' + $scope.progressPercentage + '% ' + evt.config.data.file.name);
            });


        }

        $scope.addVideoToAds=function (val,indx) {
            console.log("see ads",val)
            console.log("see indx",indx)
            $scope.videoLists[indx].ads=val
            console.log("see $scope.videoLists[0].videos[indx].ads ::",$scope.videoLists[indx].ads)


        }

        // Model to JSON for demo purpose

        $scope.showProgressBar = function(progress) {
            return true
        };

        $scope.$watch('videoLists', function(model) {
            console.log("videoLists :", angular.toJson(model, true));
        }, true);

        // upload on file select or drop
        $scope.upload = function (file) {
            if(file!=null){
                $scope.videoLists.push({
                    file:file,
                    name:file.name,
                    ads:false,
                    order:$scope.videoLists.length
                });
            }
            Upload.dataUrl(file, false).then(function(url){
                document.querySelector('#videoID').setAttribute("src",url);
            });
        };

        $scope.deleteVideo = function (index,video) {
            console.log('video Deleted: ' + video.name);
            $scope.videoLists.splice(index, 1)
            
        }
        
        function deleteVideoFromServer() {
            $http.delete('')
        }
        function getDate(d){
            return d.getDate()  + "-" + (d.getMonth()+1) + "-" + d.getFullYear()
        }
    }]);


