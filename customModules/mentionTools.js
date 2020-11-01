//Made by Zachary Mitchell in 2020!
//These are tools that help manage mentions in a message

function replaceMentionTags(msg,text){
    var result = '';
    var currId = '';
    var parsingId = false;
    //I'm not sure what ! is, but it happens so it's here:
    var mentionTypes = ['<@','<@!','<@&'];
    var selectedTypeIndex = 0;
    console.log(text,msg.mentions);
    for(var i = 0;i < text.length;i++){
        //Look for an id, if we hit > we then seaarch for that ID in the message object.
        //user.username
        if(text[i] == '<' && text[i+1] == '@'){
            console.log('hi');
            parsingId = true;
            selectedTypeIndex = 0;
            i+=2;
        }

        if(parsingId){
            if(text[i] == '!') selectedTypeIndex = 1;
            else if(text[i] == '&') selectedTypeIndex = 2;
            else if(text[i] == '>'){
                //Time to append the username; if it doesn't exist, append currId with the syntax that triggered parsingId
                parsingId = false;
                var targetUser = msg.mentions.users.get(currId) || msg.mentions.roles.get(currId);
                if(targetUser) result+='@'+(targetUser.username || targetUser.name); //name is for a "role"; apparently bots fall into this category as well.
                else{
                    console.log(currId);
                    result+=mentionTypes[selectedTypeIndex]+currId+'>';
                }
                currId = '';
            }
            else if(!isNaN(text[i])) currId+= text[i];
            else{
                parsingId = false;
                result+=mentionTypes[selectedTypeIndex]+currId;
                currId='';
            }

        }
        else result+=text[i];
    }

    if(currId.length) result+= mentionTypes[selectedTypeIndex]+currId;

    return result;
}

if(typeof module == 'object' && typeof module.exports == 'object') module.exports = { replaceMentionTags:replaceMentionTags };