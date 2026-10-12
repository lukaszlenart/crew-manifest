import type { Career, CashRoll, GearItem, GearOption, Localized, Rules, Talent } from './types'

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
  gearCount: 2,
  startingReloads: 2,
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

const CAREERS: Career[] = [
  {
    id: 'colonialMarine',
    label: { en: 'Colonial Marine', pl: 'Kolonialny marine' },
    keyAttribute: 'strength',
    keySkills: ['closeCombat', 'stamina', 'rangedCombat'],
    talents: ['banter', 'overkill', 'pastTheLimit'],
    gearOptions: [
      gear(
        firearm('M41A Pulse Rifle', 'Karabin impulsowy M41A'),
        firearm('M56A2 Smart Gun', 'M56A2 Smart Gun'),
      ),
      gear(
        item('M314 Motion Tracker', 'Wykrywacz ruchu M314'),
        item('2 G2 Electroshock Grenades', '2 granaty ogłuszające G2'),
      ),
      gear(
        item('IRC Mk.35 Pressure Suit', 'Skafander ciśnieniowy IRC typ 35'),
        item('M3 Personnel Armor', 'Pancerz osobisty M3'),
      ),
      gear(item('Signal Flare', 'Flara sygnałowa'), item('Deck of Cards', 'Talia kart')),
    ],
    cash: { dice: 1, multiplier: 100 },
  },
  {
    id: 'colonialMarshal',
    label: { en: 'Colonial Marshal', pl: 'Inspektor Kolonialny' },
    keyAttribute: 'wits',
    keySkills: ['observation', 'rangedCombat', 'manipulation'],
    talents: ['authority', 'investigator', 'subdue'],
    gearOptions: [
      gear(
        firearm('.357 Magnum Revolver', 'Rewolwer magnum .357'),
        firearm('Armat Model 37A2 12-Gauge Shotgun', 'Strzelba Armat model 37A2 kaliber 12'),
      ),
      gear(item('Binoculars', 'Lornetka'), item('Flashlight', 'Latarka')),
      gear(item('Personal Medkit', 'Osobista apteczka'), item('Stun Baton', 'Paralizator')),
      gear(
        item('D6 Doses of Neversleep', 'K6 dawek BezSnu'),
        item('Walkie-Talkie', 'Krótkofalówka'),
      ),
    ],
    cash: { dice: 1, multiplier: 100 },
  },
  {
    id: 'companyAgent',
    label: { en: 'Company Agent', pl: 'Przedstawiciel Firmy' },
    keyAttribute: 'wits',
    keySkills: ['comtech', 'observation', 'manipulation'],
    talents: ['cunning', 'personalSafety', 'takeControl'],
    gearOptions: [
      gear(
        item('Leather Briefcase', 'Skórzany neseser'),
        item('Chrome Briefcase', 'Chromowany neseser'),
      ),
      gear(item('Gold-Plated Pen', 'Pozłacane pióro'), item('Rolex Watch', 'Zegarek Rolex')),
      gear(
        item(
          'Data Transfer Card with Corporate Access',
          'Karta przekazu danych z dostępem korporacyjnym',
        ),
        firearm('M4A3 Service Pistol', 'Pistolet służbowy M4A3'),
      ),
      gear(
        item('D6 Doses of Neversleep', 'K6 dawek BezSnu'),
        item('D6 Doses of Naproleve', 'K6 dawek Naproleve'),
      ),
    ],
    cash: { dice: 2, multiplier: 100 },
  },
  {
    id: 'kid',
    label: { en: 'Kid', pl: 'Dzieciak' },
    keyAttribute: 'agility',
    keySkills: ['mobility', 'survival', 'observation'],
    talents: ['beneathNotice', 'dodge', 'nimble'],
    gearOptions: [
      gear(item('Fishing Line', 'Żyłka wędkarska'), item('Laser Pointer', 'Wskaźnik laserowy')),
      gear(
        item('Magnet', 'Magnes'),
        item('Remote-Controlled Car', 'Zdalnie sterowany samochodzik'),
      ),
      gear(item('Yo-Yo', 'Jo-jo'), item('Handheld Game Console', 'Przenośna konsola')),
      gear(item('Personal Locator', 'Osobisty lokalizator'), item('Markers', 'Pisaki')),
    ],
    cash: { dice: 1, multiplier: 1 },
  },
  {
    id: 'medic',
    label: { en: 'Medic', pl: 'Medyk' },
    keyAttribute: 'empathy',
    keySkills: ['mobility', 'observation', 'medicalAid'],
    talents: ['calmingPresence', 'compassion', 'fieldSurgeon'],
    gearOptions: [
      gear(
        item('Surgical Kit', 'Zestaw chirurgiczny'),
        item('IRC Mk.50 Compression Suit', 'Skafander kompresyjny IRC typ 50'),
      ),
      gear(
        item('D6 Doses of Neversleep', 'K6 dawek BezSnu'),
        item('D6 Doses of Naproleve', 'K6 dawek Naproleve'),
      ),
      gear(
        item('Personal Medkit', 'Osobista apteczka'),
        item('D6 Doses of Experimental Drug X', 'K6 dawek eksperymentalnych narkotyków X'),
      ),
      gear(
        item('Samani E-Series Watch', 'Zegarek Samani seria E'),
        item('Walkie-Talkie', 'Krótkofalówka'),
      ),
    ],
    cash: { dice: 1, multiplier: 100 },
  },
  {
    id: 'officer',
    label: { en: 'Officer', pl: 'Oficer' },
    keyAttribute: 'empathy',
    keySkills: ['rangedCombat', 'command', 'manipulation'],
    talents: ['fieldCommander', 'influence', 'pullRank'],
    gearOptions: [
      gear(
        firearm('M4A3 Service Pistol', 'Pistolet służbowy M4A3'),
        firearm('Rexim RXF-M5 EVA Pistol', 'Pistolet laserowy Rexim RXF-M5'),
      ),
      gear(item('Samani E-Series Watch', 'Zegarek Samani seria E'), item('Binoculars', 'Lornetka')),
      gear(
        item('M314 Motion Tracker', 'Wykrywacz ruchu M314'),
        item('IRC Mk.50 Compression Suit', 'Skafander kompresyjny IRC typ 50'),
      ),
      gear(
        item('Seegson P-DAT', 'Tablet Seegson P-DAT'),
        item('IFF Transponder', 'Transponder IFF'),
      ),
    ],
    cash: { dice: 2, multiplier: 100 },
  },
  {
    id: 'pilot',
    label: { en: 'Pilot', pl: 'Pilot' },
    keyAttribute: 'agility',
    keySkills: ['piloting', 'rangedCombat', 'comtech'],
    talents: ['fullThrottle', 'likeTheBackOfYourHand', 'reckless'],
    gearOptions: [
      gear(
        firearm('M4A3 Service Pistol', 'Pistolet służbowy M4A3'),
        item('PR-PUT Uplink Terminal', 'Terminal PR-PUT'),
      ),
      gear(item('Walkie-Talkie', 'Krótkofalówka'), item('D6 Flares', 'K6 flar')),
      gear(
        item('Maintenance Jack', 'Klucz uniwersalny'),
        item('Seegson P-DAT', 'Tablet Seegson P-DAT'),
      ),
      gear(
        item('Seegson System Diagnostic Device', 'Narzędzie Diagnostyczne Seegson'),
        item('IRC Mk.50 Compression Suit', 'Skafander kompresyjny IRC typ 50'),
      ),
    ],
    cash: { dice: 1, multiplier: 100 },
  },
  {
    id: 'roughneck',
    label: { en: 'Roughneck', pl: 'Robotnik' },
    keyAttribute: 'strength',
    keySkills: ['heavyMachinery', 'stamina', 'closeCombat'],
    talents: ['resilient', 'theLongHaul', 'trueGrit'],
    gearOptions: [
      gear(
        item('Cutting Torch', 'Palnik'),
        firearm('Watatsumi DV-303 Bolt Gun', 'Kołkownica Watatsumi DV-303'),
      ),
      gear(
        item('D6 Doses of Hydr8tion', 'K6 dawek Naw0dnienia'),
        item('Maintenance Jack', 'Klucz uniwersalny'),
      ),
      gear(
        item('Stash of Hard Liquor', 'Zapas mocnego alkoholu'),
        item('IRC Mk.50 Compression Suit', 'Skafander kompresyjny IRC typ 50'),
      ),
      gear(
        item('Flashlight', 'Latarka'),
        item('Seegson C-Series Magnetic Tape Recorder', 'Magnetofon szpulowy Seegson seria C'),
      ),
    ],
    cash: { dice: 1, multiplier: 100 },
  },
  {
    id: 'scientist',
    label: { en: 'Scientist', pl: 'Naukowiec' },
    keyAttribute: 'wits',
    keySkills: ['observation', 'survival', 'comtech'],
    talents: ['analysis', 'breakthrough', 'inquisitive'],
    gearOptions: [
      gear(
        item('Digital Video Camera', 'Cyfrowa kamera wideo'),
        item('Walkie-Talkie', 'Krótkofalówka'),
      ),
      gear(
        item('Seegson P-DAT', 'Tablet Seegson P-DAT'),
        item('Neurovisual Helmet', 'Hełm neurowizyjny'),
      ),
      gear(
        item('Seegson System Diagnostic Device', 'Narzędzie Diagnostyczne Seegson'),
        item('Personal Data Transmitter', 'Osobisty przekaźnik danych'),
      ),
      gear(
        item('M314 Motion Tracker', 'Wykrywacz ruchu M314'),
        item('Personal Medkit', 'Osobista apteczka'),
      ),
    ],
    cash: { dice: 1, multiplier: 100 },
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

export function cashRange(cash: CashRoll): { min: number; max: number } {
  return { min: cash.dice * cash.multiplier, max: cash.dice * 6 * cash.multiplier }
}

export function findTalent(rules: Rules, id: string): Talent | undefined {
  return rules.talents.find((t) => t.id === id)
}

function talent(id: string, label: Localized, description: Localized): Talent {
  return { id, label, description }
}

function gear(a: GearItem, b: GearItem): GearOption {
  return [a, b]
}

function item(en: string, pl: string): GearItem {
  return { label: { en, pl } }
}

function firearm(en: string, pl: string): GearItem {
  return { label: { en, pl }, firearm: true }
}
