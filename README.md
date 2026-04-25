# Ambient-laajennus + sekoitus + hidastus

Korjaa kokemuksen jossa samat 3–4 ambient-riviä toistuvat muutamaan kertaan
yhden vaiheen sisällä.

## Muutokset

### 1. Lisää sisältöä
16 → 36 ambient-riviä yhteensä:
- Denial: 3 → 7
- Anger: 3 → 7
- Bargaining: 3 → 7
- Depression: 3 → 7
- Acceptance: 4 → 8

Sävy progressoi: **konkreettiset havainnot alkuvaiheissa → poeettiset välivaiheissa → filosofiset Acceptanceessa**.

### 2. Sekoitus joka pelikerralla
Fisher-Yates-sekoitus järjestää ambient-rivien indeksit
satunnaisesti kun vaihe alkaa. Eri pelikerroilla ne tulevat eri järjestyksessä.

### 3. Hidastettu tempo
Ambient-kierto: 5.5 s → **9 s**. Antaa enemmän tilaa hetkeä — ja koska rivejä on
yli kaksinkertainen määrä, toistoa tapahtuu paljon harvemmin.

## Tiedostot

```
src/games/grilled/gameData.ts        (laajennettu ambient-listat)
src/games/grilled/useGameState.ts    (sekoitus + hidastus)
scripts/generate-audio.js            (uudet ambient-rivit)
```

`usePromptAudio.ts` ja `EndScreen.tsx` säilyvät edellisestä patchista —
tässä paketissa niitä ei tarvitse korvata.

## Asennus

### 1. Pura zippi

Korvaa 3 tiedostoa.

### 2. Generoi uudet ambient-äänet

```
set ELEVENLABS_API_KEY=oma_avain
set ELEVENLABS_VOICE_ID=jtE6dbPUTt2kchN89Uej
node scripts\generate-audio.js
```

Skripti ohittaa olemassa olevat 36 tiedostoa (15 monologia + 16 ambient + 5 passivity)
ja generoi 20 uutta ambient-tiedostoa:
- a0-3.mp3 … a0-6.mp3 (Denial 4 uutta)
- a1-3.mp3 … a1-6.mp3 (Anger 4 uutta)
- a2-3.mp3 … a2-6.mp3 (Bargaining 4 uutta)
- a3-3.mp3 … a3-6.mp3 (Depression 4 uutta)
- a4-4.mp3 … a4-7.mp3 (Acceptance 4 uutta)

Yhteensä ~30 sek.

### 3. Testaa paikallisesti

```
npm run dev
```

Pelaa muutama vaihe läpi, kuuntele ambient-kierto. Eri pelikerroilla
saman vaiheen rivit tulevat eri järjestyksessä, ja koska rivejä on enemmän
ja tempo on hidastunut, toistoa tuntuu vähemmän.

### 4. Deployaa

```
git add .
git commit -m "Expand ambient pool, shuffle order, slower tempo"
npm run build
npx wrangler deploy
```

## Säätöjä

`useGameState.ts`:n vakiossa `AMBIENT_CYCLE_DELAY` säätää tempoa millisekunteina.
- 9000 (nykyinen): 9 s per rivi
- 12000: 12 s, hyvin meditatiivinen
- 7000: 7 s, mutta rivejä on nyt niin paljon että 9 s on hyvä lähtökohta

## Sisältö joka vaiheelle

**Denial** (7) — arkinen, makkara yrittää selittää tilanteen pois:
- "The heat ripples." / "Bubbling, far off." / "This must be temporary."
- "A breeze. Or maybe nothing." / "Someone is humming a tune I almost know."
- "The clock face is too far to read." / "An empty plate waits, patient."

**Anger** (7) — tarkkoja havaintoja, makkara katsoo katkeroituneena:
- "Juice simmers on the surface." / "The shadow of the tongs shifts." / "Someone laughs, far away."
- "Salt collects in a cooling pool." / "A mosquito tries the air. Decides against it."
- "Wind moves grease across the iron." / "The radio plays a song I don't recognise."

**Bargaining** (7) — aikaa katsotaan ulkopuolelta, pieni reflektio alkaa:
- "Smoke arcs upward." / "A clock ticks somewhere." / "A fly lands on the grill lid."
- "Smoke draws letters I cannot read." / "Footsteps. They go elsewhere."
- "The day has been longer than yesterday." / "Even the flies have plans."

**Depression** (7) — konkreettinen mutta hiljaisempi, runollisempi:
- "The coal crumbles slowly." / "The wind turns." / "Night settles over the city."
- "Light leaves the way it came." / "Iron remembers nothing."
- "The next plate is already waiting." / "Steam rises like a small forgetting."

**Acceptance** (8) — filosofinen, kontemplatiivinen:
- "The flame dances in its own measure." / "Silence sings."
- "All that warms has once lived." / "This moment needs nothing added."
- "To be eaten is to be carried elsewhere." / "I am the heat now. Or the heat is me."
- "Each fire is different. None is mine alone." / "The world keeps cooking, with or without."
