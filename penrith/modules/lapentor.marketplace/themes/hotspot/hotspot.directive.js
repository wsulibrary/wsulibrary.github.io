/**
 * Define <hotspot> directive that generate hotspot base on theme and add it into scene
 * $scope here will pass down to all hotspot theme child directive
 */
angular.module('lapentor.marketplace.themes')
    .directive('hotspot', function($compile, $sce, $timeout, $window, $uibModal, $rootScope, LptHelper, ngAudio, Alertify) {
        return {
            restrict: 'E',
            scope: {
                scene: '=', // current loaded scene
                hotspot: '=',
                project: '=', // all project data
                lptsphereinstance: '=' // lptSphere instance to manipulate sphere
            },
            link: function(scope, element, attrs) {
                var myAudio = null,
                    thisHotspot = scope.hotspot;
                var myAudioPlay = false;
                var loop = 0;
                // Register hotspot GLOBAL method
                scope.loadScene = loadScene;
                scope.addHotspotToViewer = addHotspotToViewer;
                scope.config = scope.project.theme_hotspot.config;

                scope.onHotspotClick = onHotspotClick;

                if (angular.isUndefined(scope.project.theme_hotspot.slug)) scope.project.theme_hotspot.slug = "default";
                // Force init config as Object
                if (angular.isUndefined(scope.project.theme_hotspot.config)) scope.project.theme_hotspot.config = {};

                // Register hotspot GLOBAL properties
                scope.hotspot.name = 'lptHotspot' + scope.hotspot._id;
                scope.themePath = LptHelper.makeUrl(Config.THEME_PATH, 'hotspot', scope.project.theme_hotspot.slug);

                element.empty();

                $rootScope.$on('evt.krpano.hp' + thisHotspot.name, function() {
                    scope.lptsphereinstance.set('hotspot', {
                        name: thisHotspot.name,
                        "sprite.id": "sprite-" + thisHotspot.name
                    });
                    generateDirective(scope.project.theme_hotspot.slug);
                })
                $timeout(function() {
                    // Only generate directive if hotspot have UI layout
                    generateDirective(scope.project.theme_hotspot.slug);
                    // sound hotspot no need for theme
                    if (thisHotspot.type == 'sound') {
                        var loop = (thisHotspot.is_loop == 1) ? 'loop' : '';
                        var soundTemplate = '<audio id="sound-' + thisHotspot._id + '" autoplay ' + loop + '><source src="' + thisHotspot.src + '" type="audio/mpeg"></audio>';
                        element.empty();
                        element.append($compile(soundTemplate)(scope));
                        myAudio = document.getElementById('sound-' + thisHotspot._id);
                        init();
                    }

                    // Add default behaviour for all point hotspot
                    switch (thisHotspot.type) {
                        case 'point':
                            scope.lptsphereinstance.addHotspotEventCallback(thisHotspot.name, 'onclick', function() {
                                if (thisHotspot.target_scene_id) {
                                    var targetScene = LptHelper.getObjectBy('_id', thisHotspot.target_scene_id, scope.project.scenes);
                                    if (thisHotspot.target_view) {
                                        targetScene.target_view = thisHotspot.target_view;
                                    }
                                    $rootScope.$emit('evt.livesphere.changescene', targetScene);
                                }
                            });
                            break;
                        case 'url':
                            // Attach events to this hotspot
                            scope.lptsphereinstance.addHotspotEventCallback(thisHotspot.name, 'onclick', function() {
                                _onUrlHotspotClick();
                            });
                        case 'article':
                            scope.hotspot.content = $sce.trustAsHtml(scope.hotspot.content);
                            break;
                        case 'textf':
                            scope.hotspot.content = $sce.trustAsHtml(scope.hotspot.content);
                            break;
                    }
                }, 100);

                // Load style
                // if (angular.isDefined(scope.project.theme_hotspot) && angular.isDefined(scope.project.theme_hotspot.slug)) {
                //     loadThemeStyle(scope.project.theme_hotspot.slug);
                // } else {
                //     loadThemeStyle('default');
                // }

                // Add hotspot to sphere viewer
                // loadThemeStyle(scope.project.theme_hotspot.slug);

                function init() {
                    // Hotspot sound
                    if (scope.hotspot.type == 'sound') {

                        //Mobile only play audio if user interact with browser element
                        if (isMobile.any) {
                            if(confirm('Allow audio to play on this device')) {
                                localStorage.setItem('sound.allow', 'yes');
                                if (localStorage.getItem('sound') != "off") {
                                  myAudio.play();
                                }
                            }
                        }

                        $rootScope.$on('evt.krpano.onviewchange', function() {

                            try {

                                var volume = scope.hotspot.volume / 100;
                                if (myAudio != null) {
                                    myAudio.volume = calcVolume(scope.hotspot.position.x, scope.hotspot.position.y, scope.hotspot.reach) * volume;
                                }
                            } catch (e) {
                                // console.log(e);
                            }
                        });

                        if (localStorage.getItem('sound') == 'off') {
                            myAudio.pause();
                        }
                    }

                    function onviewchange() {
                        var volume = scope.hotspot.volume / 100;
                        myAudio.volume = calcVolume(scope.hotspot.position.x, scope.hotspot.position.y, scope.hotspot.reach) * volume;
                    }
                }

                function calcVolume(ath, atv, dp) {
                    var view = scope.lptsphereinstance.screentosphere($window.innerWidth / 2, $window.innerHeight / 2),
                        x = view.x,
                        y = view.y,
                        hp_left = ath - dp,
                        hp_right = ath + dp,
                        hp_top = atv - dp,
                        hp_bottom = atv + dp,
                        kc_h, kc_v, volume;
                    if (x - hp_left > 360) {
                        x = x - 360;
                    }
                    if ((hp_right - x) > 360) {
                        x = x + 360;
                    }
                    if (hp_left < x && x < hp_right && hp_top < y && y < hp_bottom) {
                        if (x < ath) kc_h = ath - x;
                        if (x > ath) kc_h = x - ath;
                        if (y < atv) kc_v = atv - y;
                        if (y > atv) kc_v = y - atv;
                        if (kc_h > kc_v) {
                            volume = (dp - kc_h) / dp;
                        } else {
                            volume = (dp - kc_v) / dp;
                        }
                        volume = volume.toFixed(2);
                    } else {
                        volume = 0;
                    }
                    return volume;
                }

                function loadScene(xml) {
                    if (angular.isDefined(scope.lptsphereinstance)) {
                        scope.lptsphereinstance.loadScene(xml);
                    } else {
                        console.log('lptsphereinstance is undefined');
                    }
                }

                // Generate child Theme
                function generateDirective(themeId) {
                    // Generate Theme element
                    var directiveName = 'hotspot-' + themeId;
                    var generatedTemplate = '<' + directiveName + ' id="' + thisHotspot.name + '" class="hotspot-move-trigger" px="' + thisHotspot.position.x + '" py="' + thisHotspot.position.y + '" size="' + thisHotspot.width + '"></' + directiveName + '>';

                    var htmlThemes = ['bubble', 'royal', 'gify', 'crystal'];
                    if (htmlThemes.indexOf(themeId) != -1) {
                        angular.element('#sprite-' + thisHotspot.name).empty();
                        angular.element('#sprite-' + thisHotspot.name).append($compile(generatedTemplate)(scope));
                    } else {
                        element.empty();
                        element.append($compile(generatedTemplate)(scope));
                    }

                }

                // Add hotspot to viewer
                function addHotspotToViewer(hotspot, isVisible, isHtml) {
                    if (angular.isUndefined(iconUrl)) {
                        var iconUrl = LptHelper.makeUrl(scope.themePath, 'images', hotspot.type + '.png');
                    }
                    // Apply custom hotspot icon to whole set
                    try {
                        var config = scope.project.theme_hotspot.config;
                        if (config[scope.hotspot.type + '_icon_custom']) {
                            iconUrl = config[scope.hotspot.type + '_icon_custom'];
                            var now = new Date().getTime();
                            iconUrl += '?' + now;
                        }
                    } catch (e) {}

                    // Apply custom hotspot icon for individual hotspot
                    if (angular.isDefined(hotspot.icon_custom) && hotspot.icon_custom != null && hotspot.icon_custom != '') {
                        iconUrl = hotspot.icon_custom;
                        var now = new Date().getTime();
                        iconUrl += '?' + now;
                    }

                    if (hotspot.type == 'sound') {
                        iconUrl = null;
                    }

                    if (angular.isUndefined(isVisible)) {
                        isVisible = true;
                    }

                    var hotspotConfig = {
                        title: hotspot.title,
                        name: hotspot.name,
                        lpttype: hotspot.type,
                        ishtml: angular.isDefined(isHtml) ? isHtml : false,
                        url: iconUrl,
                        alturl: iconUrl,
                        ath: hotspot.position.x,
                        atv: hotspot.position.y,
                        width: hotspot.width,
                        height: hotspot.width,
                        visible: isVisible
                    };

                    scope.lptsphereinstance.addHotspot(hotspotConfig);
                }

                // On hotspot click
                function onHotspotClick(id) {
                    switch (thisHotspot.type) {
                        case 'url':
                            _onUrlHotspotClick();
                            break;
                    }
                    // Track view
                    // Tracking.track('click','hotspot',id);
                }

                function _onUrlHotspotClick() {
                    if (angular.isDefined(thisHotspot.url)) {
                        var pattern = /^((http|https):\/\/)/;

                        if (!pattern.test(thisHotspot.url)) {
                            thisHotspot.url = "http://" + thisHotspot.url;
                        }
                        if (thisHotspot.iframe) {
                            $uibModal.open({
                                template: '<div class="hotspot-modal hotspot-url-iframe-popup"><iframe src="' + thisHotspot.url + '" style="width:100%;height: 100% "></iframe>' +
                                    '<span class="close close-black" ng-click="cancel()"><i class="ilpt-close"></i></span>' +
                                    '</div>',
                                size: 'lg',
                                // windowClass : "hotspot-url-iframe-" + scope.project.theme_hotspot.slug,
                                scope: scope,
                                controller: function($scope, $uibModalInstance) {
                                    $scope.cancel = function() {
                                        $uibModalInstance.dismiss('cancel');
                                    };
                                }
                            });
                            return;
                        } else {
                            window.open(thisHotspot.url, '_blank');
                        }
                    }
                }
            }
        };
    });