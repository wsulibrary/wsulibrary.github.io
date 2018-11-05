/**
 * Theme: default
 * Type: point
 */
angular.module('lapentor.marketplace.themes')
    .directive('hotspotDefaultPoint', function() {
        return {
            restrict: 'E',
            controller: function($scope, $state, $timeout) {
                var vm = this;
                vm.hotspot = $scope.hotspot;
                vm.project = $scope.project;
            }
        };
    });
