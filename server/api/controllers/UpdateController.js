/**
 * UpdateController
 *
 * @description :: Server-side logic for managing updates
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
'use strict'
const fs = require('fs'),
      _ = require('underscore');
module.exports = {
  latest : (req, res) => {
    let updatePath = sails.config.server.updatePath;
    fs.readdir(updatePath, (err, files) => {
      if(err){
        return sails.log.error(err);
      }
      let latestFile = _.max(files, (file) => {
        let fullpath = [updatePath, file].join('/');
        return fs.statSync(fullpath).mtime;
      })
      return res.ok(latestFile)
    })
  }
};

