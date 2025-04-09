/* eslint-disable no-unused-vars */

const legendData = [
  {
    name: 'INSB',
    color: '#9c126d',
    logo: '/themes/cnrs/images/bibcnrs-logo-biologie.png',
    link: 'https://bib.cnrs.fr/category/biologie/',
    desc: {
      fr: 'Biologie',
      en: 'Biology',
    },
  },
  {
    name: 'INC',
    color: '#007e94',
    logo: '/themes/cnrs/images/bibcnrs-logo-chimie.png',
    link: 'https://bib.cnrs.fr/category/chimie/',
    desc: {
      fr: 'Chimie',
      en: 'Chemistry',
    },
  },
  {
    name: 'INEE',
    color: '#62ae25',
    logo: '/themes/cnrs/images/bibcnrs-logo-ecologie.png',
    link: 'https://bib.cnrs.fr/category/ecologie/',
    desc: {
      fr: 'Ecologie & Environnement',
      en: 'Ecology & Environment',
    },
  },
  {
    name: 'INSHS',
    color: '#820e12',
    logo: '/themes/cnrs/images/bibcnrs-logo-homme.png',
    link: 'https://bib.cnrs.fr/category/homme/',
    desc: {
      fr: 'Homme & Société',
      en: 'People & Society',
    },
  },
  {
    name: 'INSIS',
    color: '#d4002d',
    logo: '/themes/cnrs/images/bibcnrs-logo-ingenierie.png',
    link: 'https://bib.cnrs.fr/category/ingenierie/',
    desc: {
      fr: 'Ingénierie & Systèmes',
      en: 'Engineering & Systems',
    },
  },
  {
    name: 'INSMI',
    color: '#547d3d',
    logo: '/themes/cnrs/images/bibcnrs-logo-mathematiques.png',
    link: 'https://bib.cnrs.fr/category/mathematiques/',
    desc: {
      fr: 'Mathématiques',
      en: 'Mathematics',
    },
  },
  {
    name: 'IN2P3',
    color: '#e75113',
    logo: '/themes/cnrs/images/bibcnrs-logo-nucleaire.png',
    link: 'https://bib.cnrs.fr/category/nucleaire/',
    desc: {
      fr: 'Nucléaire & Particules',
      en: 'Nuclear & Particles',
    },
  },
  {
    name: 'INP',
    color: '#004494',
    logo: '/themes/cnrs/images/bibcnrs-logo-physique.png',
    link: 'https://bib.cnrs.fr/category/physique/',
    desc: {
      fr: 'Physique',
      en: 'Physical',
    },
  },
  {
    name: 'INS2I',
    color: '#562a84',
    logo: '/themes/cnrs/images/bibcnrs-logo-information.png',
    link: 'https://bib.cnrs.fr/category/information/',
    desc: {
      fr: 'Sciences de l\'information',
      en: 'Science of information',
    },
  },
  {
    name: 'INSU',
    color: '#cc2381',
    logo: '/themes/cnrs/images/bibcnrs-logo-terre.png',
    link: 'https://bib.cnrs.fr/category/terre/',
    desc: {
      fr: 'Terre & Univers',
      en: 'Earth & Universe',
    },
  },
];

/**
 * filter informations receive
 * @param {*} ec
 */
function label(ec) {
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
