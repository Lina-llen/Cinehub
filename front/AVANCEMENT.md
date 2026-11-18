# Avancement CineHub

## Base front/back en place

- Frontend React/Vite avec Bootstrap.
- URL de l'API configurable avec `VITE_API_URL`.
- Services écrits avec Axios direct et `API_URL`, sur le modèle de l'exemple.
- Le JWT est chargé depuis `localStorage` dans les en-têtes Axios au démarrage.
- Services préparés pour l'authentification, les films à l'affiche et les réservations.
- CORS du backend configuré pour le serveur de développement Vite.
- Accueil responsive avec le logo CineHub et les liens Connexion/Inscription.
- Après connexion, le header donne accès au profil et à la déconnexion.
- La page profil charge les données du compte connecté depuis `/users/me`.
- La liste et le détail des films sont réservés aux utilisateurs connectés.
- Le profil permet de consulter les détails des réservations.
- Le détail d’un film permet de réserver une séance avec un nombre de places et un prix total calculé.
- L’espace admin permet de gérer les films et les utilisateurs, et de consulter toutes les réservations.
- L’espace admin permet aussi de modifier le prix des séances.
- La suppression d’un film efface définitivement ses séances et les réservations associées. Pour une base déjà créée, exécuter `../back/migrate_film_delete_cascade.sql`.
- La suppression d’un utilisateur efface ses réservations. Pour une base déjà créée, exécuter `../back/migrate_user_delete_cascade.sql` si la suppression échoue à cause d’une contrainte de clé étrangère.

## À faire ensuite

- Tester les opérations d’administration avec l’API et une base MySQL.

Les formulaires de connexion et d'inscription appellent maintenant les routes du backend. Le JWT de connexion est gardé dans `localStorage` et envoyé dans les en-têtes Axios.
