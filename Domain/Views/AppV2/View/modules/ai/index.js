
export async function initialize(isLogger= false) {
  if(isLogger) console.log("Inicializando modulo!");
  // ...lógica para o menu...
}

import Typebot from 'https://cdn.jsdelivr.net/npm/@typebot.io/js@0/dist/web.js'

Typebot.initPopup({
  typebot: "under-deck-ai-en-us",
  apiHost: "https://bot.undernouzen.shop",
});

$(document).on('click', '.ai_open_modal', async function (e) {
  e.preventDefault();
  Typebot.open();
});