angular.module('starter.controllers', ['ngOpenFB'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $state) {


  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      //toastr.info('Auth State Changed!');
      firebase.database().ref('users').child(user.uid).child('channel').on('value',function(snapshot){
        //toastr.info('changing channel to '+snapshot.val());
        if(snapshot.val() != null){
          $state.go('app.channel', { channelId: snapshot.val()});
        }
      });

    } else {
      // No user is signed in.
      //toastr.info('Logged out with firebase!');
    }
  });

})

.controller('LoginCtrl', function($scope, ngFB, $state) {
  
  //this works! with in app browser plugin  
  $scope.fbLogin = function () {
    //if logged in log out!
    if(firebase.auth().currentUser){
      //toastr.info("Logging Out!");
      firebase.auth().signOut();
      ngFb.logout();
    }else{
      ngFB.login({scope: 'email'}).then(
        function (response) {
          if (response.status === 'connected') {
            var credential = firebase.auth.FacebookAuthProvider.credential(response.authResponse.accessToken);
            firebase.auth().signInWithCredential(credential);
          } else {
            toastr.error('Facebook Login FAIL!')
          }
        }
      );
    }

    
  };
  
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      toastr.info('Logged in with firebase!');
      //console.log(user);
      toastr.info("Hello "+user.displayName);
      //TODO set username if did not set.
      //TODO check if user has username on the serverside too.
      //get users/uid if null set users/uid
      //TODO!!!!
      //$location.path('/app/setusername');
      $state.go('app.setusername');
    } else {
      // No user is signed in.
      toastr.info('Logged out with firebase!');
    }
  });
  

})

.controller('SetUsernameCtrl', function($scope, $state) {

  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      //TODO set username if did not set.
      //TODO check if user has username on the serverside too.
      //get users/uid if null set users/uid
      //will set username
    } else {
      // No user is signed in ????
      //redirect to login
      //$location.path('/app/login');
      $state.go('app.login');
      
      //toastr.info('Logged out with firebase!');
    }
  });

  $scope.buttonDisabled = false;
  $scope.data = {username: ""};

  $scope.setUsername = function(){
    //toastr.info("Setting username to "+$scope.data.username);
    $scope.buttonDisabled = true;
    //$scope.$apply();
    //todo, check if unique
    //if usernames/username exists exit!
    var uData = {
      "isBanned" : false,
      "isGod" : false,
      "isShiny" : false
    };
    uData.username = $scope.data.username;
    uData.email = firebase.auth().currentUser.email;

    firebase.database().ref('users').child(firebase.auth().currentUser.uid).set(uData);
    //$location.path('/app/forums');
    $state.go('app.forums');
  };



})

.controller('ForumsCtrl', function($scope) {
  
  //toastr.info('Are you the 6 fingered man?');
  //firebase.database().ref('debug').push().set({hey:firebase.database.ServerValue.TIMESTAMP});
  
  $scope.forums = [];

  //do not stack theese on child listeners
  if (typeof lastForumGetFunc !== 'undefined') {
    // the variable is defined
      //toastr.info("removed listener");
      firebase.database().ref('forum-metadata').off('child_added',lastForumsGetFunc);
  }

  lastForumsGetFunc = firebase.database().ref('forum-metadata').on('child_added', function(snapshot){
      $scope.forums.push(snapshot.val());
      $scope.$apply();
      //toastr.info("added "+snapshot.val().name);
  });

})

.controller('ForumCtrl', function($scope, $stateParams) {
  
  var forumid = $stateParams.forumId;

  $scope.channels = [];

  //do not stack theese on child listeners
  if (typeof lastForumGetFunc !== 'undefined') {
    // the variable is defined
      //toastr.info("removed listener");
      firebase.database().ref('forum-channels').child(lastForumId).off('child_added',lastForumGetFunc);
  }

  lastForumId = forumid;
  lastForumGetFunc = firebase.database().ref('forum-channels').child(forumid).on('child_added', function(snapshot){
    firebase.database().ref('channel-metadata').child(snapshot.key).once('value', function(snapshot) {
      $scope.channels.push(snapshot.val());
      $scope.$apply();
      //toastr.info("added "+snapshot.val().name);
    });
  });

})

.controller('ChannelCtrl', function($scope, $stateParams, $state, $ionicScrollDelegate) {
  
  var channelid = $stateParams.channelId;
  //"High_Admin"
  var slowModeActive = false;
  var slowModeAmount = 2000;
  //var channelName

  $scope.sendButtonDisabled = false;
  $scope.messages = [];
  $scope.data = {
    text: "",
    channelName: ""
  };

  if (typeof lastMessageGetFunc !== 'undefined') {
    // the variable is defined
    //toastr.info("removed listener");
    firebase.database().ref('channel_messages').child(lastMessageGetId).off('child_added',lastMessageGetFunc);
  }

  lastMessageGetId = channelid;
  lastMessageGetFunc = firebase.database().ref('channel_messages').child(channelid).limitToLast(1).on('child_added',function(snapshot){
    var msg = snapshot.val();
    //toastr.info("message get");
    if(uNameCache[msg.uid]){
      //toastr.info("fetching username from cache");
      msg.username = uNameCache[msg.uid];
      $scope.messages.push(msg);
      //todo if scrollplace down scroll down, else dont touch player is reading old messages.
      $ionicScrollDelegate.$getByHandle('mainScroll').scrollBottom();
      //$scope.$apply(); //maybe scrollBottom() does it automaticly
    }else{
      //toastr.info("fetching username from firebase");
      firebase.database().ref('users').child(msg.uid).once('value').then(function(snapshot) {
          //toastr.info("fetched username from firebase");
          var username = snapshot.val().username;
          uNameCache[msg.uid] = username;
          msg.username = username;
          $scope.messages.push(msg);
          //todo if scrollplace down scroll down, else dont touch player is reading old messages.
          $ionicScrollDelegate.$getByHandle('mainScroll').scrollBottom();
          $scope.$apply();
      });
    }

  });

  //TODO implement child_removed and child_changed

  $scope.send = function(){
    //if $scope.sendButtonDisabled {hack cought, print(Ahanda!!! :D ), firebase.pushtohacks(user info) }
    //özel hacker  odasına al, bişeyler filan ısmarla, iyi adam bunlar :D

    //get uid
    //firebase.auth().uid
    //if null redirect to login
    if(firebase.auth().currentUser){
      //todo send!
      var msg = {
        shiny:      false,
        uid:        firebase.auth().currentUser.uid,
        visible:    true,
        text:       $scope.data.text,
        sendTime:   firebase.database.ServerValue.TIMESTAMP
      };
      firebase.database().ref('channel_messages').child(channelid).push().set(msg);
      $scope.data.text = "";
      
      //slow mode X seconds
      if(slowModeActive){
        $scope.sendButtonDisabled = true;
        setTimeout(function() {
          $scope.sendButtonDisabled = false;
          $scope.$apply();
        }, slowModeAmount);//X here
      }
    }else{
      //redirect to login
      //$location.path('/app/login');
      $state.go('app.login');
      
    }
  
  };


  //add a listener to channel 
  if (typeof lastChannelInfoFunc !== 'undefined') {
    // the variable is defined
    //toastr.info("removed listener");
    firebase.database().ref('channel-metadata').child(lastChannelInfoId).off('value',lastChannelInfoFunc);
  }
  lastChannelInfoId = channelid;
  lastChannelInfoFunc = firebase.database().ref('channel-metadata').child(channelid).on('value',function(snapshot){
    //console.log(snapshot.val());
    $scope.data.channelName = snapshot.val().name;
    slowModeActive = snapshot.val().slowmode.isActive;
    slowModeAmount = snapshot.val().slowmode.amount;
  });    


})

;
