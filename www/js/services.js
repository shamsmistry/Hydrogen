angular.module('starter.services', [])

.constant('appConfig', {
    url: 'http://www.linkagoal.com',
    //url : 'http://qa.linkagoal.com',
})

.service('site', ['appConfig', function(appConfig) {
    this.url = function(path) {
        path = path || "/";
        return appConfig.url + path
    }
}])

.factory('PopupService', function($ionicPopup) {

    return {}

})

.factory('Chats', function() {
    // Might use a resource here that returns a JSON array

    // Some fake testing data
    var chats = [{
        id: 0,
        name: 'Ben Sparrow',
        lastText: 'You on your way?',
        face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
    }, {
        id: 1,
        name: 'Max Lynx',
        lastText: 'Hey, it\'s me',
        face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
    }, {
        id: 2,
        name: 'Adam Bradleyson',
        lastText: 'I should buy a boat',
        face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
    }, {
        id: 3,
        name: 'Perry Governor',
        lastText: 'Look at my mukluks!',
        face: 'https://pbs.twimg.com/profile_images/598205061232103424/3j5HUXMY.png'
    }];

    return {
        all: function() {
            return chats;
        },
        remove: function(chat) {
            chats.splice(chats.indexOf(chat), 1);
        },
        get: function(chatId) {
            for (var i = 0; i < chats.length; i++) {
                if (chats[i].id === parseInt(chatId)) {
                    return chats[i];
                }
            }
            return null;
        }
    };
})

.service('ModalService', function($ionicModal, $rootScope) {


    var init = function(tpl, $scope) {

        var promise;
        $scope = $scope || $rootScope.$new();

        promise = $ionicModal.fromTemplateUrl(tpl, {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
            return modal;
        });

        $scope.openModal = function() {
            $scope.modal.show();
        };
        $scope.closeModal = function() {
            $scope.modal.hide();
        };
        $scope.$on('$destroy', function() {
            $scope.modal.remove();
        });

        return promise;
    }

    return {
        init: init
    }

})

.service('TemporaryDataService', function($q) {
    var _tempData = {}
    this.set = function(data) {
        _tempData = data
    }
    this.get = function() {
        return _tempData;
    }
})

.service('workService', function() {
    var _work = {};
    this.get = function() {
        return _work;
    }
    this.set = function(work) {
        _work = work;
    }
})

.service('activityService', [function() {
    var _activity = {};
    this.get = function() {
        return _activity;
    }
    this.set = function(activity) {
        _activity = activity;
    }
}])

.service('eduService', function() {
    var _edu = {};
    this.get = function() {
        return _edu;
    }
    this.set = function(edu) {
        _edu = edu;
    }

})

.service('goalService', function() {
    var _goal = {};
    this.get = function() {
        return _goal;
    }
    this.set = function(goal) {
        _goal = goal;
    }
})

.directive('goalBox', function() {
    return {
        restrict: 'AE',
        scope: {
            goals: '=resultSet',
        },
        templateUrl: 'templates/partials/_goal_box.html'
    };
})

.service("User", function(localStorageService) {


    this.getLoggedInUser = function() {
        if (sessionUser = localStorageService.get('loggedInUser')) {
            return sessionUser.user
        } else {
            return {};
        }
    }

    this.isAuthenticated = function() {
        if (sessionUser = localStorageService.get('loggedInUser')) {
            return true;
        } else {
            return false;
        }
    }

    this.getLoggedInUserId = function() {
        if (sessionUser = localStorageService.get('loggedInUser')) {
            if ("user" in sessionUser) {
                return sessionUser.user.uid
            }
        }
        return 0;
    }

    this.getClientId = function() {
        if (sessionUser = localStorageService.get('loggedInUser')) {
            if ("credentials" in sessionUser) {
                return sessionUser.credentials.client_id
            } else {
                return null;
            }
        }
    }

    // this.me = function() {
    //   if (sessionUser = localStorageService.get('loggedInUser')) {
    //     return { 
    //       uid: sessionUser.user.uid, 
    //       name : sessionUser.user.name, 
    //       username : sessionUser.user.username, 
    //       email : sessionUser.user.user_email, 
    //       //image: sessionUser.user.profile.medium,
    //       //cover: sessionUser.user.cover.large,
    //       location: sessionUser.user.location,
    //       dob: sessionUser.user.dob,
    //       dob_show: sessionUser.user.dob_show
    //     }
    //   } else { return {} }
    // }

    this.me = function() {
        if (sessionUser = localStorageService.get('loggedInUser')) {
            try {
                user = {
                    uid: sessionUser.user.uid,
                    name: sessionUser.user.name,
                    username: sessionUser.user.username,
                    email: sessionUser.user.user_email,
                    image: sessionUser.user.profile.medium,
                    cover: sessionUser.user.cover.large,
                    location: sessionUser.user.location,
                    dob: sessionUser.user.dob,
                    dob_show: sessionUser.user.dob_show
                }
                return user;
            } catch (e) {
                //console.log(e)
                //localStorageService.remove('loggedInUser')
            }
        } else {
            return {}
        }
    }

    this.updateLS = function(params) {
        if (sessionUser = localStorageService.get('loggedInUser')) {
            if (params.hasOwnProperty("image")) {
                sessionUser.user.profile = params.image;
            }
            if (params.hasOwnProperty("cover")) {
                sessionUser.user.cover = params.cover;
            }
            if (params.hasOwnProperty("name")) {
                sessionUser.user.name = params.name;
            }
            if (params.hasOwnProperty("location")) {
                sessionUser.user.location = params.location;
            }

            if (params.hasOwnProperty("verified")) {
                sessionUser.user.verified = params.verified;
            }

            localStorageService.set("loggedInUser", sessionUser);
            return true;
        } else {
            return false;
        }
    }
    this.suid = this.getLoggedInUserId();
})

.filter('makeRange', function() {
    return function(input) {
        var lowBound, highBound;
        switch (input.length) {
            case 1:
                lowBound = 0;
                highBound = parseInt(input[0]) - 1;
                break;
            case 2:
                lowBound = parseInt(input[0]);
                highBound = parseInt(input[1]);
                break;
            default:
                return input;
        }
        var result = [];
        if (lowBound > highBound)
            for (var i = lowBound; i >= highBound; i--) result.push(i);
        if (lowBound < highBound)
            for (var i = lowBound; i <= highBound; i++) result.push(i);
        return result;
    };
})

.filter('readableTime', function() {
    return function(seconds) {
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
                return 'few seconds ago';
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
})

.filter('readableTime2', function() {
    return function(seconds) {
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
                return 'few seconds';
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
})

.filter('nlToSplit', function() {
    return function(text) {
        text = String(text).trim();
        return (text.length > 0 ? '<p class="man">' + text.replace(/[\r\n]+/g, '</p><p class="man">') + '</p>' : null);
    }
})

.filter('parseUrlFilter', function() {
    var urlPattern = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/gi;
    return function(text, target) {
        return text.replace(urlPattern, '<a target="' + target + '" rel="nofollow" href="$&">$&</a>');
    };
})

.filter('onEmpty', function() {
    return function(value, str) {
        if (!value) {
            if (!str) {
                return 'n/a';
            }
            return str;
        }
        return value;
    };
})

.filter('notificationHighlight', function() {
    return function(input, start, end) {
        var output = '<span class="txt-book">' + input.substring(start, end) + '</span> ' + input.substring(end, input.length);
        return output;
    }
})

.filter('YouFilter', function(User) {
    return function(input, id) {
        if (id == User.suid) {
            return "You";
        } else {
            return input;
        }
    }
})

.filter('hasHave', function(User) {
    return function(input, id) {
        if (id == User.suid) {
            return "have";
        } else {
            return "has";
        }
    }
})

.filter("nrFormat", function() {
    return function(number) {
        var abs;
        if (number !== 0) {
            abs = Math.abs(number);
            if (abs >= Math.pow(10, 12)) {
                number = (number / Math.pow(10, 12)).toFixed(1) + "t";
            } else if (abs < Math.pow(10, 12) && abs >= Math.pow(10, 9)) {
                number = (number / Math.pow(10, 9)).toFixed(1) + "b";
            } else if (abs < Math.pow(10, 9) && abs >= Math.pow(10, 6)) {
                number = (number / Math.pow(10, 6)).toFixed(1) + "m";
            } else if (abs < Math.pow(10, 6) && abs >= Math.pow(10, 3)) {
                number = (number / Math.pow(10, 3)).toFixed(1) + "k";
            }
            return number;
        } else {
            return 0; }
    };
})

.service('App', function($q, User, UserDataServices, Notifications, NotificationDataServices, $rootScope) {
    this.init = function() {
        var deferred = $q.defer();
        isAuthenticated = User.isAuthenticated();

        // if ((isAuthenticated == true)) {
        //     deferred.resolve(true);
        // } else { deferred.reject(false) }

        UserDataServices.verifyToken().success(function(res) {
            deferred.resolve(true);

            // NotificationDataServices.get().success(function(res) {
            //     Notifications.putFirst(res.data);
            // })


        }).error(function(error) {
            deferred.reject(false)
        });

        return deferred.promise;
    }

    // this.verifyToken = function (token) {

    // };
})

.service('PushwooshState', [function() {
    this.final_state = {};

    this.set = function(state) {

        this.final_state = state;
    }

    this.get = function(state) {
        return this.final_state;
    }
}])

.service('LoginService', function($cordovaDevice, $window) {
    this.get = function() {
        var device = {}
        try {
            device = {
                uuid: $cordovaDevice.getDevice().uuid || null,
                platform: $cordovaDevice.getDevice().platform || ionic.Platform.platform() || null,
                platform_version: $cordovaDevice.getDevice().version || ionic.Platform.version() || null,
                model: $cordovaDevice.getDevice().model || null,
                mobile: 1,
                //mobile: $cordovaDevice.getDevice().manufacturer || null,
            }
        } catch (e) {}

        device.isRetina = (window.devicePixelRatio > 1 ? 1 : 0) || null,
            device.screen_width = $window.innerWidth || null,
            device.screen_height = $window.innerHeight || null,
            device.useragent = navigator.userAgent || null
        return device;
    }
})

.service('CreateGoalDataService', [function() {
    var final_obj = {};
    final_obj.tags = [];

    this.setStartDate = function(startdate) {
        final_obj.start_date = startdate;
    }

    this.setEndDate = function(enddate) {
        final_obj.end_date = enddate;
    }


    this.get = function() {
        return final_obj;
    }

    this.setTags = function(tags) {
        final_obj.tags = tags;
    }

    this.getTags = function() {
        return final_obj.tags;
    }
}])

/* UploadSingleImage */
.service('ImageService', function($cordovaCamera, httpService, $cordovaFileTransfer, $q, $rootScope, FileService) {

    this.UploadNow = function(type, isCamera, isEditable) {
        var deferred = $q.defer();
        select(isCamera, isEditable).then(function(res) {
            $rootScope.showLoading("Uploading", 100000)
            console.log('selected');
            upload(res, type).then(function(res) {
                console.log('uploaded');
                $rootScope.hideLoading()
                deferred.resolve(res);
            }, function(err) {
                deferred.reject(err)
            })
        }, function(err) {
            deferred.reject(err)
        })
        return deferred.promise;
    }

    this.uploadMultiple = function(type, isCamera, isEditable) {
        var deferred = $q.defer();
        var images = [];
        window.imagePicker.getPictures(
            function(results) {
                var promises = []
                for (var i = 0; i < results.length; i++) {
                    console.log('Image URI: ' + results[i]);
                    images.push(results[i]);
                    promises.push(upload(results[i], type));
                }
                $rootScope.showLoading("Uploading...", 20000);
                $rootScope.progressbar = 0;
                $q.all(promises).then(function(res) {
                    $rootScope.progressbar = 100;
                    $rootScope.hideLoading();
                    deferred.resolve(res)

                });

            },
            function(error) {
                console.log('Error: ' + error);
            }
        );
        return deferred.promise;

    };

    this.select = function(isCamera, isEditable) {
        var options = {
            quality: 80,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: (isCamera == true) ? Camera.PictureSourceType.CAMERA : Camera.PictureSourceType.PHOTOLIBRARY,
            allowEdit: isEditable || false,
            encodingType: Camera.EncodingType.JPEG,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false
        };
        var deferred = $q.defer();
        $cordovaCamera.getPicture(options).then(function(imageData) {
            console.log("image url", imageData);
            deferred.resolve(imageData)
        }, function(err) {
            deferred.reject(err)
        });
        return deferred.promise;
    }


    function select(isCamera, isEditable) {
        var options = {
            quality: 80,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: (isCamera == true) ? Camera.PictureSourceType.CAMERA : Camera.PictureSourceType.PHOTOLIBRARY,
            allowEdit: isEditable || false,
            encodingType: Camera.EncodingType.JPEG,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false
        };
        var deferred = $q.defer();
        $cordovaCamera.getPicture(options).then(function(imageData) {
            console.log("image url", imageData);
            deferred.resolve(imageData)
        }, function(err) {
            deferred.reject(err)
        });
        return deferred.promise;
    }

    this.upload = function(imageUri, type, isGif, imageid) {
        var isGif = isGif || false;
        var deferred = $q.defer();
        if (isGif) {
            FileService.setType(type)
            FileService.selectGif(imageid).success(function(res){
                deferred.resolve(res);
            }).error(function(err){
                deferred.resolve(err);
            }) 
        } else {
            var route = httpService.Utils.buildUrl(new Array('upload', 'image'), { imageof: type }, true),
                filePath = imageUri;
            var options = {
                fileKey: "uploadfile",
                fileName: imageUri.substr(imageUri.lastIndexOf('/') + 1),
                chunkedMode: false,
                mimeType: "image/jpg",
                headers: httpService.Utils.getHeader().headers
            };

            $cordovaFileTransfer.upload(route, filePath, options).then(function(result) {
                var res = JSON.parse(result.response)
                deferred.resolve(res);
            }, function(err) {
                deferred.reject(err)
            }, function(progress) {
                //console.log(JSON.stringify(progress))
            });
            
        }        
        return deferred.promise;
    }

    function upload(imageUri, type) {
        var route = httpService.Utils.buildUrl(new Array('upload', 'image'), { imageof: type }, true),
            filePath = imageUri;
        var options = {
            fileKey: "uploadfile",
            fileName: imageUri.substr(imageUri.lastIndexOf('/') + 1),
            chunkedMode: false,
            mimeType: "image/jpg",
            headers: httpService.Utils.getHeader().headers
        };

        var deferred = $q.defer();
        console.log('uploading');
        $cordovaFileTransfer.upload(route, filePath, options).then(function(result) {
            var res = JSON.parse(result.response)
            deferred.resolve(res);
        }, function(err) {
            deferred.reject(err)
        }, function(progress) {
            //console.log(JSON.stringify(progress))
        });
        return deferred.promise;
    }
})

.filter('notificationkeyStrings', function() {
    var list = []
    list["LOGIN"] = "Alert on account login from a new browser or device"
    list["GOAL_FOLLOWED"] = "Someone followed my goal"
    list["USER_FOLLOWED"] = "Someone followed my profile"
    list["PROGRESS_UPDATED"] = "Progress Update on goal I am linked with or following"
    list["CONTRIBUTION"] = "Someone contributed on my goal"
    list["MILESTONE_CREATED"] = "Milestone added on goal I am linked with or following"
    list["MILESTONE_COMPLETED"] = "Milestone completed on goal I am linked with or following"
    list["COMMENT"] = "Someone commented on my activities"
    list["REPLY_ON_POSTCOMMENT"] = "Someone replied to my contribution"
    list["MOTIVATE_ON_POST"] = "Someone motivated on my activities"
    list["MOTIVATE_ON_GOAL"] = "Someone motivated on my goal"
    list["SHARE_GOAL"] = "Someone shared my goal"
    list["SHARE_POST"] = "Someone shared my post"
    list["LINK_GOAL"] = "Someone linked to my goal"
    list["USERMENTIONED"] = "Someone mentioned me"

    return function(key) {
        if (key) {
            return list[key];
        }
        return '';
    };
})

.filter('ActivityIcons', function() {
        var types = []
        types["USER_FOLLOWED"] = "lg-icon-following-user"
        types["GOAL_FOLLOWED"] = "lg-icon-follow-goal"
        types["PROGRESS_UPDATED"] = "lg-icon-progress"
        types["CONTRIBUTION"] = "lg-icon-contribution-2"
        types["MILESTONE_CREATED"] = "lg-icon-milestone"
        types["MILESTONE_COMPLETED"] = "lg-icon-milestone"
        types["COMMENT"] = "lg-icon-comment"
        types["REPLY_ON_POSTCOMMENT"] = "lg-icon-reply"
        types["MOTIVATE_ON_POST"] = "lg-icon-motivate"
        types["MOTIVATE_ON_GOAL"] = "lg-icon-motivate"
        types["SHARE_GOAL"] = "lg-icon-share"
        types["SHARE_POST"] = "lg-icon-share"
        types["LINK_GOAL"] = "lg-icon-link-goal"
        types["USERMENTIONED"] = "lg-icon-email"

        return function(key) {
            if (key) {
                return types[key];
            }
            return '';
        };
    })
    .factory('AlbumCache', ['$cacheFactory', function($cacheFactory) {
        var albumCache = $cacheFactory('albumCache');

        var cache = {};

        cache.get = function(parentid) {
            return albumCache.get("album" + parentid);
        }

        cache.put = function(parentid, data) {
            albumCache.put("album" + parentid, data);
        }

        return cache;
    }])
    // Set up the cache ‘myCache’
    .factory('PrivacyCache', function($q, $cacheFactory, PrivacyServices) {
        var appCache = $cacheFactory('app-cache');

        var cache = {};

        cache.get = function() {
            var defer = $q.defer();
            var privacyOptions = appCache.get('privacyOptions');
            if (!privacyOptions) {
                PrivacyServices.getSettings().success(function(result) {
                    appCache.put("privacyOptions", result.data);
                    var result = result.data
                    defer.resolve(result.data);
                }).error(function(err) {
                    defer.reject(false);
                })
            } else {
                var result = appCache.get('privacyOptions');
                defer.resolve(result);
            }

            return defer.promise;
        }

        cache.getDefault = function() {
            var defer = $q.defer();
            cache.get().then(function(res) {
                angular.forEach(res, function(val, key) {
                    if (val.default == 1) {
                        defer.resolve(val);
                    }
                })
            })

            return defer.promise;
        }

        cache.setDefault = function(id) {
            cache.get().then(function(res) {
                angular.forEach(res, function(val, key) {
                    val.default = (val.id == id) ? 1 : 0;
                })
                appCache.put("privacyOptions", res);
            })
        }
        return cache;
    })

.factory('CategoriesCache', function($q, $cacheFactory, CategoriesServices) {
    var appCache = $cacheFactory('app-cache-category');

    var cache = {};

    cache.get = function() {
        var defer = $q.defer();
        var categoryOptions = appCache.get('categoryOptions');
        if (!categoryOptions) {
            CategoriesServices.getAll().success(function(result) {
                appCache.put("categoryOptions", result.data);
                var result = result.data
                defer.resolve(result.data);
            }).error(function(err) {
                defer.reject(false);
            })
        } else {
            var result = appCache.get('categoryOptions');
            defer.resolve(result);
        }

        return defer.promise;
    }

    // cache.getDefault = function() {
    //     var defer = $q.defer();
    //     cache.get().then(function(res) {
    //         angular.forEach(res, function(val, key) {
    //             if (val.default == 1) {
    //                 defer.resolve(val);
    //             }
    //         })
    //     })

    //     return defer.promise;
    // }

    // cache.setDefault = function(id) {
    //     cache.get().then(function(res) {
    //         angular.forEach(res, function(val, key) {
    //             val.default = (val.id == id) ? 1 : 0;
    //         })
    //         appCache.put("privacyOptions", res);
    //     })
    // }
    return cache;
})

.service('ownerUid', function() {
    _uid = 0;
    this.get = function() {
        return _uid
    }
    this.set = function(uid) {
        _uid = uid
    }
})

.service('Notifications', function($q, $timeout, $rootScope, NotificationDataServices) {
    var data = {}
    data.notifications = [];


    this.get = function() {
        return data;
    }

    this.putFirst = function(notifications) {
        data = (notifications);
    }

    this.put = function(notifications) {
        data.notifications = data.notifications.concat(notifications);
    }

    this.makeEmpty = function() {
        data.notifications = [];
    }

    this.seen = function() {
        data.unseen = 0;
        NotificationDataServices.seen().success(function(res) {
            $rootScope.unseenNotifications.unseen = 0;
        })
    }
})

.service("User", function(localStorageService, $q, $location) {
    this.getLoggedInUser = function() {
        if (sessionUser = localStorageService.get('loggedInUser')) {
            return sessionUser.user
        } else {
            return {};
        }
    }

    this.isAuthenticated = function() {
        if (sessionUser = localStorageService.get('loggedInUser')) {
            return true;
        } else {
            return false;
        }
    }

    this.getLoggedInUserId = function() {
        if (sessionUser = localStorageService.get('loggedInUser')) {
            if ("user" in sessionUser) {
                return sessionUser.user.uid
            }
        }
        return 0;
    }

    this.getClientId = function() {
        if (sessionUser = localStorageService.get('loggedInUser')) {
            if ("credentials" in sessionUser) {
                return sessionUser.credentials.client_id
            } else {
                return null;
            }
        }
    }

    this.getCredentials = function() {
        if (sessionUser = localStorageService.get('loggedInUser')) {
            if ("credentials" in sessionUser) {
                return sessionUser.credentials
            } else {
                return null;
            }
        }
    }

    this.me = function() {
        if (sessionUser = localStorageService.get('loggedInUser')) {
            try {
                user = {
                    uid: sessionUser.user.uid,
                    name: sessionUser.user.name,
                    username: sessionUser.user.username,
                    bio: sessionUser.user.bio,
                    email: sessionUser.user.user_email,
                    image: sessionUser.user.profile.medium,
                    cover: sessionUser.user.cover.large,
                    location: sessionUser.user.location,
                    dob: sessionUser.user.dob,
                    dob_show: sessionUser.user.dob_show
                }
                return user;
            } catch (e) {
                localStorageService.remove('loggedInUser')
            }
        } else {
            return {}
        }
    }

    this.updateLS = function(params) {
        if (sessionUser = localStorageService.get('loggedInUser')) {
            if (params.hasOwnProperty("image")) {
                sessionUser.user.profile = params.image;
            }
            if (params.hasOwnProperty("cover")) {
                sessionUser.user.cover = params.cover;
            }
            if (params.hasOwnProperty("name")) {
                sessionUser.user.name = params.name;
            }
            if (params.hasOwnProperty("bio")) {
                sessionUser.user.bio = params.bio;
            }
            if (params.hasOwnProperty("location")) {
                sessionUser.user.location = params.location;
            }

            if (params.hasOwnProperty("verified")) {
                sessionUser.user.verified = params.verified;
            }

            localStorageService.set("loggedInUser", sessionUser);
            return true;
        } else {
            return false;
        }
    }

    this.skipIfLoggedIn = function() {
        localStorageService.set("userLoginEnter", 1);
        var deferred = $q.defer();
        if (this.isAuthenticated()) {
            $location.path('/dashboard');
        } else {
            deferred.resolve();
        }
        return deferred.promise;
    }

    this.loginRequired = function() {
        var deferred = $q.defer();
        if (this.isAuthenticated()) {
            deferred.resolve();
        } else {
            $location.path('/login');
        }
        return deferred.promise;
    }
})

.factory('_', ['$window', function($window) { return $window._; }]);

/*
.filter('notificationHighlight', function() {
  return function(input, entities) {
    angular.forEach(values, function(entities, key){
      var output = '<span class="txt-book">'+input.substring(entities[key], entities[key]) + '</span> ' + input.substring(end, input.length);
    });
    var output = '<span class="txt-book">'+input.substring(start, end) + '</span> ' + input.substring(end, input.length);
    return output;
  }
});
*/
