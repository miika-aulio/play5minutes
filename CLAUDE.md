# CLAUDE.md

Ohjeet Claudelle tämän repon parissa työskentelyyn. Tämä on `play5minutes` — lyhyiden selainpelien portfolio osoitteessa **play5minutes.com**.

## Projektin idea

Selainpohjainen pelipörtfölio, jonka konsepti on lyhyet istunnot: jokaisen pelin saa läpi enintään ~5 minuutissa. Kohderyhmä on työpöytäviihde selaimessa. Pitkän aikavälin visio on hostata useita pelejä saman brändin alla, jaetulla infrastruktuurilla (leaderboardit, Supabase-backend), joka tulee arvokkaammaksi kun kirjasto kasvaa.

## Tech stack

- **Frontend:** React + Vite + TypeScript
- **Routing:** react-router-dom
- **Tietokanta:** Supabase (Postgres + Row Level Security)
- **Ääni:** Web Audio API + ElevenLabs TTS
- **Hosting:** Cloudflare Workers (EI Pages) — `wrangler.jsonc` static assets -konfiguraatiolla
- **Domain:** play5minutes.com (Cloudflare Registrar)
- **Repo:** github.com/miika-aulio/play5minutes

## Komennot

```bash
npm run dev      # paikallinen kehitys (http://localhost:5173)
npm run build    # tuotantobuild
npx wrangler deploy   # deploy Cloudflare Workersille
```

**Deploy tapahtuu automaattisesti** kun pushataan `main`-haaraan. GitHub Actions rakentaa ja deployaa Cloudflare Workersille (`.github/workflows/deploy.yml`). Manuaalinen `npm run build && npx wrangler deploy` toimii edelleen fallbackina (muista pausata OneDrive-synkronointi ennen buildia — mp3-tiedostot lukittuvat muuten).

## Repon rakenne

```
src/
  App.tsx              # reititys, brändiheader
  App.css
  pages/
    Home.tsx           # vanha etusivu (säilytetty laajennusta varten)
  games/
    grilled/           # peli 1: "Grilled"
      Grilled.tsx
      Grilled.css      # luokat .grilled-* (ei .makkara-*)
      content.ts       # UI-stringit, prompts, endings — tasaiset objektit
      gameData.ts      # tyypit, pelidata
      screens/         # End-näyttö, LeaderboardScreen, ym.
      components/       # Stage.tsx, Monologue.tsx, ym.
public/
  grill.mp3            # ambient-äänilooppi
wrangler.jsonc         # Cloudflare Workers -konfiguraatio
```

Uudet pelit menevät omaan kansioonsa `src/games/<peli>/`. Arkkitehtuuri on rakennettu tukemaan tätä.

## Reititys

- `/` → redirect `/grilled` (peli on pääsisältö)
- `/grilled` → peli
- `/home` → vanha etusivu (säilytetty)
- `/makkara` → redirect `/grilled` (taaksepäin yhteensopivuus — älä poista)

## Peli: Grilled

Eksistentiaalinen mustan komedian simulaattori. Pelaaja kokee makkaran viimeiset viisi minuuttia grillissä, rakennettuna Kübler-Rossin viiden surun vaiheen ympärille (denial → anger → bargaining → depression → acceptance).

Mekaniikat:
- Automaattisesti etenevä **kypsyysmittari** (~5 min)
- **Rauhamittari** joka reagoi pelaajan valintoihin
- 15 monologikehotetta binäärivalinnoilla per vaihe
- Vaihekohtaiset ambient-tekstit: yksi rivi per vaihe, sitten hiljaisuus. Sävy vaihtelee vaiheittain (syyttävä vihassa, ehtoja hakeva kaupankäynnissä, lattea masennuksessa, filosofinen hyväksynnässä)
- Passiivisuusrangaistus: toimettomuus rapauttaa rauhaa
- "Last words" -lopetussekvenssi fade-to-blackilla
- 5 loppua lopullisen rauhapistemäärän mukaan

Peli oli alun perin suomenkielinen ("Makkara"). Refaktoroitu: nimi → Grilled, **vain englanti** (kielikerros `Record<Language, ...>` poistettu kokonaan), CSS-luokat `.makkara-*` → `.grilled-*`, UI:ssa vain 🔊/🔇 mute-nappi.

## Äänijärjestelmä (tärkeät opit)

Nämä ratkaisut on opittu kantapään kautta — älä regressoi niitä:

1. **Saumaton ambient-looppi:** kaksi limittäistä `BufferSourceNode`a, jotka on offsetoitu puolella kestolla, eliminoi enkooderin viiveestä syntyvät katkot. Älä yritä luupata yhdellä nodella.

2. **Jaettu singleton `HTMLAudioElement`** kaikelle narraatio-tyyppiselle äänelle (monologit, ambient, passivity, last words). Tämä on **pakollinen iOS Safari -yhteensopivuuden takia** — useat erilliset audio-elementit eivät toimi.

3. **Polling-pohjainen ääniajoitus, ei transition-tiloja eikä kiinteitä viiveitä.** Tilakone odottaa `isPromptAudioPlaying()`-pollingilla että ääni loppuu, ennen kuin etenee. Tämä toimii riippumatta klipin pituudesta. Aiempi yritys transition-tiloilla rikkoi pelin etenemisen — älä palaa siihen. Vältä hardcoodattuja timing-arvoja ja oletuksia tiedostojen pituuksista.

4. **ElevenLabs TTS:** voice ID `jtE6dbPUTt2kchN89Uej`, maksullinen yritystili. **API-avaimia ei koskaan committata eikä jaeta chatissa** — jos avain on joskus näkynyt missään, pidä sitä vuotaneena ja revokoi heti.

## Tietokanta (Supabase)

- Projekti-ID: `werlrfvtgcoqsdcxlrvx`
- URL: `https://werlrfvtgcoqsdcxlrvx.supabase.co`
- Taulu `scores`: `game_id`, `name`, `score`, `meta` (JSONB)
- RLS: julkinen luku ja insert sallittu
- Grilled käyttää `game_id='grilled'`. Vanhat `game_id='makkara'`-rivit voivat olla kannassa näkymättöminä.

⚠️ **Nimensyöttö ja Leaderboard-nappi on väliaikaisesti piilotettu End-näytöstä.** `LeaderboardScreen`-komponentti ja kaikki Supabase-koodi ovat tallessa koodissa. Palautetaan myöhemmin — todennäköisesti kun portfoliossa on useampi peli tai kun oikeaa leaderboard-dataa halutaan.

## Työtavat ja konventiot

- Koodin kommentit ja README:t **suomeksi** (Miikan äidinkieli). Pelin sisäinen UI englanniksi.
- **Täydet, toimivat muutokset:** jätä työpuu aina buildattavaan tilaan. Ei puolivalmiita tiloja, ei TODO-tynkiä jotka rikkovat ajon. Kun muokkaat, muokkaa kaikki tarvittavat tiedostot kerralla.
- **Future-proof ratkaisut** hardcoodattujen arvojen sijaan — etenkin ajoituksessa älä oleta tiedostojen pituuksia.
- **Yksinkertaisempi mekaniikka voittaa** kun se saavuttaa saman design-tavoitteen (esim. polling > transition-tilat).
- Iteratiivinen suunnittelu selkeillä päätöskohdilla — peli-ideat hiotaan rakenteellisella keskustelulla ennen toteutusta.

## Työohjeet Claude Codelle

Tämä repo siirtyy Claude Coden hoidettavaksi. Noudata tätä työnkulkua.

### Perustyönkulku
1. **Lue ennen kuin muokkaat.** Tarkista relevantit tiedostot ja olemassa olevat konventiot ennen muutoksia — etenkin äänijärjestelmän ja tilakoneen kohdalla.
2. **Muokkaa tiedostoja paikallaan** repossa. Älä tee erillisiä patch- tai zip-paketteja — olet repossa sisällä.
3. **Testaa paikallisesti** ennen kuin julistat työn valmiiksi (ks. alla).
4. **Commitoi pienissä, fokusoiduissa paloissa** selkeillä viesteillä. Yksi looginen muutos per commit.
5. **Deploy tapahtuu automaattisesti** kun pushataan `main`-haaraan. Älä pushaa keskeneräisiä muutoksia — jokainen push menee tuotantoon.

### Ennen jokaista commitia / deployta
- Aja `npm run build` ja varmista että build menee läpi virheittä.
- Jos projektissa on typecheck/lint (`tsc --noEmit`, eslint), aja se.
- Käynnistä `npm run dev` ja savutestaa muuttunut näkymä selaimessa — etenkin jos koskit Grilledin tilakoneeseen, valintoihin tai ääneen, pelaa kyseinen vaihe läpi.
- **Älä committaa salaisuuksia.** ElevenLabs- ja Supabase-avaimet menevät ympäristömuuttujiin / `.env`-tiedostoon, joka on `.gitignore`ssa. Jos huomaat avaimen koodissa tai historiassa, pysähdy ja ilmoita.

### Deploy
- **Automaattinen:** push `main`-haaraan → GitHub Actions (`deploy.yml`) ajaa `npm ci && npm run build && npx wrangler deploy`. Seuraa tulosta osoitteessa `https://github.com/miika-aulio/play5minutes/actions`.
- **Manuaalinen fallback:** `npm run build && npx wrangler deploy` — pausaa OneDrive-synkronointi ensin tai build kaatuu mp3-lukitukseen.
- **Tarvittavat GitHub-secretit:** `CLOUDFLARE_API_TOKEN` (Workers Scripts → Edit). Account ID on `wrangler.jsonc`:ssa, joten erillistä secretiä ei tarvita.
- **Worker-nimen täsmäys:** Workerin nimi `wrangler.jsonc`:ssa täytyy vastata Cloudflaren dashboardin Worker-nimeä. Tarkista tämä jos deploy kaatuu oudosti.
- **Cloudflare Workers Builds** (git-kytkentä) on katkaistu dashboardista — pelkkä GitHub Actions deployaa.

### Git
- `/makkara` → `/grilled` -redirect **säilytetään** aina (taaksepäin yhteensopivuus).
- Vanhan `src/games/makkara/`-kansion poisto vaatii `git rm -r`, jotta poisto näkyy myös historiassa eikä jää Cloudflaren buildiin.

### Erityishuomiot
- **Älä regressoi äänijärjestelmän kolmea sääntöä** (saumaton looppi, singleton-HTMLAudioElement, polling-ajoitus). Jos äänikäyttäytyminen muuttuu, testaa iOS Safarissa tai vähintään mobiiliemulaatiossa.
- **Älä palauta nimensyöttöä / leaderboardia** End-näyttöön ellei sitä erikseen pyydetä — se on tarkoituksella piilotettu.
- **Uuden pelin lisäys:** luo `src/games/<peli>/`, lisää reitti `App.tsx`:ään, käytä omaa `game_id`:tä Supabasessa. Seuraa Grilledin rakennetta mallina.
- Jos jokin tämän tiedoston kohta on ristiriidassa koodin todellisuuden kanssa, **koodi voittaa** — ilmoita ristiriidasta jotta tämä päivitetään.

## Horisontissa

- Nimensyötön + leaderboardin palautus Grilledin End-näyttöön
- **Kukkasimulaattori** — päivittäishoitopeli, jossa ikkunalaudan kukkaa kastellaan kerran päivässä. Kukka vanhenee viiden vaiheen läpi (taimi → nuori → kukkiva → kypsä → vanhus) 7 päivässä, ääni/persoonallisuus lapsekkaasta vanhukseksi. Prototyyppi rakennettu (single-file HTML, CSS-piirretty kukka, localStorage + oikean päivämäärän pakotus, suomenkielinen dialogi). Idea: persoonallisuuden periytyminen sukupolvien yli.
- Portfolion laajennus lisäpeleillä; jaettu infra arvokkaampaa skaalassa.
