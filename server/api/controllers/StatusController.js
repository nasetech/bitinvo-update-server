/**
 * NetworkController
 *
 * @description :: Server-side logic for managing networks
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
'use strict'
const fs = require('fs'),
      path = require('path'),
      Promise = require('bluebird');

let fileStatus = (msg) => {
  return new Promise((resolve, reject) => {
    let updatePath = sails.config.server.updatePath;
    fs.readdir(updatePath, (err, files) => {
      if(err){
        sails.log.error('#### StatusController : file readdir error####');
        sails.log.error(err);
        msg.fileStatus = '文件夹读取失败,请检查文件夹设置是否正确'
        return resolve(msg)
      }
      if(!files.length){
        sails.log.debug('#### StatusController : file empty folder####');
        msg.fileStatus = '文件夹为空,请存入升级文件'
        return resolve(msg);
      }
      for (let file of files){
        if (path.extname(file) !== '.des3'){
          sails.log.debug('####StatusController : file type error : %s ####', path.extname(file));
          msg.fileStatus = '请存入正确的升级文件（*.des3)';
          return resolve(msg)
        }
      }
      msg.fileStatus = '检测到升级文件，服务器已启动'
      resolve(msg)
    })
  })
}

let networkStatus = (msg) => {
  return new Promise((resolve, reject) => {
    var interfaces = require('os').networkInterfaces();  
    for(var devName in interfaces){  
          var iface = interfaces[devName];  
          for(var i = 0; i < iface.length; i ++){  
               var alias = iface[i];  
               if(alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal){
                      msg.networkStatus =  alias.address + ':1337/update';
                     return resolve(msg);  
               }  
          }
      }
    msg.networkStatus = '无网络连接，柜机无法访问本机升级' 
    return resolve(msg)  
  })
}
module.exports = {
  index : (req, res) => {
    Promise.resolve({})
           .then(fileStatus)
           .then(networkStatus)
           .then((msg) => {
             return res.render('index', msg);
           })
           .catch((err) => {
             sails.log.error(err);
             return res.serverError('服务器启动失败');
           })
  }
};

