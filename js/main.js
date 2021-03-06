var elements = document.getElementsByTagName('script')

Array.prototype.forEach.call(elements, function(element) {
  if (element.type.indexOf('math/tex') != -1) {
     // Extract math markdown
     var textToRender = element.innerText || element.textContent;

     // Create span for KaTeX
     var katexElement = document.createElement('span');

     // Support inline and display math
     if (element.type.indexOf('mode=display') != -1){
       katexElement.className += "math-display";
       textToRender = '\\displaystyle {' + textToRender + '}';
     } else {
       katexElement.className += "math-inline";
     }

     katex.render(textToRender, katexElement);
     element.parentNode.insertBefore(katexElement, element);
  }
});

window.onload = () => {
	const canvas = document.getElementById("glCanvas");
  	const gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
  	if (!gl) throw Error("Unable to initialize WebGL. Your browser or machine may not support it.");
	
  	const scene = new Scene(gl, {unlockRoll: false});
	const world = new CoordSystem("", [vec3.fromValues(1,0,0), vec3.fromValues(0,1,0), vec3.fromValues(0,0,1)], mat4.create());
	scene.insert(world);
	scene.render();
	
	w = new Worker('js/worker_parseply.js');
  	w.onmessage = e => {
    		world.add(new SpecialDrawableBlueprint(e.data.positions, e.data.normals, e.data.colors, e.data.texInfo, e.data.faces));
      		scene.redraw();
  	}
}
