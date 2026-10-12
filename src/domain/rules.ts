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
  androidAttributeBonus: 3,
  androidBonusAttributes: 2,
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
    74,
    { en: 'Banter', pl: 'Mistrz ciętej riposty' },
    {
      en: 'Each turn in a safe place lowers your stress and that of everyone near you by 2, not 1.',
      pl: 'Każda tura w bezpiecznym miejscu obniża stres twój i osób w pobliżu o 2 zamiast o 1.',
    },
    {
      en: 'During a break from the fighting, your jokes ease the tension: for each turn spent in a safe place, your Stress Level and that of everyone within Short range drops by 2 instead of 1. The effect does not stack when several Marines have this talent.',
      pl: 'Za każdą turę odpoczynku w bezpiecznym miejscu twój poziom stresu, a także stres każdego w bliskim zasięgu, maleje o 2, a nie o 1 – rozładowujesz napięcie żartami. Kilku marines z tym talentem to wciąż tylko −2, efekty się nie sumują.',
    },
  ),
  talent(
    'overkill',
    74,
    { en: 'Overkill', pl: 'Szał bojowy' },
    {
      en: 'When you make a Panic Roll, you can turn the fear into an attack instead.',
      pl: 'Przy Teście Paniki możesz zamienić strach w atak.',
    },
    {
      en: 'When a Panic Roll gives a result of 11 or more and you can see enemies, you can replace that panic effect with Overkill. You must attack the enemies at once and keep attacking until you or every enemy you can see is Broken. Every other PC within Short range must make a Panic Roll right away.',
      pl: 'Przy wyniku 11+ w Teście Paniki, gdy w polu widzenia są wrogowie, wolno ci wybrać Szał bojowy w miejsce efektu z tabeli. Wtedy od razu ruszasz do ataku i nie przerywasz go, aż padniesz ty albo każdy widoczny wróg (stan Pokonany). Pozostałe PG w bliskim zasięgu od razu testują Panikę.',
    },
  ),
  talent(
    'pastTheLimit',
    74,
    { en: 'Past the Limit', pl: 'Determinacja' },
    {
      en: 'Push Strength-based skill rolls twice. Each push adds 1 stress.',
      pl: 'Forsujesz testy umiejętności opartych na Sile dwa razy. Każde forsowanie: +1 stres.',
    },
    {
      en: 'You may push any skill roll based on Strength twice instead of once. Each push raises your Stress Level by 1.',
      pl: 'Testy umiejętności opartych na Sile forsujesz do dwóch razy; każde forsowanie to +1 do poziomu stresu.',
    },
  ),
  talent(
    'authority',
    74,
    { en: 'Authority', pl: 'Autorytet' },
    {
      en: 'Use Command instead of Manipulation to bend others to your will.',
      pl: 'Używasz Dowodzenia zamiast Manipulacji, by naginać innych do swojej woli.',
    },
    {
      en: 'Your authority as a Marshal lets you roll Command instead of Manipulation when you try to make others do what you want.',
      pl: 'Gdy próbujesz kimś pokierować wbrew jego woli, rzucasz na Dowodzenie, a nie na Manipulację – tak działa autorytet inspektora.',
    },
  ),
  talent(
    'investigator',
    74,
    { en: 'Investigator', pl: 'Śledczy' },
    {
      en: 'After a turn in a room, roll Observation once; each success buys one question to the GM.',
      pl: 'Po turze w pomieszczeniu testujesz raz Spostrzegawczość; każdy sukces to jedno pytanie do MG.',
    },
    {
      en: 'After spending a turn in a room or a similar place, you may roll Observation; you get only one attempt. For each success, ask the GM one question: what happened here, is something hidden here and where, or is something here out of place. The GM answers truthfully but may be vague or incomplete.',
      pl: 'Tura spędzona w pomieszczeniu lub podobnym miejscu pozwala ci na jeden test Spostrzegawczości, bez powtórek. Każdy sukces to jedno pytanie do MG spośród trzech: co tu zaszło, czy i gdzie coś schowano, co tu nie pasuje. Odpowiedzi MG są prawdziwe, choć bywają mgliste lub niepełne.',
    },
  ),
  talent(
    'subdue',
    74,
    { en: 'Subdue', pl: 'Obezwładnienie' },
    {
      en: 'In close combat against a humanoid, +2 to grapple the target instead of dealing damage.',
      pl: 'W walce wręcz z humanoidem +2 do ataku, ale zamiast obrażeń chwytasz przeciwnika.',
    },
    {
      en: 'When attacking a humanoid in close combat, you can declare that you are subduing them. You get +2 to the attack, but a hit deals no damage: you grab the opponent instead. Extra successes have no effect.',
      pl: 'Przed atakiem wręcz na humanoida deklarujesz obezwładnienie i zyskujesz +2 do testu. Trafienie oznacza chwyt, a nie obrażenia, a nadwyżka sukcesów nic nie daje.',
    },
  ),
  talent(
    'cunning',
    75,
    { en: 'Cunning', pl: 'Przebiegłość' },
    {
      en: 'Push Wits-based skill rolls twice. Each push adds 1 stress.',
      pl: 'Forsujesz testy umiejętności opartych na Sprycie dwa razy. Każde forsowanie: +1 stres.',
    },
    {
      en: 'You may push any skill roll based on Wits twice instead of once. Each push raises your Stress Level by 1.',
      pl: 'Testy umiejętności opartych na Sprycie forsujesz do dwóch razy; każde forsowanie to +1 do poziomu stresu.',
    },
  ),
  talent(
    'personalSafety',
    75,
    { en: 'Personal Safety', pl: 'Osobiste bezpieczeństwo' },
    {
      en: 'When in deadly danger, a Manipulation roll lets someone nearby take the hit instead. +1 stress.',
      pl: 'W śmiertelnym niebezpieczeństwie test Manipulacji przerzuca zagrożenie na kogoś obok. +1 stres.',
    },
    {
      en: 'When you are attacked or otherwise in deadly danger and another PC or friendly NPC is within Short range (in the same zone), roll Manipulation. It is a simple roll, not opposed, and does not count as an action. On a success, that character suffers the attack or danger instead of you. Each use raises your Stress Level by 1.',
      pl: 'Grozi ci atak lub inne śmiertelne niebezpieczeństwo, a w twojej strefie (bliski zasięg) jest inna PG albo przyjazna PN? Rzuć na Manipulację – zwykły test bez przeciwnika, który nie zużywa akcji. Sukces przerzuca atak lub zagrożenie z ciebie na tę postać. Kosztuje cię to +1 do poziomu stresu przy każdym użyciu.',
    },
  ),
  talent(
    'takeControl',
    75,
    { en: 'Take Control', pl: 'Przejęcie kontroli' },
    {
      en: 'Roll Manipulation using Wits instead of Empathy.',
      pl: 'Testujesz Manipulację, używając Sprytu zamiast Empatii.',
    },
    {
      en: 'You roll Manipulation using Wits instead of Empathy.',
      pl: 'Przy Manipulacji podstawą testu jest twój Spryt, a nie Empatia.',
    },
  ),
  talent(
    'beneathNotice',
    75,
    { en: 'Beneath Notice', pl: 'Niezauważalny' },
    {
      en: 'Reroll your own critical injury roll and keep the result you prefer.',
      pl: 'Przerzucasz rzut na ranę ciężką i wybierasz lepszy wynik.',
    },
    {
      en: 'When you roll on the critical injury table for yourself, you may roll again and choose which of the two results applies.',
      pl: 'Rzut na ranę ciężką, który wykonujesz dla siebie, możesz powtórzyć; obowiązuje ten z dwóch wyników, który wybierzesz.',
    },
  ),
  talent(
    'dodge',
    75,
    { en: 'Dodge', pl: 'Unik' },
    {
      en: 'Block close combat attacks with Mobility instead of Close Combat; reduces damage only.',
      pl: 'Blokujesz ataki wręcz Sprawnością zamiast Walką Wręcz; tylko zmniejszasz obrażenia.',
    },
    {
      en: 'When attacked in close combat you can dodge. It works like blocking, but you roll Mobility instead of Close Combat, and successes only reduce the damage, with no counterattack or disarm. You can also dodge creature signature attacks.',
      pl: 'Gdy ktoś atakuje cię wręcz, możesz zrobić unik. Działa jak blokowanie, ale testujesz Sprawność zamiast Walki Wręcz, a sukcesy tylko zmniejszają obrażenia, bez kontrataku i rozbrojenia. Uniknąć możesz także charakterystycznych ataków stworzeń.',
    },
  ),
  talent(
    'nimble',
    75,
    { en: 'Nimble', pl: 'Zwinny' },
    {
      en: 'Push Agility-based skill rolls twice. Each push adds 1 stress.',
      pl: 'Forsujesz testy umiejętności opartych na Zręczności dwa razy. Każde forsowanie: +1 stres.',
    },
    {
      en: 'You may push any skill roll based on Agility twice instead of once. Each push raises your Stress Level by 1.',
      pl: 'Testy umiejętności opartych na Zręczności forsujesz do dwóch razy; każde forsowanie to +1 do poziomu stresu.',
    },
  ),
  talent(
    'calmingPresence',
    75,
    { en: 'Calming Presence', pl: 'Oaza spokoju' },
    {
      en: 'Once per turn in a safe place, lower the stress of another character near you by 1.',
      pl: 'Raz na turę w bezpiecznym miejscu obniżasz o 1 stres innej postaci w pobliżu.',
    },
    {
      en: 'Once per turn you can lower the Stress Level of another character within Short range by 1, on top of the usual ways of losing stress. Both of you must be in a reasonably safe place. You cannot use it on yourself.',
      pl: 'Jedna inna postać w bliskim zasięgu traci 1 poziom stresu raz na turę dzięki twojej obecności; to dodatek do zwykłego odpoczynku. Warunek: ty i ona przebywacie w stosunkowo bezpiecznym miejscu. Na siebie talent nie działa.',
    },
  ),
  talent(
    'compassion',
    75,
    { en: 'Compassion', pl: 'Współczucie' },
    {
      en: 'Push Empathy-based skill rolls twice. Each push adds 1 stress.',
      pl: 'Forsujesz testy umiejętności opartych na Empatii dwa razy. Każde forsowanie: +1 stres.',
    },
    {
      en: 'You may push any skill roll based on Empathy twice instead of once. Each push raises your Stress Level by 1.',
      pl: 'Testy umiejętności opartych na Empatii forsujesz do dwóch razy; każde forsowanie to +1 do poziomu stresu.',
    },
  ),
  talent(
    'fieldSurgeon',
    75,
    { en: 'Field Surgeon', pl: 'Sanitariusz' },
    {
      en: '+2 to Medical Aid when treating someone about to die from a critical injury.',
      pl: '+2 do Pomocy Medycznej przy ratowaniu kogoś umierającego od rany ciężkiej.',
    },
    {
      en: 'You get +2 to Medical Aid when treating someone who is about to die from a critical injury.',
      pl: 'Ratując kogoś, komu rana ciężka grozi rychłą śmiercią, masz +2 do testu Pomocy Medycznej.',
    },
  ),
  talent(
    'fieldCommander',
    76,
    { en: 'Field Commander', pl: 'Dowódca polowy' },
    {
      en: 'Give orders in combat with Command as a fast action, so twice per round.',
      pl: 'Wydajesz rozkazy w walce Dowodzeniem jako akcję szybką, więc dwa razy na rundę.',
    },
    {
      en: 'Giving orders in combat with Command is a fast action for you instead of a slow action, so you can give orders twice in the same round.',
      pl: 'W walce rozkazy wydane Dowodzeniem kosztują cię akcję szybką, a nie wolną – zdążysz więc wydać je dwa razy w jednej rundzie.',
    },
  ),
  talent(
    'influence',
    76,
    { en: 'Influence', pl: 'Wpływy' },
    {
      en: 'Push Empathy-based skill rolls twice. Each push adds 1 stress.',
      pl: 'Forsujesz testy umiejętności opartych na Empatii dwa razy. Każde forsowanie: +1 stres.',
    },
    {
      en: 'You may push any skill roll based on Empathy twice instead of once. Each push raises your Stress Level by 1.',
      pl: 'Testy umiejętności opartych na Empatii forsujesz do dwóch razy; każde forsowanie to +1 do poziomu stresu.',
    },
  ),
  talent(
    'pullRank',
    76,
    { en: 'Pull Rank', pl: 'Wyższa szarża' },
    {
      en: 'Command vs. Manipulation forces a non-officer of your organization to obey one order. +1 stress.',
      pl: 'Dowodzenie przeciw Manipulacji zmusza nie-oficera z twojej organizacji do wykonania rozkazu. +1 stres.',
    },
    {
      en: "You can use Command to give orders to PCs and NPCs who are not officers and belong to your organization. Roll Command against the target's Manipulation; on a success they must carry out the order, even if it puts them at risk of harm. Each success covers one specific action, and it cannot stop actions caused by Panic Rolls. Each use raises your Stress Level by 1.",
      pl: 'Dowodzeniem rozkazujesz PG i PN z twojej organizacji, o ile nie mają stopnia oficerskiego. Rzucasz Dowodzenie przeciw Manipulacji celu; sukces zmusza go do posłuchu, nawet gdy grozi mu przy tym zranienie. Jeden sukces to jedna konkretna akcja, a działań wymuszonych Testem Paniki tak nie zatrzymasz. Każde sięgnięcie po talent to +1 do poziomu stresu.',
    },
  ),
  talent(
    'fullThrottle',
    76,
    { en: 'Full Throttle', pl: 'Pełny ciąg' },
    {
      en: '+2 to Piloting for acceleration and braking when flying a spaceship.',
      pl: '+2 do Pilotowania przy przyspieszaniu i hamowaniu statkiem kosmicznym.',
    },
    {
      en: 'When flying a spaceship, you get +2 to Piloting for every acceleration and braking action.',
      pl: 'Za sterami statku kosmicznego masz +2 do Pilotowania, ilekroć przyspieszasz lub hamujesz.',
    },
  ),
  talent(
    'likeTheBackOfYourHand',
    76,
    { en: 'Like the Back of Your Hand', pl: 'Jak własną kieszeń' },
    {
      en: '+2 to Piloting one specific vehicle or ship. Can be taken again for another.',
      pl: '+2 do Pilotowania jednego konkretnego pojazdu lub statku. Można wybrać ponownie dla innego.',
    },
    {
      en: 'Pick one vehicle or spaceship, a single specific craft rather than a model or type. You get +2 to Piloting it. You can take this talent more than once, each time for a different vehicle.',
      pl: 'Wskaż jedną konkretną maszynę – ten jeden pojazd lub statek kosmiczny, nie cały model ani typ. Pilotując ją, masz +2 do Pilotowania. Talent można brać wielokrotnie, za każdym razem dla innej maszyny.',
    },
  ),
  talent(
    'reckless',
    76,
    { en: 'Reckless', pl: 'Lekkomyślny' },
    {
      en: 'Push Agility-based skill rolls twice. Each push adds 1 stress.',
      pl: 'Forsujesz testy umiejętności opartych na Zręczności dwa razy. Każde forsowanie: +1 stres.',
    },
    {
      en: 'You may push any skill roll based on Agility twice instead of once. Each push raises your Stress Level by 1.',
      pl: 'Testy umiejętności opartych na Zręczności forsujesz do dwóch razy; każde forsowanie to +1 do poziomu stresu.',
    },
  ),
  talent(
    'resilient',
    76,
    { en: 'Resilient', pl: 'Niepowstrzymany' },
    {
      en: 'When you take damage, roll Strength (no skill); each success negates 1 damage.',
      pl: 'Gdy otrzymujesz obrażenia, testujesz Siłę (bez umiejętności); każdy sukces neguje 1 obrażenie.',
    },
    {
      en: 'Every time you take damage, roll Strength alone, without a skill. The roll cannot be pushed and is not an action. Each success negates 1 point of damage; negate it all and you take none.',
      pl: 'Każde otrzymane obrażenia wywołują rzut samą Siłą, bez umiejętności; rzut ten nie zużywa akcji i nie da się go forsować. Sukces odejmuje 1 punkt obrażeń, więc przy odpowiedniej liczbie sukcesów wychodzisz bez szwanku.',
    },
  ),
  talent(
    'theLongHaul',
    76,
    { en: 'The Long Haul', pl: 'Stary wyga' },
    {
      en: 'Once per act (cinematic) or session (campaign), ignore all stress-die 1s in one roll.',
      pl: 'Raz na akt (tryb filmowy) lub sesję (kampania) ignorujesz wszystkie jedynki na kościach stresu w jednym rzucie.',
    },
    {
      en: 'Once per act in cinematic play, or once per session in campaign play, you can ignore every 1 rolled on the stress dice in a single roll.',
      pl: 'W jednym wybranym rzucie pomijasz wszystkie jedynki na kościach stresu. Talent działa raz na akt w trybie filmowym, a w kampanii raz na sesję.',
    },
  ),
  talent(
    'trueGrit',
    76,
    { en: 'True Grit', pl: 'Zahartowany' },
    {
      en: 'Push Strength-based skill rolls twice. Each push adds 1 stress.',
      pl: 'Forsujesz testy umiejętności opartych na Sile dwa razy. Każde forsowanie: +1 stres.',
    },
    {
      en: 'You may push any skill roll based on Strength twice instead of once. Each push raises your Stress Level by 1.',
      pl: 'Testy umiejętności opartych na Sile forsujesz do dwóch razy; każde forsowanie to +1 do poziomu stresu.',
    },
  ),
  talent(
    'analysis',
    77,
    { en: 'Analysis', pl: 'Analiza' },
    {
      en: 'Study an alien artifact or creature for a turn and roll Observation; each success is one question to the GM.',
      pl: 'Po turze obserwacji obcego artefaktu lub istoty testujesz Spostrzegawczość; każdy sukces to jedno pytanie do MG.',
    },
    {
      en: 'After studying a strange or alien artifact or creature for at least one turn, roll Observation. For each success, ask the GM one question: is it human or alien, dead or alive, how old is it, what is it for, how does it work, what trouble could it cause. The GM answers truthfully but may be vague. A successful roll also lowers the Stress Level of every PC within Short range by 1; a failed roll raises it by 1.',
      pl: 'Gdy przez co najmniej turę przyglądasz się dziwnemu lub obcemu artefaktowi albo istocie, rzucasz na Spostrzegawczość. Każdy sukces to jedno pytanie do MG: ludzkie czy obce, martwe czy żywe, jak stare, do czego służy, jak działa, jakie kłopoty może sprawić. Odpowiedzi są prawdziwe, choć bywają mgliste. Sukces daje też wszystkim PG w bliskim zasięgu −1 do poziomu stresu, a porażka +1.',
    },
  ),
  talent(
    'breakthrough',
    77,
    { en: 'Breakthrough', pl: 'Przełom' },
    {
      en: 'Once per session, automatically pass an Observation roll of your choice (GM may veto).',
      pl: 'Raz na sesję automatycznie zdajesz wybrany test Spostrzegawczości (MG może odmówić).',
    },
    {
      en: 'Once per session you automatically pass an Observation roll of your choice without rolling. The GM has the final say on whether it can be used for that roll, so it does not spoil the scenario.',
      pl: 'Raz na sesję wybierasz test Spostrzegawczości, który zaliczasz z automatu, bez rzutu. Czy talent można zastosować w danej sytuacji, rozstrzyga MG, aby nie zdradzić fabuły scenariusza.',
    },
  ),
  talent(
    'inquisitive',
    77,
    { en: 'Inquisitive', pl: 'Dociekliwy' },
    {
      en: 'Push Wits-based skill rolls twice. Each push adds 1 stress.',
      pl: 'Forsujesz testy umiejętności opartych na Sprycie dwa razy. Każde forsowanie: +1 stres.',
    },
    {
      en: 'You may push any skill roll based on Wits twice instead of once. Each push raises your Stress Level by 1.',
      pl: 'Testy umiejętności opartych na Sprycie forsujesz do dwóch razy; każde forsowanie to +1 do poziomu stresu.',
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

function talent(
  id: string,
  page: number,
  label: Localized,
  description: Localized,
  details: Localized,
): Talent {
  return { id, label, description, details, page }
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
