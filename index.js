'use strict'

var fs = require('fs');
var inputFile = './20180529 output.csv'
var outputFile = './20180529 intents2.csv'
var json2csv = require('json2csv').parse;

var columns = ['intent','combination'];

var generateCombinations = function(results, comb, combinations){
  if(combinations.length === 0){
    results.push(comb.trim());
    return;
  }
  var words = combinations[0].split(',');
  for(var wordIdx = 0; wordIdx < words.length; wordIdx++){
    generateCombinations(results, comb+' '+words[wordIdx], combinations.slice(1));
  }
};

fs.readFile(inputFile, function(err, data){
  var lines = data.toString().split('\n');
  console.log(lines.length);
  var json = [];
  var intent;
  for(var lineIdx = 0; lineIdx < lines.length; lineIdx++){
    var line = lines[lineIdx];
    var csvIntent = line.split(',')[0];
    if(csvIntent.length > 0){
      intent = csvIntent;
    }
    var combinations = line.split(',')[1];
    if(combinations && combinations.length > 0){
      var comb = [];
      if(combinations.trim()[0] !== '[' && combinations.indexOf('[') > 0){
        comb[0]=combinations.trim().substring(0,combinations.indexOf('['));
        combinations = combinations.trim().substring(combinations.indexOf('['));
      }
      var combs = combinations.replace(/\[/g,'');
      comb = comb.concat(combs.split(/] */));
      var results = [];
      generateCombinations(results, '', comb);
      for(var combIdx = 0; combIdx < results.length; combIdx++){
        var jsonLine = {
          'intent': intent,
          'combination': results[combIdx]
        };
        json.push(jsonLine);
      }
    }
  }
  console.log(json.length);
  var csv = json2csv(json, {columns});
  console.log(csv);
  fs.writeFile(outputFile,csv,function(err,data){
    if(err){
      console.error('error');
      return;
    }
    console.log('done');
  });
});
