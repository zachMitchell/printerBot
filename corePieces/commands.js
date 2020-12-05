//Made by Zachary Mitchell in 2020!

//Stripped down script from another bot of mine to offer the print command or any other commands for the future.
//Load the modules!
const { exec } = require("child_process");
var customModules = {};

//These are file names you can find from customModules. For example: mentionTools.js would be mentionTools here.
var moduleList = ['printCommand','grabFromTheInternet','mentionTools','youtubeLinkTools'];

for(i of moduleList)
    customModules[i] = require('../customModules/'+i+'.js');

delete moduleList;

var commands = {
    'print':(m,args,cooldown,quiet)=>{
        if(args.length == 1 && m.attachments.size === 0){
            m.channel.send('*(Error: Message was blank, so nothing will be sent to the printer. For help, use `/printhelp`)*')
            return { cooldownAppend: -12600 };
        }

        //Icon is obtained and then everything else runs.
        if(m.author.avatar!=null)
            customModules.grabFromTheInternet.downloadSingle('https://cdn.discordapp.com/avatars/'+m.author.id+'/'+m.author.avatar+'.png',e=>execPrint(m,args,e,cooldown,quiet),['png']);
        else execPrint(m,args,null,cooldown,quiet);

    },
    'printq':(m,args,cooldown)=>commands.print(m,args,cooldown,true),
    'printhelp':(m,args)=>{
        m.channel.send("To use me, just use `/print` and write down a message! That message along with any linked / attached pictures will be sent in for printing.\nIf you don't want anyone to know what you're sending, use `/printq` instead (doesn't prevent notifications)");
    }
}

//Print command is getting really big so it's being placed down here:
function execPrint(m,args,userIcon = null,cooldown,quiet){
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

        //Grab youtube thumbnails
        var thumbnails = customModules.youtubeLinkTools.detectLinks(filteredText);
        if(thumbnails.length)
            for(var i of thumbnails) links.push(customModules.youtubeLinkTools.makeThumbnailLink(i));


        //This guy counts how many instances of a link is used, everytime one passes through, we simply duplicate the end result when doing stuff like pictures or qr codes
        var linkObj = {};

        //Fill-er up:
        for(var i of links){
            if(!linkObj[i]) linkObj[i] = 1;
            else linkObj[i]++;
        }

        if(!links.length){
            if(quiet) m.delete();
            var saveDate = './pdfArchive/'+(new Date().getTime())+".pdf";
            customModules.printCommand(m.author.username+": "+filteredText,undefined,iconResult).save(saveDate);
            exec('lp '+saveDate,(err,out,stderr)=>{
                console.log(err,out,stderr);
                m.reply(finishedMsg);
            });
        }
        else{
            //Download absolutely everything, then add the attachments to the image plus the message text
            customModules.grabFromTheInternet.downloadMulti(Object.keys(linkObj),(e,badLinks)=>{
                if(quiet) m.delete();
                var imgArrays = [];
                for(var i of e){
                    //make sure we don't hit WEBPVP8 (jspdf doesn't seem to handle this well for now)
                    if(i[0].toString().indexOf('WEBPVP8') > -1){
                        m.reply('Sorry, it looks like one of your jpgs was using the `WEBP` format which I can\'t Process :/\nTry saving the image in a different format and print again, your cooldown has been lifted.');
                        cooldown.appendSeconds('printGroup',m,-12600);
                        return;
                    }

                    for(var j = 0; j < linkObj[i[1]];j++ )
                        imgArrays.push(new Uint8Array(i[0]));
                    // console.log(imgArrays[imgArrays.length-1].toString());
                }

                var saveDate = './pdfArchive/'+(new Date().getTime())+".pdf";
                //Run this if we don't have qrcodes to generate, otherwise, wait until qrcodes are done generating
                var printEverything=()=>{
                    customModules.printCommand(m.author.username+": "+filteredText,imgArrays,iconResult).save(saveDate);
                    exec('lp '+saveDate,(err,out,stderr)=>{
                        console.log(err,out,stderr);
                        m.reply(finishedMsg);
                    });
                }

                if(badLinks.length){
                    //Qr code generation!
                    var resultBuffers = [];
                    for(let i of badLinks) exec('qrencode -o - '+i,{encoding:'Buffer'},(err,out,stdout)=>{
                        try{
                            resultBuffers.push(new Uint8Array(out));
                            if(resultBuffers.length == badLinks.length){
                                imgArrays.push(...resultBuffers);
                                printEverything();
                            }
                        }
                        catch(e){
                            console.error(e);
                        }
                    });
                }
                else printEverything();
            },['jpg','jpeg','png','gif']);
        }
}

module.exports = commands;