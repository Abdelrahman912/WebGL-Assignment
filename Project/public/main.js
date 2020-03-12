(function () {
    //#region 
    let mainGridLineColor = 0xffffff;
    let secGridLineColor = 0x00000;
    let isDragged = false;
    let draggedObject;
    let scene, camera, renderer;
    let grid, axis;
    let leftCube, rightCube, lightCube;
    let leftWall, rightWall, backWall, floor;
    let objects = [];
    let orbitControls, controls;
    let ambientLight, pointLight1, spotLight, directionalLight;
    let lightposition = [5, 5, 5];
    let loader, car, loader2, monster;
    let skyboxGeometry, skybox;
    let effect;
    let animationClips, mixer;
    let mousepos;
    let floorSize = [12, 12];
    //#endregion








    let deltaTime = 0;
    let previousTime = 0;

    function init() {

        //1-Scene
        scene = new THREE.Scene();
        //2-Camera
        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

        camera.position.z = 15;
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
        grid = new THREE.GridHelper(20, 20, mainGridLineColor, secGridLineColor);
        axis = new THREE.AxesHelper(10); //lengthh of axis
        scene.add(grid);
        scene.add(axis);
        //#endregion

        //#region Creating Cubes
        leftCube = new Cube(1, scene, [-2, 0.25, 0], [0.5, 0.5, 0.5], 0xff3300, true);
        leftCube.create();
        objects.push(leftCube.mesh);
        //right cube
        rightCube = new Cube(2, scene, [2, 0.25, 0], [0.5, 0.5, 0.5], 0xff0000, true);
        rightCube.create();

        lightCube = new Cube(3, scene, lightposition, [0.5, 0.5, 0.5], 0xffffff, true);
        lightCube.create();
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
        loader = new THREE.GLTFLoader();
        loader.load("scene.gltf", (gltf) => {
            car = gltf.scene.children[0];
            car.scale.set(0.01, 0.01, 0.01);
            car.position.set(0, 0, 2);
            car.rotation.set(-Math.PI / 2, 0, -Math.PI / 10);
            scene.add(gltf.scene);
            console.log(car);
            console.log(gltf);
        });
        let mesh;
        loader2 = new THREE.GLTFLoader();
        loader2.load("Monster.gltf", (gltf) => {
            mesh = gltf;
            monster = gltf.scene.children[0];
            monster.scale.set(0.1, 0.1, 0.1);
            monster.position.set(0, 0, -2);
            // car.rotation.set(-Math.PI / 2, 0, -Math.PI / 10);
            scene.add(gltf.scene);
            animationClips = gltf.animations; // Array<THREE.AnimationClip> //array of animation clips
            //console.log(animationClips);
            // console.log(monster);
            //gltf.scene; // THREE.Group
            //gltf.scenes; // Array<THREE.Group>
            //gltf.cameras; // Array<THREE.Camera>
            //gltf.asset; // Object

        });


        // console.log("mixer");
        // mixer = new THREE.AnimationMixer(mesh);
        // console.log(mixer);
        // console.log(animationClips);
        // animationClips.forEach(function (clip) {
        //     mixer.clipAction(clip).play();
        // });
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
        leftWall = new Wall(scene, [-6, 2.5, 0], 12, 5, [0, Math.PI / 2, 0], 0x0000ff, true);
        leftWall.texture = new THREE.TextureLoader().load("rocks.jpg");
        leftWall.create();
        backWall = new Wall(scene, [0, 2.5, -6], 12, 5, [0, 0, 0], 0x001f1f);
        backWall.texture = new THREE.TextureLoader().load("rocks.jpg");
        backWall.create();
        rightWall = new Wall(scene, [6, 2.5, 0], 12, 5, [0, -0.5 * Math.PI, 0], 0x001f1f, true);
        rightWall.texture = new THREE.TextureLoader().load("rocks.jpg");

        rightWall.create();
        floor = new Wall(scene, [0, 0, 0], floorSize[0], floorSize[1], [-0.5 * Math.PI, 0, 0], 0xee927f, true);
        floor.texture = new THREE.TextureLoader().load("porcelain.jpg");
        floor.create();
        //#endregion
        //#region Effects
        //#region sound
        // create an AudioListener and add it to the camera
        var listener = new THREE.AudioListener();
        camera.add(listener);

        // create a global audio source
        var sound = new THREE.Audio(listener);

        var audioLoader = new THREE.AudioLoader();
        audioLoader.load('track.mp3', function (buffer) {
            sound.setBuffer(buffer);
            sound.setLoop(true);
            sound.setVolume(0.01);
            sound.play();
        });
        //#endregion
        effect = new THREE.AnaglyphEffect(renderer, window.innerWidth, window.innerHeight);

        //#endregion

        //orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
        controls = new THREE.DragControls(objects, camera, renderer.domElement);
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

        lightCube.move(lightposition);

    }

    function loop(time) {
        time = time / 1000;
        deltaTime = time - previousTime;
        previousTime = time;

        // cube.rotation.y += deltaTime;
        // cube.rotation.x += deltaTime * 2;
        requestAnimationFrame(loop);
        update();
        effect.render(scene, camera);

        // renderer.render(scene, camera);
        //console.log(isDragged);

    }
    init();
    loop(0);
    let render = function () {
        if (!isDragged) {
            renderer.render(scene, camera);
            orbitControls.dispose();
        } else {
            return;
        }
    }
    // orbitControls.addEventListener("change", render);

    // add event listener to highlight dragged objects
    document.addEventListener("mousemove", (event) => {
        if (isDragged) {

            mousepos = getRelativePosition(event);
            console.log(mousepos);
            if (Math.abs(mousepos.x) > floorSize[0] / 2) {

                draggedObject.position.x = (mousepos.x / Math.abs(mousepos.x)) * (floorSize[0] / 2);
            } else {
                draggedObject.position.x = mousepos.x;
            }
            if (Math.abs(mousepos.y) > floorSize[1] / 2) {

                draggedObject.position.z = -(mousepos.y / Math.abs(mousepos.y)) * (floorSize[1] / 2);
            } else {
                draggedObject.position.z = -mousepos.y;
            }
            draggedObject.position.y = 0.25;
            console.log("mousemove");


        }
    });
    controls.addEventListener('dragstart', function (event) {

        isDragged = true;
        draggedObject = event.object;
        let newCube = new Cube(3, scene, event.object.userData.position, event.object.userData.scale, event.object.userData.color, true);
        newCube.create();
        event.object.material.color.setHex(0xaaaaaa);
        console.log(newCube);
        objects.push(newCube.mesh);
        console.log("dragstart");
        console.log(event.object.userData.position);
        console.log(controls.getObjects());
        console.log(event.object);
    });

    controls.addEventListener('dragend', function (event) {
        isDragged = false;
        draggedObject = null;
        event.object.material.color.setHex(event.object.userData.color);
        event.object.userData.position = [event.object.position.x, event.object.position.y, event.object.position.z];
        console.log("dragend");
        console.log(event.object);

    });

    function getRelativePosition(event) {
        event.preventDefault();
        let mouse = {};
        mouse.x = (event.clientX / window.innerWidth) * floorSize[0] * 2 - floorSize[0];
        mouse.y = -(event.clientY / window.innerHeight) * floorSize[1] * 2 + floorSize[1];

        return mouse;
    }

})();

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