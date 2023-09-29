# Documentation de l'API Websocket lié au processus de jeux (Mode en ligne)

<p>Cette documentation présente toutes les informations pour l'intégration du processus de jeu de la plateforme AsDesMots</p>
<p>

## Processus de jeu
Voici les étapes de démarage du jeu. pour que le jeu puisse être démarrer il faut que les conditions de démarrage soit remplies

### Condition de démarrage d'une partie
- L'arcarde doit être démarrer:  l'attribut `status` de l'arcarde doit être définis sur `running_game`
- La compétition doit être démarrer: l'attribut `status` de la compétiton doit être définis sur `running_game`
- Le nombre de joueur définis par défaut doit être atteint
  
### Etapes du jeu
Une fois les étapes de démarrage d'une partie ainsi établié voici les étapes dérouler lors d'un processus de jeu:
1. Démarrage d'une partie
2. Adhésion des joueurs a une partie 
3. Lancement du jeu
4. Fin du jeu et déconnexion des joueurs
 

## 1. Démarrage d'une partie   
Le créateur de la compétition démarre la partie. Alors l'attribut `status` de la partie passe à l'état `waiting_player` afin d'atteindre l'adhésion des joueurs précédement inscrit a la compétitoin.

#### Requête
- l'événement appelé est `start-game-part`
- le corps de la requête: 
```Typescript
{
    gamePartID:ObjectId //Identifiant de la partie à démarrer
    competitionID:ObjectId //Idemtifiant de la compétition associé a la partie
}
```

#### Réponse
- Si tout c'est bien passé alors une reponse d'évenenment du type `start-game-part` avec pour corps de la requete 
```Typescript
{
    gameState: string //Etat de la partie. devra avoir la valeur  `waiting_player`
}
```
- Dans le cas d'une erreur (partie introuvable) alors l'évènement renvoyé est `start-game-part-error` donc le corps de la reponse d'érreur est:
```TypeScript
    {
        statusCode:404,
        error:'NotFound/GamePart',
        message:[`Game part not found`]
    }
```

## 2. Adhésion des joueurs a une partie
Afin de compétir, chaque joueur doit adhérer a une partie qui été lancé (partie en cours). Afin de le faire, il faut suivre la requête/réponse suivante:

### Requête
- L'événement appelé est `join-game`
- Le corps de la requête est: 
```TypeScript
{
    competitionID:ObjectId //ID de la compétition

    playerID:ObjectId, //Identifiant du joueur

}
```

### Réponse
- Dans le cas d'une reponse correct alors 
- Si tout c'est bien passé alors une reponse d'évenenment du type `join-game` avec pour corps de la requete 
```Typescript
{
    gameState: string //Etat de la partie. 
}
```
Si les conditions de démarrage d'une partie est compléte alors l'état de la parti passe a `running_game` pour signaler que partie a commencé. <br/> 
Alors tous les participants recoivent une notification du type `game-statechange` avec pour corps celui précédent et dont le gameState est passé à `running_game`. <br/>
Associer a célà, tous les joueurs précédement connecté recoivent une notification du type `new-player` avec pour corps la liste des utilisateurs dont le contenu est semblable au resultat de la requete  [Liste des utilisateurs](https://asdesmots-apidoc.yaba-in.com/#api-Authorization-get_list_of_users_by_roleId)

## 3. Lancement du jeu
Cette section décris entiérement le processus du jeu. Ce processus se ségement en plusieurs sous section:

### a. Sélection d'un mot
La sélection d'un mot consiste à selectionner un joueur et un mot en fonction du niveau du jeu et de communiquer le joeur sélection a tous les joueurs connecté. Pour ce faire l'évenement du type `game-play` et le contenu du corps est le suivant: 
  ```Typescript
   {
        gameRound:GameRound, //du type GameRound qui correspond au round courrant
        gameWord: wordGameLevel, //du type WordGameLevel // qui contient le mot sélectionné
        player: User  //du type User
    }
  ```

### b. Emission du mot par l'utilisateur
L'émission du mot par l'utilisateur correspond au fait que l'utilisateur sélectionné saissi le mot dans le champs d'entré et envoi vers le serveur. dans ce cas l'évenementà appélé est `game-play` avec pour contenu du corps suivant:
 ```Typescript
   {
        competitionID:ObjectId, //Identifiant de la compétition
        playerID: ObjectId, //Identifiant du joueur
        word: string  //Mot saisi par l'utilisateur
    }
  ```
Une fois le mot envoyé par l'utilisateur, le serveur traite le mot fonction du mot correct qui est en interne et compare les mots sur plan orthographique.
- Dans l'éventualité ou l'orthographe n'est pas  correct, un du type `game-player-lifegame` est envoyé a tous les utilisateurs afin de les prévenir de la modification de l'état du joueur avec pour corps le contenu suivant: 
```Typescript
{
    player: PlayerGameRegistration, //joueur
    lifeGame:Number //Vie restant du joueur
}
```
 L'orsque le niveau de vie `lifeGame` tombe à 0, alors le joueur est rétiré de la partie
- Dans l'éventualité où le mot est correct, alors rien n'est pas.

Une fois cela fait, si la partie est terminé alors un évenemnt de type `game-statechange` est envoyé comme décris dans la partie ...     
 Si a l'inverse la parti n'est pas terminé alors on lance un nouveau round avec un nouveau évenement `game-play` envoyé a tous les joueurs qui spécifie le joueur courant dont le contenu est décris dans la sectoin `3.a Sélection d'un mot` 

 </p>