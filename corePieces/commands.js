//Made by Zachary Mitchell in 2020!
//Stripped down script from another bot of mine to offer the print command or any other commands for the future.

const { exec } = require('child_process');

//Load the modules!
var customModules = {};

//These are file names you can find from customModules. For example: eMark.js would be eMark here.
var moduleList = ['printCommand','grabFromTheInternet'];

for(i of moduleList)
    customModules[i] = require('../customModules/'+i+'.js');

delete moduleList;

var commands = {
    'print':(m,args,quiet)=>{
        if(quiet) m.delete();

        m.reply('Now generating the page, this could take a little while...');
        var finishedMsg = 'Your page is now being printed!';

        //Parse the message and look for links. Each message is a maximum of 2000 characters
        var links = [];
        var currStr = '';
        var inLink = false;
        for(var i =0;i < m.content.length;i++){
            //Messy if statement, could probably be cut down :P
            if(m.content[i] == 'h' && (m.content.substring(i,i+7) == 'http://' || m.content.substring(i,i+8) == 'https://'))
                inLink = true;
            
            if(inLink){
                if(m.content[i] == " "){
                    inLink = false;
                    links.push(currStr);
                    currStr = "";
                }
                else currStr+=m.content[i];
            }
        }

        if(currStr.length) links.push(currStr);

        //Grab links to actual attachments, doesn't matter if they're images or not, that will be filtered later
        for(var i of m.attachments)
            links.push(i[1].attachment);
        
        if(!links.length){
            var saveDate = './pdfArchive/'+(new Date().getTime())+".pdf";
            customModules.printCommand(m.author.username+": "+m.content).save(saveDate);
            m.reply(finishedMsg);
        }
        else{
            //Download absolutely everything, then add the attachments to the image plus the message text
            customModules.grabFromTheInternet.downloadMulti(links,e=>{
                var imgArrays = [];
                for(var i of e)
                    imgArrays.push(new Uint8Array(i));

                var saveDate = './pdfArchive/'+(new Date().getTime())+".pdf";
                var newDoc = customModules.printCommand(m.author.username+": "+args.slice(1).join(" "),imgArrays);
                newDoc.save(saveDate);
                exec('lp '+saveDate,(err,out,stderr)=>{
                    console.log(err,out,stderr);
                    m.reply(finishedMsg);
                })
            },['jpg','jpeg','png','gif']);
        }

    },
    'printq':(m,args)=>commands.print(m,args,true)
}

module.exports = commands;