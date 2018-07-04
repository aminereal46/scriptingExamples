'use strict';

const fs = require('fs');
const xmlParser = require('xml2js');
const json2csv = require('json2csv').Parser;
const csv=require('csvtojson');


var csvFile = '20180529 Intents_ISSY_FAQ.csv';
var xmlFile = 'issyIntents.xml';
var outputFile = '20180529 output.csv';
var columns = ['intent','entities'];
console.log('aaaa');
fs.readFile(xmlFile, function(err, data){
  if(err){
    console.error('fails to read'+xmlFile);
    return;
  }
  xmlParser.parseString(data, function(err, json) {
    var graph = json['intents'];
    var intents = {};
    for(var intIdx = 0; intIdx < graph.intent.length; intIdx++){
      var intent = graph.intent[intIdx];
      if(Object.keys(intents).indexOf(intent.name[0]) >= 0)
        console.log(intIdx,' ',intent.name[0]);
      intents[intent.name[0]] = intent['next-node'][0].name[0];
    }
    console.log(intents);
    var nb = 0;
    var nbs = 0;
    var output = [];
    var foundIntents = [];
    csv({delimiter:[';']}).fromFile(csvFile).on('json',(jsonObj)=>{
      console.log(jsonObj.intent);
      if(jsonObj.intent.length > 0){
        nbs++;
        var intentName = jsonObj.intent;
        if(Object.keys(intents).indexOf(intentName) >= 0){
          foundIntents.push(intentName);
          jsonObj.intent = intents[intentName];
          nb++;
          console.log(intentName,' ',intents[intentName]);
        }
        else{
          console.log('intentName:',intentName);
        }
      }
      output.push(jsonObj);
    })
    .on('done',(error)=>{
      for(var intIdx = 0; intIdx < graph.intent.length; intIdx++){
        var intent = graph.intent[intIdx];
        console.log(intIdx);
        if(foundIntents.indexOf(intent.name[0]) < 0){
          nb++;
          console.log('eee');
          if(intent.entry){
            for(var entIdx = 0; entIdx < intent.entry.length; entIdx++){
              var entr='' ;
              var entry = intent.entry[entIdx];
              for(var entityIdx = 0; entityIdx < entry.entity.length; entityIdx++){
                var entity = entry.entity[entityIdx];
                entr += '['+entity.element.join(',')+']';
              }
              output.push({
                intent: intent['next-node'][0].name[0],
                entities: entr
              });
            }
          }
        }
      }

      console.log('number:',nb,' ',nbs);
      console.log('intents:',JSON.stringify(output));
      var jsonToCsv = new json2csv({columns, delimiter:';'});
      var writeCsv = jsonToCsv.parse(output);
      fs.writeFile(outputFile, writeCsv,function(err, data){
        console.log('done');
      });
    });
  });



});
