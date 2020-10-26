//Made by Zachary Mitchell in 2020!
//Simple conversion tools for jspdf to convert between inches and px

//See proto.js for how this random number came to be:
const inchPx = 179.18; //1 inch is this many pixels
// const inchPx = 360
//Recursive function that converts one or a list of numbers to px
function inchToPx(num,reverse = false){
    if(typeof num == 'number') return reverse ? inchPx * num : num / inchPx;

    else if(Array.isArray(num)){
        var result = [];
        for(var i of num) result.push(inchToPx(i));
        return result;
    }
}

function aspectRatio(wh = {width:10,height:10},changedNum){
    var percentChange = (100/(wh.width > wh.height ? wh.width : wh.height)) * changedNum;

    return {width: wh.width * percentChange * .01, height: wh.height * percentChange * .01 };
}

if(typeof module == 'object' && typeof module.exports == 'object')
    module.exports = {
        inchToPx:inchToPx,
        aspectRatio:aspectRatio
    }