angular.module('starter', ['ionic',
    'ngSanitize',
    'starter.controllers',
    'starter.directives',
    'ngCordova',
    'CoreApi',
    'monospaced.elastic',
    'LocalStorageModule',
    'angular-spinkit',
    'starter.services',
    'ionic.contrib.ui.hscrollcards',
    'lg.ionCoverHeader',
    'ionic.ui.modalService',
    'ngTouch',
    'ion-gallery',
    'ion-place-tools',
    'ionicPushwoosh.services',
    'ng-fx',
    'app.chat',
    'luegg.directives',
    'ui.mention',
    'ngProgress',
    'ionic-datepicker'
])

.run(function($ionicPlatform, $cordovaStatusbar, User, TemporaryDataService, App, $state, $cordovaSplashscreen, $cordovaNativeAudio, Pushwoosh) {
    $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);

        }

        try {
            if (window.StatusBar) {
                StatusBar.styleLightContent();
                StatusBar.overlaysWebView(true)
            }
        } catch (e) {

        }

        try {
            $cordovaNativeAudio.preloadSimple('guess-what', 'audio/guess-what.mp3')
                .then(function(msg) { console.log(msg); })
                .catch(function(error) { console.error(error); });
        } catch (e) {

        }

        setTimeout(function() {
            try {
                $cordovaSplashscreen.hide()
            } catch (e) {}
            setTimeout(function() {
                document.getElementById("wrap-loading").className += " fade-hide";
                setTimeout(function() {
                    document.getElementById("custom-overlay").remove();
                }, 1000);
            }, 1600);
        }, 400)









        /*var text = TemporaryDataService.get();
            console.log(text);
    
            var test = User.getLoggedInUser()
            console.log(test);
    
            var kk = User.isAuthenticated();
            console.log(kk);  
    
    
            if(User.isAuthenticated == true){
              $state.go('tab.dashboard');
            }
            else if(User.isAuthenticated == false) {
               $state.go('main.intro');
            }*/

        // App.init().then(function(data) {
        //  console.log(data);
        //  if(data == true){
        //     $state.go('tab.dashboard');
        //  }
        //  else{
        //     $state.go('main.intro');
        //  }

        //  });
        try { Pushwoosh.init(); } catch (er) {}
    });
})

.run(['$window', function($window) {
    // Subscribe to cold-start event
    document.addEventListener('handleurl', handleOpen, false);

    // re-register event handler
    $window.handleOpenURL = function(url) {
        handleOpen({
            url: url
        });
    };

    function handleOpen(e) {
        handleExternalOpenURL(e.url);
    }
}])

.run(function($rootScope, PopupService, UserDataServices, User, localStorageService, GoalsDataServices, Post, PrivacyCache, CategoriesCache) {
    PrivacyCache.get();
    CategoriesCache.get();
    $rootScope.PopupService = PopupService;
    loggedInUser = localStorageService.get('loggedInUser');
    $rootScope.addRemoveInterestTag = function(tag) {
        var id = tag.id || 0;
        if (tag.isMyInterest == 0) {
            tag.isMyInterest = 1;
            UserDataServices.addUserInterest(loggedInUser.user.uid, id).success(function(result) {
                //
            })
        } else {
            tag.isMyInterest = 0;
            UserDataServices.removeUserInterest(loggedInUser.user.uid, id).success(function(result) {
                //
            })
        }
    }

    $rootScope.motivateOnGoal = function(goal) {
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

    $rootScope.isMe = function(id) {
        if (id == User.getLoggedInUserId()) {
            return true;


        } else {
            return false;
        }
    }

    $rootScope.followUnfollowUser = function(user) {
        var isFollowing = user.me.isFollowing;
        if (user.me.isFollowing == 0) {
            user.me.isFollowing = 1;
        } else {
            user.me.isFollowing = 0;
        }
        UserDataServices.followUnfollowUser(user.uid, isFollowing);
    }

    $rootScope.followUnfollowGoal = function(goal) {
        if (goal.me.isFollower == 0) {
            goal.me.isFollower = 1;
            goal.stats.followers = goal.stats.followers + 1;
            GoalsDataServices.followUnfollow(goal.id, 0);
        } else {
            goal.me.isFollower = 0;
            goal.stats.followers = goal.stats.followers - 1;
            GoalsDataServices.followUnfollow(goal.id, 1);
        }
    }

})



.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider, $locationProvider) {


    $ionicConfigProvider.tabs.position('bottom');
    $ionicConfigProvider.tabs.style("striped");
    $ionicConfigProvider.navBar.alignTitle('center');

    $ionicConfigProvider.backButton.text('');
    $ionicConfigProvider.backButton.icon('ft-20 lg-icon-caret-left');
    $ionicConfigProvider.backButton.previousTitleText(false);

    //$ionicConfigProvider.scrolling.jsScrolling(false);



    //$ionicConfigProvider.navBar.positionPrimaryButtons("left");
    //$ionicConfigProvider.backButton.icon("ion-chevron-left");
    // Ionic uses AngularUI Router which uses the concept of states
    $stateProvider

        .state('main', {
        abstract: true,
        url: "/main",
        templateUrl: 'templates/intro.html',
        resolve: {
            init: function($state, App, PushwooshState, $timeout) {
                App.init().then(function(res) {
                    var stat = PushwooshState.get();
                    if (!isEmpty(stat) && stat.state != 'chatmain.chat-convo') {
                        $timeout(function() {
                            $state.go('tab.me');
                        }, 500)

                    } else {
                        $state.go('tab.dashboard');
                    }
                }, function() {
                    //$state.go('main.login');
                });
            }
        }
    })

    .state('main.intro', {
        url: "/intro",
        views: {
            'mainContent': {
                templateUrl: "templates/into-walkthrough.html",
                controller: 'IntroCtrl',

            }
        }
    })

    .state('main.signup', {
        url: "/signup",
        views: {
            'mainContent': {
                templateUrl: "templates/signup.html",
                controller: 'SignUpCtrl'
            }
        }
    })

    .state('main.login', {
            url: "/login",
            cache: false,
            views: {
                'mainContent': {
                    templateUrl: "templates/login.html",
                    controller: 'LoginCtrl'
                }
            }
        })
        .state('main.fbsignin', {
            url: "/fbsignin",
            views: {
                'mainContent': {
                    templateUrl: "templates/fbsignin.html",
                    controller: 'FbSignInCtrl'
                }
            }
        })
        .state('main.forgot', {
            url: "/forgot",
            views: {
                'mainContent': {
                    templateUrl: "templates/forgotpassword.html",
                    controller: 'ForgotPassCtrl'
                }
            }
        })

    // .state('main.forgot-confirm', {
    //     url: "/forgot/confirm",
    //     views: {
    //         'mainContent': {
    //             templateUrl: "templates/forgotpasswordconfirm.html",
    //             controller: 'ForgotPassCtrl'
    //         }
    //     }
    // })


    .state('aftersignup', {
        abstract: true,
        url: '/i',
        templateUrl: 'templates/new-design/postsignup/base.html',
        resolve: {
            init: function($state, App) {
                App.init().then(function(res) {
                    //$state.go('tab.dashboard');
                }, function() {
                    $state.go('main.login');
                });
            }
        }
    })

/************New Work *************/
    .state('aftersignup.gender', {
        url: '/gender',
        views: {
            'afterContent' : {
                templateUrl: "templates/new-design/postsignup/gender.html"
            }
        }
    })
    

/**************End ****************/

    .state('aftersignup.welcome', {
            url: "/welcome",
            views: {
                'afterContent': {
                    templateUrl: "templates/postsignup/welcome.html",
                    controller: 'AfterSignupWelcomeCtrl'
                }
            }
        })
        .state('aftersignup.about-you', {
            url: "/about-you",
            views: {
                'afterContent': {
                    templateUrl: "templates/postsignup/about_you.html",
                    controller: 'AfterSignupAboutYouCtrl'
                }
            }
        })

    .state('aftersignup.interest', {
        url: "/interest",
        views: {
            'afterContent': {
                templateUrl: "templates/postsignup/interest.html",
                controller: 'AfterSignupInterestCtrl'
            }
        }
    })

    .state('aftersignup.make-new-connections', {
        url: "/make-new-connections",
        views: {
            'afterContent': {
                templateUrl: "templates/postsignup/make-new-connection.html",
                controller: 'AfterSignupConnectionsCtrl'
            }
        }
    })

    .state('aftersignup.create-first-goal', {
        url: "/create-first-goal",
        views: {
            'afterContent': {
                templateUrl: "templates/postsignup/create-first-goal.html",
                controller: 'CreateGoalCtrl'
            }
        }
    })

    .state('aftersignup.follow-goal', {
        url: "/follow-goal",
        views: {
            'afterContent': {
                templateUrl: "templates/postsignup/follow-goal.html",
                controller: 'AfterSignupGoalSuggestionsCtrl'
            }
        }
    })

    .state('aftersignup.app-guide', {
        url: "/app-guide",
        views: {
            'afterContent': {
                templateUrl: "templates/page-guide.html",
                controller: 'AfterSignupAppGuidesCtrl'
            }
        }
    })

    // setup an abstract state for the tabs directive
    .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html',
        controller: "TabCtrl",
        resolve: {
            init: function($state, App) {
                App.init().then(function(res) {
                    //$state.go('tab.dashboard');
                }, function() {
                    $state.go('main.login');
                });
            }
        }
    })

    // Each tab has its own nav history stack:

    .state('tab.dashboard', {
        url: '/dashboard',
        views: {
            'tab-dash': {
                templateUrl: 'templates/tab-dash.html',
                controller: 'DashboardCtrl'
            }
        }
    })

    .state('tab.explore', {
        url: '/explore',
        views: {
            'tab-explore': {
                templateUrl: 'templates/tab-explore.html',
                controller: 'ExploreCtrl'
            }
        }
    })

    .state('tab.me', {
        url: '/me',
        views: {
            'tab-me': {
                templateUrl: 'templates/tab-me.html',
                controller: 'MeTabCtrl'
            }
        }
    })

    .state('tab.me.posts-comments', {
        url: '/posts/:id/comments',
        views: {
            'tab-me@tab': {
                templateUrl: 'templates/comments.html',
                controller: 'CommentCtrl'
            }
        }
    })

    .state('tab.dashboard.posts-comments', {
        url: '/posts/:id/comments',
        views: {
            'tab-dash@tab': {
                templateUrl: 'templates/comments.html',
                controller: 'CommentCtrl'
            }
        }
    })

    .state('tab.explore.posts-comments', {
        url: '/posts/:id/comments',
        views: {
            'tab-explore@tab': {
                templateUrl: 'templates/comments.html',
                controller: 'CommentCtrl'
            }
        }
    })

    .state('tab.more.posts-comments', {
        url: '/posts/:id/comments',
        views: {
            'tab-more@tab': {
                templateUrl: 'templates/comments.html',
                controller: 'CommentCtrl'
            }
        }
    })

    .state('tab.me-posts', {
        url: '/me/posts/:id',
        views: {
            'tab-me@tab': {
                templateUrl: 'templates/posts.html',
                controller: 'PostCtrl'
            }
        }
    })

    .state('tab.me-profile', {
        url: '/me/profile/:id',
        views: {
            'tab-me@tab': {
                templateUrl: 'templates/user/profile/index.html',
                controller: 'ProfileCtrl'
            }
        }
    })

    .state('tab.explore.category', {
        url: '/category/:category_id',
        views: {
            'tab-explore@tab': {
                templateUrl: 'templates/tab-explore-goals.html',
                controller: 'CategoriesCtrl'
            }
        }
    })

    .state('tab.explore.category.subcategory', {
        url: '/:id',
        views: {
            'tab-explore@tab': {
                templateUrl: 'templates/tab-explore-goals.html',
                controller: 'SubCategoriesCtrl'
            }
        }
    })

    .state('tab.explore.featuredprofiles', {
        url: '/featured-profiles',
        views: {
            'tab-explore@tab': {
                templateUrl: 'templates/tab-explore-users.html',
                controller: 'FeaturedProfilesCtrl'
            }
        }
    })

    .state('tab.explore.hotnewgoals', {
        url: '/hot-new-goals',
        views: {
            'tab-explore@tab': {
                templateUrl: 'templates/tab-explore-goals.html',
                controller: 'HotNewGoalsCtrl'
            }
        }
    })

    .state('tab.explore.populargoals', {
        url: '/popular-goals',
        views: {
            'tab-explore@tab': {
                templateUrl: 'templates/tab-explore-goals.html',
                controller: 'PopularGoalsCtrl'
            }
        }
    });

    var tabs = ['dashboard', 'explore', 'me', 'more'];

    angular.forEach(tabs, function(val, key) {
        //console.log(val)

        var state = {};
        var viewName = 'tab-' + val + '@tab';

        state[viewName] = {
            templateUrl: 'templates/search.html',
            controller: 'SearchGoalsProfilesTagsCtrl'
        }

        $stateProvider.state('tab.' + val + '.search', {
            url: '/search',
            views: state
        })

        state[viewName] = {
            templateUrl: 'templates/search_goals.html',
            controller: 'SearchGoalsCtrl'
        }

        $stateProvider.state('tab.' + val + '.search.goals', {
            url: '/goals?q',
            views: state
        })

        state[viewName] = {
            templateUrl: 'templates/search_users.html',
            controller: 'SearchUsersCtrl'
        }

        $stateProvider.state('tab.' + val + '.search.users', {
            url: '/users?q',
            views: state
        })

        // .state('tab.'+val+'.search.tags', {
        //   url: '/tags?q',
        //   views: {
        //     'tab-'+val+'@tab': {
        //       templateUrl: 'templates/search_tags.html',
        //       controller: 'SearchInterestCtrl'
        //     }
        //   }
        // })



    })


    $stateProvider.state('app', {
        abstract: true,
        url: '/app',
        templateUrl: 'templates/app.html',
        resolve: {
            init: function($state, App) {
                App.init().then(function(res) {
                    //$state.go('tab.dashboard');
                }, function() {
                    $state.go('main.login');
                });
            }
        }
    })

    .state('app.post', {
        url: '/posts/:id',
        views: {
            'appcontent': {
                templateUrl: 'templates/posts.html',
                controller: 'PostCtrl'
            }
        }
    })

    .state('tab.dashboard.post_motivators', {
        url: '/posts/:id/motivations',
        views: {
            'tab-dash@tab': {
                templateUrl: 'templates/user/profile/users_list.html',
                controller: 'PostMotivationsCtrl'
            }
        }
    })

    .state('tab.explore.post_motivators', {
        url: '/posts/:id/motivations',
        views: {
            'tab-explore@tab': {
                templateUrl: 'templates/user/profile/users_list.html',
                controller: 'PostMotivationsCtrl'
            }
        }
    })

    .state('tab.me.post_motivators', {
        url: '/posts/:id/motivations',
        views: {
            'tab-me@tab': {
                templateUrl: 'templates/user/profile/users_list.html',
                controller: 'PostMotivationsCtrl'
            }
        }
    })

    .state('tab.more.post_motivators', {
        url: '/posts/:id/motivations',
        views: {
            'tab-more@tab': {
                templateUrl: 'templates/user/profile/users_list.html',
                controller: 'PostMotivationsCtrl'
            }
        }
    })

    .state('tab.dashboard.post', {
        url: '/posts/:id',
        views: {
            'tab-dash@tab': {
                templateUrl: 'templates/posts.html',
                controller: 'PostCtrl'
            }
        }
    })

    .state('tab.explore.post', {
        url: '/posts/:id',
        views: {
            'tab-explore@tab': {
                templateUrl: 'templates/posts.html',
                controller: 'PostCtrl'
            }
        }
    })

    .state('tab.me.post', {
        url: '/posts/:id',
        views: {
            'tab-me@tab': {
                templateUrl: 'templates/posts.html',
                controller: 'PostCtrl'
            }
        }
    })

    .state('tab.me.post-comments', {
        url: '/posts/:id',
        views: {
            'tab-me@tab': {
                templateUrl: 'templates/posts-comments.html',
                controller: 'PostCommentCtrl'
            }
        }
    })

    .state('tab.more.post', {
        url: '/posts/:id',
        views: {
            'tab-more@tab': {
                templateUrl: 'templates/posts.html',
                controller: 'PostCtrl'
            }
        }
    })

    .state('app.posts-comments', {
        url: '/posts/:id/comments',
        views: {
            'appcontent': {
                templateUrl: 'templates/comments.html',
                controller: 'CommentCtrl'
            }
        }
    })

    .state('app.tags', {
        url: '/tagged/:name',
        views: {
            'appcontent': {
                templateUrl: 'templates/tag_page.html',
                controller: 'TagCtrl'
            }
        }
    })

    .state('tab.dashboard.tags', {
        url: '/tagged/:name',
        views: {
            'tab-dash@tab': {
                templateUrl: 'templates/tag_page.html',
                controller: 'TagCtrl'
            }
        }
    })

    .state('tab.explore.tags', {
        url: '/tagged/:name',
        views: {
            'tab-explore@tab': {
                templateUrl: 'templates/tag_page.html',
                controller: 'TagCtrl'
            }
        }
    })

    .state('tab.me.tags', {
        url: '/tagged/:name',
        views: {
            'tab-me@tab': {
                templateUrl: 'templates/tag_page.html',
                controller: 'TagCtrl'
            }
        }
    })

    .state('tab.more.tags', {
        url: '/tagged/:name',
        views: {
            'tab-more@tab': {
                templateUrl: 'templates/tag_page.html',
                controller: 'TagCtrl'
            }
        }
    })

    .state('app.search-page', {
        url: '/search',
        views: {
            'appcontent': {
                templateUrl: 'templates/search.html',
                controller: 'SearchGoalsProfilesTagsCtrl'
            }
        }
    })

    .state('tab.dashboard.search-page', {
        url: '/search',
        views: {
            'tab-dash@tab': {
                templateUrl: 'templates/search.html',
                controller: 'SearchGoalsProfilesTagsCtrl'
            }
        }
    })

    .state('tab.explore.search-page', {
        url: '/search',
        views: {
            'tab-explore@tab': {
                templateUrl: 'templates/search.html',
                controller: 'SearchGoalsProfilesTagsCtrl'
            }
        }
    })

    .state('tab.me.search-page', {
        url: '/search',
        views: {
            'tab-me@tab': {
                templateUrl: 'templates/search.html',
                controller: 'SearchGoalsProfilesTagsCtrl'
            }
        }
    })

    .state('tab.more.search-page', {
        url: '/search',
        views: {
            'tab-more@tab': {
                templateUrl: 'templates/search.html',
                controller: 'SearchGoalsProfilesTagsCtrl'
            }
        }
    })

    .state('app.search-goals', {
        url: '/search/goals?q',
        views: {
            'appcontent': {
                templateUrl: 'templates/search_goals.html',
                controller: 'SearchGoalsCtrl'
            }
        }
    })

    .state('tab.dashboard.search-goals', {
        url: '/search/goals?q',
        views: {
            'tab-dash@tab': {
                templateUrl: 'templates/search_goals.html',
                controller: 'SearchGoalsCtrl'
            }
        }
    })

    .state('tab.explore.search-goals', {
        url: '/search/goals?q',
        views: {
            'tab-explore@tab': {
                templateUrl: 'templates/search_goals.html',
                controller: 'SearchGoalsCtrl'
            }
        }
    })

    .state('tab.me.search-goals', {
        url: '/search/goals?q',
        views: {
            'tab-me@tab': {
                templateUrl: 'templates/search_goals.html',
                controller: 'SearchGoalsCtrl'
            }
        }
    })

    .state('tab.more.search-goals', {
        url: '/search/goals?q',
        views: {
            'tab-more@tab': {
                templateUrl: 'templates/search_goals.html',
                controller: 'SearchGoalsCtrl'
            }
        }
    })

    .state('app.search-users', {
        url: '/search/users?q',
        views: {
            'appcontent': {
                templateUrl: 'templates/search_users.html',
                controller: 'SearchUsersCtrl'
            }
        }
    })

    .state('tab.dashboard.search-users', {
        url: '/search/users?q',
        views: {
            'tab-dash@tab': {
                templateUrl: 'templates/search_users.html',
                controller: 'SearchUsersCtrl'
            }
        }
    })

    .state('tab.explore.search-users', {
        url: '/search/users?q',
        views: {
            'tab-explore@tab': {
                templateUrl: 'templates/search_users.html',
                controller: 'SearchUsersCtrl'
            }
        }
    })

    .state('tab.me.search-users', {
        url: '/search/users?q',
        views: {
            'tab-me@tab': {
                templateUrl: 'templates/search_users.html',
                controller: 'SearchUsersCtrl'
            }
        }
    })

    .state('tab.more.search-users', {
        url: '/search/users?q',
        views: {
            'tab-more@tab': {
                templateUrl: 'templates/search_users.html',
                controller: 'SearchUsersCtrl'
            }
        }
    })

    .state('app.search-tags', {
        url: '/search/tags?q',
        views: {
            'appcontent': {
                templateUrl: 'templates/search_tags.html',
                controller: 'SearchInterestCtrl'
            }
        }
    })

    .state('tab.dashboard.search-tags', {
        url: '/search/tags?q',
        views: {
            'tab-dash@tab': {
                templateUrl: 'templates/search_tags.html',
                controller: 'SearchInterestCtrl'
            }
        }
    })

    .state('tab.explore.search-tags', {
        url: '/search/tags?q',
        views: {
            'tab-explore@tab': {
                templateUrl: 'templates/search_tags.html',
                controller: 'SearchInterestCtrl'
            }
        }
    })

    .state('tab.me.search-tags', {
        url: '/search/tags?q',
        views: {
            'tab-me@tab': {
                templateUrl: 'templates/search_tags.html',
                controller: 'SearchInterestCtrl'
            }
        }
    })

    .state('tab.more.search-tags', {
        url: '/search/tags?q',
        views: {
            'tab-more@tab': {
                templateUrl: 'templates/search_tags.html',
                controller: 'SearchInterestCtrl'
            }
        }
    })


    .state('app.profile-edit', {
        url: '/profile/edit',
        views: {
            'appcontent': {
                templateUrl: 'templates/user/profile/edit.html',
                controller: 'ProfileEditCtrl'
            }
        }
    })

    .state('tab.dashboard.profile-edit', {
        url: '/profile/edit',
        views: {
            'tab-dash@tab': {
                templateUrl: 'templates/user/profile/edit.html',
                controller: 'ProfileEditCtrl'
            }
        }
    })

    .state('tab.explore.profile-edit', {
        url: '/profile/edit',
        views: {
            'tab-explore@tab': {
                templateUrl: 'templates/user/profile/edit.html',
                controller: 'ProfileEditCtrl'
            }
        }
    })

    .state('tab.me.profile-edit', {
        url: '/profile/edit',
        views: {
            'tab-me@tab': {
                templateUrl: 'templates/user/profile/edit.html',
                controller: 'ProfileEditCtrl'
            }
        }
    })

    .state('tab.more.profile-edit', {
        url: '/profile/edit',
        views: {
            'tab-more@tab': {
                templateUrl: 'templates/user/profile/edit.html',
                controller: 'ProfileEditCtrl'
            }
        }
    })

    .state('app.profile-connections', {
        url: '/profile/:id/connections',
        views: {
            'appcontent': {
                templateUrl: 'templates/user/profile/connections.html',
                controller: 'UserConnections'
            }
        }
    })

    .state('tab.dashboard.profile-connections', {
        url: '/profile/:id/connections',
        views: {
            'tab-dash@tab': {
                templateUrl: 'templates/user/profile/connections.html',
                controller: 'UserConnections'
            }
        }
    })

    .state('tab.explore.profile-connections', {
        url: '/profile/:id/connections',
        views: {
            'tab-explore@tab': {
                templateUrl: 'templates/user/profile/connections.html',
                controller: 'UserConnections'
            }
        }
    })

    .state('tab.me.profile-connections', {
        url: '/profile/:id/connections',
        views: {
            'tab-me@tab': {
                templateUrl: 'templates/user/profile/connections.html',
                controller: 'UserConnections'
            }
        }
    })

    .state('tab.more.profile-connections', {
        url: '/profile/:id/connections',
        views: {
            'tab-more@tab': {
                templateUrl: 'templates/user/profile/connections.html',
                controller: 'UserConnections'
            }
        }
    })

    .state('app.profile-connections.followers', {
        url: '/followers',
        views: {
            'appcontent-followers': {
                templateUrl: 'templates/user/profile/users_list.html',
                controller: 'UserFollowersCtrl'
            }
        }
    })

    .state('tab.dashboard.followers', {
        url: '/profile/:id/connections/followers',
        views: {
            'tab-dash@tab': {
                templateUrl: 'templates/user/profile/users_list.html',
                controller: 'UserFollowersCtrl'
            }
        }
    })

    .state('tab.explore.followers', {
        url: '/profile/:id/connections/followers',
        views: {
            'tab-explore@tab': {
                templateUrl: 'templates/user/profile/users_list.html',
                controller: 'UserFollowersCtrl'
            }
        }
    })

    .state('tab.me.followers', {
        url: '/profile/:id/connections/followers',
        views: {
            'tab-me@tab': {
                templateUrl: 'templates/user/profile/users_list.html',
                controller: 'UserFollowersCtrl'
            }
        }
    })

    .state('tab.more.followers', {
        url: '/profile/:id/connections/followers',
        views: {
            'tab-more@tab': {
                templateUrl: 'templates/user/profile/users_list.html',
                controller: 'UserFollowersCtrl'
            }
        }
    })

    .state('app.profile-connections.followings', {
        url: '/followings',
        views: {
            'appcontent-followings': {
                templateUrl: 'templates/user/profile/users_list.html',
                controller: 'UserFollowingsCtrl'
            }
        }
    })

    .state('tab.dashboard.followings', {
        url: '/profile/:id/connections/followings',
        views: {
            'tab-dash@tab': {
                templateUrl: 'templates/user/profile/users_list.html',
                controller: 'UserFollowingsCtrl'
            }
        }
    })

    .state('tab.explore.followings', {
        url: '/profile/:id/connections/followings',
        views: {
            'tab-explore@tab': {
                templateUrl: 'templates/user/profile/users_list.html',
                controller: 'UserFollowingsCtrl'
            }
        }
    })

    .state('tab.me.followings', {
        url: '/profile/:id/connections/followings',
        views: {
            'tab-me@tab': {
                templateUrl: 'templates/user/profile/users_list.html',
                controller: 'UserFollowingsCtrl'
            }
        }
    })

    .state('tab.more.followings', {
        url: '/profile/:id/connections/followings',
        views: {
            'tab-more@tab': {
                templateUrl: 'templates/user/profile/users_list.html',
                controller: 'UserFollowingsCtrl'
            }
        }
    })

    .state('app.profile-mutual-connections', {
        url: '/profile/:id/connections/mutual',
        views: {
            'appcontent': {
                templateUrl: 'templates/user/profile/users_list.html',
                controller: 'UserMutualConnections'
            }
        }
    })

    .state('tab.dashboard.profile-mutual-connections', {
        url: '/profile/:id/connections/mutual',
        views: {
            'tab-dash@tab': {
                templateUrl: 'templates/user/profile/users_list.html',
                controller: 'UserMutualConnections'
            }
        }
    })

    .state('tab.explore.profile-mutual-connections', {
        url: '/profile/:id/connections/mutual',
        views: {
            'tab-explore@tab': {
                templateUrl: 'templates/user/profile/users_list.html',
                controller: 'UserMutualConnections'
            }
        }
    })

    .state('tab.me.profile-mutual-connections', {
        url: '/profile/:id/connections/mutual',
        views: {
            'tab-me@tab': {
                templateUrl: 'templates/user/profile/users_list.html',
                controller: 'UserMutualConnections'
            }
        }
    })

    .state('tab.more.profile-mutual-connections', {
        url: '/profile/:id/connections/mutual',
        views: {
            'tab-more@tab': {
                templateUrl: 'templates/user/profile/users_list.html',
                controller: 'UserMutualConnections'
            }
        }
    })

    .state('app.profile-skills', {
        url: '/profile/:id/skills',
        views: {
            'appcontent': {
                templateUrl: 'templates/user/profile/skills.html',
                controller: 'ProfileCtrl'
            }
        }
    })

    .state('tab.dashboard.profile-skills', {
        url: '/profile/:id/skills',
        views: {
            'tab-dash@tab': {
                templateUrl: 'templates/user/profile/skills.html',
                controller: 'ProfileCtrl'
            }
        }
    })

    .state('tab.explore.profile-skills', {
        url: '/profile/:id/skills',
        views: {
            'tab-explore@tab': {
                templateUrl: 'templates/user/profile/skills.html',
                controller: 'ProfileCtrl'
            }
        }
    })

    .state('tab.me.profile-skills', {
        url: '/profile/:id/skills',
        views: {
            'tab-me@tab': {
                templateUrl: 'templates/user/profile/skills.html',
                controller: 'ProfileCtrl'
            }
        }
    })

    .state('tab.more.profile-skills', {
        url: '/profile/:id/skills',
        views: {
            'tab-more@tab': {
                templateUrl: 'templates/user/profile/skills.html',
                controller: 'ProfileCtrl'
            }
        }
    })

    .state('app.profile_work_edu', {
        url: '/profile/:id/work-edu',
        views: {
            'appcontent': {
                templateUrl: 'templates/user/profile/work-and-education.html',
                controller: 'WorkEduCtrl'
            }
        }
    })

    .state('tab.dashboard.profile_work_edu', {
        url: '/profile/:id/work-edu',
        views: {
            'tab-dash@tab': {
                templateUrl: 'templates/user/profile/work-and-education.html',
                controller: 'WorkEduCtrl'
            }
        }
    })

    .state('tab.explore.profile_work_edu', {
        url: '/profile/:id/work-edu',
        views: {
            'tab-explore@tab': {
                templateUrl: 'templates/user/profile/work-and-education.html',
                controller: 'WorkEduCtrl'
            }
        }
    })

    .state('tab.me.profile_work_edu', {
        url: '/profile/:id/work-edu',
        views: {
            'tab-me@tab': {
                templateUrl: 'templates/user/profile/work-and-education.html',
                controller: 'WorkEduCtrl'
            }
        }
    })

    .state('tab.more.profile_work_edu', {
        url: '/profile/:id/work-edu',
        views: {
            'tab-more@tab': {
                templateUrl: 'templates/user/profile/work-and-education.html',
                controller: 'WorkEduCtrl'
            }
        }
    })

    .state('app.profile-work-add-edit', {
        url: '/profile/:uid/work-add-edit/:id',
        views: {
            'appcontent': {
                templateUrl: 'templates/user/profile/work_add_edit.html',
                controller: 'WorkAddEditCtrl'
            }
        }
    })

    .state('tab.dashboard.profile-work-add-edit', {
        url: '/profile/:uid/work-add-edit/:id',
        views: {
            'tab-dash@tab': {
                templateUrl: 'templates/user/profile/work_add_edit.html',
                controller: 'WorkAddEditCtrl'
            }
        }
    })

    .state('tab.explore.profile-work-add-edit', {
        url: '/profile/:uid/work-add-edit/:id',
        views: {
            'tab-explore@tab': {
                templateUrl: 'templates/user/profile/work_add_edit.html',
                controller: 'WorkAddEditCtrl'
            }
        }
    })

    .state('tab.me.profile-work-add-edit', {
        url: '/profile/:uid/work-add-edit/:id',
        views: {
            'tab-me@tab': {
                templateUrl: 'templates/user/profile/work_add_edit.html',
                controller: 'WorkAddEditCtrl'
            }
        }
    })

    .state('tab.more.profile-work-add-edit', {
        url: '/profile/:uid/work-add-edit/:id',
        views: {
            'tab-more@tab': {
                templateUrl: 'templates/user/profile/work_add_edit.html',
                controller: 'WorkAddEditCtrl'
            }
        }
    })

    .state('app.profile-edu-add-edit', {
        url: '/profile/:uid/edu-add-edit/:id',
        views: {
            'appcontent': {
                templateUrl: 'templates/user/profile/edu_add_edit.html',
                controller: 'EduAddEditCtrl'
            }
        }
    })

    .state('tab.dashboard.profile-edu-add-edit', {
        url: '/profile/:uid/edu-add-edit/:id',
        views: {
            'tab-dash@tab': {
                templateUrl: 'templates/user/profile/edu_add_edit.html',
                controller: 'EduAddEditCtrl'
            }
        }
    })

    .state('tab.explore.profile-edu-add-edit', {
        url: '/profile/:uid/edu-add-edit/:id',
        views: {
            'tab-explore@tab': {
                templateUrl: 'templates/user/profile/edu_add_edit.html',
                controller: 'EduAddEditCtrl'
            }
        }
    })

    .state('tab.me.profile-edu-add-edit', {
        url: '/profile/:uid/edu-add-edit/:id',
        views: {
            'tab-me@tab': {
                templateUrl: 'templates/user/profile/edu_add_edit.html',
                controller: 'EduAddEditCtrl'
            }
        }
    })

    .state('tab.more.profile-edu-add-edit', {
        url: '/profile/:uid/edu-add-edit/:id',
        views: {
            'tab-more@tab': {
                templateUrl: 'templates/user/profile/edu_add_edit.html',
                controller: 'EduAddEditCtrl'
            }
        }
    })

    .state('app.profile-interest', {
        url: '/profile/:id/interest',
        views: {
            'appcontent': {
                templateUrl: 'templates/user/profile/interest.html',
                controller: 'UserInterest'
            }
        }
    })

    .state('tab.dashboard.profile-interest', {
        url: '/profile/:id/interest',
        views: {
            'tab-dash@tab': {
                templateUrl: 'templates/user/profile/interest.html',
                controller: 'UserInterest'
            }
        }
    })

    .state('tab.explore.profile-interest', {
        url: '/profile/:id/interest',
        views: {
            'tab-explore@tab': {
                templateUrl: 'templates/user/profile/interest.html',
                controller: 'UserInterest'
            }
        }
    })

    .state('tab.me.profile-interest', {
        url: '/profile/:id/interest',
        views: {
            'tab-me@tab': {
                templateUrl: 'templates/user/profile/interest.html',
                controller: 'UserInterest'
            }
        }
    })

    .state('tab.more.profile-interest', {
        url: '/profile/:id/interest',
        views: {
            'tab-more@tab': {
                templateUrl: 'templates/user/profile/interest.html',
                controller: 'UserInterest'
            }
        }
    })

    .state('app.profile-activities', {
        url: '/profile/:id/activities',
        views: {
            'appcontent': {
                templateUrl: 'templates/user/profile/activities.html',
                controller: 'UserActivities'
            }
        }
    })

    .state('tab.dashboard.profile-activities', {
        url: '/profile/:id/activities',
        views: {
            'tab-dash@tab': {
                templateUrl: 'templates/user/profile/activities.html',
                controller: 'UserActivities'
            }
        }
    })

    .state('tab.explore.profile-activities', {
        url: '/profile/:id/activities',
        views: {
            'tab-explore@tab': {
                templateUrl: 'templates/user/profile/activities.html',
                controller: 'UserActivities'
            }
        }
    })

    .state('tab.me.profile-activities', {
        url: '/profile/:id/activities',
        views: {
            'tab-me@tab': {
                templateUrl: 'templates/user/profile/activities.html',
                controller: 'UserActivities'
            }
        }
    })

    .state('tab.more.profile-activities', {
        url: '/profile/:id/activities',
        views: {
            'tab-more@tab': {
                templateUrl: 'templates/user/profile/activities.html',
                controller: 'UserActivities'
            }
        }
    })

    .state('app.profile-activities.interactions', {
        url: '/interactions',
        views: {
            'appcontent-activities-interactions': {
                templateUrl: 'templates/user/profile/activities_interactions.html',
                controller: 'UserInteractions'
            }
        }
    })

    .state('tab.dashboard.interactions', {
        url: '/profile/:id/interactions',
        views: {
            'tab-dash@tab': {
                templateUrl: 'templates/user/profile/activities_interactions.html',
                controller: 'UserInteractions'
            }
        }
    })

    .state('tab.explore.interactions', {
        url: '/profile/:id/interactions',
        views: {
            'tab-explore@tab': {
                templateUrl: 'templates/user/profile/activities_interactions.html',
                controller: 'UserInteractions'
            }
        }
    })

    .state('tab.me.interactions', {
        url: '/profile/:id/interactions',
        views: {
            'tab-me@tab': {
                templateUrl: 'templates/user/profile/activities_interactions.html',
                controller: 'UserInteractions'
            }
        }
    })

    .state('tab.more.interactions', {
        url: '/profile/:id/interactions',
        views: {
            'tab-more@tab': {
                templateUrl: 'templates/user/profile/activities_interactions.html',
                controller: 'UserInteractions'
            }
        }
    })

    .state('app.profile-activities.posts', {
        url: '/posts',
        views: {
            'appcontent-activities-posts': {
                templateUrl: 'templates/user/profile/activities_posts.html',
                controller: 'UserPosts'
            }
        }
    })

    .state('tab.dashboard.posts', {
        url: '/profile/:id/posts',
        views: {
            'tab-dash@tab': {
                templateUrl: 'templates/user/profile/activities.html',
                controller: 'UserPosts'
            }
        }
    })

    .state('tab.explore.posts', {
        url: '/profile/:id/posts',
        views: {
            'tab-explore@tab': {
                templateUrl: 'templates/user/profile/activities_posts.html',
                controller: 'UserPosts'
            }
        }
    })

    .state('tab.me.posts', {
        url: '/profile/:id/posts',
        views: {
            'tab-me@tab': {
                templateUrl: 'templates/user/profile/activities_posts.html',
                controller: 'UserPosts'
            }
        }
    })

    .state('tab.more.posts', {
        url: '/profile/:id/posts',
        views: {
            'tab-more@tab': {
                templateUrl: 'templates/user/profile/activities_posts.html',
                controller: 'UserPosts'
            }
        }
    })

    .state('app.profile-activities.goals', {
        url: '/goals',
        views: {
            'appcontent-activities-goals': {
                templateUrl: 'templates/user/profile/activities_goals.html',
                controller: 'UserGoals'
            }
        }
    })


    .state('tab.dashboard.goals', {
        url: '/profile/:id/goals',
        views: {
            'tab-dash@tab': {
                templateUrl: 'templates/user/profile/activities_goals.html',
                controller: 'UserGoals'
            }
        }
    })

    .state('tab.explore.goals', {
        url: '/profile/:id/goals',
        views: {
            'tab-explore@tab': {
                templateUrl: 'templates/user/profile/activities_goals.html',
                controller: 'UserGoals'
            }
        }
    })

    .state('tab.me.goals', {
        url: '/profile/:id/goals',
        views: {
            'tab-me@tab': {
                templateUrl: 'templates/user/profile/activities_goals.html',
                controller: 'UserGoals'
            }
        }
    })

    .state('tab.more.goals', {
        url: '/profile/:id/goals',
        views: {
            'tab-more@tab': {
                templateUrl: 'templates/user/profile/activities_goals.html',
                controller: 'UserGoals'
            }
        }
    })

    .state('app.profile-media', {
        url: '/profile/:id/media',
        views: {
            'appcontent': {
                templateUrl: 'templates/user/profile/media.html',
                controller: 'ProfileMediaCtrl'
            }
        }
    })

    .state('tab.dashboard.profile-media', {
        url: '/profile/:id/media',
        views: {
            'tab-dash@tab': {
                templateUrl: 'templates/user/profile/media.html',
                controller: 'ProfileMediaCtrl'
            }
        }
    })

    .state('tab.explore.profile-media', {
        url: '/profile/:id/media',
        views: {
            'tab-explore@tab': {
                templateUrl: 'templates/user/profile/media.html',
                controller: 'ProfileMediaCtrl'
            }
        }
    })

    .state('tab.me.profile-media', {
        url: '/profile/:id/media',
        views: {
            'tab-me@tab': {
                templateUrl: 'templates/user/profile/media.html',
                controller: 'ProfileMediaCtrl'
            }
        }
    })

    .state('tab.more.profile-media', {
        url: '/profile/:id/media',
        views: {
            'tab-more@tab': {
                templateUrl: 'templates/user/profile/media.html',
                controller: 'ProfileMediaCtrl'
            }
        }
    })

    .state('app.profile', {
        url: '/profile/:id',
        views: {
            'appcontent': {
                templateUrl: 'templates/user/profile/index.html',
                controller: 'ProfileCtrl'
            }
        }
    })

    .state('tab.dashboard.profile', {
        url: '/profile/:id',
        views: {
            'tab-dash@tab': {
                templateUrl: 'templates/user/profile/index.html',
                controller: 'ProfileCtrl'
            }
        }
    })

    .state('tab.dashboard.consolidated-user-followed', {
        url: '/profile/:id/consolidated-user-followed',
        views: {
            'tab-dash@tab': {
                templateUrl: 'templates/consolidated_user_followed.html',
                controller: 'ConsolidatedUserCtrl'
            }
        }
    })

    .state('tab.dashboard.consolidated-goal-followed', {
        url: '/profile/:id/consolidated-goal-followed',
        views: {
            'tab-dash@tab': {
                templateUrl: 'templates/consolidated_goal_followed.html',
                controller: 'ConsolidatedGoalCtrl'
            }
        }
    })

    .state('tab.explore.profile', {
        url: '/profile/:id',
        views: {
            'tab-explore@tab': {
                templateUrl: 'templates/user/profile/index.html',
                controller: 'ProfileCtrl'
            }
        }
    })

    .state('tab.me.profile', {
        url: '/profile/:id',
        views: {
            'tab-me@tab': {
                templateUrl: 'templates/user/profile/index.html',
                controller: 'ProfileCtrl'
            }
        }
    })

    .state('tab.more.profile', {
        url: '/profile/:id',
        views: {
            'tab-more@tab': {
                templateUrl: 'templates/user/profile/index.html',
                controller: 'ProfileCtrl'
            }
        }
    })

    .state('tab.more', {
        cache: false,
        url: '/more',
        views: {
            'tab-more': {
                templateUrl: 'templates/tab-more.html',
                controller: 'MoreCtrl'
            }
        }
    })

    .state('tab.more.my_goals', {
        url: '/my-goals',
        views: {
            'tab-more@tab': {
                templateUrl: 'templates/partials/my_goals.html',
                controller: 'MoreCtrl'
            }
        }
    })

    .state('tab.more.invite', {
        url: '/invite',
        views: {
            'tab-more@tab': {
                templateUrl: 'templates/invite.html',
                controller: 'InviteCtrl'
            }
        }
    })

    .state('tab.more-find-friends', {
        url: '/more/find-friends',
        views: {
            'tab-more': {
                templateUrl: 'templates/user/account/find_friends.html',
                controller: 'MoreCtrl'
            }
        }
    })

    .state('tab.more-settings', {
        cache: false,
        url: '/more/account',
        views: {
            'tab-more': {
                templateUrl: 'templates/user/account/settings.html',
                controller: 'AccountSettingsListCtrl'
            }
        }
    })

    .state('tab.more-settings-account', {
        url: '/more/account/settings',
        views: {
            'tab-more': {
                templateUrl: 'templates/user/account/account.html',
                controller: 'AccountSettingsCtrl'
            }
        }
    })

    .state('tab.more-settings-devices', {
        url: '/more/account/devices',
        views: {
            'tab-more': {
                templateUrl: 'templates/user/account/devices.html',
                controller: 'AccountSettingsCtrl'
            }
        }
    })

    .state('tab.more-settings-username', {
        url: '/more/account/username',
        views: {
            'tab-more': {
                templateUrl: 'templates/user/account/username.html',
                controller: 'EditUsernameCtrl'
            }
        }
    })

    .state('tab.more-settings-email', {
        url: '/more/account/email',
        views: {
            'tab-more': {
                templateUrl: 'templates/user/account/email.html',
                controller: 'EditEmailCtrl'
            }
        }
    })

    .state('tab.more-settings-change-password', {
        url: '/more/account/change-password',
        views: {
            'tab-more': {
                templateUrl: 'templates/user/account/change_password.html',
                controller: 'AccountSettingsCtrl'
            }
        }
    })

    .state('tab.more-notification-settings', {
        url: '/more/account/notificaiton',
        views: {
            'tab-more': {
                templateUrl: 'templates/user/account/notification-settings.html',
                controller: 'MoreCtrl'
            }
        }
    })

    .state('tab.more-notification-settings-list', {
        url: '/more/account/notificaiton/list/:id',
        views: {
            'tab-more': {
                templateUrl: 'templates/user/account/notification_settings_list.html',
                controller: 'NotificationsSettingsCtrl'
            }
        }
    })

    .state('app.goal_media', {
        url: '/goal/:id/media',
        views: {
            'appcontent': {
                templateUrl: 'templates/goal/media.html',
                controller: 'GoalMediaCtrl'
            }
        }
    })

    .state('tab.dashboard.goal_media', {
        url: '/goal/:id/media',
        views: {
            'tab-dash@tab': {
                templateUrl: 'templates/goal/media.html',
                controller: 'GoalMediaCtrl'
            }
        }
    })

    .state('tab.explore.goal_media', {
        url: '/goal/:id/media',
        views: {
            'tab-explore@tab': {
                templateUrl: 'templates/goal/media.html',
                controller: 'GoalMediaCtrl'
            }
        }
    })

    .state('tab.me.goal_media', {
        url: '/goal/:id/media',
        views: {
            'tab-me@tab': {
                templateUrl: 'templates/goal/media.html',
                controller: 'GoalMediaCtrl'
            }
        }
    })

    .state('tab.more.goal_media', {
        url: '/goal/:id/media',
        views: {
            'tab-more@tab': {
                templateUrl: 'templates/goal/media.html',
                controller: 'GoalMediaCtrl'
            }
        }
    })

    .state('app.goal_milestones', {
        url: '/goal/:id/milestones',
        views: {
            'appcontent': {
                templateUrl: 'templates/goal/milestones.html',
                controller: 'GoalMilestoneCtrl'
            }
        }
    })

    .state('tab.dashboard.goal_milestones', {
        url: '/goal/:id/milestones',
        views: {
            'tab-dash@tab': {
                templateUrl: 'templates/goal/milestones.html',
                controller: 'GoalMilestoneCtrl'
            }
        }
    })

    .state('tab.explore.goal_milestones', {
        url: '/goal/:id/milestones',
        views: {
            'tab-explore@tab': {
                templateUrl: 'templates/goal/milestones.html',
                controller: 'GoalMilestoneCtrl'
            }
        }
    })

    .state('tab.me.goal_milestones', {
        url: '/goal/:id/milestones',
        views: {
            'tab-me@tab': {
                templateUrl: 'templates/goal/milestones.html',
                controller: 'GoalMilestoneCtrl'
            }
        }
    })

    .state('tab.more.goal_milestones', {
        url: '/goal/:id/milestones',
        views: {
            'tab-more@tab': {
                templateUrl: 'templates/goal/milestones.html',
                controller: 'GoalMilestoneCtrl'
            }
        }
    })


    .state('app.goal_edit', {
        url: '/goal/:id/edit',
        views: {
            'appcontent': {
                templateUrl: 'templates/goal/edit.html',
                controller: 'GoalCtrl'
            }
        }
    })

    .state('tab.dashboard.goal_edit', {
        url: '/goal/:id/edit',
        views: {
            'tab-dash@tab': {
                templateUrl: 'templates/goal/edit.html',
                controller: 'GoalCtrl'
            }
        }
    })

    .state('tab.explore.goal_edit', {
        url: '/goal/:id/edit',
        views: {
            'tab-explore@tab': {
                templateUrl: 'templates/goal/edit.html',
                controller: 'GoalCtrl'
            }
        }
    })

    .state('tab.me.goal_edit', {
        url: '/goal/:id/edit',
        views: {
            'tab-me@tab': {
                templateUrl: 'templates/goal/edit.html',
                controller: 'GoalCtrl'
            }
        }
    })

    .state('tab.more.goal_edit', {
        url: '/goal/:id/edit',
        views: {
            'tab-more@tab': {
                templateUrl: 'templates/goal/edit.html',
                controller: 'GoalCtrl'
            }
        }
    })

    .state('app.goal', {
        url: '/goal/:id',
        views: {
            'appcontent': {
                templateUrl: 'templates/goal/goal_screen.html',
                controller: 'GoalCtrl'
            }
        }
    })


    .state('tab.dashboard.goal_motivations', {
        url: '/goal/:id/motivations',
        views: {
            'tab-dash@tab': {
                templateUrl: 'templates/user/profile/users_list.html',
                controller: 'GoalMotivatorCtrl'
            }
        }

    })

    .state('tab.explore.goal_motivations', {
        url: '/goal/:id/motivations',
        views: {
            'tab-explore@tab': {
                templateUrl: 'templates/user/profile/users_list.html',
                controller: 'GoalMotivatorCtrl'
            }
        }

    })

    .state('tab.me.goal_motivations', {
        url: '/goal/:id/motivations',
        views: {
            'tab-me@tab': {
                templateUrl: 'templates/user/profile/users_list.html',
                controller: 'GoalMotivatorCtrl'
            }
        }

    })

    .state('tab.more.goal_motivations', {
        url: '/goal/:id/motivations',
        views: {
            'tab-more@tab': {
                templateUrl: 'templates/user/profile/users_list.html',
                controller: 'GoalMotivatorCtrl'
            }
        }

    })

    .state('tab.dashboard.goal_linkers', {
        url: '/goal/:id/linkers',
        views: {
            'tab-dash@tab': {
                templateUrl: 'templates/user/profile/users_list.html',
                controller: 'GoalLinkerCtrl'
            }
        }

    })

    .state('tab.explore.goal_linkers', {
        url: '/goal/:id/linkers',
        views: {
            'tab-explore@tab': {
                templateUrl: 'templates/user/profile/users_list.html',
                controller: 'GoalLinkerCtrl'
            }
        }

    })

    .state('tab.me.goal_linkers', {
        url: '/goal/:id/linkers',
        views: {
            'tab-me@tab': {
                templateUrl: 'templates/user/profile/users_list.html',
                controller: 'GoalLinkerCtrl'
            }
        }

    })

    .state('tab.more.goal_linkers', {
        url: '/goal/:id/linkers',
        views: {
            'tab-more@tab': {
                templateUrl: 'templates/user/profile/users_list.html',
                controller: 'GoalLinkerCtrl'
            }
        }

    })

    .state('tab.dashboard.goal_followers', {
        url: '/goal/:id/followers',
        views: {
            'tab-dash@tab': {
                templateUrl: 'templates/user/profile/users_list.html',
                controller: 'GoalFollowerCtrl'
            }
        }

    })

    .state('tab.explore.goal_followers', {
        url: '/goal/:id/followers',
        views: {
            'tab-explore@tab': {
                templateUrl: 'templates/user/profile/users_list.html',
                controller: 'GoalFollowerCtrl'
            }
        }

    })

    .state('tab.me.goal_followers', {
        url: '/goal/:id/followers',
        views: {
            'tab-me@tab': {
                templateUrl: 'templates/user/profile/users_list.html',
                controller: 'GoalFollowerCtrl'
            }
        }

    })

    .state('tab.more.goal_followers', {
        url: '/goal/:id/followers',
        views: {
            'tab-more@tab': {
                templateUrl: 'templates/user/profile/users_list.html',
                controller: 'GoalFollowerCtrl'
            }
        }

    })





    .state('tab.dashboard.goal', {
        url: '/goal/:id',
        views: {
            'tab-dash@tab': {
                templateUrl: 'templates/goal/goal_screen.html',
                controller: 'GoalCtrl'
            }
        }
    })

    .state('tab.explore.goal', {
        url: '/goal/:id',
        views: {
            'tab-explore@tab': {
                templateUrl: 'templates/goal/goal_screen.html',
                controller: 'GoalCtrl'
            }
        }
    })

    .state('tab.me.goal', {
        url: '/goal/:id',
        views: {
            'tab-me@tab': {
                templateUrl: 'templates/goal/goal_screen.html',
                controller: 'GoalCtrl'
            }
        }
    })

    .state('tab.more.goal', {
        url: '/goal/:id',
        views: {
            'tab-more@tab': {
                templateUrl: 'templates/goal/goal_screen.html',
                controller: 'GoalCtrl'
            }
        }
    })



    .state('chat', {
            abstract: true,
            url: '/chat',
            templateUrl: 'templates/chat/base.html',
            //template: '<ion-nav-bar class="bar-stable"><ion-nav-back-button></ion-nav-back-button><ion-nav-buttons side="right"><button class="button-icon lg-icon-caret-right" ng-click="search()"></button></ion-nav-buttons></ion-nav-bar><ion-nav-view></ion-nav-view>',
            // resolve: {
            //   init: function(App, $state) { App.init(); }
            // }
        })
        .state('chat.main', {
            url: '/main',
            views: {
                'chatcontent': {
                    templateUrl: 'templates/chat/user-list.html',
                    controller: 'ChatsCtrl'
                }
            }
        })
        .state('chat.conversation', {
            url: '/conversation/:id',
            views: {
                'chatcontent': {
                    templateUrl: 'templates/chat/conversation.html',
                    controller: 'ChatDetailCtrl'
                }
            }
        })
        // Static Pages
        .state('tab.more-about', {
            url: '/more/about',
            views: {
                'tab-more': {
                    templateUrl: 'templates/static/about.tpl.html',
                    controller: 'AboutCtrl'
                }
            }
        })
        .state('tab.more-careers', {
            url: '/more/careers',
            views: {
                'tab-more': {
                    templateUrl: 'templates/static/careers.tpl.html',
                    controller: 'CareersCtrl'
                }
            }
        })
        .state('tab.more-copyright', {
            url: '/more/copyright',
            views: {
                'tab-more': {
                    templateUrl: 'templates/static/copyright.tpl.html',
                    controller: 'CopyrightCtrl'
                }
            }
        })
        .state('tab.more-privacy', {
            url: '/more/privacy',
            views: {
                'tab-more': {
                    templateUrl: 'templates/static/privacy.tpl.html',
                    controller: 'PrivacyCtrl'
                }
            }
        })
        .state('tab.more-terms', {
            url: '/more/terms',
            views: {
                'tab-more': {
                    templateUrl: 'templates/static/terms-and-conditions.tpl.html',
                    controller: 'TermsCtrl'
                }
            }
        })
        .state('tab.more-feedback', {
            url: '/more/feedback',
            views: {
                'tab-more': {
                    templateUrl: 'templates/feedback.html',
                    controller: 'FeedbackCtrl'
                }
            }
        })
        .state('tab.more-appversion', {
            url: '/more/app-version',
            views: {
                'tab-more': {
                    templateUrl: 'templates/static/appversion.html',
                    controller: 'AppVersionCtrl'
                }
            }
        })



    .state('tab.account', {
        url: '/account',
        views: {
            'tab-account': {
                templateUrl: 'templates/tab-account.html',
                controller: 'AccountCtrl'
            }
        }
    });



    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/main/intro');

    function skipIfLoggedIn($q, User, localStorageService, $state) {

        var deferred = $q.defer();
        if (User.isAuthenticated()) {
            $state.go('tab.dashboard')
        } else {
            deferred.resolve();
        }
        return deferred.promise;
    }

    function loginRequired($q, $location, User) {
        var deferred = $q.defer();
        if (User.isAuthenticated()) {
            deferred.resolve();
        } else {
            $state.go('main.login')
                //$location.path('/login');
        }
        return deferred.promise;
    }


})

// $cordovaSocialSharing
.run(function($rootScope, $state, $ionicActionSheet, $ionicModal, $cordovaStatusbar, $ionicScrollDelegate, $ionicPopup, $ionicLoading, $ionicScrollDelegate, $ionicViewSwitcher, Post, UserDataServices, GoalsDataServices, User, appModalService, NotificationDataServices, site, ImageService, $cordovaInAppBrowser, activityService, Notifications) {
    //$rootScope.CategoriesList = CategoriesList;
    $rootScope.createOptionsEnabled = false;

    $rootScope.getNotification = function() {
        NotificationDataServices.get({ offset: 0, limit: 1 }).success(function(res) {
            if ($state.current.name == 'tab.me') {
                $rootScope.$broadcast('UNSHIFT_NOTIFCATION', { args: res.data.notifications[0] });
            }
            $rootScope.unseenNotifications = res.data;
        })
    }

    $rootScope.toggleCreateOptions = function() {
        try {
            if ($cordovaStatusbar.isVisible()) {
                $cordovaStatusbar.hide()
            } else {
                $cordovaStatusbar.show()
            }
        } catch (e) {}
        $ionicScrollDelegate.resize();
        $rootScope.createOptionsEnabled = !$rootScope.createOptionsEnabled;
    }

    $rootScope.closeCreateOptions = function() {
        try {
            if ($cordovaStatusbar.isVisible()) {
                $cordovaStatusbar.hide()
            } else {
                $cordovaStatusbar.show()
            }
        } catch (e) {}
        $ionicScrollDelegate.resize();
        $rootScope.createOptionsEnabled = false;
    }

    $rootScope.resizeScroll = function() {
        $ionicScrollDelegate.resize();
    }

    $rootScope.openUserProfile = function(uId) {
        $state.go('app.user', { uId: uId });
    };

    $rootScope.followProfile = function(uId) {
        LgPostActions.followUser(uId);
    };

    $rootScope.upVote = function(contribution_id) {
        LgPostActions.upVote(contribution_id);
    };

    $rootScope.downVote = function(contribution_id) {
        LgPostActions.downVote(contribution_id);
    };

    $rootScope.likeGoal = function(goalId) {
        LgPostActions.likeGoal(goalId);
    };

    $rootScope.hasHave = function(id) {
        return (id == User.suid) ? "have" : "has";
    };

    // $rootScope.isMe = function(uid) {
    //   return LgHelper.isMe(uid);
    // }

    $rootScope.openConnections = function(uId) {
        $state.go('app.user-connections', { uId: uId });
    };

    $rootScope.setActivity = function(activity, type) {
        activityService.set(activity);
        if (type == 'user') {
            $rootScope.navigateState('consolidated-user-followed', { id: User.me().uid });
        } else {
            $rootScope.navigateState('consolidated-goal-followed', { id: User.me().uid });
        }

    }

    $rootScope.showNoInternet = function() {
            $ionicPopup.alert({
                title: "Internet Disconnected",
                template: "No connection available on your device."
            }).then(function(result) {
                if (!result) { ionic.Platform.exitApp(); }
            });
        }
        //NetworkActivityIndicator.show();

    $rootScope.showGoalActionSheet = function(post, index, feed_type) {
        var buttons = []

        //index = 0 
        if (post.me.isFollower == 0) {
            buttons.push({ text: '<i class="icon lg-icon-notification"></i> Turn on notification' })
        } else {
            buttons.push({ text: '<i class="icon lg-icon-notification"></i> Turn off notification' })
        }

        //index  =1 
        if ($rootScope.isMe(post.user.uid) && feed_type != 'GOAL_CREATED') {
            buttons.push({ text: '<i class="icon lg-icon-delete"></i> Delete' })
        } else {
            buttons.push({ text: '<i class="icon ion-flag"></i> Report' })
        }

        function followOrUnfollow(post) {
            console.log(post);
            if (post.me.isFollower == 1) {
                post.me.isFollower = 0;
                Post.followUnfollow(post.id, 1)
            } else {
                post.me.isFollower = 1;
                Post.followUnfollow(post.id, 0)
            }
        }

        function deletePost(post) {
            console.log(post);
            // A confirm dialog

            var confirmPopup = $ionicPopup.confirm({
                title: 'Delete',
                template: 'Are you sure you want to delete this post?'
            });

            confirmPopup.then(function(res) {
                if (res) {
                    // Setup the loader
                    $ionicLoading.show({
                        content: 'Deleting Post.',
                        animation: 'fade-in',
                        showBackdrop: true,
                        maxWidth: 200,
                        showDelay: 0
                    });
                    //$rootScope.showLoading('Deleting Post.', 6000000)
                    Post.delete(post.id).success(function() {
                        $ionicLoading.hide();
                        //$rootScope.hideLoading();
                        $rootScope.$broadcast('POST_DELETED', { args: post, i: index })
                    })
                } else {
                    console.log('You are not sure');
                }
            });


        }

        var actionSheet = $ionicActionSheet.show({
            titleText: 'More actions',
            buttons: buttons,
            //destructiveText: 'Delete',
            cancelText: '<i class="icon rd-txt lg-icon-cross-small"></i> <span class="rd-txt">Close</span>',
            cancel: function() {},
            buttonClicked: function(index) {

                if (index == 0) { followOrUnfollow(post); }
                if (index == 1) { deletePost(post); }

                actionSheet();
            },
            /*destructiveButtonClicked: function() {
              console.log('DESTRUCT');
              return true;
            }*/
        });
    };



    $rootScope.linkOrUnlink = function(goal) {
        if (goal.me.isLinked == 1) {
            appModalService.show('templates/modals/goal-linked-list.html', 'GoalLinkedList as vm', goal).then(function(result) {
                if (result != null) {
                    GoalsDataServices.linkUnlink(goal.id, result.id, 1);
                    goal.me.isLinked = 0;
                    try {
                        $cordovaToast.showShortTop('Unlinked Successfully');
                    } catch (e) {}
                }
            })
        } else {
            appModalService.show('templates/modals/goals-list.html', 'MyGoalsCtrl as vm', goal).then(function(result) {
                if (result != null) {
                    goal.me.isLinked = 1;
                    GoalsDataServices.linkUnlink(goal.id, result.id, 0);
                    try {
                        $cordovaToast.showShortTop('Linked Successfully');
                    } catch (e) {}
                }
            });

        }
    }

    $rootScope.followOrUnfollow = function(goal) {
        if (goal.me.isFollower == 1) {
            goal.me.isFollower = 0;
            GoalsDataServices.followUnfollow(goal.id, 1)
        } else {
            goal.me.isFollower = 1;
            GoalsDataServices.followUnfollow(goal.id, 0)
        }
    }

    $rootScope.goalActions = function(goal, index) {
        var buttons = []
            // index = 0
        if (goal.me.isFollower == 0 && (User.suid != goal.user.uid)) {
            buttons.push({ text: '<i class= "icon ion-checkmark"></i> Follow' })
        } else if (goal.me.isFollower == 1 && (User.suid != goal.user.uid)) {
            buttons.push({ text: '<i class= "icon lg-icon-cross-small"></i> Unfollow' })
        }

        // index = 1
        if (goal.me.isLinked == 0 && (User.suid != goal.user.uid)) {
            buttons.push({ text: '<i class= "icon lg-icon-link-goal"></i> Link' })
        } else if (goal.me.isLinked == 1 && (User.suid != goal.user.uid)) {
            buttons.push({ text: '<i class= "icon lg-icon-link-goal"></i> Unlink' })
        }


        function reportOrDelete(goal) {
            console.log(goal)
            if ($rootScope.isMe(goal.user.uid)) {
                // A confirm dialog

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
                        GoalsDataServices.deletGoal(goal.id).success(function(res) {
                            console.log(res);
                            if (res.meta.status == 200) {
                                //$rootScope.hideLoading();
                                $ionicLoading.hide();
                                $rootScope.$broadcast('GOAL_DELETED', { i: index })
                            }
                        })
                    } else {
                        console.log('You are not sure');
                    }
                });

            } else {
                console.log("report")
            }
        }

        var actionSheet = $ionicActionSheet.show({

            titleText: 'More',
            buttons: buttons,
            destructiveText: ($rootScope.isMe(goal.user.uid)) ? '<i class="icon lg-icon-delete"></i> Delete' : '<i class="icon ion-flag"></i> Report',
            cancelText: '<i class="icon rd-txt lg-icon-cross-small"></i> <span class="rd-txt">Close</span>',
            cancel: function() {},
            buttonClicked: function(index) {
                if (index == 0) { $rootScope.followOrUnfollow(goal); }
                if (index == 1) { $rootScope.linkOrUnlink(goal); }
                actionSheet();
            },
            destructiveButtonClicked: function() {
                reportOrDelete(goal);
                return true;
            }
        });
    }


    // grab pointer to original function
    var oldSoftBack = $rootScope.$ionicGoBack;

    // override default behaviour
    $rootScope.$ionicGoBack = function() {
        setTimeout(function() {
            oldSoftBack();
        }, 100)
    };

    $rootScope.sharePost = function(post) {
        var subject = "Hey Check out this on Linkagoal.com";
        var img = "";
        var link = site.url('/activity/' + post.id);

        try {
            window.plugins.socialsharing.share(post.text, subject, img, link);
        } catch (e) {
            console.log("window.plugins.socialsharing not working");
        }

    }

    $rootScope.isLoggedIn = function() {
        return User.isAuthenticated();
    }

    $rootScope.shareGoal = function(goal) {
        var message = goal.name;
        var subject = "Hey Check out this goal! on Linkagoal.com";
        if (typeof goal.cover != undefined) {
            var img = goal.cover.large;
        } else {
            var img = '';
        }
        var link = site.url(goal.link);

        try {
            window.plugins.socialsharing.share(message, subject, img, link);
        } catch (e) {
            console.log("window.plugins.socialsharing not working");
        }
    }

    $rootScope.navigateState = function(state, data) {
        var middleState = $state.current.name.split(".")[1];
        $rootScope.navigateTo('tab.' + middleState + "." + state, data);
    }

    $rootScope.navigateTo = function(state, data) {
        var data = data || {}
        $state.go(state, data);
    }

    $rootScope.notificaitonNavigator = function(notification) {
        var id = notification.details.id;
        var state = null
        switch (notification.details.screen_type) {
            case 'comment':
                //state = "app.posts-comments";
                state = "tab.me.post-comments";
                break;
            case 'goal':
                state = "tab.me.goal";
                break;
            case 'user':
                state = "tab.me.profile";
                break;
            case 'post':
                state = "tab.me.post";
                break;
            default:
                state = '';
                break;
        }
        notification.read = 1;

        NotificationDataServices.read(notification.contextId)
        $ionicViewSwitcher.nextDirection('forward');
        $rootScope.navigateTo(state, { id: id });
    }

    $rootScope.showLoading = function(text, duration) {
        var tpl = text || "Loading...";
        var duration = duration || 10000;
        $rootScope.requestLoaded = false;
        $ionicLoading.show({
            template: tpl,
            duration: duration
        });
    };
    $rootScope.hideLoading = function() {
        $rootScope.requestLoaded = true;
        $ionicLoading.hide();
    };

    $rootScope.isEmpty = function(object) {
        for (var key in object) {
            if (object.hasOwnProperty(key)) {
                return false;
            }
        }
        return true;
    }


    $rootScope.openBrowser = function(link) {
        var options = {
            location: 'yes',
            clearcache: 'yes',
            toolbar: 'yes'
        };
        $cordovaInAppBrowser.open(link, '_blank', options)

        .then(function(event) {
            // success
        })

        .catch(function(event) {
            // error
        });

    }

    $rootScope.updateProfileImage = function() {

        var actionSheet = $ionicActionSheet.show({
            titleText: 'Actions',
            buttons: [{ text: '<i class="icon lg-icon-gallery"></i> Gallery' }, { text: '<i class="icon lg-icon-camera"></i> Camera' }],
            //destructiveText: 'Delete',
            cancelText: '<i class="icon rd-txt lg-icon-cross-small"></i> <span class="rd-txt">Close</span>',
            cancel: function() {},
            buttonClicked: function(index) {
                if (index == 0) {
                    ImageService.UploadNow('profile', false, true).then(function(res) {
                        console.log(res);
                        params = { attach_id: res.data.fileId }
                        UserDataServices.changeProfileImage(User.me().uid, params).success(function(result) {
                            $rootScope.$broadcast('profileImageChanged', { data: res.data.file });
                        })
                    });
                }
                if (index == 1) {
                    ImageService.UploadNow('profile', true, true).then(function(res) {
                        console.log(res);
                        params = { attach_id: res.data.fileId }
                        UserDataServices.changeProfileImage(User.me().uid, params).success(function(result) {
                            $rootScope.$broadcast('profileImageChanged', { data: res.data.file });
                        })
                    });
                }
                actionSheet();
            }
        })
    }

    $rootScope.updateCoverImage = function() {
        var actionSheet = $ionicActionSheet.show({
            titleText: 'Actions',
            buttons: [{ text: '<i class="icon lg-icon-gallery"></i> Gallery' }, { text: '<i class="icon lg-icon-camera"></i> Camera' }],
            //destructiveText: 'Delete',
            cancelText: '<i class="icon rd-txt lg-icon-cross-small"></i> <span class="rd-txt">Close</span>',
            cancel: function() {},
            buttonClicked: function(index) {
                if (index == 0) {
                    ImageService.UploadNow('cover', false, true).then(function(res) {
                        console.log(res);
                        params = { attach_id: res.data.fileId }
                        UserDataServices.changeProfileCover(User.me().uid, params).success(function(result) {
                            $rootScope.$broadcast('coverImageChanged', { data: res.data.file });
                        })
                    });
                }
                if (index == 1) {
                    ImageService.UploadNow('cover', true, true).then(function(res) {
                        console.log(res);
                        params = { attach_id: res.data.fileId }
                        UserDataServices.changeProfileCover(User.me().uid, params).success(function(result) {
                            $rootScope.$broadcast('coverImageChanged', { data: res.data.file });
                        })
                    });
                }
                actionSheet();
            }
        })
    }


});

if ('cordova' in window) {
    // Create a sticky event for handling the app being opened via a custom URL
    cordova.addStickyDocumentEventHandler('handleurl');
}

function handleOpenURL(url) {
    cordova.fireDocumentEvent('handleurl', { url: url });
}

function isEmpty(object) {
    for (var key in object) {
        if (object.hasOwnProperty(key)) {
            return false;
        }
    }
    return true;
}
