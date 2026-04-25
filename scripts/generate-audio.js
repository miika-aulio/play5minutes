// ElevenLabs TTS-generaattori Grilled-pelille.
// Generoi monologit, ambient-rivit ja passivity-monologit.

import fs from 'node:fs/promises';
import path from 'node:path';

const API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID;
const OUT_DIR = path.join('public', 'audio');

// Monologit (promptit) — tiedostonimet: p{phase}-{idx}.mp3
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

// Ambient-rivit — tiedostonimet: a{phase}-{idx}.mp3
const AMBIENT = [
  [
    'The heat ripples.',
    'Bubbling, far off.',
    'This must be temporary.',
  ],
  [
    'Juice simmers on the surface.',
    'The shadow of the tongs shifts.',
    'Someone laughs, far away.',
  ],
  [
    'Smoke arcs upward.',
    'A clock ticks somewhere.',
    'A fly lands on the grill lid.',
  ],
  [
    'The coal crumbles slowly.',
    'The wind turns.',
    'Night settles over the city.',
  ],
  [
    'The flame dances in its own measure.',
    'Silence sings.',
    'All that warms has once lived.',
    'This moment needs nothing added.',
  ],
];

// Passivity — yksi per vaihe, tiedostonimet: x{phase}.mp3
const PASSIVITY = [
  'I haven\u2019t answered myself. That is also an answer.',
  'Silence is not calm. It is just silence.',
  'I stopped making offers. Perhaps that was the only offer left.',
  'I have been letting the moment choose for me.',
  'To not decide is also to decide. I see that now.',
];

// Monologit: enemmän tunnetta
const PROMPT_SETTINGS = {
  stability: 0.55,
  similarity_boost: 0.75,
  style: 0.35,
  use_speaker_boost: true,
};

// Ambient: rauhallisempi
const AMBIENT_SETTINGS = {
  stability: 0.7,
  similarity_boost: 0.75,
  style: 0.2,
  use_speaker_boost: true,
};

// Passivity: pohdiskeleva, havaitseva. Vakaampi kuin monologi mutta ei yhtä hillitty
// kuin ambient — pelaaja saa huomautuksen, jossa on sävy mutta ei syytöstä.
const PASSIVITY_SETTINGS = {
  stability: 0.65,
  similarity_boost: 0.75,
  style: 0.3,
  use_speaker_boost: true,
};

async function generateOne(filename, text, settings) {
  const outPath = path.join(OUT_DIR, filename);

  try {
    await fs.access(outPath);
    console.log(`  [ohita]   ${filename}  (jo olemassa)`);
    return 'skipped';
  } catch {
    // doesn't exist, proceed
  }

  const preview = text.slice(0, 50) + (text.length > 50 ? '…' : '');
  console.log(`  [luo]     ${filename}  "${preview}"`);

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
        voice_settings: settings,
      }),
    },
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`ElevenLabs API palautti ${res.status}: ${errText}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  await fs.writeFile(outPath, Buffer.from(arrayBuffer));
  return 'generated';
}

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

  try {
    console.log('Monologit:');
    for (let phase = 0; phase < PROMPTS.length; phase++) {
      for (let idx = 0; idx < PROMPTS[phase].length; idx++) {
        const result = await generateOne(
          `p${phase}-${idx}.mp3`,
          PROMPTS[phase][idx],
          PROMPT_SETTINGS,
        );
        if (result === 'generated') generated++;
        else skipped++;
      }
    }

    console.log('');
    console.log('Ambient-rivit:');
    for (let phase = 0; phase < AMBIENT.length; phase++) {
      for (let idx = 0; idx < AMBIENT[phase].length; idx++) {
        const result = await generateOne(
          `a${phase}-${idx}.mp3`,
          AMBIENT[phase][idx],
          AMBIENT_SETTINGS,
        );
        if (result === 'generated') generated++;
        else skipped++;
      }
    }

    console.log('');
    console.log('Passivity-monologit:');
    for (let phase = 0; phase < PASSIVITY.length; phase++) {
      const result = await generateOne(
        `x${phase}.mp3`,
        PASSIVITY[phase],
        PASSIVITY_SETTINGS,
      );
      if (result === 'generated') generated++;
      else skipped++;
    }
  } catch (err) {
    console.error('\nERROR:', err.message);
    console.error(
      `\nGeneroitiin ${generated} tiedostoa ennen virhettä. Voit ajaa skriptin uudestaan jatkaaksesi.`,
    );
    process.exit(1);
  }

  console.log('');
  console.log(`Valmis. Generoitiin ${generated} uutta tiedostoa, ohitettiin ${skipped}.`);
  console.log(`Tiedostot kansiossa: ${OUT_DIR}/`);
}

main().catch((err) => {
  console.error('Odottamaton virhe:', err);
  process.exit(1);
});
