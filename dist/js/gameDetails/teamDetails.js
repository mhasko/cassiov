/**
 * Created by mhasko on 6/3/17.
 */
(function(){
    'use strict'

    angular
        .module('gameObjects')
        .directive('teamDetails', TeamDetails);

    TeamDetails.$inject = [];
    function TeamDetails() {
        var directive = {
            restrict: 'E',
            scope:{
                gameid: '=',
                team:'=',
                searchedTeam:'=',
                side:'=',
                participants:"=",
                participantids:"=",
            },
            templateUrl: 'js/gameDetails/teamDetails.html',
            controller:TeamDetailsCtrl
        }
        return directive;
    }

    TeamDetailsCtrl.$inject = ['$filter', '$scope', 'services'];
    function TeamDetailsCtrl($filter, $scope, services){
        $scope.updateExportObject = updateExportObject;


        function getChampInfo(sum){
            services.getChampDataForId(sum.championId).then(function(response){
                sum['champLink'] = getIconLink(response.data.image.full)
            },function(response){});
        }

        function getIconLink(rawName){
            //TODO define img url prefix
            return "img/champion/"+rawName;
        }
        function init(){
            $scope.summoners = [];
            $scope.sideString = $scope.side === 100 ? 'Blue Side' : 'Red Side';
            angular.forEach($scope.participants, function(part){
                if($scope.side === part.teamId){
                    var id = $filter('filter')($scope.participantids, {participantId: part.participantId},true)[0]
                    part['summonerName'] = id.player.summonerName;
                    part['summonerId'] = id.player.summonerId;
                    part['champLink'] = "img/champion/unknown.png";
                    //getChampInfo(part);

                    $scope.summoners.push(part);
                }
            })
        }

        function updateExportObject(sum){
            sum.csvid = $scope.gameid + "-" + sum.summonerId;
            if(sum.selectedData){
                //Create the csvdata row for this user-game

                //add this csvdata row to the export object
                $scope.updateExportObject.push()
            } else {
                //Find the csvdata row using the csvid and remove it.
                //This is done by doing a filter for all objects in the array that do not
                //  have the csvid and setting that as the new array

            }
        }

        init();
    }
})();