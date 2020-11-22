//Made by Zachary Mitchell in 2020!
//A module that grabs US youtube video links and provides tools like a (dumb) thumbnail link generator, and simply a method of shortening and detecting youtube links

function detectLinks(str){
    var results = [];
    var queries = ['youtube.com','youtu.be'];

    for(var i = 0;i < str.length;i++){
        //youtube.com
        if(str.substring(i,i+queries[0].length) == queries[0]){
            // console.log(str.substring(i,i+queries[0].length));
            //Grab v= and obtain them link. watch?v= won't work because somebody could troll the system and use something like t= instead
            var resultSearch = filterLinkCode(str.substring(i).split('v=')[1]);
            if(resultSearch) results.push(resultSearch);
        }

        //youtu.be
        else if(str.substring(i,i+queries[1].length) == queries[1]){
            var resultSearch = filterLinkCode(str.substring(i).split('/')[1]);
            if(resultSearch) results.push(resultSearch);
        }
    }

    return results;
}

//Takes a filtered half of a youtube video link and takes everything in until we meet a filtered character.
function filterLinkCode(splitYtLink){
    var endFilters = '/& =';
    var result = '';

    //We then run though a generous filter and find the link regardless of it's ending
    for(var j = 0; j < splitYtLink.length; j++){
        if(endFilters.indexOf(splitYtLink[j]) > -1){
            if(result) return result;
            break;
        }
        else result += splitYtLink[j];
    }
}

//really simple function, so easy a caveman could do it
var makeThumbnailLink = str=>'https://i.ytimg.com/vi/'+str+'/hq720.jpg';

if(typeof module == 'object' && typeof module.exports == 'object') module.exports = {detectLinks:detectLinks, makeThumbnailLink:makeThumbnailLink};