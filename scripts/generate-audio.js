// ElevenLabs TTS-generaattori Grilled-pelille.
//
// Käyttö (Windows cmd):
//   set ELEVENLABS_API_KEY=sk_your_key_here
//   set ELEVENLABS_VOICE_ID=your_voice_id_here
//   node scripts\generate-audio.js
//
// Käyttö (PowerShell):
//   $env:ELEVENLABS_API_KEY="sk_your_key_here"
//   $env:ELEVENLABS_VOICE_ID="your_voice_id_here"
//   node scripts\generate-audio.js
//
// Skripti on idempotentti — jos tiedosto on jo olemassa, se ohitetaan.
// Jos haluat regeneroida yhden tiedoston, poista se ensin public/audio/-kansiosta.

import fs from 'node:fs/promises';
import path from 'node:path';

const API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID;
const OUT_DIR = path.join('public', 'audio');

// Monologit täsmälleen samassa järjestyksessä kuin gameData.ts:ssä.
// Jos muutat gameData.ts:ää, muista päivittää tämä.
const PROMPTS = [
  // Phase 0: Denial
  [
    'This heat… I think I\u2019m imagining it.',
    'I grew up in the freezer. This must just be another room.',
    'The sausage next to me is sweating. Strange choice.',
  ],
  // Phase 1: Anger
  [
    'I had the makings of a bratwurst.',
    'The cook is flipping everyone else. Not me.',
    'The tongs. Always the tongs.',
  ],
  // Phase 2: Bargaining
  [
    'If I roll right now, maybe I\u2019ll reach a cooler spot.',
    'Chef, if you can hear me — I\u2019m a good sausage.',
    'I will give everything if this ends.',
  ],
  // Phase 3: Depression
  [
    'My fat is dripping. It was part of me.',
    'I can\u2019t clearly remember the freezer anymore.',
    'The grate has been closer to me than anyone ever was.',
  ],
  // Phase 4: Acceptance
  [
    'I will be eaten. That is what I\u2019ve been for.',
    'The flames are beautiful once I stop fearing them.',
    'I have been a sausage. That is something.',
  ],
];

// Voice settings — säädä jos haluat eri sävyn.
// stability: korkeampi = tasaisempi, matalampi = ilmaisuvoimaisempi (0.0–1.0)
// similarity_boost: kuinka tiukasti pysyy alkuperäisessä äänessä (0.0–1.0)
// style: tunnetilan voimakkuus (v2-mallissa; 0.0–1.0)
const VOICE_SETTINGS = {
  stability: 0.55,
  similarity_boost: 0.75,
  style: 0.35,
  use_speaker_boost: true,
};

async function main() {
  if (!API_KEY) {
    console.error('ERROR: Aseta ELEVENLABS_API_KEY ympäristömuuttujaan.');
    process.exit(1);
  }
  if (!VOICE_ID) {
    console.error('ERROR: Aseta ELEVENLABS_VOICE_ID ympäristömuuttujaan.');
    process.exit(1);
  }

  await fs.mkdir(OUT_DIR, { recursive: true });

  let generated = 0;
  let skipped = 0;

  for (let phase = 0; phase < PROMPTS.length; phase++) {
    for (let idx = 0; idx < PROMPTS[phase].length; idx++) {
      const text = PROMPTS[phase][idx];
      const filename = `p${phase}-${idx}.mp3`;
      const outPath = path.join(OUT_DIR, filename);

      // Skip if already exists
      try {
        await fs.access(outPath);
        console.log(`  [ohita]   ${filename}  (jo olemassa)`);
        skipped++;
        continue;
      } catch {
        // doesn't exist, proceed
      }

      console.log(`  [luo]     ${filename}  "${text.slice(0, 50)}${text.length > 50 ? '…' : ''}"`);

      const res = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': API_KEY,
            'Content-Type': 'application/json',
            Accept: 'audio/mpeg',
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: VOICE_SETTINGS,
          }),
        },
      );

      if (!res.ok) {
        const errText = await res.text();
        console.error(`\nERROR: ElevenLabs API palautti ${res.status}:`);
        console.error(errText);
        console.error(
          `\nGeneroitiin ${generated} tiedostoa ennen virhettä. Voit ajaa skriptin uudestaan jatkaaksesi.`,
        );
        process.exit(1);
      }

      const arrayBuffer = await res.arrayBuffer();
      await fs.writeFile(outPath, Buffer.from(arrayBuffer));
      generated++;
    }
  }

  console.log('');
  console.log(`Valmis. Generoitiin ${generated} uutta tiedostoa, ohitettiin ${skipped}.`);
  console.log(`Tiedostot kansiossa: ${OUT_DIR}/`);
  console.log('');
  console.log('Seuraavaksi:');
  console.log('  1. npm run dev — testaa paikallisesti että äänet toistuvat');
  console.log('  2. git add public/audio/');
  console.log('  3. git commit -m "Add monologue audio"');
  console.log('  4. git push');
}

main().catch((err) => {
  console.error('Odottamaton virhe:', err);
  process.exit(1);
});
