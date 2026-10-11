/** Base dictionary. Its keys define `Messages`; every other language must provide all of them. */
export const en = {
  'app.title': 'Crew Manifest',
  'app.subtitle': 'ALIEN RPG character generator',
  'lang.label': 'Language',
} as const

export type MessageKey = keyof typeof en
export type Messages = Record<MessageKey, string>
