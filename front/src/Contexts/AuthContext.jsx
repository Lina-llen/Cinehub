/*
 * Contexte d'authentification.
 * Un contexte est une boîte partagée : un composant parent y dépose une valeur,
 * et n'importe quel enfant peut la lire avec useContext, sans props intermédiaires.
 *
 * Exemple concret dans ce projet :
 *   App dépose    { isConnected: true, setIsConnected, user, setUser }
 *   Header lit    isConnected        pour afficher le profil / déconnexion ou connexion
 *   LoginPage lit setIsConnected     pour passer à true après le login
 *
 * Les valeurs ci-dessous sont seulement les valeurs par défaut,
 * utilisées si un composant appelle useContext en dehors du Provider.
 * setIsConnected : () => {} est une fonction vide, pour éviter une erreur
 * si quelqu'un l'appelle par mégarde sans Provider.
 */
import React from "react";

const AuthContext = React.createContext({
    isConnected : false,
    setIsConnected : () => {},
    user : {},
    setUser: () => {}
})

export default AuthContext;
