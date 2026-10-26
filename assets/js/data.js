/* Ton chemin de vie : toutes les données de la maquette en un seul fichier.
   Les Journées sont triées automatiquement entre « à venir » et « déjà parcourues ».
   Pour ajouter une Journée : copier un bloc, changer la date (heure de Bruxelles) et les textes. */

window.TCV = {
  contact: {
    nom: 'Joëlle Tay',
    activite: 'Magnétiseuse, énergéticienne et radiesthésiste',
    rue: 'Rue du Craetveld 103',
    cp: '1120 Bruxelles',
    quartier: 'Neder-Over-Heembeek',
    tel: '0495 031 667',
    telLien: '+32495031667',
    whatsapp: '32495031667',
    email: 'joelletay-tonchemindevie@jtcommunication.be',
    emailFormations: 'formations-tonchemindevie@jtcommunication.be',
    facebook: 'https://www.facebook.com/toncheminbyJoelleTay',
    instagram: 'https://www.instagram.com/tonchemindevie_bxl_energies/',
    entreprise: 'BE0830.084.824',
    horaires: null /* à compléter : les soins se font uniquement sur rendez-vous */
  },

  tarifs: {
    premier: { prix: 100, duree: '1h45', minutes: 105 },
    suivant: { prix: 85, duree: '1h30', minutes: 90 },
    seances: '3 à 5 séances pour la plupart des personnes',
    intervalle: 'quelques semaines entre deux séances',
    lieu: null /* nettoyage de lieu : tarif à compléter */
  },

  salle: {
    nom: 'Espace Ressources des 3 Tilleuls',
    rue: 'Avenue Wiener 106',
    cp: '1170 Bruxelles',
    commune: 'Watermael-Boitsfort',
    acces: 'Desservi par les transports en commun, stationnement gratuit le dimanche.'
  },

  journeeType: {
    horaire: '9h30 à 17h30',
    jauge: { min: 6, max: 8 },
    prix: 120,
    prixReduit: 90,
    reduit: 'étudiants et personnes sans emploi',
    compris: 'Petite attention, boissons et collations comprises (lunch non compris).'
  },

  journees: [
    {
      id: 'hypersensibilite',
      titre: 'Hypersensibilité et gestion des émotions',
      sousTitre: 'Clés pour l’harmonie intérieure',
      date: '2026-11-01T09:30:00+01:00', fin: '2026-11-01T17:30:00+01:00',
      image: 'journees/provisoire-hypersensibilite', provisoire: true,
      accroche: 'Vous arrive-t-il de ressentir intensément l’ambiance d’une pièce, le stress des autres ou de tout prendre à cœur ? Vos émotions sont parfois si intenses qu’elles vous épuisent ?',
      intention: 'Un voyage immersif : un espace bienveillant et sécurisant pour vous déposer, comprendre votre fonctionnement unique et faire de vos émotions des alliées précieuses.',
      programme: 'Ce que sont les émotions et l’hypersensibilité, les différents types d’hypersensibilité, une multitude d’astuces pour ne pas se laisser submerger. Activités ludiques, détente, relaxation, partage bienveillant, un protocole libératoire et un soin énergétique pour retrouver votre harmonie intérieure.',
      envoi: 'Transformer votre sensibilité en une véritable force au quotidien, le corps et l’esprit plus légers.'
    },
    {
      id: 'ancrage',
      titre: 'L’art de l’Ancrage',
      sousTitre: 'Se sentir solide et stable face aux aléas du quotidien',
      date: '2027-01-24T09:30:00+01:00', fin: '2027-01-24T17:30:00+01:00',
      image: 'journees/toile-ancrage', toile: true,
      accroche: 'Revenir dans l’instant présent, habiter son corps et retrouver sa sécurité intérieure.',
      intention: 'Dans un espace bienveillant, nous alternerons échanges, introspection, exercices et libération. Chacun repart avec une fiche mémo pleine d’astuces pour poursuivre sur cet élan.',
      programme: 'Un temps d’échange sur le véritable enracinement, un test personnalisé pour évaluer votre ancrage, un exercice de respiration pour ramener l’énergie vers le bas, un moment d’écoute intérieure sur vos propres freins, un tirage d’oracle et diverses activités. Chaque participant prépare son propre protocole libératoire ; la journée se clôture par un rituel et un soin énergétique profond.',
      envoi: 'Pour bien vivre sa vie, gagner en sérénité et ne pas se laisser perturber par les énergies extérieures, l’ancrage est essentiel.'
    },
    {
      id: 'carences',
      titre: 'S’affranchir des carences affectives',
      sousTitre: 'Briser le cycle des schémas amoureux douloureux',
      date: '2027-04-18T09:30:00+02:00', fin: '2027-04-18T17:30:00+02:00',
      image: 'grok/journees-carences-1x1',
      accroche: 'Avez-vous l’impression de revivre inlassablement les mêmes scénarios douloureux en amour ? Vous donnez-vous corps et âme jusqu’à vous oublier, par peur du rejet ou de l’abandon ?',
      intention: 'Une journée conçue pour réparer votre vase intérieur, briser le cycle des schémas répétitifs et ne plus dépendre de l’extérieur pour vous sentir aimé(e).',
      programme: 'Des échanges authentiques, des prises de conscience et des activités réconfortantes en petit comité. Un protocole de libération ciblé pour couper les liens énergétiques d’interdépendance et nettoyer les mémoires de manque ou de rejet, puis un soin énergétique pour harmoniser les chakras racine, cœur et plexus solaire et vous reconnecter à votre propre source d’amour.',
      envoi: 'Cesser de quémander l’amour, remplir votre réservoir intérieur et attirer des relations saines et équilibrées.'
    },
    {
      id: 'charge-mentale',
      titre: 'Charge mentale et lâcher prise',
      sousTitre: 'Oser se donner la priorité sans culpabiliser',
      date: '2027-05-16T09:30:00+02:00', fin: '2027-05-16T17:30:00+02:00',
      image: 'grok/journees-charge-mentale-1x1',
      accroche: 'Avez-vous l’impression de porter le monde sur vos épaules, de devoir penser à tout et tout contrôler ? Une fatigue nerveuse à force de faire passer les urgences des autres avant votre bien-être ?',
      intention: 'Une véritable pause énergétique pour vider le trop-plein, relâcher la pression et vous accorder le droit de souffler.',
      programme: 'Des échanges bienveillants en petit comité, des activités ludiques et des prises de conscience pour désamorcer le besoin de trop porter. Un protocole de libération pour déprogrammer la tendance à la perfection et dissoudre la culpabilité liée au repos, puis un soin énergétique pour apaiser, relâcher les tensions accumulées et retrouver calme et paix intérieure.',
      envoi: 'Déposer les fardeaux qui ne vous appartiennent pas et vous autoriser à exister pour vous-même, en toute sérénité.'
    },
    {
      id: 'amour-de-soi',
      titre: 'Apprendre à s’aimer à sa juste valeur',
      sousTitre: 'Amour inconditionnel de soi-m’aime',
      date: '2027-06-27T09:30:00+02:00', fin: '2027-06-27T17:30:00+02:00',
      image: 'journees/toile-amour-de-soi', toile: true,
      accroche: 'Savez-vous combien vous êtes unique ? Vous avez tendance à vous comparer, à vous sous-estimer, à surestimer les autres ? Cette Journée est faite pour vous.',
      intention: 'Un voyage intérieur pour libérer le manque de confiance et d’estime de soi, et rayonner.',
      programme: 'Des échanges authentiques, de la relaxation, des petits exercices. En fin de matinée, un protocole de libération suivi d’un soin énergétique axé sur la confiance et l’estime de soi, puis des activités variées autour de l’amour inconditionnel de soi-m’aime.',
      envoi: 'Le plus beau cadeau que vous puissiez vous offrir.'
    },
    {
      id: 'reconnexion',
      titre: 'Reconnexion à Soi & aux Autres',
      sousTitre: 'Et poser des limites saines',
      date: '2027-09-12T09:30:00+02:00', fin: '2027-09-12T17:30:00+02:00',
      image: 'journees/toile-reconnexion', toile: true,
      accroche: 'Envie de vous reconnecter à votre Moi intérieur, mais aussi de vivre des relations authentiques et saines avec les autres ?',
      intention: 'Un voyage au cœur du lien humain : apprendre à vous respecter et à honorer votre espace tout en cultivant des connexions vraies.',
      programme: 'Des activités bienveillantes, des moments authentiques et sécurisants, des exercices et partages pour vous reconnecter et apprendre à dire non, de la détente, un protocole pour libérer ce qui bloque au niveau relationnel et un soin énergétique pour repartir de plus belle.',
      envoi: 'Cheminer vers des relations sereines.'
    },
    {
      id: 'abondance',
      titre: 'Au cœur de l’Abondance',
      sousTitre: 'Et de la Loi de la Manifestation',
      date: '2027-10-10T09:30:00+02:00', fin: '2027-10-10T17:30:00+02:00',
      image: 'journees/toile-abondance', toile: true,
      accroche: 'Consciemment ou non, il est fréquent de dire ou faire des choses qui bloquent l’abondance dans notre vie, sans oublier les blocages transmis de génération en génération.',
      intention: 'Se libérer du manque et ouvrir grand le champ des possibles.',
      programme: 'La création d’un mantra, des partages, un test pour évaluer votre aptitude à accueillir l’abondance, des exercices pratiques intégrant un protocole de libération, une foule d’astuces simples pour le quotidien et, pour clôturer, un soin énergétique collectif.',
      envoi: 'Ouvrir grand vos portes et vibrer au cœur de l’abondance.'
    },
    {
      id: 'passeurs',
      titre: 'Les Gardiens de l’Invisible',
      sousTitre: 'Passeurs et passeuses d’âmes, mystères de l’au-delà',
      speciale: true,
      date: '2027-11-07T09:30:00+01:00', fin: '2027-11-07T17:30:00+01:00',
      image: 'journees/toile-passeurs', toile: true,
      accroche: 'Franchir le voile de l’invisible dans un cadre profondément rassurant, doux et sécurisant, que vous ressentiez déjà une connexion avec l’au-delà ou que vous vous interrogiez simplement.',
      intention: 'Un moment privilégié pour libérer vos craintes éventuelles, apprendre et valider vos ressentis profonds.',
      programme: 'Ce que signifie être passeur ou passeuse d’âmes au quotidien, en toute simplicité ; les clés de la protection énergétique et de l’ancrage pour accompagner les âmes vers la lumière sans vous laisser submerger ; l’importance de ce rôle lors des grands passages ; vos questions.',
      envoi: 'Une journée unique, en toute sérénité et sécurité.'
    },
    {
      id: 'procrastination',
      titre: 'Sortir de la procrastination',
      sousTitre: 'Passer à l’action pour concrétiser ses projets',
      mois: 'octobre 2026', passee: true,
      image: 'journees/toile-procrastination', toile: true,
      accroche: 'Vous avez tendance à reporter les choses ? Des freins invisibles, des doutes ou des peurs bloquent votre élan ?',
      intention: 'Une dynamique stimulante pour vous remettre en mouvement.',
      programme: 'Identifier et libérer l’immobilisme, des conseils concrets pour passer à l’action, des exercices et jeux variés, un protocole de libération pour lever les freins et un soin énergétique ciblé pour booster confiance et élan.',
      envoi: 'Dépasser vos blocages et exploiter pleinement votre potentiel.'
    },
    {
      id: 'alignement',
      titre: 'Alignement et Mission de Vie',
      sousTitre: 'Écouter son intuition et donner du sens à sa voie',
      mois: 'janvier 2026', passee: true,
      image: 'journees/toile-alignement', toile: true,
      accroche: 'Êtes-vous suffisamment à l’écoute de votre petite voix intérieure ? Envie d’être davantage aligné(e) à ce qui est juste pour vous ?',
      intention: 'Une boussole vibratoire pour vous reconnecter à votre essence et avancer avec clarté sur votre chemin de vie.',
      programme: 'Un test personnalisé pour voir où vous en êtes dans votre alignement, des exercices pour apprivoiser votre intuition, la lecture d’un message individuel canalisé au préalable, des moments d’introspection, un protocole de libération et un soin énergétique profond.',
      envoi: 'Déployer votre plein potentiel et avancer au quotidien en toute sérénité.'
    }
  ],

  avisSoins: [
    {
      nom: 'Tatiana',
      texte: 'Un rendez-vous avec Joëlle n’a rien de tel. C’est une rencontre, un échange puissant, des réponses à des questions, une oreille attentive et pour conclure un soin énergétique puissant qui m’a permis de comprendre beaucoup de choses et de surmonter des épreuves que l’on pourrait qualifier d’insurmontables. Après une séance, on se sent à sa place, aligné, ancré et rempli d’énergie. Joëlle est tellement douce que lorsqu’on ressort de chez elle, c’est comme si on avait pris un bain de lumière.'
    }
  ],
  /* 15 autres témoignages existent sur la page Avis du site actuel mais leur texte ne s’affiche qu’en direct : à recopier */
  avisACompleter: ['Panthea', 'Laurence', 'Evelyne', 'Martina', 'Arwa', 'Evangelia', 'Karima', 'Loredana', 'Monique', 'Selbi', 'Estelle', 'Fatima', 'Nathalie', 'Fabrice', 'Rachël'],

  avisJournees: [
    'Intensément positif, un cadeau pour mon âme et pour moi-même.',
    'Je repars avec l’envie de gravir des montagnes et la banane.',
    'Enrichissant, je me sens comme une enfant, sans souci.',
    'Hyper positif, je me sens apaisée et pleine de lumière.',
    'Gratitude pour tout et pour le travail de libération énergétique.',
    'J’ai aimé les prises de conscience et la façon d’amener le sujet.',
    'J’ai appris énormément, dont des choses sur moi-même.',
    'Une bulle pour soi. Cette journée m’a permis de me recentrer.'
  ],

  formations: [
    { n: 1, titre: 'Introduction aux énergies et auto-soin', prix: 180, duree: '3h15 en solo, 4h en duo', prerequis: null,
      acquis: ['Se connecter aux énergies de lumière par une pratique régulière', 'Magnétiser de l’eau, une plante…', 'Se faire des auto-soins et se régénérer'] },
    { n: 2, titre: 'Se régénérer, se développer, se libérer, nettoyer son lieu de vie', prix: 180, duree: '3h15 en solo, 4h en duo', prerequis: 'Module 1 et 3 mois de pratique',
      acquis: ['Des auto-soins plus ciblés et des protocoles spécifiques', 'Ancrage, alignement et centrage', 'Nettoyer son lieu de vie (base)'] },
    { n: 3, titre: 'Magnétisme : soins énergétiques sur autrui', prix: 230, duree: '4h en solo, 5h en duo', prerequis: 'Modules 1 et 2 et 4 mois de pratique',
      acquis: ['Rôle du magnétiseur, déontologie et points d’attention', 'Le déroulé d’une séance', 'Pratiquer le magnétisme sur autrui'] },
    { n: 4, titre: 'Questions de pratique', prix: null, duree: '2h en solo, à votre demande', prerequis: 'Module 3 et un temps de pratique sur autrui',
      acquis: ['Des réponses aux questions concrètes qui se posent après avoir pratiqué'] }
  ],
  formationDuo: 'Réduction de 20 € chacun(e) si vous suivez la formation à deux.',

  blog: [
    { titre: 'Se reconnecter à son enfant intérieur : pourquoi et comment ?', date: '2026-06-05', image: 'blog/enfant-interieur', url: 'https://www.tonchemindevie.com/post/se-reconnecter-a-son-enfant-interieur', lecture: 3 },
    { titre: 'Est-ce que le magnétisme convient à tout le monde ?', date: '2026-04-01', image: 'blog/magnetisme-pour-tous', url: 'https://www.tonchemindevie.com/post/est-ce-que-le-magnetisme-convient-a-tout-le-monde', lecture: 2 },
    { titre: 'Les énergies anno 2026 : astuces pour garder le cap', date: '2026-03-03', image: 'blog/energies-2026', url: 'https://www.tonchemindevie.com/post/les-energies-anno-2026-astuces-pour-garder-le-cap', lecture: 2 },
    { titre: 'Maléfices : mythe ou réalité ?', date: '2025-12-02', image: 'blog/malefices', url: 'https://www.tonchemindevie.com/post/malefices-mythe-ou-realite', lecture: 2 },
    { titre: 'Grossesse et magnétisme', date: '2025-10-16', image: 'blog/grossesse', url: 'https://www.tonchemindevie.com/post/grossesse-et-magnetisme-est-ce-compatible', lecture: 2 },
    { titre: 'Le magnétisme et les soins énergétiques fonctionnent vraiment ?', date: '2025-07-21', image: 'blog/imposition-mains', url: 'https://www.tonchemindevie.com/post/les-soins-energetiques-fonctionnent-vraiment', lecture: 3 }
  ]
};
