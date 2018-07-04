'use strict'

const fs = require('fs');
const xmlParser = require('xml2js');

var INPUT_FILE = './NLG_FAQ-Tableau 1 (1).csv';
var OUTPUT_FILE = './intentswithoutnodes2.txt'
var nbr = 0;
var nodesNames = [];

fs.readFile('./issyIntents.xml',function(err,data){
  if(err){
    console.error('error : ',err);
    return;
  }
  console.log('data:',data);
  xmlParser.parseString(data, function(err, json) {
    if(err){
      console.error('error : ',err);
      return;
    }
    var nodes = json['intents'];
    for(var nodeIdx = 0; nodeIdx < nodes.intent.length; nodeIdx++){
      var intent = nodes.intent[nodeIdx];
      nodesNames.push(intent.name[0]);
    }

    fs.readFile(INPUT_FILE, function(err, data){
      if(err){
        console.error('error : ',err);
        return;
      }
      var lines = data.toString().split('\n');
      var intnbr = 0;
      for(var lineIdx = 1; lineIdx < lines.length; lineIdx++){
        var line = lines[lineIdx];
        console.log(lineIdx+' : ',line);
        var intent = line.split(';')[2];
        console.log(intent+'line:'+lineIdx);
        if(intent && intent.length > 0){
          intnbr++;
          if(nodesNames.indexOf(intent) < 0){
            fs.appendFileSync(OUTPUT_FILE, intent+ '\n');
            nbr++;
          }
        }
      }
        console.log('nbre intents : ',intnbr);
        console.log(nbr);

    });
  });
});
