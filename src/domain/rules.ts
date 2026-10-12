import type { Career, Localized, Rules, Talent } from './types'

/**
 * Character creation limits. Keep every number here so it is easy to correct.
 */
export const RULES_LIMITS = {
  attributeTotal: 14,
  attributeMin: 2,
  attributeMax: 4,
  keyAttributeMax: 5,
  skillTotal: 10,
  skillMin: 0,
  keySkillMax: 3,
  otherSkillMax: 1,
  // TODO: uzupełnić z podręcznika (number of gear items picked at creation)
  gearCount: 2,
} as const satisfies Rules['limits']

const ATTRIBUTES: Rules['attributes'] = {
  strength: { label: { en: 'Strength', pl: 'Siła' } },
  agility: { label: { en: 'Agility', pl: 'Zręczność' } },
  wits: { label: { en: 'Wits', pl: 'Spryt' } },
  empathy: { label: { en: 'Empathy', pl: 'Empatia' } },
}

const SKILLS: Rules['skills'] = {
  heavyMachinery: {
    attribute: 'strength',
    label: { en: 'Heavy Machinery', pl: 'Ciężki Sprzęt' },
  },
  stamina: { attribute: 'strength', label: { en: 'Stamina', pl: 'Kondycja' } },
  closeCombat: { attribute: 'strength', label: { en: 'Close Combat', pl: 'Walka Wręcz' } },
  mobility: { attribute: 'agility', label: { en: 'Mobility', pl: 'Sprawność' } },
  piloting: { attribute: 'agility', label: { en: 'Piloting', pl: 'Pilotowanie' } },
  rangedCombat: { attribute: 'agility', label: { en: 'Ranged Combat', pl: 'Walka Dystansowa' } },
  observation: { attribute: 'wits', label: { en: 'Observation', pl: 'Spostrzegawczość' } },
  survival: { attribute: 'wits', label: { en: 'Survival', pl: 'Przetrwanie' } },
  comtech: { attribute: 'wits', label: { en: 'Comtech', pl: 'Komputery' } },
  command: { attribute: 'empathy', label: { en: 'Command', pl: 'Dowodzenie' } },
  manipulation: { attribute: 'empathy', label: { en: 'Manipulation', pl: 'Manipulacja' } },
  medicalAid: { attribute: 'empathy', label: { en: 'Medical Aid', pl: 'Pomoc Medyczna' } },
}

// Career talents only; general talents are gained later through experience.
const TALENTS: Talent[] = [
  talent(
    'banter',
    { en: 'Banter', pl: 'Mistrz ciętej riposty' },
    {
      en: 'Each turn in a safe place lowers your stress and that of everyone near you by 2, not 1.',
      pl: 'Każda tura w bezpiecznym miejscu obniża stres twój i osób w pobliżu o 2 zamiast o 1.',
    },
  ),
  talent(
    'overkill',
    { en: 'Overkill', pl: 'Szał bojowy' },
    {
      en: 'When you make a Panic Roll, you can turn the fear into an attack instead.',
      pl: 'Przy Teście Paniki możesz zamienić strach w atak.',
    },
  ),
  talent(
    'pastTheLimit',
    { en: 'Past the Limit', pl: 'Determinacja' },
    {
      en: 'Push Strength-based skill rolls twice. Each push adds 1 stress.',
      pl: 'Forsujesz testy umiejętności opartych na Sile dwa razy. Każde forsowanie: +1 stres.',
    },
  ),
  talent(
    'authority',
    { en: 'Authority', pl: 'Autorytet' },
    {
      en: 'Use Command instead of Manipulation to bend others to your will.',
      pl: 'Używasz Dowodzenia zamiast Manipulacji, by naginać innych do swojej woli.',
    },
  ),
  talent(
    'investigator',
    { en: 'Investigator', pl: 'Śledczy' },
    {
      en: 'After a turn in a room, roll Observation once; each success buys one question to the GM.',
      pl: 'Po turze w pomieszczeniu testujesz raz Spostrzegawczość; każdy sukces to jedno pytanie do MG.',
    },
  ),
  talent(
    'subdue',
    { en: 'Subdue', pl: 'Obezwładnienie' },
    {
      en: 'In close combat against a humanoid, +2 to grapple the target instead of dealing damage.',
      pl: 'W walce wręcz z humanoidem +2 do ataku, ale zamiast obrażeń chwytasz przeciwnika.',
    },
  ),
  talent(
    'cunning',
    { en: 'Cunning', pl: 'Przebiegłość' },
    {
      en: 'Push Wits-based skill rolls twice. Each push adds 1 stress.',
      pl: 'Forsujesz testy umiejętności opartych na Sprycie dwa razy. Każde forsowanie: +1 stres.',
    },
  ),
  talent(
    'personalSafety',
    { en: 'Personal Safety', pl: 'Osobiste bezpieczeństwo' },
    {
      en: 'When in deadly danger, a Manipulation roll lets someone nearby take the hit instead. +1 stress.',
      pl: 'W śmiertelnym niebezpieczeństwie test Manipulacji przerzuca zagrożenie na kogoś obok. +1 stres.',
    },
  ),
  talent(
    'takeControl',
    { en: 'Take Control', pl: 'Przejęcie kontroli' },
    {
      en: 'Roll Manipulation using Wits instead of Empathy.',
      pl: 'Testujesz Manipulację, używając Sprytu zamiast Empatii.',
    },
  ),
  talent(
    'beneathNotice',
    { en: 'Beneath Notice', pl: 'Niezauważalny' },
    {
      en: 'Reroll your own critical injury roll and keep the result you prefer.',
      pl: 'Przerzucasz rzut na ranę ciężką i wybierasz lepszy wynik.',
    },
  ),
  talent(
    'dodge',
    { en: 'Dodge', pl: 'Unik' },
    {
      en: 'Block close combat attacks with Mobility instead of Close Combat; reduces damage only.',
      pl: 'Blokujesz ataki wręcz Sprawnością zamiast Walką Wręcz; tylko zmniejszasz obrażenia.',
    },
  ),
  talent(
    'nimble',
    { en: 'Nimble', pl: 'Zwinny' },
    {
      en: 'Push Agility-based skill rolls twice. Each push adds 1 stress.',
      pl: 'Forsujesz testy umiejętności opartych na Zręczności dwa razy. Każde forsowanie: +1 stres.',
    },
  ),
  talent(
    'calmingPresence',
    { en: 'Calming Presence', pl: 'Oaza spokoju' },
    {
      en: 'Once per turn in a safe place, lower the stress of another character near you by 1.',
      pl: 'Raz na turę w bezpiecznym miejscu obniżasz o 1 stres innej postaci w pobliżu.',
    },
  ),
  talent(
    'compassion',
    { en: 'Compassion', pl: 'Współczucie' },
    {
      en: 'Push Empathy-based skill rolls twice. Each push adds 1 stress.',
      pl: 'Forsujesz testy umiejętności opartych na Empatii dwa razy. Każde forsowanie: +1 stres.',
    },
  ),
  talent(
    'fieldSurgeon',
    { en: 'Field Surgeon', pl: 'Sanitariusz' },
    {
      en: '+2 to Medical Aid when treating someone about to die from a critical injury.',
      pl: '+2 do Pomocy Medycznej przy ratowaniu kogoś umierającego od rany ciężkiej.',
    },
  ),
  talent(
    'fieldCommander',
    { en: 'Field Commander', pl: 'Dowódca polowy' },
    {
      en: 'Give orders in combat with Command as a fast action, so twice per round.',
      pl: 'Wydajesz rozkazy w walce Dowodzeniem jako akcję szybką, więc dwa razy na rundę.',
    },
  ),
  talent(
    'influence',
    { en: 'Influence', pl: 'Wpływy' },
    {
      en: 'Push Empathy-based skill rolls twice. Each push adds 1 stress.',
      pl: 'Forsujesz testy umiejętności opartych na Empatii dwa razy. Każde forsowanie: +1 stres.',
    },
  ),
  talent(
    'pullRank',
    { en: 'Pull Rank', pl: 'Wyższa szarża' },
    {
      en: 'Command vs. Manipulation forces a non-officer of your organization to obey one order. +1 stress.',
      pl: 'Dowodzenie przeciw Manipulacji zmusza nie-oficera z twojej organizacji do wykonania rozkazu. +1 stres.',
    },
  ),
  talent(
    'fullThrottle',
    { en: 'Full Throttle', pl: 'Pełny ciąg' },
    {
      en: '+2 to Piloting for acceleration and braking when flying a spaceship.',
      pl: '+2 do Pilotowania przy przyspieszaniu i hamowaniu statkiem kosmicznym.',
    },
  ),
  talent(
    'likeTheBackOfYourHand',
    { en: 'Like the Back of Your Hand', pl: 'Jak własną kieszeń' },
    {
      en: '+2 to Piloting one specific vehicle or ship. Can be taken again for another.',
      pl: '+2 do Pilotowania jednego konkretnego pojazdu lub statku. Można wybrać ponownie dla innego.',
    },
  ),
  talent(
    'reckless',
    { en: 'Reckless', pl: 'Lekkomyślny' },
    {
      en: 'Push Agility-based skill rolls twice. Each push adds 1 stress.',
      pl: 'Forsujesz testy umiejętności opartych na Zręczności dwa razy. Każde forsowanie: +1 stres.',
    },
  ),
  talent(
    'resilient',
    { en: 'Resilient', pl: 'Niepowstrzymany' },
    {
      en: 'When you take damage, roll Strength (no skill); each success negates 1 damage.',
      pl: 'Gdy otrzymujesz obrażenia, testujesz Siłę (bez umiejętności); każdy sukces neguje 1 obrażenie.',
    },
  ),
  talent(
    'theLongHaul',
    { en: 'The Long Haul', pl: 'Stary wyga' },
    {
      en: 'Once per act (cinematic) or session (campaign), ignore all stress-die 1s in one roll.',
      pl: 'Raz na akt (tryb filmowy) lub sesję (kampania) ignorujesz wszystkie jedynki na kościach stresu w jednym rzucie.',
    },
  ),
  talent(
    'trueGrit',
    { en: 'True Grit', pl: 'Zahartowany' },
    {
      en: 'Push Strength-based skill rolls twice. Each push adds 1 stress.',
      pl: 'Forsujesz testy umiejętności opartych na Sile dwa razy. Każde forsowanie: +1 stres.',
    },
  ),
  talent(
    'analysis',
    { en: 'Analysis', pl: 'Analiza' },
    {
      en: 'Study an alien artifact or creature for a turn and roll Observation; each success is one question to the GM.',
      pl: 'Po turze obserwacji obcego artefaktu lub istoty testujesz Spostrzegawczość; każdy sukces to jedno pytanie do MG.',
    },
  ),
  talent(
    'breakthrough',
    { en: 'Breakthrough', pl: 'Przełom' },
    {
      en: 'Once per session, automatically pass an Observation roll of your choice (GM may veto).',
      pl: 'Raz na sesję automatycznie zdajesz wybrany test Spostrzegawczości (MG może odmówić).',
    },
  ),
  talent(
    'inquisitive',
    { en: 'Inquisitive', pl: 'Dociekliwy' },
    {
      en: 'Push Wits-based skill rolls twice. Each push adds 1 stress.',
      pl: 'Forsujesz testy umiejętności opartych na Sprycie dwa razy. Każde forsowanie: +1 stres.',
    },
  ),
]

// Each gear option is one rulebook line "X or Y"; see #11.
const CAREERS: Career[] = [
  {
    id: 'colonialMarine',
    label: { en: 'Colonial Marine', pl: 'Kolonialny marine' },
    keyAttribute: 'strength',
    keySkills: ['closeCombat', 'stamina', 'rangedCombat'],
    talents: ['banter', 'overkill', 'pastTheLimit'],
    gearOptions: [
      gear('M41A Pulse Rifle / M56A2 Smart Gun', 'Karabin impulsowy M41A / M56A2 Smart Gun'),
      gear(
        'M314 Motion Tracker / 2 G2 Electroshock Grenades',
        'Wykrywacz ruchu M314 / 2 granaty ogłuszające G2',
      ),
      gear(
        'IRC Mk.35 Pressure Suit / M3 Personnel Armor',
        'Skafander ciśnieniowy IRC typ 35 / pancerz osobisty M3',
      ),
      gear('Signal Flare / Deck of Cards', 'Flara sygnałowa / talia kart'),
    ],
  },
  {
    id: 'colonialMarshal',
    label: { en: 'Colonial Marshal', pl: 'Inspektor Kolonialny' },
    keyAttribute: 'wits',
    keySkills: ['observation', 'rangedCombat', 'manipulation'],
    talents: ['authority', 'investigator', 'subdue'],
    gearOptions: [
      gear(
        '.357 Magnum Revolver / Armat Model 37A2 12-Gauge Shotgun',
        'Rewolwer magnum .357 / strzelba Armat model 37A2 kaliber 12',
      ),
      gear('Binoculars / Flashlight', 'Lornetka / latarka'),
      gear('Personal Medkit / Stun Baton', 'Osobista apteczka / paralizator'),
      gear('D6 Doses of Neversleep / Walkie-Talkie', 'K6 dawek BezSnu / krótkofalówka'),
    ],
  },
  {
    id: 'companyAgent',
    label: { en: 'Company Agent', pl: 'Przedstawiciel Firmy' },
    keyAttribute: 'wits',
    keySkills: ['comtech', 'observation', 'manipulation'],
    talents: ['cunning', 'personalSafety', 'takeControl'],
    gearOptions: [
      gear('Leather Briefcase / Chrome Briefcase', 'Skórzany neseser / chromowany neseser'),
      gear('Gold-Plated Pen / Rolex Watch', 'Pozłacane pióro / zegarek Rolex'),
      gear(
        'Data Transfer Card with Corporate Access / M4A3 Service Pistol',
        'Karta przekazu danych z dostępem korporacyjnym / pistolet służbowy M4A3',
      ),
      gear(
        'D6 Doses of Neversleep / D6 Doses of Naproleve',
        'K6 dawek BezSnu / k6 dawek Naproleve',
      ),
    ],
  },
  {
    id: 'kid',
    label: { en: 'Kid', pl: 'Dzieciak' },
    keyAttribute: 'agility',
    keySkills: ['mobility', 'survival', 'observation'],
    talents: ['beneathNotice', 'dodge', 'nimble'],
    gearOptions: [
      gear('Fishing Line / Laser Pointer', 'Żyłka wędkarska / wskaźnik laserowy'),
      gear('Magnet / Remote-Controlled Car', 'Magnes / zdalnie sterowany samochodzik'),
      gear('Yo-Yo / Handheld Game Console', 'Jo-jo / przenośna konsola'),
      gear('Personal Locator / Markers', 'Osobisty lokalizator / pisaki'),
    ],
  },
  {
    id: 'medic',
    label: { en: 'Medic', pl: 'Medyk' },
    keyAttribute: 'empathy',
    keySkills: ['mobility', 'observation', 'medicalAid'],
    talents: ['calmingPresence', 'compassion', 'fieldSurgeon'],
    gearOptions: [
      gear(
        'Surgical Kit / IRC Mk.50 Compression Suit',
        'Zestaw chirurgiczny / skafander kompresyjny IRC typ 50',
      ),
      gear(
        'D6 Doses of Neversleep / D6 Doses of Naproleve',
        'K6 dawek BezSnu / k6 dawek Naproleve',
      ),
      gear(
        'Personal Medkit / D6 Doses of Experimental Drug X',
        'Osobista apteczka / k6 dawek eksperymentalnych narkotyków X',
      ),
      gear('Samani E-Series Watch / Walkie-Talkie', 'Zegarek Samani seria E / krótkofalówka'),
    ],
  },
  {
    id: 'officer',
    label: { en: 'Officer', pl: 'Oficer' },
    keyAttribute: 'empathy',
    keySkills: ['rangedCombat', 'command', 'manipulation'],
    talents: ['fieldCommander', 'influence', 'pullRank'],
    gearOptions: [
      gear(
        'M4A3 Service Pistol / Rexim RXF-M5 EVA Pistol',
        'Pistolet służbowy M4A3 / pistolet laserowy Rexim RXF-M5',
      ),
      gear('Samani E-Series Watch / Binoculars', 'Zegarek Samani seria E / lornetka'),
      gear(
        'M314 Motion Tracker / IRC Mk.50 Compression Suit',
        'Wykrywacz ruchu M314 / skafander kompresyjny IRC typ 50',
      ),
      gear('Seegson P-DAT / IFF Transponder', 'Tablet Seegson P-DAT / transponder IFF'),
    ],
  },
  {
    id: 'pilot',
    label: { en: 'Pilot', pl: 'Pilot' },
    keyAttribute: 'agility',
    keySkills: ['piloting', 'rangedCombat', 'comtech'],
    talents: ['fullThrottle', 'likeTheBackOfYourHand', 'reckless'],
    gearOptions: [
      gear(
        'M4A3 Service Pistol / PR-PUT Uplink Terminal',
        'Pistolet służbowy M4A3 / terminal PR-PUT',
      ),
      gear('Walkie-Talkie / D6 Flares', 'Krótkofalówka / k6 flar'),
      gear('Maintenance Jack / Seegson P-DAT', 'Klucz uniwersalny / tablet Seegson P-DAT'),
      gear(
        'Seegson System Diagnostic Device / IRC Mk.50 Compression Suit',
        'Narzędzie Diagnostyczne Seegson / skafander kompresyjny IRC typ 50',
      ),
    ],
  },
  {
    id: 'roughneck',
    label: { en: 'Roughneck', pl: 'Robotnik' },
    keyAttribute: 'strength',
    keySkills: ['heavyMachinery', 'stamina', 'closeCombat'],
    talents: ['resilient', 'theLongHaul', 'trueGrit'],
    gearOptions: [
      gear('Cutting Torch / Watatsumi DV-303 Bolt Gun', 'Palnik / kołkownica Watatsumi DV-303'),
      gear('D6 Doses of Hydr8tion / Maintenance Jack', 'K6 dawek Naw0dnienia / klucz uniwersalny'),
      gear(
        'Stash of Hard Liquor / IRC Mk.50 Compression Suit',
        'Zapas mocnego alkoholu / skafander kompresyjny IRC typ 50',
      ),
      gear(
        'Flashlight / Seegson C-Series Magnetic Tape Recorder',
        'Latarka / magnetofon szpulowy Seegson seria C',
      ),
    ],
  },
  {
    id: 'scientist',
    label: { en: 'Scientist', pl: 'Naukowiec' },
    keyAttribute: 'wits',
    keySkills: ['observation', 'survival', 'comtech'],
    talents: ['analysis', 'breakthrough', 'inquisitive'],
    gearOptions: [
      gear('Digital Video Camera / Walkie-Talkie', 'Cyfrowa kamera wideo / krótkofalówka'),
      gear('Seegson P-DAT / Neurovisual Helmet', 'Tablet Seegson P-DAT / hełm neurowizyjny'),
      gear(
        'Seegson System Diagnostic Device / Personal Data Transmitter',
        'Narzędzie Diagnostyczne Seegson / osobisty przekaźnik danych',
      ),
      gear('M314 Motion Tracker / Personal Medkit', 'Wykrywacz ruchu M314 / osobista apteczka'),
    ],
  },
]

export const RULES: Rules = {
  limits: RULES_LIMITS,
  attributes: ATTRIBUTES,
  skills: SKILLS,
  careers: CAREERS,
  talents: TALENTS,
}

export function findCareer(rules: Rules, id: string): Career | undefined {
  return rules.careers.find((c) => c.id === id)
}

export function findTalent(rules: Rules, id: string): Talent | undefined {
  return rules.talents.find((t) => t.id === id)
}

function talent(id: string, label: Localized, description: Localized): Talent {
  return { id, label, description }
}

function gear(en: string, pl: string): Localized {
  return { en, pl }
}
