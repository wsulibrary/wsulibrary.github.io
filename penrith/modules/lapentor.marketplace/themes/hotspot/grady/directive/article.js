/**
 * Theme: grady
 * Type: article
 */
angular.module('lapentor.marketplace.themes')
    .directive('hotspotGradyArticle', function($uibModal) {
        return {
            restrict: 'E',
            controller: function($scope, $state, $timeout) {
                var vm = this;
                vm.hotspot = $scope.hotspot;
                vm.project = $scope.project;
                var modal = null;
                $scope.lptsphereinstance.addHotspotEventCallback(vm.hotspot.name, 'onclick', onclick);

                ///////////////

                // Goto target scene
                function onclick() {
                    modal = $uibModal.open({
                        templateUrl: 'modules/lapentor.marketplace/themes/hotspot/grady/tpl/article.html',
                        scope: $scope,
                        controller: function($scope, $uibModalInstance) {
                            $scope.cancel = function() {
                                $uibModalInstance.dismiss('cancel');
                            };
                        }
                    });
                }
            }
        };
    });
