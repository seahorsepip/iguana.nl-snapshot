/* jseyes.js


The classic Xeyes in JavaScript
(c) PROPIX Ltd,  Written by Pintér Gábor
Székesfehérvár, Kriványi u. 15.
H-8000, HUNGARY
Tel: +36 30 3489752
Fax: +36 22 304326
Email: propix@freemail.hu
Web: http://www.propix.hu

Revisions:
  V1.0  10/14/2001  Original release

Usage:
  1. Include this file from the head of your page
  2. Define parameters or accept the defaults
  3. Insert the image

This script requires Internet Explorer 5+ or Nescape Navigator 6+! In other browsers it does nothing.



1. Include jseyes.js from the head of your page
Insert the following line into the head of your page:
  <script src="jseyes.js"></script>


2. Define parameters
You can accept the defaults or assign new values to these variables:

jseyesimg="jseyes.gif"
  The main image. Please do not edit.

jseyeimg="jseyeblue.gif"
  The image of the eye. Must be a 21x29 solid ellipse with transparent background.


4. Insert the image
Call jseyes() where you want to see the image:
  <script>
    jseyes();
  </script>

Or call jseyes(x, y) to show the image at absolute position:
  <script>
    jseyes(100,100);
  </script>



Example: http://www.propix.hu/www/jseyes/jseyes.html

*/




// Defaults
var jseyesimg="jseyes.gif";
var jseyeimg="jseyeblue.gif";
var jseyeslink="http://www.wsabstract.com";


// Internal
var jseyeso=null, jseye1=null, jseye2=null;


// Browser detection

// Global variables
var browserversion=0.0;
var browsertype=0; // 0: unknown; 1:MSIE; 2:NN

// Return true if MSIE or NN detected
function browserdetect() {
  var agt= navigator.userAgent.toLowerCase();
  var appVer= navigator.appVersion.toLowerCase();
  browserversion= parseFloat(appVer);
  var iePos= appVer.indexOf('msie');
  if (iePos!=-1) browserversion= parseFloat(appVer.substring(iePos+5, appVer.indexOf(';',iePos)));
  var nav6Pos = agt.indexOf('netscape6');
  if (nav6Pos!=-1) browserversion= parseFloat(agt.substring(nav6Pos+10))
  browsertype= (iePos!=-1) ? 1 : (agt.indexOf('mozilla')!=-1) ? 2 : 0;
  return(browsertype>0);
}

browserdetect();



// General utils

// Find object by name or id
function jseyesobj(id) {
  var i, x;
  x= document[id];
  if (!x && document.all) x= document.all[id];
  for (i=0; !x && i<document.forms.length; i++) x= document.forms[i][id];
  if (!x && document.getElementById) x= document.getElementById(id);
  return(x);
}


// Move eyes
function jseyesmove(x, y) {
  var ex, ey, dx, dy;
  if (jseyeso && jseye1 && jseye2 && jseyeso.style) {
    ex=jseyeso.offsetLeft+46; ey=jseyeso.offsetTop+58;
    dx=x-ex; dy=y-ey;
    r=(dx*dx/49+dy*dy/289<1) ? 1 : Math.sqrt(49*289/(dx*dx*289+dy*dy*49));
    jseye1.style.left= r*dx+36.5; jseye1.style.top= r*dy+44;
    ex+=56; dx-=56;
    r=(dx*dx/49+dy*dy/289<1) ? 1 : Math.sqrt(49*289/(dx*dx*289+dy*dy*49));
    jseye2.style.left= r*dx+92.5; jseye2.style.top= r*dy+44;
  }
}



// Main
function jseyes() {
  var img;
  var x, y, a=false;

  if (arguments.length==2) {
    x= arguments[0];
    y= arguments[1];
    a= true;
  }

  if (browsertype>0 && browserversion>=5) {
    img= "<div id='jseyeslayer' style='position:"+
           (a ? "absolute; left:"+x+"; top:"+y : "relative")+
           "; z-index:5; width:150; height:150 overflow:hidden'>"+
	     "<div id='jseye1' style='position:absolute; left:36; top:44; z-index:6; width:21; height:29'>"+
	       "<img src='"+jseyeimg+"' width=21 height=29 onClick=\"location.href='"+jseyeslink+"'\">"+
	     "</div>"+
	     "<div id='jseye2' style='position:absolute; left:92; top:44; z-index:6; width:21; height:29'>"+
	       "<img src='"+jseyeimg+"' width=21 height=29 onClick=\"location.href='"+jseyeslink+"'\">"+
	     "</div>"+
	     "<img src='"+jseyesimg+"' width=150 height=150 onClick=\"location.href='"+jseyeslink+"'\">"+
	 "</div>";
    document.write(img);
    jseyeso=jseyesobj('jseyeslayer');
    jseye1=jseyesobj('jseye1');
    jseye2=jseyesobj('jseye2');

    switch (browsertype) {
      case 1:
        document.onmousemove=jseyesmousemoveIE;
	break;
      case 2:
        document.captureEvents(Event.MOUSEMOVE);
	document.onmousemove=jseyesmousemoveNS;
	break;
    }
  }
}


// Mouse move events
function jseyesmousemoveNS(e) {
  jseyesmove(e.pageX, e.pageY);
  //return(false);
}
function jseyesmousemoveIE() {
  jseyesmove(event.clientX+document.body.scrollLeft, event.clientY+document.body.scrollTop);
  //return(false);
}
