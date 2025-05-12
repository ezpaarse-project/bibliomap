<template>
  <div class="drawer-elements-container">
    <div>
      <v-list-item>
        <v-card>
          <v-card-title
            class="text-h4 justify-center"
            style="white-space: normal; overflow: visible;"
          >"La recherche ne s'arrête jamais"</v-card-title>
          <v-card-text>
            <strong>BiblioMap</strong> reflète les consultations en direct des membres du <a href="http://www.cnrs.fr/fr/organisme/presentation.htm">CNRS</a> des ressources numériques via le portail <a href="https://bib.cnrs.fr/">bibCNRS</a>. Cet outil numérique mis à leur disposition permet d’accéder au texte intégral des articles de plusieurs milliers de revues scientifiques électroniques et à des bases de données bibliographiques.
          </v-card-text>
        </v-card>
      </v-list-item>
      <v-list-item>
        <v-card>
          <a href="https://bib.cnrs.fr/">
            <img class="bibcnrs-img" src="@/assets/bibCnrs.png">
          </a>
          <v-card-text
            class="text-caption text-center"
            style="white-space: normal; overflow: visible;"
          >
            Les plateformes des portails d’accès spécialisés sont gérées par l'<a href="http://www.inist.fr/">Inist-CNRS</a>.
          </v-card-text>
        </v-card>
      </v-list-item>
      <v-list-item>
        <div class="ez-logos">
          <a href="http://ezpaarse.couperin.org/"><img src="@/assets/logo-ezpaarse.png"></a>
          <a href="http://analogist.couperin.org/"><img src="@/assets/logo-analogist.png"></a>
        </div>
        <v-card-text>
          Les visualisations disponibles dans <a href="https://github.com/ezpaarse-project/bibliomap">BiblioMap</a> sont rendues possible par l’utilisation d’<a href="http://ezpaarse.couperin.org/">ezPAARSE</a>, un <a href="https://github.com/ezpaarse-project/ezpaarse">logiciel libre</a> développé conjointement par <a href="http://www.couperin.org/presentation">COUPERIN</a>, l'<a href="http://www.inist.fr/">INIST-CNRS</a> et l’<a href="http://www.univ-lorraine.fr/">Université de Lorraine</a> comme site pilote. <a href="http://analogist.couperin.org/">AnalogIST</a> est le portail collaboratif de l’Enseignement Supérieur et Recherche dédié à la problématique de la mesure des usages des ressources électroniques. Les développements associés à cette collaboration sont disponibles sous forme de logiciel libre au sein d’<a href="https://github.com/ezpaarse-project/">ezPAARSE-project</a>.
        </v-card-text>
      </v-list-item>
      <v-list-item>
        <v-card-text>Remarque : la localisation des consultations apparaissant sur la carte est volontairement approximative.</v-card-text>
      </v-list-item>
      <v-list-item>
        <div class="org-logos">
          <a href="http://www.couperin.org/"><img src="@/assets/logo-couperin.jpg"></a>
          <a href="http://www.cnrs.fr/"><img src="@/assets/logo.svg"></a>
          <a href="http://www.univ-lorraine.fr/"><img src="@/assets/logo-universite-de-lorraine.png"></a>
        </div>
      </v-list-item>
    </div>
  </div>
</template>

<style lang="scss">

  a{
    color: #039be5;
    text-decoration: none;
  }

  .bibcnrs-img{
    max-width: 90%;
    height: auto;
    display: block;
    margin: 1.5em auto;
  }
  .ez-logos{
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    align-items: center;
    margin: 1em 0;

    a img{
      max-width: 70%;
      height: auto;
      display: block;
      margin: 0 auto;
    }
  }
  .org-logos{
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    align-items: center;
    margin: 1em 0;

    a {
      width: 100%;
      img{
        max-width: 70%;
        height: auto;
        display: block;
        margin: 0 auto;
      }
    }
  }
</style>
