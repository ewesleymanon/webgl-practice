import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.114/build/three.module.js';

// シェーダーの作成

const vertexSrc = `
precision mediump float;

attribute vec4 position;
attribute vec2 uv;

varying vec2 vUv;

void main() {
	gl_Position = position;
	vUv = vec2( (position.x + 1.)/2., (-position.y + 1.)/2.);
}
`

const fragmentSrc = `
precision mediump float;

uniform float uTrans;
uniform sampler2D uTexture0;
uniform sampler2D uTexture1;
uniform sampler2D uDisp;

varying vec2 vUv;

float quarticInOut(float t) {
  return t < 0.5
    ? +8.0 * pow(t, 4.0)
    : -8.0 * pow(t - 1.0, 4.0) + 1.0;
}

void main() {
	// https://www.khronos.org/registry/OpenGL-Refpages/gl4/html/gl_FragCoord.xhtml
	
	vec4 disp = texture2D(uDisp, vec2(0., 0.5) + (vUv - vec2(0., 0.5)) * (0.2 + 0.8 * (1.0 - uTrans)) );
	float trans = clamp(1.6  * uTrans - disp.r * 0.4 - vUv.x * 0.2, 0.0, 1.0);
	trans = quarticInOut(trans);
	vec4 color0 = texture2D(uTexture0, vec2(0.5 - 0.3 * trans, 0.5) + (vUv - vec2(0.5)) * (1.0 - 0.2 * trans));
	vec4 color1 = texture2D(uTexture1, vec2(0.5 + sin( (1. - trans) * 0.1), 0.5 ) + (vUv - vec2(0.5)) * (0.9 + 0.1 * trans));


	gl_FragColor = mix(color0, color1 , trans);
}
`;
document.addEventListener('DOMContentLoaded', function() {
	//the event occurred
	// Image URL used for demo
	const assetUrls = [
		'https://images.unsplash.com/photo-1541430153849-b0263e560c83?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1047&q=80',
		'https://images.unsplash.com/photo-1502101872923-d48509bff386?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1189&q=80',
		'https://images.unsplash.com/photo-1476989142744-32553061aca5?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80'
	];

	/**
	** Initialization start
	*/

	// Renderer initialization
	let renderer = new THREE.WebGLRenderer();

	let canvas = renderer.domElement;

	let gradationContainer = document.querySelector('.js-gradation');
	renderer.setSize(window.innerWidth, window.innerHeight);
	gradationContainer.appendChild(renderer.domElement);

	let scene = new THREE.Scene();

	let obj = {trans: 0}
	var cnt = 0;

	let textureArr = [];

	// Camera initialization
	let camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 1, 1000  );
	camera.position.z = 1;
	// camera.fov = Math.atan(window.innerHeight / 2 / camera.position.z) * 2 * THREE.Math.RAD2DEG;
	// camera.aspect = window.innerWidth / window.innerHeight;


	// Texture initialization
	assetUrls.forEach( (url, index) =>{
		let img = new Image();
		
		let texture = new THREE.Texture();
		texture.flipY= false;
		textureArr.push(texture);
		
		img.onload = function(_index, _img){
			let texture = textureArr[_index];
			texture.image = _img;
			texture.needsUpdate = true;
			
			cnt++;
			if(cnt == 3) start();
		}.bind(this, index, img);
		
		img.crossOrigin = "Anonymous";
		img.src = url;
	})

	let mat = new THREE.RawShaderMaterial( {
		uniforms: {
			uTrans: { value: obj.trans },
			uTexture0: {value: textureArr[0]},
			uTexture1: {value: textureArr[1]},
			uDisp: {value: textureArr[2]},
		},
		vertexShader: vertexSrc,
		fragmentShader: fragmentSrc
	} );

	let geo = new THREE.PlaneGeometry(2, 2);
	let mesh = new THREE.Mesh(geo, mat)
	scene.add(mesh);

	resize();

	function start(){
		loop();
	}

	function loop(){
		mat.uniforms.uTrans.value = obj.trans;
		renderer.render(scene, camera);
		
		requestAnimationFrame(loop);
	}

	function resize(){
		// let size = Math.min(window.innerWidth, window.innerHeight) * 0.8;
		// if(size > 450)  size = 450;
		// renderer.setSize(size, size);
		camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
	}

	window.addEventListener("resize", function() {
			resize();
	});

	canvas.addEventListener('mouseenter', function(){
		TweenMax.killTweensOf(obj);
		TweenMax.to(obj, 1.5, {trans: 1});
	});

	canvas.addEventListener('mouseleave', function(){
		TweenMax.killTweensOf(obj);
		TweenMax.to(obj, 1.5, {trans: 0});
	});

	// TweenMax.killTweensOf(obj);
	// TweenMax.to(obj, 1.5, {trans: 1});
	// console.log('dsd');
})


