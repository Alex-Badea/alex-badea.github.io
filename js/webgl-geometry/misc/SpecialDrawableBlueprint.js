class SpecialDrawableBlueprint {
	constructor(positions, normals, colors, texInfo, faces) {
		if (name == undefined || positions == undefined || normals == undefined
		|| colors == undefined || texInfo == undefined || faces == undefined)
			throw Error("Undefined or null params");
		if (positions.length == 0)
			throw Error("Nothing to draw");
		if (normals.length != 0 && (positions.length/3 != normals.length/3))
			throw Error("Positions length and normals length must coincide");
		if (colors.length != 0 && (positions.length/3 != colors.length/3))
			throw Error("Positions length and colors length must coincide");
		if (texInfo.image == undefined ^ texInfo.coords.length == 0)
			throw Error("Incomplete texInfo");
		if (texInfo.coords != 0 && (positions.length/3 != texInfo.coords.length/2))
			throw Error("Positions length and texCoords length must coincide");
		this.positions = positions;
		this.normals = normals;
		this.colors = colors;
		this.texInfo = texInfo;
		this.faces = faces;
	}
	
	instantiate(gl, defaultProgramInfo) {
		return new SpecialDrawableInstance(this, gl, defaultProgramInfo);
	}
}
