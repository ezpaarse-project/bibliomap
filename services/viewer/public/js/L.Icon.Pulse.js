$(document).ready(() => {
  L.Icon.Pulse = L.DivIcon.extend({
    options: {
      className: '',
      class: '',
      iconSize: [12, 12],
      fillColor: 'red',
      color: 'red',
      animate: true,
      heartbeat: 1,
    },
    initialize(options) {
      L.setOptions(this, options);
      // apply css class
      this.options.className = `leaflet-pulsing-icon ${this.options.class}`;

      // initialize icon
      L.DivIcon.prototype.initialize.call(this, options);
    },
  });

  L.icon.pulse = options => new L.Icon.Pulse(options);

  L.Marker.Pulse = L.Marker.extend({
    initialize(latlng, options) {
      options.icon = L.icon.pulse(options);
      L.Marker.prototype.initialize.call(this, latlng, options);
    },
  });
  L.marker.pulse = (latlng, options) => new L.Marker.Pulse(latlng, options);
});
