const path = require('path');
const fs = require("fs");
const packageJson = require("./package.json");

var dir_appdata_un = path.join(process.env.APPDATA, packageJson.productName);
var dir_appdata_un_data = path.join(dir_appdata_un, 'UN-DATA');


const check_folders_data_UN = async (callback) => {
    if(!await fs.existsSync(dir_appdata_un)){
        await fs.mkdirSync(dir_appdata_un);
    }
    let dir_appdata_un_data_DB = path.join(dir_appdata_un, 'UN-DATA', 'DB');
    let dir_appdata_un_data_img = path.join(dir_appdata_un, 'UN-DATA', 'icons-exe');
    if(!await fs.existsSync(dir_appdata_un_data)){
        await fs.mkdirSync(dir_appdata_un_data);
        await fs.mkdirSync(dir_appdata_un_data_DB);
        await fs.mkdirSync(dir_appdata_un_data_img);
    }
    else {
      if(!await fs.existsSync(dir_appdata_un_data_DB)){
        await fs.mkdirSync(dir_appdata_un_data_DB);
      }
      if(!await fs.existsSync(dir_appdata_un_data_img)){
        await fs.mkdirSync(dir_appdata_un_data_img);
      }
    }
    callback();
}

const check_folder_data_UN_DB = async (list, callback, count = 0) => {
    if(list[count] != null){
        if(!await fs.existsSync(list[count])){
            fs.writeFile(list[count], "{}", function(err) {
                if(err) {
                    console.log(err);
                }

                return check_folder_data_UN_DB(list, callback, count+1);
            });
        }
        else{
            check_folder_data_UN_DB(list, callback, count+1)
        }
    }
    else{
        callback();
    }
}

var list_dirs = [
    dir_appdata_un_data + "/DB/DB.json",
    dir_appdata_un_data + "/DB/OBS.json",
    dir_appdata_un_data + "/DB/Opens_windows.json",
    dir_appdata_un_data + "/DB/Macros.json",
    dir_appdata_un_data + "/DB/ProgramsExe.json",
]

check_folders_data_UN(()=>{
    check_folder_data_UN_DB(list_dirs, ()=>{
        require("./App/app.js");
    });
});