angular.module('starter')
 
.controller('AppCtrl', function($scope, $state, $ionicPopup, AuthService, AUTH_EVENTS) {
  $scope.username = AuthService.username();
 
  $scope.$on(AUTH_EVENTS.notAuthorized, function(event) {
    var alertPopup = $ionicPopup.alert({
      title: 'Unauthorized!',
      template: 'You are not allowed to access this resource.'
    });
  });
 
  $scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
    AuthService.logout();
    $state.go('login');
    var alertPopup = $ionicPopup.alert({
      title: 'Session Lost!',
      template: 'Sorry, You have to login again.'
    });
  });
 
  $scope.setCurrentUsername = function(name) {
    $scope.username = name;
  };
})
.controller('LoginCtrl', function($scope, $state, $ionicPopup, AuthService) {
  $scope.data = {};
 
  $scope.login = function(data) {
  	// console.log(data);
    AuthService.login($scope.data.username, $scope.data.password).then(function(authenticated) {
      console.log(authenticated);
      $state.go('main.dash', {}, {reload: true});
      $scope.setCurrentUsername(window.localStorage.getItem('username'));
    }, function(err) {
      var alertPopup = $ionicPopup.alert({
        title: 'Login failed!',
        template: 'Please check your credentials!'
      });
    });
  };
})
.controller('DashCtrl', function($scope, $state, $http, $ionicPopup, AuthService) {
  $scope.logout = function() {
    AuthService.logout();
    $state.go('login');
  };
 
  $scope.performValidRequest = function() {
    $http.get('http://localhost:8100/valid').then(
      function(result) {
        $scope.response = result;
      });
  };
 
  $scope.performUnauthorizedRequest = function() {
    $http.get('http://localhost:8100/notauthorized').then(
      function(result) {
        // No result here..
      }, function(err) {
        $scope.response = err;
      });
  };
 
  $scope.performInvalidRequest = function() {
    $http.get('http://localhost:8100/notauthenticated').then(
      function(result) {
        // No result here..
      }, function(err) {
        $scope.response = err;
      });
  };
})
.controller('FormCtrl', function($scope, $cordovaCamera, $ionicActionSheet,$cordovaFile, $cordovaFileTransfer, $cordovaDevice, $state, $ionicPopup, AuthService, Camera, $stateParams,$http, $ionicModal, $ionicPopup, $cordovaActionSheet) {
  $scope.data = {};

  $http.get('http://localhost:3000/api/v1/themes').then(function(themes){
    $scope.themes = themes.data;
    // console.log(themes);

    $scope.theme_id = $scope.themes[0].id;
  });

  $scope.pathForImage = function(image) {
    if (image === null) {
      return '';
    } else {
      return '';
    }
  };

  $scope.image = null;
 
  $scope.showAlert = function(title, msg) {
    var alertPopup = $ionicPopup.alert({
      title: title,
      template: msg
    });
  };

  // Present Actionsheet for switch beteen Camera / Library
  $scope.loadImage = function() {
    var options = {
      title: 'Select Image Source',
      buttonLabels: ['Load from Library', 'Use Camera'],
      addCancelButtonWithLabel: 'Cancel',
      androidEnableCancelButton : true,
    };
    $cordovaActionSheet.show(options).then(function(btnIndex) {
      var type = null;
      if (btnIndex === 1) {
        type = Camera.PictureSourceType.PHOTOLIBRARY;
      } else if (btnIndex === 2) {
        type = Camera.PictureSourceType.CAMERA;
      }
      if (type !== null) {
        $scope.selectPicture(type);
      }
    });
  };

  $http.get('http://localhost:3000/api/v1/my_memories/'+ $stateParams.memoryId).then(function(memory){
    $scope.title = memory.data.title;
    $scope.description = memory.data.description;
    console.log($scope.title);
    $scope.theme_id = memory.data.theme_id;
  });

  $ionicModal.fromTemplateUrl('my-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });
  $scope.openModal = function() {
    $scope.modal.show();
  };
  $scope.closeModal = function() {
    $scope.modal.hide();
  };
  // Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });

  $scope.addTheme = function(theme){
    console.log(theme.id);
    $scope.theme_id = theme.id;

  };
  $scope.openPhotoLibrary = function() {
      var options = {
          quality: 50,
          destinationType: Camera.DestinationType.FILE_URI,
          sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
          allowEdit: true,
          encodingType: Camera.EncodingType.JPEG,
          popoverOptions: CameraPopoverOptions,
          saveToPhotoAlbum: false
      };

      $cordovaCamera.getPicture(options).then(function(imageData) {

          //console.log(imageData);
          //console.log(options);   
          var image = document.getElementById('tempImage');
          image.src = imageData;  

          var server = "http://yourdomain.com/upload.php",
              filePath = imageData;

          var date = new Date();

          var options = {
              fileKey: "file",
              fileName: imageData.substr(imageData.lastIndexOf('/') + 1),
              chunkedMode: false,
              mimeType: "image/jpg"
          };

          $cordovaFileTransfer.upload(server, filePath, options).then(function(result) {
              console.log("SUCCESS: " + JSON.stringify(result.response));
              console.log('Result_' + result.response[0] + '_ending');
              alert("success");
              alert(JSON.stringify(result.response));

          }, function(err) {
              console.log("ERROR: " + JSON.stringify(err));
              //alert(JSON.stringify(err));
          }, function (progress) {
              // constant progress updates
          });


      }, function(err) {
          // error
          console.log(err);
      });
  };

  $scope.addDetails = function(){

    var my_memory = {
      title: $scope.title,
      description: $scope.description,
      theme_id: $scope.theme_id
    };
    url = 'http://localhost:3000/api/v1/my_memories/'+$stateParams.memoryId;
    $http.patch(url, {my_memory: my_memory}).then(function (res){
      $scope.response = res.data;
      console.log($scope.response);
      // $state.go('memoryform', {memoryId: $scope.response.id});
    });
  };
})
.controller('MapCtrl', function($scope, $state, $cordovaGeolocation, $http, AuthService) {
  $scope.logout = function() {
    AuthService.logout();
    $state.go('login');
  };

  var options = {timeout: 10000, enableHighAccuracy: true};
  
  $cordovaGeolocation.getCurrentPosition(options).then(function(position){
    function pinSymbol(color) {
      return {
        path: 'M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z M -2,-30 a 2,2 0 1,1 4,0 2,2 0 1,1 -4,0',
        fillColor: color,
        fillOpacity: 1,
        strokeColor: '#000',
        strokeWeight: 2,
        scale: 1,
      };
    }

    $http.get('http://localhost:3000/api/v1/my_memories/user_memories/'+ parseInt(window.localStorage.getItem('user_info'))).then(function(all_memories){
      angular.forEach(all_memories.data, function(value, key) {
        console.log(value);
        var latLng = new google.maps.LatLng(value.locations[0].lat, value.locations[0].log);
        var marker = new google.maps.Marker({
          map: $scope.map,
          animation: google.maps.Animation.DROP,
          position: latLng,
          title: value.title,
          icon: pinSymbol(value.theme_color)
        });
      
      });
    });

    var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
 
    var mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
 
    $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);
    
    $scope.unaddedMarker  = false;

    google.maps.event.addListenerOnce($scope.map, 'idle', function(){
      var marker = new google.maps.Marker({
          map: $scope.map,
          animation: google.maps.Animation.DROP,
          position: latLng
      });      
     
      var infoWindow = new google.maps.InfoWindow({
          content: "Here I am!"
      });
     
      console.log(AuthService.username());
      function placeMarker(location) {
        $scope.unaddedMarker = true;
        var marker = new google.maps.Marker({
          map: $scope.map,
          animation: google.maps.Animation.DROP,
          position: location
        });
        if ( marker ) {
          marker.setPosition(location);
          $scope.marker = marker;
        } else {
          marker = new google.maps.Marker({
            position: location,
            map: map
          });
        }
      }

      google.maps.event.addListener(marker, 'click', function () {
          infoWindow.open($scope.map, marker);
      });

      google.maps.event.addListener($scope.map, 'click', function(event) {
        if(!$scope.unaddedMarker){
          console.log(event.latLng);
          placeMarker(event.latLng);
        } else{
          alert("First add selected location in your memory.");
        }
      });
       
    }); 
    
  }, function(error){
    console.log("Could not get location");
  });

  
  $scope.addMemory = function(){
    var username = parseInt(window.localStorage.getItem('user_info'));
    console.log(username);
    var lat = $scope.marker.position.lat();
    var lng = $scope.marker.position.lng();

    var my_memory = {
      locations_attributes: [{
        lat: lat, 
        log: lng, 
        name:""
      }],
      theme_id: 1, 
      user_id: username
    };

    url = 'http://localhost:3000/api/v1/my_memories';
    $http.post(url, {my_memory: my_memory}).then(function (res){
      $scope.response = res.data;
      $state.go('memoryform', {memoryId: $scope.response.id});
    });
  };

  //Wait until the map is loaded
  
});
