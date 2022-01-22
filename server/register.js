const file = require('./file.js');
const crypto = require('crypto');

module.exports = class Registration {
    /**
     * Constructor
     * @param filePath - players info file path 
     */
    constructor(filePath) {
        this.path = filePath;
        this.users = [];
        file.readFromFile(this.path, (data)=>{this.users=data;});
    }

    /**
     * Registers a user
     * @param info - user info
     */
    register(info) {
        let {nick, password} = info;
        if (!nick || !password) {
            throw {message: {error: "Invalid body request."}, status: 400};
        }

        password = crypto
               .createHash('md5')
               .update(password)
               .digest('hex');
               
        for (const user of this.users) {
            if (user.nick === nick) {
                if (user.password !== password){
                    throw {message: {error: "User registered with a different password."}, status: 401};
                }
                return;
            }
        }

        this.users.push({nick, password});
        file.writeToFile(this.path, this.users, ()=>{ this.users.pop();});
    }

    /**
     * Verifies if a user with the given info already exists
     * @param info - user info
     */
    exists(info) {
        let {nick, password} = info;
        if (!nick || !password) {
            throw {message: {error: "Invalid body request."}, status: 400};
        }

        password = crypto
            .createHash('md5')
            .update(password)
            .digest('hex');
        
        for (const user of this.users) {
            if (user.nick === nick) {
                if (user.password !== password){
                    throw {message: {error: "User registered with a different password."}, status: 401};
                }
                return;
            }
        }

        throw {message: {error: "User not registered."}, status: 401};
    }
}