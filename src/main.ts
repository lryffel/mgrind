import 'katex/dist/katex.min.css';
import './design.css';
import './app.css';
import { mount } from 'svelte';
import App from './App.svelte';
import { initLang } from './lib/i18n.svelte';
import { initProgress } from './lib/progress.svelte';
import { initDisabledTypes } from './lib/disabledTypes.svelte';

initLang();
initProgress();
initDisabledTypes();

mount(App, { target: document.getElementById('app')! });
