// Importa a biblioteca systeminformation
const si = require('systeminformation');

/**
 * Asynchronous function to fetch CPU and Memory data.
 * @returns {Promise<object>} An object with usage information.
 */
async function GetSystemUsage() {
  try {

    const [cpuData, memData, infoCpu/*, tempCpu*/] = await Promise.all([
        si.currentLoad(),
        si.mem(),
        si.cpu(),
        //si.cpuTemperature()
    ]);
    const FATOR_CONVERSAO_GB = 1024 ** 3;

    return {
        cpu: {
            name: `${infoCpu.manufacturer} ${infoCpu.brand}`,
            cores: {
                physic: infoCpu.physicalCores,
                logical: infoCpu.cores
            },
            /*temperature: {
                main: tempCpu.main,
                max: tempCpu.max,
                cores: tempCpu.cores,
                socket: tempCpu.socket,
                chipset: tempCpu.chipset
            },*/
            percent: parseFloat(cpuData.currentLoad.toFixed(2)),
        },
        ram: {
            percent: parseFloat(((memData.used / memData.total) * 100).toFixed(2)),
            totalGb: parseFloat((memData.total / FATOR_CONVERSAO_GB).toFixed(2)),
            usingGb: parseFloat((memData.used / FATOR_CONVERSAO_GB).toFixed(2)),
        },
    };

  } catch (error) {
    console.error('Ocorreu um erro ao buscar as informações do sistema:', error);
    return null;
  }
}

module.exports = {
  GetSystemUsage
};