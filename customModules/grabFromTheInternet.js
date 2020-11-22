//Made by Zachary Mitchell in 2020!
//A simple script that makes use of built-ins to load links from the internet.
var https = require('https');
var http = require('http');

function downloadMulti(listOfLinks, done = ()=>{}, types = [], listeners = {} ){
    var resultBuffers = [];
    var badLinks = [];
    var doneCount = 0; //This doesn't mean we got all the data, just that we tried. Actual results will vary.

    //Everytime a download is finished we run this, when all downloads are attempted, run whatever function the user provided before running downloadMulti.
    var linkDone = (buffer,link)=>{
        if(buffer) resultBuffers.push(buffer);
        else badLinks.push(link);
        doneCount++;
        if(doneCount == listOfLinks.length){
            done(resultBuffers,badLinks);
        }
    }

    for(var i of listOfLinks) downloadSingle(i,linkDone,types,listeners);
}

function downloadSingle(link,done = ()=>{},types=[],listeners = {}){
    var resultBuffer = [];
    (link.indexOf('http://') == 0 ? http : https).get(link,res=>{
        for(var i in listeners){
            if(['data','end'].indexOf(i) == -1) res.on(i,listeners[i]);
        }

        //If data type is not one listed in "types"
        var foundContentType = false;
        if(types.length && res.headers['content-type']) for(var i of types){
            if(res.headers['content-type'].indexOf(i) > -1){
                foundContentType = true;
                break;
            }
        }

        if(types.length && !foundContentType){
            done(undefined,link);
            return;
        }
        
        res.on('data',chunk=>resultBuffer.push(chunk));
        res.on('end',function(){
            // console.log(link);
            if(listeners['end']) listeners['end'](arguments);
            done(Buffer.concat(resultBuffer),link);
        });
        
    });
}

if(typeof module == 'object' && typeof module.exports == 'object')
    module.exports = {
        downloadMulti:downloadMulti,
        downloadSingle:downloadSingle
    }