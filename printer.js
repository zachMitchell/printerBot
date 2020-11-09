//Made by Zachary Mitchell in 2020!
//Printer bot (surprise surprise) allows everyone on discord to print from your printer!

//His backbone will be discord.js:
const Discord = require('discord.js');
const client = new Discord.Client();

var commands = require('./corePieces/commands.js'),
    cooldown = require('./corePieces/cooldown.js');

//This holds every group the bot has touched while it's been turned on. Used to cooldown commands.
const cooldownGroup = new cooldown.guildGroup();

var cooldownDefaults = {
    'printGroup':{
        isGroup: true,
        coolTime:12600, //3 hours, 30 minutes
        uses:1,
        glue:true,
        commands:['print','printq']
    },
    'printhelp':{
        coolTime:180,
        uses:1
    }
}

client.on('ready',()=>console.log('Im in! ',client.user.tag));

client.on('message',msg=>{
    //Commands should be easier to run though since we're using associative arrays to determine if the command is even there
    if(msg.content[0] == '/'){
        //Check to see what command we got if at all:
        var args = msg.content.split(' ');
        var actualCommand = args[0].substring(1);

        if(commands[actualCommand] && !msg.author.bot){
            //Setup command cooldown for this guild. If there's no config we have defaults
            var guild = msg.channel.guild;
            //Run the comand
            if(!guild){
                msg.reply('Nice try >:)\nI can only be used on a discord server! If you want to print in secret on a server, just use `/printq`');
                return;
            }

            if(guild && !cooldownGroup[guild.id])
                cooldownGroup.createConfig(msg.channel.guild.id,cooldownDefaults)
            
            var cooldownResults = [];
            //This function tracks the command's use. If we can't use it, don't run the command.
            cooldownResults = cooldownGroup[msg.channel.guild.id].updateUsage(actualCommand,msg);

            if(guild && !cooldownResults[0]){
                // console.log(msg);
                var commandResults = commands[actualCommand](msg,args,cooldownGroup[msg.channel.guild.id]);
                if(typeof commandResults == 'object' && commandResults.cooldownAppend)
                    cooldownGroup[msg.channel.guild.id].appendSeconds(actualCommand,msg,commandResults.cooldownAppend);
            }

            //If the command was disabled, show this message
            else if(!cooldownResults[1]){
                if(cooldownResults[0] === null)
                    msg.reply('The '+actualCommand+' command has been turned off...');
                //If the user hasn't tried typing the command twice, show this message if cooldown is present
                else if(cooldownResults[0] && ['print','printq'].indexOf(actualCommand) > -1){
                    var waitTime = Math.ceil(cooldownResults[2] / 60);
                    msg.reply('You already printed! Please wait '+(waitTime < 60 ? waitTime + 'more minutes':(waitTime/60)+' more hours')+' before printing again :)');
                }
                else if(cooldownResults[0]){
                    msg.reply('*Cooldown hit; please wait '+Math.ceil(cooldownResults[2])+' more seconds to run this command again*');
                }
            }

            //If the user tried again, don't respond back.
        }
    }
});

client.login(require('./token'));