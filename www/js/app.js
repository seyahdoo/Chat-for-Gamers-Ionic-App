// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'ngOpenFB'])

.run(function($ionicPlatform, ngFB) {
  $ionicPlatform.ready(function() {
    //initiate OpenFB api
    ngFB.init({appId: '1005995122829799'});

    //initiate username cache
    uNameCache = {};


    //lastForumsId = "0";

    //lastForumId = "0";
    //lastForumGetFunc = function dummyfunc() {};
    //lastMessageGetId = "0";
    //lastMessageGetFunc = function dummyfunc() {};

    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })
    
    .state('app.login', {
      url: '/login',
      views: {
        'menuContent': {
          templateUrl: 'templates/login.html',
          controller: 'LoginCtrl'
        }
      }
    })
    .state('app.setusername', {
      url: '/setusername',
      views: {
        'menuContent': {
          templateUrl: 'templates/setUsername.html',
          controller: 'SetUsernameCtrl'
        }
      }
    })
    .state('app.forums', {
      url: '/forums',
      views: {
        'menuContent': {
          templateUrl: 'templates/forums.html',
          controller: 'ForumsCtrl'
        }
      }
    })
    .state('app.forumdetails', {
      url: '/forums/:forumId',
      views: {
        'menuContent': {
          templateUrl: 'templates/forum.html',
          controller: 'ForumCtrl'
        }
      }
    })
    .state('app.channel', {
      url: '/channel/:channelId',
      views: {
        'menuContent': {
          templateUrl: 'templates/channel.html',
          controller: 'ChannelCtrl'
        }
      }
    })
    
    ;
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/forums');
});
