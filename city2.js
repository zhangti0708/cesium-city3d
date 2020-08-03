/**
 * 配置
 */
var configs = {

    d3map: null,

    mapDom: "cesiumContainer",

    mapUrl: "examples/images/BlackMarble_2016.jpg",

    mapOptions: {
        shouldAnimate: true,
        useDefaultRenderLoop: true,
        infoBox: false,
        contextOptions: {
            webgl: {
                alpha: false,
                antialias: true,
                preserveDrawingBuffer: true,
                failIfMajorPerformanceCaveat: false,
                depth: true,
                stencil: false,
                anialias: false
            },
        }
    },
    cbd1: 'http://www.supermapol.com/realspace/services/3D-WebGLCBD/rest/realspace/datas/Tree@%E6%96%B0CBD/config',//CBD 树SCP
    cbd2: 'http://www.supermapol.com/realspace/services/3D-WebGLCBD/rest/realspace/datas/Ground_1@%E6%96%B0CBD/config',//CBD 地面1 SCP
    cbd3: 'http://www.supermapol.com/realspace/services/3D-WebGLCBD/rest/realspace/datas/Ground_2@%E6%96%B0CBD/config',//CBD 地面2 SCP
    cbd4: 'http://www.supermapol.com/realspace/services/3D-WebGLCBD/rest/realspace/datas/Building@%E6%96%B0CBD/config',//CBD 建筑物 SCP

    sceneUrl: "http://www.supermapol.com/realspace/services/3D-CQmodel_wireframe_2000/rest/realspace"
}
/**
 * 返回的 Cesium对象
 * @param {*} Cesium 
 */
function onloadApp() {

    try {

        //初始化三维球
        var d3map = new D3()

        d3map.init(); d3map.initGUI()

        document.getElementsByClassName('cesium-widget-credits')[0].style.display = 'none'

    } catch (error) {

        console.log(error)
    }
    configs.d3map = d3map
};

/**
 * 三维对象
 */
function D3() {

    this._viewer = undefined

    this._scene = undefined

    this._layer = undefined

    this._sceneData = undefined

    this._mapData = undefined

    this.postProcess = [] //后期处理

    this.primitives = [] // primitive图元

    this.Lights = [] //光源
    /**
     * 警情模拟状态
     */
    this._state = undefined

    this._STATECODE = {
        zero: 0,
        one: 1,
        tow: 2,
        three: 3,
        all: 'all'
    }

    this._util = undefined
    // 导入插件
    if (layui && layui.layer) {

        this._layers = layui.layer
    }
    //初始化状态
    this._state = this._STATECODE.zero
}

/**
 * 初始化
 */
D3.prototype.init = function (opt = {}) {

    if (configs.mapDom && configs.mapUrl) {

        Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYTQ2ZjdjNS1jM2E0LTQ1M2EtOWM0My1mODMzNzY3YjYzY2YiLCJpZCI6MjkzMjcsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1OTE5NDIzNjB9.RzKlVTVDTQ9r7cqCo-PDydgUh8Frgw0Erul_BVxiS9c';

        this._viewer = new Cesium.Viewer(configs.mapDom, configs.mapOptions);

        this._util = new Cesium.Utils(this._viewer)

        this._viewer.imageryLayers.addImageryProvider(new Cesium.BingMapsImageryProvider({
            url: 'https://dev.virtualearth.net',
            mapStyle: Cesium.BingMapsStyle.AERIAL,
            key: URL_CONFIG.BING_MAP_KEY
        }))

        this._scene = this._viewer.scene

        this._scene.skyBox = this._util.setOneGroundSkyBox()

        // this._util.setSnowEffect()

        this.config(opt) //默认开始配置

        this.loadScene() //加载场景

        // this.addThreeObject() //加载three obj
    } else {

        alert("请配置地图参数")
    }

}

/**
 * 场景配置
 * 
 * @param opt
 */
D3.prototype.config = function (opt) {

    if (this._scene) {

        //设置第二重烘焙纹理的效果（明暗程度）
        this._scene.shadowMap.darkness = 1.275;

        //设置环境光
        this._scene.lightSource.ambientLightColor = opt.ambientLightColor || new Cesium.Color(0.7, 0.7, 0.7, 1);

        //深度检测
        this._scene.globe.depthTestAgainstTerrain = true;

        //地面调节
        //this._scene.globe.baseColor = Cesium.Color.BLACK;
        this._scene.globe.globeAlpha = 0.5;
        this._scene.undergroundMode = true;
        this._scene.terrainProvider.isCreateSkirt = false;

        //调节场景环境
        this._scene.sun.show = false;
        this._scene.moon.show = false;
        // this._scene.skyBox.show = false;
        this._scene.skyAtmosphere.show = false;
        this._scene.fxaa = true;

        //开启颜色校正
        this._scene.colorCorrection.show = opt.colorCorrection || false;
        this._scene.colorCorrection.saturation = opt.saturation || 3.1;
        this._scene.colorCorrection.brightness = opt.brightness || 1.8;
        this._scene.colorCorrection.contrast = opt.contrast || 1.2;
        this._scene.colorCorrection.hue = opt.hue || 0;

        //开启泛光和HDR
        this._scene.bloomEffect.show = opt.bloomEffect || false;
        this._scene.hdrEnabled = opt.hdrEnabled || true;
        this._scene.bloomEffect.threshold = 1;
        this._scene.bloomEffect.bloomIntensity = 2;

        //最大距离
        this._scene.screenSpaceCameraController.maximumZoomDistance = 5000.0
    }
}

D3.prototype.loadCameraPath = function (callback) {

    this._util.setView({

        position: { x: -2180840.640119748, y: 4381647.215317032, z: 4091216.503229185 },
        orientation: {
            heading: Cesium.Math.toRadians(356.76499726379865),
            pitch: Cesium.Math.toRadians(-22.735599006353922),
            roll: Cesium.Math.toRadians(0.00133659048757427)
        }
    });

    setTimeout(() => {
        this._util.flyTo({
            position: { x: -2178897.313757382, y: 4381397.305312672, z: 4091462.297319925 },
            orientation: {
                heading: Cesium.Math.toRadians(46.527000640600505),
                pitch: Cesium.Math.toRadians(-5.17091508581087),
                roll: Cesium.Math.toRadians(1.90833280887811)
            },
            duration: 5,
            callback: () => {
                this._util.flyTo({
                    position: { x: -2178132.972253719, y: 4380734.091723098, z: 4093209.132147421 },
                    orientation: {
                        heading: Cesium.Math.toRadians(105.62030224024655),
                        pitch: Cesium.Math.toRadians(-21.59096416111003),
                        roll: Cesium.Math.toRadians(359.9987311314987)
                    },
                    duration: 5,
                    callback: () => {
                        this._util.flyTo({
                            position: { x: -2179780.958069727, y: 4379145.05670711, z: 4093251.679035389 },
                            orientation: {
                                heading: Cesium.Math.toRadians(202.12146484437022),
                                pitch: Cesium.Math.toRadians(-4.367558356924628),
                                roll: Cesium.Math.toRadians(0.0006130606451948047)
                            },
                            duration: 5,
                            callback: () => {
                                this._util.flyTo({
                                    position: { x: -2182832.9113919945, y: 4380248.782123272, z: 4093233.182007854 },
                                    orientation: {
                                        heading: Cesium.Math.toRadians(282.56605551019436),
                                        pitch: Cesium.Math.toRadians(-38.5875540173017),
                                        roll: Cesium.Math.toRadians(359.99999999993923)
                                    },
                                    duration: 5,
                                    callback: callback
                                })
                            }
                        })
                    }
                })
            }
        })
    }, 2000)

}

D3.prototype.loadScene = function () {
    /**
     * 热力图
     */
    this._util._initHeatMaps()
    /**
     * 建筑
     */
    var groundPromise = this._viewer.scene.addS3MTilesLayerByScp(configs.cbd1, {
        name: 'ground'
    }),
        buildPromise = this._viewer.scene.addS3MTilesLayerByScp(configs.cbd2, {
            name: 'build'
        }),
        lakePromise = this._viewer.scene.addS3MTilesLayerByScp(configs.cbd3, {
            name: 'lake'
        }),
        treePromise = this._viewer.scene.addS3MTilesLayerByScp(configs.cbd4, {
            name: 'tree'
        });
    Cesium.when.all([groundPromise, buildPromise, lakePromise, treePromise], (layers) => {

        this._layerGroup = layers

        this._util.setDirectionalLight(
            new Cesium.Cartesian3.fromDegrees(116.261209157595, 39.3042238956531, 480),
            {
                targetPosition: new Cesium.Cartesian3.fromDegrees(116.261209157595, 39.3042238956531, 430),
                color: new Cesium.Color(1.0, 1.0, 1.0, 1),
                intensity: 0.55
            }
        )


        this._util.setView({

            position: { x: -2180840.640119748, y: 4381647.215317032, z: 4091216.503229185 },
            orientation: {
                heading: Cesium.Math.toRadians(356.76499726379865),
                pitch: Cesium.Math.toRadians(-22.735599006353922),
                roll: Cesium.Math.toRadians(0.00133659048757427)
            }
        });

        // this.loadCameraPath()
        this._util.bindFlyCircle(false) //给鼠标绑定旋转操作

    })

    this.bindHandle();

}

/**
 * 事件处理
 */
D3.prototype.bindHandle = function () {

    this._handler = new Cesium.ScreenSpaceEventHandler(this._viewer.scene.canvas)
    this._handler.setInputAction((movement) => {

        // var cartesian = this._util.getCatesian3FromPX(movement.position)

        // console.log(this._util.transformCartesianToWGS84(cartesian))
        var obj = this._scene.pick(movement.position);
        if (obj && obj.id && obj.id.name && "警情分析" == obj.id.name) this.analysis()

    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // this._viewer.scene.camera.moveEnd.addEventListener((move) => {

    //     console.log(this._util.getCameraPosition())

    // });



    // this._util.getHandelPosition((position,handel)=>{
    //     console.log(position)

    // })

    // this._util.setScanCircleEffect({
    //     position: new Cesium.Cartesian3.fromDegrees(106.50642721790797, 29.658575326606123, 5.0)
    // })

    // this._util.drawLine((value) => {
    //     console.log(value)
    // })
}
/**
 * 添加覆盖面
 */
D3.prototype.addPolygon = function () {

    this._viewer.scene.camera.stopFlyCircle();
    this._util.flyTo({
        position: { x: -2180387.8000515574, y: 4378598.168639586, z: 4093601.1799155893 },
        orientation: {
            heading: Cesium.Math.toRadians(205.24266706071927),
            pitch: Cesium.Math.toRadians(-10.31008459892834),
            roll: Cesium.Math.toRadians(0.000021967826155608014)
        },
        duration: 4,
    })
    var polygons = [
        116.46354620373931, 39.92153858147266,
        116.47187747450408, 39.921327651920286,
        116.47172597800521, 39.914379016622604,
        116.46559187841079, 39.91484714112751,
        116.46341043722869, 39.91544621009374,
        116.46359380499464, 39.92154477851657,
        116.46359380499464, 39.92154477851657]


    this._viewer.entities.add({
        id: 'identify-area',
        name: '单体化标识面',
        polygon: {
            hierarchy: Cesium.Cartesian3.fromDegreesArray(polygons),
            material: new Cesium.Color(1.0, 0.0, 0.0, 0.3),
        },
        clampToS3M: true // 贴在S3M模型表面
    });

}
/**
 * 添加围栏
 */
D3.prototype.addWall = function () {

    var warn = [
        116.45121972426787, 39.912280505197565, 30.0,
        116.449751129691, 39.912270436562736, 30.0,
        116.44971753510406, 39.91321324258255, 30.0,
        116.45131361499521, 39.91317812427803, 30.0,
        116.45127073097758, 39.91221994119961, 30.0,
    ]
    this._viewer.entities.add(this._util.createDynamicWall({
        positions: Cesium.Cartesian3.fromDegreesArrayHeights(warn),
        color: Cesium.Color.RED,
        alp: 1,
        num: 0
    }))
}
/**
 * 添加热力图
 */
D3.prototype.addHeatMap = function () {

    this.heatMapImgName = []
    // 模拟数据
    let positions = [
        { x: -2180708.6506311474, y: 4379364.169500164, z: 4092280.6603018134 },
        { x: -2180302.3152536373, y: 4379885.874918468, z: 4091890.951623252 }
    ]
    let mycanvas = document.getElementsByClassName("heatmap-canvas"),
        imgData = mycanvas[1].toDataURL("image/png"),
        img = new Image();
    img.src = imgData;
    img.onload = () => {
        for (let layer of this._layerGroup) {
            let imgName = 'heat-map' + Date.now();
            layer.addOverlayImage({
                bounds: Cesium.Rectangle.fromCartesianArray(positions),
                name: imgName,
                image: img
            });

            this.heatMapImgName.push(imgName)
        }
    }
    this._util.flyTo({
        position: { x: -2180904.6282126824, y: 4380458.74732572, z: 4092896.683734781 },
        orientation: {
            heading: Cesium.Math.toRadians(351.1777045820927),
            pitch: Cesium.Math.toRadians(-89.98989978846859),
            roll: Cesium.Math.toRadians(0)
        },
        duration: 4,
        callback: () => {
            this._util.flyTo({
                position: { x: -2180933.1599555216, y: 4379595.243820803, z: 4092228.6618603463 },
                orientation: {
                    heading: Cesium.Math.toRadians(264.65979689585066),
                    pitch: Cesium.Math.toRadians(-29.153220705531837),
                    roll: Cesium.Math.toRadians(0.00013154412642876905)
                },
                duration: 4,
                callback: () => {

                }
            })
        }
    })

}

/**
 * 添加车辆漫游
 */
D3.prototype.addPathRoaming = function () {

    this._viewer.scene.camera.stopFlyCircle();
    this._util.flyTo({
        position: { x: -2179199.26458464, y: 4383238.848865096, z: 4092961.1692394507 },
        orientation: {
            heading: Cesium.Math.toRadians(61.99766273696829),
            pitch: Cesium.Math.toRadians(-51.18644829317831),
            roll: Cesium.Math.toRadians(0.0012478685199898425)
        },
        duration: 4,
    })
    var paths = [
        { lon: 116.45588629361654, lat: 39.932096438338654, alt: 5, time: 0 },
        { lon: 116.45574369753243, lat: 39.92156278175773, alt: 5, time: 120 },
        { lon: 116.4557462597629, lat: 39.917822333141274, alt: 5, time: 240 },
        { lon: 116.45600885034808, lat: 39.91244632738406, alt: 5, time: 360 },
        { lon: 116.45602252570735, lat: 39.90952089396869, alt: 5, time: 480 },
        { lon: 116.45652539935213, lat: 39.90834095156502, alt: 5, time: 600 },
        { lon: 116.4565020481611, lat: 39.907265683459244, alt: 5, time: 720 }
    ]
    this._util.setPathRoaming({
        paths: paths,
        model: true,
        m_url: 'examples/data/model/qiche.gltf',
        m_scale: 0.3,
        m_minimumPixelSize: 1,
        label: true,
        l_text: '社会车辆.1',
        l_pixelOffset: new Cesium.Cartesian2(52, -48),
        l_fillColor: Cesium.Color.WHITE,
        l_outlineWidth: 3,
        billboard: true,
        b_img: 'examples/images/Textures/bp.png',
        b_width: 55,
        b_height: 80,
        b_scale: 2,
        b_pixelOffset: new Cesium.Cartesian2(30, 0)
    })

    var paths2 = [
        { lon: 116.44380820932399, lat: 39.907228636696935, alt: 5, time: 0 },
        { lon: 116.4537704141825, lat: 39.907109010732285, alt: 5, time: 120 },
        { lon: 116.45869738508199, lat: 39.907158091016335, alt: 5, time: 240 },
        { lon: 116.46552886617278, lat: 39.90701439583122, alt: 5, time: 360 },
        { lon: 116.47192532663796, lat: 39.907033211419716, alt: 5, time: 480 },
        { lon: 116.4719956260265, lat: 39.91410436560415, alt: 5, time: 600 },
        { lon: 116.4721654193502, lat: 39.92144361487061, alt: 5, time: 720 }
    ]

    this._util.setPathRoaming({
        paths: paths2,
        model: true,
        m_url: 'examples/data/model/qiche.gltf',
        m_scale: 0.3,
        m_minimumPixelSize: 1,
        label: true,
        l_text: '社会车辆.2',
        l_pixelOffset: new Cesium.Cartesian2(52, -48),
        l_fillColor: Cesium.Color.WHITE,
        l_outlineWidth: 3,
        billboard: true,
        b_img: 'examples/images/Textures/bp.png',
        b_width: 55,
        b_height: 80,
        b_scale: 2,
        b_pixelOffset: new Cesium.Cartesian2(30, 0)
    })
}

/**
 * 添加无人机投影
 */
D3.prototype.addFlyViewe = function () {

    this._viewer.scene.camera.stopFlyCircle();
    this._util.flyTo({
        position: { x: -2178698.8850024734, y: 4382798.814028316, z: 4091590.3152000424 },
        orientation: {
            heading: Cesium.Math.toRadians(47.42110910468888),
            pitch: Cesium.Math.toRadians(-15.261589191443951),
            roll: Cesium.Math.toRadians(359.9973491802905)
        },
        duration: 4,
    })
    var paths = [
        { lon: 116.44596605973072, lat: 39.90275976224633, alt: 400, time: 0 },
        { lon: 116.470769862146, lat: 39.90961660773017, alt: 400, time: 120 },
        { lon: 116.44621270736882, lat: 39.912427615595874, alt: 400, time: 240 },
        { lon: 116.45867843557505, lat: 39.92072065356812, alt: 400, time: 360 },
        { lon: 116.469697344222, lat: 39.91736853889283, alt: 400, time: 480 },
        { lon: 116.46625570699818, lat: 39.91100981903596, alt: 400, time: 600 },
        { lon: 116.46625570699818, lat: 39.91100981903596, alt: 400, time: 720 }
    ]
    var flyEntity = this._util.setPathRoaming({

        paths: paths,
        model: true,
        m_url: 'examples/data/model/CesiumDrone.gltf',
        label: true,
        l_text: '无人机',
        l_outlineWidth: 3,
        l_fillColor: Cesium.Color.CYAN
    })
    var pointLight = this._util.setPointLight(
        flyEntity.position.getValue(this._viewer.clock.currentTime),
        {
            color: new Cesium.Color(9, 160, 15, 0.8),
            cutoffDistance: 500,
            decay: 2,
            intensity: 5
        })

    this._viewer.clock.onTick.addEventListener((clock) => {

        var position = flyEntity.position.getValue(this._viewer.clock.currentTime)

        pointLight.position = position
    });

    this.Lights.push(pointLight)

}
/**
 * 添加幅散线
 */
D3.prototype.addRadianLine = function () {


    var startPoints = Cesium.Cartesian3.fromDegrees(116.45978903715125, 39.909967349088184, 0.0)
    this._viewer.scene.camera.stopFlyCircle();
    this._util.flyTo({
        position: { x: -2180486.808461521, y: 4380608.882448336, z: 4091797.652379507 },
        orientation: {
            heading: Cesium.Math.toRadians(347.2396949955803),
            pitch: Cesium.Math.toRadians(-30.19165969032184),
            roll: Cesium.Math.toRadians(359.99999999995225)
        },
        duration: 4,
        callback: () => {
            this._util.flyTo({
                position: { x: -2180082.4702379047, y: 4380198.490651038, z: 4091834.016090025 },
                orientation: {
                    heading: Cesium.Math.toRadians(1.15907142346963),
                    pitch: Cesium.Math.toRadians(-6.19630499726722),
                    roll: Cesium.Math.toRadians(1.1933950053600149)
                },
                duration: 4,
                callback: () => {
                    this._viewer.scene.camera.speedRatio = 0.1
                    this._viewer.scene.camera.flyCircle(Cesium.Cartesian3.fromDegrees(116.45978903715125, 39.909967349088184, 50.0));

                }
            })

        }
    })

    this.addRadianLineLight(
        { startPoint: startPoints, endPoint: Cesium.Cartesian3.fromDegrees(116.46195406341593, 39.91094409159383, 0.0) },
        Cesium.Color.GREEN
    )
    this.addRadianLineLight(
        { startPoint: startPoints, endPoint: Cesium.Cartesian3.fromDegrees(116.46206023716306, 39.90898705744692, 0.0) },
        Cesium.Color.CYAN
    )
    this.addRadianLineLight(
        { startPoint: startPoints, endPoint: Cesium.Cartesian3.fromDegrees(116.46104588082288, 39.90812655886341, 0.0) },
        Cesium.Color.RED
    )
    this.addRadianLineLight(
        { startPoint: startPoints, endPoint: Cesium.Cartesian3.fromDegrees(116.4603152846996, 39.90827157210838, 0.0) },
        Cesium.Color.BLUE
    )
    this.addRadianLineLight(
        { startPoint: startPoints, endPoint: Cesium.Cartesian3.fromDegrees(116.45971631099688, 39.909261924687186, 0.0) },
        Cesium.Color.DARKGOLDENROD
    )
    this.addRadianLineLight(
        { startPoint: startPoints, endPoint: Cesium.Cartesian3.fromDegrees(116.45798267562319, 39.909457432765144, 0.0) },
        Cesium.Color.DARKGOLDENROD
    )
    this.addRadianLineLight(
        { startPoint: startPoints, endPoint: Cesium.Cartesian3.fromDegrees(116.45751184970148, 39.91041377321747, 0.0) },
        Cesium.Color.CHARTREUSE
    )
}
/**
 * 添加poi点
 */
D3.prototype.addPois = function () {

    this.addPoi(Cesium.Cartesian3.fromDegrees(116.44922948716533, 39.92111960054168, 10.0))

    this.addPoi(Cesium.Cartesian3.fromDegrees(116.44858484369381, 39.921133165957514, 10.0))

    this.addPoi(Cesium.Cartesian3.fromDegrees(116.4481157649153, 39.9206134999502, 10.0))

    this.addPoi(Cesium.Cartesian3.fromDegrees(116.44967677388972, 39.92164709864446, 10.0))

    this.addPoi(Cesium.Cartesian3.fromDegrees(116.4515856597607, 39.921616776917695, 10.0))

    this.addPoi(Cesium.Cartesian3.fromDegrees(116.45165700670557, 39.92065625173758, 10.0))

    this.addPoi(Cesium.Cartesian3.fromDegrees(116.45193369892098, 39.919699088333616, 10.0))

    this.addPoi(Cesium.Cartesian3.fromDegrees(116.44871167991542, 39.918732399121545, 10.0))

    this.addPoi(Cesium.Cartesian3.fromDegrees(116.4454473534691, 39.91850892892338, 10.0))

    this._viewer.scene.camera.stopFlyCircle();
    this._util.flyTo({
        position: { x: -2178078.422665265, y: 4379695.524142777, z: 4094395.712997039 },
        orientation: {
            heading: Cesium.Math.toRadians(157.55878176147047),
            pitch: Cesium.Math.toRadians(-18.128059595314763),
            roll: Cesium.Math.toRadians(359.9999999931809)
        },
        duration: 4,
        callback: () => {
            this._util.flyTo({
                position: { x: -2178243.635993401, y: 4379573.379978612, z: 4093595.761935782 },
                orientation: {
                    heading: Cesium.Math.toRadians(153.15661404703272),
                    pitch: Cesium.Math.toRadians(-2.974145555957291),
                    roll: Cesium.Math.toRadians(359.999999999984)
                },
                duration: 4,
                callback: () => {
                    this._viewer.scene.camera.speedRatio = 0.1
                    this._viewer.scene.camera.flyCircle(Cesium.Cartesian3.fromDegrees(116.45165700670557, 39.92065625173758, 50.0));
                }
            })
        }
    })
}

D3.prototype.addLightScan = function () {

    var ellipse = this._util.computeEllipseEdgePositions({
        semiMinorAxis: 300,
        semiMajorAxis: 300,
        rotation: 0,
        center: Cesium.Cartesian3.fromDegrees(116.4481157649153, 39.9206134999502, 10),
        granularity: Math.PI / 45.0//间隔
    })

    var lonlatArr = this._util.transformCartesianArrayToWGS84Array(this._util.splitcartesianArr(ellipse.outerPositions)), positionList = []

    lonlatArr.forEach(element => {

        positionList.push([element.lng, element.lat])
    });
    var data = {
        circle: [0.001, 116.4481157649153, 39.9206134999502, 30]
        , observer: [116.4481157649153, 39.9206134999502, 500]
        , positionList: positionList
        , material: Cesium.Color.RED.withAlpha(0.5)//光的材质
        , number: 1//数字越小速度越快
    };

    this._util.addLightScanEntity(data); //返回的是所有面的数组 如果需要清除的画，就通过此清除
}

D3.prototype.addPoi = function (position) {

    this._viewer.entities.add(this._util.createPoint({
        position: position,
        lable: false,
        point: false,
        billboard: {
            b_img: 'examples/images/Textures/poi.png',
            b_width: 35,
            b_height: 155,
            b_scale: 1.5
        }
    }))
}

D3.prototype.addRadianLineLight = function (positions, color, angularityFactor = 50000, numOfSingleLine = 500, cutoffDistance = 100) {

    if (positions) {

        this._util.addMaterialLine({
            positions: this._util.getLinkedPointList(positions.startPoint, positions.endPoint, angularityFactor, numOfSingleLine),
            width: 10,
            material: new Cesium.PolylineCityLinkMaterialProperty({
                color: color || Cesium.Color.CYAN,
                duration: 20000
            })
        })
    }
}

D3.prototype.addHeightLineLight = function (opt) {

    if (opt) {

        this._util.addMaterialLine({
            positions: [opt.positions.startPoint, opt.positions.endPoint],
            width: opt.width || 50,
            material: new Cesium.PolylineCityLinkMaterialProperty({
                color: opt.color || new Cesium.Color(2, 2, 5, 0.8),
                duration: opt.duration || 30000
            })
        })

        if (opt.pointLight) {
            this._util.setPointLight(
                positions.startPoint,
                {
                    color: new Cesium.Color(1, 1, 2, 0.8),
                    cutoffDistance: opt.cutoffDistance || 800,
                    decay: 0.5,
                    intensity: 1
                })
        }
    }
}
/**
 * 初始化场景
 * 
 */
D3.prototype.closeScene = function (callback) {

    //初始化所有效果
    this._viewer.scene.camera.stopFlyCircle();

    //实体
    this._viewer.entities.removeAll()

    //特效
    for (let i in this.postProcess) {

        this._scene.postProcessStages.remove(this.postProcess[i])
    }
    //图元
    for (let i in this.primitives) {

        this._scene.primitives.remove(this.primitives[i])
    }

    //光源
    for (let i in this.Lights) {

        this._viewer.scene.removeLightSource(this.Lights[i]);
    }

    // 弹窗
    if (this._layers) this._layers.closeAll();

    // 热力图
    if (this.heatMapImgName && this.heatMapImgName.length > 0) {

        for (let layer of this._layerGroup) {

            for (let name of this.heatMapImgName) {

                layer.removeOverlayImage(name);
            }

        }
        this.heatMapImgName = []
    }

    //标牌
    if (this._css3Renderer) {

        this._css3Renderer.removeEntityLayer('labelTip')

        this._css3Renderer = undefined
    }

    // init clock
    this._viewer.clock.startTime = new Cesium.JulianDate()
    this._viewer.clock.currentTime = this._viewer.clock.startTime
    this._viewer.clock.multiplier = 1.0
    this._viewer.shouldAnimate = true

    this._util.flyTo({
        position: { x: -2178243.864201297, y: 4381910.723903083, z: 4093349.024458371 },
        orientation: {
            heading: Cesium.Math.toRadians(90.06027123960881),
            pitch: Cesium.Math.toRadians(-40.88443857899552),
            roll: Cesium.Math.toRadians(359.99916052293423)
        },
        duration: 5,
        callback: () => {

            if (typeof callback === 'function') {

                callback()
            } else {
                // 
                this._state = this._STATECODE.zero
            }
        }
    })

}
/**
 * 场景动画
 */
D3.prototype.palyScene = function () {

    this._state = this._STATECODE.all

    var play = () => {
        this.monitoring(() => {

            this.startSceneOne(() => {

                this.analysis(() => {

                    this.scheduling()
                })
            })
        })
    }
    if (this.postProcess.length > 0) {

        this.closeScene(() => {

            play()
        })

    } else {

        play()
    }





}
/**
 * 警情监控
 */
D3.prototype.monitoring = function (callback) {

    if (this._STATECODE.zero !== this._state & this._STATECODE.all !== this._state) {

        this._layers.msg('请先初始化场景 ', {
            time: 2500,
        });
        return false
    }

    var start = () => {

        this.postProcess.push(this._util.setRadarScanEffect({
            position: Cesium.Cartesian3.fromDegrees(116.45141573633816, 39.91324637901737, 10.0),
            color: Cesium.Color.RED,
            radius: 500
        }))

        this._util.flyTo({
            position: { x: -2178693.2564594974, y: 4380220.704344869, z: 4093694.8169494905 },
            orientation: {
                heading: Cesium.Math.toRadians(154.12738034665816),
                pitch: Cesium.Math.toRadians(-36.860896281659365),
                roll: Cesium.Math.toRadians(5.0125541779865026)
            },
            duration: 5,
            callback: () => {

                this._scene.camera.flyCircle(Cesium.Cartesian3.fromDegrees(116.45141573633816, 39.91324637901737, 100.0));

                if (typeof callback === 'function') {

                    setTimeout(() => {

                        callback()
                    }, 3000)
                } else {


                    // update state
                    this._state = this._STATECODE.one
                }
            }
        })
    }

    if (this.postProcess.length > 0) {


        this.closeScene(() => {

            start()
        })
    } else {

        start()
    }


}

/**
 * 
 * 警情预报
 */
D3.prototype.startSceneOne = function (callback) {


    if (this._STATECODE.one !== this._state & this._STATECODE.all !== this._state) {

        this._layers.msg('请先预览完警情监控 ', {
            time: 3000,
        });
        return false
    }
    this._viewer.scene.camera.stopFlyCircle();

    this._util.flyTo({
        position: { x: -2178463.9456453873, y: 4381002.914153181, z: 4093890.133365481 },
        orientation: {
            heading: Cesium.Math.toRadians(128.64858283790525),
            pitch: Cesium.Math.toRadians(-44.65849475098552),
            roll: Cesium.Math.toRadians(0.0023842018258495466)
        },
        duration: 5,
        callback: () => {
            this._util.flyTo({
                position: { x: -2179037.6221276326, y: 4380549.292276369, z: 4092247.909965294 },
                orientation: {
                    heading: Cesium.Math.toRadians(38.73496800382902),
                    pitch: Cesium.Math.toRadians(-21.116761624408735),
                    roll: Cesium.Math.toRadians(0.00018448854527482853)
                },
                duration: 5,
                callback: () => {

                    this._util.flyTo({
                        position: { x: -2179048.567425212, y: 4380181.227054535, z: 4092287.128962158 },
                        orientation: {
                            heading: Cesium.Math.toRadians(57.01126750844415),
                            pitch: Cesium.Math.toRadians(-4.698058614089507),
                            roll: Cesium.Math.toRadians(0.00009319620311191225)
                        },
                        duration: 5,
                        callback: () => {
                            if (typeof callback === 'function') {

                                setTimeout(() => {

                                    callback()
                                }, 3000)
                            } else {

                                // update state
                                this._state = this._STATECODE.tow
                            }
                        }
                    })
                }
            })
        }
    })

    //异常提示
    new Promise((resolve, reject) => {

        this.addDynamicEntity({
            position: Cesium.Cartesian3.fromDegrees(116.450217639056, 39.912527799624065, 130.0),
            model: { lng: 116.450217639056, lat: 39.912527799624065, alt: 130.0 },
            m_color: Cesium.Color.RED.withAlpha(0.5),
            label: true,
            billboard: true,
            text: ' 商务办公楼 ',
            l_font: '14px sans-serif',
            l_fillColor: Cesium.Color.WHITE,
            l_backgroundColor: Cesium.Color.RED,
            l_pixelOffset: new Cesium.Cartesian2(0, -5),
            l_showBackground: false
        })

        var cricleEntity = this._util.createDynamicCricle({
            center: { lng: 116.450217639056, lat: 39.912527799624065, alt: 130.0 },
            material: new Cesium.CircleWaveMaterialProperty({
                color: Cesium.Color.RED,
                count: 3,
                gradient: 0.9
            }),
            height: 100,
            radius: 50,
            rotateAmount: 0.01
        })
        this._viewer.entities.add(cricleEntity)

    })

    // 模拟效果
    new Promise((resolve, reject) => {

        //添加火焰粒子
        this.primitives.push(this._util.setFlameParticle({
            position: Cesium.Cartesian3.fromDegrees(116.4499827986952, 39.91231248171688, 0),
            tx: 0, ty: 0, tz: 50
        }))

        this.primitives.push(this._util.setFlameParticle({
            position: Cesium.Cartesian3.fromDegrees(116.45045144518653, 39.91234434075017, 0),
            tx: 0, ty: 0, tz: 50
        }))

        //添加人群
        this._viewer.entities.add(this._util.createModel({
            position: Cesium.Cartesian3.fromDegrees(116.45007132823285, 39.91223440231512, 5.0),
            m_url: 'examples/SampleData/gltf/man/walk.gltf',
            m_scale: 3,
            m_minimumPixelSize: 1,
        }))

        this._viewer.entities.add(this._util.createModel({
            position: Cesium.Cartesian3.fromDegrees(116.45026244256015, 39.91226094401238, 5.0),
            m_url: 'examples/SampleData/gltf/man/walk.gltf',
            m_scale: 3,
            m_minimumPixelSize: 1,
        }))

        this._viewer.entities.add(this._util.createModel({
            position: Cesium.Cartesian3.fromDegrees(116.45059442902425, 39.912284437562185, 5.0),
            m_url: 'examples/SampleData/gltf/man/walk.gltf',
            m_scale: 3,
            m_minimumPixelSize: 1,
        }))

    })

}

/**
 * 警情分析
 */
D3.prototype.analysis = function (callback) {

    if (this._STATECODE.tow !== this._state & this._STATECODE.all !== this._state) {

        this._layers.msg('请先预览完警情预报', {
            time: 3000,
        });
        return false
    }
    this._viewer.scene.camera.stopFlyCircle();

    this._util.flyTo({
        position: { x: -2178835.9901788016, y: 4380941.406850311, z: 4092044.408504874 },
        orientation: {
            heading: Cesium.Math.toRadians(45.453049548959),
            pitch: Cesium.Math.toRadians(-15.610707989693905),
            roll: Cesium.Math.toRadians(359.99999999987216)
        },
        duration: 5,
        callback: () => {
            // css3 实现标牌

            let css3Elements = [];
            this._css3Renderer = new Cesium.Css3Renderer(css3Elements, true) //第三个参数为当标签在地球背面时候会隐藏

            this._css3Renderer.addEntityLayer({
                id: 'labelTip',
                position: [116.450217639056, 39.912527799624065, 130.0],//高度为 boxHeightMax
                element: `<div class='ysc-dynamic-layer ys-css3-box' id='labelTip'>
                       <div class='line'></div>
                       <div class='main' style="font-size:25px">
                            <div class="" style="color:#ff9800">警情分析</div>
                           <div class="">该楼七层发生火灾</div>
                           <div class="">指派救生队伍支援!</div>
                       </div>
                   </div>`,
                offset: [10, -250],
                boxShow: false,
                circleShow: false,
            })

            this._viewer.scene.camera.speedRatio = 0.1
            this._viewer.scene.camera.flyCircle(Cesium.Cartesian3.fromDegrees(116.450217639056, 39.912527799624065, 100.0));

            // 警示线特效
            var warn = [
                116.45121972426787, 39.912280505197565, 30.0,
                116.449751129691, 39.912270436562736, 30.0,
                116.44971753510406, 39.91321324258255, 30.0,
                116.45131361499521, 39.91317812427803, 30.0,
                116.45127073097758, 39.91221994119961, 30.0,
            ]
            this._viewer.entities.add({
                wall: {
                    positions: Cesium.Cartesian3.fromDegreesArrayHeights(warn),
                    material: new Cesium.WarnLinkMaterialProperty({ freely: 'cross', color: Cesium.Color.YELLOW, duration: 1000, count: 1.0, direction: '-' }),
                }
            });

            if (typeof callback === 'function') {

                setTimeout(() => {

                    callback()
                }, 3000)
            } else {
                // update state
                this._state = this._STATECODE.three
            }
        }
    })
}
/**
 * 警情调度
 */
D3.prototype.scheduling = function () {

    if (this._STATECODE.three !== this._state & this._STATECODE.all !== this._state) {

        this._layers.msg('请先预览完警情分析 ', {
            time: 3000,
        });
        return false
    }
    // 救护车
    var paths = [{ lon: 116.44753798513237, lat: 39.91329913144483, alt: 5.0, time: 0 },
    { lon: 116.44754831320495, lat: 39.91205867447874, alt: 5.0, time: 120 },
    { lon: 116.44919669983119, lat: 39.91207453317339, alt: 5.0, time: 240 },
    { lon: 116.45021742143986, lat: 39.91208239585685, alt: 5.0, time: 360 },
    { lon: 116.45021742143986, lat: 39.91208239585685, alt: 5.0, time: 480 }]


    // 消防车
    var paths2 = [{ lon: 116.4552207886404, lat: 39.91205626109142, alt: 5.0, time: 0 },
    { lon: 116.4531359117942, lat: 39.9120348488425, alt: 5.0, time: 120 },
    { lon: 116.45169757241298, lat: 39.91202452492026, alt: 5.0, time: 240 },
    { lon: 116.45021328751454, lat: 39.91201148288871, alt: 5.0, time: 360 },
    { lon: 116.45021328751454, lat: 39.91201148288871, alt: 5.0, time: 480 }]
    // 添加引导线
    this._util.addMaterialLine({
        positions: this._util.transformWGS84ArrayToCartesianArray(paths),
        width: 50,
        material: new Cesium.PolylineCityLinkMaterialProperty({
            color: Cesium.Color.RED,
            duration: 20000
        }),
        clampToGround: true
    })
    this._util.addMaterialLine({
        positions: this._util.transformWGS84ArrayToCartesianArray(paths2),
        width: 50,
        material: new Cesium.PolylineCityLinkMaterialProperty({
            color: Cesium.Color.RED,
            duration: 20000
        }),
        clampToGround: true
    })


    var addMan = () => {

        this._viewer.clock.multiplier = 1.0
        this._viewer.entities.add(this._util.createModel({
            position: Cesium.Cartesian3.fromDegrees(116.4500554199689, 39.91221044177715, 5.0),
            m_url: 'examples/data/model/xiaofangyuan-run.gltf',
            m_scale: 7,
            m_minimumPixelSize: 1,
        }))
        this._viewer.entities.add(this._util.createModel({
            position: Cesium.Cartesian3.fromDegrees(116.45035101783887, 39.912153073679924, 5.0),
            m_url: 'examples/data/model/xiaofangyuan-run.gltf',
            m_scale: 7,
            m_minimumPixelSize: 1,
        }))
    }

    // 添加车辆
    new Promise(() => {

        this._util.setPathRoaming({
            paths: paths,
            model: true,
            m_url: 'examples/data/model/qiche.gltf',
            m_scale: 0.1,
            m_minimumPixelSize: 1,
            label: true,
            l_text: '救护车',
            l_pixelOffset: new Cesium.Cartesian2(52, -48),
            l_fillColor: Cesium.Color.WHITE,
            l_outlineWidth: 3,
            billboard: true,
            b_img: 'examples/images/Textures/bp2.png',
            b_width: 55,
            b_height: 80,
            b_scale: 2,
            b_pixelOffset: new Cesium.Cartesian2(30, 0)
        })
        this._util.setPathRoaming({
            paths: paths2,
            model: true,
            m_url: 'examples/data/model/qiche.gltf',
            m_scale: 0.1,
            m_minimumPixelSize: 1,
            label: true,
            l_text: '消防车',
            l_pixelOffset: new Cesium.Cartesian2(52, -48),
            l_fillColor: Cesium.Color.WHITE,
            l_outlineWidth: 3,
            billboard: true,
            b_img: 'examples/images/Textures/bp.png',
            b_width: 55,
            b_height: 80,
            b_scale: 2,
            b_pixelOffset: new Cesium.Cartesian2(30, 0)
        })
    })

    //街道漫游
    this._viewer.scene.camera.stopFlyCircle();
    // 远景
    this._util.flyTo({
        position: { x: -2178725.2326817405, y: 4380717.691272014, z: 4092429.139375593 },
        orientation: {
            heading: Cesium.Math.toRadians(74.6359315563435),
            pitch: Cesium.Math.toRadians(-31.233145079364085),
            roll: Cesium.Math.toRadians(0.00021380944582563688)
        },
        duration: 5,
        callback: () => {
            //街道
            this._util.flyTo({
                position: { x: -2178718.4499226217, y: 4380320.631065833, z: 4092296.741367402 },
                orientation: {
                    heading: Cesium.Math.toRadians(83.59293245172353),
                    pitch: Cesium.Math.toRadians(-2.0635543646730805),
                    roll: Cesium.Math.toRadians(359.9999999999991)
                },
                duration: 5,
                callback: () => {
                    //漫游 1
                    this._util.flyTo({
                        position: { x: -2178907.5523918574, y: 4380227.944369431, z: 4092295.2689017 },
                        orientation: {
                            heading: Cesium.Math.toRadians(83.59451489628981),
                            pitch: Cesium.Math.toRadians(-2.0635543646734114),
                            roll: Cesium.Math.toRadians(359.99999999999926)
                        },
                        duration: 15,

                        callback: () => {
                            //漫游 2
                            this._util.flyTo({
                                position: { x: -2179038.3685479737, y: 4380186.554328359, z: 4092297.2180936695 },
                                orientation: {
                                    heading: Cesium.Math.toRadians(56.38807730423329),
                                    pitch: Cesium.Math.toRadians(-11.712623638749156),
                                    roll: Cesium.Math.toRadians(359.9999999999992)
                                },
                                duration: 10,
                                callback: () => {

                                    addMan() // 添加消防员
                                    //漫游 3
                                    this._util.flyTo({
                                        position: { x: -2178996.2169643864, y: 4380316.564571191, z: 4092306.3786329245 },
                                        orientation: {
                                            heading: Cesium.Math.toRadians(64.96210850602627),
                                            pitch: Cesium.Math.toRadians(-21.931507732669104),
                                            roll: Cesium.Math.toRadians(359.9998957985643)
                                        },
                                        duration: 8,
                                        callback: () => {
                                            // 弹出结果信息
                                            this._layers.open({
                                                type: 1
                                                , title: false
                                                , closeBtn: 1
                                                , shade: false
                                                , shadeClose: true
                                                , anim: 2
                                                , area: ['500px', '300px']
                                                , offset: 'auto'
                                                , content: `<div style="color:white"><h2 style="text-align:center;padding:10px">警情报告</h2>
                                                <div style="font-size:15px;padding:20px">
                                                <p style="padding-bottom:20px">xxx大楼七层于29日下午发生火灾,报告如下:</p>
                                                <p>原因:    七层火锅商铺电器泄露引起火灾;</p>
                                                <p>损失:    七层共7家商铺受影响,其中两家紧靠起火地较严重;</p>
                                                <p>出警:    接警后10分钟救护车与消防车到达现场,10分钟灭火救险;</p>
                                                <p>伤亡:    无重大伤亡,5人轻伤.</p>
                                                </div></div>`
                                                , btn: ['确认']
                                                , btn1: function () {
                                                    layer.closeAll();
                                                }
                                            });
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            })

        }
    })
}
// 动态实体函数
D3.prototype.addDynamicEntity = function (opt) {

    var Entity = this._util.createEntity()
    Entity.name = '警情分析'
    if (opt.model) {
        Entity.model = this._util.getModel({
            m_url: opt.m_url || 'examples/data/model/zhui.glb',
            m_scale: opt.m_scale || 40,
            m_minimumPixelSize: opt.m_minimumPixelSize || 50,
            m_color: opt.m_color || Cesium.Color.DARKCYAN.withAlpha(0.5)
        })

        this._util.setRotateModel({
            entity: Entity,
            position: opt.model,
            rotateAmount: 4
        })
    }

    if (opt.billboard) {

        Entity.billboard = this._util.getBillboard({
            b_img: 'examples/images/Textures/warn.png',
            b_width: 55,
            b_height: 55,
            b_pixelOffset: opt.b_pixelOffset || new Cesium.Cartesian2(0, -60)

        })
    }

    if (opt.label) {
        Entity.label = this._util.getLabel({
            l_text: opt.text,
            l_font: '16px sans-serif',
            l_pixelOffset: opt.l_pixelOffset || new Cesium.Cartesian2(0, -100),
            l_fillColor: opt.l_fillColor || Cesium.Color.CYAN,
            l_showBackground: opt.l_showBackground,
            l_backgroundColor: opt.l_backgroundColor
        })
    }

    Entity.position = opt.position
    return this._viewer.entities.add(Entity)
}


/**
 * 初始化页面
 * 添加gu
 */
D3.prototype.initGUI = function () {

    var viewer = this._viewer,
        gui = new dat.GUI(),
        gui2 = new dat.GUI(),
        gui3 = new dat.GUI(),
        $this = this;

    var sceneObj = new function () {
        //泛光开关
        this.bloomEffectShow = false
        //泛光阈值
        this.bloomThreshold = 1
        //泛光强度
        this.bloomIntensity = 2
        //HDR开关
        this.hdrEnabled = true
        //颜色校正
        this.colorCorrectionShow = false
        //饱和度
        this.colorCorrectionSaturation = 3.1
        //亮度
        this.colorCorrectionBrightness = 1.8
        //对比度
        this.colorCorrectionContrast = 1.2
        //色调
        this.colorCorrectionHue = 0

        //环境光
        this.ambientLightColor = 0.8
    };

    var sceneEffect = gui3.addFolder('场景效果')

    sceneEffect.add(sceneObj, 'bloomEffectShow').name('泛光开关').onChange(function (value) {
        viewer.scene.bloomEffect.show = value;
        viewer.scene.bloomEffect.threshold = sceneObj.bloomThreshold;
        viewer.scene.bloomEffect.bloomIntensity = sceneObj.bloomIntensity;
    });
    sceneEffect.add(sceneObj, 'bloomThreshold', 0, 1, 0.1).name('泛光阈值').onChange(function (value) {
        viewer.scene.bloomEffect.threshold = value;
    });
    sceneEffect.add(sceneObj, 'bloomIntensity', 0, 10, 0.1).name('泛光强度').onChange(function (value) {
        viewer.scene.bloomEffect.bloomIntensity = value;
    });
    sceneEffect.add(sceneObj, 'hdrEnabled').name('HDR开关').onChange(function (value) {
        viewer.scene.hdrEnabled = value;
    });
    sceneEffect.add(sceneObj, 'colorCorrectionShow').name('颜色校正').onChange(function (value) {
        viewer.scene.colorCorrection.show = value;
    });
    sceneEffect.add(sceneObj, 'colorCorrectionSaturation', 0, 5, 0.1).name('饱和度').onChange(function (value) {
        viewer.scene.colorCorrection.saturation = value;
    });
    sceneEffect.add(sceneObj, 'colorCorrectionBrightness', 0, 5, 0.1).name('亮度').onChange(function (value) {
        viewer.scene.colorCorrection.brightness = value;
    });
    sceneEffect.add(sceneObj, 'colorCorrectionContrast', 0, 5, 0.1).name('对比度').onChange(function (value) {
        viewer.scene.colorCorrection.contrast = value;
    });
    sceneEffect.add(sceneObj, 'colorCorrectionHue', 0, 5, 0.1).name('色调').onChange(function (value) {
        viewer.scene.hdrEnabled = value;
    });
    sceneEffect.add(sceneObj, 'colorCorrectionHue', 0, 1, 0.1).name('环境光').onChange(function (value) {
        viewer.scene.lightSource.ambientLightColor = new Cesium.Color(value, value, value, 1);
    });

    gui3.domElement.id = 'navi3'

    var menuObj = new function () {

        this._addPolygon = function () {

            $this.addPolygon()
        }

        this._addPathRoaming = function () {

            $this.addPathRoaming()
        }

        this._addFlyViewe = function () {

            $this.addFlyViewe()
        }
        this._addRadianLine = function () {

            $this.addRadianLine()
        }
        this._addPoiData = function () {

            $this.addPois()
        }
        this._cityRoming = function () {

            $this.loadCameraPath()
        }
        this._addWall = function () {

            $this.addWall()
        }
        this._addHeatMap = function () {

            $this.addHeatMap()
        }
        this._addLightScan = function () {

            $this.addLightScan()
        }
    }

    var menu = gui.addFolder('导航')

    menu.add(menuObj, '_cityRoming').name("城市漫游");
    menu.add(menuObj, '_addPoiData').name("添加POI");
    // menu.add(menuObj, '_addPolygon').name("添加矢量面");
    // menu.add(menuObj, '_addWall').name("添加围栏");
    // menu.add(menuObj, '_addLightScan').name("添加灯光扫描");
    menu.add(menuObj, '_addHeatMap').name("添加热力图");
    menu.add(menuObj, '_addFlyViewe').name("添加无人机");
    menu.add(menuObj, '_addRadianLine').name("添加喷泉线");
    menu.add(menuObj, '_addPathRoaming').name("添加车辆");
    // menu.open()

    gui.domElement.id = 'navi2'

    var demo = new function () {

        this._monitoring = function () {

            $this.monitoring()
        }

        this._scanInfo = function () {

            $this.startSceneOne()
        }

        this._analysis = function () {

            $this.analysis()
        }

        this._scheduling = function () {

            $this.scheduling()
        }

        this._palyScene = function () {

            $this.palyScene()
        }
        this._closeScene = function () {

            $this.closeScene()
        }
    }

    var scene1 = gui2.addFolder('警情场景模拟')
    scene1.add(demo, '_palyScene').name("综合场景");
    scene1.add(demo, '_closeScene').name("初始化场景");
    scene1.add(demo, '_monitoring').name("1.警情监控");
    scene1.add(demo, '_scanInfo').name("2.警情预报");
    scene1.add(demo, '_analysis').name("3.警情分析");
    scene1.add(demo, '_scheduling').name("4.警情调度");

    // scene1.open()

    gui2.domElement.id = 'navi'

    // 适配
    $("#navi").hover(function () {
        $("#navi ul.closed").addClass('showState')
        $("#navi ul.closed").removeClass('closed')
    }, function () {
        $(".showState").addClass('closed')
        $("#navi ul.closed").removeClass('showState')
    });

    $("#navi2").hover(function () {
        $("#navi2 ul.closed").addClass('showState')
        $("#navi2 ul.closed").removeClass('closed')
    }, function () {
        $(".showState").addClass('closed')
        $("#navi2 ul.closed").removeClass('showState')
    });

    $("#navi3").hover(function () {
        $("#navi3 ul.closed").addClass('showState')
        $("#navi3 ul.closed").removeClass('closed')
    }, function () {
        $(".showState").addClass('closed')
        $("#navi3 ul.closed").removeClass('showState')
    });
}

if (typeof Cesium !== 'undefined') {
    onloadApp()
}
