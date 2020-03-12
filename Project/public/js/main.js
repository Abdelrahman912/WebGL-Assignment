(function () {
    //#region 
    let scene, camera, renderer;
    let leftCube, rightCube;
    let ambientLight, pointLight1, spotLight, directionalLight;
    let lightposition = [7, 7, 7];
    let isDragged = false;
    let draggedObject;
    let grid, axis;
    let leftWall, rightWall, backWall, floor;
    let objects = [];
    let orbitControls, dragControls;
    let car, monster, light, sofa, bed;
    let skyboxGeometry, skybox;
    let effect;
    let animationClips, mixer;
    let mousepos;
    let floorSize = [20, 20];
    let wallHeight = 5;
    let deltaTime = 0;
    let previousTime = 0;


    function init() {
        //1-Scene
        scene = new THREE.Scene();
        //2-Camera
        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

        camera.position.z = 20;
        camera.position.y = 10;
        camera.position.x = 0;
        camera.lookAt(scene.position); //looks at origin

        //3-renderer
        renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        renderer.setClearColor(0xdddddd); //setting color of canvas
        renderer.setSize(window.innerWidth, window.innerHeight); //setting width and height of canvas
        renderer.shadowMap.enabeled = true;
        renderer.shadowMap.type = THREE.BasicShadowMap;
        document.body.appendChild(renderer.domElement); //append canvas tag to html

        //#region Axis and GridHelper
        let mainGridLineColor = 0xffffff;
        let secGridLineColor = 0x00000;
        grid = new THREE.GridHelper(20, 20, mainGridLineColor, secGridLineColor);
        axis = new THREE.AxesHelper(10); //lengthh of axis
        scene.add(grid);
        scene.add(axis);
        //#endregion

        //#region Creating Cubes
        leftCube = new Cube(1, scene, [-2, 0.25, 0], [0.5, 0.5, 0.5], 0x00ff00, true);
        leftCube.create();
        objects.push(leftCube.mesh);
        //right cube
        rightCube = new Cube(2, scene, [2, 0.25, 0], [0.5, 0.5, 0.5], 0xff0000, true);
        rightCube.create();
        objects.push(rightCube.mesh);
        //#endregion 
        //#region Lights


        ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        scene.add(ambientLight);
        //pointLight1 = new THREE.PointLight(0xffffff, 1, 80, 2);
        //pointLight1.position.set(lightposition[0], lightposition[1], lightposition[2]);
        //scene.add(pointLight1);

        //directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        //directionalLight.position.set(lightposition[0], lightposition[1], lightposition[2]);
        //scene.add(directionalLight);

        spotLight = new THREE.SpotLight(0xffffff, 1.2, 50, undefined, 1, 2);
        spotLight.position.set(lightposition[0], lightposition[1], lightposition[2]);
        spotLight.castShadow = true;
        spotLight.shadow.mapSize.width = 0.1; // default
        spotLight.shadow.mapSize.height = 0.1; // default
        spotLight.shadow.camera.near = 0.5; // default
        spotLight.shadow.camera.far = 500; // default
        scene.add(spotLight);
        //#endregion

        //#region Importing model

        car = new Model(scene, "scene.gltf", [0, 0, 4], [0.01, 0.01, 0.01], [-Math.PI / 2, 0, -Math.PI / 10]);
        monster = new Model(scene, "Monster.gltf", [0, 0, -2], [0.1, 0.1, 0.1], [-Math.PI / 2, 0, -Math.PI / 10]);
        light = new Model(scene, "flashLight/scene.gltf", lightposition, [0.008, 0.008, 0.008], [-Math.PI, 0, -1.25 * Math.PI]);
        bed = new Model(scene, "Bed/scene.gltf", [-8, 0.5, 0], [0.02, 0.02, 0.02], [-Math.PI / 2, 0, 0]);
        sofa = new Model(scene, "Sofa/scene.gltf", [8.5, 0.5, -1], [1, 1, 1], [-Math.PI / 2, 0, -0.6 * Math.PI])
        //animatedModel(scene);
        //#endregion
        //#region Skybox
        skyboxGeometry = new THREE.BoxGeometry(1000, 1000, 1000);
        let skyBoxMaterials = [
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load("skybox/right.jpg"),
                side: THREE.DoubleSide
            }),
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load("skybox/left.jpg"),
                side: THREE.DoubleSide
            }),
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load("skybox/top.jpg"),
                side: THREE.DoubleSide
            }),
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load("skybox/bottom.jpg"),
                side: THREE.DoubleSide
            }),
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load("skybox/front.jpg"),
                side: THREE.DoubleSide
            }),
            new THREE.MeshBasicMaterial({
                map: new THREE.TextureLoader().load("skybox/back.jpg"),
                side: THREE.DoubleSide
            }),
        ];
        let skyboxMaterial = new THREE.MeshFaceMaterial(skyBoxMaterials);
        skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
        scene.add(skybox);
        //#endregion
        //#region RoomWalls
        leftWall = new Wall(scene, [-floorSize[0] / 2, 2.5, 0], floorSize[0], wallHeight, [0, Math.PI / 2, 0], 0x0000ff, true);
        leftWall.texture = new THREE.TextureLoader().load("rocks.jpg");
        leftWall.create();
        backWall = new Wall(scene, [0, 2.5, -floorSize[1] / 2], floorSize[0], wallHeight, [0, 0, 0], 0x001f1f);
        backWall.texture = new THREE.TextureLoader().load("rocks.jpg");
        backWall.create();
        rightWall = new Wall(scene, [floorSize[0] / 2, 2.5, 0], floorSize[0], wallHeight, [0, -0.5 * Math.PI, 0], 0x001f1f, true);
        rightWall.texture = new THREE.TextureLoader().load("rocks.jpg");

        rightWall.create();
        floor = new Wall(scene, [0, 0, 0], floorSize[0], floorSize[1], [-0.5 * Math.PI, 0, 0], 0xee927f, true);
        floor.texture = new THREE.TextureLoader().load("porcelain.jpg");
        floor.create();
        //#endregion
        //#region Effects

        effect = new THREE.AnaglyphEffect(renderer, window.innerWidth, window.innerHeight);

        //#endregion
        //#region sound
        // create an AudioListener and add it to the camera
        let listener = new THREE.AudioListener();
        camera.add(listener);

        // create a global audio source
        let sound = new THREE.Audio(listener);

        let audioLoader = new THREE.AudioLoader();
        audioLoader.load('track.mp3', function (buffer) {
            sound.setBuffer(buffer);
            sound.setLoop(true);
            sound.setVolume(0.5);
            sound.play();
        });
        //#endregion
        orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
        dragControls = new THREE.DragControls(objects, camera, renderer.domElement);
        //renderer.render(scene, camera);

        effect.render(scene, camera)

    }

    function update() {

        //lightposition[0] = pointLight1.position.x = 10 * Math.cos(previousTime);
        //lightposition[2] = pointLight1.position.z = 10 * Math.sin(previousTime);
        //lightposition[0] = directionalLight.position.x = 10 * Math.cos(previousTime);
        //lightposition[2] = directionalLight.position.z = 10 * Math.sin(previousTime);
        lightposition[0] = spotLight.position.x = 5 * Math.cos(previousTime);
        lightposition[2] = spotLight.position.z = 5 * Math.sin(previousTime);
        light.setPosition(lightposition);
        console.log(mixer);
        // mixer.update(previousTime);
        //light.setRotation([-Math.PI / 2, lightposition[0], -1.25 * Math.PI]); //to be revisted
        // lightCube.move(lightposition);
        // duck.action.forEach(function (clip) {
        //     duck.mixer.clipAction(clip).play();
        // });
    }

    function loop(time) {
        time = time / 1000;
        deltaTime = time - previousTime;
        previousTime = time;

        requestAnimationFrame(loop);
        update();
        renderer.render(scene, camera);

    }
    init();
    loop(0);

    function animatedModel(scene) {
        let loader = new THREE.GLTFLoader();
        loader.load("fireAnimation/scene.gltf", (gltf) => {
            const model = gltf.scene.children[0];
            console.log(gltf.animations);
            const animation = gltf.animations[0];
            mixer = new THREE.AnimationMixer(model);
            const action = mixer.clipAction(animation);
            action.play();
            scene.add(model);
        });
    }

    // orbitControls.addEventListener("change", (event) => {

    // });
    document.addEventListener("mousedown", () => {
        if (isDragged) {

            orbitControls.enabled = false;
        }
    });
    document.addEventListener("mouseup", () => {
        orbitControls.enabled = true;
    });
    // add event listener to highlight dragged objects
    document.addEventListener("mousemove", (event) => {
        console.log("isdragged");
        if (isDragged) {

            mousepos = getRelativePosition(event);
            console.log(mousepos);
            if (Math.abs(mousepos.x) - 0.25 > floorSize[0] / 2) {

                draggedObject.position.x = (mousepos.x / Math.abs(mousepos.x)) * (floorSize[0] / 2);
            } else {
                draggedObject.position.x = mousepos.x;
            }
            if (Math.abs(mousepos.y) - 0.25 > floorSize[1] / 2) {

                draggedObject.position.z = -(mousepos.y / Math.abs(mousepos.y)) * (floorSize[1] / 2);
            } else {
                draggedObject.position.z = -mousepos.y;
            }
            draggedObject.position.y = 0.25;
            console.log("mousemove");


        }
    });
    dragControls.addEventListener('dragstart', function (event) {
        console.log("drag started");
        isDragged = true;
        draggedObject = event.object;
        let newCube = new Cube(3, scene, event.object.userData.position, event.object.userData.scale, event.object.userData.color, true);
        newCube.create();
        event.object.material.color.setHex(0xaaaaaa);
        objects.push(newCube.mesh);

    });

    dragControls.addEventListener('dragend', function (event) {
        isDragged = false;
        draggedObject = null;
        event.object.material.color.setHex(event.object.userData.color);
        event.object.userData.position = [event.object.position.x, event.object.position.y, event.object.position.z];


    });

    function getRelativePosition(event) {
        event.preventDefault();
        let mouse = {};
        mouse.x = (event.clientX / window.innerWidth) * floorSize[0] * 2 - floorSize[0];
        mouse.y = -(event.clientY / window.innerHeight) * floorSize[1] * 2 + floorSize[1];

        return mouse;
    }

})();

function Model(scene, path, position, scale, rotation) {
    this.path = path;
    this.position = position;
    this.scale = scale;
    this.rotation = rotation;
    this.model = new THREE.Object3D();
    let loader = new THREE.GLTFLoader();

    loader.load((path), (gltf) => {

        this.model = gltf.scene.children[0];
        this.model.position.set(this.position[0], this.position[1], this.position[2]);
        this.model.scale.set(this.scale[0], this.scale[1], this.scale[2]);
        this.model.rotation.set(this.rotation[0], this.rotation[1], this.rotation[2]);

        scene.add(gltf.scene);
    });


    this.setPosition = function (position) {
        // console.log(this.model);
        this.position = position;
        this.model.position.set(this.position[0], this.position[1], this.position[2]);
    };
    this.setScale = function (scale) {
        //console.log(this.model);
        this.scale = scale;
        this.model.scale.set(this.scale[0], this.scale[1], this.scale[2]);
    };
    this.setRotation = function (rotation) {
        this.rotation = rotation;
        this.model.rotation.set(this.rotation[0], this.rotation[1], this.rotation[2]);
    };
}

function Cube(id, scene, position, scale, color, castShadow) {

    this.isSelected = false;
    this.scene = scene;
    this.position = position;
    this.scale = scale;
    this.color = color;
    this.id = id;
    this.color = color;
    this.mesh = null;
    this.select = function () {
        this.isSelected = true;
        this.mesh.material.color.setHex(0x00ff);
    };
    this.unselect = function () {
        this.isSelected = false;
        this.mesh.material.color.setHex(this.color);
    };

    this.create = function () {
        //#region Create Cube
        //1-Create geometery
        //2-Create material
        //3-Bind material with geometery in mesh
        //4-add mesh to scene
        let geometry = new THREE.BoxGeometry(1, 1, 1); //Cube Size
        // var material = new THREE.MeshLambertMaterial({
        //     color: 0x228b22,
        //     map: texture
        // });
        // let cubeMaterials = [
        //     new THREE.MeshBasicMaterial({
        //         map: new THREE.TextureLoader().load("container.jpg"),
        //         side: THREE.DoubleSide
        //     }), // Right
        //     new THREE.MeshBasicMaterial({
        //         map: new THREE.TextureLoader().load("container.jpg"),
        //         side: THREE.DoubleSide
        //     }), //Left
        //     new THREE.MeshBasicMaterial({
        //         map: new THREE.TextureLoader().load("container.jpg"),
        //         side: THREE.DoubleSide
        //     }), //Top
        //     new THREE.MeshBasicMaterial({
        //         map: new THREE.TextureLoader().load("container.jpg"),
        //         side: THREE.DoubleSide
        //     }), //Bottom
        //     new THREE.MeshBasicMaterial({
        //         map: new THREE.TextureLoader().load("container.jpg"),
        //         side: THREE.DoubleSide
        //     }), //front
        //     new THREE.MeshBasicMaterial({
        //         map: new THREE.TextureLoader().load("container.jpg"),
        //         side: THREE.DoubleSide
        //     }) // back
        // ];
        let material = new THREE.MeshPhongMaterial({
            color: this.color,
            //map: new THREE.TextureLoader().load("container.jpg"),
            side: THREE.DoubleSide
        })
        //let material = new THREE.MeshFaceMaterial(cubeMaterials);
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.recieveShadow = true;
        this.mesh.castShadow = castShadow;
        scene.add(this.mesh);
        //#endregion 
        // cube.translateX(trans[0]);
        // cube.translateY(trans[1]);
        // cube.translateZ(trans[2]);
        this.mesh.position.set(this.position[0], this.position[1], this.position[2]);
        this.mesh.rotation.y = Math.PI / 2;
        this.mesh.scale.set(this.scale[0], this.scale[1], this.scale[2]);
        this.mesh.userData = this;
    };
    this.move = function (mousePosition) {
        this.position = mousePosition;
        this.mesh.position.set(this.position[0], this.position[1], this.position[2]);
    };
}

function Wall(scene, position, width, height, rotation, color, recieveShadow) {
    this.scene = scene;
    this.position = position;
    this.width = width;
    this.height = height;
    this.color = color;
    this.rotation = rotation;
    this.mesh = null;
    this.texture = null,
        this.create = function () {
            //#region Create Cube
            //1-Create geometery
            //2-Create material
            //3-Bind material with geometery in mesh
            //4-add mesh to scene
            let geometry = new THREE.PlaneGeometry(this.width, this.height); //plane size
            // var material = new THREE.MeshLambertMaterial({
            //     color: 0x228b22,
            //     map: texture
            // });
            let material = new THREE.MeshPhongMaterial({
                // color: this.color,
                // map: new THREE.TextureLoader().load("container.jpg"),
                map: this.texture,
                side: THREE.DoubleSide
                //wireframe: true
            })
            this.mesh = new THREE.Mesh(geometry, material);
            this.mesh.recieveShadow = recieveShadow;
            this.mesh.frustumCulled = false;
            scene.add(this.mesh);
            //#endregion 
            //this.mesh.translateX(this.position[0]);
            //this.mesh.translateY(this.position[1]);
            //this.mesh.translateZ(this.position[2]);
            //this.mesh.rotation.x = this.rotation[0];
            //this.mesh.rotation.y = this.rotation[1];
            //this.mesh.rotation.z = this.rotation[2];
            this.mesh.rotation.set(this.rotation[0], this.rotation[1], this.rotation[2]);
            this.mesh.position.set(this.position[0], this.position[1], this.position[2]);
            //this.mesh.scale.set(this.scale[0], this.scale[1], this.scale[2]);
            this.mesh.userData = this;
        };
}