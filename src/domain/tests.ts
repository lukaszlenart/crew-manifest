import type { Localized } from './types'

export type TestId = string

export type TestGroup = 'core' | 'hazard'

export const TEST_GROUPS: readonly TestGroup[] = ['core', 'hazard']

export interface TestRoll {
  pool: Localized
  canPush: boolean
  stressDice: boolean
}

export interface TestTable {
  caption: Localized
  columns: Localized[]
  rows: Localized[][]
}

export interface TestEntry {
  id: TestId
  group: TestGroup
  label: Localized
  summary: Localized
  roll: TestRoll
  when: Localized
  outcome: Localized
  table?: TestTable
  related: TestId[]
  /** Printed rulebook page. */
  page: number
}

export interface PrimerSection {
  id: string
  label: Localized
  text: Localized
  page: number
}

/** Each group in book order. */
export const TESTS: readonly TestEntry[] = [
  {
    id: 'supply',
    group: 'core',
    page: 34,
    label: { en: 'Supply roll', pl: 'Test Zapasów' },
    summary: {
      en: 'Tracks air, power, food and water: each roll may lower a supply rating.',
      pl: 'Śledzi tlen, energię, żywność i wodę: każdy rzut może obniżyć stan zapasów.',
    },
    roll: {
      pool: {
        en: 'Stress dice = supply rating (max 6)',
        pl: 'Kości stresu = stan zapasów (maks. 6)',
      },
      canPush: false,
      stressDice: false,
    },
    when: {
      en: 'At regular intervals once the GM asks you to track a resource; the table is the GM’s guide per resource.',
      pl: 'W regularnych odstępach, gdy MG każe śledzić zasób; tabela podpowiada MG, jak często dla każdego zasobu.',
    },
    outcome: {
      en: 'Each 1 rolled lowers the rating by one. At zero the resource is used up.',
      pl: 'Każda wyrzucona jedynka obniża stan zapasów o jeden. Przy zerze zasób jest wyczerpany.',
    },
    table: {
      caption: { en: 'When to roll', pl: 'Kiedy rzucać' },
      columns: [
        { en: 'Resource', pl: 'Zasób' },
        { en: 'Roll', pl: 'Test' },
      ],
      rows: [
        [
          { en: 'Air', pl: 'Tlen' },
          {
            en: 'Every turn and after any exhausting effort, such as combat or a Mobility roll',
            pl: 'Co turę i po każdym wyczerpującym wysiłku, np. walce lub teście Sprawności',
          },
        ],
        [
          { en: 'Water', pl: 'Woda' },
          {
            en: 'Once a day and after any exhausting effort',
            pl: 'Raz dziennie i po każdym wyczerpującym wysiłku',
          },
        ],
        [
          { en: 'Food', pl: 'Żywność' },
          { en: 'Once a day', pl: 'Raz dziennie' },
        ],
        [
          { en: 'Power', pl: 'Energia' },
          {
            en: 'Depends on the situation and the gear in use (see Gear)',
            pl: 'Zależnie od sytuacji i używanego sprzętu (patrz Ekwipunek)',
          },
        ],
      ],
    },
    related: [],
  },
  {
    id: 'survival',
    group: 'core',
    page: 99,
    label: { en: 'Survival roll', pl: 'Test Przeżycia' },
    summary: {
      en: 'A Stamina roll that decides whether a dying character lives a little longer.',
      pl: 'Test Kondycji, który rozstrzyga, czy umierająca postać przeżyje jeszcze chwilę.',
    },
    roll: {
      pool: { en: 'Strength + Stamina', pl: 'Siła + Kondycja' },
      canPush: false,
      stressDice: false,
    },
    when: {
      en: 'When the time limit of a fatal critical injury runs out, and whenever a hazard calls for it while you are Broken.',
      pl: 'Gdy minie czas śmiertelnej rany ciężkiej oraz zawsze, gdy zagrożenie tego wymaga, a postać jest Pokonana.',
    },
    outcome: {
      en: 'Failure: the character dies. Success: they hold on, but roll again when the same time passes. First aid (a Medical Aid roll) given before a failed roll can save them.',
      pl: 'Porażka: postać umiera. Sukces: trzyma się, ale po upływie tego samego czasu rzuca ponownie. Pierwsza pomoc (test Pomocy Medycznej) udzielona przed nieudanym testem może ją ocalić.',
    },
    related: [],
  },
  {
    id: 'panic',
    group: 'core',
    page: 104,
    label: { en: 'Panic roll', pl: 'Test Paniki' },
    summary: {
      en: 'When stress boils over: roll D6, add your Stress Level and read the result.',
      pl: 'Gdy stres wymyka się spod kontroli: rzuć K6, dodaj poziom stresu i sprawdź wynik.',
    },
    roll: {
      pool: { en: 'D6 + Stress Level', pl: 'K6 + poziom stresu' },
      canPush: false,
      stressDice: false,
    },
    when: {
      en: 'Any 1 on the stress dice of a skill roll (that roll can no longer be pushed); seeing a friend hit by certain panic effects; being pinned down by ranged fire; a critical injury; a first attack by an unknown alien creature; a truly terrible event.',
      pl: 'Jedynka na kościach stresu w teście umiejętności (tego testu nie można już forsować); widok przyjaciela pod wpływem niektórych efektów paniki; przygwożdżenie ogniem; rana ciężka; pierwszy atak nieznanej obcej istoty; naprawdę straszne wydarzenie.',
    },
    outcome: {
      en: 'The higher the total, the worse the reaction. At 10+ a forced panic action replaces the action you rolled for, even a successful one. A new panic while already panicking (7+) replaces the old effect and is at least one step worse. A total of 13+ means an Empathy roll after the session for a permanent mental trauma.',
      pl: 'Im wyższy wynik, tym gorsza reakcja. Od 10 wymuszona akcja w panice zastępuje akcję, na którą rzucano, nawet udaną. Nowa panika w trakcie paniki (7+) zastępuje stary efekt i jest co najmniej o stopień gorsza. Wynik 13+ oznacza po sesji test Empatii na trwały uraz psychiczny.',
    },
    table: {
      caption: { en: 'Panic results', pl: 'Skutki paniki' },
      columns: [
        { en: 'Total', pl: 'Wynik' },
        { en: 'Effect', pl: 'Efekt' },
      ],
      rows: [
        [
          { en: '1–6', pl: '1–6' },
          {
            en: 'Keeping it together: you hold your nerve, barely.',
            pl: 'Jakoś się trzymasz: z trudem panujesz nad nerwami.',
          },
        ],
        [
          { en: '7', pl: '7' },
          {
            en: 'Nervous twitch: Stress Level +1 for you and friendly PCs at Short range.',
            pl: 'Tik nerwowy: poziom stresu +1 dla ciebie i przyjaznych PG w bliskim zasięgu.',
          },
        ],
        [
          { en: '8', pl: '8' },
          {
            en: 'Tremble: −2 to Agility-based skill rolls until the panic ends.',
            pl: 'Drgawki: −2 do testów umiejętności opartych na Zręczności, aż panika minie.',
          },
        ],
        [
          { en: '9', pl: '9' },
          {
            en: 'Drop item: you drop a weapon or other key item (GM picks); Stress Level +1.',
            pl: 'Upuszczenie przedmiotu: wypada ci broń lub ważny przedmiot (wybiera MG); poziom stresu +1.',
          },
        ],
        [
          { en: '10', pl: '10' },
          {
            en: 'Freeze: you lose your next slow action; Stress Level +1 for you and nearby friends.',
            pl: 'Zamarcie: tracisz następną akcję wolną; poziom stresu +1 dla ciebie i przyjaciół w pobliżu.',
          },
        ],
        [
          { en: '11', pl: '11' },
          {
            en: 'Seek cover: your next action moves you to safety; your stress −1, nearby friends +1.',
            pl: 'Kryjówka: następną akcją uciekasz w bezpieczne miejsce; twój stres −1, przyjaciół obok +1.',
          },
        ],
        [
          { en: '12', pl: '12' },
          {
            en: 'Scream: you lose your next slow action; stress −1; every friend who hears rolls for panic.',
            pl: 'Krzyk: tracisz następną akcję wolną; stres −1; każdy słyszący przyjaciel testuje panikę.',
          },
        ],
        [
          { en: '13', pl: '13' },
          {
            en: 'Flee: you run for safety and will not stop; stress −1; friends who see it roll for panic.',
            pl: 'Ucieczka: uciekasz w bezpieczne miejsce i nie dasz się zatrzymać; stres −1; widzący testują panikę.',
          },
        ],
        [
          { en: '14', pl: '14' },
          {
            en: 'Frenzy: you attack the nearest person or creature until one of you is Broken.',
            pl: 'Morderczy szał: atakujesz najbliższą osobę lub istotę, aż któreś z was będzie Pokonane.',
          },
        ],
        [
          { en: '15+', pl: '15+' },
          {
            en: 'Catatonic: you collapse, staring, unable to speak or move.',
            pl: 'Katatonia: padasz na ziemię, wpatrzony w pustkę, nie mówisz i się nie ruszasz.',
          },
        ],
      ],
    },
    related: ['stopPanic'],
  },
  {
    id: 'stopPanic',
    group: 'core',
    page: 104,
    label: { en: 'Stopping panic', pl: 'Powstrzymywanie paniki' },
    summary: {
      en: 'A friend can talk a panicking character down with a Command roll.',
      pl: 'Przyjaciel może opanować panikującą postać testem Dowodzenia.',
    },
    roll: {
      pool: {
        en: 'Empathy + Command (another character)',
        pl: 'Empatia + Dowodzenie (inna postać)',
      },
      canPush: true,
      stressDice: true,
    },
    when: {
      en: 'A character is under a panic effect that lasts beyond the moment. In combat the Command roll is a slow action.',
      pl: 'Postać jest pod wpływem efektu paniki, który trwa dłużej niż chwilę. W walce test Dowodzenia to akcja wolna.',
    },
    outcome: {
      en: 'Success ends the panic effect. Without help it also ends when the character is Broken or after one turn.',
      pl: 'Sukces kończy efekt paniki. Bez pomocy efekt mija też, gdy postać zostanie Pokonana, lub po jednej turze.',
    },
    related: ['panic'],
  },
  {
    id: 'vacuum',
    group: 'hazard',
    page: 107,
    label: { en: 'Vacuum and cold', pl: 'Próżnia i wychłodzenie' },
    summary: {
      en: 'Unprotected in vacuum or exposed to cold: repeated Stamina rolls until you get to safety.',
      pl: 'Bez ochrony w próżni lub na mrozie: powtarzane testy Kondycji, aż znajdziesz bezpieczne miejsce.',
    },
    roll: {
      pool: { en: 'Strength + Stamina', pl: 'Siła + Kondycja' },
      canPush: true,
      stressDice: true,
    },
    when: {
      en: 'Vacuum: every round before acting, not an action; −1 more each round after the first. Cold without proper clothing or shelter: as often as the table says.',
      pl: 'Próżnia: co rundę przed działaniem, bez zużycia akcji; od drugiej rundy modyfikator rośnie o −1. Chłód bez odzieży lub schronienia: tak często, jak podaje tabela.',
    },
    outcome: {
      en: 'Vacuum failure: Health drops to zero (no critical injury) and you make a Survival roll every round until dead or back in normal pressure. Cold failure: 1 damage and Stress Level +1; while cold you cannot heal or shed stress; if Broken, every further cold roll is a Survival roll.',
      pl: 'Porażka w próżni: Zdrowie spada do zera (bez rany ciężkiej), a co rundę wykonujesz Test Przeżycia, aż umrzesz lub wrócisz do normalnego ciśnienia. Porażka na mrozie: 1 obrażenie i poziom stresu +1; wychłodzony nie leczysz się i nie pozbywasz stresu; Pokonany zamiast testu Kondycji wykonuje Test Przeżycia.',
    },
    table: {
      caption: { en: 'How often to roll', pl: 'Jak często rzucać' },
      columns: [
        { en: 'Condition', pl: 'Warunki' },
        { en: 'Roll', pl: 'Test' },
      ],
      rows: [
        [
          { en: 'Vacuum', pl: 'Próżnia' },
          { en: 'Every round', pl: 'Co rundę' },
        ],
        [
          { en: 'Cold, above freezing', pl: 'Chłód powyżej zera' },
          { en: 'Once a day', pl: 'Raz dziennie' },
        ],
        [
          { en: 'Below freezing', pl: 'Poniżej zera' },
          { en: 'Once per shift', pl: 'Raz na wachtę' },
        ],
        [
          { en: 'Cold of deep space', pl: 'Chłód kosmicznej pustki' },
          { en: 'Every round', pl: 'Co rundę' },
        ],
      ],
    },
    related: ['survival'],
  },
  {
    id: 'fall',
    group: 'hazard',
    page: 108,
    label: { en: 'Fall', pl: 'Upadek' },
    summary: {
      en: 'A fall onto a hard surface deals damage by height; a controlled fall lets you soften it.',
      pl: 'Upadek na twardą powierzchnię zadaje obrażenia zależne od wysokości; kontrolowany upadek można złagodzić.',
    },
    roll: {
      pool: {
        en: 'Agility + Mobility (controlled fall only)',
        pl: 'Zręczność + Sprawność (tylko upadek kontrolowany)',
      },
      canPush: true,
      stressDice: true,
    },
    when: { en: 'You fall onto a hard surface.', pl: 'Spadasz na twardą powierzchnię.' },
    outcome: {
      en: 'Damage equals the height in metres halved, rounded down, with no roll. In a controlled fall each success on the Mobility roll removes 1 damage. Armour also protects.',
      pl: 'Obrażenia równe wysokości w metrach podzielonej przez 2 (w dół), bez rzutu. W kontrolowanym upadku każdy sukces w teście Sprawności zmniejsza obrażenia o 1. Chroni też pancerz.',
    },
    related: [],
  },
  {
    id: 'fire',
    group: 'hazard',
    page: 108,
    label: { en: 'Fire', pl: 'Ogień' },
    summary: {
      en: 'Fire rolls its intensity against you every round until it deals no damage or is put out.',
      pl: 'Ogień rzuca swoją intensywnością przeciw tobie co rundę, aż nie zada obrażeń lub zostanie ugaszony.',
    },
    roll: {
      pool: {
        en: 'Base dice = fire intensity (usually 8)',
        pl: 'Kości podstawowe = intensywność ognia (zwykle 8)',
      },
      canPush: false,
      stressDice: false,
    },
    when: {
      en: 'You are exposed to fire. Once it has hurt you, you are burning: roll again at the start of every round, intensity +1 each round.',
      pl: 'Wystawiasz się na ogień. Gdy zada ci obrażenia, płoniesz: rzut powtarza się na początku każdej rundy, a intensywność rośnie o 1.',
    },
    outcome: {
      en: 'Each success is 1 damage; armour protects. The fire goes out when a roll deals no damage, or when you or a friend at Engaged range succeed at a Mobility roll (slow action). Broken by fire, or burned while Broken: a Survival roll every round until dead or saved by Medical Aid.',
      pl: 'Każdy sukces to 1 obrażenie; chroni pancerz. Ogień gaśnie, gdy rzut nie zada obrażeń albo gdy ty lub przyjaciel w zwarciu zdacie test Sprawności (akcja wolna). Pokonany przez ogień lub poparzony jako Pokonany: Test Przeżycia co rundę, aż umrzesz lub uratuje cię Pomoc Medyczna.',
    },
    related: ['survival'],
  },
  {
    id: 'disease',
    group: 'hazard',
    page: 109,
    label: { en: 'Disease', pl: 'Choroba' },
    summary: {
      en: 'An opposed Stamina roll against the disease decides whether you fall ill and when you recover.',
      pl: 'Test sporny Kondycji przeciw chorobie rozstrzyga, czy zachorujesz i kiedy wyzdrowiejesz.',
    },
    roll: {
      pool: {
        en: 'Strength + Stamina vs. virulence (usually 3)',
        pl: 'Siła + Kondycja przeciw zakaźności (zwykle 3)',
      },
      canPush: true,
      stressDice: true,
    },
    when: {
      en: 'On exposure to a dangerous disease or infection, then at the start of every shift while sick.',
      pl: 'Po narażeniu na groźną chorobę lub zakażenie, a potem na początku każdej wachty choroby.',
    },
    outcome: {
      en: 'Failure: you are sick — 1 damage one shift later, no healing while sick, and each later failure deals 1 more damage. Success while sick cures you. Broken while sick: a failed shift roll means death. A carer may roll opposed Medical Aid in your place.',
      pl: 'Porażka: chorujesz — po wachcie 1 obrażenie, nie leczysz się, a każda kolejna porażka to 1 obrażenie. Sukces w trakcie choroby oznacza wyzdrowienie. Pokonany i chory: porażka w teście co wachtę oznacza śmierć. Opiekun może rzucać za ciebie sporny test Pomocy Medycznej.',
    },
    related: [],
  },
  {
    id: 'radiation',
    group: 'hazard',
    page: 110,
    label: { en: 'Radiation', pl: 'Promieniowanie' },
    summary: {
      en: 'Rads build up in your body; each new rad makes you roll for damage.',
      pl: 'Rady kumulują się w organizmie; każdy nowy rad oznacza rzut na obrażenia.',
    },
    roll: {
      pool: { en: 'Base dice = total rads', pl: 'Kości podstawowe = suma radów' },
      canPush: false,
      stressDice: false,
    },
    when: {
      en: 'Every time you gain a rad, at the rate the table gives for the area.',
      pl: 'Za każdym razem, gdy otrzymujesz rada, w tempie zależnym od obszaru (tabela).',
    },
    outcome: {
      en: 'Each success is 1 damage. You cannot heal while you stay in the area. Broken by radiation: a Survival roll for each new rad until you get away. Once out you heal 1 rad per shift, but roll a stress die each time: on a 1 that rad becomes permanent and never heals.',
      pl: 'Każdy sukces to 1 obrażenie. Dopóki przebywasz w skażonym obszarze, nie leczysz się. Pokonany przez promieniowanie: Test Przeżycia za każdego nowego rada, aż się oddalisz. Poza obszarem leczysz 1 rada na wachtę, ale za każdym razem rzucasz kością stresu: jedynka czyni tego rada trwałym.',
    },
    table: {
      caption: { en: 'Radiation levels', pl: 'Poziomy promieniowania' },
      columns: [
        { en: 'Level', pl: 'Poziom' },
        { en: 'Rads', pl: 'Rady' },
      ],
      rows: [
        [
          { en: 'Weak', pl: 'Słabe' },
          { en: '1 per shift', pl: '1 na wachtę' },
        ],
        [
          { en: 'Strong', pl: 'Silne' },
          { en: '1 per turn', pl: '1 na turę' },
        ],
        [
          { en: 'Lethal', pl: 'Zabójcze' },
          { en: '1 per round', pl: '1 na rundę' },
        ],
      ],
    },
    related: ['survival'],
  },
  {
    id: 'drowning',
    group: 'hazard',
    page: 110,
    label: { en: 'Drowning', pl: 'Tonięcie' },
    summary: {
      en: 'Underwater you make a Stamina roll every round; failure costs Health.',
      pl: 'Pod wodą co rundę wykonujesz test Kondycji; porażka kosztuje Zdrowie.',
    },
    roll: {
      pool: { en: 'Strength + Stamina', pl: 'Siła + Kondycja' },
      canPush: true,
      stressDice: true,
    },
    when: {
      en: 'Every round you are underwater, on your turn before any action; the roll is not an action.',
      pl: 'Co rundę pod wodą, w twojej kolejce przed jakąkolwiek akcją; test nie jest akcją.',
    },
    outcome: {
      en: 'Failure: 1 damage. Broken while drowning: a Survival roll every turn until dead or saved by Medical Aid.',
      pl: 'Porażka: 1 obrażenie. Pokonany podczas tonięcia: Test Przeżycia co turę, aż umrzesz lub uratuje cię Pomoc Medyczna.',
    },
    related: ['survival'],
  },
  {
    id: 'suffocation',
    group: 'hazard',
    page: 110,
    label: { en: 'Suffocation', pl: 'Duszenie się' },
    summary: {
      en: 'Out of air, every Stamina roll gets harder until one fails.',
      pl: 'Bez tlenu każdy kolejny test Kondycji jest trudniejszy, aż któryś się nie uda.',
    },
    roll: {
      pool: { en: 'Strength + Stamina', pl: 'Siła + Kondycja' },
      canPush: true,
      stressDice: true,
    },
    when: {
      en: 'When your air supply runs out: every turn and after each exhausting effort, such as close combat or a Mobility roll. The first roll has no modifier, then −1, −2 and so on.',
      pl: 'Gdy skończy się zapas tlenu: co turę i po każdym wyczerpującym wysiłku, np. walce wręcz lub teście Sprawności. Pierwszy test bez modyfikatora, potem −1, −2 i tak dalej.',
    },
    outcome: {
      en: 'Failure: Health drops to zero at once and you make a Survival roll every round until dead or back in breathable air.',
      pl: 'Porażka: Zdrowie natychmiast spada do zera, a co rundę wykonujesz Test Przeżycia, aż umrzesz lub dotrzesz do tlenowej atmosfery.',
    },
    related: ['survival', 'supply'],
  },
]

/** Book order. */
export const TEST_PRIMER: readonly PrimerSection[] = [
  {
    id: 'rolling',
    page: 58,
    label: { en: 'Rolling a test', pl: 'Wykonywanie testu' },
    text: {
      en: 'Describe what you do, then roll base dice equal to attribute + skill, plus gear bonuses and one stress die per point of Stress Level. One 6 is a success; each extra 6 can buy a stunt from the skill. With no skill, roll the attribute alone. You get one chance: once rolled (and pushed), you cannot retry the same goal until things change — combat attacks excepted.',
      pl: 'Opisz, co robisz, a potem rzuć kośćmi podstawowymi w liczbie cecha + umiejętność, z premiami ze sprzętu i jedną kością stresu za każdy punkt poziomu stresu. Jedna szóstka to sukces; każda kolejna może kupić wyczyn z opisu umiejętności. Bez umiejętności rzucasz samą cechą. Masz jedną szansę: po rzucie (i forsowaniu) nie ponawiasz tego samego celu, dopóki sytuacja się nie zmieni — poza atakami w walce.',
    },
  },
  {
    id: 'pushing',
    page: 60,
    label: { en: 'Pushing', pl: 'Forsowanie' },
    text: {
      en: 'Once per roll you may re-roll every die that is not a 6, even after a success. First raise your Stress Level by 1, which adds one more stress die to the re-roll. You cannot push a roll in which a stress die showed a 1. NPCs never push.',
      pl: 'Raz na test możesz przerzucić wszystkie kości bez szóstki, nawet po sukcesie. Najpierw podnieś poziom stresu o 1, co dodaje do przerzutu jedną kość stresu. Nie forsujesz testu, w którym na kości stresu wypadła jedynka. PN nigdy nie forsują.',
    },
  },
  {
    id: 'stressDice',
    page: 61,
    label: { en: 'Stress dice', pl: 'Kości stresu' },
    text: {
      en: 'Add one stress die per point of Stress Level to every skill roll, push included. A 6 on them counts as a success, but any 1 means the roll cannot be pushed and you make a Panic roll at once, which may turn the roll into a failure. When shooting a weapon with limited ammo, a 1 also means you are out.',
      pl: 'Do każdego testu umiejętności, także forsowanego, dodaj jedną kość stresu za każdy punkt poziomu stresu. Szóstka na niej to sukces, ale każda jedynka oznacza, że testu nie można forsować, a ty od razu wykonujesz Test Paniki, który może zmienić wynik w porażkę. Przy strzale z broni z ograniczoną amunicją jedynka oznacza też koniec naboi.',
    },
  },
  {
    id: 'groupTests',
    page: 62,
    label: { en: 'Group tests', pl: 'Testy grupowe' },
    text: {
      en: 'When player characters face a challenge together, the best-suited one rolls and the others may help. After a failure they cannot each try again on their own. Combat is the exception: everyone attacks separately.',
      pl: 'Gdy postacie graczy razem mierzą się z wyzwaniem, rzuca najlepiej przygotowana, a reszta może pomagać. Po porażce nie próbują osobno. Wyjątkiem jest walka: każdy atakuje sam.',
    },
  },
  {
    id: 'modifiers',
    page: 62,
    label: { en: 'Modifiers and difficulty', pl: 'Modyfikatory i trudność' },
    text: {
      en: 'Each +1 adds a base die and each −1 removes one; sum all modifiers first. If there are not enough base dice to remove, remove stress dice; with no dice left the action cannot succeed. Sources: gear, help, talents, rules such as range, and difficulty — trivial +3, simple +2, easy +1, average 0, demanding −1, hard −2, formidable −3.',
      pl: 'Każdy +1 dodaje kość podstawową, a każdy −1 ją odejmuje; najpierw zsumuj wszystkie modyfikatory. Gdy brakuje kości podstawowych do odjęcia, odejmij kości stresu; bez kości akcja nie może się udać. Źródła: sprzęt, pomoc, talenty, zasady (np. zasięg) i trudność — banalna +3, rutynowa +2, łatwa +1, średnia 0, wymagająca −1, trudna −2, niewykonalna −3.',
    },
  },
  {
    id: 'help',
    page: 63,
    label: { en: 'Help from others', pl: 'Pomoc innych osób' },
    text: {
      en: 'Declare help before the roll, and only where it makes sense in the story. Each helper gives +1, up to three helpers (+3). In combat, helping costs the same kind of action as the action it supports. NPCs can help each other the same way.',
      pl: 'Pomoc deklaruje się przed rzutem i tylko wtedy, gdy ma sens w fabule. Każdy pomocnik daje +1, najwyżej trzech (+3). W walce pomoc kosztuje taką samą akcję jak wspierana czynność. PN pomagają sobie tak samo.',
    },
  },
  {
    id: 'opposedTests',
    page: 64,
    label: { en: 'Opposed tests', pl: 'Testy sporne' },
    text: {
      en: 'You need at least one success and more successes than your opponent: each of their successes cancels one of yours. Only the active side may push. Common for Manipulation and sneaking with Mobility, and for contests such as Stamina against Stamina.',
      pl: 'Potrzebujesz co najmniej jednego sukcesu i więcej sukcesów niż przeciwnik: każdy jego sukces znosi jeden twój. Forsować może tylko strona działająca. Typowe przy Manipulacji, skradaniu się (Sprawność) i siłowaniu (Kondycja przeciw Kondycji).',
    },
  },
]

export function findTest(id: string): TestEntry | undefined {
  return TESTS.find((t) => t.id === id)
}

export function isTestId(id: string): boolean {
  return findTest(id) !== undefined
}

export function localizedFieldsOf(test: TestEntry): Localized[] {
  const fields = [test.label, test.summary, test.roll.pool, test.when, test.outcome]
  if (test.table) fields.push(test.table.caption, ...test.table.columns, ...test.table.rows.flat())
  return fields
}
