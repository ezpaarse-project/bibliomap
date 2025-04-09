/* eslint-disable no-unused-vars */

const legendData = [
  {
    name: 'UL',
    desc: {
      fr: 'Université de Lorraine',
      en: 'Université de Lorraine',
    },
    color: '#FFC03F',
    logo: '/themes/ul/images/logo.svg',
    link: 'http://bu.univ-lorraine.fr/ressources/ressources-en-ligne',
  },
];

/**
 * filter informations receive
 * @param {*} ec
 */

function filter(ec) {
  return ec.ezproxyName;
}

/**
 * init counter of rtype and mime
 */
function init() {
  initTotalCounter([
    {
      name: 'HTML',
      color: '#d35400',
    },
    {
      name: 'PDF',
      color: '#c0392b',
    },
  ]);

  initCounter([
    {
      name: 'HTML',
      color: '#d35400',
    },
    {
      name: 'PDF',
      color: '#c0392b',
    },
  ]);
  displayTooltip = true;
  filterParameter = true;
}
