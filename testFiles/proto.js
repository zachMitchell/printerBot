//Not sure if this works anymore, if it doesn't, try moving it to the root project folder.
//This is a hot mess that I used to reference most of the projects more concrete code.
const { jsPDF } = require('jspdf');
const https = require('https');

// Default export is a4 paper, portrait, using millimeters for units
const doc = new jsPDF({unit:'in'});

var asdf = Array(2000).fill('a').join('');
doc.setFontSize(11);
console.log(doc.getFontSize());
console.log(doc.text(asdf, 0.2,.3,{maxWidth:7.5}).getLineHeight());
// doc.text('==end==',4.13,11.69/3.25);

var resultBuffer = [];
//https://zdmitchellblog.files.wordpress.com/2019/02/smilehappy.png
//https://en.wikipedia.org/static/images/project-logos/enwiki.png
https.get('https://zdmitchellblog.files.wordpress.com/2019/02/smilehappy.png',res=>{
    res.on('data',e=>{resultBuffer.push(e)});
    res.on('end',function(){
        var result = new Uint8Array(Buffer.concat(resultBuffer));
        var prop = doc.getImageProperties(result);
        // console.log(prop);

        //Make the biggest number 100%
        var biggest = prop.width > prop.height? prop.width: prop.height;
        var wh = [(1/biggest) * prop.width,(1/biggest) * prop.height];

        doc.addImage(result,prop.fileType,0.0,4.25,wh[0]*3.5,wh[1]*3.5);
        doc.addImage(result,prop.fileType,3.5,4.25,wh[0]*3.5,wh[1]*3.5);
        //px variant
        // doc.addImage(result,prop.fileType,0,0,445,150);
        // doc.addImage(result,prop.fileType,300,0,150,150);
        doc.save('a4.pdf');
    });
});

/*require('fs').readFile('enwiki.png',(e,f)=>{
    var result = new Uint8Array(f);
    doc.addImage(result,'png',0.2,4,1,1);
    doc.save('a4.pdf');
});*/

/*Doing some really rough math to figure out the difference between px and inches
A4 Width: 8.26 inches
PX Width: 500 * ~3 ( 500 * 2.96 ) = 1480

1480 / 8.26 = 179.18px = 1in

A4: 8.26 X 11.69
PX: 1480 X 2094.6 (again, rough estimate)

Found the 2.96 by stretching a 500 X 500 image until it reached the edge of the paper.*/