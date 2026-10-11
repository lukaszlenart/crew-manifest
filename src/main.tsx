import { render } from 'preact'
import { App } from './ui/App'
import { startRouter } from './ui/router'
import { reload } from './ui/store'
import './styles/app.css'

startRouter()
void reload()

const root = document.getElementById('app')
if (root) render(<App />, root)
