PALEOFUTURE
/* Léa Mariani & Florian Morel */

Développé sur Chrome avec une résolution > 1440x900 (et viewport du navigateur rêglé à 1440x900)

/* Librairies
Javascript natif & prototype pour la structure (classes principales et méthodes),
jQuery, PreloadJS (préchargement), Handlebars (templates de rendu HTML), jQuery UI (drag et autocomplete), jqDock (Mac OS X like dock), lodash (fork de underscore.js pour manipuler le JSON), slimScroll (ascenseur personnalisés), TimelineMax/TweenMax (Gestion des tweens et requestAnimationFrame)

/* CSS2-3 avec compass (SASS)

/* Arborescence

/js/
	main.js = preloader et init
	Timeline.js => classe pricipale (Vue de la timeline, des miniatures d'articles, gestion des évènements principaux)
	ArticleViewer.js => vue d'un article
	le reste : utilitaires divers

/* Features
-Timeline avec changement dynamique de l'année courante, défilement des décennies et années (dessous/dessous)
-Parallaxes et croll du conteneur des articles en fonction de la timeline
-Moteur de recherche avec autocomplete sur les noms des articles + affichage de l'article choisi
-Ouverture d'article :
    consultation des articles thématiques (barre de droite), consultation des articles par catégories (dock à gauche)
    toolbar avec rappel de la catégorie courante, accès aux fonctions sociales (marquer/partager), ...

/* Fakes pour la démo (features non développées)
page pinterest (Clic sur Community > Submit) avec retour sur la home en cliquant sur le logo
affichage des commentaires dans les vues des articles

/* Un bon travail sur la fluidité de l'ensemble....what else ?