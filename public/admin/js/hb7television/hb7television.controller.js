angular.module('myApp').controller('hb7Ctr',['$scope', '$http','Upload','notification','$uibModal','moment', function ($scope,$http,Upload,notification,$uibModal,moment) {
    getEventsByDate();
    $scope.navigatorConfig = {
        selectMode: "day",
        showMonths: 3,
        skipMonths: 3,
        onTimeRangeSelected: function(args) {
            $scope.weekConfig.startDate = args.day;
            $scope.dayConfig.startDate = args.day;
            getEventsByDate(args.day)
        }
    };
    function getEventsByDate(date){
        var data = {'date': date?date:new Date()};
        $http.post("http://localhost:8001/api/hb7television/events", data).then(function (response,data, status, headers, config,file) {
            $scope.events=response.data;
            //notification.log('Channels successfully added', { addnCls: 'humane-flatty-success' });
            //console.log("data",response)

        },function (data, status, headers, config) {
            notification.log('Something Wrong', { addnCls: 'humane-flatty-error' });
        });
    }

    $scope.dayConfig = {
        locale: "fr-fr",
        viewType: "Day",
        visible:false,
        businessBeginsHour:0,
        businessEndsHour:0,
        durationBarVisible : true,
        durationBarMode : "PercentComplete",
        eventResizeHandling:"Disabled",
        eventMoveHandling: "Disabled",
        onEventClicked: function (args) {
            console.log("Event clicked: " + args.e.start());
            $scope.modalHB7(args.e)
        },
    };
    $scope.weekConfig = {
        locale: "fr-fr",
        viewType: "Week",
        durationBarVisible : true,
        businessBeginsHour:0,
        businessEndsHour:0,
        durationBarMode : "PercentComplete",
        eventMoveHandling: "Disabled",
        eventResizeHandling:"Disabled",
        onEventClicked: function (args) {
            console.log("Event clicked: " + args.e.start());
            $scope.modalHB7(args.e)
        },
        timeRangeSelectedHandling: "Enabled",
        onTimeRangeSelected: function (args) {
            console.log("eeee :" + JSON.stringify(args))

        },
    };

    $scope.showDay = function() {
        $scope.dayConfig.visible = true;
        $scope.weekConfig.visible = false;
    };

    $scope.showWeek = function() {
        $scope.dayConfig.visible = false;
        $scope.weekConfig.visible = true;
    };
    function secondsToHms(d) {
        d = Number(d);
        var h = Math.floor(d / 3600);
        var m = Math.floor(d % 3600 / 60);
        var s = Math.floor(d % 3600 % 60);

        var hDisplay = h > 0 ? h + (h == 1 ? " heur, " : " heurs, ") : "";
        var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
        var sDisplay = s > 0 ? s + (s == 1 ? " seconde" : " secondes") : "";
        return hDisplay + mDisplay + sDisplay;
    }
    $scope.modalHB7 = function (eventVideo) {

        console.log("dddddddddddddddddddd",eventVideo.data)
        var modalInstance = $uibModal.open({
            template: '<div class="modal-header">'+
                '<h5 class="modal-title">Information de la video</h5>'+
                '</div>'+
                '<div class="container modal-body">'+
                '<table class="table">\n' +

                '  <tbody>\n' +
                '    <tr>\n' +
                '      <th scope="row" >titre</td>\n' +
                '      <td>'+eventVideo.data.text+'</td>\n' +
                '    </tr>\n' +
                '    <tr>\n' +
                '      \n' +
                '      <th scope="row">date de diffusion</td>\n' +
                '      <td>'+moment(new Date(eventVideo.data.dateBroadcast)).format("DD-MM-YYYY")+'</td>\n' +
                '    </tr>\n' +
                '    <tr>\n' +
                '      <th scope="row">heur de début</td>\n' +
                '      <td>'+moment(new Date(eventVideo.data.start)).format("HH:mm:ss")+'</td>\n' +
                '    </tr>\n' +
                '    <tr>\n' +
                '      <th scope="row">heur de fin</td>\n' +
                '      <td>'+moment(new Date(eventVideo.data.end)).format("HH:mm:ss")+'</td>\n' +
                '    </tr>\n' +
                '    <tr>\n' +
                '      <th scope="row">Durée</td>\n' +
                '      <td>'+ secondsToHms(eventVideo.data.duration)+'</td>\n' +
                '    </tr>\n' +
                '    <tr>\n' +
                '      <th scope="row">description</td>\n' +
                '      <td>'+eventVideo.data.description+'<td>\n' +
                '    </tr>\n' +
                '    <tr>\n' +
                '      <th scope="row">path</td>\n' +
                '      <td>'+eventVideo.data.absolutPath+'<td>\n' +
                '    </tr>\n' +
                '  </tbody>\n' +
                '</table>'+
                '</div>'+
                '<div class="modal-footer">'+
                '<button class="btn btn-default" type="button" ng-click="ok()">fermer</button>'+
                '</div>',
            controller: ('hb7Ctr', ['$scope', '$uibModalInstance', 'confirmClick', 'confirmMessge',
                function ($scope, $uibModalInstance, confirmClick, confirmMessge) {

                    $scope.confirmMessage = confirmMessge;

                    function closeModal() {

                        $uibModalInstance.dismiss('cancel');

                    }

                    $scope.ok = function () {

                        closeModal();
                    }

                    $scope.cancel = function () {
                        closeModal();
                    }

                }]),
            size: 'lg',
            windowClass: 'confirm-window',
            resolve: {
                confirmClick: function () {
                    return $scope.ngConfirm;
                },
                confirmMessge: function () {
                    return $scope.ngConfirmMessage;
                }
            }
        });
    }
/*    $scope.lists = [
        {
            label: "Men",
            people: [
                {name: "Bob", type: "man"},
                {name: "Charlie", type: "man"},
                {name: "Dave", type: "man"}
            ]
        },

    ];

    // Model to JSON for demo purpose
    $scope.submit = function() {
        if ($scope.form.file.$valid && $scope.file) {
            $scope.upload($scope.file);
        }
    };

    // upload on file select or drop
    $scope.upload = function (file) {
        Upload.upload({
            url: 'http://localhost:8001/api/hb7television/upload',
            data: {file: file, 'username': 'iiiiii'}
        }).then(function (resp) {
            console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
        }, function (resp) {
            console.log('Error status: ' + resp.status);
        }, function (evt) {
            file.progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            console.log('progress: ' + file.progressPercentage + '% ' + evt.config.data.file.name);
        });
    };
    // for multiple files:*/

}]);