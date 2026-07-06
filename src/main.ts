import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'
import { initLang } from './lib/i18n.svelte'
import { initProgress } from './lib/progress.svelte'

initLang()
initProgress()

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
