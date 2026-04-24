# Three fixes: redirect, sticky hover, seamless grill loop

## What changed

### 1. Redirect `/` → `/grilled`
`src/App.tsx`: pääsivu ohjaa nyt suoraan peliin. Header "play 5 minutes" jää brändielementiksi yläreunaan, sen klikkaus palauttaa samaan paikkaan.

### 2. Sticky hover pois mobiililta
`src/games/grilled/Grilled.css` + `src/App.css`: kaikki `:hover`-säännöt on kääritty `@media (hover: hover)` -blokkiin. Ainoastaan hiirilaitteet saavat hover-efektin; touch-laitteet eivät "juutu" aktiiviseen tilaan. `:active` toimii edelleen kaikkialla (nappien painaminen antaa välittömän visuaalisen palautteen).

### 3. Saumaton grillin ritinä
`src/games/grilled/useGrillAudio.ts`: HTML5 `<audio>` + `loop=true` korvattu Web Audio API:lla (`AudioBufferSourceNode` + `loop=true`). Tämä toistaa puskuria rajattomasti ilman tyhjää hetkeä kierrosten välillä.

## Asennus

Pura zippi projektikansioon, korvaa olemassa olevat tiedostot. Yhteensä 4 tiedostoa:

- `src/App.tsx`
- `src/App.css`
- `src/games/grilled/Grilled.css`
- `src/games/grilled/useGrillAudio.ts`

## Testaus paikallisesti

```
npm run dev
```

1. Avaa `http://localhost:5173` — pitäisi ohjautua automaattisesti `/grilled`:iin
2. Klikkaa "Step onto the grill" — grillin ritinä alkaa ja kuuntele kauemmin: ei pitäisi olla taukoja loopissa
3. Jos mahdollista, avaa sama sivu puhelimessa (esim. samassa WiFi:ssä, osoitteella `http://<koneen-ip>:5173/grilled`) — napin kosketus ei pitäisi enää jättää valintaa korostettuna

## Pushaa

```
git add .
git commit -m "Fix: root redirect to /grilled, remove sticky hover on mobile, seamless grill loop"
git push
```

## Huomioita

**Web Audio API vs HTML5 Audio:** Web Audio on tehokkaampi mutta vaativampi. Jos joskus törmäät virheeseen kuten "AudioContext was not allowed to start", se johtuu autoplay-policystä — ratkaisu on kutsua `start()` vasta käyttäjäelektä (kuten nyt `handleBegin`-funktiossa).

**Yhteensopivuus:** Web Audio API toimii kaikissa moderneissa selaimissa (iOS Safari 6+, Chrome, Firefox, Edge). `webkitAudioContext` -fallback on koodissa Safari < 14:tä varten.

**CSS `@media (hover: hover)`:** Toimii 95%+ selaimista. Vanhemmat selaimet saavat hover-efektin normaalisti (ei regressiota).
