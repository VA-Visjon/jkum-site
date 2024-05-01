import * as THREE from 'three'

export class PencilLinesMaterial extends THREE.ShaderMaterial {
	constructor() {
		super({
			uniforms: {
				// we'll keep the naming convention here since the CopyShader
				// also used a tDiffuse texture for the currently rendered scene.
				tDiffuse: { value: null },
				uNormals: { value: null },
				// we'll pass in the canvas size here later
				uResolution: {
					value: new THREE.Vector2(1, 1)
				}
			},
			fragmentShader: document.getElementById("fragmentshader").textContent,
			vertexShader: document.getElementById("vertexshader").textContent
		})
	}
}