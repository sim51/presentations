var codes = [];
var elements = document.getElementsByTagName("textarea");
for( var i=0; i< elements.length; i++) {
    var element = elements[i];
    if ( element.getAttribute("class") ){
      var mode = element.getAttribute("class").split(" ")[0];
      codes.push(CodeMirror.fromTextArea(element, { 'readonly':true, 'mode':mode, 'theme':'neo', 'lineNumbers':true, 'lineWrapping':true, height:'auto'}));
    }
}
    
Reveal.addEventListener( 'slidechanged', function( event ) {
    codes.forEach(function(ele) {
      ele.refresh();
    });
} );
 
