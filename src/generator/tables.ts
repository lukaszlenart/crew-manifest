import type { Lang } from '../domain/types'

/**
 * Random tables for narrative fields. These are short sample entries — extend them freely
 * (or replace with entries from the rulebook) in both languages.
 */
export interface RandomTables {
  firstNames: string[]
  lastNames: string[]
  appearance: string[]
  personalAgenda: string[]
  buddy: string[]
  rival: string[]
  signatureItem: string[]
}

// TODO: uzupełnić z podręcznika (or extend with your own entries)
export const TABLES: Record<Lang, RandomTables> = {
  en: {
    firstNames: ['Ash', 'Dana', 'Elias', 'Imani', 'Jonah', 'Kai', 'Marta', 'Noor', 'Reed', 'Tess'],
    lastNames: [
      'Abara',
      'Brandt',
      'Cho',
      'Delgado',
      'Hale',
      'Kowal',
      'Mbeki',
      'Okafor',
      'Quinn',
      'Varga',
    ],
    appearance: [
      'Shaved head, burn scar on the neck',
      'Tired eyes, coffee-stained jumpsuit',
      'Tall and wiry, never stops fidgeting',
      'Neat uniform, company pin polished',
      'Grease under the nails, rolled-up sleeves',
      'Old tattoo of a ship that no longer exists',
    ],
    personalAgenda: [
      'Get home with enough credits to retire',
      'Find out what really happened on your last ship',
      'Keep a secret about your past buried',
      'Earn a promotion, whatever it takes',
      'Protect the youngest member of the crew',
      'Prove you are not to blame for the accident',
    ],
    buddy: [
      'The crewmate who covered for you once',
      'An old friend from your training days',
      'The one who shares your cabin and your rations',
      'Someone who reminds you of family back home',
    ],
    rival: [
      'The crewmate who got the job you wanted',
      'Someone who knows about your debt',
      'The one who keeps second-guessing your calls',
      'An ex-partner you never quite forgave',
    ],
    signatureItem: [
      'A worn photograph',
      'A lucky coin',
      'A cheap wristwatch that still keeps time',
      'A battered paperback',
      'A child’s drawing',
      'A dog tag that is not yours',
    ],
  },
  pl: {
    firstNames: [
      'Adam',
      'Dana',
      'Eliasz',
      'Iga',
      'Jonasz',
      'Kaja',
      'Marta',
      'Nora',
      'Oskar',
      'Teresa',
    ],
    lastNames: [
      'Brandt',
      'Cho',
      'Delgado',
      'Hale',
      'Kowal',
      'Mazur',
      'Nowak',
      'Okafor',
      'Quinn',
      'Varga',
    ],
    appearance: [
      'Ogolona głowa, blizna po oparzeniu na szyi',
      'Zmęczone oczy, kombinezon poplamiony kawą',
      'Wysoki i żylasty, nie potrafi usiedzieć w miejscu',
      'Schludny mundur, wypolerowana odznaka firmy',
      'Smar pod paznokciami, podwinięte rękawy',
      'Stary tatuaż statku, który już nie istnieje',
    ],
    personalAgenda: [
      'Wrócić do domu z kredytami na emeryturę',
      'Dowiedzieć się, co naprawdę stało się na poprzednim statku',
      'Ukryć tajemnicę ze swojej przeszłości',
      'Zdobyć awans za wszelką cenę',
      'Chronić najmłodszego członka załogi',
      'Udowodnić, że wypadek nie był twoją winą',
    ],
    buddy: [
      'Członek załogi, który kiedyś cię krył',
      'Stary znajomy z czasów szkolenia',
      'Ktoś, z kim dzielisz kajutę i racje żywnościowe',
      'Osoba, która przypomina ci rodzinę',
    ],
    rival: [
      'Członek załogi, który dostał posadę, o którą się starałeś',
      'Ktoś, kto wie o twoim długu',
      'Ten, kto ciągle podważa twoje decyzje',
      'Dawny partner, któremu nigdy nie wybaczyłeś',
    ],
    signatureItem: [
      'Wytarta fotografia',
      'Moneta na szczęście',
      'Tani zegarek, który wciąż chodzi',
      'Sfatygowana książka',
      'Rysunek dziecka',
      'Cudzy nieśmiertelnik',
    ],
  },
}
