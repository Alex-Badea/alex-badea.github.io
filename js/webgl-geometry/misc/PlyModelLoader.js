class PlyModelLoader {
	constructor(...varargs) {
		let plyInputUrl;
		let texInputId;
		let onLoad;
		if (arguments.length == 2) {
			plyInputUrl = arguments[0];
			onLoad = arguments[1];
		} else {
			plyInputUrl = arguments[0];
			texInputId = arguments[1];
			onLoad = arguments[2];
		}

		const req = new XMLHttpRequest();
		req.open("GET", plyInputUrl);
		req.onload = e => {
			const [header, content] = e.target.response.split("end_header").map(e => e.trim());
			const headerLineTokens = header.split(/\r\n|\n\r|\n/);

			const elements = headerLineTokens.filter(e => e.split(/[ ]+/)[0] === "element");
			const verticesNo = parseInt(elements.find(e => e.split(/[ ]+/).includes("vertex")).split(/[ ]+/)[2]);
			const facesNo = parseInt((elements.find(e => e.split(/[ ]+/).includes("face")) || "").split(/[ ]+/)[2]);

			const properties = headerLineTokens.filter(e => e.split(/[ ]+/).includes("property")).map(e => e.split(/[ ]+/)[e.split(/[ ]+/).length-1]);
			if (!properties.includes("x") || !properties.includes("y") || !properties.includes("z")) {
				throw Error("Vertex positions not found");
			}

			let indexTable = [];
			indexTable.push(properties.indexOf("x"));
			indexTable.push(properties.indexOf("y"));
			indexTable.push(properties.indexOf("z"));
			indexTable.push(properties.indexOf("nx"));
			indexTable.push(properties.indexOf("ny"));
			indexTable.push(properties.indexOf("nz"));
			indexTable.push(properties.indexOf("red")); 
			indexTable.push(properties.indexOf("green"));
			indexTable.push(properties.indexOf("blue"));
			indexTable.push(properties.indexOf("texture_u"));
			indexTable.push(properties.indexOf("texture_v"));

			const contentLineTokens = content.split("\n");
			const hasNormals = indexTable[3] > 0;
			const hasColors = indexTable[6] > 0;
			const hasTexCoords = indexTable[9] > 0;
			if (hasTexCoords ^ !!texInputId) {
				throw Error("Incomplete texture info"); 
			}
			const hasFaces = !isNaN(facesNo);

			let positions = new Float32Array(3*verticesNo);
			let normals = new Float32Array(3*verticesNo);
			let colors = new Float32Array(3*verticesNo);
			let texCoords = new Float32Array(2*verticesNo);
			for (let i = 0; i < verticesNo; i++) {
				positions[3*i] = parseFloat(contentLineTokens[i].trim().split(/[ ]+/)[indexTable[0]]);
				positions[3*i+1] = parseFloat(contentLineTokens[i].trim().split(/[ ]+/)[indexTable[1]]);
				positions[3*i+2] = parseFloat(contentLineTokens[i].trim().split(/[ ]+/)[indexTable[2]]);
				if (hasNormals) {
					normals[3*i] = parseFloat(contentLineTokens[i].trim().split(/[ ]+/)[indexTable[3]]);
					normals[3*i+1] = parseFloat(contentLineTokens[i].trim().split(/[ ]+/)[indexTable[4]]);
					normals[3*i+2] = parseFloat(contentLineTokens[i].trim().split(/[ ]+/)[indexTable[5]]);
				}
				if (hasColors) {
					colors[3*i] = parseFloat(contentLineTokens[i].trim().split(/[ ]+/)[indexTable[6]])/255.0;
					colors[3*i+1] = parseFloat(contentLineTokens[i].trim().split(/[ ]+/)[indexTable[7]])/255.0;
					colors[3*i+2] = parseFloat(contentLineTokens[i].trim().split(/[ ]+/)[indexTable[8]])/255.0;
				}
				if (hasTexCoords) {
					texCoords[2*i] = parseFloat(contentLineTokens[i].trim().split(/[ ]+/)[indexTable[9]]);
					texCoords[2*i+1] = parseFloat(contentLineTokens[i].trim().split(/[ ]+/)[indexTable[10]]);
				}
			}
			let faces = new Uint32Array(facesNo*3);
			for (let i = 0; i < facesNo; i++) {
				if (parseInt(contentLineTokens[i+verticesNo].split(/[ ]+/)[0]) !== 3) {
					throw Error("Non-triangulated faces not supported");
				}
				if (hasFaces) {
					faces[3*i] = parseInt(contentLineTokens[i+verticesNo].split(/[ ]+/)[1]);
					faces[3*i+1] = parseInt(contentLineTokens[i+verticesNo].split(/[ ]+/)[2]);
					faces[3*i+2] = parseInt(contentLineTokens[i+verticesNo].split(/[ ]+/)[3]);
				}
			}

			if (texInputId) {
				const texInput = document.getElementById(texInputId);
				const fr = new FileReader();
				fr.onload = e => {
					const texImg = new Image();
					texImg.onload = () => {
						onLoad({positions, normals, colors, texInfo:{image:texImg, coords:texCoords}, faces});
					}
					texImg.src = e.target.result;
				}
				texInput.onchange = () => fr.readAsDataURL(texInput.files[0])
			} else {
				onLoad({positions, normals, colors, texInfo:{image:null, coords:[]}, faces});
			}
		};
		req.send();
	}
}
