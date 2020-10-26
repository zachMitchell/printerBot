//Made by Zachary Mitchell in 2020!
//Make a "discord document" by adding text on one half and plaster text on the other. Basically a barebones PDF.
const { jsPDF } = require('jspdf');
const measureTools = require('./jsPdfMeasureTools');


const a4Offset = 4.25 //where 4.25 is the sweet spot for roughly half the page
const imageSpace = [8.26, 11.69];


//Images must be in UInt8Array format before sending to this function
function makeDocument(text='',images=[]){
    var doc = new jsPDF({unit:'in'});
    doc.setFontSize(11);
    doc.text(text, 0.2,1,{maxWidth:7.5});

    /*Image handling will be complicated, but the gist:
    If it's a single image: display it at full res except when you can't
    If there are multiple images: display in a grid.
    
    In the future I want to perfect a jigsaw algorythm but the general concept phase isn't working out very well
    (jigsaw: basically jam each picture in like a puzzle piece successfully)*/

    if(images.length){

        //Determine realestate available for inserting images:
        //Grab all image properties
        var imageProps = [];
        for(var i of images) imageProps.push(new imgObj(i,doc.getImageProperties(i)));

        if(imageProps.length == 1){
            var adjustedWH = {width:imageProps[0].dim[0],height:imageProps[0].dim[1]};
            //Place the sole image at full resolution; if it doesn't fit, just shrink the size.
            if(adjustedWH.width > imageSpace[0])
                adjustedWH = measureTools.aspectRatio(adjustedWH,imageSpace[0]);
            
            if(adjustedWH.height > imageSpace[1] - a4Offset)
                adjustedWH = measureTools.aspectRatio(adjustedWH,imageSpace[1] - a4Offset);
            
            //Insert the image:
            doc.addImage(imageProps[0].data,imageProps[0].extension,0,a4Offset,adjustedWH.width,adjustedWH.height);
        }
    
        //Figure out if we can tile the images, if not; we place them in a grid instead (way less taxing)
        // else if(tileImages(imageProps,undefined,true))
        //     tileImages(imageProps,doc);
        
        //A grid is guaranteed to work because everything is the same size.
        else imageGrid(imageProps,doc);
    }

    return doc;
}

//Custom object that automatically converts px to inches
function imgObj(data,properties){
    this.data = data; //This should be a UInt8Array
    //Dimensions are converted from px to inches because we're printing to A4 paper.
    this.dim = measureTools.inchToPx([properties.width,properties.height],true);
    // console.log(this.dim);
    this.extension = properties.fileType;
}

//Probably the trickiest part of the whole document - insert images in a way that you can keep full resolution for everything
//Returns true or false depending on success of failure
function tileImages(imageData,doc,simulate = false){

    var currOffset = [0,a4Offset];
    var tallestHeight = 0; //This resets everytime we start moving down instead of right

    for(var i of imageData){

        if(currOffset[0] + i.dim[0] > imageSpace[0]){
            //Check if height is also too small:
            if(currOffset[1] + i.dim[1] + tallestHeight > imageSpace[1]) return false;

            else{
                currOffset[1] += tallestHeight; 
            }
        }
        
        if(i.dim[1] > tallestHeight)
            tallestHeight = i.dim[1];

        if(!simulate)
            doc.addImage(i.data,i.extension,currOffset[0],currOffset[1],i.dim[0],i.dim[1]);
        
        currOffset[0] += i.dim[0];
    }

    return true;
}

//Making an image grid involves dividing the given dimensions by the quantity of images.
function imageGrid(imageData,doc){

    //Everything will be a perfectly sized square
    //Math.ceil appears to be a good way to make a square when items potentially would overflow otherwise...
    var sizePerImage = [
        imageSpace[0] / Math.ceil(Math.sqrt(imageData.length)),
        (imageSpace[1] - a4Offset) / Math.ceil(Math.sqrt(imageData.length))
    ];

    var currOffset = [0,a4Offset];
    for(var i of imageData){
        console.log(currOffset[0],currOffset[0]+sizePerImage[0],imageSpace[0])
        if(currOffset[0] + sizePerImage[0] > imageSpace[0]){
            currOffset[0] = 0;
            currOffset[1] += sizePerImage[1];
        }

        let adjustedBaseSize = sizePerImage[(i.dim[0] < i.dim[1]) * 1] //0 for width, 1 for height
        let newDimensions = measureTools.aspectRatio({width:i.dim[0],height:i.dim[1]},adjustedBaseSize);
        // console.log(newDimensions,adjustedBaseSize);

        doc.addImage(i.data,i.extension,currOffset[0],currOffset[1],newDimensions.width,newDimensions.height);
        currOffset[0]+=sizePerImage[0];
    } 
}

if(typeof module == 'object' && typeof module.exports == 'object') module.exports = makeDocument;