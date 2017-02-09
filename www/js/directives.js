applinkagoal = angular.module('starter.directives', [])

.directive('scrollWatch', function($rootScope, $ionicScrollDelegate) {
        return function(scope, elem, attr) {

            elem.bind('scroll', function(e) {
                if ($ionicScrollDelegate.getScrollPosition().top < $rootScope.pixelLimit) {
                    $rootScope.slideHeader = false;
                } else {
                    $rootScope.slideHeader = true;
                }
                $rootScope.$apply();
            });
        };
    })
    .directive('imageonload', function() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                element.bind('load', function() {
                    console.log("awesome")
                });
                element.bind('error', function() {
                    console.log('image could not be loaded');
                });
            }
        };
    })


.directive('userList', function() {
    return {
        restrict: 'AE',
        scope: {
            users: '=users'
        },
        templateUrl: 'templates/partials/_user_list.html',
    };
})

.directive('goalBx', function() {
    return {
        restrict: 'AE',
        scope: {
            goals: '=goals',
            followBtnEnabled: '=followBtnEnabled',
            linkBtnEnabled: '=linkBtnEnabled',
            actionsheetBtnEnabled: '=actionsheetBtnEnabled'
        },
        templateUrl: 'templates/partials/_goal_bx.html'
    };
})

.directive('goalBxOnboarding', function() {
    return {
        restrict: 'AE',
        scope: {
            goals: '=goals',
            followBtnEnabled: '=followBtnEnabled',
            linkBtnEnabled: '=linkBtnEnabled',
            actionsheetBtnEnabled: '=actionsheetBtnEnabled'
        },
        templateUrl: 'templates/partials/_goal_bx_onboarding.html'
    };
})

.directive('tagsList', function() {
    return {
        restrict: 'AE',
        scope: {
            tags: '=tags'
        },
        templateUrl: 'templates/partials/_interest_list.html'
    };
})

.directive('createPostPending', function() {
    return {
        restrict: 'AE',
        scope: {
            iscreating: '=iscreating',
            post: '=post',
            images: '=images'
        },
        templateUrl: 'templates/partials/creating_post_pending.html',
        controller: function($scope, ngProgressFactory, localStorageService) {
            sessionUser = localStorageService.get('loggedInUser');
            $scope.user = sessionUser.user;

        }
    }
})


.directive('mentionList', function($http, GoalsDataServices, $filter) {
    return {
        require: 'uiMention',
        link: function link($scope, $element, $attrs, uiMention) {
            /**
             * $mention.findChoices()
             *
             * @param  {regex.exec()} match    The trigger-text regex match object
             * @todo Try to avoid using a regex match object
             * @return {array[choice]|Promise} The list of possible choices
             */
            uiMention.findChoices = function(match, mentions) {

                return GoalsDataServices.userConnections(match[1], { offset: 0, limit: 5 })
                    .then(function(searchResults) {
                        var choices = [];
                        searchResults.data = searchResults.data.data;
                        for (var i = 0; i < searchResults.data.length; i++) {
                            choices.push({ name: searchResults.data[i].name, profileImage: searchResults.data[i].profile.small, id: searchResults.data[i].uid });
                        }

                        // Remove items that are already mentioned
                        return choices.filter(function(choice) {
                            return !mentions.some(function(mention) {
                                return mention.id === choice.id;
                            });
                        })

                    });

            };
        }
    };
})


.directive('feeds', function() {
    return {
        restrict: 'AE',
        scope: {
            activities: '=activities',
            topBarEnabled: '=topBarEnabled',
            topGoalEnabled: '=topGoalEnabled'
        },
        templateUrl: 'templates/partials/feeds.tmpl',
        controller: function($scope, $element, $attrs, $rootScope, $ionicModal, appModalService, Post, GoalsDataServices, $ionicScrollDelegate, $ionicSlideBoxDelegate, FeedServices, $cordovaToast, $ionicLoading, $cacheFactory, AlbumCache) {

            $scope.multiImageStyle = function(count) {
                var width = '33.33%';
                if (count == 2 || count == 4) {
                    width = '50%';
                }
                return {
                    'width': width
                }
            }

            $scope.motivateOnGoal = function(goal) {
                if (goal.me.isMotivated == 0) {
                    goal.me.isMotivated = 1;
                    goal.stats.motivations = goal.stats.motivations + 1;
                    GoalsDataServices.motivate(goal.id, 0);
                } else if (goal.me.isMotivated == 1) {
                    goal.me.isMotivated = 0;
                    goal.stats.motivations = goal.stats.motivations - 1;
                    GoalsDataServices.motivate(goal.id, 1);
                }
            }

            $rootScope.$on('POST_DELETED', function(event, args) {
                $scope.activities.splice(args.i, 1);
                try {
                    $cordovaToast.showLongTop('Successfully Deleted').then(function(success) {
                        console.log("The toast was shown");
                    }, function(error) {
                        console.log("The toast was not shown due to " + error);
                    });
                } catch(e) {

                }
            })

            $scope.goalActions = $rootScope.goalActions

            $scope.linkGoal = function() {}

            $ionicModal.fromTemplateUrl('templates/modals/single-image-view-modal.html', function(modal) {
                $scope.imageModal = modal;
            }, {
                scope: $scope,
                animation: 'fade-in-scale'
            });
            $scope.openImageModal = function(image) {
                console.log("image is", image)
                $scope.viewImage = image;
                $scope.imageModal.show();
                $ionicScrollDelegate.$getByHandle('zoom-pane').zoomTo(1)

            }
            $scope.closeImageModal = function() {
                $scope.imageModal.hide();
            }
            $scope.$on('$destroy', function() {
                $scope.imageModal.remove();
            });

            $scope.motivationOnPost = function(post) {
                if (post.me.isMotivated == 0) {
                    post.me.isMotivated = 1;
                    post.stats.motivations = post.stats.motivations + 1;
                    Post.motivate(post.id, 0)
                } else if (post.me.isMotivated == 1) {
                    post.me.isMotivated = 0;
                    post.stats.motivations = post.stats.motivations - 1;
                    Post.motivate(post.id, 1)
                }
            }

            $ionicModal.fromTemplateUrl('templates/modals/multiple-image-view-modal.html', function(modal) {
                $scope.multipleImageModal = modal;
            }, {
                scope: $scope,
                animation: 'fade-in-scale'
            });

            $scope.showImage = function(media, image, index) {
                $scope.aImages = media;
            }

            $scope.slideChanged = function(index, aImages) {
                $scope.slideIndex = index;
                $scope.showcommentspost = false;
                // Post.get(aImages[index].postId).success(function(result) {
                //     console.log("Post is ", result)
                //     $scope.showcommentspost = true;
                //     $scope.this_activity = result.data;

                // }).error(function(err) {

                // })
            };
            $scope.medias = [];

            //var albumCache = $cacheFactory('albumCache');

            $scope.getAlbum = function(id, index, activityid) {
                // $rootScope.showLoading('Please wait...', 600000);
                $ionicLoading.show({
                    content: 'Loading..',
                    animation: 'fade-in',
                    showBackdrop: true,
                    maxWidth: 200,
                    showDelay: 0
                });
                $scope.showcommentspost = false;
                FeedServices.getAlbum(id).success(function(res) {

                    AlbumCache.put(id, res.album.files);
                    $scope.aImages = res.album.files;
                    $scope.multipleImageModal.show();
                    $ionicSlideBoxDelegate.slide(index);
                    $ionicLoading.hide();

                }).error(function(err) {

                })
            }



            $rootScope.postids = [];

            $rootScope.goToSlide = function(index, activityid, parentid) {
                $scope.current_activity_id = activityid;
                $scope.current_parent_id = parentid;
                $scope.slideIndex = index;
                var count = false;
                console.log("Activity id", activityid);
                console.log("ids array", $rootScope.postids)
                if ($rootScope.postids.length == 0) {
                    console.log(" in if")
                    $rootScope.postids.push(activityid);
                    $scope.getAlbum(parentid, index, activityid);
                } else {
                    console.log("in else");
                    for (var i = 0; i < $rootScope.postids.length; i++) {
                        if (activityid == $rootScope.postids[i]) {
                            count = true;
                        }
                    }
                    if (!count) {
                        $rootScope.postids.push(activityid);
                        $scope.getAlbum(parentid, index, activityid);
                        count = true;
                    } else {
                        count = false;
                        $scope.aImages = $scope.medias[activityid].aImages;
                        $scope.multipleImageModal.show();
                        $ionicSlideBoxDelegate.slide(index);
                    }
                }
            }



            $scope.goToSlide = function(media, image, index, activityid, parentid) {
                //var data = albumCache.get("album"+parentid);
                var data = AlbumCache.get(parentid);
                if (!data) {
                    $scope.getAlbum(parentid, index, activityid);
                } else {
                    $scope.aImages = data;
                    $scope.multipleImageModal.show();
                    $ionicSlideBoxDelegate.slide(index);
                }

            }

            $scope.closeModalOnly = function() {
                $scope.multipleImageModal.hide();
            }

            $scope.closeMultipleImageModal = function(index, activityid, parentid) {
                $rootScope.isModalOpen = true;
                $rootScope.modal_index = index;
                $rootScope.modal_activity_id = activityid;
                $rootScope.modal_parent_id = parentid;
                $scope.multipleImageModal.hide();
            };

            // Cleanup the modal when we're done with it!
            $scope.$on('$destroy', function() {
                $scope.multipleImageModal.remove();
            });
        },
    };
})


.directive('fabicons', function() {
    return {
        link: function(scope, element, attributes, event) {
            var open = false;
            var items = angular.element(element[0].querySelectorAll('.circle span'));

            for (var i = 0, l = items.length; i < l; i++) {
                items[i].style.left = (50 - 35 * Math.cos(-0.5 * Math.PI / l - (1 / l) * i * Math.PI)).toFixed(4) + "%";
                items[i].style.top = (50 + 35 * Math.sin(-0.5 * Math.PI / l - (1 / l) * i * Math.PI)).toFixed(4) + "%";
            }
            setTimeout(function() {
                var tabWidth = angular.element(document.querySelectorAll(".tabs-bottom .tab-nav .tab-item"))[0].clientWidth;
                var marginLeft = (-1 * (tabWidth - 40) / 2)
                var nav = angular.element(element[0].querySelectorAll('.circular-menu'))
                nav.css('width', tabWidth + 'px')
                nav.css('margin-left', marginLeft + 'px')
            }, 200)
        }
    }
})

.directive('hideTabs', function($rootScope) {
    return {
        restrict: 'A',
        link: function(scope, element, attributes) {
            scope.$watch(attributes.hideTabs, function(value) {
                $rootScope.hideTabs = value;
            });
            scope.$on('$destroy', function() {
                $rootScope.hideTabs = false;
            });
        }
    };
})

.directive('readableTimeFilter', ['$timeout', function($timeout) {
    function update(scope) {
        var seconds = scope.time;
        scope.converted = readableTime(seconds);
        $timeout(function() { update(scope); }, 60000);
    }

    function readableTime(seconds) {
        var day, format, hour, minute, month, week, year;
        var currentTime = Math.floor(Date.now() / 1000);
        seconds = parseInt((currentTime - seconds));
        minute = 60;
        hour = minute * 60;
        day = hour * 24;
        week = day * 7;
        year = day * 365;
        month = year / 12;
        format = function(number, string) {
            if (string == 'day' || string == 'week' || string == 'hr') {
                string = number === 1 ? string : "" + string + "s";
            }
            //string = number === 1 ? string : "" + string + "s";
            return "" + number + " " + string;
        };
        switch (false) {
            case !(seconds < minute):
                return 'few secs ago';
            case !(seconds < hour):
                return format(Math.floor(seconds / minute), 'min');
            case !(seconds < day):
                return format(Math.floor(seconds / hour), 'hr');
            case !(seconds < week):
                return format(Math.floor(seconds / day), 'day');
            case !(seconds < month):
                return format(Math.floor(seconds / week), 'week');
            case !(seconds < year):
                return format(Math.floor(seconds / month), 'mon');
            default:
                return format(Math.floor(seconds / year), 'yr');
        }
    };
    return {
        restrict: 'A',
        scope: {
            time: '=time',
            converted: '=converted'
        },
        link: function(scope, element, attrs) {
            update(scope);
            scope.$watch('time', function(value) {
                update(scope);
            });
        }
    };
}])

.directive('openLink', ['$rootScope', '$compile', '$state', '$sce', function($rootScope, $compile, $state, $sce) {
    //var template = '<span>{{html[0]}}</span>';
    return {
        restrict: 'A',
        scope: {
            link: "=link",
            post: "=post"
        },
        link: function(scope, element, attr) {
            scope.link1 = String(scope.link).trim();
            scope.link1 = (scope.link1.length > 0 ? '<p class="man">' + scope.link1.replace(/[\r\n]+/g, '</p><p class="man">') + '</p>' : null);


            function findUrls(text) {
                var source = (text || '').toString();
                var urlArray = [];
                var url;
                var matchArray;
                var regexToken = /(((ftp|https?):\/\/)[\-\w@:%_\+.~#?,&\/\/=]+)|((mailto:)?[_.\w-]+@([\w][\w\-]+\.)+[a-zA-Z]{2,3})/g;
                while ((matchArray = regexToken.exec(source)) !== null) {
                    var token = matchArray[0];
                    urlArray.push(token);
                }

                return urlArray;
            }

            function findMentions(text, res) {
                var text;
                var extractMentionedUserRegex = /@[[0-9]+[:]([\w\s]+)]/gm;
                if (text != null) {
                    var pattern = text.match(extractMentionedUserRegex);
                    var uidList = [];

                    if (pattern != null) {
                        var t = ""
                        angular.forEach(pattern, function(p , i){
                            t = p.replace("@[", "").replace("]", "")
                            t = t.split(":")
                            uidList.push({
                                uid: parseInt(t[0]),
                                displayName: t[1],
                                pattern: p
                            })
                        })

                        var commentid = text;
                        var name = "";
                        angular.forEach(uidList, function(object, index1) {
                            x = _.findWhere(res.mentionList, {uid: object.uid});
                            if (typeof x == "undefined") {
                                name = '<span>' + object.displayName + '</span>'
                            } else {
                                var middleState = $state.current.name.split(".")[1];
                                name = '<a class="mentioned" href="#/tab/' + middleState + '/profile/' + x.uid + '">' + x.name + '</a>';
                            }
                            var mentiontext = $sce.trustAsHtml(name);
                            text = text.replace(pattern[index1], mentiontext);
                        });
                        return text;
                    } else {
                        return text;
                    }
                } else {
                    return "";
                }
            }

            scope.link1 = findMentions(scope.link1, scope.post);

            scope.html = findUrls(scope.link1);
            var str = scope.link1;
            var template = '<span ng-click="openBrowser(html[0])">{{html[0]}}</span>'
            var res = '<span >'
            if (scope.html.length != 0) {
                res += str.replace(scope.html[0], '<span ng-click="openBrowser(html[' + 0 + '])" ng-bind-html="html[' + 0 + '] " style="color: #2691ce;"></span>')
                if (scope.html.length >= 1) {
                    for (var i = 1; i < scope.html.length; i++) {
                        res = res.replace(scope.html[i], '<span ng-click="openBrowser(html[' + i + '])" ng-bind-html="html[' + i + ']" style="color: #2691ce;"></span>')
                    }
                }


            } else {
                res += str;
            }
            res += '</span>'
            try {
                var content = $compile(res)(scope);
                element.replaceWith(content);
            } catch (e) {

            }
            scope.openBrowser = function(link) {
                $rootScope.openBrowser(link);
            }
        }
    };
}])

.directive('openBio', ['$rootScope', '$compile', '$state', '$sce', '$cordovaInAppBrowser', function($rootScope, $compile, $state, $sce, $cordovaInAppBrowser) {
    //var template = '<span>{{html[0]}}</span>';
    return {
        restrict: 'A',
        scope: {
            link: "=link",
            post: "=post"
        },
        link: function(scope, element, attr) {
            scope.link1 = String(scope.link).trim();
            scope.link1 = (scope.link1.length > 0 ? '<p class="man">' + scope.link1.replace(/[\r\n]+/g, '</p><p class="man">') + '</p>' : null);


            function findUrls(text) {
                var source = (text || '').toString();
                var urlArray = [];
                var url;
                var matchArray;
                var regexToken = /(((ftp|https?):\/\/)[\-\w@:%_\+.~#?,&\/\/=]+)|((mailto:)?[_.\w-]+@([\w][\w\-]+\.)+[a-zA-Z]{2,3})/g;
                while ((matchArray = regexToken.exec(source)) !== null) {
                    var token = matchArray[0];
                    urlArray.push(token);
                }

                return urlArray;
            }

            scope.html = findUrls(scope.link1);
            var str = scope.link1;
            var template = '<span ng-click="openBrowser(html[0])">{{html[0]}}</span>'
            var res = '<div class="ft-12 lg-m-align ptm pll prl">'
            if (scope.html.length != 0) {
                res += str.replace(scope.html[0], '<span ng-click="openBrowser(html[' + 0 + '])" ng-bind-html="html[' + 0 + '] " style="color: #2691ce;"></span>')
                if (scope.html.length >= 1) {
                    for (var i = 1; i < scope.html.length; i++) {
                        res = res.replace(scope.html[i], '<span ng-click="openBrowser(html[' + i + '])" ng-bind-html="html[' + i + ']" style="color: #2691ce;"></span>')
                    }
                }


            } else {
                res += str;
            }
            res += '</div>'
            try {
                var content = $compile(res)(scope);
                element.replaceWith(content);
            } catch (e) {

            }
            scope.openBrowser = function(link) {
                var options = {
                    location: 'yes',
                    clearcache: 'yes',
                    toolbar: 'yes'
                };
                $cordovaInAppBrowser.open(link, '_system', options)

                .then(function(event) {
                    // success
                })

                .catch(function(event) {
                    // error
                });
            }
        }
    };
}])

.directive('openLinkWithFeed', ['$rootScope', '$compile', '$state', '$sce', function($rootScope, $compile, $state, $sce) {
    //var template = '<span>{{html[0]}}</span>';
    return {
        restrict: 'A',
        scope: {
            link: "=link",
            post: "=post"
        },
        link: function(scope, element, attr) {
            scope.link1 = String(scope.link).trim();
            scope.link1 = (scope.link1.length > 0 ? '<p class="man">' + scope.link1.replace(/[\r\n]+/g, '</p><p class="man">') + '</p>' : null);


            function findUrls(text) {
                var source = (text || '').toString();
                var urlArray = [];
                var url;
                var matchArray;
                var regexToken = /(((ftp|https?):\/\/)[\-\w@:%_\+.~#?,&\/\/=]+)|((mailto:)?[_.\w-]+@([\w][\w\-]+\.)+[a-zA-Z]{2,3})/g;
                while ((matchArray = regexToken.exec(source)) !== null) {
                    var token = matchArray[0];
                    urlArray.push(token);
                }

                return urlArray;
            }

            scope.html = findUrls(scope.link1);
            var str = scope.link1;
            var template = '<span ng-click="openBrowser(html[0])">{{html[0]}}</span>'
            var res = '<span >'
            if (scope.html.length != 0) {
                res += str.replace(scope.html[0], '<span ng-click="openBrowser(html[' + 0 + '])" ng-bind-html="html[' + 0 + '] " style="color: #2691ce;"></span>')
                if (scope.html.length >= 1) {
                    for (var i = 1; i < scope.html.length; i++) {
                        res = res.replace(scope.html[i], '<span ng-click="openBrowser(html[' + i + '])" ng-bind-html="html[' + i + ']" style="color: #2691ce;"></span>')
                    }
                }


            } else {
                res += str;
            }
            res += '</span>'
            try {
                var content = $compile(res)(scope);
                element.replaceWith(content);
            } catch (e) {

            }
            scope.openBrowser = function(link) {
                $rootScope.openBrowser(link);
            }
        }
    };
}])

.directive('constantFocus', function($window, $ionicScrollDelegate, $timeout ) {
    return {
        restrict: 'A',
        scope: {
            hidekeyboard: '=hidekeyboard'
        },
        link: function(scope, element, attrs) {
            element[0].addEventListener('focusout', function(e) {
                if (!scope.hidekeyboard){
                    element[0].focus();
                }
                else {
                    scope.hidekeyboard = false;
                }
            });
        }
    };
})

.factory('progressfactory', ['ngProgressFactory', function(ngProgressFactory) {
    var progressbar = ngProgressFactory.createInstance();
    progressbar.setParent(document.getElementById('container'));
    progressbar.setColor('#12bcb5');

    progressbar.setHeight('5px');

    return {
        start: function() {
            progressbar.start();
        },
        complete: function() {
            progressbar.complete();
        },
        set: function(val) {
            progressbar.set(val);
        }

    };
}])

.filter('mentionParser', function($sce, $state, _) {
    return function(text, res) {
        var text;
        var regex = /[@[0-9]+[:]([a-z|A-Z ]+)]/g;
        var idSeprator = /[0-9]+/g;
        var displaySeprator = /([a-z|A-Z ]+)/g;
        var pattern = text.match(regex);
        var uidList = [];
        var textCopy = text;
        var mentions = [];


        if (pattern != null) {

            for (var i = 0; i < pattern.length; i++) {
                if (pattern[i].match(idSeprator) && pattern[i].match(displaySeprator)) {
                    uidList.push({
                        uid: pattern[i].match(idSeprator)[0],
                        displayName: pattern[i].match(displaySeprator)[0],
                        pattern: pattern[i],
                    });
                }
            }

            var commentid = text;
            var name = "";
            angular.forEach(uidList, function(object, index1) {
                x = _.findWhere(res.mentionList, {uid: object.uid});

                if (typeof x === "undefined") {

                    name = '<span>' + object.displayName + '</span>'
                } else {
                    var middleState = $state.current.name.split(".")[1];
                    name = '<a class="mentioned" href="#/tab/' + middleState + '/profile/' + x.uid + '">' + x.name + '</a>';
                }
                var mentiontext = $sce.trustAsHtml(name);
                textCopy = textCopy.replace(pattern[index1], mentiontext);
            });

            // angular.forEach(res.mentionList, function(value, index) {



            //     angular.forEach(uidList, function(object, index1) {
            //         if (value.uid == object.uid) {
            //             var middleState = $state.current.name.split(".")[1];
            //             var name = '<a class="mentioned" href="#/tab/' + middleState + '/profile/' + value.uid + '">' + value.name + '</a>';
            //             var mentiontext = $sce.trustAsHtml(name);
            //             textCopy = textCopy.replace(pattern[index1], mentiontext);

            //         }

            //     })
            // })


            return textCopy;

        } else {
            return text;
        }
    }
});
