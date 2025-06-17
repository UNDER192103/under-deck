const { GlobalKeyboardListener } = require('node-global-key-listener');
const DAO = require('../../Repository/DB');

class MacroExecutor {
    exec_program;
    func_return_combo;
    callOverlay;
    isRecording = false;
    constructor(exec_program = null) {
        this.exec_program = exec_program;
        this.macros = new Map();
        this.listener = new GlobalKeyboardListener();
        this.currentMacro = [];
        this.setupKeyListener();
        this.setupDefaultMacros();
    }

    setupDefaultMacros() {

    }

    setCallBackOverlay(call) {
        this.callOverlay = call;
    }

    registerNewMacro(macro) {
        const keys = macro.keys.map(k => k.key);
        const keyCombo = keys.join('+');
        this.macros.set(`${macro._id}-${macro.idProgram}`, {
            keys: keys,
            keyCombo: keyCombo,
            macro: macro,
        });
    }

    setupKeyListener() {
        const pressedKeys = new Set();
        
        this.listener.addListener((e, down) => {
            if (down) {
                if(e.state === 'UP'){
                    this.checkMacros(pressedKeys);
                    pressedKeys.clear();
                }
                else{
                    pressedKeys.add(e.name);
                }
            } else {
                pressedKeys.delete(e.name);
            }
        });
    }

    getComboKeys() {
        return new Promise(async (resolve) => {
            this.func_return_combo = resolve;
        });
    }

    checkMacros(pressedKeys) {
        if(this.func_return_combo) {
            this.func_return_combo(Array.from(pressedKeys));
            this.func_return_combo = null;
            return;
        }
        if(this.macros.size === 0) return;
        if (pressedKeys.size === 0) return;
        const keyCombo = Array.from(pressedKeys).join('+');
        if(DAO.DB.get('isActivateOverlay')){
            if(DAO.DB.get('keys-overlay') && this.callOverlay){
                try {
                    if(DAO.DB.get('keys-overlay').join('+') === keyCombo){
                        this.callOverlay();
                        return;
                    }   
                } catch (error) {
                    console.error('Erro ao verificar chaves de overlay:', error);
                }
            }
        }
        this.macros.forEach((data, id) => {
            if (keyCombo === data.keyCombo) {
                setTimeout(() => {
                    try {
                        if(this.exec_program && typeof this.exec_program === 'function') {
                            this.exec_program(data);
                        }
                    } catch (error) {
                        console.error(`Erro ao executar macro ${keyCombo}:`, error);
                    }
                }, 50);
            }
        });
    }

    stop() {
        this.listener.kill();
    }

    async updateDataMacros() {
        this.macros.clear();
        await DAO.GetData();
        this.isRecording = await DAO.DB.get('keyEvent');
        try {
            if(this.isRecording){
                if(!this.listener.isRunning){
                    this.listener.start();
                }
                if(typeof DAO.Macro_lis === 'object'){
                    DAO.Macro_lis.forEach(macro => {
                        this.registerNewMacro(macro);
                    });
                }
            }
            else{
                if(this.listener.isRunning){
                    this.listener.stop();
                }
            }
        } catch (error) {
            console.error('Erro ao carregar macros:', error);
        }
        return true;
    }

    callBack(callBack = null) {
        this.exec_program = callBack;
    }
}

module.exports = MacroExecutor;
