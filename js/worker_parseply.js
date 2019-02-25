importScripts('js/webgl-geometry/misc/PlyModelLoader.js');
const meshLoader = new PlyModelLoader("https://raw.githubusercontent.com/Alex-Badea/alex-badea.github.io/master/js/mesh.ply", result => {
	postMessage({positions: result.positions, normals: [], colors: result.colors, texInfo: result.texInfo, faces: result.faces});
});
