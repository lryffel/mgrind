import '@picocss/pico/css/pico.min.css';
import 'katex/dist/katex.min.css';
import { mount } from 'svelte';
import './app.css';
import App from './App.svelte';
import { initLang } from './lib/i18n.svelte';
import { initProgress } from './lib/progress.svelte';
import { initDisabledTypes } from './lib/disabledTypes.svelte';

initLang();
initProgress();
initDisabledTypes();

mount(App, { target: document.getElementById('app')! });
