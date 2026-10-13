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
]

/** Book order. */
export const TEST_PRIMER: readonly PrimerSection[] = []

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
