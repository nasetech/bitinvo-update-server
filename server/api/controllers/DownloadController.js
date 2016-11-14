/**
 * DownloadController
 *
 * @description :: Server-side logic for managing downloads
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
'use strict'
const path = require('path');
module.exports = {
  //下载
  //path : 更新文件的位置
	download : (req, res) => {
    let updatePath = path.resolve(__dirname, '../../../..') + '/update'
    let filename = req.query.filename;
    res.download(updatePath + '/' + filename, filename);
  }
};

