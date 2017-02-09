applinkagoal = angular.module('starter.controllers', [])

.controller('IntroCtrl', function($scope, $state, $ionicSlideBoxDelegate) {
    $scope.login = function() {
        $state.go('main.signup');
    }

    $scope.nextSlide = function() {
        $ionicSlideBoxDelegate.next();
    }
})

.controller('AboutCtrl', function($scope, $state) {
        $scope.titleLogo = '<i class="lg-icon-logo top-logo"></i>'
    })
    .controller('TermsCtrl', function($scope, $state) {
        $scope.titleLogo = '<i class="lg-icon-logo top-logo"></i>'
    })
    .controller('PrivacyCtrl', function($scope, $state) {
        $scope.titleLogo = '<i class="lg-icon-logo top-logo"></i>'
    })
    .controller('CareersCtrl', function($scope, $state) {
        $scope.titleLogo = '<i class="lg-icon-logo top-logo"></i>'
    })
    .controller('CopyrightCtrl', function($scope, $state) {
        $scope.titleLogo = '<i class="lg-icon-logo top-logo"></i>'
    })

.controller('FeedbackCtrl', function($scope, $state, FeedbackService) {
        $scope.feedback = {};
        $scope.container2 = false;
        $scope.select = false;
        $scope.submit = function() {
            params = $scope.feedback;
            FeedbackService.submit(params).success(function(res) {
                $scope.feedback.text = null;
                $scope.container2 = true;
            }).error(function(err) {})

        }

        $scope.selectSuggestion = function() {
            $scope.select = false;
        }
        $scope.selectBug = function() {
            $scope.select = true;
        }
    })
    .controller('AppVersionCtrl', function($scope, $state) {
        $scope.titleLogo = '<i class="lg-icon-logo top-logo"></i>'
    })

.controller('MyGoalsCtrl', function($scope, $state, UserDataServices, TemporaryDataService, parameters) {
    var vm = this;
    $scope.currentParams = parameters;
    /* UserDataServices.getMyGoals({type:'FULL'}).success(function(result){
      $scope.goals = result.data;
    });
  */
    vm.confirm = function(selected) {
        $scope.closeModal(selected);
    };

    vm.selectedItem = function(selected) {
        vm.selected = selected;
    };

    vm.cancel = function() {
        $scope.closeModal(null);
    };



    var offset = 0;
    var limit = 10;
    $scope.goals = [];
    $scope.noMoreContent = true;

    $scope.getMoreGoals = function(start) {
        var _start = start || false;
        UserDataServices.getMyGoals({ type: 'LIST', offset: offset, limit: limit }).success(function(res) {
            if (_start) {
                $scope.goals = [];
            }

            if (res.data.length < limit) {
                $scope.noMoreContent = false;
            }
            $scope.goals = $scope.goals.concat(res.data);
            offset = offset + limit;
            if (_start) {
                $scope.$broadcast('scroll.refreshComplete');
            } else {
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }

        })
    }


})

.controller('GoalLinkedList', function($scope, $state, parameters, GoalsDataServices) {
    var vm = this;
    $scope.currentParams = parameters;
    GoalsDataServices.linkedGoalList($scope.currentParams.id).success(function(result) {
        $scope.linkedgoals = result.data;
    });

    vm.cancel = function() {
        $scope.closeModal(null);
    };

    vm.confirm = function(selected) {
        $scope.closeModal(selected);
    };

    vm.selectedItem = function(selected) {
        vm.selected = selected;


    };

})


.controller('LoginCtrl', function($scope, $rootScope, $state, UserDataServices, localStorageService, LoginService, NotificationDataServices, ChatFactory, socket, $ionicPopup) {
    $scope.goMain = function() { $state.go('main.all-pages'); }

    $scope.screen = {};

    $scope.$on('$ionicView.beforeEnter', function() {
        $scope.screen.isLoading = false;
        $scope.screen.success = false;
        $scope.user.username = '';
        $scope.user.password = '';
        $scope.screen.error = null;
    })

    $scope.signUpScreen = function() {
        $state.go('main.signup');
    }

    $scope.login = function() {
        $state.go('tab.dashboard');
    }

    $scope.user = {};

    $scope.isLoading = false;
    $scope.doLogin = function() {
        var client_info = LoginService.get();
        for (var key in client_info) {
            $scope.user[key] = client_info[key];
        }
        $scope.isLoading = true;
        var client_id = 0;
        if (client_id = localStorageService.get('client_id')) {
            client_id = client_id;
        }
        UserDataServices.login($scope.user, client_id).success(function(result) {
            socket.connect();
            if (result.meta.status == 200) {
                if (localStorageService.isSupported) {
                    loggedInUser = { credentials: result.data.credentials, user: result.data.user }
                    localStorageService.set("client_id", result.data.credentials.client_id);
                    localStorageService.set("loggedInUser", loggedInUser);
                    localStorageService.set("userLoginEnter", 1);
                    $scope.isLoading = false;
                    $scope.user = {};
                    $state.go('tab.dashboard', {}, { reload: true });
                    $rootScope.chatFactory = new ChatFactory();
                    $rootScope.chatFactory.login();
                    $rootScope.chatFactory.reload().then(function(res) {
                        $rootScope.chatFactory.show_screen = true;
                    });
                }
            } else if (result.meta.status == 401) {
                $scope.isLoading = false;
                $scope.screen.error = result.errors;
                $scope.deactivate($scope.screen.error)
            }
        }).error(function(err) {
            $scope.isLoading = false;
            try {
                $scope.screen.error = err.errors;
                $scope.deactivate($scope.screen.error)
            } catch (e) {
                $scope.screen.error = "Error"
            }

        });
    }

    $scope.deactivate = function(err) {
        $scope.error_message = err;
        $scope.error_title = "Error in Login";
        var confirmPopup = $ionicPopup.show({
            cssClass: 'error-pop',
            templateUrl: 'templates/partials/error_popup.html',
            scope: $scope,
            buttons: [
                { text: 'GOT IT' }
            ]

        });
        $timeout(function() {
            confirmPopup.close(); //close the popup after 3 seconds for some reason
        }, 3000);
    };

})


.controller('SignUpCtrl', function($scope, $state, $ionicSlideBoxDelegate, $cordovaStatusbar, UserDataServices, localStorageService, socket, User, $rootScope, $ionicPopup, ChatFactory) {
    $scope.user = {};
    $scope.screen = {};
    $scope.regex = '^[a-zA-Z]+[a-zA-Z0-9._-]+@[a-z]+\.[a-z.]{2,5}$';

    $scope.$on('$ionicView.beforeEnter', function() {
        $scope.screen.isLoading = false;
        $scope.screen.success = false;
        $scope.user.name = '';
        $scope.user.user_email = '';
        $scope.screen.error = null;
    })

    $scope.loginScreen = function() {
        $state.go('main.login');
    }
    $scope.slideTo = function(index) {
        var errors = [];
        if ($scope.user.name == null || $scope.user.name == "") {
            errors.push({ message: 'Name is required' })
        }

        if ($scope.user.user_email == null || $scope.user.user_email == "") {
            errors.push({ message: 'Email is required' });
        } else {
            var email = $scope.user.user_email.match($scope.regex);
            if (email == null) {
                errors.push({ message: 'Not a valid email' });
            }
        }

        if (errors.length != 0) {
            $scope.deactivate(errors)
        } else {
            $ionicSlideBoxDelegate.slide(index);
        }
    }


    $scope.disableSwipe = function() {
        $ionicSlideBoxDelegate.enableSlide(false);
    };


    $scope.isLoading = false;
    $scope.doLogin = function() {
        $scope.isLoading = true;
        UserDataServices.register($scope.user).success(function(result) {
            if (result.meta.status == 200) {
                params = { username: $scope.user.username, password: $scope.user.password }
                UserDataServices.login(params).success(function(user) {
                    socket.connect();
                    if (localStorageService.isSupported) {
                        loggedInUser = { credentials: user.data.credentials, user: user.data.user }
                        localStorageService.set("loggedInUser", loggedInUser);
                        $state.go('aftersignup.welcome');
                        if (User.isAuthenticated()) {
                            $rootScope.chatFactory = new ChatFactory();
                            $rootScope.chatFactory.login();
                            $rootScope.chatFactory.reload().then(function(res) {
                                $rootScope.chatFactory.show_screen = true;
                            });
                        }
                    }
                });
            } else if (result.meta.status == 401) {
                $scope.isLoading = false;
                $scope.screen.error = result.errors;
                $scope.deactivate($scope.screen.error)
            }
        }).error(function(err) {
            $scope.screen.error = err.errors;
            $scope.deactivate($scope.screen.error)
            $scope.isLoading = false;
        });
    }

    $scope.deactivate = function(err) {
        $scope.error_message = err;
        $scope.error_title = "We can’t sign you up";
        var confirmPopup = $ionicPopup.show({
            cssClass: 'error-pop',
            templateUrl: 'templates/partials/error_popup.html',
            scope: $scope,
            buttons: [
                { text: 'GOT IT' }
            ]

        });
        // $timeout(function() {
        //     confirmPopup.close(); //close the popup after 3 seconds for some reason
        // }, 3000);
    };

    $ionicSlideBoxDelegate.enableSlide(false)
    $scope.goMain = function(chat) { $state.go('main.all-pages'); }

    $scope.onboarding = function() {
            $state.go('main.onboarding');
        }
        // Popup to show error
        // $scope.deactivate = function() {
        //     var confirmPopup = $ionicPopup.show({
        //         cssClass: 'error-pop',
        //         templateUrl: 'templates/partials/error_popup.html',

    //     });
    //     $timeout(function() {
    //         myPopup.close(); //close the popup after 3 seconds for some reason
    //     }, 3000);
    // };
    // Popup to show error
})

.controller('SubCategoriesCtrl', function($scope, $rootScope, $state, $stateParams, $cordovaStatusbar, CategoriesServices) {

    setTimeout(function() {
        $cordovaStatusbar.style(1);
    }, 300)
    $rootScope.showLoading();
    var page = offset = 0;
    var limit = 5;
    $scope.nogoal = false;
    $scope.goals = [];
    $scope.title = $stateParams.id;
    $scope.noMoreContent = false;
    $scope.getGoals = function(start) {
        var _start = start || false
        CategoriesServices.getSub($stateParams.category_id, $stateParams.id, { offset: offset, limit: limit }).success(function(res) {
            $rootScope.hideLoading();
            $scope.noMoreContent = false;
            $scope.nogoal = true;
            if (_start) {
                $scope.goals = [];
            }
            $scope.tag = res.data.tag;
            $scope.category = res.data;
            $scope.goals = $scope.goals.concat(res.data.goals);
            if (res.data.goals.length < limit) {
                $scope.noMoreContent = true;
            }
            //bgImage = res.data.media.image.medium.source;
            offset = offset + limit;
            if (_start) {
                $scope.$broadcast('scroll.refreshComplete');
                //$scope.$apply()
            } else {
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
        })
    }
    $scope.getGoals();
    $scope.doRefresh = function() {
        offset = 0;
        $scope.getGoals(true);
    }
})

.controller('CategoriesCtrl', function($scope, $state, $stateParams, $cordovaStatusbar, CategoriesServices) {
    setTimeout(function() {
        $cordovaStatusbar.style(1);
    }, 2000)

    var page = offset = 0;
    var limit = 5;
    $scope.goals = [];
    $scope.noMoreFeedContent = false;
    $scope.title = "Category"

    $scope.getGoals = function(start) {
        var _start = start || false
        $scope.noMoreContent = false;
        CategoriesServices.get($stateParams.category_id, { offset: offset, limit: limit }).success(function(res) {
            $scope.noMoreContent = false;
            if (_start) {
                $scope.goals = [];
            }
            $scope.category = res.data;
            $scope.goals = $scope.goals.concat(res.data.goals);
            if (res.data.goals.length < limit) {
                $scope.noMoreContent = true;
            }
            //bgImage = res.data.media.image.medium.source;
            offset = offset + limit;
            if (_start) {
                $scope.$broadcast('scroll.refreshComplete');
                //$scope.$apply()
            } else {
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
        })
    }
    $scope.doRefresh = function() {
        offset = 0;
        $scope.getGoals(true);
    }

    $scope.$on('$stateChangeSuccess', function() {
        $scope.getGoals();
    });
})

.controller('DashboardCtrl', function($scope, $rootScope, FeedServices, $cordovaStatusbar, $cordovaPush, PrivacyCache, Pushwoosh, activityService, User, PushwooshState) {
    try {
        Pushwoosh.registerDevice();
    } catch (err) {

    }

    $scope.$on('$ionicView.beforeEnter', function() {
        var push_state = PushwooshState.get()
        if (!isEmpty(push_state)) {
            //$scope.doRefresh();
            $state.go('tab.me');
            //$rootScope.navigateState(push_state.state, { id: push_state.id });
        }
    });

    $scope.titleLogo = '<i class="lg-icon-logo top-logo"></i>'
    $rootScope.slideHeader = false;
    $rootScope.pixelLimit = 200;
    setTimeout(function() {
        $cordovaStatusbar.show();
        $cordovaStatusbar.style(1);
    }, 300)

    PrivacyCache.getDefault();




    var page = offset = 0;
    var limit = 5;
    $scope.activities = [];
    $scope.noMoreFeedContent = true;
    $scope.getDashboardFeed = function(start) {
        var _start = start || false
        $scope.noMoreFeedContent = true;
        FeedServices.getDashBoard({ offset: offset, limit: limit }).success(function(res) {
            $scope.isLoading = false;
            if (_start) {
                $scope.activities = [];
            }
            $scope.activities = $scope.activities.concat(res.data);
            if (res.data.length < limit) {
                $scope.noMoreFeedContent = false;
            }

            offset = offset + limit;
            if (_start) {
                $scope.$broadcast('scroll.refreshComplete');
                //$scope.$apply()
            } else {
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
        })
    };

    $scope.doRefresh = function() {
        offset = 0;
        $scope.getDashboardFeed(true);
    }

    $rootScope.$on('GOALCREATED', function(event, args) {
        $scope.activities.unshift(args.data);
    });

    $rootScope.$on('STATUS_UPDATE', function(event, args) {
        var result = {}
        result.post = args.data;
        result.feed_type = args.data.post_type
        $scope.activities.unshift(result);
    });

    $rootScope.$on('ALBUM', function(event, args) {
        var result = {}
        result.post = args.data;
        result.feed_type = args.data.post_type
        $scope.activities.unshift(result);
    });

    $scope.setActivity = function(activity, type) {
        activityService.set(activity);
        if (type == 'user') {
            $rootScope.navigateState('consolidated-user-followed', { id: User.me().uid });
        } else {
            $rootScope.navigateState('consolidated-goal-followed', { id: User.me().uid });
        }

    }

})

.controller('ExploreCtrl', function($scope, $state, ExploreServices, $rootScope, $ionicSlideBoxDelegate) {
    $rootScope.showLoading()

    $scope.noMoreContent = true;
    $scope.getExploreData = function() {
        $scope.data = {};
        $scope.featuredTags = [];
        ExploreServices.get().success(function(res) {
            $scope.data = res.data
            $rootScope.hideLoading();
        })
        ExploreServices.featuredTags().success(function(res) {
            $scope.featuredTags = res.data;
            setTimeout(function() {
                $ionicSlideBoxDelegate.update();
            }, 50)
        });
        $scope.$broadcast('scroll.refreshComplete');
    }

    $scope.getExploreData();

    $scope.loadMore = function() {

    }

})

.controller('HotNewGoalsCtrl', function($scope, $state, ExploreServices) {
    $scope.title = "Hot New Goals"
    $scope.bgImage = "img/explore/hn-goals-banner.jpg";
    var offset = 0;
    var limit = 5;
    $scope.goals = [];
    $scope.noMoreContent = false;

    $scope.getMoreGoals = function(start) {
        var _start = start || false;
        ExploreServices.hotNewGoals({ offset: offset, limit: limit }).success(function(res) {
            $scope.noMoreContent = false;
            if (_start) {
                $scope.goals = [];
            }
            if (res.data.goals.length < limit) {
                $scope.noMoreContent = true;
            }
            $scope.goals = $scope.goals.concat(res.data.goals);
            offset = offset + limit;
            if (_start) {
                $scope.$broadcast('scroll.refreshComplete');
            } else {
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }

        })
    }

    $scope.doRefresh = function() {
        offset = 0;
        $scope.getMoreGoals(true);
    }

})

.controller('PopularGoalsCtrl', function($scope, $state, ExploreServices) {
    $scope.title = "Popular Goals"
    $scope.bgImage = "img/explore/popular-goals-banner.jpg";
    var offset = 0;
    var limit = 5;
    $scope.goals = [];
    $scope.noMoreContent = false;
    $scope.getMoreGoals = function(start) {
        var _start = start || false;
        ExploreServices.popularGoals({ offset: offset, limit: limit }).success(function(res) {
            $scope.noMoreContent = false;
            if (_start) {
                $scope.goals = [];
            }
            if (res.data.goals.length < limit) {
                $scope.noMoreContent = true;
            }
            $scope.goals = $scope.goals.concat(res.data.goals);
            offset = offset + limit;
            if (_start) {
                $scope.$broadcast('scroll.refreshComplete');
            } else {
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }

        })
    }

    $scope.doRefresh = function() {
        offset = 0;
        $scope.getMoreGoals(true);
    }

})

.controller('FeaturedProfilesCtrl', function($scope, $state, ExploreServices) {
    $scope.title = "Featured Profiles"
    $scope.bgImage = "img/explore/featured-profile-banner.jpg";
    var offset = 0;
    var limit = 5;
    $scope.users = [];
    $scope.noMoreContent = false;
    $scope.getMoreUsers = function(start) {
        var _start = start || false;
        ExploreServices.featuredUsers({ offset: offset, limit: limit }).success(function(res) {
            $scope.noMoreContent = false;
            if (_start) {
                $scope.users = [];
            }
            if (res.data.users.length < limit) {
                $scope.noMoreContent = true;
            }
            $scope.users = $scope.users.concat(res.data.users);
            offset = offset + limit;
            if (_start) {
                $scope.$broadcast('scroll.refreshComplete');
            } else {
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }

        })
    }

    $scope.doRefresh = function() {
        offset = 0;
        $scope.getMoreUsers(true);
    }

})

.controller('TagCtrl', function($scope, $state, $stateParams, TagsDataServices) {
    $scope.title = $stateParams.name
    var offset = 0;
    var limit = 10;
    $scope.goals = [];
    $scope.noMoreContent = true;
    $scope.getMoreGoals = function(start) {
        var _start = start || false;
        TagsDataServices.getTaggedGoals($stateParams.name, { offset: offset, limit: limit }).success(function(res) {
            if (_start) {
                $scope.goals = [];
            }

            if (res.data.goals.length < limit) {
                $scope.noMoreContent = false;
            }
            $scope.tag = res.data.tag;
            $scope.goals = $scope.goals.concat(res.data.goals);
            offset = offset + limit;
            if (_start) {
                $scope.$broadcast('scroll.refreshComplete');
            } else {
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }

        })
    }

    $scope.doRefresh = function() {
        offset = 0;
        $scope.getMoreGoals(true);
    }

})



.controller('ProfileCtrl', function($ionicModal, $scope, $rootScope, $ionicViewSwitcher, UserDataServices, $state, $stateParams, localStorageService, $ionicNavBarDelegate, $ionicActionSheet, $ionicSlideBoxDelegate) {

    //sessionUser = localStorageService.get('loggedInUser');
    //uid = sessionUser.user.uid;

    $ionicNavBarDelegate.showBar(false);
    uid = $stateParams.id;
    $scope.uid = $stateParams.id;

    $scope.months = ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
    $scope.media = [];

    $scope.isLoading = true;
    $scope.getUserData = function() {
        $scope.user = {};
        UserDataServices.getUser(uid).success(function(res) {
            $scope.user = res.data;
            $scope.isLoading = false;
            UserDataServices.Education.getAll(uid).success(function(result) {
                $scope.userEduInfo = result.data;
            })
            UserDataServices.Work.getAll(uid).success(function(result) {
                    $scope.userWorkInfo = result.data;
                })
                // UserDataServices.getUserSkills($scope.user.uid).success(function(result) {
                //     $scope.userWorkInfo = result.data;
                // })

            UserDataServices.getUserInterests(uid).success(function(result) {
                $scope.userInterest = result.data;
            })

            UserDataServices.connections(uid).success(function(result) {
                $scope.connections = result.data;
            });
            UserDataServices.getUserFollowers(uid).success(function(result) {
                $scope.userFollowers = result.data;
            })
            UserDataServices.getUserFollowing(uid).success(function(result) {
                $scope.userFollowing = result.data;
            })

            $scope.mediaOrignal = []
            UserDataServices.getimages(uid, { offset: 0, limit: 8 }).success(function(result) {
                if (typeof result.data.images != "undefined") {
                    for (var i = 0; i < result.data.images.length; i++) {
                        if (typeof result.data.images[i].files[0].source.square != "undefined") {
                            $scope.media.push({ src: result.data.images[i].files[0].source.square.src })
                            $scope.mediaOrignal.push({ src: result.data.images[i].files[0].source.large.src })
                        }
                    }
                }
            })
            UserDataServices.getUserPosts(uid, { filter: "interactions", type: "mini", offset: 0, limit: 3 }).success(function(result) {
                $scope.UserRecentActivities = result.data;
            })
            $scope.$broadcast('scroll.refreshComplete');
        })
    }

    $scope.getUserData();

    $rootScope.$on('profileImageChanged', function(event, args) {
        $scope.user.profile = args.data;
        User.updateLS({ image: args.data });
    });

    $rootScope.$on('coverImageChanged', function(event, args) {
        $scope.sessionUser.cover = args.data.large;
        $scope.user.cover = args.data;
        User.updateLS({ cover: args.data });
    });

    $scope.profileActionSheet = function(user) {
        var buttons = [];

        //index=0
        if (!$rootScope.isMe(user.uid) && user.me.isMuted == 0) {
            buttons.push({ text: '<i class="icon lg-icon-notification"></i> Mute' })
        } else if (!$rootScope.isMe(user.uid) && user.me.isMuted == 1) {
            buttons.push({ text: '<i class="icon lg-icon-notification"></i> Unmute' })
        }

        //index=1 
        if ($rootScope.isMe(user.uid)) {
            //buttons.push({ text: '<i class="icon ion-trash"></i> Delete' })
        } else {
            buttons.push({ text: '<i class="icon ion-flag"></i> Report' })
        }

        //index=3
        if (!$rootScope.isMe(user.uid)) {
            buttons.push({ text: '<i class="icon ion-trash"></i> Block' })
        }


        function muteUnmute(user) {
            if (user.me.isMuted == 0) {
                user.me.isMuted = 1;
                UserDataServices.muteUser(user.uid);

            } else {
                user.me.isMuted = 1
                UserDataServices.unMuteUser(user.uid);
                user.me.isFollower = 0;
            }
        }

        function blockUnblock(user) {
            if (!$rootScope.isMe(user.uid))
                UserDataServices.blockUser(user.uid);
        }

        var actionSheet = $ionicActionSheet.show({
            titleText: 'Actions',
            buttons: buttons,
            //destructiveText: 'Delete',
            cancelText: '<i class="icon rd-txt lg-icon-cross-small"></i> <span class="rd-txt">Close</span>',
            cancel: function() {},
            buttonClicked: function(index) {
                if (index == 0) { muteUnmute(user) }
                if (index == 2) { blockUnblock(user) }
                actionSheet();
            }
        })

    }

    $ionicModal.fromTemplateUrl('templates/modals/single-image-view-modal.html', function(modal) {
        $scope.imageModal = modal;
    }, {
        scope: $scope,
        animation: 'fade-in-scale'
    });
    $scope.openImageModal = function() {
        $scope.viewImage = $scope.user.profile.large;
        $scope.imageModal.show();
    }
    $scope.closeImageModal = function() {
        $scope.imageModal.hide();
    }
    $scope.$on('$destroy', function() {
        $scope.imageModal.remove();
    });

    $ionicModal.fromTemplateUrl('templates/modals/multiple-image-view-modal.html', function(modal) {
        $scope.multipleImageModal = modal;
    }, {
        scope: $scope,
        animation: 'fade-in-scale'
    });

    $scope.showImage = function(media, image, index) {
        $scope.aImages = media;
    }

    $scope.slideChanged = function(index) {
        $scope.slideIndex = index;
    };

    $scope.goToSlide = function(media, image, index) {
        $scope.aImages = media;
        $scope.multipleImageModal.show();
        $ionicSlideBoxDelegate.slide(index);
    }

    $scope.closeModalOnly = function() {
        $scope.multipleImageModal.hide();
    };

    // Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
        $scope.multipleImageModal.remove();
    });

    $rootScope.$on('WORK_ADDED_INDEX', function(event, args) {
        $scope.userWorkInfo.unshift(args.work);
    });

    $rootScope.$on('EDUCATION_ADDED_INDEX', function(event, args) {
        $scope.userEduInfo.unshift(args.edu);
    });
    // // Execute action on hide modal
    // $scope.$on('modal.hide', function() {
    //   // Execute action
    // });
    // // Execute action on remove modal
    // $scope.$on('modal.removed', function() {
    //   // Execute action
    // });
    // $scope.$on('modal.shown', function() {
    //   console.log('Modal is shown!');
    // });

})

.controller('UserInterest', function($scope, $state, UserDataServices, $stateParams) {

    $scope.uid = $stateParams.id;
    var offset = 0;
    var limit = 5;
    $scope.userInterest = [];
    $scope.noMoreContent = false;

    $scope.getMoreInterests = function(start) {
        var _start = start || false;
        UserDataServices.getUserInterests($scope.uid, { offset: offset, limit: limit }).success(function(res) {
            $scope.noMoreContent = false;
            if (_start) {
                $scope.userInterest = [];
            }
            if (res.data.length < limit) {
                $scope.noMoreContent = true;
            }
            $scope.userInterest = $scope.userInterest.concat(res.data);
            offset = offset + limit;
            if (_start) {
                $scope.$broadcast('scroll.refreshComplete');
            } else {
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }

        })
    }

})

.controller('WorkEduCtrl', function($scope, $state, $stateParams, $ionicViewSwitcher, $ionicPopup, workService, eduService, UserDataServices, $rootScope) {
    $scope.uid = $stateParams.id;

    $scope.myGoBack = function() {
        $ionicViewSwitcher.nextDirection('back');
        $state.go('app.profile', { id: $stateParams.id });
    };
    var eduOffset = 0;
    var eduLimit = 5;
    UserDataServices.Education.getAll($scope.uid, { offset: eduOffset, limit: eduLimit }).success(function(result) {
        $scope.userEduInfo = result.data;
    })

    $rootScope.$on('EDUCATION_ADDED', function(event, args) {
        $scope.userEduInfo.unshift(args.edu);
        $rootScope.$broadcast('EDUCATION_ADDED_INDEX', { edu: args.edu });
    });

    var eduOffset = 5;
    var eduLimit = 5;
    $scope.edu = [];
    $scope.loadEdu = function() {
        UserDataServices.Education.getAll($scope.uid, { offset: eduOffset, limit: eduLimit }).success(function(res) {

            if (res.data.length > 0) {
                $scope.userEduInfo = $scope.userEduInfo.concat(res.data);
                eduOffset = eduOffset + eduLimit;
            } else {
                $scope.endEdu = "No more data to show"
            }

        })
    }

    var workOffset = 0;
    var workLimit = 5;
    UserDataServices.Work.getAll($scope.uid, { offset: workOffset, limit: workLimit }).success(function(result) {
        $scope.userWorkInfo = result.data;
    })

    $rootScope.$on('WORK_ADDED', function(event, args) {

        $scope.userWorkInfo.unshift(args.work);
        $rootScope.$broadcast('WORK_ADDED_INDEX', { work: args.work });
    });

    var workOffset = 5;
    var workLimit = 5;
    $scope.work = [];
    $scope.loadWork = function() {
        UserDataServices.Work.getAll($scope.uid, { offset: workOffset, limit: workLimit }).success(function(res) {

            if (res.data.length > 0) {
                $scope.userWorkInfo = $scope.userWorkInfo.concat(res.data);
                workOffset = workOffset + workLimit;
            } else {
                $scope.endWork = "No more data to show"
            }

        })
    }


    $scope.editWork = function(work) {
        workService.set(work)
        $rootScope.navigateState('profile-work-add-edit', { id: work._id, uid: $scope.uid })
            // $state.go("app.profile-work-add-edit", { id: work._id, uid: $scope.uid });
    }

    $scope.deleteWork = function(workHistory) {
        var confirmPopup = $ionicPopup.show({
            title: 'Oops!!',
            template: 'Are you sure you want to delete?',
            buttons: [{ // Array[Object] (optional). Buttons to place in the popup footer.
                text: 'Cancel',
                type: 'button-default',
                onTap: function(e) {
                    // e.preventDefault() will stop the popup from closing when tapped.
                    //e.preventDefault();
                }
            }, {
                text: 'Delete',
                type: 'button-dark',
                onTap: function(e) {
                    // Returning a value will cause the promise to resolve with the given value.
                    $scope.deleteWorkHistory(workHistory._id)
                }
            }]
        });

    };

    $scope.deleteWorkHistory = function(id, ev, idx) {
        UserDataServices.Work.delete($scope.uid, id).success(function(result) {
            $scope.userWorkInfo.splice(idx, 1);
        })

    }

    $scope.addWork = function() {
        workService.set({});
        $rootScope.navigateState('profile-work-add-edit', { id: 0, uid: $scope.uid })
            //$state.go("app.profile-work-add-edit", { id: 0, uid: $scope.uid });
    }

    $scope.editEdu = function(edu) {
        eduService.set(edu)
        $rootScope.navigateState('profile-edu-add-edit', { id: edu.id, uid: $scope.uid })
            //        $state.go("app.profile-edu-add-edit", { id: edu.id, uid: $scope.uid });
    }

    $scope.deleteEdu = function(eduHistory) {
        var confirmPopup = $ionicPopup.show({
            title: 'Oops!!',
            template: 'Are you sure you want to delete?',
            buttons: [{ // Array[Object] (optional). Buttons to place in the popup footer.
                text: 'Cancel',
                type: 'button-default',
                onTap: function(e) {
                    // e.preventDefault() will stop the popup from closing when tapped.
                    //e.preventDefault();
                }
            }, {
                text: 'Delete',
                type: 'button-dark',
                onTap: function(e) {
                    // Returning a value will cause the promise to resolve with the given value.
                    $scope.deleteEduHistory(eduHistory.id)
                }
            }]
        });

    };

    $scope.deleteEduHistory = function(id, ev, idx) {
        UserDataServices.Education.delete($scope.uid, id).success(function(result) {
            $scope.userEduInfo.splice(idx, 1);
        })

    }

    $scope.addEdu = function() {
        eduService.set({})
        $rootScope.navigateState('profile-edu-add-edit', { id: 0, uid: $scope.uid });
        //$state.go("app.profile-edu-add-edit", { id: 0, uid: $scope.uid });
    }
})

.controller('WorkAddEditCtrl', function($scope, $state, $stateParams, workService, UserDataServices, $rootScope, $cordovaToast, $ionicHistory) {
    $scope.id = $stateParams.id;
    $scope.uid = $stateParams.uid;
    $scope.work = workService.get();

    $scope.addOrUpdate = function() {
        if ($scope.id == 0) {
            $scope.add()
        } else {
            $scope.update()
        }
    }

    if ($scope.id == 0) {
        $scope.work = {}
        $scope.work.from_year = new Date($scope.work.from_year);
        $scope.work.to_year = new Date($scope.work.to_year);
    }

    $scope.add = function() {
        $scope.work.from_year = $scope.work.from_year.toISOString();
        if ($scope.work.is_working == 1) {
            $scope.work.to_year = null
        } else {
            $scope.work.to_year = $scope.work.to_year.toISOString();
        }

        UserDataServices.Work.add($scope.uid, $scope.work).success(function(result) {
            $scope.work.from_year = new Date($scope.work.from_year);
            $scope.work.to_year = new Date($scope.work.to_year);
            $scope.work._id = result.data._id;
            $rootScope.$broadcast('WORK_ADDED', { work: $scope.work });
            try {
                $cordovaToast.showShortTop('Successfully added');
            } catch (e) {}
            $ionicHistory.goBack();

        })
    }

    function init() {
        $scope.work.from_year = new Date($scope.work.from_year)
        $scope.from_year = $scope.work.from_year.getFullYear();
        if ($scope.work.to_year == null) {
            $scope.work.to_year = ""
        } else {
            $scope.work.to_year = new Date($scope.work.to_year)
            $scope.to_year = $scope.work.to_year.getFullYear();
        }
    }
    if ($scope.id != 0) {
        init();
    }
    $scope.update = function() {
        $scope.work.from_year = $scope.work.from_year.toISOString();
        if ($scope.work.is_working == 1) {
            $scope.work.to_year = null;
        } else {
            $scope.work.to_year = $scope.work.to_year.toISOString();
        }

        UserDataServices.Work.update($scope.uid, $scope.id, $scope.work).success(function(res) {
            init();
            $scope.work.from_year = new Date($scope.work.from_year);
            $scope.work.to_year = new Date($scope.work.to_year);
            //$state.go('app.profile_work_edu',{id:0,uid:$scope.uid});
        }).error(function(err) {
            init();
        })
    }


    $scope.updateFromYear = function(from_year) {
        $scope.work.from_year.setFullYear(from_year)
    }

    $scope.updateToYear = function(to_year) {
        if (to_year == null) {
            $scope.work.to_year = to_year;
        } else {
            try {
                $scope.work.to_year.setFullYear(to_year)
            } catch (e) {
                $scope.work.to_year = new Date($scope.work.to_year)
            }

        }

    }


})

.controller('EduAddEditCtrl', function($scope, $state, $stateParams, eduService, UserDataServices, localStorageService, $rootScope, $cordovaToast, $ionicHistory) {
    loggedInUser = localStorageService.get('loggedInUser');
    $scope.id = $stateParams.id;
    $scope.uid = $stateParams.uid;
    $scope.edu = eduService.get();
    $scope.addOrUpdate = function() {
        if ($scope.id == 0) {
            add()
        } else {
            update()
        }
    }
    if ($scope.id == 0) {
        $scope.edu = {}
        $scope.edu.graduated = 0;
        $scope.edu.major = "test";
        $scope.edu.from_year = new Date($scope.edu.from_year);
        $scope.edu.to_year = new Date($scope.edu.to_year)
    }

    function add() {
        //$scope.checkbox = 0;

        //return false
        $scope.edu.from_year = $scope.edu.from_year.toISOString();
        $scope.edu.to_year = $scope.edu.to_year.toISOString();
        UserDataServices.Education.add($scope.uid, $scope.edu).success(function(result) {
            $scope.edu.from_year = new Date($scope.edu.from_year);
            $scope.edu.to_year = new Date($scope.edu.to_year);
            $scope.edu.id = result.data.id;
            $rootScope.$broadcast('EDUCATION_ADDED', { edu: $scope.edu });
            try {
                $cordovaToast.showShortTop('Successfully added');
            } catch (e) {}
            $ionicHistory.goBack();
        })
    }


    function init() {
        $scope.edu.from_year = new Date($scope.edu.from_year)
        $scope.from_year = $scope.edu.from_year.getFullYear();
        if ($scope.edu.to_year == null) {
            $scope.edu.to_year = ""
        } else {
            $scope.edu.to_year = new Date($scope.edu.to_year)
            $scope.to_year = $scope.edu.to_year.getFullYear();
        }
    }

    if ($scope.id != 0) { init(); }

    function update() {
        $scope.edu.from_year = $scope.edu.from_year.toISOString();
        $scope.edu.to_year = $scope.edu.to_year.toISOString();
        UserDataServices.Education.update($scope.uid, $scope.id, $scope.edu).success(function(res) {
            $scope.edu.from_year = new Date($scope.edu.from_year);
            $scope.edu.to_year = new Date($scope.edu.to_year)
            init();
        })
    }


    $scope.updateFromYear = function(from_year) {
        $scope.edu.from_year.setFullYear(from_year)
    }

    $scope.updateToYear = function(to_year) {
        if (to_year == null) {
            $scope.edu.to_year = to_year;
        } else {
            try {
                $scope.edu.to_year.setFullYear(to_year)
            } catch (e) {
                $scope.edu.to_year = new Date($scope.edu.to_year)
            }

        }
        //$scope.edu.to_year.setFullYear(to_year)
    }

})


.controller('ProfileEditCtrl', function($scope, UserDataServices, $state, $stateParams, User, $ionicHistory, $ionicActionSheet, ImageService, $rootScope, $q) {
    if ($ionicHistory.viewHistory().backView != null)
        $scope.$on('$ionicView.beforeEnter', function(event, viewData) {
            viewData.enableBack = true;
        });

    $scope.sessionUser = User.me();

    $scope.months = ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];

    UserDataServices.getBasicSettings().success(function(res) {
        $scope.user = res.data;
        $scope.user.dob = new Date($scope.user.dob)
        $scope.userMonth = $scope.months[$scope.user.dob.getMonth()];
        $scope.userDate = $scope.user.dob.getDate();
        $scope.userYear = $scope.user.dob.getFullYear();

    })

    $scope.locationChanged = function(location) {

        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({
            address: location
        }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                $scope.user.userDefinedLocation = results[0];
                $q.resolve(results);
            } else {
                $q.reject();
            }
        });
    }

    $scope.updateProfile = function() {
        if ($scope.user.dob != 'Invalid Date') {
            $scope.user.dob = $scope.user.dob.toISOString();
        }
        $rootScope.showLoading()
        UserDataServices.updateProfile($scope.user.uid, $scope.user).then(function(res) {
            $scope.user.dob = new Date($scope.user.dob)
            $rootScope.hideLoading()
        })
    }

    $rootScope.$on('profileImageChanged', function(event, args) {
        $scope.sessionUser.image = args.data.small;
        User.updateLS({ image: args.data });
    });

    $rootScope.$on('coverImageChanged', function(event, args) {
        $scope.sessionUser.cover = args.data.large;
        $scope.user.cover = args.data;
        User.updateLS({ cover: args.data });
    });

    $scope.updateProfileImage = function() {
        $rootScope.updateProfileImage();
    }

    $scope.updateDobDate = function(date) {
        $scope.user.dob.setDate(date)
    }

    $scope.updateDobMonth = function(month) {
        for (var i in $scope.months) {
            if (month == $scope.months[i]) {
                $scope.user.dob.setMonth(i)
            }
        };
    }

    $scope.updateDobYear = function(year) {
        $scope.user.dob.setFullYear(year)
    }

})


.controller('MeTabCtrl', function($ionicModal, $scope, $stateParams, $rootScope, Notifications, NotificationDataServices, User, UserDataServices, PushwooshState) {

    $scope.$on('$ionicView.beforeEnter', function() {
        $scope.user = User.getLoggedInUser();
        var push_state = PushwooshState.get()
        if (!isEmpty(push_state)) {
            //$scope.doRefresh();
            $rootScope.navigateState(push_state.state, { id: push_state.id });
            PushwooshState.set({});
        }

        if ($rootScope.unseenNotifications.unseen > 0) {
            $scope.doRefresh();
        }
        UserDataServices.connections($scope.user.uid, {}).success(function(res) {
            $scope.followingCount = res.data.followings.count;
            $scope.followerCount = res.data.followers.count;
            $scope.data = Notifications.get();
        })
    });


    $rootScope.$on('UNSHIFT_NOTIFCATION', function(event, args) {
        $scope.data.unshift(args.args)
    });

    $scope.$on('$ionicView.afterLeave', function() {
        Notifications.seen();
    })

    setTimeout(function() {
        $scope.data = Notifications.get();
    }, 200)


    $scope.UserNotifications = [];
    $scope.limit = 10;
    $scope.offset = 0;
    $scope.noMoreContent = true;
    $scope.noMoreLoadMore = true;

    $scope.loadNotifications = function(start) {
        var _start = start || false
        NotificationDataServices.get({ offset: $scope.offset, limit: $scope.limit }).success(function(res) {
            if (_start) {
                $scope.UserNotifications = [];
            }
            $scope.noMoreLoadMore = true;
            Notifications.put(res.data.notifications)
            if (res.data.notifications.length < $scope.limit) {
                $scope.noMoreContent = false;
                $scope.noMoreLoadMore = false;

            }
            //$scope.UserNotifications = $scope.UserNotifications.concat(res.data);
            $scope.offset = $scope.offset + $scope.limit;
            $scope.data = Notifications.get();
            if (_start) {
                $scope.$broadcast('scroll.refreshComplete');
            } else {
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
        })
    }

    $scope.doRefresh = function() {
        $scope.offset = 0;
        Notifications.makeEmpty();
        $scope.noMoreLoadMore = false;
        $scope.loadNotifications(true);
        $scope.noMoreContent = true
    }

})

.controller('CommentCtrl', function($scope, $stateParams, $ionicScrollDelegate, CommentDataServices, $ionicHistory, $rootScope) {

    $scope.id = $stateParams.id;
    $scope.comments = [];

    $scope.newcomment = "";
    $scope.GoBack = function() {

        if ($rootScope.isModalOpen) {
            $rootScope.isModalOpen = false;
            $ionicHistory.goBack();
            //             $rootScope.modal_index = index;
            // $rootScope.modal_activity_id = activityid;
            // $rootScope.modal_parent_id = parentid;
            $rootScope.goToSlide($rootScope.modal_index, $rootScope.modal_activity_id, $rootScope.modal_parent_id)
        } else {
            $ionicHistory.goBack();
        }
    }

    var offset = 0;
    var limit = 10;
    $scope.noMoreContent = true;

    $scope.isLoading = true;
    $scope.loadPreviousComments = function() {
        if ($scope.noMoreContent) {
            CommentDataServices.getAll($scope.id, { offset: offset, limit: limit }).success(function(result) {
                if (result.data.length < limit) {
                    $scope.noMoreContent = false
                    $ionicScrollDelegate.resize();
                }
                offset = offset + limit;
                $scope.comments = result.data.concat($scope.comments);
                $scope.$broadcast('scroll.refreshComplete');
                $scope.isLoading = false;
                $ionicScrollDelegate.$getByHandle('comment-handle').scrollBottom(true);
            });
        } else {
            $ionicScrollDelegate.resize();
        }
    }
    $scope.loadPreviousComments();

    $scope.isCommentPosting = false;
    $scope.comment = function(id) {


        if ($scope.isCommentPosting == true || $scope.newcomment.length == 0) return;
        $scope.isCommentPosting = true;

        var params = { comment_txt: $scope.newcomment, comment_type: "TEXT" }
        if ($scope.file != null) {
            params.attach_id = $scope.file.fileId;
        }

        CommentDataServices.post(id, params).success(function(result) {

            $ionicScrollDelegate.$getByHandle('comment-handle').resize();
            $ionicScrollDelegate.$getByHandle('comment-handle').scrollBottom(true);
            $scope.newcomment = "";
            $scope.comments.push(result.data);
            $scope.isCommentPosting = false;

        }).error(function(err) {
            $scope.isCommentPosting = false;
        });
    }

    $scope.hidekeyboard = false;
    $scope.keyboardhide = function() {
        $ionicScrollDelegate.$getByHandle('chat-convo-handle').resize();
        $ionicScrollDelegate.$getByHandle('chat-convo-handle').scrollBottom(true);
        $scope.hidekeyboard = true;
        cordova.plugins.Keyboard.close();
    }
})

.controller('UserActivities', function($scope, $state, $stateParams, $ionicViewSwitcher, UserDataServices, localStorageService) {


    $scope.myGoBack = function() {
        $ionicViewSwitcher.nextDirection('back');
        $state.go('app.profile', { id: $stateParams.id });
    };
    $scope.middleState = $state.current.name.split(".")[1];
    $scope.uid = $stateParams.id;
})

.controller('ConsolidatedUserCtrl', ['$scope', 'FeedServices', 'activityService', function($scope, FeedServices, activityService) {

    $scope.activity = activityService.get()
    $scope.activities = []

    var offset = 0;
    var limit = 2;

    $scope.noMoreContent = true;
    $scope.getFollowingNetworkList = function(activity, start) {
        var _start = start || false
            // if (activity.isLoading === true) return false;
            // activity.isLoading = true;
        var type = 'USER_FOLLOWED';
        params = { offset: offset, limit: limit, startTime: activity.startTime, endTime: activity.endTime, activityType: type }
        FeedServices.getFollowingNetworkList(params).success(function(res) {
            $scope.isLoading = false;
            if (_start) {
                $scope.activities = [];
            }

            if (isEmpty(res.data) || res.data.list.length < limit) {
                $scope.noMoreContent = false
            }

            if (!isEmpty(res.data)) {
                $scope.activities = $scope.activities.concat(res.data.list);
            }

            offset = offset + limit;
            if (_start) {
                $scope.$broadcast('scroll.refreshComplete');
                //$scope.$apply()
            } else {
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
            // if (Object.keys(res.data).length !== 0) {
            //     activity.list = activity.list.concat(res.data.list);
            // } else {
            //     console.log("done")
            //     activity.noMore = true;
            // }
            // activity.isLoading = false;
        })
    }

    //$scope.getFollowingNetworkList(activity);        
}])

.controller('ConsolidatedGoalCtrl', ['$scope', 'FeedServices', 'activityService', function($scope, FeedServices, activityService) {

    $scope.activity = activityService.get()
    $scope.activities = []

    var offset = 0;
    var limit = 2;

    $scope.noMoreContent = true;
    $scope.getFollowingNetworkList = function(activity, start) {
        var _start = start || false
            // if (activity.isLoading === true) return false;
            // activity.isLoading = true;
        var type = 'GOAL_FOLLOWED';
        params = { offset: offset, limit: limit, startTime: activity.startTime, endTime: activity.endTime, activityType: type }
        FeedServices.getFollowingNetworkList(params).success(function(res) {
            $scope.isLoading = false;
            if (_start) {
                $scope.activities = [];
            }

            if (isEmpty(res.data) || res.data.list.length < limit) {
                $scope.noMoreContent = false
            }

            if (!isEmpty(res.data)) {
                $scope.activities = $scope.activities.concat(res.data.list);
            }

            offset = offset + limit;
            if (_start) {
                $scope.$broadcast('scroll.refreshComplete');
                //$scope.$apply()
            } else {
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
            // if (Object.keys(res.data).length !== 0) {
            //     activity.list = activity.list.concat(res.data.list);
            // } else {
            //     console.log("done")
            //     activity.noMore = true;
            // }
            // activity.isLoading = false;
        })
    }

    //$scope.getFollowingNetworkList(activity);        
}])

.controller('UserConnections', UserIdCtrl)


.controller('UserGoals', function($scope, $state, $stateParams, UserDataServices, $rootScope, User) {
    $scope.sessionUser = User.me();
    $scope.uid = $stateParams.id;
    $scope.UserGoals = [];
    var offset = 0;
    var limit = 5;
    $scope.noMoreContent = true;
    $scope.title = "Goals"
    $scope.getUserGoals = function(start) {
        var _start = start || false
        UserDataServices.getUserGoals($scope.uid, { offset: offset, limit: limit }).success(function(result) {
            if (_start) {
                $scope.UserGoals = [];
            }
            if (result.data.goals.length < limit) {
                $scope.noMoreContent = false
            }
            $scope.UserGoals = $scope.UserGoals.concat(result.data.goals);
            offset = offset + limit;
            if (_start) {
                $scope.$broadcast('scroll.refreshComplete');
            } else {
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
        })
        $scope.doRefresh = function() {
            offset = 0;
            $scope.getUserGoals(true);
            $scope.noMoreContent = true
        }
    }

    $rootScope.$on('GOAL_DELETED', function(event, args) {
        $scope.UserGoals.splice(args.i, 1);
    })
})

.controller('UserPosts', function($scope, $state, $stateParams, UserDataServices) {
    $scope.uid = $stateParams.id;
    $scope.UserPosts = [];
    var postsOffset = 0;
    var postsLimit = 5;
    $scope.noMoreContent = true;
    $scope.getUserPosts = function(start) {
        var _start = start || false

        UserDataServices.getUserPosts($scope.uid, { filter: "post", offset: postsOffset, limit: postsLimit }).success(function(result) {
            if (_start) {
                $scope.UserPosts = [];
            }
            if (result.data.length < postsLimit) {
                $scope.noMoreContent = false
            }
            $scope.UserPosts = $scope.UserPosts.concat(result.data);
            postsOffset = postsOffset + postsLimit;
            if (_start) {
                $scope.$broadcast('scroll.refreshComplete');
            } else {
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
        })
    }

    $scope.doRefresh = function() {
        offset = 0;
        $scope.getUserPosts(true);
        $scope.noMoreContent = true
    }
})

.controller('UserInteractions', function($scope, $state, $stateParams, UserDataServices) {
    $scope.uid = $stateParams.id;
    $scope.filter = "interactions";

    // User Interactions
    $scope.UserInteractions = [];
    var interactionsOffset = 0;
    var interactionsLimit = 5;
    $scope.noMoreContent = true;
    $scope.getUserInteractions = function(start) {
        var _start = start || false

        UserDataServices.getUserPosts($scope.uid, { filter: "interactions", offset: interactionsOffset, limit: interactionsLimit }).success(function(result) {
            if (_start) {
                $scope.UserInteractions = [];
            }
            if (result.data.length < interactionsLimit) {
                $scope.noMoreContent = false
            }
            $scope.UserInteractions = $scope.UserInteractions.concat(result.data);
            interactionsOffset = interactionsOffset + interactionsLimit;
            if (_start) {
                $scope.$broadcast('scroll.refreshComplete');
            } else {
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
        })
    }

    $scope.doRefresh = function() {
        offset = 0;
        $scope.getUserInteractions(true);
        $scope.noMoreContent = true
    }

})



.controller('UserFollowersCtrl', function($scope, $stateParams, $state, $ionicViewSwitcher, $cordovaStatusbar, UserDataServices, $location) {


    $scope.myGoBack = function() {
        $ionicViewSwitcher.nextDirection('back');
        $state.go('app.profile', { id: $stateParams.id });
    };

    var offset = 0;
    var limit = 10;

    $scope.users = [];

    $scope.title = "Followers";

    $scope.noMoreContent = true
    $scope.getUsers = function(start) {
        var _start = start || false
        UserDataServices.getUserFollowers($stateParams.id, { offset: offset, limit: limit }).success(function(result) {
            $scope.isLoading = false;
            if (_start) {
                $scope.users = [];
            }

            if (result.data.followers.users.length < limit) {
                $scope.noMoreContent = false
            }

            $scope.users = $scope.users.concat(result.data.followers.users);
            offset = offset + limit;
            if (_start) {
                $scope.$broadcast('scroll.refreshComplete');
                //$scope.$apply()
            } else {
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
        })
    }
    $scope.doRefresh = function() {
        offset = 0;
        $scope.getUsers(true);
        $scope.noMoreContent = true
    }


})

.controller('PostMotivationsCtrl', function($scope, $stateParams, $state, $ionicViewSwitcher, $cordovaStatusbar, Post, $location) {


    $scope.myGoBack = function() {
        $ionicViewSwitcher.nextDirection('back');
        $state.go('app.profile', { id: $stateParams.id });
    };

    var offset = 0;
    var limit = 10;

    $scope.users = [];
    $scope.title = "Motivators"

    $scope.noMoreContent = true
    $scope.getUsers = function(start) {
        var _start = start || false
        Post.getMotivators($stateParams.id, { offset: offset, limit: limit }).success(function(result) {
            $scope.isLoading = false;
            if (_start) {
                $scope.users = [];
            }

            if (result.data.users.length < limit) {
                $scope.noMoreContent = false
            }

            $scope.users = $scope.users.concat(result.data.users);
            offset = offset + limit;
            if (_start) {
                $scope.$broadcast('scroll.refreshComplete');
                //$scope.$apply()
            } else {
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
        })
    }
    $scope.doRefresh = function() {
        offset = 0;
        $scope.getUsers(true);
        $scope.noMoreContent = true
    }


})

.controller('GoalMotivatorCtrl', function($scope, $stateParams, $state, $ionicViewSwitcher, $cordovaStatusbar, GoalsDataServices, $location) {


    $scope.myGoBack = function() {
        $ionicViewSwitcher.nextDirection('back');
        $state.go('app.profile', { id: $stateParams.id });
    };

    var offset = 0;
    var limit = 10;

    $scope.users = [];
    $scope.title = "Motivators"

    $scope.noMoreContent = true
    $scope.getUsers = function(start) {
        var _start = start || false
        GoalsDataServices.getMotivators($stateParams.id, { offset: offset, limit: limit }).success(function(result) {
            $scope.isLoading = false;
            if (_start) {
                $scope.users = [];
            }

            if (result.data.users.length < limit) {
                $scope.noMoreContent = false
            }

            $scope.users = $scope.users.concat(result.data.users);
            offset = offset + limit;
            if (_start) {
                $scope.$broadcast('scroll.refreshComplete');
                //$scope.$apply()
            } else {
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
        })
    }
    $scope.doRefresh = function() {
        offset = 0;
        $scope.getUsers(true);
        $scope.noMoreContent = true
    }


})

.controller('GoalLinkerCtrl', function($scope, $stateParams, $state, $ionicViewSwitcher, $cordovaStatusbar, GoalsDataServices, $location) {


    $scope.myGoBack = function() {
        $ionicViewSwitcher.nextDirection('back');
        $state.go('app.profile', { id: $stateParams.id });
    };

    var offset = 0;
    var limit = 10;

    $scope.users = [];
    $scope.title = "Linkers"

    $scope.noMoreContent = true
    $scope.getUsers = function(start) {
        var _start = start || false
        GoalsDataServices.getLinkers($stateParams.id, { offset: offset, limit: limit }).success(function(result) {
            $scope.isLoading = false;
            if (_start) {
                $scope.users = [];
            }

            if (result.data.users.length < limit) {
                $scope.noMoreContent = false
            }

            $scope.users = $scope.users.concat(result.data.users);
            offset = offset + limit;
            if (_start) {
                $scope.$broadcast('scroll.refreshComplete');
                //$scope.$apply()
            } else {
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
        })
    }
    $scope.doRefresh = function() {
        offset = 0;
        $scope.getUsers(true);
        $scope.noMoreContent = true
    }


})

.controller('GoalFollowerCtrl', function($scope, $stateParams, $state, $ionicViewSwitcher, $cordovaStatusbar, GoalsDataServices, $location) {


    $scope.myGoBack = function() {
        $ionicViewSwitcher.nextDirection('back');
        $state.go('app.profile', { id: $stateParams.id });
    };

    var offset = 0;
    var limit = 10;

    $scope.users = [];
    $scope.title = "Followers"

    $scope.noMoreContent = true
    $scope.getUsers = function(start) {
        var _start = start || false
        GoalsDataServices.getFollowers($stateParams.id, { offset: offset, limit: limit }).success(function(result) {
            $scope.isLoading = false;
            if (_start) {
                $scope.users = [];
            }

            if (result.data.users.length < limit) {
                $scope.noMoreContent = false
            }

            $scope.users = $scope.users.concat(result.data.users);
            offset = offset + limit;
            if (_start) {
                $scope.$broadcast('scroll.refreshComplete');
                //$scope.$apply()
            } else {
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
        })
    }
    $scope.doRefresh = function() {
        offset = 0;
        $scope.getUsers(true);
        $scope.noMoreContent = true
    }


})


.controller('UserFollowingsCtrl', function($scope, $state, $ionicViewSwitcher, $stateParams, $cordovaStatusbar, UserDataServices, $location) {

    $scope.myGoBack = function() {
        $ionicViewSwitcher.nextDirection('back');
        $state.go('app.profile', { id: $stateParams.id });
    };

    uid = $stateParams.id;

    $scope.title = "Followings";


    var offset = 0
    var limit = 10
    $scope.users = [];

    $scope.noMoreContent = true;
    $scope.getUsers = function(start) {
        var _start = start || false
        UserDataServices.getUserFollowing(uid, { offset: offset, limit: limit }).success(function(result) {

            if (_start) {
                $scope.users = [];
            }

            if (result.data.followings.users.length < limit) {
                $scope.noMoreContent = false
            }

            $scope.users = $scope.users.concat(result.data.followings.users);
            offset = offset + limit;
            if (_start) {
                $scope.$broadcast('scroll.refreshComplete');
                //$scope.$apply()
            } else {
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
        })
    }
    $scope.doRefresh = function() {
        offset = 0;
        $scope.getUsers(true);
    }

})



.controller('UserMutualConnections', function($scope, $rootScope, $state, $ionicViewSwitcher, $stateParams, $cordovaStatusbar, UserDataServices) {

    $scope.myGoBack = function() {
        $ionicViewSwitcher.nextDirection('back');
        $rootScope.navigateState('profile-mutual-connections', { id: $stateParams.id });
    };

    $scope.title = "Mutual Connections";

    uid = $stateParams.id;
    setTimeout(function() {
        $cordovaStatusbar.style(0);
    }, 2000)

    var offset = 0;
    var limit = 5;
    $scope.users = [];
    $scope.noMoreFeedContent = false;
    $scope.getUsers = function(start) {
        var _start = start || false
        $scope.isLoading = true;
        UserDataServices.getUserMutual(uid, { offset: offset, limit: limit }).success(function(result) {
            $scope.isLoading = false;
            if (_start) {
                $scope.users = [];
            }
            $scope.users = $scope.users.concat(result.data.mutualFollowings.users);
            offset = offset + limit;
            if (_start) {
                $scope.$broadcast('scroll.refreshComplete');
                //$scope.$apply()
            } else {
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
        })
    }

    $scope.doRefresh = function() {
        offset = 0;
        $scope.getUsers(true);
    }

    $scope.$on('$stateChangeSuccess', function() {
        $scope.getUsers();
    });
})

.controller('UserFollowers', function($scope, $stateParams, UserDataServices) {

    uid = $stateParams.id;
    UserDataServices.getUserFollowers(uid).success(function(result) {
        $scope.users = result.data.followers.users;
    })

})

.controller('UserFollowings', function($scope, $stateParams, UserDataServices) {

    uid = $stateParams.id;
    UserDataServices.getUserFollowing(uid).success(function(result) {
        $scope.users = result.data.followings.users;
    })

})

.controller('GoalMilestoneCtrl', function($scope, $rootScope, $state, $stateParams, $ionicPopup, ownerUid, GoalsDataServices, $ionicListDelegate, MilestoneServices, appModalService, goalService, $ionicLoading) {


    $scope.newMilestone = {}
    $scope.newMilestone.text = "";
    $scope.milestones = [];

    $scope.ownerId = ownerUid.get();
    $scope.goalDetails = goalService.get();

    $scope.isLoading = true;
    GoalsDataServices.getMilestones($stateParams.id).success(function(result) {
        $scope.milestones = result.data;
        $scope.isLoading = false;

    })

    $scope.data = {
        showDelete: false
    };


    $scope.edit = function(milestone) {
        $scope.data = {}
        $scope.data.text = milestone.text


        var myPopup = $ionicPopup.show({
            template: '<input type="text" ng-value="data.text" ng-model="data.text">',
            scope: $scope,
            title: 'Edit Milestone',
            buttons: [{
                text: 'Cancel',
                onTap: function(e) {
                    return 'cancel button'
                }
            }, {
                text: '<b>Ok</b>',
                type: 'button-positive',
                onTap: function(e) {
                    if (!$scope.data.text) {
                        //don't allow the user to close unless he enters milestone 
                        e.preventDefault();
                    } else {
                        var params = { text: $scope.data.text };
                        MilestoneServices.editMilestone(milestone.id, params).success(function(res) {
                            milestone.text = $scope.data.text
                            $ionicListDelegate.closeOptionButtons();
                            $rootScope.showLoading("Saving...");
                        })
                    }
                }
            }, ]
        });


    };


    $scope.achieve = function(milestone) {
        appModalService.show('templates/modals/milestone-achieve.html', 'MilestoneAchieveCtrl as vm', milestone).then(function(res) {
            var params = { text: res.text };
            $rootScope.showLoading("Posting...");
            MilestoneServices.achieve(milestone.id, params).success(function(res) {
                $ionicListDelegate.closeOptionButtons();
                $rootScope.hideLoading();
                $rootScope.$broadcast('MILESTONE', { data: milestone });
            });
        });
    };

    $rootScope.$on('MILESTONE', function(event, args) {
        args.data.status = '';
    })

    $scope.moveItem = function(item, fromIndex, toIndex) {
        $scope.milestones.splice(fromIndex, 1);
        $scope.milestones.splice(toIndex, 0, item);
    };

    $scope.delete = function(milestone) {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Delete Milestone',
            template: 'Are you sure? ',
        });

        confirmPopup.then(function(res) {
            if (res) {
                $rootScope.showLoading("Deleting...")
                var params = { text: milestone.text };
                MilestoneServices.deleteMilestone(milestone.id, params).success(function(res) {
                    $rootScope.$broadcast('DELETE_MILESTONE', { index: $scope.milestones.indexOf(milestone) });
                    $rootScope.hideLoading();
                    $scope.milestones.splice($scope.milestones.indexOf(milestone), 1);
                    $ionicListDelegate.closeOptionButtons();
                });
            } else {
                //console.log('You clicked on "Cancel" button');
            }

        });

    };

    $scope.addMilestone = function() {
        if ($scope.newMilestone.text.length == 0) return;
        var params = { text: $scope.newMilestone.text, seq_number: (($scope.milestones.length + (1) * 1)) }
        GoalsDataServices.postMilestone($stateParams.id, params).success(function(result) {
            $scope.newMilestone.text = "";
            $scope.milestones.push(result.data.milestone)
            $rootScope.$broadcast('ADD_MILESTONE', { data: result.data.milestone });
        })
    }


})


.controller('GoalCtrl', function($rootScope, $scope, ownerUid, $ionicActionSheet, $cordovaToast, $ionicNavBarDelegate, $stateParams, $ionicHistory, $cordovaStatusbar, $state, GoalsDataServices, UserDataServices, appModalService, User, ImageService, goalService, $ionicPopup, MilestoneServices, $ionicListDelegate, $ionicLoading) {
    $ionicNavBarDelegate.showBar(false);

    $scope.goBack = function() {
        setTimeout(function() {
            $ionicHistory.goBack(-1);
        }, 100)
    };

    // setTimeout(function() {
    //     $cordovaStatusbar.hide();
    //     // $cordovaStatusbar.style(1);
    // }, 100)

    //$scope.tab = 1;
    $scope.goalTab = function(newTab) {
        $scope.tab = newTab;
        $scope.getContent(newTab);
    }

    $scope.isgoalTab = function(tabNum) {
            return $scope.tab === tabNum;
        }
        //$scope.isMyGoal = ($scope.goal.user.uid === User.getLoggedInUserId()) ? true : false;
    $scope.getGoalData = function() {
        $scope.goalDetails = []
        GoalsDataServices.getGoal($stateParams.id).success(function(result) {
            $scope.goalDetails = result.data.goal;
            goalService.set(result.data.goal);
            ownerUid.set(result.data.goal.user.uid);
            $scope.isMyGoal = ($scope.goalDetails.user.uid === User.getLoggedInUserId()) ? true : false;
            UserDataServices.getUserFollowing($scope.goalDetails.user.uid).success(function(result) {
                $scope.userFollowing = result.data;
            })
            UserDataServices.getUserFollowers($scope.goalDetails.user.uid).success(function(result) {
                $scope.userFollowers = result.data;
            })
            GoalsDataServices.getLinkers($scope.goalDetails.id).success(function(result) {
                $scope.goalLinkers = result.data;
            })

            GoalsDataServices.getMilestones($scope.goalDetails.id).success(function(result) {
                $scope.goalMilestones = result.data;
            })

            $scope.media = [];
            GoalsDataServices.getImages($stateParams.id, { offset: 0, limit: 8 }).success(function(result) {
                if (result.data.length > 1) {
                    for (var i = 0; i < result.data.images.length; i++) {
                        if (typeof result.data.images[i].files[0].source.square != "undefined") {
                            $scope.media.push({ src: result.data.images[i].files[0].source.square.src })
                        }
                    }
                }
            });
            $scope.$broadcast('scroll.refreshComplete');
        })
    }

    $rootScope.$on('ADD_MILESTONE', function(event, args) {
        $scope.goalMilestones.push(args.data)
    })

    $rootScope.$on('DELETE_MILESTONE', function(event, args) {
        $scope.goalMilestones.splice(args.index, 1);
    })
    $scope.getGoalData();

    $scope.getContent = function(tab) {
        if (tab == 1 && !$scope.isContentFinished(1)) {
            $scope.goalUpdatesFeed()
        } else if (tab == 2 && !$scope.isContentFinished(2)) {
            $scope.linkedGoal()
        } else if (tab == 3 && !$scope.isContentFinished(3)) {
            $scope.linkedGoalFeed()
        }

    }

    $scope.isContentFinished = function(tab) {
        var isConentFinished = true
        switch (tab) {
            case 1:
                isConentFinished = $scope.noMoreGoalUpdatesContent;
                break;
            case 2:
                isConentFinished = $scope.noMoreLinkedGoalsContent;
                break;
            case 3:
                isConentFinished = $scope.noMoreLinkedFeedContent
                break;
            default:
                return false;
                break;
        }
        return isConentFinished;
    }

    $scope.goalUpdates = [];
    var goalUpdatesOffset = 0;
    var goalUpdatesLimit = 5;
    $scope.noMoreGoalUpdatesContent = false;
    $scope.goalUpdatesFeed = function(start) {
        $scope.noMoreGoalUpdatesContent = true;
        var _start = start || false
        GoalsDataServices.getGoalFeed($stateParams.id, { offset: goalUpdatesOffset, limit: goalUpdatesLimit }).success(function(result) {
            if (_start) {
                $scope.goalUpdates = [];
            }
            $scope.goalUpdates = $scope.goalUpdates.concat(result.data);
            if (result.data.length < goalUpdatesLimit) {
                $scope.noMoreGoalUpdatesContent = false
            }

            goalUpdatesOffset = goalUpdatesOffset + goalUpdatesLimit;
            $scope.$broadcast('scroll.infiniteScrollComplete');
        })
    }

    $scope.linkedFeed = [];
    var linkedOffset = 0;
    var linkedLimit = 5;
    $scope.noMoreLinkedFeedContent = false;
    $scope.linkedGoalFeed = function(start) {
        $scope.noMoreLinkedFeedContent = true;
        var _start = start || false
        GoalsDataServices.getLinkedGoalsFeed($stateParams.id, { offset: linkedOffset, limit: linkedLimit }).success(function(result) {
            if (_start) {
                $scope.linkedFeed = [];
            }
            $scope.linkedFeed = $scope.linkedFeed.concat(result.data);
            if (result.data.length < linkedLimit) {
                $scope.noMoreLinkedFeedContent = false
            }

            linkedOffset = linkedOffset + linkedLimit;
            $scope.$broadcast('scroll.infiniteScrollComplete');
        })
    }

    $scope.linkedGoals = [];

    var offsetLinkedGoal = 0;
    var limitLinkedGoal = 5;
    $scope.noMoreLinkedGoalsContent = false;

    $scope.linkedGoal = function(start) {
        $scope.noMoreLinkedGoalsContent = true;
        var _start = start || false

        GoalsDataServices.getLinkedGoals($stateParams.id, { offset: offsetLinkedGoal, limit: limitLinkedGoal }).success(function(result) {
            if (_start) {
                $scope.linkedGoals = [];
            }
            $scope.linkedGoals = $scope.linkedGoals.concat(result.data.goals);
            if (result.data.goals.length < limitLinkedGoal) {
                $scope.noMoreLinkedGoalsContent = false
            }

            offsetLinkedGoal = offsetLinkedGoal + limitLinkedGoal;
            if (_start) {
                $scope.$broadcast('scroll.refreshComplete');
            } else {
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
        })
    }


    $scope.motivationOnGoal = function(goal) {
        if (goal.me.isMotivated == 0) {
            goal.me.isMotivated = 1;
            goal.stats.motivations = goal.stats.motivations + 1;
            GoalsDataServices.motivate(goal.id, 0);
        } else {
            goal.me.isMotivated = 0;
            goal.stats.motivations = goal.stats.motivations - 1;
            GoalsDataServices.motivate(goal.id, 1)
        }
    }

    $scope.achieveOnGoal = function(goal) {
        if (goal.status == "COMPLETED") return;
        appModalService.show('templates/modals/goal-achieve.html', 'GoalAchieveCtrl as vm', goal).then(function(res) {
            if (res != null) {
                GoalsDataServices.achieve(goal.id, res).success(function(e) {
                    $scope.goalDetails = e.data.goal;
                    try {
                        $cordovaToast.showShortTop('Successfully achieved');
                    } catch (e) {}
                });
            }
        });
    }

    $scope.GoalContribute = function(goal) {
        appModalService.show('templates/modals/goal-contribution.html', 'ContributeCtrl as vm', goal).then(function(res) {
            if (res != null) {
                GoalsDataServices.postContribution(goal.id, res).success(function(e) {
                    try {
                        $cordovaToast.showShortTop('Successfully contributed');
                    } catch (e) {}
                });
            }
        });
    }


    $scope.GoalEdit = function(goal) {
        appModalService.show('templates/goal/edit.html', 'GoalEditCtrl as vm', goal).then(function(result) {
            if (result != null) {
                var params = {
                    goal_name: result.name,
                    goal_description: result.description,
                    category_id: result.category_id || 1,
                    scope_id: result.scope_id
                }

                GoalsDataServices.updateGoal(result.id, params).success(function(res) {
                        $scope.goalDetails.name = res.data.name;
                        $scope.goalDetails.description = res.data.description;
                    })
                    .error(function(err) {
                        //console.log("error");
                    })
            }
        });
    }

    $scope.updateGoalCover = function() {

        var actionSheet = $ionicActionSheet.show({
            titleText: 'Actions',
            buttons: [{ text: '<i class="icon lg-icon-gallery"></i> Gallery' }, { text: '<i class="icon lg-icon-camera"></i> Camera' }],
            //destructiveText: 'Delete',
            cancelText: '<i class="icon rd-txt lg-icon-cross-small"></i> <span class="rd-txt">Close</span>',
            cancel: function() {},
            buttonClicked: function(index) {
                if (index == 0) {
                    ImageService.UploadNow('goal', false, true).then(function(res) {
                        params = { attach_id: res.data.fileId }
                        GoalsDataServices.changeImage($scope.goalDetails.id, params).success(function(result) {
                            $scope.goalDetails.cover.large = res.data.file.large;
                        })
                    });
                }
                if (index == 1) {
                    ImageService.UploadNow('goal', true, true).then(function(res) {
                        params = { attach_id: res.data.fileId }
                        GoalsDataServices.changeImage($scope.goalDetails.id, params).success(function(result) {
                            $scope.goalDetails.cover.large = res.data.file.large;
                        })
                    });
                }
                actionSheet();
            }
        })
    }
    $scope.updateProgress = function(goal) {
        try {
            cordova.plugins.Keyboard.disableScroll(true)
        } catch (e) {}
        appModalService.show('templates/modals/update-progress.html', 'CreateProgressCtrl as vm', goal).then(function(result) {})
    }

    $scope.GoalsActionSheet = function(goal) {
        var buttons = [];

        //index=0
        if (goal.me.isMuted == 0) {
            buttons.push({ text: '<i class="icon lg-icon-notification"></i> Mute' })
        } else {
            buttons.push({ text: '<i class="icon lg-icon-notification"></i> Unmute' })
        }

        if ($rootScope.isMe(goal.user.uid)) {
            buttons.push({ text: '<i class="icon lg-icon-edit"></i> Edit Goal' });
            buttons.push({ text: '<i class="icon lg-icon-camera"></i> Change Goal Cover' });
            buttons.push({ text: '<i class="icon lg-icon-delete"></i> Delete Goal' })
        }

        //index=1 
        if ($rootScope.isMe(goal.user.uid)) {
            //buttons.push({ text: '<i class="icon ion-trash"></i> Delete' })
        } else {
            buttons.push({ text: '<i class="icon ion-flag"></i> Report' })
        }

        function GoalmuteUnmute(goal) {
            if (goal.me.isMuted == 0) {
                goal.me.isMuted = 1;
                GoalsDataServices.muteGoal(goal.user.uid);
            } else {
                goal.me.isMuted = 1
                GoalsDataServices.unMuteGoal(goal.user.uid);
                goal.me.isMuted = 0;
            }
        }

        var actionSheet = $ionicActionSheet.show({
            titleText: 'Actions',
            buttons: buttons,
            //destructiveText: 'Delete',
            cancelText: '<i class="icon rd-txt lg-icon-cross-small"></i> <span class="rd-txt">Close</span>',
            cancel: function() {},
            buttonClicked: function(index) {
                if (index == 0) { GoalmuteUnmute(goal) }
                if (index == 1) { $scope.GoalEdit(goal) }
                if (index == 2) { $scope.updateGoalCover() }
                if (index == 3) { $scope.deleteGoal(goal) }
                actionSheet();
            }
        })
    }

    $scope.deleteGoal = function(goal) {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Delete',
            template: 'Are you sure you want to delete this goal?'
        });

        confirmPopup.then(function(res) {
            if (res) {
                $ionicLoading.show({
                    content: 'Deleting Goal.',
                    animation: 'fade-in',
                    showBackdrop: true,
                    maxWidth: 200,
                    showDelay: 0
                });

                $ionicHistory.clearCache()
                GoalsDataServices.deletGoal(goal.id).success(function(res) {
                    if (res.meta.status == 200) {
                        $ionicLoading.hide();
                        $ionicHistory.goBack();
                    }
                })
            } else {
                console.log('You are not sure');
            }
        });
    }

    $scope.edit = function(milestone) {
        $scope.data = {}
        $scope.data.text = milestone.text


        var myPopup = $ionicPopup.show({
            template: '<input type="text" ng-value="data.text" ng-model="data.text">',
            scope: $scope,
            title: 'Edit Milestone',
            buttons: [{
                text: 'Cancel',
                onTap: function(e) {
                    return 'cancel button'
                }
            }, {
                text: '<b>Ok</b>',
                type: 'button-positive',
                onTap: function(e) {
                    if (!$scope.data.text) {
                        //don't allow the user to close unless he enters milestone 
                        e.preventDefault();
                    } else {
                        var params = { text: $scope.data.text };
                        $rootScope.showLoading("Saving...");
                        MilestoneServices.editMilestone(milestone.id, params).success(function(res) {
                            milestone.text = $scope.data.text
                            $ionicListDelegate.closeOptionButtons();
                            $rootScope.hideLoading();
                        })
                    }
                }
            }, ]
        });
    };


    $scope.achieve = function(milestone) {
        appModalService.show('templates/modals/milestone-achieve.html', 'MilestoneAchieveCtrl as vm', milestone).then(function(res) {
            var params = { text: res.text };
            $rootScope.showLoading("Posting...");
            MilestoneServices.achieve(milestone.id, params).success(function(res) {

                $ionicListDelegate.closeOptionButtons();
                $rootScope.$broadcast('MILESTONE', { data: milestone });
                $rootScope.hideLoading("");
            });
        });
    };

    $scope.delete = function(milestone) {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Delete Milestone',
            template: 'Are you sure? ',
        });

        confirmPopup.then(function(res) {
            if (res) {
                $rootScope.showLoading("Deleting...")
                var params = { text: milestone.text };
                MilestoneServices.deleteMilestone(milestone.id, params).success(function(res) {
                    $rootScope.$broadcast('DELETE_MILESTONE', { index: $scope.goalMilestones.indexOf(milestone) });
                    $rootScope.hideLoading();
                    $scope.goalMilestones.splice($scope.goalMilestones.indexOf(milestone), 1);
                    $ionicListDelegate.closeOptionButtons();
                });
            } else {
                //console.log('You clicked on "Cancel" button');
            }

        });

    };
})


.controller('MoreCtrl', function($scope, UserDataServices, NotificationDataServices, User, $stateParams, $rootScope) {
    $scope.items = ["Action 1", "Logout", "Privacy Settings"]
    $scope.sessionUser = User.me();

    $scope.myGoals = [];

    $scope.showEmptyData = false;

    var page = offset = 0;
    var limit = 5;
    $scope.noMoreContent = false;
    $scope.getMyGoals = function(start) {
        var _start = start || false

        UserDataServices.getMyGoals({ offset: offset, limit: limit }).success(function(result) {
            $scope.noMoreContent = false;
            $scope.showEmptyData = result.data.length == 0 ? true : false;
            if (_start) {
                $scope.myGoals = [];
            }

            if (result.data.length < limit) {
                $scope.noMoreContent = true;
            }
            $scope.myGoals = $scope.myGoals.concat(result.data);

            offset = offset + limit;
            if (_start) {
                $scope.$broadcast('scroll.refreshComplete');
            } else {
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
        })
    }

    //$scope.getMyGoals(true);

    $scope.doRefresh = function() {
        offset = 0;
        $scope.getMyGoals(true);
    }

    $rootScope.$on('GOAL_DELETED', function(event, args) {
        $scope.myGoals.splice(args.i, 1);
    })

})

.controller('NotificationsSettingsCtrl', function($scope, UserDataServices, NotificationDataServices, $stateParams) {

    $scope.isLoading = true;
    NotificationDataServices.settings().success(function(res) {
        $scope.notiType = $stateParams.id;
        $scope.notificationsSettings = res.data
        $scope.isLoading = false;
    });

    $scope.switchLocal = function(settings) {
        params = { id: settings.id, toast: settings.toast }
        updateNotificationSettings(params);
    }

    $scope.switchEmail = function(settings) {
        params = { id: settings.id, email: settings.email }
        updateNotificationSettings(params);
    }

    $scope.switchMobile = function(settings) {
        params = { id: settings.id, mobile: settings.mobile }
        updateNotificationSettings(params);
    }

    function updateNotificationSettings(params) {
        NotificationDataServices.update(params).success(function(res) {})
    }

})

.controller('AccountSettingsListCtrl', function($scope, $rootScope, $state, $ionicHistory, localStorageService, $ionicViewSwitcher, UserDataServices, socket) {
    $scope.logout = function() {
        $ionicHistory.clearCache()
        $rootScope.showLoading("Logging out...");
        UserDataServices.logout().success(function(res) {
            localStorageService.remove("loggedInUser");
            $rootScope.hideLoading();
            $ionicViewSwitcher.nextDirection('forward');
            //socket.manual_disconnect();
            $rootScope.chatFactory.disconnect();
            //socket.reconnect();
            $state.go('main.intro', {}, { reload: true });
        }).error(function(err) {

        })
    }
})

.controller('AccountSettingsCtrl', function($scope, $rootScope, $state, User, localStorageService, UserDataServices, $ionicPopup, $ionicActionSheet) {
    $scope.sessionUser = User.me();
    UserDataServices.getActiveSession().success(function(res) {
        $scope.userSessions = res.sessions;
        $scope.client_id = User.getClientId();
    })

    $scope.revokeSession = function(id, $index) {
        UserDataServices.revokeSession(id).success(function(res) {
            $scope.userSessions.splice($index, 1);
        })
    }

    $scope.password = {};
    $scope.changePassword = function() {
        UserDataServices.changePassword($scope.password).success(function(result) {
            if (result.status == 200) {
                $scope.passwordChangeMessage = true;
                $scope.error = result.message;
            } else {
                $scope.passwordChangeMessage = true;
                $scope.error = result.message;
            }
        })
    }

    $scope.deactivate = function() {
        var confirmPopup = $ionicPopup.show({
            title: 'Sorry to see you go',
            templateUrl: 'templates/user/account/deactivate_popup.html',
            buttons: [{ // Array[Object] (optional). Buttons to place in the popup footer.
                text: 'Cancel',
                type: 'button-default',
                onTap: function(e) {
                    // e.preventDefault() will stop the popup from closing when tapped.
                    //e.preventDefault();
                }
            }, {
                text: 'Deactivate',
                type: 'button-dark',
                onTap: function(e) {
                    // Returning a value will cause the promise to resolve with the given value.
                }
            }]
        });

    };

    $scope.checkSettings = function(user) {

        var buttons = [];

        function verifyEmail(user) {
            UserDataServices.verifyAccountRequest();
        }

        buttons.push({ text: '<i class="icon lg-icon-notification"></i> Change Email' })
        buttons.push({ text: '<i class="icon ion-checkmark-circled"></i> Verify Email' })
        var actionSheet = $ionicActionSheet.show({
            titleText: 'Actions',
            buttons: buttons,
            cancelText: '<i class="icon rd-txt lg-icon-cross-small"></i> <span class="rd-txt">Close</span>',
            cancel: function() {},
            buttonClicked: function(index) {
                if (index == 0) { $state.go('tab.more-settings-email') }
                if (index == 1) { verifyEmail() }
                actionSheet();
            }
        })


    }


})


.controller('EditUsernameCtrl', function($scope, $rootScope, User, localStorageService, UserDataServices) {
    UserDataServices.getBasicSettings().success(function(res) {
        $scope.user = res.data;
    })
    $scope.user = {}
    $scope.updateUsername = function() {
        params = { username: $scope.user.username }
        if (params.username != "") {
            UserDataServices.validateUsernameEmail(params).success(function(result) {
                if (result.meta.success == 200) {
                    UserDataServices.changeUsernameEmail(params).success(function(result) {
                        $scope.msg = "Successfully updated"
                    })
                }
            }).error(function(err) {
                if (err.meta.status == 401)
                    $scope.msg = err.data.username;
            })
        } else {
            $scope.msg = "Username can't be blank"
        }
    }
})

.controller('EditEmailCtrl', function($scope, $rootScope, User, localStorageService, UserDataServices) {
    UserDataServices.getBasicSettings().success(function(res) {
        $scope.user = res.data;
    })
    $scope.user = {}
    $scope.updateEmail = function() {
        params = { email: $scope.user.user_email }
        if (params.email != "") {
            UserDataServices.validateUsernameEmail(params).success(function(result) {
                if (result.meta.success == 200) {
                    UserDataServices.changeUsernameEmail(params).success(function(result) {
                        $scope.msg = "Successfully updated"
                    })
                }
            }).error(function(err) {
                if (err.meta.status == 401)
                    $scope.msg = err.data.email;
            })
        } else {
            $scope.msg = "Email can't be blank"
        }
    }
})


.controller('ChatsCtrl', function($scope, Chats) {
    $scope.chats = Chats.all();
    $scope.remove = function(chat) {
        Chats.remove(chat);
    };

    $scope.search = function() {

    };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
    $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
    $scope.settings = {
        enableFriends: true
    };
})

.controller('SearchGoalsProfilesTagsCtrl', function($scope, $state, $location, SearchDataServices) {
    $scope.search = {}
    $scope.search.query = "";
    $scope.isLoading = false;

    $scope.resetSearch = function() {
        $scope.searchResult = [];
        $scope.search.query = "";
    }


    $scope.searchNow = function() {
        if ($scope.search.query.length > 0) {
            $scope.searchResult = []
            $scope.isLoading = true;
            SearchDataServices.miniSearch($scope.search.query).success(function(result) {
                $scope.searchResult = result.data;
                $scope.isLoading = false;
            })
        } else {
            $scope.searchResult = [];
        }
    }

    $scope.clear = function() {
        $scope.search.query = "";
        $scope.searchResult = []
    }
})

.controller('SearchGoalsCtrl', function($scope, $state, $location, SearchDataServices) {
    $scope.query = $state.params.q;
    // $scope.searchNow = function() {
    //     $scope.goals = []
    //     $scope.isLoading = true;
    //     SearchDataServices.goals($state.params.q).success(function(result) {
    //         $scope.goals = result.data;
    //         $scope.isLoading = false;
    //     })
    // }
    // $scope.searchNow();

    var offset = 0;
    var limit = 5;
    $scope.goals = [];
    //$scope.activities = [];
    //$scope.noMoreFeedContent = false;
    $scope.noMoreContent = true;

    $scope.getMoreGoals = function(start) {
        var _start = start || false;
        SearchDataServices.goals($state.params.q, { offset: offset, limit: limit }).success(function(result) {
            if (_start) {
                $scope.goals = [];
            }
            if (result.data.length < limit) {
                $scope.noMoreContent = false
            }
            $scope.goals = $scope.goals.concat(result.data);

            offset = offset + limit;
            if (_start) {
                $scope.$broadcast('scroll.refreshComplete');
            } else {
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
        })
    };

    $scope.doRefresh = function() {
        offset = 0;
        $scope.getMoreGoals(true);
        $scope.noMoreContent = true
    }

    // $scope.$on('$stateChangeSuccess', function() {
    //   $scope.getMoreGoals();
    // });
})

.controller('SearchUsersCtrl', function($scope, $state, $location, SearchDataServices) {
    $scope.query = $state.params.q;
    // $scope.searchNow = function() {
    //     $scope.users = []
    //     $scope.isLoading = true;
    //     SearchDataServices.users($state.params.q).success(function(result) {
    //         $scope.users = result.data;
    //         $scope.isLoading = false;
    //     })
    // }
    // $scope.searchNow();

    var offset = 0;
    var limit = 5;
    $scope.users = [];

    $scope.noMoreContent = true;
    $scope.getMoreUsers = function(start) {
        var _start = start || false
        SearchDataServices.users($state.params.q, { offset: offset, limit: limit }).success(function(result) {
            if (_start) {
                $scope.users = [];
            }

            if (result.data.length < limit) {
                $scope.noMoreContent = false
            }

            $scope.users = $scope.users.concat(result.data);

            offset = offset + limit;
            if (_start) {
                $scope.$broadcast('scroll.refreshComplete');
            } else {
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
        })
    };

    $scope.doRefresh = function() {
        //offset = 0;
        $scope.getMoreUsers(true);
        $scope.noMoreContent = true;
    }

    //$scope.$on('$stateChangeSuccess', function() {
    //$scope.getMoreUsers();
    //});
})

.controller('SearchInterestCtrl', function($scope, $state, $location, SearchDataServices) {
    $scope.query = $state.params.q;
    // $scope.searchNow = function() {
    //     $scope.tags = []
    //     $scope.isLoading = true;
    //     SearchDataServices.tags($state.params.q).success(function(result) {
    //         $scope.tags = result.data;
    //         $scope.isLoading = false;
    //     })
    // }
    // $scope.searchNow();

    var offset = 0;
    var limit = 5;
    $scope.tags = [];
    //$scope.activities = [];
    //$scope.noMoreFeedContent = false;
    $scope.noMoreContent = true;

    $scope.getMoreTags = function(start) {
        var _start = start || false;
        SearchDataServices.tags($state.params.q, { offset: offset, limit: limit }).success(function(result) {
            $scope.isLoading = false;
            if (_start) {
                $scope.tags = [];
            }

            if (result.data.length < limit) {
                $scope.noMoreContent = false
            }
            $scope.tags = $scope.tags.concat(result.data);
            offset = offset + limit;
            if (_start) {
                $scope.$broadcast('scroll.refreshComplete');
            } else {
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
        })
    };

    $scope.doRefresh = function() {
        //offset = 0;
        $scope.getMoreTags(true);
        $scope.noMoreContent = true;
    }

    // $scope.$on('$stateChangeSuccess', function() {
    //   $scope.getMoreTags();
    // });
})



.controller('AfterSignupWelcomeCtrl', function($scope, User, $cordovaStatusbar, $ionicSlideBoxDelegate, PrivacyCache) {
    $scope.disableSwipe = function() {
        $ionicSlideBoxDelegate.enableSlide(false);
    };

    PrivacyCache.getDefault();

    setTimeout(function() {
        $cordovaStatusbar.style(0);
    }, 300)
    $scope.loggedInUser = User.getLoggedInUser();
})


.controller('AfterSignupAboutYouCtrl', function($scope, User, UserDataServices, $rootScope) {
    $scope.loggedInUser = User.getLoggedInUser();
    $scope.user = {};

    $scope.imagePath = false;
    $scope.profileImage = function() {
        $rootScope.updateProfileImage();
    }
    $scope.updateProfile = function() {
        var params = {}
        if ($scope.user.biography) {
            params.bio = $scope.user.biography;
        }

        params = { bio: $scope.user.biography }
        UserDataServices.updateProfile($scope.loggedInUser.uid, params).success(function(res) {})
    }

    $rootScope.$on('profileImageChanged', function(event, args) {
        $scope.imagePath = args.data.medium;
        User.updateLS({ image: args.data });
    });

})

.controller('AfterSignupInterestCtrl', function($scope, $rootScope, $state, $cordovaStatusbar, User, localStorageService, GoalsDataServices, ModalService, UserDataServices, CategoriesServices) {

    $scope.isLoading = true;
    $scope.selectedInterest = 0;
    $scope.countSeletedInterest = function(tag) {
        $scope.selectedInterest = tag.isMyInterest == 1 ? $scope.selectedInterest + 1 : $scope.selectedInterest;
    }

    $scope.toggleInterest = function(tag) {
        if (tag.isMyInterest == 1) {
            // removing tag
            $scope.selectedInterest = $scope.selectedInterest - 1;
            if ($scope.selectedInterest < 0) $scope.selectedInterest = 0;
            $rootScope.addRemoveInterestTag(tag);
            removeInterest(tag.id);
        } else {
            // adding tag
            $rootScope.addRemoveInterestTag(tag);
            $scope.selectedInterest = $scope.selectedInterest + 1;
            $scope.interestBucketList.push(tag);

        }
    }

    function filterMyInterest() {
        $scope.interestBucketList = []
        angular.forEach($scope.categories, function(cat, key) {
            angular.forEach(cat.tags, function(tag, key) {
                if (tag.isMyInterest == 1) {
                    $scope.selectedInterest = $scope.selectedInterest + 1;
                    $scope.interestBucketList.push(tag)
                }
            });
        });
    }

    function removeInterest(id) {
        angular.forEach($scope.interestBucketList, function(tag, key) {
            if (tag.id == id) $scope.interestBucketList.splice(key, 1);
        });
    }


    $scope.onboardInterest = function() {
        ModalService
            .init('templates/modals/onboard-interest.html', $scope)
            .then(function(modal) {
                modal.show();
            });
    }



    CategoriesServices.getAllCategoriesWithTags().success(function(res) {
        $scope.categories = res.data;
        $scope.selectedCategoryId = 0;
        filterMyInterest();
        $scope.isLoading = false;
    })

})

.controller('AfterSignupConnectionsCtrl', function($scope, $rootScope, $state, $cordovaStatusbar, User, localStorageService, GoalsDataServices, ModalService, UserDataServices, CategoriesServices) {

    $scope.connectTab = 1;
    $scope.isLoading = true;

    $scope.disableLoadMore = false;
    var offset = 0;
    var limit = 10;
    $scope.users = [];

    $scope.loadMoreUsers = function() {
        $scope.isLoadingLinkagoalUsers = true;
        UserDataServices.suggetedUsers({ offset: offset, limit: limit }).success(function(result) {
            $scope.isLoadingLinkagoalUsers = false;
            if (result.data.length < limit) $scope.disableLoadMore = true;
            $scope.users = $scope.users.concat(result.data);
            offset = offset + limit;
            $scope.isLoading = false;
        });
    }
    $scope.loadMoreUsers();

    $scope.changeConnectTab = function(tab) {
        $scope.connectTab = tab;
    }
})

.controller('AfterSignupCreateGoalCtrl', function($scope) {

})

.controller('AfterSignupGoalSuggestionsCtrl', function($scope, $rootScope, $state, $cordovaStatusbar, User, localStorageService, GoalsDataServices, ModalService, UserDataServices, CategoriesServices) {

    //follow goal suggestion
    setTimeout(function() {
        $cordovaStatusbar.style(0);
    }, 300)

    var offset = 0;
    var limit = 5;
    $scope.goalSuggestion = [];
    $scope.getGoalsSuggestion = function(start) {
        var _start = start || false
        $scope.isLoading = true;

        GoalsDataServices.goalFollowSuggestion({ offset: offset, limit: limit }).success(function(result) {
            $scope.isLoading = false;
            if (_start) {
                $scope.goalSuggestion = [];
            }

            if (result.data.length < limit) {
                $scope.isLoading = true;
            }
            $scope.goalSuggestion = $scope.goalSuggestion.concat(result.data);
            offset = offset + limit;
            if (_start) {
                $scope.$broadcast('scroll.refreshComplete');
                //$scope.$apply()
            } else {
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
        })

    }

    $scope.doRefresh = function() {
        offset = 0;
        $scope.getGoalsSuggestion(true);
    }

    $scope.$on('$stateChangeSuccess', function() {
        $scope.getGoalsSuggestion();
    });

})


.controller('AfterSignupAppGuidesCtrl', function($scope, User) {
    $scope.user = sessionUser.user;

    setTimeout(function() {
        $cordovaStatusbar.show();
        $cordovaStatusbar.style(1);
    }, 100)
})




.controller('GoalMediaCtrl', function($scope, $stateParams, GoalsDataServices) {

    $scope.id = $stateParams.id;

    var offset = 0;
    var limit = 5;
    $scope.media = [];
    $scope.noMoreContent = true;

    $scope.getMoreImages = function(start) {
        var _start = start || false;
        GoalsDataServices.getImages($scope.id, { offset: offset, limit: limit }).success(function(result) {
            if (_start) {
                $scope.media = [];
            }
            if (typeof result.data.images != "undefined") {
                if (result.data.images.length < limit) {
                    $scope.noMoreContent = false
                }

                for (var i = 0; i < result.data.images.length; i++) {
                    if (typeof result.data.images[i].files[0].source.square != "undefined") {
                        $scope.media.push({ src: result.data.images[i].files[0].source.square.src })
                    }
                }
            } else {
                $scope.noMoreContent = false
            }

            offset = offset + limit;

            if (_start) {
                $scope.$broadcast('scroll.refreshComplete');
            } else {
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
        })
    };

    $scope.doRefresh = function() {
        offset = 0;
        $scope.getMoreImages(true);
        $scope.noMoreContent = true;
    }

    $scope.items = [{
        src: 'http://www.wired.com/images_blogs/rawfile/2013/11/offset_WaterHouseMarineImages_62652-2-660x440.jpg',
        sub: 'This is a <a ng-click="close()" href="#/tab/goal/1/milestones">Milestones</a>'
    }, {
        src: 'http://www.gettyimages.co.uk/CMS/StaticContent/1391099215267_hero2.jpg',
        sub: '' /* Not showed */
    }, {
        src: 'http://www.hdwallpapersimages.com/wp-content/uploads/2014/01/Winter-Tiger-Wild-Cat-Images.jpg',
        thumb: 'http://www.gettyimages.co.uk/CMS/StaticContent/1391099215267_hero2.jpg'
    }];
})

.controller('ProfileMediaCtrl', function($scope, $stateParams, UserDataServices) {
    $scope.uid = $stateParams.id;
    var offset = 0;
    var limit = 5;
    $scope.media = [];
    $scope.noMoreContent = true;

    $scope.getMoreImages = function(start) {
        var _start = start || false;
        UserDataServices.getimages($scope.uid, { offset: offset, limit: limit }).success(function(result) {
            if (_start) {
                $scope.media = [];
            }

            if (typeof result.data.images != "undefined") {
                if (result.data.images.length < limit) {
                    $scope.noMoreContent = false
                }

                for (var i = 0; i < result.data.images.length; i++) {
                    if (typeof result.data.images[i].files[0].source.square != "undefined") {
                        $scope.media.push({ src: result.data.images[i].files[0].source.square.src })
                    }
                }
            } else {
                $scope.noMoreContent = false
            }


            offset = offset + limit;

            if (_start) {
                $scope.$broadcast('scroll.refreshComplete');
            } else {
                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
        })
    };

    $scope.doRefresh = function() {
        offset = 0;
        $scope.getMoreImages(true);
        $scope.noMoreContent = true;
    }

})


.controller('PrivacyCtrl', function($scope, PrivacyServices, PrivacyCache, appModalService) {
    var vm = this;
    // PrivacyServices.getSettings().success(function(res) {
    //     $scope.privacyList = res.data;
    // })

    PrivacyCache.get().then(function(res) {
        $scope.privacyList = res;
    });

    PrivacyCache.getDefault().then(function(res) {
        $scope.test = res.id;
    })

    vm.confirm = function(privacyscope) {
        $scope.closeModal(privacyscope);
    };

    vm.selectedItem = function(privacyscope) {
        vm.privacyscope = (privacyscope)
        PrivacyCache.setDefault(privacyscope.id);

        if (privacyscope.id == 4) {
            console.log('CustomsUsers')
            appModalService.show('templates/modals/tag-people.html', 'CustomsUsers as vm', {}).then(function(res) {
                if (res != null) {
                    $scope.users = res;
                }
            })
        }
    };

    vm.cancel = function() {
        $scope.closeModal(null);
    };

    $scope.data = {
        clientSide: 2
    };
})

.controller('CustomsUsers', function($scope, CategoriesServices, UserDataServices) {
    var vm = this;
    $scope.search = {}
    var offset = 0;
    var limit = 10;

    $scope.get = function() {
        UserDataServices.userConnections($scope.search.query, { offset: offset, limit: limit }).success(function(res) {
            $scope.users = res.data
        }).error(function(err) {

        })
    }
    vm.confirm = function(users) {
        console.log(users)
        $scope.closeModal(users);
    };

    $scope.$watch('search.query', function(newValue, oldValue) {
        if (typeof newValue != "undefined") {
            $scope.results = [];
            offset = 0
            $scope.get();
        }
    })
})

.controller('CategoriesModalCtrl', function($scope, CategoriesServices) {
    var vm = this;

    $scope.isLoading = true;
    CategoriesServices.getAll().success(function(res) {
        $scope.categories = res.data;
        $scope.isLoading = false;

    })

    vm.confirm = function(category) {
        $scope.closeModal(category);
    };

    vm.selectedItem = function(category) {
        vm.category = category
    };

    vm.cancel = function() {
        $scope.closeModal(null);
    };
})

.controller('PostCtrl', function($scope, $stateParams, Post) {
    $scope.isLoading = true;
    Post.get($stateParams.id).success(function(res) {
        $scope.isLoading = false;
        $scope.posts = [res.data];
    })
})

.controller('PostCommentCtrl', function($scope, $stateParams, Post, CommentDataServices, $ionicScrollDelegate) {

    $scope.id = $stateParams.id;
    $scope.comments = [];
    $scope.newcomment = "";

    var offset = 0;
    var limit = 10;
    $scope.noMoreContent = true;

    $scope.isLoading = true;
    Post.get($stateParams.id).success(function(res) {
        $scope.posts = [res.data];
        $scope.comments = res.data.post.comments;

        $scope.isLoading = false;
    });

    $scope.isCommentPosting = false;
    $scope.comment = function(id) {
        if ($scope.isCommentPosting == true || $scope.newcomment.length == 0) return;
        $scope.isCommentPosting = true;

        var params = { comment_txt: $scope.newcomment, comment_type: "TEXT" }
        if ($scope.file != null) {
            params.attach_id = $scope.file.fileId;
        }

        CommentDataServices.post(id, params).success(function(result) {

            $ionicScrollDelegate.$getByHandle('post-comment-handle').resize();
            $ionicScrollDelegate.$getByHandle('post-comment-handle').scrollBottom(true);
            $scope.newcomment = "";
            $scope.comments.push(result.data);
            $scope.isCommentPosting = false;

        }).error(function(err) {
            $scope.isCommentPosting = false;
        });
    }

    $scope.hidekeyboard = false;
    $scope.keyboardhide = function() {
        $ionicScrollDelegate.$getByHandle('chat-convo-handle').resize();
        $ionicScrollDelegate.$getByHandle('chat-convo-handle').scrollBottom(true);
        $scope.hidekeyboard = true;
        try {
            cordova.plugins.Keyboard.close();
        } catch (e) {}

    }
})

.controller('CreatePostCtrl', function($scope, $rootScope, localStorageService, PrivacyCache, appModalService, Post, $ionicActionSheet, ImageService, $cordovaToast, UrlService, $q, $timeout, ngProgressFactory, progressfactory, $cordovaImagePicker) {
    sessionUser = localStorageService.get('loggedInUser');
    $scope.user = sessionUser.user;

    $scope.url = {};
    PrivacyCache.getDefault().then(function(res) {
        $scope.seletedPrivacyScope = res;
        $scope.post.scope_id = res.id
    });

    $scope.seletedPrivacyScope = null;
    $scope.post = {}
    $scope.post.text = "";
    $scope.post.attach_id = []
    $scope.post.images = [];
    $rootScope.totalFiles = [];
    var promises = [];
    $rootScope.iscreating = false;
    $scope.submitPost = function() {
        $rootScope.posttext = $scope.post.text;
        $rootScope.iscreating = true;
        progressfactory.set(5);
        $scope.closeModal();
        $rootScope.closeCreateOptions();
        var sum = 0;
        var interval = 100 / ($scope.post.images.length + 1);

        $scope.post.images.reduce(function(p, val) {
            return p.then(function() {
                var isGif = false;
                var imageid = null;
                if (val.imagetype == "gif") {
                    isGif = true;
                    imageid = val.image.id
                }
                return ImageService.upload(val.image, 'post', isGif, imageid).then(function(res) {
                    $scope.post.attach_id.push(res.data.fileId);
                    sum = sum + interval;
                    progressfactory.set(sum);
                });
            });
        }, $q.when(true)).then(function(finalResult) {
            if ($scope.seletedPrivacyScope == null) {
                $scope.selectPrivacy();
                return;
            }
            Post.create($scope.post).success(function(res) {
                if (res.meta.status == 200) {
                    progressfactory.complete();
                    //progressfactory.set(100);
                    $rootScope.iscreating = false;
                    $scope.post.scope_id = $scope.seletedPrivacyScope.id
                    $scope.post.text = "";
                    $rootScope.$broadcast(res.data.post_type, { data: res.data });
                    try {
                        $cordovaToast.showShortTop('Successfully posted');
                    } catch (e) {}
                } else {
                    try {
                        $cordovaToast.showShortTop('There was error in posting. Please retry!');
                    } catch (e) {}
                }

            }).error(function(err) {
                progressfactory.complete();
                try {
                    $cordovaToast.showShortTop('There was error in posting. Please retry!');
                } catch (e) {}
            })

        }, function(err) {
            // error here
        });


    }

    $scope.urlLink = "";
    $scope.addLink = function() {
        $scope.isUrlLoading = true;
        UrlService.fetch($scope.url.urlLink).success(function(res) {
                if (res.meta.status == 200) {
                    $scope.isUrlLoading = false;
                    $scope.removeAllPostImages();
                    $scope.post.link = res.data
                    $scope.post.fetched_url_id = res.data.id
                    $scope.urlLink = "";
                } else {
                    $scope.url.fetch_url_error = "Invalid url";
                    $scope.isUrlLoading = false;
                }

            })
            .error(function(err) {
                $scope.url.fetch_url_error = "Invalid url";
                $scope.isUrlLoading = false;
            })
    }

    var amt = 66;

    $rootScope.countTo = amt;
    $rootScope.countFrom = 0;

    $timeout(function() {
        $rootScope.progressValue = amt;
    }, 200);

    $scope.myFunc = function() {
        var urlPattern = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/;
        if (urlPattern.test($scope.url.urlLink)) {
            $scope.addLink();
        }
    }
    $scope.removeAllPostImages = function() {
        $scope.post.images = [];
    }

    $scope.selectPrivacy = function() {
        appModalService.show('templates/modals/privacy-list.html', 'PrivacyCtrl as vm', {}).then(function(res) {
            if (res != null) {
                $scope.seletedPrivacyScope = res
                $scope.post.scope_id = res.id;
            }
        })
    }

    $scope.removeLinkFromPost = function() {
        delete $scope.post.fetched_url_id;
        delete $scope.post.link;
        $scope.insertLink = 0;
    }

    $scope.$watchGroup(['post.text', 'post.fetched_url_id', 'post.images'], function(newValues, oldValues, scope) {
        if (newValues[0] != "" || newValues[1] != null) {
            $scope.isPostReady = false;
        } else {
            $scope.isPostReady = true;
        }
    });

    $scope.removePostImage = function(index) {
        $scope.post.images.splice(index, 1);
        $rootScope.totalFiles.splice(index, 1);
        if ($scope.post.images.length == 0) {
            if ($scope.post.text == "") {
                $scope.isPostReady = true;
            } else {
                $scope.isPostReady = false;
            }

        }
    }

    $scope.addPostImage = function() {
        var options = {
            maximumImagesCount: 25,
            width: 800,
            height: 800,
            quality: 80
        };
        var actionSheet = $ionicActionSheet.show({
            titleText: 'Actions',
            buttons: [{ text: '<i class="icon lg-icon-gallery"></i> Gallery' }, { text: '<i class="icon lg-icon-camera"></i> Camera' }],
            //destructiveText: 'Delete',
            cancelText: '<i class="icon rd-txt lg-icon-cross-small"></i> <span class="rd-txt">Close</span>',
            cancel: function() {},
            buttonClicked: function(index) {
                if (index == 0) {

                    var options = {
                        maximumImagesCount: 25,
                        width: 800,
                        height: 800,
                        quality: 80
                    };

                    $cordovaImagePicker.getPictures(options).then(function(results) {
                        angular.forEach(results, function(singleImage, key) {
                            var image = {
                                image: singleImage,
                                imagetype: "still"
                            }
                            $scope.post.images.push(image);
                            $rootScope.totalFiles.push(image)
                        })
                        if (results.length > 0) {
                            $scope.isPostReady = false;
                        }

                    }, function(error) {
                        // error getting photos
                    });
                }
                if (index == 1) {
                    ImageService.UploadNow('post', true, true).then(function(res) {
                        $scope.post.attach_id = [res.data.fileId];
                        $scope.post.images.push(res.data.file.medium);
                    });
                }
                actionSheet();
            }
        })
    }

    $scope.gifModal = function() {
        appModalService.show('templates/modals/gif-list.html', 'GifSelectCtrl as vm', {}).then(function(res) {
            if (res != null) {
                $scope.removeAllPostImages();
                $rootScope.totalFiles = [];
                var image = {
                    image: res,
                    imagetype: "gif"
                }
                $rootScope.totalFiles.push(image)
                $scope.post.images.push(image);
            }
        })
    }

})

.controller('GifSelectCtrl', function($scope, $http, lagConfig) {
    var vm = this;

    vm.confirm = function(image) {
        $scope.closeModal((vm.image) ? vm.image : null);
    };

    vm.selectedItem = function(image) {
        vm.image = (image)
    };

    vm.cancel = function() {
        $scope.closeModal(null);
    };

    var params = {};
    params.api_key = lagConfig.giphy_api_key;
    params.limit = 10;
    params.offset = 0;
    $scope.results = [];
    $scope.search = {};
    $scope.search.query = "";

    $scope.noMoreContent = false;
    var apiSearch = function(q) {
        $scope.noMoreContent = true;
        if (q.length < 2) return false;
        params.q = q.split(',').join('+');
        $http.get('https://api.giphy.com/v1/gifs/search', { params: params }).success(function(data, status) {
            if (typeof data == 'object') {
                params.offset = params.offset + params.limit;
                $scope.results = $scope.results.concat(data.data);

                if (data.data.length < params.limit) {
                    $scope.noMoreContent = true;
                } else {
                    $scope.noMoreContent = false;
                }

                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
        }).error(function() {
            $scope.isLoading = false;
        })
    }

    var trending = function() {
        $scope.noMoreContent = true;
        $http.get('https://api.giphy.com/v1/gifs/trending', { params: params }).success(function(data, status) {
            if (typeof data == 'object') {
                params.offset = params.offset + params.limit;
                $scope.results = $scope.results.concat(data.data);

                if (data.data.length < params.limit) {
                    $scope.noMoreContent = true;
                } else {
                    $scope.noMoreContent = false;
                }

                $scope.$broadcast('scroll.infiniteScrollComplete');
            }
        }).error(function() {
            $scope.isLoading = false;
        })
    }

    $scope.get = function() {

        if (typeof $scope.search.query != "undefined") {
            if ($scope.search.query.length > 1) {
                apiSearch($scope.search.query);
            } else {
                if ($scope.search.query.length == 0) {
                    trending();
                }
            }
        }
    }

    $scope.$watch('search.query', function(newValue, oldValue) {
        if (typeof newValue != "undefined") {
            $scope.results = [];
            params.offset = 0
            $scope.get();
        }
    })

    vm.resetSearch = function() {
        $scope.search.query = "";
    }

})

.controller('ContributeCtrl', function($scope, localStorageService, parameters) {
    sessionUser = localStorageService.get('loggedInUser');
    $scope.user = sessionUser.user;
    $scope.currentParams = parameters;

    var vm = this;
    vm.post = {}
    vm.confirm = function(res) {
        $scope.closeModal(res);
    };
    vm.cancel = function() {
        $scope.closeModal(null);
    };



})

.controller('GoalEditCtrl', function($scope, localStorageService, parameters, appModalService, PrivacyCache, CategoriesCache, GoalsDataServices) {
    sessionUser = localStorageService.get('loggedInUser');
    $scope.user = sessionUser.user;
    $scope.goal = parameters;

    PrivacyCache.get().then(function(res) {
        $scope.privacyList = res;
        angular.forEach($scope.privacyList, function(val, i) {
            if (parameters.scope_id == val.id) {
                $scope.seletedPrivacyScope = val
            }
        })
    });

    CategoriesCache.get().then(function(res) {
        $scope.categories = res;
        angular.forEach($scope.categories, function(val, i) {
            if (parameters.category_id == val.id) {
                $scope.selectedCategory = val
            }
        })
    })
    var vm = this;
    vm.post = {}
    vm.confirm = function(res) {
        $scope.closeModal(res);
    };
    vm.cancel = function() {
        $scope.closeModal(null);
    };

    $scope.selectPrivacy = function() {
        appModalService.show('templates/modals/privacy-list.html', 'PrivacyCtrl as vm', {}).then(function(res) {
            if (res != null) {
                $scope.seletedPrivacyScope = res
                $scope.goal.scope_id = res.id;

            }
        })
    }

    $scope.selectCategory = function() {
        appModalService.show('templates/modals/add-category.html', 'CategoriesModalCtrl as vm', {}).then(function(res) {
            if (res != null) {
                $scope.selectedCategory = res
                $scope.goal.category_id = res.id;
            }
        })
    }

    $scope.selectTimeline = function() {
        appModalService.show('templates/modals/time-line.html', 'TimelineModalCtrl as vm', {}).then(function(res) {
            if (res != null) {
                // $scope.selectedCategory = res
                // $scope.goal.category_id = res.id;
            }
        })
    }




})

.controller('GoalAchieveCtrl', function($scope, localStorageService, parameters) {
    sessionUser = localStorageService.get('loggedInUser');

    $scope.user = sessionUser.user;
    $scope.currentParams = parameters;

    var vm = this;
    vm.post = {}
    vm.confirm = function(res) {
        $scope.closeModal(res);
    };

    vm.cancel = function() {
        $scope.closeModal(null);
    };
})


.controller('MilestoneAchieveCtrl', function($scope, localStorageService, parameters) {
    sessionUser = localStorageService.get('loggedInUser');

    $scope.user = sessionUser.user;
    $scope.currentParams = parameters;

    var vm = this;
    vm.post = {}
    vm.confirm = function(res) {
        $scope.closeModal(res);
    };

    vm.cancel = function() {
        $scope.closeModal(null);
    };
})





.controller('CreateProgressCtrl', function($scope, $rootScope, $cordovaToast, localStorageService, appModalService, GoalsDataServices, parameters, $ionicActionSheet, ImageService) {
    sessionUser = localStorageService.get('loggedInUser');
    $scope.user = sessionUser.user;
    $scope.currentParams = parameters;

    $scope.progress = {}
    $scope.progress.text = "";

    $scope.selectGoal = function() {
        appModalService.show('templates/modals/progress-goals-list.html', 'MyGoalsCtrl as vm', {}).then(function(res) {
            if (res != null) {
                $scope.seletedGoal = res;
            }
        })
    }

    $scope.updateProgress = function() {
        if ($scope.seletedGoal == null && $scope.currentParams == null) {
            $scope.selectGoal();
            return;
        }

        var goalId = ($scope.currentParams != null) ? $scope.currentParams.id : $scope.seletedGoal.id;
        $rootScope.showLoading("Adding Progress...");
        GoalsDataServices.postProgress(goalId, $scope.progress).success(function(res) {
            $scope.progress.text = "";
            $scope.closeModal();
            $rootScope.closeCreateOptions();
            $rootScope.$broadcast(res.data.post_type, { data: res.data });
            $rootScope.hideLoading();
            try {
                $cordovaToast.showShortTop('Successfully updated');
            } catch (e) {}
        }).error(function() {
            $rootScope.hideLoading();
        })
    }

    $scope.addProgressImage = function() {
        var actionSheet = $ionicActionSheet.show({
            titleText: 'Actions',
            buttons: [{ text: '<i class="icon lg-icon-gallery"></i> Gallery' }, { text: '<i class="icon lg-icon-camera"></i> Camera' }],
            //destructiveText: 'Delete',
            cancelText: '<i class="icon rd-txt lg-icon-cross-small"></i> <span class="rd-txt">Close</span>',
            cancel: function() {},
            buttonClicked: function(index) {
                if (index == 0) {
                    ImageService.UploadNow('post', false, true).then(function(res) {
                        $scope.progress.attach_id = res.data.fileId;
                        $scope.progress.image = res.data.file.medium;
                    });
                }
                if (index == 1) {
                    ImageService.UploadNow('post', true, true).then(function(res) {
                        $scope.progress.attach_id = res.data.fileId;
                        $scope.progress.image = res.data.file.medium;
                    });
                }
                actionSheet();
            }
        })
    }


    $scope.$watchGroup(['progress.text'], function(newValues, oldValues, scope) {
        if (newValues[0] != "") {
            $scope.isPostReady = false;
        } else {
            $scope.isPostReady = true;
        }
    });

})


.controller('ForgotPassCtrl', function($scope, UserDataServices) {
    $scope.screen = {}
    $scope.user = {}

    $scope.$on('$ionicView.beforeEnter', function() {
        $scope.screen.isLoading = false;
        $scope.screen.success = false;
        $scope.user.email = '';
    })


    $scope.user.email = "";
    $scope.doResetPassword = function() {
        $scope.screen.isLoading = true;
        UserDataServices.forgot({ user_email: $scope.user.email })
            .success(function(res) {
                $scope.screen.success = true;
                $scope.screen.isLoading = false;
            })
            .error(function(err) {
                if (err.meta.status == 404)
                    $scope.screen.error = "Email not found"
                if (err.meta.status == 401)
                    $scope.screen.error = "Error, please try agian later"
                $scope.screen.isLoading = false;
            })
    }
})

.controller('CreateGoalCtrl', function($scope, $rootScope, $state, $cordovaToast, GoalsDataServices, localStorageService, appModalService, $ionicActionSheet, ImageService, PrivacyCache, ModalService, ionicDatePicker, $ionicModal, CreateGoalDataService) {

    setTimeout(function() {
        $cordovaStatusbar.show();
        $cordovaStatusbar.style(1);
    }, 100)
    var vm = this;
    sessionUser = localStorageService.get('loggedInUser');
    $scope.user = sessionUser.user;
    $scope.seletedPrivacyScope = null;

    PrivacyCache.getDefault().then(function(res) {
        $scope.seletedPrivacyScope = res;
        $scope.goal.scope_id = res.id
    });

    $scope.goal = {}
    $scope.goal.goal_name = "";
    $scope.goal.goal_description = "";
    //$scope.goal.g_start_date = 2015 - 12 - 05;
    //$scope.goal.g_end_date = 2015 - 12 - 05;

    $scope.selectedCategory = null;

    $scope.selectPrivacy = function() {
        appModalService.show('templates/modals/privacy-list.html', 'PrivacyCtrl as vm', {}).then(function(res) {
            if (res != null) {
                $scope.seletedPrivacyScope = res
                $scope.goal.scope_id = res.id;
            }
        })
    }

    $scope.selectCategory = function() {
        appModalService.show('templates/modals/add-category.html', 'CategoriesModalCtrl as vm', {}).then(function(res) {
            if (res != null) {
                $scope.selectedCategory = res
                $scope.goal.category_id = res.id;
            }
        })
    }

    $scope.selectTimeline = function() {
        appModalService.show('templates/modals/time-line.html', 'TimelineModalCtrl as vm', {}).then(function(res) {
            if (res != null) {

                if (typeof res.startDate != "undefined") {
                    $scope.insertStartDate = 1;
                    $scope.goal.g_start_date = res.startDate;
                    $scope.goal.start_date = timeConverter($scope.goal.g_start_date);
                    CreateGoalDataService.setStartDate(res.startDate);
                } else {
                    $scope.insertStartDate = 0;
                }

                if (typeof res.endDate != "undefined") {
                    $scope.insertEndDate = 1;
                    $scope.goal.g_end_date = res.endDate;
                    $scope.goal.end_date = timeConverter($scope.goal.g_end_date);
                    CreateGoalDataService.setEndDate(res.endDate);
                } else {
                    $scope.insertEndDate = 0;
                }
            }
        })
    }

    function timeConverter(UNIX_timestamp) {
        var a = new Date(UNIX_timestamp);
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var date = a.getDate();
        var hour = a.getHours();
        var min = a.getMinutes();
        var sec = a.getSeconds();
        //var time = date + ' ' + month + ' ' + year;
        var time = year + '-' + (a.getMonth() + 1) + '-' + date;
        return time;
    }

    $scope.selectInterest = function() {
        appModalService.show('templates/modals/add-interest.html', 'AddInterestModalCtrl as vm', {}).then(function(res) {
            if (res != null) {
                $scope.insertTags = 1;
                $scope.goal.tags = res.hashtags.toString();
                $scope.hashtags = res.hashtags;
                CreateGoalDataService.setTags(res.hashtags);
            }
        })
    }

    $scope.selectLocation = function() {
        appModalService.show('templates/modals/location.html', 'LocationModalCtrl as vm', {}).then(function(res) {
            if (res != null) {
                $scope.insertLocation = 1;
                $scope.goal.location = res.location;
                $scope.location = res.location.formatted_address;
            }
        })
    }

    $scope.gPlace;
    $scope.submitGoal = function(screenTo) {


        var screenTo = screenTo || false;
        if ($scope.selectedCategory == null) {
            $scope.selectCategory();
            return;
        }

        if ($scope.seletedPrivacyScope == null) {
            $scope.selectPrivacy();
            return;
        }
        $rootScope.showLoading("Creating Goal...");

        if ($scope.goal.location != null) {
            $scope.goal.userDefinedLocation = $scope.locationAddressFix($scope.goal.location);
        }

        GoalsDataServices.createGoal($scope.goal).success(function(res) {
            $rootScope.closeCreateOptions();
            $rootScope.$broadcast('GOALCREATED', { data: res.data });
            $rootScope.hideLoading();
            if (screenTo == false) {
                $scope.closeModal();
                $rootScope.navigateState('goal', { id: res.data.goal.id })
                try {
                    $cordovaToast.showShortTop('Successfully created');
                } catch (e) {}
            } else {
                $state.go(screenTo);
            }

        }, function(err) {
            //console.log(JSON.stringify(err));
        })
    }

    $scope.locationAddressFix = function(place) {
        if (place == undefined) return {};

        var userLocation = {};
        var componentForm = { street_number: 'short_name', route: 'long_name', locality: 'long_name', administrative_area_level_1: 'short_name', country: 'long_name', postal_code: 'short_name' };

        if (place.address_components == undefined) return {}
        for (var i = 0; i < place.address_components.length; i++) {
            var addressType = place.address_components[i].types[0];
            if (componentForm[addressType]) {
                userLocation[addressType] = place.address_components[i][componentForm[addressType]]
            }
        }
        userLocation.latitude = place.geometry.location.lat;
        userLocation.longitude = place.geometry.location.lng;
        userLocation.formatted_address = place.formatted_address

        return userLocation;
    }

    $scope.addGoalImage = function() {
        var actionSheet = $ionicActionSheet.show({
            titleText: 'Actions',
            buttons: [{ text: '<i class="icon lg-icon-gallery"></i> Gallery' }, { text: '<i class="icon lg-icon-camera"></i> Camera' }],
            //destructiveText: 'Delete',
            cancelText: '<i class="icon rd-txt lg-icon-cross-small"></i> <span class="rd-txt">Close</span>',
            cancel: function() {},
            buttonClicked: function(index) {
                if (index == 0) {
                    ImageService.UploadNow('goal', false, true).then(function(res) {
                        $scope.goal.attach_id = res.data.fileId;
                        $scope.goal.image = res.data.file.medium;
                    });
                }
                if (index == 1) {
                    ImageService.UploadNow('goal', true, true).then(function(res) {
                        $scope.goal.attach_id = res.data.fileId;
                        $scope.goal.image = res.data.file.medium;
                    });
                }
                actionSheet();
            }
        })
    }

    $scope.$watchGroup(['goal.goal_name', 'goal.goal_description'], function(newValues, oldValues, scope) {
        if (newValues[0] != "" || newValues[1] != "") {
            $scope.isReady = false;
        } else {
            $scope.isReady = true;
        }
    });

    $scope.location = function() {
        ModalService
            .init('templates/modals/location.html', $scope)
            .then(function(modal) {
                modal.show();
            });
    };

    $scope.locationChanged = function() {

    }

})

.controller('LocationModalCtrl', ['$scope', '$q', function($scope, $q) {
    var vm = this;
    $scope.gPlace;

    $scope.locationChanged = function(location) {

        var geocoder = new google.maps.Geocoder();
        geocoder.geocode({
            address: location
        }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                vm.location = results[0];
                $q.resolve(results);
            } else {
                $q.reject();
            }
        });
    }

    vm.confirm = function(category) {
        $scope.closeModal(category);
    };

    vm.cancel = function() {
        $scope.closeModal(null);
    };
}])

.controller('AddInterestModalCtrl', ['$scope', 'ExploreServices', 'CreateGoalDataService', function($scope, ExploreServices, CreateGoalDataService) {
    var vm = this;
    vm.hashtags = []
    vm.featuredTags = []
    $scope.featTags = []
    $scope.featTagsClass = [];

    $scope.hashtags = []

    $scope.hashtags = CreateGoalDataService.getTags();
    //vm.hashtags = CreateGoalDataService.getTags();

    $scope.isLoading = true;
    ExploreServices.featuredTags().success(function(res) {
        $scope.featTags = res.data;
        $scope.isLoading = false;
        for (var i = 0; i < res.data.length; i++) {
            $scope.featTagsClass[i] = '';
        }
    })

    var addHashTag = function(currentVal) {
        currentVal = currentVal.replace(/(\s+)/ig, ' ');
        currentVal = currentVal.replace(/(\s)/ig, '-');
        currentVal = currentVal.replace('#', '');
        if ($scope.hashtags.indexOf("#" + currentVal) == -1) {
            $scope.hashtags.push("#" + currentVal);
            vm.hashtags.push("#" + currentVal);
        }

    }

    $scope.selectFeatureTag = function(index, tag) {
        if ($scope.featTagsClass[index] == '') {
            $scope.featTagsClass[index] = 'active';
            vm.hashtags.push("#" + tag.tagname);
            $scope.hashtags.push("#" + tag.tagname);
        } else {
            $scope.featTagsClass[index] = '';

            var tagname = "#" + tag.tagname;
            for (var i = 0; i < $scope.hashtags.length; i++) {
                if ($scope.hashtags[i] == tagname) {
                    $scope.hashtags.splice(i, 1);
                    vm.hashtags.splice(i, 1);
                }
            }

        }

    }


    $scope.removeHashTags = function(event) {
        $scope.hashtags.splice(event.target.dataset.index, 1);
    }

    $scope.keypress = function(event) {
        var hashtag = event.target.innerText;

        if (event.keyCode == 32 || event.keyCode == 188 || event.keyCode == 13 || event.keyCode == 190 || event.keyCode == 44) {
            event.preventDefault();

            if (!!event.target.innerHTML === true) {

                addHashTag(event.target.innerHTML);
                event.target.innerHTML = "";
            }
        }
    }

    $scope.focus = function(event) {
        event.target.innerHTML = "";
    }

    $scope.blur = function(event) {
        if (event.target.innerHTML == "") {
            event.target.innerHTML = "Add Hashtag";
        }
    }

    $scope.keydown = function(event) {
        if (event.keyCode == 8) {
            $scope.hashtags.pop();
        }
    }

    vm.confirm = function(category) {
        vm.hashtags = $scope.hashtags;
        $scope.closeModal(category);
    };

    vm.cancel = function() {
        $scope.closeModal(null);
    };
}])

.controller('TimelineModalCtrl', ['$scope', 'ionicDatePicker', '$ionicPopup', '$timeout', 'CreateGoalDataService', function($scope, ionicDatePicker, $ionicPopup, $timeout, CreateGoalDataService) {
    var vm = this;
    vm.start_date = CreateGoalDataService.get().start_date != undefined ? timeConverter(CreateGoalDataService.get().start_date) : '';
    vm.end_date = CreateGoalDataService.get().end_date != undefined ? timeConverter(CreateGoalDataService.get().end_date) : '';
    //$scope.goal = {};
    var ipObj1 = {
        callback: function(val) { //Mandatory
            var d = new Date(val);
            $scope.first = val;
            vm.startDate = d.toISOString();
            $scope.vm.start_date = timeConverter(val);
        },
        inputDate: new Date(), //Optional
        mondayFirst: true, //Optional
        closeOnSelect: false, //Optional
        templateType: 'popup', //Optional,
        from: new Date()
    };

    function timeConverter(UNIX_timestamp) {
        var a = new Date(UNIX_timestamp);
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var date = a.getDate();
        var hour = a.getHours();
        var min = a.getMinutes();
        var sec = a.getSeconds();
        //var time = date + ' ' + month + ' ' + year;
        var time = year + '-' + (a.getMonth() + 1) + '-' + date;
        return time;
    }

    var ipObj2 = {
        callback: function(val) { //Mandatory
            var d = new Date(val);
            $scope.second = val;
            vm.endDate = d.toISOString();
            $scope.vm.end_date = timeConverter(val);
            var oneDay = 24 * 60 * 60 * 1000;
            var firstDate = new Date($scope.first);
            var secondDate = new Date($scope.second);
            if (vm.startDate > vm.endDate) {
                $scope.vm.total_days = 0;
            } else {
                $scope.vm.total_days = Math.round(Math.abs((firstDate.getTime() - secondDate.getTime()) / (oneDay)));
            }
            if (isNaN($scope.vm.total_days)) {
                $scope.vm.total_days = 0;
            }
        },
        inputDate: new Date(), //Optional
        mondayFirst: true, //Optional
        closeOnSelect: false, //Optional
        templateType: 'popup', //Optional
        from: new Date()
    };


    $scope.openDatePicker = function() {
        ionicDatePicker.openDatePicker(ipObj1);
    };

    $scope.openEndDatePicker = function() {
        ionicDatePicker.openDatePicker(ipObj2);
    }

    vm.confirm = function(category) {
        if (typeof vm.startDate == "undefined" && typeof vm.endDate != "undefined") {
            $scope.error_message = [{ message: 'Please select start date!' }];
            $scope.error_title = "Error!";
            var confirmPopup = $ionicPopup.show({
                cssClass: 'error-pop',
                templateUrl: 'templates/partials/error_popup.html',
                scope: $scope,
                buttons: [
                    { text: 'GOT IT' }
                ]

            });
            $timeout(function() {
                confirmPopup.close(); //close the popup after 3 seconds for some reason
            }, 3000);
        } else if (vm.startDate > vm.endDate) {
            $scope.error_message = [{ message: 'Start date must be less than End date!' }];
            $scope.error_title = "Error!";
            var confirmPopup = $ionicPopup.show({
                cssClass: 'error-pop',
                templateUrl: 'templates/partials/error_popup.html',
                scope: $scope,
                buttons: [
                    { text: 'GOT IT' }
                ]

            });
            $timeout(function() {
                confirmPopup.close(); //close the popup after 3 seconds for some reason
            }, 3000);
        } else {
            $scope.closeModal(category);
        }

    };

    vm.cancel = function() {
        $scope.closeModal(null);
    };

}])

.controller('TabCtrl', function($scope, ModalService, Notifications, Post, appModalService, NotificationDataServices, $rootScope, $ionicTabsDelegate, $ionicScrollDelegate) {
    // setTimeout(function() {
    //     $scope.unseenNotifications = Notifications.get();

    // }, 3000)
    NotificationDataServices.get({ offset: 0, limit: 5 }).success(function(res) {
        $rootScope.unseenNotifications = res.data;
    })

    $scope.createGoal = function() {
        appModalService.show('templates/modals/create-goal.html', 'CreateGoalCtrl as vm', {}).then(function(result) {

        })
    };

    $scope.createPost = function() {
        appModalService.show('templates/modals/create-post.html', 'CreatePostCtrl as vm', {}).then(function(result) {

        })
    };


    $scope.myTabSelected = function() {
        if ($ionicTabsDelegate.selectedIndex() == 0) { // this is the index of the selected tab
            $ionicScrollDelegate.scrollTop(true);
        }
        // we need to change the tab by ourselves
        $ionicTabsDelegate.select(0);
    }

    $scope.exploreTabSelected = function() {
        if ($ionicTabsDelegate.selectedIndex() == 1) { // this is the index of the selected tab
            $ionicScrollDelegate.scrollTop(true);
        }
        // we need to change the tab by ourselves
        $ionicTabsDelegate.select(1);
    }

    $scope.meTabSelected = function() {
        if ($ionicTabsDelegate.selectedIndex() == 3) { // this is the index of the selected tab
            $ionicScrollDelegate.scrollTop(true);
        }
        // we need to change the tab by ourselves
        $ionicTabsDelegate.select(3);
    }

    $scope.updateProgress = function() {
        try {
            cordova.plugins.Keyboard.disableScroll(true)
        } catch (e) {}

        appModalService.show('templates/modals/update-progress.html', 'CreateProgressCtrl as vm', null).then(function(result) {

        })
    };

    $scope.search = function() {
        ModalService
            .init('templates/modals/search.html', $scope)
            .then(function(modal) {
                modal.show();
            });
    };


    $scope.tagPeople = function() {
        ModalService
            .init('templates/modals/tag-people.html', $scope)
            .then(function(modal) {
                modal.show();
            });
    };

    $scope.timeLine = function() {
        ModalService
            .init('templates/modals/time-line.html', $scope)
            .then(function(modal) {
                modal.show();
            });
    };

    $scope.addInterest = function() {
        ModalService
            .init('templates/modals/add-interest.html', $scope)
            .then(function(modal) {
                modal.show();
            });
    };


    $scope.location = function() {
        ModalService
            .init('templates/modals/location.html', $scope)
            .then(function(modal) {
                modal.show();
            });
    };

})


.controller('AllPagesCtrl', function($scope, $state, ModalService) {
    $scope.Intro = function() { $state.go('main.intro'); }
    $scope.login = function() { $state.go('main.login'); }
    $scope.signup = function() { $state.go('main.signup'); }
    $scope.dashboardTab = function() { $state.go('tab.dashboard'); }
    $scope.exploreTab = function() { $state.go('tab.explore'); }
    $scope.meTab = function() { $state.go('tab.me'); }
    $scope.moreTab = function() { $state.go('tab.more'); }

    $scope.userProfile = function() { $state.go('tab.explore-profile'); }

    $scope.goalPage = function() { $state.go('tab.explore-goal'); }
})

.controller('ContactsCtrl', ['$scope', '$cordovaContacts', function($scope, $cordovaContacts) {
    $scope.getContacts = function() {
        $scope.phoneContacts = [];

        function onSuccess(contacts) {
            for (var i = 0; i < contacts.length; i++) {
                var contact = contacts[i];
                $scope.phoneContacts.push(contact);
            }
        };

        function onError(contactError) {
            alert(contactError);
        };
        var options = {};
        options.multiple = true;
        $cordovaContacts.find(options).then(onSuccess, onError);
    };
}])

.controller('InviteCtrl', function($scope, $cordovaSocialSharing, $cordovaToast, User) {

    var sessionUser = User.me();

    // if (ionic.Platform.isAndroid()) {
    //     var link = 'https://play.google.com/store/apps/details?id=com.linkagoal.app&hl=en';
    // } else {
    //     var link = 'https://itunes.apple.com/us/app/linkagoal-share-your-life/id959763295?mt=8';
    // }

    var link = 'get.linkagoal.com';

    var content = 'Download Linkagoal App: ';
    var img = 'www/img/explore/app-icon.png';

    $scope.shareTwitter = function() {
        var content = "I'm using @linkagoal app, to set and share my #LifeGoals "
        if (ionic.Platform.isAndroid()) {
            var link = 'http://bit.ly/1UoJy5b';
        } else {
            var link = 'http://apple.co/24oZDxj';
        }

        $cordovaSocialSharing
            .shareViaTwitter(content, img, link)
            .then(function(result) {
                try {
                    // $cordovaToast.showShortTop('Successfully shared on twitter');
                } catch (e) {}
                // Success!
            }, function(err) {
                try {
                    $cordovaToast.showShortTop('Error in sharing. Twitter is not installed.');
                } catch (e) {}
            });
    }

    $scope.shareFacebook = function() {
        var content = "Hi, heard of Linkagoal? it's a goal based social network where you write, share, track and achieve your life goals (publicly or privately), create posts on your life events, motivate others, stay connected with your friends and do lot more. Join Linkagoal Today!";
        window.plugins.socialsharing.shareViaFacebookWithPasteMessageHint(content, '' /* img */ , link, 'Paste it dude!', function() {
            try {
                // $cordovaToast.showShortTop('Successfully shared on facebook');
            } catch (e) {}
        }, function(errormsg) {
            try {
                $cordovaToast.showShortTop('Error in sharing. Facebook is not installed.');
            } catch (e) {}
        })
    }

    $scope.shareInstagram = function() {
        if (ionic.Platform.isAndroid()) {
            var link = 'http://bit.ly/1UoJy5b';
        } else {
            var link = 'http://apple.co/24oZDxj';
        }
        var content = "I'm using @linkagoal app, to set and share my #LifeGoals (" + link + ") Linkagoal is a goal based social network where you write, share, track and achieve your life goals (publicly or privately), create posts, stay connected with your friends, motivate others and do lot more! Join Now"
        window.plugins.socialsharing.shareViaInstagram(content + " " + link, img, function(res) {
            try {
                $cordovaToast.showShortTop('Just paste it.');
            } catch (e) {}
        }, function(errormsg) {
            try {
                $cordovaToast.showShortTop('Error in sharing. Instagram is not installed.');
            } catch (e) {}
        })
    }

    $scope.shareNative = function() {
        if (ionic.Platform.isAndroid()) {
            var link = 'http://bit.ly/1UoJy5b';
        } else {
            var link = 'http://apple.co/24oZDxj';
        }
        var content = "I would like you to join Linkagoal, a goal based social network where you write, share, track and achieve your life goals (publicly or privately), create posts, stay connected with your friends, motivate others and do lot more! Join Now";
        if (window.plugins && window.plugins.socialsharing) {
            window.plugins.socialsharing.share(content,
                'Download Linkagoal App', img, link,
                function() {
                    try {
                        //$cordovaToast.showShortTop('Successfully shared');
                    } catch (e) {}
                },
                function(error) {
                    try {
                        $cordovaToast.showShortTop('Error in sharing.' + error);
                    } catch (e) {}
                });
        } else {
            try {
                $cordovaToast.showShortTop('Error in sharing.' + error);
            } catch (e) {}
        }

    }

    $scope.shareWhatsapp = function() {
        var content = sessionUser.name + " would like you to join Linkagoal, a goal based social network where you write, share, track and achieve your life goals (publicly or privately), create posts on your life events, stay connected with your friends and do lot more! Join Now";
        $cordovaSocialSharing
            .shareViaWhatsApp(content, null, link)
            .then(function(result) {
                try {
                    // $cordovaToast.showShortTop('Successfully shared on Whatsapp');
                } catch (e) {}
            }, function(err) {
                try {
                    $cordovaToast.showShortTop('Error in sharing. Whatsapp is not installed.');
                } catch (e) {}
                // An error occurred. Show a message to the user
            });
    }

    $scope.shareOthers = function() {
        var shareVia = 'com.apple.social.facebook';
        if (ionic.Platform.isAndroid()) {
            shareVia = 'com.facebook.katana';
        }
        $cordovaSocialSharing
            .canShareVia(shareVia, null, null, "http://pgday.phonegap.com/us2014")
            .then(function(result) {
                // Success!
                performShare()
            }, function(err) {
                performAlternateShareMethod();
                // An error occurred. Show a message to the user
            });
    }

    function performAlternateShareMethod(link) {
        // You'll need to create a facebook app and replace APPID with it. No Facebook review is required. We just need an ID here.
        // Also you can share links only with this method. In any case I believe that you can create pages for this feature. This pages can also 
        // contain some app promotional info
        var url = 'https://m.facebook.com/sharer.php?u=' + encodeURIComponent(link) + '&app_id=APPID&referrer=social_plugin',
            inappBr = cordova.InAppBrowser.open(url, '_blank', 'location=yes');
        inappBr.addEventListener('loadstart', function(e) { //wait for loading
            if (e.url.indexOf(link) == 0) {
                alert('posting was cancelled');
                inappBr.close();
            }
            if (e.url.indexOf('https://m.facebook.com/story.php') == 0) {
                inappBr.close();
                alert('You posted this on Facebook');
            }
        });
    }

    function performShare() {
        $cordovaSocialSharing.shareViaFacebook("hello", '', "http://pgday.phonegap.com/us2014")
            .then(function(result) {
                //alert('success'); //successfully made share
            }, function(err) {
                //alert('fail'); //successfully made share
            });
    }

    $scope.shareSms = function() {
        var content = "I would like you to join Linkagoal, a goal based social network where you write, share, track and achieve your life goals (publicly or privately), create posts, stay connected with your friends, motivate others and do lot more! Join Now";
        $cordovaSocialSharing
            .shareViaSMS(content + " " + link, '')
            .then(function(result) {
                try {
                    // $cordovaToast.showShortTop('Successfully shared');
                } catch (e) {}
            }, function(err) {
                try {
                    $cordovaToast.showShortTop('Error in sharing.');
                } catch (e) {}
            });

    }

    $scope.shareEmail = function() {
        var content = "I'm using Linkagoal to set and track my goals and I would like you to be a part of my network. Linkagoal is a goal based social network where you write, share, track and achieve your life goals (publicly or privately), create posts, stay connected with your friends, motivate others and do lot more! Join Now ";
        $cordovaSocialSharing
            .shareViaEmail(content + " " + link, "Download Linkagoal App", null, null, null, null)
            .then(function(result) {
                try {
                    // $cordovaToast.showShortTop('Successfully shared');
                } catch (e) {}
            }, function(err) {
                try {
                    $cordovaToast.showShortTop('Error in sharing.');
                } catch (e) {}
            });
    }
})

.controller('GifBoxCtrl', ['$scope', '$http', '$rootScope', 'lagConfig', function($scope, $http, $rootScope, lagConfig) {


}]);

function UserIdCtrl($scope, $stateParams) {
    $scope.uid = $stateParams.id
}
