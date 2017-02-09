angular.module('app.chat', [])

.config(function($stateProvider) {
    $stateProvider.state('chatmain', {
        url: '/chat',
        abstract: true,
        templateUrl: 'templates/chat/base.html',
        resolve: {
            init: function($state, App, PushwooshState) {
                App.init().then(function(res) {

                }, function() {
                    $state.go('chatmain.user');
                });
            }
        },
    })

    .state('chatmain.user', {
        url: '/messages/conversation/',
        views: {
            'chatcontent': {
                templateUrl: 'templates/chat/user-list.html',
                controller: 'ChatUserController'
            }
        },
    })

    .state('chatmain.chat-convo', {
        url: '/messages/conversation/:id',
        views: {
            'chatcontent': {
                templateUrl: 'templates/chat/conversation.html',
                controller: 'MessagingConvoCtrl'
            }
        },
    })

    .state('chatmain.chat-convo-new', {
        url: '/messages/conversation/:id/:uid/:image',
        views: {
            'chatcontent': {
                templateUrl: 'templates/chat/conversation.html',
                controller: 'MessagingConvoCtrl'
            }
        },
    })
})

.run(function($ionicPlatform, $rootScope, ChatFactory, httpService, $location, User, PushwooshState, $state, socket, $timeout, localStorageService) {

    $ionicPlatform.ready(function() {
        document.addEventListener("deviceready", onDeviceReady, false);

        function onDeviceReady() {
            chat_connect();
            document.addEventListener("pause", onPause, false);
            document.addEventListener("resume", onResume, false);
            // Add similar listeners for other events
        }

        $rootScope.isChatLoading = false;

        if (window.cordova === undefined) {
            chat_connect();
        }

        function onPause() {
            localStorageService.set('chatCache', $rootScope.chatFactory);
            socket.manual_disconnect();
            // Handle the pause event
        }

        function onResume() {
            $rootScope.isChatLoading = false;
            $rootScope.chatCache = localStorageService.get('chatCache');
            socket.connect();
            chat_connect();
            var push_state = PushwooshState.get()
            if (!isEmpty(push_state) && push_state.state != 'chatmain.chat-convo') {
                if ($state.current.name == 'tab.me') {
                    $rootScope.navigateState(push_state.state, { id: push_state.id });
                    PushwooshState.set({});
                } else {
                    $state.go('tab.me');
                }
            }
        }

        function chat_connect() {
            if (User.isAuthenticated()) {
                $rootScope.chatFactory = new ChatFactory();
                $rootScope.chatFactory.login();
                $rootScope.chatFactory.reload().then(function(res) {
                    var stat = PushwooshState.get();
                    $rootScope.chatCache = null;
                    $rootScope.isChatLoading = false;
                    if (!isEmpty(stat) && stat.state == 'chatmain.chat-convo') {
                        $timeout(function() {
                            $state.go('chatmain.user');
                            $state.go(stat.state, { id: stat.id });
                            PushwooshState.set({});
                        }, 500);
                    }
                    $rootScope.chatFactory.show_screen = true;
                });
            }
        }


    });

})

.factory('socket', function($rootScope, lagConfig) {
    var socket = io.connect(lagConfig.socket, { 'forceNew': true });
    var listeners = [];
    return {
        manual_disconnect: function() {
            socket.io.disconnect();
        },
        connect: function() {
            socket = io.connect(lagConfig.socket, { 'forceNew': true });
        },
        removeAllListeners: function() {
            // Remove each of the stored listeners
            for (var i = 0; i < listeners.length; i++) {
                if (listeners[i].event == "receiveScrollChatMessages" || listeners[i].event == "receiveMessageDeleteStatus" || listeners[i].event == "receiveConversationDeleteStatus") {
                    //remove from socket.io listners list
                    socket.removeListener('receiveScrollChatMessages');
                    socket.removeListener('receiveMessageDeleteStatus')
                    socket.removeListener('receiveConversationDeleteStatus')
                        //remove from internal array
                    listeners.splice(i, 1);
                }
            };
        },
        on: function(eventName, callback) {
            listeners.push({ event: eventName, fn: callback });
            socket.on(eventName, function() {
                var args = arguments;
                $rootScope.$apply(function() {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function(eventName, data, callback) {
            socket.emit(eventName, data, function() {
                var args = arguments;
                $rootScope.$apply(function() {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            })
        },
        socket: socket
    };
})

.factory('ChatFactory', function(socket, User, $location, $q, $timeout, $stateParams, $ionicScrollDelegate, $rootScope, $state, $cordovaNativeAudio, localStorageService, NewUserChatService) {

    var Chat = function() {
        this.mainObj = {};
        this.mainObj.user = [];
        this.mainObj.chatSpecific = {};
        this.last_conversation_id = '';
        this.current_conversation_id = '';
        this.show = 0;
        this.chatObject = {};
        this.currentUser = {};
        this.chatProfileObject = {};
        this.show2 = true;
        this.status = {
            loading: true,
            loaded: false
        };
        this.onChat = true;
        this.newMessage = false;
        this.msg_txt = '';
        this.selectedItem = {};
        this.total_seen = 0;
        this.sessionUser = User.me();
        this.seen = false;
        this.istyping = false;
        this.istypingUser = {};
        this.TypeTimer;
        this.TypingInterval = 1000;
        this.istypingText = '';
        this.istypingConvo = '';
        this.show_screen = false;

        socket.on('receiveOfflineStatus', function(data) {
            //console.log('on receiveOfflineStatus', data);
            for (var i = 0; i < this.mainObj.user.length; i++) {
                if (this.mainObj.user[i].user.uid == data.data.uid) {
                    this.mainObj.user[i].user = data.data;
                    this.mainObj.chatSpecific[this.mainObj.user[i].key].user.status = 'offline';
                    this.mainObj.chatSpecific[this.mainObj.user[i].key].user.lastSeenTime = data.data.lastSeenTime;
                    $rootScope.$broadcast('receiveStatusOffline', { id: this.mainObj.user[i].key });
                }
            }
        }.bind(this));

        socket.on('receive_notification', function(data) {
            //event of receive notifications
            console.log("in notification", data)
            $rootScope.getNotification();
        })

        socket.on('receiveConnectedUserLoginStatus', function(data) {
            for (var i = 0; i < this.mainObj.user.length; i++) {
                if (this.mainObj.user[i].user.uid == data.data.uid) {
                    this.mainObj.user[i].user = data.data;
                    this.mainObj.chatSpecific[this.mainObj.user[i].key].user.status = 'online';
                    this.mainObj.chatSpecific[this.mainObj.user[i].key].user.lastSeenTime = data.data.lastSeenTime;
                    $rootScope.$broadcast('receiveStatusOnline', { id: this.mainObj.user[i].key });
                }
            }
        }.bind(this))

        socket.on('connect', function(data) {
            if (localStorageService.get('socket_ids') == null) {
                var socketIds = [];
                socketIds[0] = socket.socket.id;
                localStorageService.set('socket_ids', socketIds)
            } else {
                var socketIds = localStorageService.get('socket_ids');
                socketIds.push(socket.socket.id);
                localStorageService.set('socket_ids', socketIds)
            }
        })


        socket.on('receiveChatMessage', function(data) {
            console.log('on receiveChatMessage', data)
            try {
                $cordovaNativeAudio.play('guess-what')
                    .then(function(msg) { console.log(msg); })
                    .catch(function(error) { console.error(error); });
            } catch (e) {

            }
            this.seen = false;
            this.istyping = false;

            if (typeof this.mainObj.chatSpecific[data.data.chat.conversationId] == "undefined") {
                console.log("in if")
                this.mainObj.chatSpecific[data.data.chat.conversationId] = [data.data.chat];

                if (User.me().uid == data.data.chat.senderId) {
                    this.mainObj.user.unshift({ key: data.data.chat.conversationId, user: data.data.receiver[0], me: data.data.user, index: 0 })
                    this.mainObj.chatSpecific[data.data.chat.conversationId][this.mainObj.chatSpecific[data.data.chat.conversationId].length - 1].seen = true;
                    this.mainObj.chatSpecific[data.data.chat.conversationId].user = data.data.receiver[0];
                    $rootScope.$broadcast('conversation_id', { key: data.data.chat.conversationId });
                } else {
                    this.mainObj.user.unshift({ key: data.data.chat.conversationId, user: data.data.user, me: data.data.receiver[0], index: 0 })
                    this.mainObj.chatSpecific[data.data.chat.conversationId].user = data.data.user;
                    $rootScope.$broadcast('conversation_id', { key: data.data.chat.conversationId });
                    this.total_seen += 1;
                }

            } else {
                console.log("in else")
                this.mainObj.chatSpecific[data.data.chat.conversationId].push(data.data.chat);
                this.mainObj.user.move(this.mainObj.user, 0, data.data.chat.conversationId);
                $ionicScrollDelegate.$getByHandle('chat-convo-handle').resize();
                $ionicScrollDelegate.$getByHandle('chat-convo-handle').scrollBottom(true);

                if (User.me().uid == data.data.chat.senderId) {
                    this.mainObj.chatSpecific[data.data.chat.conversationId][this.mainObj.chatSpecific[data.data.chat.conversationId].length - 1].seen = true;
                } else {
                    var url = '/chat/messages/conversation/' + data.data.chat.conversationId;
                    if ($location.path() != url) {
                        if (this.mainObj.chatSpecific[data.data.chat.conversationId][this.mainObj.chatSpecific[data.data.chat.conversationId].length - 2].seen == true) {
                            this.total_seen += 1;
                        }
                        this.mainObj.chatSpecific[data.data.chat.conversationId][this.mainObj.chatSpecific[data.data.chat.conversationId].length - 1].seen = false;
                    } else {
                        this.mainObj.chatSpecific[data.data.chat.conversationId][this.mainObj.chatSpecific[data.data.chat.conversationId].length - 1].seen = true;
                        var msgSeenObj = {
                            uId: User.me().uid,
                            messageIds: []
                        };
                        msgSeenObj.messageIds.push(this.mainObj.chatSpecific[data.data.chat.conversationId][this.mainObj.chatSpecific[data.data.chat.conversationId].length - 1].messageId);
                        socket.emit('messageseen', msgSeenObj, function(result) {
                            this.user_msg = "";
                        });
                    }
                }
            }

        }.bind(this));


        socket.on('receiveMessageSeenStatus', function(data) {
            //console.log('on receiveMessageSceneStatus', data);
            this.seen = true;
            this.total_seen = parseInt(this.total_seen - 1);
        }.bind(this));
    };

    Chat.prototype.disconnect = function() {
        var disconnectObj = {
            uId: this.sessionUser.uid,
            socketIds: localStorageService.get('socket_ids')
        };
        localStorageService.set('socket_ids', []);
        socket.emit('customize_disconnect', disconnectObj, function(result) {});
    };

    Chat.prototype.chatOnProfileUser = function(user) {
        for (var i = 0; i < this.mainObj.user.length; i++) {
            if (this.mainObj.user[i].user.uid == user.uid) {
                key = this.mainObj.user[i].key;
                console.log(key)
            }
        }

        if (typeof this.mainObj.chatSpecific[key] != "undefined") {
            //console.log("in if")

            this.chatProfileObject = this.mainObj.chatSpecific[key];
            this.currentUser = this.mainObj.chatSpecific[key].user;
            if (this.mainObj.chatSpecific[key][this.mainObj.chatSpecific[key].length - 1].seen != true) {
                this.mainObj.chatSpecific[key][this.mainObj.chatSpecific[key].length - 1].seen = true;
                var msgSeenObj = {
                    uId: User.me().uid,
                    messageIds: []
                };
                for (var j = 0; j < this.chatProfileObject.length; j++) {
                    if (this.chatProfileObject[j].senderId == this.currentUser.uid) {
                        msgSeenObj.messageIds.push(this.chatProfileObject[j].messageId);
                    }
                }
                socket.emit('messageseen', msgSeenObj, function(result) {
                    this.user_msg = "";
                });
            }
            $rootScope.navigateTo('chatmain.chat-convo', { id: key });
        } else {
            console.log("in else", user);

            NewUserChatService.set({ id: user.name, uid: user.uid, image: user.profile.small });
            $rootScope.$broadcast('new_user', {})
            $rootScope.navigateTo('chatmain.chat-convo', { id: -1 });
            //$rootScope.navigateTo('chatmain.chat-convo-new', { id: user.name, uid: user.uid, image: user.profile.small });
        }
    }


  Chat.prototype.chat = function(i, index) {

        if (typeof this.mainObj.chatSpecific[i] != "undefined") {
                //Emit Message Seen Event
                if (this.mainObj.chatSpecific[i][this.mainObj.chatSpecific[i].length - 1].seen != true) {
                    this.mainObj.chatSpecific[i][this.mainObj.chatSpecific[i].length - 1].seen = true;
                    var msgSeenObj = {
                        uId: User.me().uid,
                        messageIds: []
                    };
                    for (var j = 0; j < this.mainObj.chatSpecific[i].length; j++) {
                        if (this.mainObj.chatSpecific[i][j].senderId == index) {
                            msgSeenObj.messageIds.push(this.mainObj.chatSpecific[i][j].messageId);
                        }
                    }
                    socket.emit('messageseen', msgSeenObj, function(result) {
                        this.user_msg = "";
                    });
                }
        }
    };


    Chat.prototype.chatOnProfile = function(key) {

        if (typeof this.mainObj.chatSpecific[key] != "undefined") {
            //console.log("in if")

            this.chatProfileObject = this.mainObj.chatSpecific[key];
            this.currentUser = this.mainObj.chatSpecific[key].user;
            if (this.mainObj.chatSpecific[key][this.mainObj.chatSpecific[key].length - 1].seen != true) {
                this.mainObj.chatSpecific[key][this.mainObj.chatSpecific[key].length - 1].seen = true;
                var msgSeenObj = {
                    uId: User.me().uid,
                    messageIds: []
                };
                for (var j = 0; j < this.chatProfileObject.length; j++) {
                    if (this.chatProfileObject[j].senderId == this.currentUser.uid) {
                        msgSeenObj.messageIds.push(this.chatProfileObject[j].messageId);
                    }
                }
                socket.emit('messageseen', msgSeenObj, function(result) {
                    this.user_msg = "";
                });
            }
            //$rootScope.navigateTo('chatmain.chat-convo', { id: key });
        } else {
            $rootScope.navigateTo('chatmain.chat-convo-new', { id: user.name, uid: user.uid });
        }
    }

    Chat.prototype.login = function() {
        if (typeof User.getCredentials() != 'undefined') {
            var final_obj = {
                uId: User.me().uid,
                token: User.getCredentials().token
            }
            socket.emit('login', final_obj, function(result) {

            });
        }

    }

    Chat.prototype.SendMessage = function(value, uid) {
        if (typeof value != "undefined" && (value != "")) {
            var messages = {
                msgFrom: parseInt(User.me().uid),
                msgTo: parseInt(uid),
                msgContent: value
            };
            //$ionicScrollDelegate.scrollBottom();
            socket.emit('msg', messages, function(result) {});

            this.msg_txt = "";
        }
    };


    //receive offline messages
    Chat.prototype.reload = function() {
        var defer = $q.defer();
        socket.on('receiveOfflineMessages', function(data) {
            //  console.log("receiveOfflineMessages",JSON.stringify(data))
            this.mainObj.user = [];
            this.total_seen = 0;
            try {
                if (data.data.length != 0) {
                    for (var i = 0; i < data.data.length; i++) {
                        if (data.data[i].chat.length != 0) {
                            this.mainObj.user.push({ key: data.data[i].chat[0].conversationId, user: data.data[i].user, me: User.me(), index: i, lastMessageId: data.data[i].chat[data.data[i].chat.length - 1].createdTime, isTyping: false })
                            this.mainObj.chatSpecific[data.data[i].chat[0].conversationId] = data.data[i].chat;
                            this.mainObj.chatSpecific[data.data[i].chat[0].conversationId].user = data.data[i].user;
                            this.total_seen = data.data[i].chat[data.data[i].chat.length - 1].seen == false ? this.total_seen + 1 : this.total_seen + 0;
                        }
                    }

                    if (typeof data.data[0].chat != "undefined") {
                        last_conversation_id = data.data[0].chat[0].conversationCreatedTime;
                    }
                    //this.show_screen = true;
                    defer.resolve();
                } else {
                    defer.resolve({});
                }
            } catch (err) {

            }

        }.bind(this));

        return defer.promise;
    }
    return Chat;
})

.service('NewUserChatService', function() {
    var _user = {};
    this.set = function(user) {
        _user = user;
    }

    this.get = function() {
        return _user;
    }
})

.controller('MessagingConvoCtrl', function($scope, $rootScope, $state, $location, $stateParams, User, $ionicScrollDelegate, $timeout, $ionicActionSheet, socket, $q, $ionicPopup, $ionicHistory, $cordovaClipboard, $cordovaToast, PushwooshState, $filter, NewUserChatService) {
    $scope.conversationId = $stateParams.id;
    $scope.chatObject = []
    $scope.isDisabled = false;
    $scope.$on('$ionicView.beforeEnter', function() {
        $ionicScrollDelegate.$getByHandle('chat-convo-handle').resize();
        $ionicScrollDelegate.$getByHandle('chat-convo-handle').scrollBottom(true);
    });


    if (typeof $rootScope.chatFactory.mainObj.chatSpecific[$scope.conversationId] != "undefined") {
        $scope.title = $rootScope.chatFactory.mainObj.chatSpecific[$scope.conversationId].user.name;
        //debugger;
        $scope.chatObject = $rootScope.chatFactory.mainObj.chatSpecific[$scope.conversationId];
        $scope.header_text = $rootScope.chatFactory.mainObj.chatSpecific[$scope.conversationId].user.status == 'offline' ? 'Last Seen ' + $filter('readableTime2')($rootScope.chatFactory.mainObj.chatSpecific[$scope.conversationId].user.lastSeenTime) + ' ago' : 'online';
    } else {
        var user = NewUserChatService.get();
        console.log("user is", user);
        $scope.title = user.id;
        $scope.newuid = user.uid;
    }

    $rootScope.$on('new_user', function(event, args) {
            var user = NewUserChatService.get();
            $scope.title = user.id;
            $scope.newuid = user.uid;
        })
    $rootScope.$on('conversation_id', function(event, args) {

        $stateParams.id = args.key;
        $scope.conversationId = args.key;
        $scope.title = $rootScope.chatFactory.mainObj.chatSpecific[args.key].user.name;
        if ($rootScope.chatFactory.mainObj.chatSpecific[args.key].user.lastSeenTime != null) {
            $scope.header_text = 'Last Seen ' + $filter('readableTime2')($rootScope.chatFactory.mainObj.chatSpecific[args.key].user.lastSeenTime) + ' ago';
        } else {
            $scope.header_text = $rootScope.chatFactory.mainObj.chatSpecific[args.key].user.status;
        }
    })

    $scope.sessionUser = User.me();

    $rootScope.$on('receiveStatusOnline', function(event, args) {
        if ($stateParams.id == -1) {
            $scope.header_text = $rootScope.chatFactory.mainObj.chatSpecific[args.id].user.status;
        } else {
            try {
                $scope.header_text = $rootScope.chatFactory.mainObj.chatSpecific[$scope.conversationId].user.status;
            } catch (err) {

            }
        }
    })

    $rootScope.$on('receiveStatusOffline', function(event, args) {
        try {

            if ($stateParams.id == -1) {
                if ($rootScope.chatFactory.mainObj.chatSpecific[args.id].user.lastSeenTime != null) {
                    $scope.header_text = 'Last Seen ' + $filter('readableTime2')($rootScope.chatFactory.mainObj.chatSpecific[args.id].user.lastSeenTime) + ' ago';
                } else {
                    $scope.header_text = $rootScope.chatFactory.mainObj.chatSpecific[args.id].user.status;
                }
            } else {
                if ($rootScope.chatFactory.mainObj.chatSpecific[$scope.conversationId].user.lastSeenTime != null) {
                    $scope.header_text = 'Last Seen ' + $filter('readableTime2')($rootScope.chatFactory.mainObj.chatSpecific[$scope.conversationId].user.lastSeenTime) + ' ago';
                } else {
                    $scope.header_text = $rootScope.chatFactory.mainObj.chatSpecific[$scope.conversationId].user.status;
                }
            }
        } catch (err) {

        }
    })

    $scope.actionSheet = function(chatObject) {
        var buttons = [];
        buttons.push({ text: '<i class="icon lg-icon-delete"></i> Delete Conversation' });

        var actionSheet = $ionicActionSheet.show({
            titleText: 'Actions',
            buttons: buttons,
            //destructiveText: 'Delete',
            cancelText: '<i class="icon rd-txt lg-icon-cross-small"></i> <span class="rd-txt">Close</span>',
            cancel: function() {},
            buttonClicked: function(index) {
                if (index == 0) {
                    $scope.deleteConversation();
                    return true;
                }

            }
        })
    }

    $scope.onChatScroll = function(top) {
        var fn = ionic.debounce(function() {
            if (($ionicScrollDelegate.getScrollPosition().top <= top) && !$scope.isLoading) {
                $scope.doRefresh();
            }
        }, 500);

        fn(top);
    }
    var nomoremessage = false;

    $scope.isLoading = false;
    $scope.doRefresh = function() {
        var elmnt = document.getElementById($scope.conversationId);
        var y = elmnt.scrollHeight;
        if (!nomoremessage) {
            $scope.isLoading = true;

            $rootScope.isChatLoading = true;
            if (typeof $rootScope.chatFactory.mainObj.chatSpecific[$scope.conversationId] != "undefined") {
                
                var finalObj = {
                    uId: User.me().uid,
                    messageCreated: $rootScope.chatFactory.mainObj.chatSpecific[$scope.conversationId][0].messageId,
                    conversationId: $scope.conversationId
                }
                socket.emit('scroll_chat_messages', finalObj, function(result) {});
                var bottomPosition = y - $ionicScrollDelegate.$getByHandle('chat-convo-handle').getScrollPosition().top;

                $timeout(function() {
                    $scope.isLoading = false;
                    $rootScope.isChatLoading = false;
                    var newheight = elmnt.scrollHeight;
                    $ionicScrollDelegate.$getByHandle('chat-convo-handle').scrollTo(0, newheight - bottomPosition, false);
                }, 1000);
            }
        }
    }

    $scope.sendMessage = function(message, uid) {
        $rootScope.chatFactory.SendMessage(message, uid);
        $scope.message = "";
    }

    socket.on('receiveScrollChatMessages', function(data) {
        if (typeof data.data[0] != "undefined") {
            if (data.data[0].chat.length == 0) {
                $scope.isLoading = true;
                alert("here in receive scroll")
                $rootScope.isChatLoading = true;
                $scope.isDisabled = true;
            } else {
                if ($scope.conversationId == data.data[0].chat[0].conversationId) {
                    for (var i = data.data[0].chat.length - 1; i >= 0; i--) {
                        $rootScope.chatFactory.mainObj.chatSpecific[$scope.conversationId].unshift(data.data[0].chat[i])
                    }
                    $ionicScrollDelegate.$getByHandle('chat-convo-handle').resize();
                    //$ionicScrollDelegate.$getByHandle('chat-convo-handle').anchorScroll();
                    $scope.check_scroll = data.data[0];
                }
            }


        } else {
            nomoremessage = true;
        }
    })

    socket.on('receive_UserTyping', function(data) {
        //console.log(data);

        if ($scope.sessionUser.uid != data.data.user.uid) {
            if ($rootScope.chatFactory.mainObj.chatSpecific[$scope.conversationId].user.uid == data.data.user.uid) {
                $scope.header_text = data.data.message || $rootScope.chatFactory.mainObj.chatSpecific[$scope.conversationId].user.status;

            }
        }
    });

    $scope.$on('$destroy', function() {
        socket.removeAllListeners();
    });

    socket.on('receiveMessageDeleteStatus', function(data) {
        // console.log('on receiveMessageDeleteStatus', data)
        var conv_id = $scope.conversationId;
        $rootScope.chatFactory.mainObj.chatSpecific[$scope.conversationId].splice($scope.messageIndex, 1);
        if ($rootScope.chatFactory.mainObj.chatSpecific[$scope.conversationId].length == 0) {
            for (var i = 0; i < $rootScope.chatFactory.mainObj.user.length; i++) {
                if ($rootScope.chatFactory.mainObj.user[i].key == conv_id) {
                    $rootScope.chatFactory.mainObj.user.splice(i, 1);
                    $rootScope.chatFactory.mainObj.chatSpecific[conv_id] = undefined;
                    //mainObj.chatSpecific[data.data.chat.conversationId] 
                    $ionicHistory.goBack();
                }
            }
        }
    });

    $scope.Typing = function() {

        try {
            if (typeof $rootScope.chatFactory.mainObj.chatSpecific[$scope.conversationId][0] != "undefined") {

                var userTypingObj = {
                    uId: $scope.sessionUser.uid,
                    conversationId: $rootScope.chatFactory.mainObj.chatSpecific[$scope.conversationId][0].conversationId,
                    message: ""
                }
                socket.emit('user_typing', userTypingObj, function(result) {

                });
            }
        } catch (err) {

        }

    };

    $scope.onhold = function(messageId, index, content) {
        $scope.showDelete = true;
        $scope.messageId = messageId;
        $scope.messageIndex = index;
        var buttons = [];
        buttons.push({ text: '<i class="icon lg-icon-delete"></i> Delete' });
        buttons.push({ text: '<i class="icon ion-ios-copy-outline"></i> Copy Text' })
        var actionSheet = $ionicActionSheet.show({
            titleText: 'Actions',
            buttons: buttons,
            //destructiveText: 'Delete',
            cancelText: '<i class="icon rd-txt lg-icon-cross-small"></i> <span class="rd-txt">Close</span>',
            cancel: function() {},
            buttonClicked: function(index) {
                if (index == 0) {
                    $scope.deletemessage();
                    return true;
                }

                if (index == 1) {
                    $cordovaClipboard
                        .copy(content)
                        .then(function() {
                            $cordovaToast.show('copied', 'short', 'bottom').then(function(success) {
                                console.log("The toast was shown");
                            }, function(error) {
                                console.log("The toast was not shown due to " + error);
                            });

                        }, function() {
                            // error
                        });
                    return true;
                }

            }
        })
    }

    $scope.deleteConversation = function() {
        var finalObj = {
            uId: User.me().uid,
            conversationId: $scope.conversationId
        }


        var confirmPopup = $ionicPopup.confirm({
            title: 'Delete',
            template: 'Are you sure you want to delete this conversation?'
        });

        confirmPopup.then(function(res) {
            if (res) {
                socket.emit('delete_conversation', finalObj, function(result) {});
            } else {
                console.log('You are not sure');
            }
        });
    }

    socket.on('receiveConversationDeleteStatus', function(data) {
        //console.log('receiveConversationDeleteStatus', data);
        for (var i = 0; i < $rootScope.chatFactory.mainObj.user.length; i++) {
            if ($rootScope.chatFactory.mainObj.user[i].key == $scope.conversationId) {
                $rootScope.chatFactory.mainObj.user.splice(i, 1);
                $rootScope.chatFactory.mainObj.chatSpecific[$scope.conversationId] = undefined;
                $ionicHistory.goBack();
            }
        }
    });

    $scope.deletemessage = function() {
        $scope.showDelete = false;
        var msgDeleteObj = {
            uId: User.me().uid,
            messageId: $scope.messageId
        }

        var confirmPopup = $ionicPopup.confirm({
            title: 'Delete',
            template: 'Are you sure you want to delete this message?'
        });

        confirmPopup.then(function(res) {
            if (res) {
                socket.emit('messagedelete', msgDeleteObj, function(result) {});
            } else {
                console.log('You are not sure');
            }
        });
    }

    $scope.keyup = function() {
        try {
            $timeout.cancel($scope.TypeTimer);
            $scope.TypeTimer = $timeout(function() {
                var userTypingObj = {
                    uId: $scope.sessionUser.uid,
                    conversationId: $rootScope.chatFactory.mainObj.chatSpecific[$scope.conversationId][0].conversationId,
                    message: ""
                }

                socket.emit('user_typing', userTypingObj, function(result) {

                }); //sending data to server
            }, 1000);
        } catch (err) {

        }

    };

    $scope.keydown = function() {
        $timeout.cancel($scope.TypeTimer);

    };

    $scope.change = function() {
        //$scope.counter++;
        try {
            var userTypingObj = {
                uId: $scope.sessionUser.uid,
                conversationId: $rootScope.chatFactory.mainObj.chatSpecific[$scope.conversationId][0].conversationId,
                message: $scope.sessionUser.name + " is typing"
            }

            $timeout.cancel($scope.TypeTimer);
            socket.emit('user_typing', userTypingObj, function(result) {

            }); //sending data to server //sending data to server
        } catch (err) {

        }

    };

    $scope.blur = function() {
        try {
            $timeout.cancel($scope.TypeTimer);
            var userTypingObj = {
                uId: $scope.sessionUser.uid,
                conversationId: $rootScope.chatFactory.mainObj.chatSpecific[$scope.conversationId][0].conversationId,
                message: ""
            }

            socket.emit('user_typing', userTypingObj, function(result) {

            }); //sending data to server  
        } catch (err) {

        }
    };

})

.service('ChatConvoIdService', function() {
    var _id = 0;
    this.set = function(id) {
        _id = id;
    }

    this.get = function() {
        return _id;
    }
})

.controller('ChatUserController', ['$scope', 'GoalsDataServices', 'User', 'PushwooshState', '$state', '$rootScope', 'ChatConvoIdService', function($scope, GoalsDataServices, User, PushwooshState, $state, $rootScope, ChatConvoIdService) {

    $scope.searchQuery = "";
    $scope.isLoading = false;
    $scope.searchResult = [];
    $scope.showlist = true;
    $scope.$watch('searchQuery', function(o, n) {
        if ($scope.searchQuery.length > 0) {
            $scope.searchResult = []
            $scope.isLoading = true;
            $scope.showlist = false;
            var offset = 0;
            var limit = 5;
            GoalsDataServices.userConnections($scope.searchQuery, { offset: 0, limit: 5 }).success(function(result) {
                $scope.searchResult = result.data;
                $scope.isLoading = false;
            })
        } else {
            $scope.showlist = true;
            $scope.searchQuery = "";
            $scope.searchResult = []
        }
    })

    $scope.navigateToChat = function(id,uid) {
        $rootScope.navigateTo('chatmain.chat-convo', { id: id })
        $rootScope.chatFactory.chat(id,uid);
    }

    $scope.sessionUser = User.me();
    $scope.clear = function() {
        $scope.searchQuery = "";
        $scope.searchResult = []
    }
}])

.filter('datetime', function($filter) {
    return function(input) {
        if (input == null) {
            return "";
        }

        var _date = $filter('date')(new Date(input),
            'MMM dd yyyy');

        return _date.toUpperCase();

    };
})

.directive('focusOnKeyboardOpen', function($window, $ionicScrollDelegate, $timeout) {
    'use strict';
    return {
        restrict: 'A',
        scope: {
            hidekeyboard: '=hidekeyboard'
        },
        link: function(scope, element, attrs) {
            var keyboardOpen = false;
            // require cordova plugin https://github.com/driftyco/ionic-plugins-keyboard
            $window.addEventListener('native.keyboardshow', function(e) {
                keyboardOpen = true;
                element[0].focus();
                $timeout(function() {
                    $ionicScrollDelegate.$getByHandle('comment-handle').scrollBottom(true);
                    $ionicScrollDelegate.$getByHandle('post-comment-handle').scrollBottom(true);
                }, 0);

            });
            $window.addEventListener('native.keyboardhide', function(e) {
                keyboardOpen = false;
                // if (scope.hidekeyboard) {
                element[0].blur();
                // }

            });

            element[0].addEventListener('blur', function(e) {
                if (scope.hidekeyboard) {
                    keyboardOpen = false;
                    scope.hidekeyboard = false;
                } else {
                    if (keyboardOpen) {
                        element[0].focus();
                    }
                }


            }, true);
        }
    };
})

Array.prototype.move = function(element, offset, id) {
    index = functiontofindIndexByKeyValue(element, 'key', id)
    newIndex = index + offset

    if (newIndex > -1 && newIndex < this.length) {

        removedElement = this.splice(index, 1)[0]
        this.unshift(removedElement);
    }
}

function functiontofindIndexByKeyValue(arraytosearch, key, valuetosearch) {

    for (var i = 0; i < arraytosearch.length; i++) {

        if (arraytosearch[i][key] == valuetosearch) {
            return i;
        }
    }
    return null;
}
