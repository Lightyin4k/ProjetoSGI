//tamanho
var altura = document.getElementById('canvasContainer').clientWidth
var largura = document.getElementById('canvasContainer').clientWidth

//criar canvas
var meuCanvas = document.getElementById('meuCanvas')
var renderer = new THREE.WebGLRenderer({canvas: meuCanvas})
renderer.setSize(largura, altura)
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 4;
renderer.shadowMap.enabled = true

//abrir cena
var cena = new THREE.Scene()

//fundo
cena.background = new THREE.Color(0xE5E5DA)

//camara
let camara = new THREE.PerspectiveCamera(60, largura/altura, 1, 1000)
camara.position.x = -5
camara.position.y = 8
camara.position.z = 13
camara.lookAt(0,2,0)

//controlos
var controlos = new THREE.OrbitControls(camara, renderer.domElement)

//relogio
var relogio = new THREE.Clock()

//misturador
var misturador = new THREE.AnimationMixer(cena)

var candidatos = []

//loader
var carregador = new THREE.GLTFLoader()
carregador.load(
    'models/TV.gltf',
    function ( gltf ) {
        cena.add( gltf.scene )
        cena.traverse(function(x) {
            if(x.isMesh) {
                x.castShadow = true
                x.receiveShadow = true

                candidatos.push(x)
            }
        })
        //importar ações
        clipeGavetaBaixo = THREE.AnimationClip.findByName( gltf.animations,'AbrirGavetaBaixo')
        acaoGavetaBaixo = misturador.clipAction(clipeGavetaBaixo)
        clipeGavetaCima = THREE.AnimationClip.findByName( gltf.animations,'AbrirGavetaCima')
        acaoGavetaCima = misturador.clipAction(clipeGavetaCima)
        clipePortaEsquerda = THREE.AnimationClip.findByName( gltf.animations,'AbrirPortaEsquerda')
        acaoPortaEsquerda = misturador.clipAction(clipePortaEsquerda)
        clipePortaDireita = THREE.AnimationClip.findByName( gltf.animations,'AbrirPortaDireita')
        acaoPortaDireita = misturador.clipAction(clipePortaDireita)
    }
)

//luzes
addLights()
function addLights(){
    const lightAmb = new THREE.AmbientLight( 0xffffff, 0.5); 
    cena.add( lightAmb );

    const lightDir = new THREE.DirectionalLight( 0xE5E5DA, 1 );
    lightDir.position.set(2,8,10)
    cena.add(lightDir);
}





//angulos
document.getElementById('btn_frente').onclick = function () {
    camara.position.x = 0
    camara.position.y = 3
    camara.position.z = 16
    camara.lookAt(0,0,0)
}

document.getElementById('btn_lado').onclick = function () {
    camara.position.x = 16
    camara.position.y = 4
    camara.position.z = 0
    camara.lookAt(0,0,0)
}

document.getElementById('btn_cima').onclick = function () {
    camara.position.x = 0
    camara.position.y = 16
    camara.position.z = 0
    camara.lookAt(0,0,0)
}



document.getElementById('canvasSide').style.height = document.getElementById('canvasContainer').clientWidth + 'px'

//controlar resize
window.addEventListener("resize", function() {
    if(!getFullscreenElement()) {
        document.getElementById('canvasSide').style.height = document.getElementById('canvasContainer').clientWidth + 'px'
        renderer.setSize(document.getElementById('canvasContainer').clientWidth, document.getElementById('canvasContainer').clientWidth)
    }    
})    




//fullscreen
function getFullscreenElement() {
    return document.fullscreenElement
        || document.webkitFullscreenElement
        || document.mozFullscreenElement
        || document.msFullscreenElement
}

//abrir fullscreen
function openFullscreen() {
    camara.setViewOffset(screen.width, screen.height, 0, 0, screen.width, screen.height)
    document.getElementById("canvasContainer").requestFullscreen()
    renderer.setSize(screen.width, screen.height)
    document.getElementById('btn_fullscreen').innerHTML = '<i class="fa-solid fa-compress"></i>'
}

//fechar fullscreen
function closeFullscreen() {
    camara.setViewOffset(largura, altura, 0, 0, largura, altura)
    document.exitFullscreen()
    renderer.setSize(altura, largura)
    document.getElementById('btn_fullscreen').innerHTML = '<i class="fa-solid fa-expand"></i>'
}

document.getElementById('btn_fullscreen').onclick = function () {toggleFullscreen()};

function toggleFullscreen() {
    if (getFullscreenElement()) {
        closeFullscreen()
    }
    else {
        openFullscreen()
    }
}

//controlar ESC
document.addEventListener('fullscreenchange', function (e) {
	var fullscreenElement = getFullscreenElement()
	
	if (!fullscreenElement && document.getElementById('btn_fullscreen').innerHTML != '<i class="fa-solid fa-expand"></i>') {
        camara.setViewOffset(largura, altura, 0, 0, largura, altura)
        renderer.setSize(altura, largura)
        document.getElementById('btn_fullscreen').innerHTML = '<i class="fa-solid fa-expand"></i>'
	}
})

//raycaster
var raycaster = new THREE.Raycaster()
var rato = new THREE.Vector2()

//alvo atingido
function pegarPrimeiro() {
    raycaster.setFromCamera(rato, camara)

    var intersetados = raycaster.intersectObjects(candidatos)
    if (intersetados.length > 0) {
        //fazer o que houver a fazer com o primeiro interesetado
        switch(intersetados[0].object.name) {
            case 'PortaEsquerda':
            case 'PortaEsquerda_1':
            case 'PortaEsquerda_2':
                acionarPortaEsquerda()
              break;
            case 'PortaDireita':
            case 'PortaDireita_1':
            case 'MaçanetaPortaDir':
                acionarPortaDireita()
              break;
            case 'GavetaCima':
            case 'GavetaCima_1':
            case 'MaçanetaGavetaCima':
                acionarGavetaCima()
              break;
            case 'GavetaBaixo':
            case 'GavetaBaixo_1':
            case 'MaçanetaGavetaBaixo':
                acionarGavetaBaixo()
            break;
        }
    }
}

//movimento do rato
window.ondblclick = function(evento) {
    if(!getFullscreenElement()) {
        rato.x = (evento.clientX / largura) * 2 - 1
        rato.y = -((evento.clientY - document.getElementById('navbar').clientHeight) / altura) * 2 + 1
    }
    else {
        rato.x = (evento.clientX / screen.width) * 2 - 1
        rato.y = -(evento.clientY / screen.height) * 2 + 1
    }
    pegarPrimeiro()
}


//animar a cena
animar()
function animar() {
    //atualizar o misturador
    requestAnimationFrame(animar)
    renderer.render( cena, camara )
    misturador.update(relogio.getDelta())
}


//estado dos objetos
estadoPortaEsquerda = 1
estadoPortaDireita  = 1
estadoGavetaCima    = 1
estadoGavetaBaixo   = 1

//acionar animacoes
function acionarPortaEsquerda() {
    animarObjeto(acaoPortaEsquerda, estadoPortaEsquerda)
    estadoPortaEsquerda = -estadoPortaEsquerda
}

function acionarPortaDireita () {
    animarObjeto(acaoPortaDireita, estadoPortaDireita)
    estadoPortaDireita = -estadoPortaDireita
}

function acionarGavetaCima () {
    animarObjeto(acaoGavetaCima, estadoGavetaCima)
    estadoGavetaCima = -estadoGavetaCima
}

function acionarGavetaBaixo () {
    animarObjeto(acaoGavetaBaixo, estadoGavetaBaixo)
    estadoGavetaBaixo = -estadoGavetaBaixo
}

//animacao
function animarObjeto(objeto, estado) {
    objeto.setLoop(THREE.LoopOnce)
    objeto.clampWhenFinished = true
    objeto.timeScale = estado
    objeto.paused = false
    objeto.play()
}

//mudar fundo
document.getElementById("btn-fundo-claro").onclick = function(){
    cena.background = new THREE.Color(0xE5E5DA)
}

document.getElementById("btn-fundo-escuro").onclick = function(){
    cena.background = new THREE.Color(0x2E2E2E)

}