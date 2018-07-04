'use strict';

const fs = require('fs')
var async = require('async');
var aws = require('aws-sdk');
aws.config.update({
  "accessKeyId": 'AKIAJG72L2XRYUBEPFBA',
  "secretAccessKey": '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',
  'region': 'eu-west-1'
});
var dynamoDB = new aws.DynamoDB({
  'apiVersion': '2012-08-10'
});

var util = require('./util/util');
var limit = 2;
var timeOut = 1000;
var recursiveFunction = function(exclusiveStartKey){
  var contextQueryParams = {
      'TableName': 'askhub_contextGraph',
      'Limit': limit
  };
  if(exclusiveStartKey){
    contextQueryParams.ExclusiveStartKey = exclusiveStartKey;
  }

    dynamoDB.scan(contextQueryParams, function(err, data) {
        if (err) {
      console.error(err);
      return;
        }

    if (data.Count === 0) {
    console.log('No context found');
    if(data.LastEvaluatedKey){
      setTimeout(function () {
        recursiveFunction(data.LastEvaluatedKey);
      }, timeOut);
      return;
    }

    console.log('done');
    }

        console.log('Successfully scanned table');
        if (!fs.existsSync('issyLogs')){
          fs.mkdirSync('issyLogs');
        }
        var funcFactory = function(item){
          return function(callback){
            var path = '';
            if(item.creationTime === 'Current'){
              var finalUserId = item.finalUserId;
              path = 'issyLogs/Current/'+finalUserId;
              if (!fs.existsSync('issyLogs/Current')){
                fs.mkdirSync('issyLogs/Current');
              }
            }
            else {
              if (!fs.existsSync('issyLogs/archives')){
                fs.mkdirSync('issyLogs/archives');
              }
              path = 'issyLogs/archives/'+item.creationTime;
            }
            console.log('file'+ path+ 'is created');
            fs.writeFile(path, JSON.stringify(item), function(err,data){
              callback(null);
            });
          };
        };
        var funcs = [];
        for(var idx = 0; idx < data.Items.length; idx++){
          funcs.push(funcFactory(util.removeDynamoDBTypeMarkers({'M': data.Items[idx]})));
        }
        async.parallel(funcs, function(err, results){
          console.log('length',results.length,results);
          if(data.LastEvaluatedKey){
            setTimeout(function () {
              recursiveFunction(data.LastEvaluatedKey);
            }, timeOut);
            return;
          }
          console.log('done');
        });
  });
}
recursiveFunction();
