const rp = require("requestretry"),
    fs = require('fs');
 

// time delay between requests
const delayMS = 500;

// retry recount
const retry = 5;

// retry request if error or 429 received
var retryStrategy = function (err, response, body) {
    let shouldRetry = err || (response.statusCode === 429);
    if (shouldRetry) {
        let i = 0;
    }
    return shouldRetry;
  }

// Gets an access token.
const getAccessToken = async (host, subscriptionKey) => {

    if(!host || !subscriptionKey) throw ("TTS getAccessToken missing params");

        let options = {
            method: 'POST',
            uri: `https://${host}/sts/v1.0/issueToken`,
            headers: {
                'Ocp-Apim-Subscription-Key': subscriptionKey
            }
        }
        return rp(options);

}
// https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/language-support
const getVoice = (voice) => {

    let defaultValue = {
        "gender" : "female",
        "locale" : "en-us",
        "code" : "Jessa24KRUS"
    } ;

    
    if (!voice || !voice.code) return defaultValue;
    

    switch(voice.code){
        
        case "BenjaminRUS": 
            return {
            "gender" : "male",
            "locale" : "en-us",
            "code" : "BenjaminRUS"
            };        
        case "Jessa24KRUS":
            return {
                "gender" : "female",
                "locale" : "en-us",
                "code" : "Jessa24KRUS"
            } ;

        
    }
}

// Make sure to update User-Agent with the name of your resource.
// You can also change the voice and output formats. See:
// https://docs.microsoft.com/azure/cognitive-services/speech-service/language-support#text-to-speech
const textToSpeech = async (accessToken,  filenameandpath, host,  text, voice)=> {

        if (!accessToken || !filenameandpath || !host || !text) throw ("TTS textToSpeech missing params");

        let selectedVoice = getVoice(voice);

        // Create the SSML request.
        let body = `<?xml version="1.0"?><speak version="1.0" xml:lang="en-us"><voice xml:lang="en-us" name="Microsoft Server Speech Text to Speech Voice (${selectedVoice.locale}, ${selectedVoice.code})"><prosody rate="-20.00%">${text}</prosody></voice></speak>`;

        let options = {
            "method": "POST",
            "baseUrl": `https://${host}/`,
            "url": "/cognitiveservices/v1",
            "headers": {
                "Authorization": "Bearer " + accessToken,
                "cache-control": "no-cache",
                "User-Agent": "YOUR_RESOURCE_NAME",
                "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
                "Content-Type": "application/ssml+xml"
            },
            //timeout: 120000,
            body: body,
            maxAttempts: retry,
            retryDelay: delayMS,
            retryStrategy: retryStrategy
        }
        
        // request has binary audio file
        let request = await rp(options)
        .on('response', (response) => {
            if (response.statusCode === 200) {
                //request.pipe(await fs.createWriteStream(filenameandpath));
                // This opens up the writeable stream to `output`
                var writeStream = fs.createWriteStream(filenameandpath);

                // This pipes the POST data to the file
                response.pipe(writeStream);

                // After all the data is saved, respond with a simple html form so they can post more data
                response.on('end', function () {
                    //console.log("done with writeStream");
                    fs.stat(filenameandpath, function(err, stats) {
                        console.log(JSON.stringify(stats));
                    });
                    return {
                        file: filenameandpath,
                        text: text,
                        statusCode: response.statusCode,
                        statusMessage: response.statusMessage
                    };                    
                });

                // This is here incase any errors occur
                writeStream.on('error', function (err) {
                    //console.log(`err with writeStream - ${err}`);
                });
            }
        })
        .on('error', function(err) {
            return {
                file: filenameandpath,
                text: text,
                statusCode: err.statusCode,
                err: err
            };
          })

        // TBD: this is wrong - fix with queues
        const sleep = (waitTimeInMs) => new Promise(resolve => {
            setTimeout(resolve, waitTimeInMs);
        });
        await sleep(10000);
        return request;
}


// Use async and await to get the token before attempting
// to convert text to speech.
/**
 * Filename is created from path + ID + extension
 * @param {*} options  includes tts key and host, path to file to write with audio, text, voice, id, file extension
 * @param {*} textArray 
 */
const mp3 = async function(options, textArray) {

    try{

        if (!options) throw "Param is empty: options";
        if (!options.text) throw "Param is empty: options.text";

        let answer = {};
        answer.text = options.text;
        answer.options = Object.assign({}, options, {});
        answer.error = [];
        answer.result = {};

        if (!answer.options) {
            answer.error.push('options is empty.');
        } else {
        
            if (!answer.options.ttsService || !answer.options.ttsService.hostToken || !answer.options.ttsService.hostTTS || !answer.options.ttsService.key) {
                answer.error.push('options.ttsService is empty.');
            };

            if(!answer.options.id){
                answer.error.push('options.id is empty.');
            }

            if(!answer.options.fileExtension){
                answer.error.push('options.fileExtension is empty.');
            }

            if(!answer.options.path){
                answer.error.push('options.path is empty.');
            } else {
                if ((answer.options.path.indexOf("/")!=-1) && (answer.options.path[answer.options.path.length] != "/")){
                    answer.options.path += "/";
                } else if ((answer.options.path.indexOf("\\")!=-1) && (answer.options.path[answer.options.path.length] != "\\")){
                    answer.options.path += "\\";
                } else {
                    //noop
                }
            }
            // path and file name
            answer.options.path += answer.options.id + answer.options.fileExtension;
            
        };

        if (!answer.text) {
            answer.error.push('text is not set.');
        };

        if (answer.text.length>1000){
            answer.error.push('text is too large (1k char max');
        }

        if(answer.error.length>0){
            answer.result["success"]=false;
            return answer;
        } 

        // get token - access token is good for 9 minutes
        let response = await getAccessToken(answer.options.ttsService.hostToken, answer.options.ttsService.key);

        if (response && response.body) {
            options.accessToken = response.body;
        } else {
            options.accessToken = response;
        }

        // get binary - tts
        answer.result["binary"] = await textToSpeech(options.accessToken,answer.options.path,answer.options.ttsService.hostTTS, answer.options.text, answer.options.voice);
     
        answer.result["success"]=true;
        answer.result["file"]=answer.options.path;
        
        return answer;

    }catch(err){
        throw (err);
    }
}

/**
 * 
 * @param {*} ttsConfig - Key and Host
 * @param {*} text - assume english only for now
 * @param {*} voice - don't set - it will default to something
 * @param {*} path - local path to save audio file to
 * @param {*} fileNameWithoutExtension 
 * @param {*} fileExtension - default to mp3
 * @param {*} textArray - convert array of text - defaults to null - not used yet - not wired up
 */
const sendTextToSpeechFile = async (ttsServiceConfig, text, voice, path, fileNameWithoutExtension, fileExtension='.mp3', textArray=undefined) => {

    try{

        if(!ttsServiceConfig || !text || !path || !fileNameWithoutExtension) throw ("routes-authenticated-user::sendTextToSpeechFile - missing params");

        // construct expected object
        const ttsConfig = {
            text: text,
            ttsService: ttsServiceConfig,
            id: fileNameWithoutExtension, // previously only used ID, now use ID + originalFileNameWithoutExtension + culture
            fileExtension: fileExtension,
            path: path,
            voice: voice
        }

        let mp3Response = await mp3(ttsConfig, textArray);

        if(mp3Response && (mp3Response.result.success==true) && mp3Response.result && mp3Response.result.file) return mp3Response.result.file;

        // TBD - fix this - return error of some kind
        return undefined
    } catch (err){
        throw err;
    }
}
module.exports = {
    mp3: mp3, // called from text.js
    sendTextToSpeechFile: sendTextToSpeechFile // called from routes-authenticated-user.js 
};