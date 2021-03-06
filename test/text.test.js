const text = require("../src/text.js"),
    path = require("path"),
    uuid = require('uuid/v4'),
    fileFactory = require('express-fileupload').fileFactory,
    fs = require("fs").promises;



require('dotenv').config();

const config = require("../src/config.js");

describe('text fns', () => {
    describe('live connect to 3rd party services', () =>{
        it('should createAudioFile', async (done) => {
            try{
                jest.setTimeout(200000);
                let testConfig = config.getConfigTest();
                const answer = text.createResponseObject(config);

                testConfig.body = {
                    "text":"this is a test"
                };
    
                const answers = await text.createAudioFile(testConfig);
    
                expect(answers.statusCode).toEqual(200);
                done();
            } catch (err){
                done(err);
            }
        });

    })
    it('should clean a kbAsJson array of markdown', async(done)=>{

        try{
            jest.setTimeout(200000);
            const testDataOutputLocation = path.join(__dirname,"../data/kb.json");
            const savedJsonAsText = await fs.readFile(testDataOutputLocation,"utf-8");
            const kbAsJson = JSON.parse(savedJsonAsText);

            const options = {
                stripListLeaders: true , // strip list leaders (default: true)
                listUnicodeChar: '',     // char to insert instead of stripped list leaders (default: '')
                gfm: true,                // support GitHub-Flavored Markdown (default: true)
                useImgAltText: true      // replace images with alt-text, if present (default: true)
            };

            // 169 - copyright

            const extraStringsToClean = ['©'];
            const removeEndOfLineMarks = true;

            let cleanedArray = await text.cleanAnswersAsync(kbAsJson, options, "Answer",extraStringsToClean,removeEndOfLineMarks);

            expect(cleanedArray.length).toEqual(kbAsJson.length);
            

            //before xml-encoding
            //expect(cleanedArray[0].Answer_cleaned).toEqual("With Windows 10,Published: September 2016 ,Version 2.0 , 2016 Microsoft. All rights reserved. ,Microsoft, Microsoft Edge, OneNote, Outlook, PowerPoint, OneDrive, and Windows are registered trademarks of Microsoft Corporation. ,Surface and Skype are trademarks of Microsoft Corporation. ,Bluetooth is a registered trademark of Bluetooth SIG, Inc. ,This document is provided “as-is.” Information in this document, including URL and other Internet website references, may change without notice.");

            //expect(answers.results[0].processText.text).toEqual("Movies &amp; TV,Movies &amp; TV brings you the latest movies and TV shows as well as featured hits. It offers recommendations based on what you&#x2019;ve watched, making it easier to find something new that you&#x2019;ll like. Check out Watch TV shows, movies, and videos on Surface.com to get started. ,News brings you the latest breaking stories as well as more in-depth coverage. You can customize the coverage to add more local information or highlight the topics you choose.");

            done();
        } catch(err){
            done(`err = ${JSON.stringify(err)}`);
        }

    });
    it('should return convert tsv to JSON', async (done) => {
        try{
            const testDataInputLocation = path.join(__dirname,"../data/kb.tsv");
            const testDataOutputLocation = path.join(__dirname,"../data/kb.json");

            const tsvText = await fs.readFile(testDataInputLocation,"utf-8");
            const savedJsonAsText = await fs.readFile(testDataOutputLocation,"utf-8");

            const jsonFromTsv = text.tsvToJson(tsvText);

            expect(jsonFromTsv.length).toEqual(79);
            expect(JSON.stringify(jsonFromTsv)).toEqual(savedJsonAsText);
            done();
        } catch (err){
            
            done(`err = ${JSON.stringify(err)}`);
        }
    });
    it('should process many text strings without 429', async (done) => {
        try{
            jest.setTimeout(200000);
            let testConfig = config.getConfigTest();
            const answer = text.createResponseObject(config);

            const textArray = [
                "A is for alligator",
                "B is for boy",
                "C is for cat",
                "D is for dog",
                "E is for elephant",
                "F is for flamingo",
                "G is for goat",
                "H is for horse",
                "I is for Igloo"
            ];

            const answers = await text.processArrayOfText(answer, testConfig, textArray);

            expect(answers.statusCode).toEqual(200);
            done();
        } catch (err){
            done(err);
        }
    });
    
    it('should process TSV file without 4xx', async (done) => {
        try{

            // this may timeout since it is going across the internet - for now
            jest.setTimeout(300000);
            let testConfig = config.getConfigTest();
            const answer = text.createResponseObject(config);

            const fileName = "kb.tsv";

            const originPath = path.join(testConfig.rootDir,`./data/${fileName}`, );
            const destinationPath = path.join(testConfig.rootDir,testConfig.upload.processingDir, "kb.tsv");

            // copy file to upload directory
            await fs.copyFile(originPath,destinationPath);

            // create file object
            const mockBuffer = await fs.readFile(destinationPath);
            const stats = await fs.stat(destinationPath);
            const file = fileFactory({
                name: fileName, 
                data:{
                    "type":"Buffer",
                    "data":[]
                },
                size: stats.size, 
                encoding:"7bit",
                tempFilePath: destinationPath,
                truncated:false,
                mimetype:"text/plain",
                buffer: mockBuffer,
            }, {
                useTempFiles:true
            });

            testConfig.body.file = file;

            const answers = await text.processManyRequestsFromTsvFile(testConfig);

            expect(answers).not.toEqual(undefined);
            expect(answers.results).not.toEqual(undefined);
            expect(answers.results.length).toEqual(79);
            done();
        } catch (err){
            done(err);
        }
    });
    it('should encode to XML, then convert to mp3 with error', async (done) => {
        try{
            jest.setTimeout(200000);
            
            // doesn't really do anything
            let encodedText = await text.xmlEncode("Movies & TV,Movies & TV brings you the latest movies and TV shows as well as featured hits. It offers recommendations based on what you’ve watched, making it easier to find something new that you’ll like. Check out Watch TV shows, movies, and videos on Surface.com to get started. ,News brings you the latest breaking stories as well as more in-depth coverage. You can customize the coverage to add more local information or highlight the topics you choose.");

            let testConfig = config.getConfigTest();
            const answer = text.createResponseObject(config);

            const textArray = [
                encodedText
            ];

            const answers = await text.processArrayOfText(answer, testConfig, textArray);

            expect(answers.statusCode).toEqual(200);
            expect(answers.results[0].downloadURI).not.toEqual(undefined);
            expect(answers.results[0].processText.text).toEqual("Movies &amp; TV,Movies &amp; TV brings you the latest movies and TV shows as well as featured hits. It offers recommendations based on what you&#x2019;ve watched, making it easier to find something new that you&#x2019;ll like. Check out Watch TV shows, movies, and videos on Surface.com to get started. ,News brings you the latest breaking stories as well as more in-depth coverage. You can customize the coverage to add more local information or highlight the topics you choose.");

            done();
        } catch (err){
            done(err);
        }
    });
});
