angular.module('ingr-web').service('instagram', function ($http, viewport, zoom, apiUrls, images, ad, $cookies) {
  'use strict';
  
  var instagram = {
    getPictures: function(successCallback, errorCallback) {
      var byLocation = apiUrls.byLocation;
      byLocation = byLocation.replace('{latitude}', viewport.latitude);
      byLocation = byLocation.replace('{longitude}', viewport.longitude);
      byLocation = byLocation.replace('{zoomlevel}', zoom.radius(viewport.zoomLevel));
      
      //var min = '2015-01-31T17:00:00.000+01:00';
      //var max = '2015-01-31T17:01:00.000+01:00';
      
      byLocation = byLocation.replace('{minTs}', '');//Date.parse(min)/1000);
      byLocation = byLocation.replace('{maxTs}', '');//Date.parse(max)/1000);
      
      var url = apiUrls.base + byLocation;
      var access_token = '';

      url += '/';
      if (!!$cookies.instagrannarat){
        url += $cookies.instagrannarat;
      }
      else {
        url += '-';
      }

      $http({method: 'GET', url: url}).
        success(function(data, status, headers, config) {
          images.data = data;
          if (!!data && data.length > 0) {
            var adPosition = ad.randomPosition(data.data.length);
            data.data.splice(adPosition, 0, ad.getAd());
          }
          successCallback(data, status, headers, config);
        }).
        error(function(data, status, headers, config) {
          errorCallback(data, status, headers, config);
        });
    },
    getPicture: function(id, successCallback, errorCallback) {
      var byId = apiUrls.byId;
      byId = byId.replace('{id}', id);
      
      var url = apiUrls.base + byId;
      var access_token = '';

      url += '/';
      if (!!$cookies.instagrannarat){
        url += $cookies.instagrannarat;
      }
      else {
        url += '-';
      }

      $http({method: 'GET', url: url}).
        success(function(data, status, headers, config) {
          images.data[id] = data.data;
          successCallback(data, status, headers, config);
        }).
        error(function(data, status, headers, config) {
          errorCallback(data, status, headers, config);
        });
    }
  };

  return instagram;
});