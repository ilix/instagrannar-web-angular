angular.module('ingr-web').service('instagram', function ($http, viewport, zoom, apiUrls) {
  'use strict';

  var instagram = {
    getPictures: function(successCallback, errorCallback) {
      var byLocation = apiUrls.byLocation;
      byLocation = byLocation.replace('{latitude}', viewport.latitude);
      byLocation = byLocation.replace('{longitude}', viewport.longitude);
      byLocation = byLocation.replace('{zoomlevel}', zoom.radius(viewport.zoomLevel));

      var url = apiUrls.base + byLocation;

      $http({method: 'GET', url: url}).
        success(function(data, status, headers, config) {
          successCallback(data, status, headers, config);
        }).
        error(function(data, status, headers, config) {
          errorCallback(data, status, headers, config);
        });
    }
  };

  return instagram;
});