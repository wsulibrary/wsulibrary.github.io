/**
 * Theme: Transparent
 * Type: textf
 */
angular.module('lapentor.marketplace.themes')
  .directive('hotspotCrystalTextf', function() {
    return {
      restrict: 'E',
      templateUrl: 'modules/lapentor.marketplace/themes/hotspot/crystal/tpl/textf.html',
      controllerAs: 'vm',
      controller: function($scope, $timeout, LptHelper, $rootScope) {
        var vm = this;
        vm.hotspot = $scope.hotspot;
        vm.onclick = togglePopover;
        vm.isShow = false;
        // console.log($scope.hotspot);
        ///////////////
        $scope.lptsphereinstance.addHotspotEventCallback(vm.hotspot.name, 'onclick', togglePopover);

        function togglePopover() {
          $timeout(function() {
            var isScenelistOff = $('#scenelist-crystal').hasClass('off');
            if ((!vm.isShow && !$rootScope.isScenelistOff) || (vm.isShow && $rootScope.isScenelistOff)) {
              $rootScope.$broadcast('evt.onsphereclick');
            }
            angular.element('#textf' + vm.hotspot.name).toggleClass('active');
            $('#icon-textf').toggleClass('active');
            vm.isShow = !vm.isShow;
          });
        }
      }
    };
  });
