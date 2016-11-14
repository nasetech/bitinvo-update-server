/**
 * NetworkController
 *
 * @description :: Server-side logic for managing networks
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
module.exports = {
	ip : (req, res) => {
    var interfaces = require('os').networkInterfaces();  
    for(var devName in interfaces){  
          var iface = interfaces[devName];  
          for(var i = 0; i < iface.length; i ++){  
               var alias = iface[i];  
               if(alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal){  
                     return res.ok(alias.address + ':1337/latest');  
               }  
          }  
      } 
  }
};

