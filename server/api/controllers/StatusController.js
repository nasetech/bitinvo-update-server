/**
 * NetworkController
 *
 * @description :: Server-side logic for managing networks
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
'use strict'
const fs = require('fs'),
      path = require('path')
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
    return res.serverError('无网络连接')  
  },

  file : (req, res) => {
    let updatePath = sails.config.server.updatePath;
    fs.readdir(updatePath, (err, files) => {
      if(err){
        sails.log.error('#### StatusController : file readdir error####');
        sails.log.error(err);
        return res.serverError('读取文件夹失败');
      }
      if (!files.length){
        sails.log.debug('#### StatusController : file empty folder####');
        return res.serverError('文件夹为空');
      }
      for (let file of files){
        if (path.extname(file) !== 'des3'){
          sails.log.debug('####StatusController : file file type error ####');
          return res.serverError('文件类型错误')
        }
      }
      return res.ok()
    })
  }
};

