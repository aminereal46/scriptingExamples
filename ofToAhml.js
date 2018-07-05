'use strict';

var xmlParser = require('xml2js');
var XMLWriter = require('xml-writer');
var fs = require('fs');
var async = require('async');

var xw = new XMLWriter;

var INPUT_FILE = './export.xml';
var OUTPUT_FILE = './exportWithTimeStamp.ahml';

var parser = new xmlParser.Parser(
  {
    preserveChildrenOrder: true,
    explicitChildren: true,
  });

fs.readFile(INPUT_FILE, function(err, data) {
  parser.parseString(data, function(err, json) {
    var discussions = json.discussions;
    xw.startElement('askhub-logs');
    xw.text('\n');
    console.log('discussions found');
    if(discussions.chat){
      for(var chatIdx = 0; chatIdx < discussions.chat.length; chatIdx++){
        var chat = discussions.chat[chatIdx];
        xw.startElement('dialog');
        xw.writeAttribute('duration', chat.duration[0]);
        xw.writeAttribute('operatorName', chat.operator[0].$.pseudo);
        xw.writeAttribute('id', chat.$.id);
        xw.text('\n');
        if(chat.history){
          for (var msgIdx = 0; msgIdx < chat.history[0].$$.length; msgIdx++) {
            var msg = chat.history[0].$$[msgIdx];
            var dateParts = chat.datetime[0].split(' ')[0].split("/");

            var date = dateParts[1]+'/'+dateParts[0]+'/'+dateParts[2]+' '+msg.$.time;
            var timeStamp = new Date(date).getTime();
            console.log(date);
            if(isNaN(timeStamp)){
              console.log(date);
              console.log(timeStamp);
              console.log(chatIdx);
            }
            if(msg['#name'] === 'visitor'){
              xw.startElement('user');
              xw.writeAttribute('timeStamp', timeStamp);
              xw.text(msg._);
              xw.endElement();
              xw.text('\n');
            }
            else if(msg['#name'] === 'operator'){
              xw.startElement('bot');
              xw.writeAttribute('timeStamp', timeStamp);
              xw.text(msg._);
              xw.endElement();
              xw.text('\n');
            }
          }
        }
        xw.endElement();
        xw.text('\n');
      }
    }
    xw.endElement();
    fs.writeFile(OUTPUT_FILE, xw, function(err) {
      if(err) {
          return console.log(err);
      }

      console.log("The file was saved!");
  });
  });
});
