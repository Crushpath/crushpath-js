(function ($) {
  $.geolocate = function(options) {
    this.locationCanceled = false;

    var defaultOptions = {
      onLoading: function() {},
      onComplete: function() {},
      onCancel: function() {},
      latituteInput: '',
      longitudeInput: '',
      formatedAddressInput: ''
    };

    var settings = $.extend(defaultOptions, options);

    var cancelLocation = function(error) {
      clearCoordinates();
      this.locationCanceled = true;
      settings.onCancel.call(this);
    }

    var setLocation = function(position) {
      if (this.locationCanceled) {
        return;
      }

      var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      setCoordinates(pos);

      var geocoder = new google.maps.Geocoder();
      geocoder.geocode({'latLng': pos}, function(results, status) {

        settings.onComplete.call(this);
        if (status == google.maps.GeocoderStatus.OK) {
          if (results[1]) {
            $(settings.formatedAddressInput).val((results[1].formatted_address));
            return;
          }
        }
      });
    }

    function setCoordinates(pos) {
      $(settings.latituteInput).val(pos.lat());
      $(settings.longitudeInput).val(pos.lng());
    }


    function clearCoordinates() {
      $(settings.latituteInput, settings.longitudeInput).remove();
    }

    function getLocation() {
      if (this.locationCanceled) {
        return;
      }

      if (navigator.geolocation) {
        settings.onLoading.call(this);
        navigator.geolocation.getCurrentPosition(
          setLocation,
          cancelLocation,
          { enableHighAccuracy: false,
            timeout:10000
          }
        );
      }
    }

    getLocation();

    return {
      cancel: function() {
        settings.onCancel.call(this);
      },
      locationCanceled: this.locationCanceled
    }
  }

}(jQuery));
