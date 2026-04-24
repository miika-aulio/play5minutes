# Grilled — refaktorointi Makkarasta

Iso muutossarja:
- Poistettu kielikerros (vain englanti)
- Nimi: Sausage → **Grilled**
- URL: `/makkara` → `/grilled` (vanha reititetään automaattisesti uuteen)
- Kansio: `src/games/makkara/` → `src/games/grilled/`
- CSS-luokat: `.makkara-*` → `.grilled-*`
- Supabase `game_id`: `makkara` → `grilled` (tulostaulu alkaa tyhjänä)
- Kielivalinta poistettu UI:sta — jäljelle jää vain 🔊/🔇 mute-nappi

## Asennus

### 1. Poista vanha kansio

```
rm -rf src/games/makkara
```

Tai Windowsilla: poista File Explorerissa koko `src\games\makkara`-kansio.

### 2. Pura tämä zippi projektikansion juureen

Zip sisältää:
- `src/App.tsx` — korvaa olemassa olevan
- `src/pages/Home.tsx` — korvaa olemassa olevan
- `src/games/grilled/` — koko uusi kansio

Varmista että `grill.mp3` on edelleen `public/grill.mp3` — sitä ei tarvitse siirtää.

### 3. Testaa paikallisesti

```
npm run dev
```

Avaa `http://localhost:5173`:
- Etusivulla näkyy "Grilled" (ei enää "Sausage")
- Klikkaa kortti tai mene osoitteeseen `/grilled`
- Oikeassa yläkulmassa vain yksi nappi: 🔊/🔇
- Selaimen välilehden otsikko pelin aikana: "Grilled · play 5 minutes"
- Tulostaulu on tyhjä (uusi `game_id='grilled'`)

Testaa myös `/makkara` — pitäisi ohjautua `/grilled`iin automaattisesti.

### 4. Pushaa tuotantoon

```
git add .
git rm -r src/games/makkara   # jos git ei automaattisesti huomannut poistoa
git commit -m "Refactor: Sausage → Grilled, English only, /grilled route"
git push
```

Cloudflare buildaa automaattisesti.

## Huomioita

**Vanhat Supabase-tulokset:** Ne jäävät tietokantaan `game_id='makkara'`-arvolla mutta eivät näy enää tulostaulussa. Jos haluat siivota:

```sql
delete from scores where game_id = 'makkara';
```

Tämä on valinnaista — rivit ovat muuten harmittomia.

**localStorage:** Vanhat avaimet `makkara-lang` ja `makkara-muted` jäävät käyttäjien selaimiin orpoiksi mutta eivät aiheuta ongelmia. Uusi mute-asetus tallentuu `grilled-muted`-avaimella.
