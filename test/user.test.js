const User = require("../src/user.js"),
    config = require("../src/config.js"),
    string = require("../src/strings.js"),
    path = require("path"),
    fs = require("fs").promises;

describe('user', () => {

    it('should manage user', async (done) => {

        try {
            jest.setTimeout(99000);
            const testConfig = config.getConfigTest();
            const timestamp = string.dateAsTimestamp();
            const user = "user-" + timestamp;
            const password = "password-" + timestamp;

            const userMgr = new User(testConfig);

            // create user
            const userAuthenticationAccount = await userMgr.create(user, password);
            expect(userAuthenticationAccount.user).toEqual(user);
            expect(userAuthenticationAccount.hash).not.toBe(undefined);
            expect(userAuthenticationAccount.hash).not.toEqual(password);

            // get user
            const userAuthenticationAccount2 = await userMgr.get(user);
            expect(userAuthenticationAccount2.user).toEqual(user);
            expect(userAuthenticationAccount2.hash).not.toBe(undefined);
            expect(userAuthenticationAccount2.hash).not.toEqual(password);

            // login user
            const userWithToken = await userMgr.login(user, password);
            expect(userWithToken.token).not.toEqual(undefined);
            expect(userWithToken.user).toEqual(user);

            // decode token
            const userDecodedToken = await userMgr.decodeToken(userWithToken.token);
            expect(userDecodedToken.user.user).toEqual(user);

            // delete user
            const wasDeleted = await userMgr.delete(user);
            expect(wasDeleted).toEqual(true);

            done();

        } catch(err){
            done(err);
        }

    });
  });