/**
 * Created by mhasko on 8/28/17.
 */
(function () {
    'use strict';

    angular
        .module('csvModules',['gameObjects','services', "ngSanitize", "ngCsv"])
        .controller('csvCtrl', CsvCtrl)

    CsvCtrl.$inject = ['$scope', '$log', 'services'];
    function CsvCtrl($scope, $log, services){
        $scope.exportData = services.getExportDataObject();

        //This will be be the raw backing object for the app
        $scope.matchRawData = {};

        $scope.getMatchesForSummoner = getMatchesForSummoner;
        //$scope.saveAsCsv = saveAsCsv;


        function getMatchesForSummoner(sumName) {
            $scope.matchRawData = {};

            services.getSummonerDataFor(sumName).then(function successCallback(response) {
                //We have fetched data, stash it in the backing raw data object with the
                //  summoner's name as the key
                //$scope.matchesRawData=response.data.matches;
                getMatchData(response.data.matches);
            }, function errorCallback(response) {
                $scope.matchesRawData= 'err';
            })
        }

        function getMatchData(arrayOfMatches){
            angular.forEach(arrayOfMatches, function(match){

                services.getMatchDataFor(match.gameId).then(function successCall(response){
                    $scope.matchRawData[match.gameId] = response.data
                },function errorCallback(response) {
                    $scope.matchRawData[match.gameId] = 'err';
                });
            })
        }

        //Utility function to create an array of one value from an array of objects.
        function createArrayOfParam(dataObject, param){
            var array = [];
            angular.forEach(dataObject, function(obj){
                array.push(obj[param]);
            });
            return array;
        }
    }
})();