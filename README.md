# Grilled — yhdistetty patch: ambient-äänet + passiivisuus + yksinkertaistettu End

Kolme muutosta yhdessä paketissa.

## Sisältö

### 1. Ambient-äänten luenta
Aiemmin vain monologit luettiin ääneen. Nyt myös 16 ambient-riviä — ne kontemplatiiviset huomiot vaiheiden välissä ("The shadow of the tongs shifts." jne.) — soitetaan äänenä.

### 2. Passiivisuus-mekaniikka
Jos pelaaja ei tee valintaa tarpeeksi pian:
- **10 s jälkeen** peace alkaa laskea 1/sek
- **18 s jälkeen** passivity-monologi ilmestyy (kerran per vaihe, havainto ei syytös)
- Peli etenee automaattisesti seuraavaan prompttiin 4 s jälkeen

Passivity-monologit per vaihe:
| Vaihe | Teksti |
|---|---|
| I Denial | "I haven't answered myself. That is also an answer." |
| II Anger | "Silence is not calm. It is just silence." |
| III Bargaining | "I stopped making offers. Perhaps that was the only offer left." |
| IV Depression | "I have been letting the moment choose for me." |
| V Acceptance | "To not decide is also to decide. I see that now." |

### 3. End-ruudun yksinkertaistus
Poistettu väliaikaisesti:
- Nimen syöttö
- Submit-nappi
- Leaderboard-nappi

Jäljelle jää vain päätös, proosa, stats ja "Another life". Supabase-koodi säilyy projektissa palautusta varten.

## Tiedostot

```
src/games/grilled/gameData.ts           (lisätty PASSIVITY-taulukko)
src/games/grilled/useGameState.ts       (passiivisuus-mekaniikka)
src/games/grilled/usePromptAudio.ts     (ambient + passivity -äänet)
src/games/grilled/screens/EndScreen.tsx (yksinkertaistettu)
scripts/generate-audio.js               (generoi kaikki 36 tiedostoa)
```

## Asennus

### 1. Pura zippi projektikansioon

Korvaa 5 tiedostoa yllä olevan listan mukaisesti.

### 2. Generoi uudet äänet

Ambient- ja passivity-äänet (21 uutta tiedostoa yhteensä):

```
set ELEVENLABS_API_KEY=oma_avain
set ELEVENLABS_VOICE_ID=goT3UYdM9bhm0n2lmKQx
node scripts\generate-audio.js
```

Skripti ohittaa olemassa olevat 15 monologia ja generoi:
- 16 ambient-tiedostoa (a0-0.mp3 … a4-3.mp3)
- 5 passivity-tiedostoa (x0.mp3 … x4.mp3)

Yhteensä ~30–40 sek.

### 3. Testaa paikallisesti

```
npm run dev
```

Testattavaa:
- **Ambient-äänet**: pelaa jonkin vaiheen läpi (klikkaa kaikki 3 monologia), kuuntele kun ambient-kierto alkaa — jokaisen ambient-rivin pitäisi kuulua myös äänenä
- **Passiivisuus**: klikkaa "Step onto the grill", älä tee valintaa — 10s kohdalla peace laskee, 18s kohdalla passivity-monologi ilmestyy ja kuuluu äänenä
- **End-ruutu**: pelaa peli loppuun — End-ruudulta puuttuvat nimi-kenttä, Submit ja Leaderboard. Vain Another Life -nappi.

### 4. Deployaa

```
git add .
git commit -m "Ambient audio, passivity mechanic, simplified end screen"
npm run build
npx wrangler deploy
```

## Säätöjä

Kaikki aikavakiot `useGameState.ts`:n yläosassa:

```ts
const IDLE_DECAY_AFTER_MS = 10000;        // peace-lasku alkaa
const PASSIVITY_TRIGGER_AFTER_MS = 18000; // passivity-monologi
const PASSIVITY_DISPLAY_MS = 4000;        // passivity-näkyvyys
const IDLE_DECAY_RATE_PER_SEC = 1;        // peace-lasku/sek
```

Ääniasetukset `scripts/generate-audio.js`:ssä:
- `PROMPT_SETTINGS` — monologit (stability 0.55, style 0.35)
- `AMBIENT_SETTINGS` — ambient (stability 0.7, style 0.2, rauhallisempi)
- `PASSIVITY_SETTINGS` — passivity (stability 0.65, style 0.3, välimaastossa)

## Credittien käyttö ElevenLabsissa

Yhteensä noin 1200 creditiä uusiin ääniin. Ilmaistaso 10 000/kk kattaa helposti.

## Huomioita

**Supabase-integraatio säilyy koodissa** — `src/shared/supabase.ts` ja `src/games/grilled/screens/LeaderboardScreen.tsx` ovat paikoillaan. Kun halutaan palauttaa nimi-syöttö ja tulostaulu End-ruudulle, EndScreen.tsx voidaan korvata aiemmalla versiolla.
