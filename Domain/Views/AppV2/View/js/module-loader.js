Object.defineProperty(window, 'RGSFC', { value: (Name, Function) => { Object.defineProperty(window, Name, { value: Function, writable: true, configurable: true }); }, writable: true, configurable: true });
import communFuncs from "./CommunFuncs.js";
import GlobalValues from "./GlobalValues.js";

RGSFC('CommunFuncs', communFuncs);
RGSFC('GlobalValues', GlobalValues);
RGSFC('GetNameTd', (id) =>{ var tr = GlobalValues.AppData.Language.data.find(L => L.id == id); return tr ? tr.text : id; });
RGSFC('LogerCLR', (text, color = 'red') => { return [`%c${text}`, `color: ${color}; font-weight: bold;`] });
RGSFC('GetParent', function (elem) { return $($(elem).parent()[0]); });

/**
 * Carrega e renderiza um módulo HTML dentro de um elemento de destino.
 * @param {string} moduleName - O nome do arquivo do módulo (sem .html).
 * @param {string} targetElementId - O ID do elemento onde o módulo será renderizado.
 */
async function loadModuleHtml(moduleName, targetElementId , isAppend = true, isLogger = false) {
    return new Promise(async (resolve) => {
        const targetElement = $(targetElementId)[0];
        if (!targetElement) {
            console.log(`[Module Loader] Elemento de destino "${targetElementId}" não encontrado.`);
            return resolve(false);;
        }

        try {
            const response = await fetch(`./modules/${moduleName}/index.html`);
            if (response.ok) {
                const html = await response.text();
                if(isAppend){
                    targetElement.innerHTML += html;
                }
                else{
                    targetElement.innerHTML = html;
                }
            }
            else{
                console.log(`[Module Loader] Erro ao carregar o módulo "${moduleName}"`);
            }
            try {
                const module = await import(`../modules/${moduleName}/index.js`);
                if (module && typeof module.initialize === 'function') { await module.initialize(isLogger); }
            } catch (jsError) { console.log(jsError, moduleName); }

            resolve(true);
        } catch (error) {
            console.log(`[Module Loader] Erro ao carregar o módulo "${moduleName}":`, error);
            resolve(false);
        }
    });
}


document.addEventListener('DOMContentLoaded', async () => {
    await GlobalValues.InitialGets();
    await loadModuleHtml('sideBar', '#DSideBar', true, true);
    await loadModuleHtml('modals', '#Modals', true, false);
    try {
        const modules = await window.api.invoke('GetModulesList');
        const contentModules = modules.filter(m => m !== 'sideBar' && m !== 'modals');
        for (const moduleName of contentModules) {
            await loadModuleHtml(moduleName, '#DContaienrs', true, false);
        }
    } catch (error) {
        console.error("Erro ao carregar módulos dinamicamente:", error);
    }
    await GlobalValues.InitialChanges();
    $("#PreloadApp").hide('slow');
    $("#PostPreload").show('slow');
});