/* eslint-disable no-unused-vars */
/**
 * information about CNRS institute on legend
 */

const totalCount = {};
let displayOutsideMap = true;
let showTitles = false;

// eslint-disable-next-line prefer-const
let editors = {};
let map = '';
let outsideMap = '';
let zoom = 6;
const franceCenter = [46.3630104, 2.9846608];
const lightenMap = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const darkenMap = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
/**
 * Init the background map and the outside map
 */
function initMaps() {
  map = L.map('bibliomap-canvas', {
    minZoom: 3,
    maxZoom: 8,
    zoomControl: false,
  }).setView(franceCenter, zoom);

  L.tileLayer(lightenMap, {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  L.control.zoom({
    position: 'topright',
  }).addTo(map);

  map.on('dragend', () => {
    const mapCenterLng = map.getCenter().lng;
    const nbMap = (Math.round(((mapCenterLng) / 360)));

    Object.keys(map._layers).forEach((element) => {
      const layer = map._layers[element];
      if (layer._latlng) {
        const nbMapBulle = (Math.round((layer._latlng.lng) / 360));
        const lng = layer._latlng.lng + ((nbMap - nbMapBulle) * 360);
        layer.setLatLng([layer._latlng.lat, lng]).update();
      }
    });
  });

  outsideMap = L.map('outside-map', {
    minZoom: 2,
    maxZoom: 4,
    doubleClickZoom: false,
    zoomControl: false,
  }).setView([0, 0], 4);

  L.tileLayer(lightenMap).addTo(outsideMap);

  L.control.zoom({
    position: 'topleft',
  }).addTo(outsideMap);

  outsideMap.on('click', () => {
    const oldZoom = map.getZoom();
    map.flyTo(outsideMap.getCenter(), oldZoom);
    $('#outside-map').removeClass('fadeIn');
  });
}

/**
 * filter URL for expo mode
 * @param * variable
 */
function getQueryVariable(variable) {
  const query = window.location.search.substring(1);
  const vars = query.split('&');
  let res;
  for (let i = 0; i < vars.length; i += 1) {
    const pair = vars[i].split('=');
    if (pair[0] === variable) {
      res = (pair.length > 1 ? pair[1] : true);
    }
  }
  return res;
}

/**
 * Start timer when you arrive on Bibliomap
 */
function timer() {
  let time = 0;
  setInterval(() => {
    const tmp = (time / 3600);
    const days = Math.floor(tmp / 24);
    const hours = Math.floor(tmp % 24);
    const minutes = Math.floor((time / 60) % 60);
    const seconds = (time % 60);
    document.getElementById('Timer').innerHTML = `${days}j ${hours}h ${minutes}m ${seconds}s`;
    time += 1;
  }, 1000);
}
/**
 * Init the parameters given in the url
 */
function initUrlParameters() {
  minimap = getQueryVariable('m') || getQueryVariable('minimap');
  const title = getQueryVariable('t') || getQueryVariable('title');
  const enabledCounters = getQueryVariable('c') || getQueryVariable('counters');
  const enabledEditors = getQueryVariable('editors') || getQueryVariable('ed');
  const description = getQueryVariable('d') || getQueryVariable('description');
  const setZoom = getQueryVariable('z') || getQueryVariable('zoom');

  if (minimap === 'false') {
    $('#outside-map-switch').prop('checked', false);
    $('#outside-map-switch').trigger('change');
  }
  if (title === 'true') {
    $('#show-titles').prop('checked', true);
    $('#show-titles').trigger('change');
  }
  if (enabledCounters) {
    legendData.forEach((portal) => {
      $(`#${portal.name}-switch`).prop('checked', false);
      $(`#${portal.name}-switch`).trigger('change');
    });
    const tabCounters = enabledCounters.split(',');
    tabCounters.forEach((el) => {
      el = el.toUpperCase();
      let i = 0;
      let find = false;
      while (i < legendData.length && !find) {
        if (el === legendData[i].name) {
          $(`#${el}-switch`).prop('checked', true);
          $(`#${el}-switch`).trigger('change');
          find = true;
        } else {
          i += 1;
        }
      }
    });
  }
  if (enabledEditors) {
    const tabEditors = enabledEditors.split(',');
    edChips = M.Chips.getInstance($('#enabled-editors'));
    tabEditors.forEach((el) => {
      edChips.addChip({
        tag: el,
      });
    });
  }

  if (description === 'false') {
    $('#description').modal('destroy');
  }

  if (setZoom) {
    zoom = setZoom;
    map.setZoom(zoom);
  }
}
/**
 * Init the message when you arrive on Bibliomap
 * with the demo mode, it appear in a regular rhythm
 */
function initBrand() {
  $('.modal').modal({
    opacity: 0,
  });
  const expo = getQueryVariable('expo') || getQueryVariable('e');
  if (!expo) {
    $('#description').modal('open');
  }

  if (expo) {
    // add /?expo=<showDuration>,<hideDuration> at the end of the url to have custom durations
    // or add /?expo=true to have the default durations

    // default durations when expo=true
    let showDuration = 60000;
    let hideDuration = 60000 * 15;
    if (typeof expo === 'string') {
      const durations = expo.split(',');
      showDuration = (parseInt(durations[0], 10) * 1000) || showDuration;
      hideDuration = (parseInt(durations[1], 10) * 1000) || hideDuration;

      (function displayCycle() {
        $('#description').modal('open');
        $('#description-content').scrollTop(0);
        setTimeout(() => {
          $('#description-content').animate({ scrollTop: $('#description')[0].scrollHeight }, 3000);
          setTimeout(() => {
            $('.modal').modal('close');

            setTimeout(displayCycle, hideDuration);
          }, showDuration / 2);
        }, showDuration / 2);
      }());
    }
  }
  $('#brand').on('click', () => {
    $('#description').modal('open');
  });
}

/**
 * add evenement for button and update the DOM
 */
function initLegend() {
  const content = $('#legend');
  let locale = getQueryVariable('lang') || 'fr';
  if (locale !== 'en' && locale !== 'fr') {
    locale = 'fr';
  }
  // for each institutes
  legendData.forEach((portal) => {
    portal.isDisabled = false;
    let portalLogo = (`<img src="${portal.logo}" class="circle bibliomap-clear-circle"></img>`);
    if (!portal.logo) {
      portalLogo = (`<div class = "logoDefault" style = "background-color: ${portal.color}"></div>`);
    }
    let portalLink = (`<a href="${portal.link}" id="${portal.name}-tooltip" data-position="right" data-tooltip="" target="_blank">`);
    if (!portal.link) {
      portalLink = (`<a id="${portal.name}-tooltip" data-position="right" data-tooltip="">`);
    }
    content.append(`${portalLink}
      <li id="${portal.name}-legend" class="collection-item avatar bibliomap-collection-item">
        ${portalLogo}
        <span id="${portal.name}-counter" class="bibliomap-counter" style="background-color: ${portal.color}">${portal.count || 0}</span>
        <span class="title bibliomap-institut-title">${(portal.name)}</span>
        <p class="bibliomap-institut-desc">${portal.desc ? portal.desc[locale] : ''}</p>
      </li>
    </a>`);

    $('#disabled').append(`
    <div class="col s6">
      <label>
        <input id="${portal.name}-switch" type="checkbox" checked="checked" />
        <span>${portal.name}</span>
      </label>
    </div>`);

    // update legend with filter
    $(`#${portal.name}-switch`).on('change', (el) => {
      if (el.currentTarget.checked && portal.isDisabled) {
        portal.isDisabled = !portal.isDisabled;
        $(`#${portal.name}-legend`).css('display', 'block');
        totalCounters.forEach((c) => {
          totalCount[c] += portal[c];
          const element = totalCounterElements.find(tce => tce.name === c);
          $(`${element.id}`).html(totalCount[element.name].toLocaleString());
        });
      }

      if (!el.currentTarget.checked && !portal.isDisabled) {
        $(`#${portal.name}-legend`).css('display', 'none');
        $(`#${portal.name}-counter`).html(portal.count);
        portal.isDisabled = !portal.isDisabled;
        totalCounters.forEach((c) => {
          if (totalCount[c] >= 0) {
            totalCount[c] -= portal[c];
            const element = totalCounterElements.find(tce => tce.name === c);
            $(`${element.id}`).html(totalCount[element.name].toLocaleString());
          }
        });
      }
    });
  });

  $('.sidenav').sidenav({
    isFixed: false,
    isOpen: true,
  });

  const translateXLegend = $('.sidenav').css('transform').split(/[()]/)[1].split(',')[4];
  if (parseInt(translateXLegend, 10) < 0) {
    $('#live').removeClass('liveWithLegend').addClass('liveWithoutLegend');
  }

  if (parseInt(translateXLegend, 10) >= 0) {
    $('#live').removeClass('liveWithoutLegend').addClass('liveWithLegend');
  }

  $('#close-side').on('click', () => {
    $('.sidenav').sidenav('close');
    $('#live').removeClass('liveWithLegend').addClass('liveWithoutLegend');
  });
  $('#open-side').on('click', () => {
    $('.sidenav').sidenav('open');
    $('#live').removeClass('liveWithoutLegend').addClass('liveWithLegend');
  });
}

/**
 * update the background
 * @param {Map} m
 */
function changeMap(m) {
  const layer = m._layers[Object.keys(m._layers)[0]];
  if (layer._url === lightenMap) {
    layer._url = darkenMap;
    return layer.redraw();
  }
  if (layer._url === darkenMap) {
    layer._url = lightenMap;
    return layer.redraw();
  }
  return null;
}

/**
 * init evenement on menu
 */
function initMenu() {
  $('.fixed-action-btn').floatingActionButton({
    hoverEnabled: false,
    direction: 'top',
  });
  $('#center').on('click', () => {
    map.flyTo(franceCenter, zoom);
  });
  $('.tooltipped').tooltip();
  $('select').formSelect();
  $('#outside-map-switch').on('change', (el) => {
    if (el.currentTarget.checked) {
      displayOutsideMap = true;
    } else {
      displayOutsideMap = false;
      $('#outside-map').removeClass('fadeIn');
    }
  });
  $('#show-titles').on('change', (el) => {
    if (el.currentTarget.checked) {
      showTitles = true;
    } else {
      showTitles = false;
    }
  });
  $('#institute-all').on('click', () => {
    legendData.forEach((portal) => {
      $(`#${portal.name}-switch`).prop('checked', true);
      $(`#${portal.name}-switch`).trigger('change');
    });
  });
  $('#institute-none').on('click', () => {
    legendData.forEach((portal) => {
      $(`#${portal.name}-switch`).prop('checked', false);
      $(`#${portal.name}-switch`).trigger('change');
    });
  });
  if ($('.chips-autocomplete').length) {
    $('.chips-autocomplete').chips({
      placeholder: 'ex: Wiley',
      autocompleteOptions: {
        data: editors,
        limit: Infinity,
        minLength: 1,
      },
    });
  }
  // eslint-disable-next-line consistent-return
  $('#changeMap').on('click', () => {
    changeMap(map);
    changeMap(outsideMap);
  });
}

/**
 * init css for each annimation bubble
 */
function initCSS() {
  legendData.forEach((portal) => {
    const css = `.${portal.name} { background-color: ${portal.color} !important; } .${portal.name}:after { box-shadow: 0 0 6px 2px ${portal.color} !important; }`;
    const el = document.createElement('style');
    if (el.styleSheet) {
      el.styleSheet.cssText = css;
    } else {
      el.appendChild(document.createTextNode(css));
    }
    document.getElementsByTagName('head')[0].appendChild(el);
  });
}

/**
 * Initializatton of all parts
 */
$(document).ready(() => {
  initMaps();
  initBrand();
  initLegend();
  initMenu();
  initCSS();
  timer();
  initUrlParameters();
});
