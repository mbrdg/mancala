const file = require('./file.js');
const crypto = require('crypto');

module.exports = class Registration {
    constructor(filePath) {
        this.path = filePath;
        this.users = [];
        file.readFromFile(this.path, (data)=>{this.users=data;});
    }

    register(info) {
        let {nick, password} = info;
        if(!nick || !password) throw {error: "Invalid body request."};

        for (const user of this.users) {
            if (user.nick === nick) {
                if (user.password !== password){
                    throw {error: "User registered with a different password."}
                }
                return;
            }
        }

        //ENcrypt pass
        password = crypto
               .createHash('md5')
               .update(password)
               .digest('hex');
        this.users.push({nick, password});
        file.writeToFile(this.path, this.users, ()=>{ this.users.pop();});
    }
}