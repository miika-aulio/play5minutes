# Anger, Bargaining ja Depression -ambientit kirjoitettu uudestaan

Aiemmat ambient-rivit olivat liian neutraaleja eivätkä kuljettaneet vaiheen
tunnetilaa. Tämä patch korvaa kolmen keskimmäisen vaiheen rivit täysin
uusilla teksteillä jotka tukevat vaiheen sävyä:

## Uudet rivit

### Phase II — Anger (7) — syyttävä, mustasukkainen
- The cook flips another. Picks favourites.
- Look at the bratwurst. Just sitting there. Whole.
- The marinade was a lie.
- Two of us came in. One will leave.
- Salt. Always salt. Never enough sugar.
- I'd be perfect on a plate. I would have been.
- Somewhere, a freezer is opening for someone else.

### Phase III — Bargaining (7) — etsii merkkejä, ehtoja, lupauksia
- If the fly stays, that has to mean something.
- Three more turns. Maybe four. Then it ends.
- The wind shifted. That counts.
- I am thinking small thoughts. Surely that is rewarded.
- Every prayer needs an audience. Anyone listening?
- Let me be uneven. Let them notice.
- I will be quiet now. Quiet sausages get spared.

### Phase IV — Depression (7) — tasainen, harmaa, painokas
- Nothing is happening. Nothing was going to.
- I have stopped thinking about the freezer.
- The flies have moved on.
- Tomorrow will be like this.
- Even the smoke leaves first.
- I cannot remember caring.
- There is no one to tell.

Denial ja Acceptance säilyvät ennallaan.

## Tiedostot

- `src/games/grilled/gameData.ts`
- `scripts/generate-audio.js`

## Asennus

### 1. Pura zippi

Korvaa 2 tiedostoa.

### 2. Poista vanhat ambient-tiedostot näille kolmelle vaiheelle

**Tärkeää:** koska skripti on idempotentti, se ohittaa olemassa olevat tiedostot.
Vanhat MP3:t pitää poistaa että uudet luodaan tilalle.

Windows cmd:
```
del public\audio\a1-*.mp3
del public\audio\a2-*.mp3
del public\audio\a3-*.mp3
```

PowerShell:
```
Remove-Item public\audio\a1-*.mp3
Remove-Item public\audio\a2-*.mp3
Remove-Item public\audio\a3-*.mp3
```

Yhteensä 21 tiedostoa poistuu (7 per vaihe × 3 vaihetta).

### 3. Generoi uudet ambient-äänet

```
set ELEVENLABS_API_KEY=oma_avain
set ELEVENLABS_VOICE_ID=jtE6dbPUTt2kchN89Uej
node scripts\generate-audio.js
```

Skripti generoi 21 uutta tiedostoa (a1-0…a1-6, a2-0…a2-6, a3-0…a3-6) ja
ohittaa kaikki muut. ~30 sek.

### 4. Testaa paikallisesti

```
npm run dev
```

Pelaa Anger-vaihe läpi (klikkaa kaikki monologit), kuuntele uutta ambienttia.
Saman Bargaining ja Depression. Sävyn pitäisi nyt selkeästi erottua eri vaiheissa.

### 5. Deployaa

```
git add .
git commit -m "Rewrite Anger, Bargaining, Depression ambients with phase-appropriate tones"
npm run build
npx wrangler deploy
```

## Sisällön kaari

Jos joskus haluat verrata tai palauttaa vanhat, ne ovat git-historian kautta:

```
git log -- src/games/grilled/gameData.ts
git show <hash>:src/games/grilled/gameData.ts
```

Mutta uusilla teksteillä peli kuljettaa vaiheen tunnetilaa selvästi paremmin —
ambient ei ole enää vain "väliaikatekstit", vaan jatke jokaisen vaiheen sisäiselle
maailmalle.
