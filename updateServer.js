'use strict'
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');
const _ = require('underscore');
const indexPath = require.resolve('./index.jade');
const indexFn = require('jade').compileFile(indexPath);
const PORT = 1337;
const updatePath = path.resolve(__dirname, '..') + '/update'

let fileStatus = (msg) => {
  return new Promise((resolve, reject) => {
    fs.readdir(updatePath, (err, files) => {
      if(err){
        msg.fileStatus = '文件夹读取失败,请检查文件夹设置是否正确'
        return resolve(msg)
      }
      if(!files.length){
        msg.fileStatus = '文件夹为空,请存入升级文件'
        return resolve(msg);
      }
      for (let file of files){
        if (path.extname(file) !== '.des3'){
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
    let interfaces = require('os').networkInterfaces();  
    for(let devName in interfaces){  
          let iface = interfaces[devName];  
          for(let i = 0; i < iface.length; i ++){  
               let alias = iface[i];  
               if(alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal){
                 msg.networkStatus = 'http://' + alias.address + ':' + PORT + '/update';
                 return resolve(msg);
                }  
          }
      }
    msg.networkStatus = '无网络连接，柜机无法访问本机升级' 
    return resolve(msg)  
  })
}

let index = (req , res) => {
  Promise.resolve({})
        .then(fileStatus)
        .then(networkStatus)
        .then((msg) => {
          res.writeHeader(200,{'Content-Type':'text/html;charset=UTF-8'});
          return res.end(indexFn(msg));
        })
        .catch((err) => {
          res.writeHeader(500,{'Content-Type':'text/plain;charset=UTF-8'});
          return res.end('服务器启动失败');
        })
}

let latest = (req, res) => {
  fs.readdir(updatePath, (err, files) => {
    if(err){
      res.writeHeader(500,{'Content-Type':'text/plain;charset=UTF-8'});
      return res.end('没有读取到升级文件');
    }
    let latestFile = _.max(files, (file) => {
      let fullpath = [updatePath, file].join('/');
      return fs.statSync(fullpath).mtime;
    })
    res.writeHeader(200,{'Content-Type':'text/plain;charset=UTF-8'});
    return res.end(latestFile)
  })
}

let download = (req, res) => {
  let arg = url.parse(req.url, true).query;
  if(!arg.filename){
     res.writeHead(404, {"Content-Type": 'text/plain;charset=UTF-8'});
     return res.end("File Not found: 404 Not Found\n");
  }
  let filename = arg.filename;
  let filepath = path.resolve(updatePath, filename);
  fs.exists(filepath, (exists) => {
    if(!exists) {
      res.writeHead(404, {"Content-Type": 'text/plain;charset=UTF-8'});
      res.write("File Not found: 404 Not Found\n");
      return res.end();
    }
    fs.readFile(filepath, "binary", (err, file) => {
      if(err){
        res.writeHead(500, {"Content-Type": 'text/plain;charset=UTF-8'});
        res.write(err + "\n");
        return res.end();
      }
      res.writeHead(200, {
        "Content-Disposition": "attachment;filename=" + filename,
        'Content-Type': 'application/octet-stream',
        'Content-Length': file.length
      });
      res.write(file);
      res.end();
    })
  })
}

let server = http.createServer((req, res) => {
  let pathname = url.parse(req.url).pathname;
  switch (pathname){
    case '/index' :
      index(req, res);
      break;
    case '/update' :
      latest(req, res);
      break;
    case '/download' :
      download(req, res);
      break;
    default :
      res.writeHead(404, {"Content-Type": 'text/plain;charset=UTF-8'});
      res.end("Page Not found: 404 Not Found\n");
  }
})

server.listen(PORT);
