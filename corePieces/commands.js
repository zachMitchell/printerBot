//Made by Zachary Mitchell in 2020!
//Stripped down script from another bot of mine to offer the print command or any other commands for the future.

//Load the modules!
var customModules = {};

//These are file names you can find from customModules. For example: mentionTools.js would be mentionTools here.
var moduleList = ['printCommand','grabFromTheInternet','mentionTools'];

for(i of moduleList)
    customModules[i] = require('../customModules/'+i+'.js');

delete moduleList;

var commands = {
    'print':(m,args,quiet)=>{
        if(args.length == 1 && m.attachments.size === 0){
            m.channel.send('*(Error: Message was blank, so nothing will be sent to the printer. For help, use `/printhelp`)*')
            return { cooldownAppend: -12600 };
        }
        
        if(quiet) m.delete();

        //Icon is obtained and then everything else runs.
        if(m.author.avatar!=null)
            customModules.grabFromTheInternet.downloadSingle('https://cdn.discordapp.com/avatars/'+m.author.id+'/'+m.author.avatar+'.png',e=>execPrint(m,args,e),['png']);
        else execPrint(m,args);

    },
    'printq':(m,args)=>commands.print(m,args,true),
    'printhelp':(m,args)=>{
        m.channel.send("To use me, just use `/print` and write down a message! That message along with any linked / attached pictures will be sent in for printing.\nIf you don't want anyone to know what you're sending, use `/printq` instead (doesn't prevent notifications)");
    }
}

//Print command is getting really big so it's being placed down here:
function execPrint(m,args,userIcon = null){
    m.reply('Now generating the page, this could take a little while...');
        
        var finishedMsg = 'Your page is now being printed!';
        //Parse the message and look for links. Each message is a maximum of 2000 characters
        var links = [];
        var currStr = '';
        var inLink = false;
        var iconResult = userIcon ? new Uint8Array(userIcon) : undefined;
        var filteredText = customModules.mentionTools.replaceMentionTags(m,args.slice(1).join(" "));
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
            customModules.printCommand(m.author.username+": "+filteredText,undefined,iconResult).save(saveDate);
            exec('lp '+saveDate,(err,out,stderr)=>{
                console.log(err,out,stderr);
                m.reply(finishedMsg);
            });
        }
        else{
            //Download absolutely everything, then add the attachments to the image plus the message text
            customModules.grabFromTheInternet.downloadMulti(links,e=>{
                var imgArrays = [];
                for(var i of e)
                    imgArrays.push(new Uint8Array(i));

                var saveDate = './pdfArchive/'+(new Date().getTime())+".pdf";
                customModules.printCommand(m.author.username+": "+filteredText,imgArrays,iconResult).save(saveDate);
                exec('lp '+saveDate,(err,out,stderr)=>{
                    console.log(err,out,stderr);
                    m.reply(finishedMsg);
                });
            },['jpg','jpeg','png','gif']);
        }
}

module.exports = commands;