# Grilled — monologien ääniluenta

Tämä paketti lisää 15 monologiin ääniraidat. Käytetään ElevenLabs TTS-palvelua.

## Vaihe 1 — ElevenLabs-tili ja äänen valinta

1. Rekisteröidy osoitteessa [elevenlabs.io](https://elevenlabs.io) (free tier riittää ~10 000 merkkiä/kk)
2. Avaa **Voice Library**, suodata:
   - Language: **English**
   - Gender: Male (tai naisääni, maku)
   - Category: **Narration** tai **Audiobook**
3. Esikuuntele ääniä testifraasilla: `"I had the makings of a bratwurst."`
4. Valitse ääni joka kuulostaa **lakoniselta ja väsyneeltä**, ei dramaattiselta
5. Klikkaa ääntä auki — kopioi **Voice ID** (löytyy URL:sta tai "View" -painikkeen kautta)

Hyviä ehdokkaita testattavaksi:
- Callum, Daniel, Clyde, George, Thomas (nimet voivat muuttua)

## Vaihe 2 — API-avain

1. ElevenLabs-dashboard → oikea yläkulma (profiilikuva) → **API Keys**
2. Klikkaa **Create API Key** jos et vielä ole tehnyt
3. Kopioi avain talteen (se näkyy vain kerran)

## Vaihe 3 — Koodimuutokset

Pura tämän zipin sisältö projektikansion juureen. Korvaa:

- `src/games/grilled/useGameState.ts` (lisätty `promptIdx` UIStateen)
- `src/games/grilled/Grilled.tsx` (kutsuu `usePromptAudio`a)

Uudet tiedostot:

- `src/games/grilled/usePromptAudio.ts`
- `scripts/generate-audio.js`

## Vaihe 4 — Generoi äänet

Terminaalissa projektikansiossa (Windows cmd):

```
set ELEVENLABS_API_KEY=sk_your_key_here
set ELEVENLABS_VOICE_ID=your_voice_id_here
node scripts\generate-audio.js
```

Tai PowerShell:

```
$env:ELEVENLABS_API_KEY="sk_your_key_here"
$env:ELEVENLABS_VOICE_ID="your_voice_id_here"
node scripts\generate-audio.js
```

Skripti generoi 15 MP3-tiedostoa `public/audio/`-kansioon. Kestää ~30 sekuntia. Idempotentti — jos ajat uudelleen, olemassa olevat tiedostot ohitetaan.

Jos haluat vaihtaa ääntä: poista `public/audio/`-kansion sisältö ja aja skripti uudelleen uudella `ELEVENLABS_VOICE_ID`:lla.

## Vaihe 5 — Testaa paikallisesti

```
npm run dev
```

Avaa `http://localhost:5173/grilled`, klikkaa "Step onto the grill":
- Grillin ritinä alkaa
- Kun ensimmäinen monologi ilmestyy, kuulet sen luettuna ääneen
- Mute-nappi 🔊/🔇 vaikuttaa molempiin ääniin

## Vaihe 6 — Pushaa

```
git add .
git commit -m "Add monologue voice audio (ElevenLabs TTS)"
git push
```

Cloudflare buildaa, ja 1–2 min kuluttua äänet toimivat `play5minutes.com/grilled`:ssä.

## Huomioita

**Tiedostokoko:** 15 × ~50–150 KB = noin 1–2 MB lisää repoon. Hyväksyttävä.

**Ääniasetukset:** `scripts/generate-audio.js`:ssä on `VOICE_SETTINGS`-olio. Säädä jos haluat eri sävyn:
- `stability: 0.55` — matalampi (esim. 0.3) = ilmaisuvoimaisempi mutta epätasaisempi
- `style: 0.35` — korkeampi (esim. 0.6) = enemmän tunnetta

**Kustannus:** 15 monologia × ~50 merkkiä = ~750 merkkiä. Free tier kattaa helposti. Voit generoida moneen kertaan testaten eri ääniä ennen kuin 10 000 merkkiä täyttyy.

**Jos ääni ei soi tuotannossa:** varmista että `public/audio/`-kansion tiedostot ovat GitHubissa (`git status` paikallisesti, ja tarkista GitHubin web-käyttöliittymästä). Ilman niitä Cloudflaren build ei löydä niitä.

**Monologin tekstin muuttaminen myöhemmin:** jos muokkaat `gameData.ts`:n monologeja, muista myös päivittää `scripts/generate-audio.js`:n `PROMPTS`-taulukko ja regeneroida äänet (poista vanhat `public/audio/`:sta ja aja skripti).
