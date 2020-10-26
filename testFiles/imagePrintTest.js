/*This test file is very specific to my personal machine.
It goes to my pictures folder and loads up random images in any old order
Said pictures are then placed in the document and saved so I can view the results*/

const fs = require('fs');
const makeDocument = require('../customModules/printCommand');
var path = '/home/zachary/Pictures/svg/renders/';

fs.promises.readdir(path).then(e=>{
    
    //Pdf1: single image
    fs.readFile(path+e[Math.floor(Math.random()*e.length)],(notImportant,imageFile)=>{
        makeDocument('yay test',[new Uint8Array(imageFile)]).save('./testResults/oneImage.pdf');
    });

    //Pdf2: Multiple images
    // var imageArrays = [];
    // var imageCount = Math.floor(Math.random()*2)+1;
    // console.log(imageCount);

    // var multiProgress = (e,f)=>{
    //     imageArrays.push(new Uint8Array(f));
    //     if(imageArrays.length == imageCount){
    //         makeDocument('Multi image test',imageArrays).save('./testResults/multiImage.pdf');
    //     }
    // }

    // for(let i = 0;i < imageCount;i++){
    //     fs.readFile(path+e[Math.floor(Math.random()*e.length)],multiProgress);
    // }

});