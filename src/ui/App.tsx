import { useEffect } from 'preact/hooks'
import { lang, useT } from '../i18n'
import { CharacterEditor } from './CharacterEditor'
import { CharacterList } from './CharacterList'
import { CharacterSheet, PrintView } from './CharacterSheet'
import { LangSwitch } from './components/LangSwitch'
import { href, route, type Route } from './router'
import { storageError } from './store'

export function App() {
  const t = useT()

  useEffect(() => {
    document.documentElement.lang = lang.value
    document.title = t('app.title')
  }, [lang.value])

  const current = route.value
  return (
    <div class="app">
      <header class="app-header no-print">
        <a class="brand" href={href.list()}>
          <span class="brand-title">{t('app.title')}</span>
          <span class="brand-subtitle">{t('app.subtitle')}</span>
        </a>
        <nav>
          <a href={href.list()} aria-current={current.name === 'list' ? 'page' : undefined}>
            {t('nav.list')}
          </a>
          <a href={href.new()} aria-current={current.name === 'new' ? 'page' : undefined}>
            {t('nav.new')}
          </a>
        </nav>
        <LangSwitch />
      </header>
      {storageError.value && (
        <div class="banner error no-print" role="alert">
          {t(storageError.value)}
        </div>
      )}
      <main>
        <View route={current} />
      </main>
    </div>
  )
}

function View({ route }: { route: Route }) {
  switch (route.name) {
    case 'list':
      return <CharacterList />
    case 'new':
      return <CharacterEditor />
    case 'edit':
      return <CharacterEditor id={route.id} />
    case 'sheet':
      return <CharacterSheet id={route.id} />
    case 'print':
      return <PrintView ids={route.ids} />
  }
}
