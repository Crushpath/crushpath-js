// Crushpath geolocate jQuery component
// Requires Google Maps API jQuery

(function ($) {
  $.geolocate = function(options) {
    this.locationCanceled = false;

    var defaultOptions = {
      onLoading: function() {},
      onComplete: function() {},
      onCancel: function() {},
      addressToReverseLookup: null,
      latituteInput: '',
      longitudeInput: '',
      formatedAddressInput: '',

      cityInput: '',
      stateInput: '',
      addressInput: '',
      countryInput: '',
      postalCodeInput: ''
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
            var components = results[1].address_components;
            var parsed_components = {};

            // first set the one field to rule them all
            $(settings.formatedAddressInput).val((results[1].formatted_address));

            // go through components and find different pieces needed
            $.each(components, function(i, component) {
              if (~$.inArray('country',component.types) && !parsed_components.country) {
                parsed_components.country = component.long_name;
              }
              if (~$.inArray('locality',component.types) && !parsed_components.city) {
                parsed_components.city = component.long_name;
              }
              if (~$.inArray('administrative_area_level_1',component.types) && !parsed_components.state) {
                parsed_components.state = component.long_name;
              }
              if (~$.inArray('route',component.types) && !parsed_components.route) {
                parsed_components.route = component.long_name;
              }
              if (~$.inArray('street_number',component.types) && !parsed_components.street_number) {
                parsed_components.street_number = component.long_name;
              }
              if (~$.inArray('postal_code',component.types) && !parsed_components.postal_code) {
                parsed_components.postal_code = component.long_name;
              }
            });

            // combine route and street_number if possible
            if (parsed_components.street_number) {
              parsed_components.address = parsed_components.street_number;
            }
            if (parsed_components.route) {
              parsed_components.address = parsed_components.street_number + " " + parsed_components.route;
            }

            // set individual fields per options
            if (parsed_components.address) {
              $(settings.addressInput).val((parsed_components.address));
            }
            if (parsed_components.city) {
              $(settings.cityInput).val((parsed_components.city));
            }
            if (parsed_components.state) {
              $(settings.stateInput).val((parsed_components.state));
            }
            if (parsed_components.country) {
              $(settings.countryInput).val((parsed_components.country));
            }
            if (parsed_components.postal_code) {
              $(settings.postalCodeInput).val((parsed_components.postal_code));
            }

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

      if (settings.addressToReverseLookup && settings.addressToReverseLookup.length > 0){
          var geocoder = new google.maps.Geocoder();
          geocoder.geocode({'address': settings.addressToReverseLookup, 'sensor' : false}, function(results, status) {
              if (status == google.maps.GeocoderStatus.OK) {
                  var firstResults = results[0];
                  if (firstResults && firstResults.geometry && firstResults.geometry.location) {
                      $(settings.latituteInput).val(firstResults.geometry.location.lat);
                      $(settings.longitudeInput).val(firstResults.geometry.location.lng);
                  }
              }
          });

      } else if (navigator.geolocation) {
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
