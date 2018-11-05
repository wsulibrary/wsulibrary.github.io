/**
 * Theme: default
 * Type: video
 */
angular.module('lapentor.marketplace.themes')
    .directive('hotspotDefaultVideo', function($uibModal) {
        return {
            restrict: 'E',
            controller: function($scope, $state, $sce) {
                var vm = this;
                var modal = null;
                $scope.lptsphereinstance.addHotspotEventCallback($scope.hotspot.name, 'onclick', onclick);

                ///////////////

                // Goto target scene
                function onclick() {
                    modal = $uibModal.open({
                        templateUrl: 'modules/lapentor.marketplace/themes/hotspot/default/tpl/video.html',
                        scope: $scope,
                        controllerAs: 'vm',
                        controller: function($scope, $uibModalInstance, $filter) {
                            var vm = this;
                            vm.hotspot = $scope.hotspot;
                            vm.cancel = function() {
                                $uibModalInstance.dismiss('cancel');
                            };
                            if ($filter('parseEmbed')(vm.hotspot.src)) {
                                vm.hotspot.src = $filter('parseEmbed')(vm.hotspot.src);
                                vm.hotspot.src = $sce.trustAsHtml(vm.hotspot.src);
                            }
                        }
                    });
                }
            }
        };
    });
