window.placeTools = angular.module('ion-place-tools', []);
placeTools.directive('ionGooglePlace', [
        '$ionicTemplateLoader',
        '$ionicPlatform',
        '$q',
        '$timeout',
        '$rootScope',
        '$document',
        function($ionicTemplateLoader, $ionicPlatform, $q, $timeout, $rootScope, $document) {
            return {
                require: '?ngModel',
                restrict: 'E',
                templateUrl: 'src/ionGooglePlaceTemplate.html',
                replace: true,
                scope: {
                    searchQuery: '=ngModel',
                    locationChanged: '&'
                },
                link: function(scope, element, attrs, ngModel) {
                    scope.dropDownActive = false;
                    var service = new google.maps.places.AutocompleteService();
                    var searchEventTimeout = undefined;
                    var latLng = null;

                    navigator.geolocation.getCurrentPosition(function (position) {
                        latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                    });

                    var searchInputElement = angular.element(element.find('input'));

                    scope.selectLocation = function(location) {
                        scope.dropDownActive = false;
                        scope.searchQuery = location.description;
                        if (scope.locationChanged) {
                            scope.locationChanged()(location.description);
                        }
                    };
                    if (!scope.radius) {
                        scope.radius = 1500000;
                    }

                    scope.locations = []

                    scope.$watch('searchQuery', function(query) {
                        try {
                           scope.dropDownActive = (query.length >= 1 && scope.locations.length);  
                        }
                        catch(err) {

                        }
                        
                        if (searchEventTimeout) $timeout.cancel(searchEventTimeout);
                        searchEventTimeout = $timeout(function() {
                            if(!query) return;
                            if (query.length < 1) {
                                scope.locations = [];
                                return;
                            };

                            var req = {};
                            req.input = query;
                            if (latLng) {
                                req.location = latLng;
                                req.radius = scope.radius;
                            }
                            service.getQueryPredictions(req, function (predictions, status) {
                                if (status == google.maps.places.PlacesServiceStatus.OK) {
                                    scope.locations = predictions;
                                    scope.$apply();
                                }
                            });
                        }, 350); // we're throttling the input by 350ms to be nice to google's API
                    });

                    var onClick = function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        scope.dropDownActive = true;
                        scope.$digest();
                        searchInputElement[0].focus();
                        setTimeout(function(){
                            searchInputElement[0].focus();
                        },0);
                    };

                    var onCancel = function(e){
                        setTimeout(function () {
                            scope.dropDownActive = false;
                            scope.$digest();
                        }, 200);
                    };

                    element.find('input').bind('click', onClick);
                    element.find('input').bind('blur', onCancel);
                    element.find('input').bind('touchend', onClick);


                    if(attrs.placeholder){
                        element.find('input').attr('placeholder', attrs.placeholder);
                    }
                }
            };
        }
    ]);

// Add flexibility to template directive
var template = '<div class="ion-place-tools-autocomplete">' +
                    '<textarea class="lg-text-area gry-txt" rows="1" msd-elastic="\n" autocomplete="off" placeholder="Location" ng-model="searchQuery"></textarea>' +
                    '<div class="ion-place-tools-autocomplete-dropdown lg-br-all lg-thin-br" style="position: relative;" ng-if="dropDownActive">' +
                        '<ion-list>' +
                            '<ion-item ng-repeat="location in locations" class="ft-14 db-txt" ng-click="selectLocation(location)">' +
                                '{{location.description}}' +
                            '</ion-item>' +
                        '</ion-list>' +
                    '</div>' +
                '</div>';
placeTools.run(["$templateCache", function($templateCache) {$templateCache.put("src/ionGooglePlaceTemplate.html",template);}]);