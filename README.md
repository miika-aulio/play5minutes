# Pelin viimeiset sanat

Korjaa pelin antikliimaksi: aiemmin viimeinen ambient-lause leikkautui
kesken kun kypsyysmittari osui 100%:iin. Nyt peli kunnioittaa loppuhetkeä.

## Mekaniikka

1. **Kun kypsyys saavuttaa 95%**, last-words-tila aikataulutetaan
2. **Kypsyys jäätyy 95%:iin** — peli ei pääty ennen kuin viimeinen rivi on luettu
3. Nykyinen monologi/ambient/passivity saa loppua rauhassa
4. **Last-words-rivi näytetään** 6 sekuntia, ääni luetaan
5. Vasta sen jälkeen siirrytään End-ruutuun

## Kolme variaatiota peace-arvon mukaan

| Peace | Teksti |
|---|---|
| ≥ 70 (kirkastunut/vapautunut polku) | "And so. The fire and I, together, end well." |
| 40–69 (hyväksynyt polku) | "And so. The fire ends. And I." |
| < 40 (katkeroitunut tai pudonnut) | "And so. It ends as it was." |

Yhteinen "And so." -alku tekee kaikista versioista tunnistettavasti samasta
hetkestä, mutta loppu kuljettaa pelaajan sopivaan tunnelmaan riippuen siitä
miten makkara on käynyt matkansa läpi.

## Tiedostot

- `src/games/grilled/gameData.ts`        (lisätty LAST_WORDS-vakiot ja pickLastWords)
- `src/games/grilled/useGameState.ts`    (uusi 'last-words'-tila ja kypsyyden jäädytys)
- `src/games/grilled/usePromptAudio.ts`  (last-words-äänitiedostojen reititys)
- `scripts/generate-audio.js`            (LAST_WORDS-äänten generointi)

## Asennus

### 1. Pura zippi

Korvaa 4 tiedostoa.

### 2. Generoi 3 uutta last-words-ääntä

```
set ELEVENLABS_API_KEY=oma_avain
set ELEVENLABS_VOICE_ID=jtE6dbPUTt2kchN89Uej
node scripts\generate-audio.js
```

Skripti ohittaa kaikki olemassa olevat (monologit, ambient, passivity) ja
luo 3 uutta tiedostoa:
- last-high.mp3
- last-mid.mp3
- last-low.mp3

~10 sek.

### 3. Testaa paikallisesti

```
npm run dev
```

Pelaa peli loppuun asti. Tarkkaile:
- Kypsyysmittari pysähtyy 95%:iin viimeisten sekuntien ajaksi
- Nykyinen ambient/monologi saa rauhassa loppua
- Sen jälkeen ilmestyy "And so. ..." -teksti, joka luetaan ääneen
- 6 sekunnin näytön jälkeen End-ruutu

Jotta saat eri version, vaihtele peace-arvoa eri pelikerroilla:
- Ei valintoja → matala peace → "It ends as it was."
- Tasaisia valintoja → keskimääräinen → "The fire ends. And I."
- Aktiivisia rauhaa nostavia → korkea → "Together, end well."

### 4. Deployaa

```
git add .
git commit -m "Add last words at end of game with three peace-based variants"
npm run build
npx wrangler deploy
```

## Säätöjä

`useGameState.ts`:n vakiot:
- `LAST_WORDS_TRIGGER_DONENESS = 0.95` — millä kypsyydellä last-words käynnistyy
- `LAST_WORDS_DISPLAY_MS = 6000` — kuinka kauan rivi näkyy

Jos last-words-rivi tuntuu jäävän liian lyhyeksi (ääni ei ehdi loppua),
nosta `LAST_WORDS_DISPLAY_MS` esim. 8000:een.
