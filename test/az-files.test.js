const path =require("path");
const config = require("../src/config.js");
const AzureFiles = require("../src/az-files.js");
const string = require("../src/strings.js");



describe('AzureFiles', () => {

    it('should manage file', async (done) => {

        try {
            jest.setTimeout(99000);
            const testConfig = config.getConfigTest();

            const fileName = `${string.dateAsTimestamp()}_1_short.txt`;
            const fileName2 = `${string.dateAsTimestamp()}_2_short.txt`;
            const userName = `jest-share-${string.dateAsTimestamp()}`;
            const baseDirectory = "";
            const directory = `jest-dir-${string.dateAsTimestamp()}`;
            const fileFullPath = path.join(testConfig.rootDir,"./data/short.txt");

            const optionalContentSettings = {
                contentType: undefined,
                contentEncoding: undefined,
                contentLanguage: undefined
            };

            const optionalMetadata = {
                context: "Jest-test"
            };

            const fileAzure = new AzureFiles(testConfig, userName);

            // add file
            const fileResult = await fileAzure.addFileAsync(directory, fileName, fileFullPath, optionalContentSettings, optionalMetadata);
            expect(fileResult.lastModified).not.toEqual(undefined);

            // add file 2
            const fileResult2 = await fileAzure.addFileAsync(directory, fileName2, fileFullPath, optionalContentSettings, optionalMetadata);
            expect(fileResult2.lastModified).not.toEqual(undefined);

            // get file properties
            const fileProperties = await fileAzure.getFilePropertiesAsync(directory, fileName);
            expect(fileProperties.share).toEqual(userName);

            // get file download
            const url = await fileAzure.getFileUrlAsync(directory, fileName);     
            expect(url.indexOf("https://")).not.toEqual(-1);
            expect(url.indexOf(userName)).not.toEqual(-1);
            expect(url.indexOf(directory)).not.toEqual(-1);
            expect(url.indexOf(fileName)).not.toEqual(-1);
                
            // get base directories
            const directoriesAndFiles = await fileAzure.getDirectoriesAndFiles(baseDirectory);
            expect(directoriesAndFiles).not.toBe(undefined);
            expect(directoriesAndFiles.files.length).toBe(0);
            expect(directoriesAndFiles.directories.length).toBe(1);
            expect(directoriesAndFiles.directories[0].name).toEqual(directory);

            // get subdir files
            const subDirectoriesAndFiles = await fileAzure.getDirectoriesAndFiles(directoriesAndFiles.directories[0].name);
            expect(subDirectoriesAndFiles).not.toBe(undefined);
            expect(subDirectoriesAndFiles.files.length).toBe(2);
            expect(subDirectoriesAndFiles.directories.length).toBe(0);            

            done();

        } catch(err){
            done(err);
        }

    });           
});  

