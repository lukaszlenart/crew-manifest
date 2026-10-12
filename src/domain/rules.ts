import type {
  Career,
  CashRoll,
  GearItem,
  GearOption,
  Localized,
  Rules,
  Talent,
  TalentId,
} from './types'

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

// Career talents first, then general talents (gained later through experience).
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
  talent(
    'merciless',
    78,
    { en: 'Merciless', pl: 'Bezlitosny' },
    {
      en: 'Perform a coup de grâce without an Empathy roll; your stress drops by 1 whenever you Break an enemy.',
      pl: 'Dobijasz bez testu Empatii, a każdy wróg, którego Pokonasz, obniża twój stres o 1.',
    },
    {
      en: 'You can perform a coup de grâce without first rolling Empathy (see Combat). Each time you make an enemy Broken, your Stress Level drops by 1.',
      pl: 'Dobicie (patrz Walka) nie wymaga od ciebie wcześniejszego testu Empatii. Ilekroć sprawisz, że wróg zostanie Pokonany, twój poziom stresu maleje o 1.',
    },
  ),
  // TODO: uzupełnić z podręcznika
  talent(
    'stealthy',
    78,
    { en: 'Stealthy', pl: 'Cichy' },
    {
      en: '+2 to Mobility when you use it to sneak.',
      pl: '+2 do Sprawności, gdy się skradasz.',
    },
    {
      en: 'Whenever you roll Mobility to move unseen and unheard, you get a +2 modifier (see Combat).',
      pl: 'Gdy testujesz Sprawność, aby przemknąć niezauważony, dostajesz modyfikator +2 (patrz Walka).',
    },
  ),
  // TODO: uzupełnić z podręcznika
  talent(
    'fullAuto',
    78,
    { en: 'Full Auto', pl: 'Człowiek-demolka' },
    {
      en: 'Firing full auto does not raise your Stress Level.',
      pl: 'Strzelanie ogniem ciągłym nie podnosi twojego poziomu stresu.',
    },
    {
      en: 'When you fire full auto, your Stress Level does not go up from it (see Combat).',
      pl: 'Prowadzenie ognia ciągłego nie dokłada ci ani punktu do poziomu stresu (patrz Walka).',
    },
  ),
  // TODO: uzupełnić z podręcznika
  talent(
    'counselor',
    78,
    { en: 'Counselor', pl: 'Doradca' },
    {
      en: 'Once per turn, roll Command to calm another character at Short range; each success removes 1 more stress.',
      pl: 'Raz na turę testujesz Dowodzenie, by uspokoić kogoś w bliskim zasięgu; każdy sukces to −1 stresu więcej.',
    },
    {
      en: 'Once per turn you can roll Command to lower the Stress Level of another character within Short range. On top of the usual reduction of 1, each success lowers their Stress Level by 1 more. It works only on others, never on you.',
      pl: 'Raz na turę możesz uspokajać inną postać w bliskim zasięgu, testując Dowodzenie. Poza zwykłym spadkiem o 1, jej poziom stresu maleje o kolejny punkt za każdy sukces. Działa wyłącznie na innych – ty sam z niego nie skorzystasz.',
    },
  ),
  // TODO: uzupełnić z podręcznika
  talent(
    'captain',
    78,
    { en: 'Captain', pl: 'Dowódca okrętu' },
    {
      en: 'As captain in space combat, draw two initiative cards and keep the one you want.',
      pl: 'Jako kapitan w walce kosmicznej dobierasz dwie karty inicjatywy i wybierasz jedną.',
    },
    {
      en: 'When you act as the captain of a spaceship in space combat (see Space Combat), you draw two initiative cards instead of one and choose which to use.',
      pl: 'Gdy w walce kosmicznej dowodzisz statkiem jako kapitan (patrz Walka kosmiczna), przy ustalaniu inicjatywy ciągniesz dwie karty, a nie jedną, i sam decydujesz, którą zatrzymać.',
    },
  ),
  talent(
    'secondWind',
    78,
    { en: 'Second Wind', pl: 'Drugi oddech' },
    {
      en: 'When Broken, roll Stamina to get back up at once; each success restores 1 Health.',
      pl: 'Gdy zostaniesz Pokonany, test Kondycji pozwala ci od razu wstać; każdy sukces to 1 punkt Zdrowia.',
    },
    {
      en: 'When you are Broken, you can get back on your feet right away instead of waiting for someone to give you first aid (see Combat). Roll Stamina: each success restores 1 Health. Usable once per turn; it does not help against critical injuries.',
      pl: 'Stan Pokonany nie musi cię unieruchomić do czasu pierwszej pomocy (patrz Walka) – możesz od razu spróbować wstać. Rzucasz na Kondycję i odzyskujesz 1 punkt Zdrowia za każdy sukces. Talent działa raz na turę i nie pomaga przy ranach ciężkich.',
    },
  ),
  talent(
    'menacing',
    78,
    { en: 'Menacing', pl: 'Groźny' },
    {
      en: 'Intimidate with Manipulation based on Strength instead of Empathy; a cowed target gets nothing in return.',
      pl: 'Zastraszając, testujesz Manipulację na Sile zamiast Empatii; ustępujący cel nic w zamian nie dostaje.',
    },
    {
      en: 'When you intimidate someone to make them do what you want, you may roll Manipulation using Strength instead of Empathy. If you succeed, they cannot ask for anything in return, though they may still choose to attack you rather than give in.',
      pl: 'Gdy groźbą chcesz kogoś do czegoś zmusić, test Manipulacji możesz oprzeć na Sile, a nie na Empatii. Po sukcesie ofiara nie stawia ci żadnych warunków, choć wciąż może wybrać atak zamiast uległości.',
    },
  ),
  // TODO: uzupełnić z podręcznika
  talent(
    'fastHealer',
    78,
    { en: 'Fast Healer', pl: 'Jak na psie' },
    {
      en: 'Your critical injuries take half the usual time to heal.',
      pl: 'Rany ciężkie goją się u ciebie dwa razy szybciej.',
    },
    {
      en: 'The healing time of each of your critical injuries is halved (see Combat).',
      pl: 'Czas potrzebny na wyleczenie każdej twojej rany ciężkiej skraca się o połowę (patrz Walka).',
    },
  ),
  // TODO: uzupełnić z podręcznika
  talent(
    'shortSleeper',
    78,
    { en: 'Short Sleeper', pl: 'Krótki sen' },
    {
      en: 'You need to sleep only one shift every two days, not every day.',
      pl: 'Wystarcza ci jedna wachta snu na dwie doby zamiast codziennie.',
    },
    {
      en: 'You must sleep one shift every other day rather than one shift each day.',
      pl: 'Śpisz przez jedną wachtę raz na dwa dni, a nie każdego dnia.',
    },
  ),
  // TODO: uzupełnić z podręcznika
  talent(
    'shipMechanic',
    78,
    { en: 'Ship Mechanic', pl: 'Mechanik okrętowy' },
    {
      en: '+2 to Heavy Machinery and Comtech when repairing damage to a spaceship.',
      pl: '+2 do Ciężkiego Sprzętu i Komputerów przy naprawie uszkodzeń statku kosmicznego.',
    },
    {
      en: 'Whenever you roll Heavy Machinery or Comtech to fix damage to a spaceship, you get a +2 modifier (see Space Combat).',
      pl: 'Naprawiając uszkodzony statek kosmiczny za pomocą Ciężkiego Sprzętu albo Komputerów, rzucasz z modyfikatorem +2 (patrz Walka kosmiczna).',
    },
  ),
  // TODO: uzupełnić z podręcznika
  talent(
    'rebellious',
    78,
    { en: 'Rebellious', pl: 'Narwaniec' },
    {
      en: '+2 to opposed Manipulation rolls whenever someone tries to order you around.',
      pl: '+2 do spornych testów Manipulacji, gdy ktoś próbuje ci rozkazywać.',
    },
    {
      en: 'When someone tries to give you orders, you get +2 to opposed Manipulation rolls. This also helps you resist the Officer talent Pull Rank.',
      pl: 'Każda próba wydania ci rozkazu daje ci +2 do spornego testu Manipulacji. Bonus działa również przeciwko Wyższej szarży, talentowi Oficera.',
    },
  ),
  talent(
    'lightEater',
    78,
    { en: 'Light Eater', pl: 'Niejadek' },
    {
      en: 'Roll two fewer dice on food Supply Rolls (minimum one).',
      pl: 'W Testach Zapasów żywności rzucasz o dwie kości mniej (co najmniej jedną).',
    },
    {
      en: 'When you make a Supply Roll for food, you roll two dice fewer than your food supply rating, but always at least one die.',
      pl: 'Test Zapasów dla żywności wykonujesz pulą mniejszą o dwie kości od twojego stanu zapasów żywności. Pula nie może jednak spaść poniżej jednej kości.',
    },
  ),
  // TODO: uzupełnić z podręcznika
  talent(
    'resistant',
    78,
    { en: 'Resistant', pl: 'Niewzruszony' },
    {
      en: 'You may roll Stamina with Wits in place of Strength.',
      pl: 'Do testów Kondycji możesz brać Spryt w miejsce Siły.',
    },
    {
      en: 'Your Stamina rolls may be based on Wits rather than Strength.',
      pl: 'Przy teście Kondycji wolno ci dodać do puli Spryt w miejsce Siły.',
    },
  ),
  talent(
    'bodyguard',
    78,
    { en: 'Bodyguard', pl: 'Ochroniarz' },
    {
      en: 'Roll Mobility to take a hit aimed at someone within Short range of you.',
      pl: 'Test Sprawności pozwala ci przyjąć trafienie wymierzone w kogoś w bliskim zasięgu.',
    },
    {
      en: 'When someone within Short range of you is about to be hit by an attack, you can throw yourself in the way. Roll Mobility; it does not count as an action in combat and you may push it. With at least one success, the attack hits you instead of the original target.',
      pl: 'Gdy atak ma właśnie dosięgnąć kogoś w bliskim zasięgu od ciebie, możesz rzucić się na linię strzału lub ciosu. Testujesz Sprawność – to nie zużywa akcji w walce, a rzut wolno forsować. Wystarczy jeden sukces, by trafienie zamiast w pierwotny cel poszło w ciebie.',
    },
  ),
  // TODO: uzupełnić z podręcznika
  talent(
    'heavyBlow',
    78,
    { en: 'Heavy Blow', pl: 'Silny cios' },
    {
      en: '+2 to Close Combat if you spend a fast action on it.',
      pl: '+2 do Walki Wręcz kosztem akcji szybkiej.',
    },
    {
      en: 'By spending a fast action, you get a +2 modifier to a Close Combat roll.',
      pl: 'Gdy przeznaczysz na to akcję szybką, twój test Walki Wręcz zyskuje modyfikator +2.',
    },
  ),
  talent(
    'stash',
    78,
    { en: 'Stash', pl: 'Skrytka' },
    {
      en: 'Start each session with an extra hidden item of your choice.',
      pl: 'Każdą sesję zaczynasz z dodatkowym, ukrytym przedmiotem według własnego wyboru.',
    },
    {
      en: 'At the start of each session you have one extra item of your choice, hidden on you or somewhere safe. It must be something you could normally get hold of, and the GM has the final say. If the GM allows, you can wait until the most dramatic moment of the session to decide what the item is.',
      pl: 'Na początku każdej sesji masz przy sobie albo w bezpiecznym schowku jeden przedmiot więcej, który sam wybierasz. Powinien to być przedmiot realnie dla ciebie dostępny – rozstrzyga MG. Za jego zgodą wybór możesz odłożyć do najbardziej dramatycznej chwili sesji.',
    },
  ),
  // TODO: uzupełnić z podręcznika
  talent(
    'deepBreather',
    79,
    { en: 'Deep Breather', pl: 'Spokojny oddech' },
    {
      en: 'Roll two fewer dice on air Supply Rolls (minimum one).',
      pl: 'W Testach Zapasów tlenu rzucasz o dwie kości mniej (co najmniej jedną).',
    },
    {
      en: 'When you make a Supply Roll for air, you roll two dice fewer than your air supply rating, but always at least one die.',
      pl: 'Test Zapasów dla tlenu wykonujesz pulą mniejszą o dwie kości od twojego stanu zapasów tlenu. Pula nie może jednak spaść poniżej jednej kości.',
    },
  ),
  talent(
    'nervesOfSteel',
    79,
    { en: 'Nerves of Steel', pl: 'Stalowe nerwy' },
    {
      en: '−2 to all your Panic Rolls.',
      pl: '−2 do wszystkich twoich Testów Paniki.',
    },
    {
      en: 'You make every Panic Roll with a −2 modifier.',
      pl: 'Każdy Test Paniki wykonujesz z modyfikatorem −2.',
    },
  ),
  // TODO: uzupełnić z podręcznika
  talent(
    'shipGunner',
    79,
    { en: 'Ship Gunner', pl: 'Strzelec okrętowy' },
    {
      en: '+2 to Ranged Combat as a gunner in space combat.',
      pl: '+2 do Walki Dystansowej, gdy obsługujesz działa w walce kosmicznej.',
    },
    {
      en: "When you serve as a spaceship's gunner in space combat (see Space Combat), your Ranged Combat rolls get a +2 modifier.",
      pl: 'Zajmując stanowisko strzelca na statku kosmicznym podczas walki kosmicznej (patrz Walka kosmiczna), testujesz Walkę Dystansową z modyfikatorem +2.',
    },
  ),
  talent(
    'quickdraw',
    79,
    { en: 'Quickdraw', pl: 'Szybkie dobywanie' },
    {
      en: 'Drawing a weapon costs you no action.',
      pl: 'Dobycie broni nie zużywa żadnej twojej akcji.',
    },
    {
      en: 'You draw your weapon so fast that it does not take an action.',
      pl: 'Wyciągasz broń w mgnieniu oka, nie poświęcając na to akcji.',
    },
  ),
  talent(
    'rapidReload',
    79,
    { en: 'Rapid Reload', pl: 'Szybkie przeładowanie' },
    {
      en: 'Reload a weapon as a fast action instead of a slow action.',
      pl: 'Przeładowanie broni to dla ciebie akcja szybka, nie wolna.',
    },
    {
      en: 'Reloading takes you a fast action rather than a slow action.',
      pl: 'Na przeładowanie broni wydajesz akcję szybką zamiast wolnej.',
    },
  ),
  talent(
    'fastReflexes',
    79,
    { en: 'Fast Reflexes', pl: 'Szybki refleks' },
    {
      en: 'Draw two initiative cards and keep the one you prefer.',
      pl: 'Dobierasz dwie karty inicjatywy i zatrzymujesz wybraną.',
    },
    {
      en: 'When initiative is drawn (see Combat), you draw two cards instead of one. Keep the one you want and shuffle the other back into the deck before the other players draw.',
      pl: 'Przy ustalaniu inicjatywy (patrz Walka) ciągniesz dwie karty, a nie jedną. Jedną zostawiasz sobie, a drugą wtasowujesz z powrotem do talii, nim pozostali gracze wezmą swoje.',
    },
  ),
  talent(
    'rapidFire',
    79,
    { en: 'Rapid Fire', pl: 'Szybkostrzelność' },
    {
      en: 'Fire a pistol or rifle as a fast action instead of a slow action, at −2.',
      pl: 'Strzelasz z pistoletu lub karabinu w ramach akcji szybkiej, ale z modyfikatorem −2.',
    },
    {
      en: 'You can shoot a pistol or a rifle (see Gear) as a fast action rather than a slow action, but such a shot gets a −2 modifier.',
      pl: 'Strzał z pistoletu albo karabinu (patrz Ekwipunek) może cię kosztować tylko akcję szybką zamiast wolnej. Płacisz za to modyfikatorem −2 do rzutu.',
    },
  ),
  talent(
    'packMule',
    79,
    { en: 'Pack Mule', pl: 'Tragarz' },
    {
      en: 'You can carry twice as many items as normal before becoming encumbered.',
      pl: 'Twój limit przedmiotów przed przeciążeniem jest dwukrotnie wyższy.',
    },
    {
      en: 'Your carrying capacity is doubled: you can carry twice as many items as normal before you become encumbered.',
      pl: 'Limit przedmiotów, które nosisz bez przeciążenia, jest u ciebie dwukrotnie wyższy niż normalnie.',
    },
  ),
  talent(
    'zeroGTraining',
    79,
    { en: 'Zero-G Training', pl: 'Trening w stanie nieważkości' },
    {
      en: '+2 to Mobility in zero gravity.',
      pl: '+2 do Sprawności w stanie nieważkości.',
    },
    {
      en: 'In zero-G, every Mobility roll you make gets a +2 modifier.',
      pl: 'W warunkach braku grawitacji każdy twój test Sprawności zyskuje modyfikator +2.',
    },
  ),
  talent(
    'tough',
    79,
    { en: 'Tough', pl: 'Twardziel' },
    {
      en: 'Your maximum Health is Strength + 2.',
      pl: 'Twoje maksymalne Zdrowie wynosi Siła + 2.',
    },
    {
      en: 'Your Health increases by 2, so your maximum Health equals your Strength plus 2.',
      pl: 'Zdrowie rośnie ci o 2 – jego maksimum to od teraz twoja Siła powiększona o 2.',
    },
  ),
  // TODO: uzupełnić z podręcznika
  talent(
    'lightweight',
    79,
    { en: 'Lightweight', pl: 'Waga lekka' },
    {
      en: 'Block in close combat using Agility instead of Strength.',
      pl: 'Do bloku w walce wręcz rzucasz Zręcznością, nie Siłą.',
    },
    {
      en: 'When you block an attack in close combat, you may roll with Agility instead of Strength.',
      pl: 'Przy bloku w walce wręcz możesz rzucać Zręcznością w miejsce Siły.',
    },
  ),
  // TODO: uzupełnić z podręcznika
  talent(
    'spacewalker',
    79,
    { en: 'Spacewalker', pl: 'Wyszkolony astronauta' },
    {
      en: '+2 to Heavy Machinery and Comtech during a spacewalk.',
      pl: '+2 do Ciężkiego Sprzętu i Komputerów podczas spaceru kosmicznego.',
    },
    {
      en: 'While you are on a spacewalk, your Heavy Machinery and Comtech rolls get a +2 modifier.',
      pl: 'Na spacerze kosmicznym testy Ciężkiego Sprzętu oraz Komputerów wykonujesz z modyfikatorem +2.',
    },
  ),
  talent(
    'weaponSpecialist',
    79,
    { en: 'Weapon Specialist', pl: 'Ulubiona broń' },
    {
      en: '+2 when you use one chosen weapon model.',
      pl: '+2, gdy walczysz wybranym modelem broni.',
    },
    {
      en: 'Pick one specific weapon model from the weapon list (see Gear); you get +2 whenever you use it. You can take this talent several times, each time for a different model, and you may choose unarmed attacks instead of a weapon.',
      pl: 'Wybierasz z listy broni (patrz Ekwipunek) jeden konkretny model i dostajesz +2 za każdym razem, gdy z niego korzystasz. Talent da się wziąć wielokrotnie, zawsze dla innego modelu; zamiast broni możesz też wskazać walkę bez broni.',
    },
  ),
  talent(
    'watchful',
    79,
    { en: 'Watchful', pl: 'Uważny' },
    {
      en: '+2 to Observation to spot a surprise attack.',
      pl: '+2 do Spostrzegawczości, by dostrzec atak z zaskoczenia.',
    },
    {
      en: 'You get +2 to Observation when you try to notice a surprise attack.',
      pl: 'Wypatrując ataku z zaskoczenia, testujesz Spostrzegawczość z modyfikatorem +2.',
    },
  ),
  talent(
    'killer',
    79,
    { en: 'Killer', pl: 'Zabójca' },
    {
      en: 'When a human opponent suffers a critical injury, you may swap the two D66 dice.',
      pl: 'Gdy ludzki przeciwnik otrzymuje ranę ciężką, możesz zamienić kości rzutu k66 miejscami.',
    },
    {
      en: 'When your opponent suffers a critical injury (see Combat), you may swap the D66 dice so the ones die becomes the tens die and vice versa. This works only against humans.',
      pl: 'Ranę ciężką twojego przeciwnika (patrz Walka) losuje się rzutem k66 – ty możesz zamienić w nim kości rolami, tak by jedności stały się dziesiątkami, a dziesiątki jednościami. Talent działa tylko na ludzi.',
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

export function careersOf(rules: Rules, talentId: TalentId): Career[] {
  return rules.careers.filter((c) => c.talents.includes(talentId))
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
