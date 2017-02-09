(function() {
    'use strict';

    angular.module('ionicPushwoosh.configs', [])

    .constant("PUSHWOOSH_CONFIG", {
        "PW_APP_ID": '6730F-D4185',
        "GOOGLE_PROJECT_NUMBER": '167113267439'
    });

    angular.module('ionicPushwoosh.services', ['ionicPushwoosh.configs', 'CoreApi']).factory("Pushwoosh", Pushwoosh);

    Pushwoosh.$inject = ['PUSHWOOSH_CONFIG', "$state", 'NotificationDataServices', '$location', 'PushwooshState'];

    function Pushwoosh(PUSHWOOSH_CONFIG, $state, NotificationDataServices, $location, PushwooshState) {
        var PW_APP_ID = PUSHWOOSH_CONFIG.PW_APP_ID;
        var GOOGLE_PROJECT_NUMBER = PUSHWOOSH_CONFIG.GOOGLE_PROJECT_NUMBER;
        var pushNotification;

        return {
            init: init,
            initializePlugin: initializePlugin,
            registerDevice: registerDevice,
            setAlias: setAlias,
            resetApplicationIconBadgeNumber: resetApplicationIconBadgeNumber
        }

        function init() {
            //if (window.plugins && window.plugins.pushNotification) {
                //pushNotification = window.plugins.pushNotification;
                pushNotification = cordova.require("pushwoosh-cordova-plugin.PushNotification");
                var pushToken;

            // } else {
            //     console.log("Push Notification not enabled.");
            //     return;
            // }
            //set push notification callback before we initialize the plugin
            document.addEventListener('push-notification', function(event) {
                //get the notification payload
                var notification = event.notification;
                //handle notification
                notificationHandler(notification);
                //clear the app badge
                resetApplicationIconBadgeNumber();
            });

            //registerDevice();
            initializePlugin();
            resetApplicationIconBadgeNumber();
        }

        //initialize the plugin
        function initializePlugin() {
            if (ionic.Platform.isIOS()) {
                pushNotification.onDeviceReady({ pw_appid: PW_APP_ID });
            }

            if (ionic.Platform.isAndroid()) {
                pushNotification.onDeviceReady({ projectid: GOOGLE_PROJECT_NUMBER, appid: PW_APP_ID });
            }
        }

        function registerDevice() {
            pushNotification = cordova.require("pushwoosh-cordova-plugin.PushNotification");
            pushNotification.registerDevice(function(status) {
                var deviceToken = ionic.Platform.isIOS() ? status.deviceToken : status;

                NotificationDataServices.subscribe(deviceToken).success(function(result) {
                    // API success
                }).error(function(err) {
                    // API error
                })
            }, function(status) {
                var errorStr = JSON.stringify(status)
                console.warn('failed to register : ' + errorStr);
                // if the request is timeout then retry
                if (errorStr.search("The request timed out") != -1) {
                    registerDevice();
                }
            });

            pushNotification.setMultiNotificationMode();

        }


        function setAlias(aliasValue) {
            console.log("set alias: " + aliasValue);
            if (pushNotification) {
                pushNotification.setTags({
                        Alias: aliasValue
                    }, function(status) {
                        console.log("Pushwoosh setAlias success");
                    },
                    function(status) {
                        console.log(status);
                        console.log("Pushwoosh setAlias failed");
                    });
            }
        }

        function resetApplicationIconBadgeNumber() {
            if (pushNotification) {
                //reset badges on app start
                pushNotification.setApplicationIconBadgeNumber(0);
            }
        }

        function formatPushData(notification) {
            /********************* ios push data structure ************************************
            event = {
              ...
              notification: {
                onStart: true,
                aps: {
                  alert: "Nice to meet you",
                  badge: 1,
                  sound: "default"
                },
                custom: {
                  type: "message"
                },
              }
            }
            ******************************************************************************/

            /**************** android push data structure*****************************************
            event = {
              notification: {
                alert: "[xx] match with you",
                collapse_key: "do_not_collapse",
                custom: "{"type":"dop"}",
                foreground: false,
              }
            }
            ******************************************************************************/
                         console.log(notification);
            var final_notification = {
                onStart: notification.onStart,
                params: notification.userdata.params
            }
            console.log(final_notification)

            return final_notification;

            // var notification = ionic.Platform.isIOS() ? notification.userdata : JSON.parse(notification.userdata);
            
            // return notification;
        }

        function notificationHandler(notification) {


            var formatNotification = formatPushData(notification);
            var messageType = formatNotification.type;
            
            // onStart is true means the app is not active
            // the user click in notification center
            if (notification.onStart || !notification.foreground) {
                // app wake up from notification center,
                // do something what you like, for example:
                console.log("in if",notification.onStart)
                console.log('#/tab/me/posts/'+ formatNotification.params.id +'/comments')
                //$location.url('#/tab/me/posts/'+ formatNotification.params.id +'/comments');
                // window.ionic.Platform.ready(function() {
                //     $state.go(formatNotification.state, {id : formatNotification.params.id});    
                // })
                console.log(formatNotification.params.state)
                PushwooshState.set(formatNotification.params);

            } else {
                // do something what you need
            }
        }
        // 
        // function notificationHandler(notification) {
        //     console.log(JSON.stringify(notification))
        //     if (notification.onStart || !notification.foreground) {
        //         var rcvdState = notification.userdata.state || 'tab.me';
        //         var rcvdParams = notification.userdata.params || {};
        //         $state.go(rcvdState, rcvdParams);
        //     } else {
        //         // do something what you need
        //     }
        // }
    }
})();
