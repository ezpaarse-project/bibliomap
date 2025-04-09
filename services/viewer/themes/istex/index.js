/* eslint-disable no-unused-vars */

const legendData = [
  {
    name: 'TDM',
    desc: {
      fr: 'Fouille de texte',
      en: 'Text data mining',
    },
    color: '#62ae25',
  },
  {
    name: 'DOCUMENTAIRE',
    color: '#007e94',
  },
  {
    name: 'OTHER',
    color: '#9c126d',
  },
];

/**
 * filter informations receive
 * @param {*} ec
 */
function label(ec) {
  const tdm = ['istex-api-harvester', 'node-istex'];
  const documentaire = [
    'google', // résolveur de lien de Google Scholar
    'ebsco', // résolveur de lien d'EBSCO (FTF)
    'smash', // résolveur de lien de Aix-Marseille
    'istex-view',
    'istex-browser-addon',
    'istex-api-demo',
    'istex-widgets',
  ];
  if (ec.sid) {
    if (tdm.includes(ec.sid)) {
      return 'TDM';
    }
    if (documentaire.includes(ec.sid)) {
      return 'DOCUMENTAIRE';
    }
  }
  return 'OTHER';
}

/**
 * init counter of rtype and mime
 */
function init() {
  initTotalCounter([
    {
      name: 'JSON',
      color: '#3498db',
    },
    {
      name: 'ARTICLE',
    },
  ]);
  initCounter([
    {
      name: 'JSON',
      color: '#3498db',
    },
    {
      name: 'ARTICLE',
    },
  ]);
  displayTooltip = true;
  filterParameter = false;
}
