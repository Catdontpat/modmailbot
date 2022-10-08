const express = require('express');
const helmet = require('helmet');


function notfound(res) {
    res.status(404).send("Page not found");
}




function serveAttachments(req,res) {

}


const server = express();
server.use(helmet());

server.on('error', err => {
    console.log("[WARN] Web server err:", err.message);
})

module.exports = server;