const { exec } = require('child_process');

const execCommand = (command) => {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject({ error: error.message, stderr });
            } else {
                resolve(stdout.trim());
            }
        });
    });
};

module.exports = execCommand;
