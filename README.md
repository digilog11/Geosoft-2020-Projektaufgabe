# Geosoft-2020-Projektaufgabe

DONE:

Nutzer sieht Karte mit seiner Position und Haltestellen in der Nähe

Nutzer/Arzt kann einen Account erstellen: Fehlermeldungen, falls username bereits vergeben oder passwort nicht korrekt wiederholt

Nutzer/Arzt login: Fehlermeldungen, falls user nicht existiert oder passwort falsch

Aber: bisher keine richtige Login funktion, nur links


TO-DO:

Ein Nutzer kann eine aktuelle Abfahrt an einer Haltestelle vor Ort auswählen. Für diese wird dann im Server markiert, dass sie vom Nutzer genommen wurde.

Bei einer positiven Diagnose kann ein Arzt alle Fahrten eines Nutzers für einen gewissen Zeitraum als Risiko markieren. Diese Funktion ist für den normalen Nutzer nicht frei zugänglich.

Ärzte können auch einzelne Fahrten als Risiko markieren. Dafür steht ihnen eine Karte mit allen Fahrten zur verfügung, welche auf dem Server gespeichert sind.

Wenn mindestens eine der vergangenen Fahrten eines Nutzers als Risiko-Fahrt markiert ist, wird dieser beim nächsten Seitenaufruf, auf der Startseite benachrichtigt. 

Das Front-End auf der Client-Seite erlaubt dem Nutzer seine Fahrten zu wählen und das Risiko für seine gespeicherten Fahrten einzusehen.

Für die Auswahl, und Einsicht der Fahrten gibt es jeweils ein Leaflet Karten-Interface.

Die Auswahlkarte zeigt die Nutzerposition, sowie die Standorte naheliegender Haltestellen an. Der Nutzer kann dort eine Auswahl über die genommene Fahrt treffen.

Die Karte zur Einsicht der Fahrten zeigt dem Nutzer an, von welchem Standort sie welche Fahrten genommen haben. Risiko-Fahrten werden hier besonders hervorgehoben.

Das Interface ist Benutzerfreundlich gestaltet, und gängige Browser und Mobilgeräte können die web-App korrekt ausführen.

Das Back-End auf der Serverseite verwaltet die gespeicherten Fahrten und deren Infektionsrisiko, und stellt das Front-end als html-Seiten zur Verfügung. 

Ein Nutzer sollte sich beim anfänglichen Seitenaufruf mit einem Nutzernamen einloggen können. 
