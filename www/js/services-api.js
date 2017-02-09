Array.prototype.toURL = function() {
    return this.join('/');
};

var toQueryString = function(obj) {
    var out = new Array();
    for (key in obj) {
        out.push(key + '=' + encodeURIComponent(obj[key]));
    }
    return out.join('&');
};

angular.module('CoreApi', ['CoreApiUtilities'])

.constant('XXXXXXX', {
    appName: 'XXXXXXX',
    appVersion: 'XXXXXXX',
    giphy_api_key: 'XXXXXXX',
    apiUrl: 'XXXXXXXXXXXXXXXXXXX',
    fileApi: 'XXXXXXXXXXXXXXXXXXX',
     socket: "XXXXXXXXXXXXXXXXXXX"

})

.factory('httpService', ['$http', 'lagConfig', 'Utils', function($http, lagConfig, Utils) {
    return {
        $http: $http,
        lagConfig: lagConfig,
        Utils: Utils
    }
}])

.service('FeedServices', ['httpService', function(httpService) {
    this.getDashBoard = function(options) {
        var config = httpService.Utils.getHeader();
        var options = options || httpService.defaultOffsetLimit;
        var url = httpService.Utils.buildUrl(new Array('feed'), options);
        return httpService.$http.get(url, config)
    };

    this.getAlbum = function(id) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('album', id));
        return httpService.$http.get(url, config)
    };

    this.getFollowingNetworkList = function(queryParams) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('feed'), queryParams);
        return httpService.$http.get(url, config)
    };

}])

.service('NotificationDataServices', ['httpService', function(httpService) {
    var options = options || httpService.defaultOffsetLimit;

    this.get = function(options) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('notifications'), options);
        return httpService.$http.get(url, config)
    };

    this.read = function(id) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('notifications', 'read', id));
        return httpService.$http.put(url, {}, config);
    };

    this.seen = function() {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('notifications', 'seen'));
        return httpService.$http.put(url, {}, config);
    };

    this.subscribe = function(token) {
        var config = httpService.Utils.getHeader();
        params = { device_subscription_token: token }
        var url = httpService.Utils.buildUrl(new Array('notifications', 'subscribe'));
        return httpService.$http.put(url, params, config)
    }

    this.settings = function() {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('account', 'notificationSettings'));
        return httpService.$http.get(url, config)
    };

    this.update = function(params) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('account', 'notificationSettings'));
        return httpService.$http.put(url, params, config);
    }

}])

.service('CoachMarksDataServices', ['httpService', function(httpService) {

    this.get = function() {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('coachmarks', 'my'));
        return httpService.$http.get(url, config);
    };

    this.seen = function(id, params) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('coachmarks', id, 'done'));
        return httpService.$http.post(url, params, config);
    };
}])

.service('ResourceCenterServices', ['httpService', function(httpService) {

    this.get = function() {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('resource-center'));
        return httpService.$http.get(url, config)
    };

    this.getArticle = function(id) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('resource-center', id));
        return httpService.$http.get(url, config)
    };

}])

.service('MilestoneServices', ['httpService', function(httpService) {

    this.achieve = function(id, params) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('milestones', id, "complete"));
        return httpService.$http.put(url, params, config);
    };

    this.editMilestone = function(id, params) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('goals', 'milestone', id));
        return httpService.$http.put(url, params, config)
    }

    this.deleteMilestone = function(id, params) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('goals', 'milestone', id));
        return httpService.$http.delete(url, config)
    }



}])

.service('PrivacyServices', ['httpService', function(httpService) {

    this.getSettings = function() {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('settings', "privacy"));
        return httpService.$http.get(url, config);
    };
}])

.service('ExploreServices', ['httpService', function(httpService) {

    this.get = function() {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('explore'));
        return httpService.$http.get(url, config)
    };

    this.popularGoals = function(options) {
        var config = httpService.Utils.getHeader();
        var options = options || httpService.defaultOffsetLimit;
        var url = httpService.Utils.buildUrl(new Array('explore', 'popular-goals'), options);
        return httpService.$http.get(url, config)
    };

    this.hotNewGoals = function(options) {
        var config = httpService.Utils.getHeader();
        options = options || {}
        var url = httpService.Utils.buildUrl(new Array('explore', 'hotnewgoals'), options);
        return httpService.$http.get(url, config)
    };

    this.featuredUsers = function(options) {
        var config = httpService.Utils.getHeader();
        options = options || {}
        var url = httpService.Utils.buildUrl(new Array('explore', 'featured-users'), options);
        return httpService.$http.get(url, config)
    };

    this.featuredTags = function() {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('explore', 'featured-tags'));
        return httpService.$http.get(url, config)
    };

}])

.service('CategoriesServices', ['httpService', function(httpService) {

    this.getAll = function() {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('categories'));
        return httpService.$http.get(url, config)
    };

    this.get = function(categoryId, options) {
        var config = httpService.Utils.getHeader();
        var options = options || httpService.defaultOffsetLimit;
        var url = httpService.Utils.buildUrl(new Array('categories', categoryId), options);
        return httpService.$http.get(url, config)
    };

    this.getSub = function(name, tag, options) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('categories', name, tag), options);
        return httpService.$http.get(url, config)
    };

    this.getAllCategoriesWithTags = function() {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('categories', 'all'));
        return httpService.$http.get(url, config)
    };

}])

.service('SearchDataServices', ['httpService', function(httpService) {

    this.miniSearch = function(query) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('search', 'all'), { q: query });
        return httpService.$http.get(url, config)
    };

    this.users = function(name, options) {
        var config = httpService.Utils.getHeader();
        queryParams = { q: name, offset: options.offset, limit: options.limit }
        var url = httpService.Utils.buildUrl(new Array('search', 'user'), queryParams);
        return httpService.$http.get(url, config)
    };

    this.goals = function(name, options) {
        var config = httpService.Utils.getHeader();
        queryParams = { q: name, offset: options.offset, limit: options.limit }
        var url = httpService.Utils.buildUrl(new Array('search', 'goal'), queryParams);
        return httpService.$http.get(url, config)
    };

    this.tags = function(name, options) {
        var config = httpService.Utils.getHeader();
        queryParams = { q: name, offset: options.offset, limit: options.limit }
        var url = httpService.Utils.buildUrl(new Array('search', 'tag'), queryParams);
        return httpService.$http.get(url, config)
    };

}])

.service('TagsDataServices', ['httpService', function(httpService) {

    // remove this duplicated in SearchDataServices, found in ProfileInterestCtrl
    this.search = function(name) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('search', 'tag'), { q: name });
        return httpService.$http.get(url, config)
    };

    this.getTaggedGoals = function(name, options) {
        var config = httpService.Utils.getHeader();
        var options = options || httpService.defaultOffsetLimit;
        var url = httpService.Utils.buildUrl(new Array('tags', name), options);
        return httpService.$http.get(url, config)
    };
}])

.service('CommentDataServices', ['httpService', function(httpService) {

    this.getAll = function(id, options) {
        var config = httpService.Utils.getHeader();
        var options = options || httpService.defaultOffsetLimit;
        var url = httpService.Utils.buildUrl(new Array('posts', id, 'comments'), options);
        return httpService.$http.get(url, config)
    };

    this.post = function(id, params) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('posts', id, 'comments'));
        return httpService.$http.post(url, params, config)
    };


}])

.service('Education', ['httpService', function(httpService) {
    this.add = function(uid, params) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('users', uid, 'educations'));
        return httpService.$http.post(url, params, config)
    };

    this.getAll = function(uid, options) {
        var config = httpService.Utils.getHeader();
        var options = options || httpService.defaultOffsetLimit;
        var url = httpService.Utils.buildUrl(new Array('users', uid, 'educations'), options);
        return httpService.$http.get(url, config)
    };

    this.update = function(uid, id, params) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('users', uid, 'educations', id));
        return httpService.$http.put(url, params, config)
    };

    this.delete = function(uid, id) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('users', uid, 'educations', id));
        return httpService.$http.delete(url, config)
    };
}])

.service('Work', ['httpService', function(httpService) {
    this.add = function(uid, params) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('users', uid, 'works'));
        return httpService.$http.post(url, params, config)
    };

    this.getAll = function(uid, options) {
        var config = httpService.Utils.getHeader();
        var options = options || httpService.defaultOffsetLimit;
        var url = httpService.Utils.buildUrl(new Array('users', uid, 'works'), options);
        return httpService.$http.get(url, config)
    };

    this.update = function(uid, id, params) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('users', uid, 'works', id));
        return httpService.$http.put(url, params, config)
    };

    this.delete = function(uid, id) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('users', uid, 'works', id));
        return httpService.$http.delete(url, config)
    };
}])

.service('Post', ['httpService', function(httpService) {
    this.create = function(params) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('posts'));
        return httpService.$http.post(url, params, config)
    };

    this.get = function(id) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('posts', id));
        return httpService.$http.get(url, config)
    }

    this.motivate = function(id, me) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('posts', id, 'motivation'));
        if (me == 0) {
            return httpService.$http.post(url, {}, config)
        } else {
            return httpService.$http.delete(url, config)
        }
    }

    this.getMotivators = function(id, params) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('posts', id, 'motivators'), params);
        return httpService.$http.get(url, config)
    }

    this.followUnfollow = function(id, isFollowing) {
        var config = httpService.Utils.getHeader();
        if (isFollowing == 0) {
            var url = httpService.Utils.buildUrl(new Array('posts', id, 'follow'));
            return httpService.$http.post(url, {}, config)
        } else {
            var url = httpService.Utils.buildUrl(new Array('posts', id, 'unfollow'));
            return httpService.$http.delete(url, config)
        }
    };

    this.delete = function(id) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('posts', id));
        return httpService.$http.delete(url, config)
    }

}])

.service('UserDataServices', ['httpService', 'Education', 'Work', function(httpService, Education, Work) {

    this.login = function(params, client_id) {
        var config = httpService.Utils.getHeader();
        var client_id = client_id || 0
        var url = httpService.Utils.buildUrl(new Array('login'));
        if (client_id != 0) config.headers["x-client-id"] = client_id;
        return httpService.$http.post(url, params, config)
    };

    this.logout = function() {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('logout'));
        return httpService.$http.post(url, {}, config)
    }

    this.verifyToken = function() {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('login', 'token'));
        return httpService.$http.get(url, config)
    };

    this.register = function(params) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('register'));
        return httpService.$http.post(url, params, config)
    };

    this.forgot = function(params) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('account', 'forgot'));
        return httpService.$http.post(url, params, config)
    };

    this.verifyKey = function(key) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('account', 'forgot', key));
        return httpService.$http.get(url, config)
    };

    this.verifyAccountRequest = function() {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('account', 'verify'));
        return httpService.$http.post(url, {}, config)
    };

    this.verifyAccount = function(key) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('account', 'verify', key));
        return httpService.$http.get(url, config)
    };

    this.resetPassword = function(params) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('account', 'reset'));
        return httpService.$http.put(url, params, config)
    };

    this.getUser = function(id) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('users', id));
        return httpService.$http.get(url, config)
    };

    this.getUserSkills = function(id) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('users', id, 'skills'));
        return httpService.$http.get(url, config)
    };

    this.getUserGoals = function(id, options) {
        var config = httpService.Utils.getHeader();
        options = options || { offset: 0, limit: 20 }
        var url = httpService.Utils.buildUrl(new Array('users', id, 'goals'), options);
        return httpService.$http.get(url, config)
    };

    this.getUserPosts = function(id, options) {
        var config = httpService.Utils.getHeader();
        var options = options || httpService.defaultOffsetLimit;
        var url = httpService.Utils.buildUrl(new Array('users', id, 'activities'), options);
        //var url = httpService.Utils.buildUrl(new Array('ownfeed'));
        return httpService.$http.get(url, config)
    };

    this.getMyGoals = function(reqParams) {
        var config = httpService.Utils.getHeader();
        var _reqParams = reqParams || {}
        var options = options || httpService.defaultOffsetLimit;
        var url = httpService.Utils.buildUrl(new Array('mygoals'), _reqParams);
        return httpService.$http.get(url, config)
    };

    this.getUserInterests = function(id, params) {
        var config = httpService.Utils.getHeader();
        var options = params || {};
        var url = httpService.Utils.buildUrl(new Array('users', id, 'interest'), options);
        return httpService.$http.get(url, config)
    };

    this.addUserInterest = function(uid, id) {
        var config = httpService.Utils.getHeader();
        params = { tag_id: id }
        var url = httpService.Utils.buildUrl(new Array('users', uid, 'interest'));
        return httpService.$http.post(url, params, config)
    };

    this.removeUserInterest = function(uid, id) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('users', uid, 'interest', id));
        return httpService.$http.delete(url, config)
    };

    this.updateProfile = function(id, params) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('users', id, 'profile'));
        return httpService.$http.post(url, params, config)
    };

    this.validateUsernameEmail = function(params) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('account', 'validate'), params);
        return httpService.$http.post(url, params, config)
    };

    this.changeUsernameEmail = function(params) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('account', 'change'), params);
        return httpService.$http.put(url, params, config)
    };

    this.connections = function(id, queryParams) {
        var config = httpService.Utils.getHeader();
        var queryParams = queryParams || {}
        var url = httpService.Utils.buildUrl(new Array('users', id, 'connections'), queryParams);
        return httpService.$http.get(url, config)
    }

    this.getUserFollowers = function(id, queryParams) {
        var config = httpService.Utils.getHeader();
        var queryParams = queryParams || {}
        var url = httpService.Utils.buildUrl(new Array('users', id, 'connections', 'followers'), queryParams);
        return httpService.$http.get(url, config)
    }

    this.getUserFollowing = function(id, queryParams) {
        var config = httpService.Utils.getHeader();
        var queryParams = queryParams || {}
        var url = httpService.Utils.buildUrl(new Array('users', id, 'connections', 'followings'), queryParams);
        return httpService.$http.get(url, config)
    }

    this.getUserMutual = function(id, queryParams) {
        var config = httpService.Utils.getHeader();
        var queryParams = queryParams || {}
        var url = httpService.Utils.buildUrl(new Array('users', id, 'connections', 'mutual'), queryParams);
        return httpService.$http.get(url, config)
    }

    this.suggetedUsers = function(queryParams) {
        var config = httpService.Utils.getHeader();
        var queryParams = queryParams || {}
        var url = httpService.Utils.buildUrl(new Array('suggest', 'users'), queryParams);
        return httpService.$http.get(url, config)
    }

    this.changePassword = function(params) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('account', 'changepassword'));
        return httpService.$http.put(url, params, config)
    }

    this.changeProfileImage = function(uid, params) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('account', 'updateprofile'));
        return httpService.$http.put(url, params, config)
    }

    this.changeProfileCover = function(uid, params) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('account', 'updatecover'));
        return httpService.$http.put(url, params, config)
    }

    this.followUnfollowUser = function(id, isFollowing) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('users', id, 'follow'));
        if (isFollowing == 0) {
            return httpService.$http.post(url, {}, config)
        } else {
            return httpService.$http.delete(url, config)
        }
    }

    this.suggestedProfileImages = function() {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('library', 'image'), { libraryof: "default_profile" });
        return httpService.$http.get(url, config)
    }

    this.suggestedCoverImages = function() {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('library', 'image'), { libraryof: "default_cover" });
        return httpService.$http.get(url, config)
    }

    this.getActiveSession = function() {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('account', 'sessions'));
        return httpService.$http.get(url, config)
    }

    this.revokeSession = function(id) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('account', 'sessions', id));
        return httpService.$http.delete(url, config)
    }

    this.getimages = function(uid, queryParams) {
        var config = httpService.Utils.getHeader();
        var queryParams = queryParams || {}
        var url = httpService.Utils.buildUrl(new Array('users', uid, 'images'), queryParams);
        return httpService.$http.get(url, config)
    }

    this.getBasicSettings = function() {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('account', 'basic'));
        return httpService.$http.get(url, config)
    }

    this.muteUser = function(id) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('users', 'mute', id));
        return httpService.$http.post(url, {}, config)
    }

    this.unMuteUser = function(id) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('users', 'mute', id));
        return httpService.$http.delete(url, config)
    }

    this.getMutedUsers = function() {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('users', 'mute', 'list'));
        return httpService.$http.get(url, config)
    }

    this.blockUser = function(id) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('users', 'block', id));
        return httpService.$http.post(url, {}, config)
    }

    this.unBlockUser = function(id) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('users', 'block', id));
        return httpService.$http.delete(url, config)
    }

    this.getBlockedUsers = function() {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('users', 'block', 'list'));
        return httpService.$http.get(url, config)
    }

    this.userConnections = function(name, options) {
        queryParams = { q: name, offset: options.offset, limit: options.limit }
        var url = httpService.Utils.buildUrl(new Array('search', 'user', 'connections'), queryParams);
        return httpService.$http.get(url, config);
    };

    this.Education = Education;
    this.Work = Work;

}])

.service('FeedbackService', ['httpService', function(httpService) {

    this.submit = function(params) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('feedback'));
        return httpService.$http.post(url, params, config);
    };

}])


.service('GoalsDataServices', ['httpService', function(httpService) {

    this.getGoal = function(id) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('goals', id));
        return httpService.$http.get(url, config)
    };

    this.deletGoal = function(id) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('goals', id));
        return httpService.$http.delete(url, config);
    };

    this.getContribuitons = function(id) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('goals', id, 'contributions'));
        return httpService.$http.get(url, config)
    };

    this.updateGoal = function(id, params) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('goals', id));
        return httpService.$http.put(url, params, config)
    };

    this.postContribution = function(id, params) {
        var config = httpService.Utils.getHeader();
        var params = params || {};
        var url = httpService.Utils.buildUrl(new Array('goals', id, 'contributions'));
        return httpService.$http.post(url, params, config)
    };

    this.getLinkedGoals = function(id, options) {
        var config = httpService.Utils.getHeader();
        var options = options || httpService.defaultOffsetLimit;
        var url = httpService.Utils.buildUrl(new Array('goals', id, 'linked-goals'), options);
        return httpService.$http.get(url, config)
    };

    this.getMilestones = function(id) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('goals', id, 'milestones'));
        return httpService.$http.get(url, config)
    };

    this.getGoalFeed = function(id, options) {
        var config = httpService.Utils.getHeader();
        var options = options || httpService.defaultOffsetLimit;
        var url = httpService.Utils.buildUrl(new Array('goals', id, 'feed'), options);
        return httpService.$http.get(url, config)
    };

    this.getLinkedGoalsFeed = function(id, options) {
        var config = httpService.Utils.getHeader();
        var options = options || httpService.defaultOffsetLimit;
        var url = httpService.Utils.buildUrl(new Array('goals', id, 'linked-feed'), options);
        return httpService.$http.get(url, config)
    };

    this.postMilestone = function(id, params) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('goals', id, 'milestones'));
        var params = params || {};
        return httpService.$http.post(url, params, config)
    };

    this.deleteMilestone = function(id) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('milestones', id));
        return httpService.$http.delete(url, config)
    };


    this.getProgress = function(id) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('goals', id, 'progress'));
        return httpService.$http.get(url, config)
    };

    this.goalFollowSuggestion = function(options) {
        var config = httpService.Utils.getHeader();
        var options = options || httpService.defaultOffsetLimit;
        var url = httpService.Utils.buildUrl(new Array('goals', 'follow', 'suggestion'), options);
        return httpService.$http.get(url, config)
    };

    this.postProgress = function(id, params) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('goals', id, 'progress'));
        var params = params || {};
        return httpService.$http.post(url, params, config)
    };

    this.followUnfollow = function(id, isFollowing) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('goals', id, 'follow'));
        if (isFollowing == 0) {
            return httpService.$http.post(url, {}, config)
        } else {
            return httpService.$http.delete(url, config)
        }
    };

    this.linkUnlink = function(id, to_id, isLinker) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('goals', id, 'link'));
        if (isLinker == 0) {
            return httpService.$http.post(url, { fromGoalId: to_id }, config)
        } else {
            return httpService.$http.delete(url, { params: { fromGoalId: to_id }, headers: config.headers })
        }
    };


    this.createGoal = function(params) {
        var config = httpService.Utils.getHeader();
        var params = params || {}
        var url = httpService.Utils.buildUrl(new Array('goals'));
        return httpService.$http.post(url, params, config)
    };

    this.achieve = function(id, params) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('goals', id, "achieve"));
        return httpService.$http.put(url, params, config);
    };

    this.motivate = function(id, me) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('goals', id, 'motivation'));
        if (me == 0) {
            return httpService.$http.post(url, {}, config)
        } else {
            return httpService.$http.delete(url, config)
        }
    }

    this.getFollowers = function(id, params) {
        var config = httpService.Utils.getHeader();
        var params = params || {}
        var url = httpService.Utils.buildUrl(new Array('goals', id, 'followers'),params);
        return httpService.$http.get(url, config)
    }

    this.getLinkers = function(id, params) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('goals', id, 'linkers'), params);
        return httpService.$http.get(url, config)
    }

    this.getMotivators = function(id, params) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('goals', id, 'motivators'), params);
        return httpService.$http.get(url, config)
    }

    this.suggestedImages = function() {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('library', 'image'), { libraryof: "default_goal" });
        return httpService.$http.get(url, config)
    }

    this.changeImage = function(id, params) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('goals', id, 'updatecover'));
        return httpService.$http.put(url, params, config)
    }

    this.getImages = function(id, options) {
        var config = httpService.Utils.getHeader();
        var params = options || {};
        var url = httpService.Utils.buildUrl(new Array('goals', id, 'images'), params);
        return httpService.$http.get(url, config)
    }

    this.muteGoal = function(id) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('goals', 'mute', id));
        return httpService.$http.post(url, {}, config)
    }

    this.unMuteGoal = function(id) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('goals', 'mute', id));
        return httpService.$http.delete(url, config)
    }

    this.getMutedGoals = function() {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('goals', 'mute', 'list'));
        return httpService.$http.get(url, config)
    }

    this.linkedGoalList = function(id, params) {
        var config = httpService.Utils.getHeader();
        var url = httpService.Utils.buildUrl(new Array('goals', id, 'linked-goals-me'));
        return httpService.$http.get(url, config)
    }

    this.userConnections = function(name, options) {
        queryParams = { q: name, offset: options.offset, limit: options.limit }
        var url = httpService.Utils.buildUrl(new Array('search', 'user', 'connections'), queryParams);
        return httpService.$http.get(url, config);
    };

}])

.service('FileService', ['httpService', '$q', function(httpService, $q) {
    var FileService = {};
    var _type = "";

    this.setType = function(type) {
        _type = type;
    }

    this.cropImage = function(id, params) {
        var config = httpService.Utils.getHeader();
        var newParams = {}

        newParams.attach_id = id;
        newParams.x = parseInt(params.x);
        newParams.y = parseInt(params.y);
        newParams.width = parseInt(params.width);
        newParams.height = parseInt(params.height);
        newParams.rotation = params.rotate;
        config.headers["Content-Type"] = 'application/json';
        var url = httpService.Utils.buildUrl(new Array('image', 'crop'), false, true);
        return httpService.$http.post(url, newParams, config)
    }

    this.selectGif = function(id) {
        var params = {}
        params.imageof = _type;
        params.imageid = id;
        var url = httpService.Utils.buildUrl(new Array('upload', 'image', 'gif'), params, true);
        return httpService.$http.get(url, config);
    }

    this.uploadFile = function(files, fileType) {
        var config = httpService.Utils.getHeader();
        var _fileType = fileType || "image";
        if (_fileType == "video") {
            _req = "video"
            _queryParam = { videoof: _type }
        } else if (_fileType == "image") {
            _req = "image"
            _queryParam = { imageof: _type }
        }
        var files = files || false
        if (files == false) return true;
        var deferred = $q.defer();
        var url = httpService.Utils.buildUrl(new Array('upload', _req), _queryParam, true);
        Upload.upload({ url: url, data: { uploadfile: files }, headers: config.headers }).then(function(resp) {
            deferred.resolve(resp);
        }, function(resp) {
            deferred.reject(resp);
        }, function(evt) {
            files.progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
        });
        return deferred.promise;
    };

}])

.service('UrlService', ['httpService', function(httpService) {

    this.fetch = function(url) {
        var config = httpService.Utils.getHeader();
        var requestUrl = httpService.Utils.buildUrl(new Array('fetch'), {}, true);
        var params = { url: url } || {};
        return httpService.$http.post(requestUrl, params, config)
    };
}]);


angular.module('CoreApiUtilities', [])

.factory('Utils', ['lagConfig', 'localStorageService', function(lagConfig, localStorageService) {

    var makeHeader = function() {
        var sessionUser = localStorageService.get('loggedInUser');
        if (sessionUser != null) {
            return config = {
                headers: {
                    'x-client-id': sessionUser.credentials.client_id,
                    'token': sessionUser.credentials.token,
                    'x-api-signature': '',
                    "x-api-version": "1.0",
                }
            };
        } else {
            return config = {
                headers: { "x-api-version": "1.0" }
            };
        }
    }

    var defaultOffsetLimit = { offset: 0, limit: 5 }

    var buildUrl = function(urlSet, queryStringSet, isFileServer) {
        var isFileServer = isFileServer || false;
        queryStringSet = queryStringSet || false;

        if (!isFileServer) {
            var url = lagConfig.apiUrl;
        } else {
            var url = lagConfig.fileApi;
        }

        if (Object.prototype.toString.call(urlSet) === '[object Array]') {
            url += urlSet.toURL();
        }

        if (queryStringSet !== false) {
            url += '?' + toQueryString(queryStringSet);
        }
        return url;
    }

    return {
        getHeader: makeHeader,
        buildUrl: buildUrl,
        defaultOffsetLimit: defaultOffsetLimit
    };
}])
