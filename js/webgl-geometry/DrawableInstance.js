class DrawableInstance {
	constructor(drawable, gl, programInfo) {
		if (new.target === DrawableInstance)
			throw new TypeError("Cannot instantiate abstract class");
		if (drawable == undefined || gl == undefined || programInfo == undefined)
			throw new Error("Undefined or null params");
		this.drawable = drawable;
		this.gl = gl;
		this.programInfo = programInfo;
		this.buffers = {
			position: gl.createBuffer(),
			color: gl.createBuffer()
 		};
		
		this._INIT_NAME();
	}
	
	draw() {
		if (this.gl.getUniform(this.programInfo.program, this.programInfo.uniformLocations.modelMatrix, 0).every((e, i) => mat4.fromValues(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0)[i] === e))
			throw new Error("Stray drawable not bound to any drawing context (coordinate system): " + this.name);
		
		this._DRAW_NAME();
	}
	
	getNamePos() {
		throw new Error("Cannot call abstract method");
	}
	
	// Depreciat: va fi �nocuit� c�nd se va g�si o metod� mai bun�
	_INIT_NAME() {
		if (this.drawable.name !== "" && this.drawable.name !== "NO_NAME") {
			this.nameContainer = document.createElement("div");
			this.nameContainer.innerHTML = this.drawable.name;
			this.nameContainer.setAttribute("style", "position: absolute;-webkit-touch-callout: none;-webkit-user-select: none;-khtml-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;font-size: 16px;pointer-events: none;text-shadow: -1px -1px 1px white, -1px 1px 1px white, 1px 1px 1px white, 1px -1px 1px white;");
			document.body.appendChild(this.nameContainer);
		}
	}
	
	// Depreciat: va fi �nocuit� c�nd se va g�si o metod� mai bun�
	_DRAW_NAME() {
		if (this.nameContainer != undefined) {
			const projectionMatrix = this.gl.getUniform(this.programInfo.program, this.programInfo.uniformLocations.projectionMatrix, 0);
			const viewMatrix = this.gl.getUniform(this.programInfo.program, this.programInfo.uniformLocations.viewMatrix, 0);
			const modelMatrix = this.gl.getUniform(this.programInfo.program, this.programInfo.uniformLocations.modelMatrix, 0);
					
			const namePos = vec4.fromValues(...this.getNamePos(), 1);
			const mvp = mat4.multiply(mat4.create(), mat4.multiply(mat4.create(), projectionMatrix, viewMatrix), modelMatrix);
			const nameMvpPos = vec4.transformMat4(vec4.create(), namePos, mvp);
			const nameNormScrPos = [nameMvpPos[0]/nameMvpPos[3], nameMvpPos[1]/nameMvpPos[3]];
			const nameScrPos = [(nameNormScrPos[0]*0.5+0.5)*this.gl.canvas.width-this.gl.canvas.getBoundingClientRect().left,
								(nameNormScrPos[1]*-0.5+0.5)*this.gl.canvas.height-this.gl.canvas.getBoundingClientRect().top];

			const bound = this.gl.canvas.getBoundingClientRect();
			if (nameScrPos[0] > 0 && nameScrPos[0] < this.gl.canvas.width && nameScrPos[1] > 0 && nameScrPos[1] < this.gl.canvas.height && nameMvpPos[2] > 0) {
				this.nameContainer.style.left = nameScrPos[0] + bound.x;
				this.nameContainer.style.top = nameScrPos[1] + bound.y;
				this.nameContainer.style.display = "inline";
			} else
				this.nameContainer.style.display = "none";
		}
	}

	erase() {
		if (this.nameContainer)
			document.body.removeChild(this.nameContainer);
	}
}