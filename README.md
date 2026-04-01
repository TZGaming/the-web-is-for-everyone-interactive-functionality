# Snappthis

## Beschrijving
Snappthis is een app waarmee je groepen kan maken voor groepsleden, voor die groepen kan je snappmaps maken. In de snappmaps zitten foto's (ook wel **snapps** genoemd) die je kan liken, disliken of een ster kan geven. Ook hangen er tags aan de snapps waarmee je kan filteren. Ons doel is om de app om te zetten in een **web-app**.

Hier is de live link naar de website op render: https://snappthis-tom.onrender.com

## Gebruik
Op dit moment kan je alleen foto's uploaden in de Snappmap van Squad 1J/1I. Je kan hier op de camera button klikken om vervolgens een foto te maken:

<img width="200" height="532" alt="localhost_8000_snappmaps_97814507-ec09-4abe-b3f1-13f7c236018f(iPhone_12_Pro)" src="https://github.com/user-attachments/assets/627f7200-e330-41be-89b7-94f9c6291399" />

(Op telefoon opent het de camera, en op desktop kan je een bestand kiezen.)

Hier is ook een user story voor gemaakt: https://github.com/TZGaming/the-web-is-for-everyone-interactive-functionality/issues/4

Verder kun je gewoon door alle snappmaps gaan, maar daar kan je niets posten omdat ik geen lid ben van die groep(en).

## Kenmerken
Onze database is heel erg complex en het duurde een tijdje voordat alles goed werd opgehaald en dat we zelf foto's konden uploaden. Uiteindelijk werkte het allemaal en heb ik ook een success state toegevoegd als de foto is geüpload:

<img width="200" height="532" alt="localhost_8000_snappmaps_97814507-ec09-4abe-b3f1-13f7c236018f_success=true(iPhone_12_Pro)" src="https://github.com/user-attachments/assets/487ed8f7-4dc6-4a5c-a586-602cba1c25c9" />

(Dit is ook nagemaakt zoals het in hun Figma design stond.)

De upload feature zelf gebruikt een library genaamd "Multer". Deze handelt alle uploads voor de foto's en stuurt het naar de database in Directus. Hieronder staat meer over hoe je dit installeert in het project.

## Installatie
Om de website live te gebruiken moet je in de terminal eerst deze code invoeren om NodeJS te installeren:

`npm install`

Daarna moet je multer ook installeren, anders vind server.js de package niet en kan hij niet starten. Voer deze code in om multer te installeren:

`npm install multer`

Om de website live te kunnen bekijken vanuit een editor zoals VS Code, voer dan dit in:

`npm start`

Nu kan je vervolgens naar localhost:8000 gaan om de website live te kunnen bekijken.
