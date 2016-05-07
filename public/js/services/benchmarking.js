bouncerApp.factory('benchmarking', function ($http, $interval) {

    
    var benchmarkingStats = {};
    var conn;

    var stopBenchmarking = function($scope){
            if (angular.isDefined($scope.Benchmarking)) {
                $interval.cancel($scope.Benchmarking);
                $scope.Benchmarking = undefined;
                timeCounter = 0;
                $scope.graphOff = true;
                $scope.benchmarkCompleted = true;
                //TODO: Final stats
                benchmarkingStats = {

                }
            }
        }



   return {
       onGraphLineClick: function($scope) {
          $scope.onClick = function (points, evt) {
              console.log(points, evt);
          };
       },

       resetGraph: function($scope) {
          $scope.reqPerSecLabels =['', '', '', '', '', '', ''];
          $scope.reqPerSecData = [
              [0,0,0,0,0,0,0]
          ];

          $scope.respTimeLabels =['', '', '', '', '', '', ''];
          $scope.respTimeData = [
              [0,0,0,0,0,0,0]
          ];

          $scope.statusLabels =['', '', '', '', '', '', ''];
          $scope.statusData = [
              [0,0,0,0,0,0,0]
          ];

          $scope.status404Labels =['', '', '', '', '', '', ''];
          $scope.status404Data = [
              [0,0,0,0,0,0,0]
          ];
       },

       updateGraph: function($scope){
          var timeCounter = 0;

          $scope.benchmarkCompleted = false;
          $scope.graphOff = false;
          this.resetGraph($scope);

          $scope.messages = [];
          conn = new WebSocket("ws://localhost:8080/ws");
          conn.onclose = function(e) {
              $scope.$apply(function(){
                  $scope.messages.push("DISCONNECTED");
              });
          };

          conn.onopen = function(e) {
              $scope.$apply(function(){
                  $scope.messages.push("CONNECTED");
              })
          };

          // called when a message is received from the server
          conn.onmessage = function(e){
              $scope.$apply(function(){
                var stats = JSON.parse(e.data);
                console.log(e.data);
               
                // Remove first element
                $scope.reqPerSecLabels.splice(0,1);
                $scope.reqPerSecData[0].splice(0,1);
                $scope.reqPerSecData[0].push(stats.totalReq); 
                $scope.reqPerSecLabels.push(stats.endTime);

                $scope.respTimeLabels.splice(0,1);
                $scope.respTimeData[0].splice(0,1);
                $scope.respTimeData[0].push(stats.avgRespTime); 
                $scope.respTimeLabels.push(stats.endTime);

                $scope.statusLabels.splice(0,1);
                $scope.statusData[0].splice(0,1);
                if (stats.statusCount.hasOwnProperty('200')) {
                  $scope.statusData[0].push(stats.statusCount["200"]); 
                }else{
                  $scope.statusData[0].push(0); 
                }
                $scope.statusLabels.push(stats.endTime);

                $scope.status404Labels.splice(0,1);
                $scope.status404Data[0].splice(0,1);
                if (stats.statusCount.hasOwnProperty('404')) {
                  $scope.status404Data[0].push(stats.statusCount["404"]); 
                }else{
                  $scope.status404Data[0].push(0); 
                }
                $scope.status404Labels.push(stats.endTime);
              });
          };
          $scope.send = function() {
              conn.send($scope.hostName);
              $scope.msg = "";
          }

       },

       closeConnection: function(){
        conn.send("quit");
       },

       getBenchmarkingStats: function($scope){
        return benchmarkingStats;
       }

   }
});