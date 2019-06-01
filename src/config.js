require('dotenv').config();
const path = require("path");

const getConfigTest = () => {

    let fixTestRoot = path.join(__dirname,"../"); 

    let my_config = {
        port: process.env.DFBAPISERVERPORT,
        rootDir: fixTestRoot,
        ver: process.env.DFBAPISERVERVER,
        download:{
            host: process.env.DFBAPIDOWNLOADSERVERURI,
            port: process.env.DFBAPIDOWNLOADSERVERPORT,
            dir: path.join(fixTestRoot, process.env.DFBAPIDOWNLOADSERVERDIR)
        },
        ttsService: {
            region: process.env.SPEECHREGION,
            key: process.env.SPEECHKEY
        },
        logger: {
            routerLogger:{
                winston: {
                    transports: [
                    new winston.transports.Console()
                    ],
                    format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.json()
                    ),
                    meta: true, // optional: control whether you want to log the meta data about the request (default to true)
                    msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
                    expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
                    colorize: true, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
                    ignoreRoute: function (req, res) { return false; } // optional: allows to skip some log messages based on request and/or response
                    
                }
            },
            pipeLineLogger:{
                winston: {
                    transports: [
                    new winston.transports.Console()
                    ],
                    format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.json()
                    )
                }
            
            }
        }
    };
    let checkedConfig = checkConfig(my_config);
    return checkedConfig;
}

const getConfig = () => {

    let fixTestRoot = path.join(__dirname,"./");

    let my_config = {
        port: process.env.DFBAPISERVERPORT,
        rootDir: fixTestRoot,
        ver: process.env.DFBAPISERVERVER,
        download:{
            host: process.env.DFBAPIDOWNLOADSERVERURI,
            port: process.env.DFBAPIDOWNLOADSERVERPORT,
            dir: path.join(fixTestRoot, process.env.DFBAPIDOWNLOADSERVERDIR)
        },
        ttsService: {
            region: process.env.SPEECHREGION,
            key: process.env.SPEECHKEY
        },
        logger: {
            routerLogger:{
                winston: {
                    transports: [
                    new winston.transports.Console()
                    ],
                    format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.json()
                    ),
                    meta: true, // optional: control whether you want to log the meta data about the request (default to true)
                    msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
                    expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
                    colorize: true, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
                    ignoreRoute: function (req, res) { return false; } // optional: allows to skip some log messages based on request and/or response
                    
                }
            },
            pipeLineLogger:{
                winston: {
                    transports: [
                    new winston.transports.Console()
                    ],
                    format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.json()
                    )
                }
            
            }
        }
    };
    let checkedConfig = checkConfig(my_config);
    return checkedConfig;
}
const checkConfig = (config)=>{

    if(!config ) throw ("config is empty");
    if(!config.port && (typeof config.port == 'number')) throw ("config.port is empty");
    if(!config.rootDir && (typeof config.rootDir == 'string')) throw ("config.rootDir is empty");
    if(!config.ver && (typeof config.ver == 'string')) throw ("config.ver is empty");
    
    if(!config.ttsService && (typeof config.ttsService == 'object')) throw ("config.ttsService is empty");
    if(!config.ttsService.region && (typeof config.ttsService.region == 'string')) throw ("config.ttsService.region is empty");  
    if(!config.ttsService.key && (typeof config.ttsService.key == 'string')) throw ("config.ttsService.key is empty"); 
    
    if(!config.download && (typeof config.download == 'object')) throw ("config.download is empty");  
    if(!config.download.host && (typeof config.download.host == 'string')) throw ("config.download.host is empty");  
    if(!config.download.port && (typeof config.download.port == 'object')) throw ("config.download.port is empty");  
    if(!config.download.dir && (typeof config.download.dir == 'object')) throw ("config.download.dir is empty");  
    
    return config;
}

module.exports = {
    getConfig: getConfig,
    getConfigTest:getConfigTest
  };