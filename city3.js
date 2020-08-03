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

    this._drawHandlers = undefined

    this.postProcess = [] //后期处理

    this.heatMapImgName = []

    this._css3Renderer = undefined
    this._css3Renderer2 = undefined
    this._css3Renderer3 = undefined
    this._css3Renderer4 = undefined
    this._css3Renderer5 = undefined
    this._css3Renderer6 = undefined
    this._css3Renderer7 = undefined
    this._css3Renderer8 = undefined

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
        four: 4,
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

        this._scene.skyBox = this._util.setTwoGroundSkyBox()

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
        this._scene.lightSource.ambientLightColor = opt.ambientLightColor || new Cesium.Color(0.3, 0.3, 0.3, 1);

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
            easingFunction: Cesium.EasingFunction.SINUSOIDAL_IN,
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
                    easingFunction: Cesium.EasingFunction.SINUSOIDAL_IN,
                    callback: () => {
                        this._util.flyTo({
                            position: { x: -2179780.958069727, y: 4379145.05670711, z: 4093251.679035389 },
                            orientation: {
                                heading: Cesium.Math.toRadians(202.12146484437022),
                                pitch: Cesium.Math.toRadians(-4.367558356924628),
                                roll: Cesium.Math.toRadians(0.0006130606451948047)
                            },
                            duration: 5,
                            easingFunction: Cesium.EasingFunction.SINUSOIDAL_IN,
                            callback: () => {
                                this._util.flyTo({
                                    position: { x: -2182832.9113919945, y: 4380248.782123272, z: 4093233.182007854 },
                                    orientation: {
                                        heading: Cesium.Math.toRadians(282.56605551019436),
                                        pitch: Cesium.Math.toRadians(-38.5875540173017),
                                        roll: Cesium.Math.toRadians(359.99999999993923)
                                    },
                                    duration: 5,
                                    easingFunction: Cesium.EasingFunction.SINUSOIDAL_IN,
                                    callback: callback
                                })
                            }
                        })
                    }
                })
            }
        })
    }, 500)

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

        for (var i = 0; i < layers.length; i++) {
            layers[i].selectEnabled = false;
        }
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

            position: { x: -2179743.7613028353, y: 4380161.175350372, z: 4094944.220205319 },
            orientation: {
                heading: Cesium.Math.toRadians(180.87973154786394),
                pitch: Cesium.Math.toRadians(-43.08469321885954),
                roll: Cesium.Math.toRadians(359.9999999998978)
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
        // 分析
        if (obj && obj.id && obj.id.name && "警情分析" == obj.id.name) this.analysis()

        // 视频融合
        if (obj && obj.id && obj.id.name && "sp_poi" == obj.id.name) this.addVideo()

        // poi

        // if (obj && obj.id && obj.id.name && "poi" == obj.id.name) this._viewer.trackedEntity = obj.id

        // 危房
        if (obj && obj.id && obj.id.name && !this._css3Renderer2 && "水积危房1" == obj.id.name) {

            this._util.setView({
                position: { x: -2179884.072752137, y: 4380282.598598473, z: 4091894.7010583826 },
                orientation: {
                    heading: Cesium.Math.toRadians(56.3061381995133),
                    pitch: Cesium.Math.toRadians(-26.246115824808314),
                    roll: Cesium.Math.toRadians(359.99999999997397)
                }
            })

            setTimeout(() => {
                this._css3Renderer2 = new Cesium.Css3Renderer([], true)
                this.createCss3Renderer({
                    obj: this._css3Renderer2,
                    css3Elements: [],
                    position: [116.45930230383246, 39.907553204871384, 30.0],
                    id: "less1",
                    div: `<div class='main' style="font-size:14px">
                        <div class="" style="color:#ff9800">重点监测点</div>
                       <div class=""> 房屋地址：北京海淀学院路科技大厦</div>
                       <div class="">建造年限：1978年</div>
                       <div class="">房屋居住人数：2222人</div>
                       <div class="">倒塌后可能波及区域范围：500平米</div>
                       <div class="">倒塌后可能波及人口：3000人</div>
                   </div>`
                })
            }, 1000)
        }

        //
        if (obj && obj.id && obj.id.name && !this._css3Renderer3 && "水积危房2" == obj.id.name) {

            this._util.setView({
                position: { x: -2180065.831115553, y: 4380182.434377526, z: 4091863.9895502008 },
                orientation: {
                    heading: Cesium.Math.toRadians(24.45588588296945),
                    pitch: Cesium.Math.toRadians(-31.066815776797863),
                    roll: Cesium.Math.toRadians(359.9999999999996)
                }
            })
            setTimeout(() => {
                this._css3Renderer3 = new Cesium.Css3Renderer([], true)
                this.createCss3Renderer({
                    obj: this._css3Renderer3,
                    css3Elements: [],
                    position: [116.4608142390859, 39.90758194627311, 30.0],
                    id: "less2",
                    div: `  <div class='main' style="font-size:14px">
                    <div class="" style="color:#ff9800">重点监测点</div>
                   <div class=""> 房屋地址：北京海淀学院路科技大厦</div>
                   <div class="">建造年限：1978年</div>
                   <div class="">房屋居住人数：2222人</div>
                   <div class="">倒塌后可能波及区域范围：500平米</div>
                   <div class="">倒塌后可能波及人口：3000人</div>
               </div>`
                })
            }, 1000)
        }

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
 * 添加视频融合
 */
D3.prototype.addVideo = function () {

    this._util.setView({
        position: { x: -2179380.119571195, y: 4380071.627266212, z: 4092282.938696757 },
        orientation: {
            heading: Cesium.Math.toRadians(181.92666077358172),
            pitch: Cesium.Math.toRadians(-16.190769989688274),
            roll: Cesium.Math.toRadians(0.0001089795995644819)
        }
    })
    setTimeout(() => {

        if (!this._drawHandlers) {

            this._videoElement = document.getElementById('trailer');
            this._projectionImage = new Cesium.ProjectionImage(this._scene);
            this._drawHandlers = new Cesium.DrawHandler(this._viewer, Cesium.DrawMode.Point);

            this._clearAndActive = () => {

                this._projectionImage.distance = 0.1;
                var wgsPosition = this._scene.camera.positionCartographic;
                var longitude = Cesium.Math.toDegrees(wgsPosition.longitude);
                var latitude = Cesium.Math.toDegrees(wgsPosition.latitude);
                var height = wgsPosition.height;
                this._projectionImage.viewPosition = [longitude, latitude, height];
                this._projectionImage.horizontalFov = 20;
                this._projectionImage.verticalFov = 10;
                this._projectionImage.setImage({
                    video: this._videoElement
                });

                setTimeout(() => {
                    this._projectionImage.build();
                }, 100)

                this._projectionImage.hintLineVisible = false
            }
            this._drawHandlers.movingEvt.addEventListener((windowPosition) => {

                var last = this._scene.pickPosition(windowPosition);
                //计算该点与视口位置点坐标的距离
                var distance = Cesium.Cartesian3.distance(this._scene.camera.position, last);

                if (distance > 0) {
                    //将鼠标当前点坐标转化成经纬度
                    var cartographic = Cesium.Cartographic.fromCartesian(last);
                    var longitude = Cesium.Math.toDegrees(cartographic.longitude);
                    var latitude = Cesium.Math.toDegrees(cartographic.latitude);
                    var height = cartographic.height;
                    //通过该点设置视频投放对象的距离及方向
                    this._projectionImage.setDistDirByPoint([longitude, latitude, height]);
                    this._projectionImage.distance = 200
                }
            });

            this._clearAndActive();

            this._drawHandlers.activate();

        } else {

            this._drawHandlers.clear()

            this._clearAndActive();

            this._drawHandlers.activate();
        }
    }, 1000)

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
        duration: 3,
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
            height: 6.0,
            material: new Cesium.Color(1.0, 0.0, 0.0, 0.3),
            clampToGround: false,
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
        duration: 3,
        callback: () => {
            this._util.flyTo({
                position: { x: -2180933.1599555216, y: 4379595.243820803, z: 4092228.6618603463 },
                orientation: {
                    heading: Cesium.Math.toRadians(264.65979689585066),
                    pitch: Cesium.Math.toRadians(-29.153220705531837),
                    roll: Cesium.Math.toRadians(0.00013154412642876905)
                },
                duration: 3,
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
        duration: 3,
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
        duration: 3,
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
        duration: 3,
        callback: () => {
            this._util.flyTo({
                position: { x: -2180082.4702379047, y: 4380198.490651038, z: 4091834.016090025 },
                orientation: {
                    heading: Cesium.Math.toRadians(1.15907142346963),
                    pitch: Cesium.Math.toRadians(-6.19630499726722),
                    roll: Cesium.Math.toRadians(1.1933950053600149)
                },
                duration: 3,
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
 * 添加圆环
 */
D3.prototype.addCircle = function () {

    this._util.setCircleScanEffect({
        position: Cesium.Cartesian3.fromDegrees(116.45519356069228, 39.907939889911766, 10.0),
        color: Cesium.Color.RED.withAlpha(0.8),
        radius: 600,
        circleMode: 'Circle',
        border: 20
    })
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
        duration: 3,
        callback: () => {
            this._util.flyTo({
                position: { x: -2178243.635993401, y: 4379573.379978612, z: 4093595.761935782 },
                orientation: {
                    heading: Cesium.Math.toRadians(153.15661404703272),
                    pitch: Cesium.Math.toRadians(-2.974145555957291),
                    roll: Cesium.Math.toRadians(359.999999999984)
                },
                duration: 3,
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

    this.primitives = []

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

    //画笔
    if (this._drawHandlers) {

        this._drawHandlers.clear()
        this._clearAndActive()
        this._drawHandlers = undefined
    }
    //标牌
    if (this._css3Renderer) this._css3Renderer.removeEntityLayer('labelTip')

    if (this._css3Renderer2) this._css3Renderer2.removeEntityLayer('less1')

    if (this._css3Renderer3) this._css3Renderer3.removeEntityLayer('less2')

    if (this._css3Renderer4) this._css3Renderer4.removeEntityLayer('msg')

    if (this._css3Renderer5) this._css3Renderer5.removeEntityLayer('msg2')

    if (this._css3Renderer6) this._css3Renderer6.removeEntityLayer('msg3')

    if (this._css3Renderer7) this._css3Renderer7.removeEntityLayer('msg4')

    if (this._css3Renderer8) this._css3Renderer8.removeEntityLayer('msg5')

    this._css3Renderer = undefined, this._css3Renderer2 = undefined
        , this._css3Renderer3 = undefined, this._css3Renderer4 = undefined
        , this._css3Renderer5 = undefined, this._css3Renderer6 = undefined
        , this._css3Renderer7 = undefined, this._css3Renderer8 = undefined


    // init clock
    this._viewer.clock.startTime = new Cesium.JulianDate()
    this._viewer.clock.currentTime = this._viewer.clock.startTime
    this._viewer.clock.multiplier = 1.0
    this._viewer.shouldAnimate = true

    this._util.setView({
        position: { x: -2178243.864201297, y: 4381910.723903083, z: 4093349.024458371 },
        orientation: {
            heading: Cesium.Math.toRadians(90.06027123960881),
            pitch: Cesium.Math.toRadians(-40.88443857899552),
            roll: Cesium.Math.toRadians(359.99916052293423)
        }
    })

    setTimeout(() => {

        if (typeof callback === 'function') {

            callback()
        } else {
            // 
            this._state = this._STATECODE.zero
        }
    }, 500)

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

                    this.plan(() => {

                        this.scheduling()
                    })
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
 * 警情上报
 */
D3.prototype.monitoring = function (callback) {

    if (this._STATECODE.zero !== this._state & this._STATECODE.all !== this._state) {

        this._layers.msg('请先初始化场景 ', {
            time: 2500,
        });
        return false
    }

    var start = () => {

        this._util.setView({
            position: { x: -2179743.7613028353, y: 4380161.175350372, z: 4094944.220205319 },
            orientation: {
                heading: Cesium.Math.toRadians(180.87973154786394),
                pitch: Cesium.Math.toRadians(-43.08469321885954),
                roll: Cesium.Math.toRadians(359.9999999998978)
            }
        });

        this._radarScan = this._util.setRadarScanEffect({
            position: Cesium.Cartesian3.fromDegrees(116.45653937176488, 39.908769995842434, 10.0),
            color: Cesium.Color.RED.withAlpha(0.8),
            radius: 530
        })
        this.postProcess.push(this._radarScan)

        // this.postProcess.push(this._util.setRainEffect())
        
        this.primitives.push(this._util.setRainEffect())

        this.addScenePoi()

        // this._scene.camera.flyCircle(Cesium.Cartesian3.fromDegrees(116.45519356069228, 39.907939889911766, 50.0));
        setTimeout(() => {
            this._layers.msg('发现警情,开始上报 ', {
                time: 2500,
            });
        }, 1500)

        if (typeof callback === 'function') {

            setTimeout(() => {

                callback()
            }, 3000)
        } else {


            // update state
            this._state = this._STATECODE.one
        }
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
 * 添加gif投影
 */
D3.prototype.addGIF = function () {


}
/**
 * add SscenPoi
 * @param {*} callback 
 */
D3.prototype.addScenePoi = function () {

    //添加wf分析
    new Promise(() => {

        var polygons = [
            116.45832036972357, 39.90785184009239,
            116.46008302424642, 39.90779269034959,
            116.4600574170137, 39.90742841511326,
            116.45832598138692, 39.90749192588316,
            116.45832270718077, 39.907870482146116]
        this._viewer.entities.add({
            name: '水积危房1',
            polygon: {
                hierarchy: Cesium.Cartesian3.fromDegreesArray(polygons),
                height: 5.0,
                extrudedHeight: 28,
                material: Cesium.Color.DODGERBLUE.withAlpha(0.8),
            },
            clampToS3M: true // 贴在S3M模型表面
        });
        var polygons2 = [
            116.46033648258963, 39.907590926962456,
            116.46129931187046, 39.907591510864066,
            116.46128265102404, 39.90740679217774,
            116.46028574603736, 39.90740715321753,
            116.4603101869509, 39.90759276315391]
        this._viewer.entities.add({
            name: '水积危房2',
            polygon: {
                hierarchy: Cesium.Cartesian3.fromDegreesArray(polygons2),
                height: 5.0,
                extrudedHeight: 25,
                material: Cesium.Color.DODGERBLUE.withAlpha(0.8),
            },
            clampToS3M: true // 贴在S3M模型表面
        });
    })


    var createPoi = (position, opt) => {

        this._viewer.entities.add(this._util.createPoint({
            name: opt.name || "poi",
            position: position,
            lable: false,
            point: false,
            billboard: {
                b_img: opt.img,
                b_width: opt.width,
                b_height: opt.height,
                b_scale: 2.0
            }
        }))
    }

    // poi
    new Promise(() => {
        //sd
        createPoi(Cesium.Cartesian3.fromDegrees(116.45669105323857, 39.911397581791995, 10.0), {
            img: 'examples/images/tubiao/sd.png',
            width: 45, height: 100
        })
        createPoi(Cesium.Cartesian3.fromDegrees(116.45666073752497, 39.90997349421138, 10.0), {
            img: 'examples/images/tubiao/sd.png',
            width: 45, height: 100
        })
        createPoi(Cesium.Cartesian3.fromDegrees(116.4568083349959, 39.910538467967825, 10.0), {
            img: 'examples/images/tubiao/sd.png',
            width: 45, height: 100
        })
        //jg
        createPoi(Cesium.Cartesian3.fromDegrees(116.4560313499617, 39.90589164230822, 15.0), {
            img: 'examples/images/tubiao/jg.png',
            width: 40, height: 40
        })
        createPoi(Cesium.Cartesian3.fromDegrees(116.45588535013466, 39.90449856355097, 15.0), {
            img: 'examples/images/tubiao/jg.png',
            width: 40, height: 40
        })
        createPoi(Cesium.Cartesian3.fromDegrees(116.45793483031368, 39.90611176311706, 80.0), {
            img: 'examples/images/tubiao/jg.png',
            width: 40, height: 40
        })

        //ry
        createPoi(Cesium.Cartesian3.fromDegrees(116.45722914494833, 39.90924208041163, 10.0), {
            img: 'examples/images/tubiao/ry.png',
            width: 45, height: 100
        })
        createPoi(Cesium.Cartesian3.fromDegrees(116.45645128753081, 39.908746948369924, 10.0), {
            img: 'examples/images/tubiao/ry.png',
            width: 45, height: 100
        })

        //pld
        createPoi(Cesium.Cartesian3.fromDegrees(116.45900955401129, 39.906160603736545, 100.0), {
            img: 'examples/images/tubiao/pld.png',
            width: 40, height: 40
        })
        createPoi(Cesium.Cartesian3.fromDegrees(116.4577681089553, 39.906037180074776, 100.0), {
            img: 'examples/images/tubiao/pld.png',
            width: 40, height: 40
        })

        //dwd
        createPoi(Cesium.Cartesian3.fromDegrees(116.45671398572762, 39.90866538941974, 10.0), {
            img: 'examples/images/tubiao/dwd.png',
            width: 50, height: 100
        })
        // wf
        createPoi(Cesium.Cartesian3.fromDegrees(116.45930230383246, 39.907553204871384, 40.0), {
            img: 'examples/images/tubiao/wf.png',
            width: 70, height: 70
        })
        createPoi(Cesium.Cartesian3.fromDegrees(116.4608142390859, 39.90758194627311, 40.0), {
            img: 'examples/images/tubiao/wf.png',
            width: 70, height: 70
        })
        //xf队
        createPoi(Cesium.Cartesian3.fromDegrees(116.46084315526306, 39.90644548601654, 60.0), {
            img: 'examples/images/tubiao/xf.png',
            width: 70, height: 70
        })
        //医院
        createPoi(Cesium.Cartesian3.fromDegrees(116.45440767444312, 39.912441176647235, 160.0), {
            img: 'examples/images/tubiao/yy.png',
            width: 70, height: 70
        })
        //sp
        createPoi(Cesium.Cartesian3.fromDegrees(116.45858897549718, 39.912762458453, 10.0), {
            name: 'sp_poi',
            img: 'examples/images/tubiao/sp.png',
            width: 45, height: 100
        })
        createPoi(Cesium.Cartesian3.fromDegrees(116.46267620106681, 39.91112095889442, 10.0), {
            name: 'sp_poi',
            img: 'examples/images/tubiao/sp.png',
            width: 45, height: 100
        })
        createPoi(Cesium.Cartesian3.fromDegrees(116.4568148946942, 39.90762194028029, 10.0), {
            name: 'sp_poi',
            img: 'examples/images/tubiao/sp.png',
            width: 45, height: 100
        })
        createPoi(Cesium.Cartesian3.fromDegrees(116.45405521475386, 39.90863209944678, 10.0), {
            name: 'sp_poi',
            img: 'examples/images/tubiao/sp.png',
            width: 45, height: 100
        })
        createPoi(Cesium.Cartesian3.fromDegrees(116.45320761316253, 39.91114404604288, 10.0), {
            name: 'sp_poi',
            img: 'examples/images/tubiao/sp.png',
            width: 45, height: 100
        })
        createPoi(Cesium.Cartesian3.fromDegrees(116.45730235722372, 39.90430859680193, 10.0), {
            name: 'sp_poi',
            img: 'examples/images/tubiao/sp.png',
            width: 45, height: 100
        })
        createPoi(Cesium.Cartesian3.fromDegrees(116.45338796008663, 39.90963988688982, 10.0), {
            name: 'sp_poi',
            img: 'examples/images/tubiao/sp.png',
            width: 45, height: 100
        })
        createPoi(Cesium.Cartesian3.fromDegrees(116.44993810632482, 39.908157671219364, 10.0), {
            name: 'sp_poi',
            img: 'examples/images/tubiao/sp.png',
            width: 45, height: 100
        })
        createPoi(Cesium.Cartesian3.fromDegrees(116.45003445873462, 39.90693935110989, 10.0), {
            name: 'sp_poi',
            img: 'examples/images/tubiao/sp.png',
            width: 45, height: 100
        })
        createPoi(Cesium.Cartesian3.fromDegrees(116.4528482044692, 39.909721312351174, 10.0), {
            name: 'sp_poi',
            img: 'examples/images/tubiao/sp.png',
            width: 45, height: 100
        })
        createPoi(Cesium.Cartesian3.fromDegrees(116.45435191318097, 39.90663708268492, 10.0), {
            name: 'sp_poi',
            img: 'examples/images/tubiao/sp.png',
            width: 45, height: 100
        })
        createPoi(Cesium.Cartesian3.fromDegrees(116.45396502736591, 39.905298939595504, 10.0), {
            name: 'sp_poi',
            img: 'examples/images/tubiao/sp.png',
            width: 45, height: 100
        })
        createPoi(Cesium.Cartesian3.fromDegrees(116.4549580188815, 39.904418684256335, 10.0), {
            name: 'sp_poi',
            img: 'examples/images/tubiao/sp.png',
            width: 45, height: 100
        })
        createPoi(Cesium.Cartesian3.fromDegrees(116.4592829522402, 39.905274494853394, 10.0), {
            name: 'sp_poi',
            img: 'examples/images/tubiao/sp.png',
            width: 45, height: 100
        })
        createPoi(Cesium.Cartesian3.fromDegrees(116.45974687684065, 39.9085656951856, 10.0), {
            name: 'sp_poi',
            img: 'examples/images/tubiao/sp.png',
            width: 45, height: 100
        })
        createPoi(Cesium.Cartesian3.fromDegrees(116.45960512504493, 39.911474258022885, 10.0), {
            name: 'sp_poi',
            img: 'examples/images/tubiao/sp.png',
            width: 45, height: 100
        })
        //环保车
        createPoi(Cesium.Cartesian3.fromDegrees(116.45325182695842, 39.9151502037859, 10.0), {
            img: 'examples/images/tubiao/hwcl.png',
            width: 45, height: 100
        })
        createPoi(Cesium.Cartesian3.fromDegrees(116.45149846412706, 39.913310450551016, 10.0), {
            img: 'examples/images/tubiao/hwcl.png',
            width: 45, height: 100
        })
        createPoi(Cesium.Cartesian3.fromDegrees(116.45960065435106, 39.91218017793971, 10.0), {
            img: 'examples/images/tubiao/hwcl.png',
            width: 45, height: 100
        })
        //nsh
        createPoi(Cesium.Cartesian3.fromDegrees(116.46123199902998, 39.910817055402354, 10.0), {
            img: 'examples/images/tubiao/nsh.png',
            width: 50, height: 55
        })
    })

    new Promise(() => {
        //hbc
        createPoi(Cesium.Cartesian3.fromDegrees(116.44829610268147, 39.90927192663597, 10.0), {
            img: 'examples/images/tubiao/hwcl.png',
            width: 45, height: 100
        })
        createPoi(Cesium.Cartesian3.fromDegrees(116.44819702819991, 39.91268979123868, 10.0), {
            img: 'examples/images/tubiao/hwcl.png',
            width: 45, height: 100
        })
        //sp
        createPoi(Cesium.Cartesian3.fromDegrees(116.45961833826807, 39.914694406537826, 10.0), {
            name: 'sp_poi',
            img: 'examples/images/tubiao/sp.png',
            width: 45, height: 100
        })
        createPoi(Cesium.Cartesian3.fromDegrees(116.46079414168497, 39.91347942147227, 10.0), {
            name: 'sp_poi',
            img: 'examples/images/tubiao/sp.png',
            width: 45, height: 100
        })
        //dwd
        createPoi(Cesium.Cartesian3.fromDegrees(116.46287268715398, 39.91377252581139, 10.0), {
            img: 'examples/images/tubiao/dwd.png',
            width: 50, height: 100
        })
        createPoi(Cesium.Cartesian3.fromDegrees(116.46391907950293, 39.911964802588074, 10.0), {
            img: 'examples/images/tubiao/dwd.png',
            width: 50, height: 100
        })
        //pld
        createPoi(Cesium.Cartesian3.fromDegrees(116.4670647264791, 39.911346271925865, 100.0), {
            img: 'examples/images/tubiao/pld.png',
            width: 40, height: 40
        })
        createPoi(Cesium.Cartesian3.fromDegrees(116.4682932586249, 39.90853544254255, 100.0), {
            img: 'examples/images/tubiao/pld.png',
            width: 40, height: 40
        })
        //sd
        createPoi(Cesium.Cartesian3.fromDegrees(116.46496119021847, 39.90738111404474, 10.0), {
            img: 'examples/images/tubiao/sd.png',
            width: 45, height: 100
        })
        createPoi(Cesium.Cartesian3.fromDegrees(116.46550988200447, 39.915742494309704, 10.0), {
            img: 'examples/images/tubiao/sd.png',
            width: 45, height: 100
        })

    })

}

/**
 * 
 * 警情核检
 */
D3.prototype.startSceneOne = function (callback) {


    if (this._STATECODE.one !== this._state & this._STATECODE.all !== this._state) {

        this._layers.msg('请先预览完警情上报 ', {
            time: 3000,
        });
        return false
    }
    this._viewer.scene.camera.stopFlyCircle();

    // 结束扫描
    this._scene.postProcessStages.remove(this._radarScan)

    this.postProcess.push(this._util.setCircleScanEffect({
        position: Cesium.Cartesian3.fromDegrees(116.45653937176488, 39.908769995842434, 10.0),
        color: Cesium.Color.RED.withAlpha(0.8),
        radius: 530,
        circleMode: 'Circle',
        border: 30
    }))

    this._util.setView({
        position: { x: -2179743.7613028353, y: 4380161.175350372, z: 4094944.220205319 },
        orientation: {
            heading: Cesium.Math.toRadians(180.87973154786394),
            pitch: Cesium.Math.toRadians(-43.08469321885954),
            roll: Cesium.Math.toRadians(359.9999999998978)
        }
    })

    this.addHeightLineLight({
        positions: {
            startPoint: Cesium.Cartesian3.fromDegrees(116.45653937176488, 39.908769995842434, 5.0),
            endPoint: Cesium.Cartesian3.fromDegrees(116.45653937176488, 39.908769995842434, 1000.0)
        },
        color: Cesium.Color.RED,
        duration: 600,
        width: 50
    })

    setTimeout(() => {

        this._css3Renderer = new Cesium.Css3Renderer([], true)
        this.createCss3Renderer({
            obj: this._css3Renderer,
            css3Elements: [],
            position: [116.45653937176488, 39.908769995842434, 40.0],
            id: "labelTip",
            div: ` <div class='main' style="font-size:14px">
                <div class="" style="color:#ff9800">警情核检</div>
                <div class="">事件类型：路面积水</div>
                <div class="">事件等级：一般防汛突发事件</div>
                <div class="">事件地点：北京海淀学院路某某路段</div>
                <div class="">积水水位：50cm</div>
                <div class="">拥堵时常：30分钟</div>
                <div class=""> 拥堵里程：5公里</div>
            </div>`
        })

        if (typeof callback === 'function') {

            setTimeout(() => {

                callback()
            }, 3000)
        } else {

            // update state
            this._state = this._STATECODE.tow
        }
    }, 2000)

    //异常提示
    new Promise((resolve, reject) => {

        this.addDynamicEntity({
            position: Cesium.Cartesian3.fromDegrees(116.45653937176488, 39.908769995842434, 40.0),
            model: { lng: 116.45653937176488, lat: 39.908769995842434, alt: 40.0 },
            m_color: Cesium.Color.RED.withAlpha(0.3),
            label: true,
            billboard: true,
            text: ' 积水区 ',
            l_font: '14px sans-serif',
            l_fillColor: Cesium.Color.RED,
            l_backgroundColor: Cesium.Color.RED,
            l_pixelOffset: new Cesium.Cartesian2(0, -5),
            l_showBackground: false
        })

        var cricleEntity = this._util.createDynamicCricle({
            center: { lng: 116.45653937176488, lat: 39.908769995842434, alt: 30.0 },
            material: new Cesium.CircleWaveMaterialProperty({
                color: Cesium.Color.DODGERBLUE.withAlpha(0.5),
                count: 1,
                gradient: 2
            }),
            height: 6,
            radius: 80,
            rotateAmount: 0.01
        })
        this._viewer.entities.add(cricleEntity)

    })

    // 模拟效果
    new Promise((resolve, reject) => {
        // var startPoints = Cesium.Cartesian3.fromDegrees(116.45978903715125, 39.909967349088184, 0.0)
        // //添加喷泉线
        // this.addRadianLineLight(
        //     { startPoint: startPoints, endPoint: Cesium.Cartesian3.fromDegrees(116.46195406341593, 39.91094409159383, 0.0) },
        //     Cesium.Color.GREEN
        // )
        // this.addRadianLineLight(
        //     { startPoint: startPoints, endPoint: Cesium.Cartesian3.fromDegrees(116.46206023716306, 39.90898705744692, 0.0) },
        //     Cesium.Color.CYAN
        // )
        // this.addRadianLineLight(
        //     { startPoint: startPoints, endPoint: Cesium.Cartesian3.fromDegrees(116.46104588082288, 39.90812655886341, 0.0) },
        //     Cesium.Color.RED
        // )
        // this.addRadianLineLight(
        //     { startPoint: startPoints, endPoint: Cesium.Cartesian3.fromDegrees(116.4603152846996, 39.90827157210838, 0.0) },
        //     Cesium.Color.BLUE
        // )
        // this.addRadianLineLight(
        //     { startPoint: startPoints, endPoint: Cesium.Cartesian3.fromDegrees(116.45971631099688, 39.909261924687186, 0.0) },
        //     Cesium.Color.DARKGOLDENROD
        // )
        // this.addRadianLineLight(
        //     { startPoint: startPoints, endPoint: Cesium.Cartesian3.fromDegrees(116.45798267562319, 39.909457432765144, 0.0) },
        //     Cesium.Color.DARKGOLDENROD
        // )
        // this.addRadianLineLight(
        //     { startPoint: startPoints, endPoint: Cesium.Cartesian3.fromDegrees(116.45751184970148, 39.91041377321747, 0.0) },
        //     Cesium.Color.CHARTREUSE
        // )

        //添加火焰粒子
        // this.primitives.push(this._util.setFlameParticle({
        //     position: Cesium.Cartesian3.fromDegrees(116.4499827986952, 39.91231248171688, 0),
        //     tx: 0, ty: 0, tz: 50
        // }))

        // this.primitives.push(this._util.setFlameParticle({
        //     position: Cesium.Cartesian3.fromDegrees(116.45045144518653, 39.91234434075017, 0),
        //     tx: 0, ty: 0, tz: 50
        // }))

        //添加人群
        this._viewer.entities.add(this._util.createModel({
            position: Cesium.Cartesian3.fromDegrees(116.45675806903022, 39.908995164952024, 5.0),
            m_url: 'examples/SampleData/gltf/man/walk.gltf',
            m_scale: 5,
            m_minimumPixelSize: 1,
        }))

        this._viewer.entities.add(this._util.createModel({
            position: Cesium.Cartesian3.fromDegrees(116.45684383695955, 39.908801443430725, 5.0),
            m_url: 'examples/SampleData/gltf/man/walk.gltf',
            m_scale: 5,
            m_minimumPixelSize: 1,
        }))

        this._viewer.entities.add(this._util.createModel({
            position: Cesium.Cartesian3.fromDegrees(116.4568890909305, 39.9089246036833, 5.0),
            m_url: 'examples/SampleData/gltf/man/walk.gltf',
            m_scale: 5,
            m_minimumPixelSize: 1,
        }))

    })

}

/**
 * 警情分析
 */
D3.prototype.analysis = function (callback) {

    if (this._STATECODE.tow !== this._state & this._STATECODE.all !== this._state) {

        this._layers.msg('请先预览完警情核检', {
            time: 3000,
        });
        return false
    }
    this._viewer.scene.camera.stopFlyCircle();

    this._util.flyTo({
        position: { x: -2179781.8524815417, y: 4380237.37825123, z: 4094594.4845340946 },
        orientation: {
            heading: Cesium.Math.toRadians(180.3003461104832),
            pitch: Cesium.Math.toRadians(-45.14166071112787),
            roll: Cesium.Math.toRadians(359.99999999989956)
        },
        duration: 3,
        callback: () => {

            new Promise(() => {
                // 生成热力图
                let positions = [
                    Cesium.Cartesian3.fromDegrees(116.45413232805781, 39.90698609371323),
                    Cesium.Cartesian3.fromDegrees(116.45836054704175, 39.90968606663888)
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
            })
            new Promise(() => {

                // 警示线特效
                var warn = [
                    116.45755736766952, 39.90809492598753, 20.0,
                    116.45735283559044, 39.90925555782646, 20.0,
                    116.45596880548985, 39.90972646589405, 20.0,
                    116.45552536524886, 39.90794412380459, 20.0,
                    116.4576341352662, 39.90787664499053, 20.0,
                    116.45755736766952, 39.90809492598753, 20.0,
                ]

                this._viewer.entities.add({
                    wall: {
                        positions: Cesium.Cartesian3.fromDegreesArrayHeights(warn),
                        material: new Cesium.WarnLinkMaterialProperty({ freely: 'cross', color: Cesium.Color.YELLOW, duration: 1000, count: 1.0, direction: '-' }),
                    }
                });
            })

            //  this._viewer.scene.camera.speedRatio = 0.1
            //  this._viewer.scene.camera.flyCircle(Cesium.Cartesian3.fromDegrees(116.45653937176488, 39.908769995842434, 40.0));

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
 * 启动预案
 */
D3.prototype.plan = function (callback) {

    if (this._STATECODE.three !== this._state & this._STATECODE.all !== this._state) {

        this._layers.msg('请先预览完警情分析 ', {
            time: 3000,
        });
        return false
    }
    this._entitys = []
    let qiche = this._util.createModel({
        position: Cesium.Cartesian3.fromDegrees(116.45607312664649, 39.9121358435351, 5.0),
        m_url: 'examples/data/model/qiche.gltf',
        m_scale: 0.3,
        m_minimumPixelSize: 1,
    })

    qiche.orientation = Cesium.Transforms.headingPitchRollQuaternion(
        Cesium.Cartesian3.fromDegrees(116.45607312664649, 39.9121358435351, 5.0),
        new Cesium.HeadingPitchRoll(
            Cesium.Math.toRadians(100),
            Cesium.Math.toRadians(360),
            Cesium.Math.toRadians(0)
        )
    )
    // 汽车
    this._entitys.push(this._viewer.entities.add(qiche))

    this._util.setView({
        position: { x: -2179519.0711717005, y: 4379867.300730431, z: 4092606.9069921337 },
        orientation: {
            heading: Cesium.Math.toRadians(180.87919456115637),
            pitch: Cesium.Math.toRadians(-31.997727902909617),
            roll: Cesium.Math.toRadians(359.9999999999939)
        }
    })


    setTimeout(() => {

        this._css3Renderer4 = new Cesium.Css3Renderer([], true)
        this.createCss3Renderer({
            obj: this._css3Renderer4,
            css3Elements: [],
            position: [116.45607312664649, 39.9121358435351, 10.0],
            id: "msg",
            div: `<div class='main' style="font-size:14px">
                    <div class="" style="color:#ff9800">收到接警任务！</div>
                <div class=""> 目的地：海淀科技大厦</div>
                <div class=""> 警力：医疗车 1,消防车 1,物资车 1</div>
                <div class=""> 时间：要求10分钟以内抵达任务现场</div>
            </div>`
        })

        // 规划路线
        setTimeout(() => {

            this._util.flyTo({
                position: { x: -2179743.7613028353, y: 4380161.175350372, z: 4094944.220205319 },
                orientation: {
                    heading: Cesium.Math.toRadians(180.87973154786394),
                    pitch: Cesium.Math.toRadians(-43.08469321885954),
                    roll: Cesium.Math.toRadians(359.9999999998978)
                },
                duration: 3,
                callback: () => {

                    this.pathAnalyzie(callback)
                }

            })

        }, 4000)

    }, 2000)
}

D3.prototype.pathAnalyzie = function (callback) {

    // 路径
    var path = [{ lon: 116.45607312664649, lat: 39.9121358435351, alt: 5.0, time: 0 },
    { lon: 116.45600377014046, lat: 39.90975950102955, alt: 5.0, time: 120 },
    { lon: 116.4563770218395, lat: 39.90843858828053, alt: 5.0, time: 240 },
    { lon: 116.45753920665264, lat: 39.90850141256513, alt: 5.0, time: 360 },
    { lon: 116.45753920665264, lat: 39.90850141256513, alt: 5.0, time: 480 },
    { lon: 116.45753920665264, lat: 39.90850141256513, alt: 5.0, time: 600 }]

    // 规划
    new Promise(() => {

        this._entitys.push(this._util.addMaterialLine({
            positions: this._util.transformWGS84ArrayToCartesianArray(path),
            width: 70,
            material: new Cesium.PolylineCityLinkMaterialProperty({
                color: Cesium.Color.YELLOW,
                duration: 5000
            }),
            clampToGround: true
        }))
        this._entitys.push(this._util.addMaterialLine({

            positions: this._util.transformWGS84ArrayToCartesianArray([
                { lon: 116.45607312664649, lat: 39.9121358435351, alt: 6.0 },
                { lon: 116.45600377014046, lat: 39.90975950102955, alt: 6.0 },
            ]),
            width: 30,
            material: Cesium.Color.RED.withAlpha(0.5),
            clampToGround: true
        }))

        let bentity = this._util.createEntity()
        bentity.position = Cesium.Cartesian3.fromDegrees(116.4559593640262, 39.909871063343566, 10.0)
        bentity.billboard = this._util.getBillboard({
            b_img: 'examples/images/Textures/warn.png',
            b_width: 80,
            b_height: 80,
            b_pixelOffset: new Cesium.Cartesian2(0, -100)

        })
        this._entitys.push(this._viewer.entities.add(bentity))
        let qiche2 = this._util.createModel({
            position: Cesium.Cartesian3.fromDegrees(116.4559593640262, 39.909871063343566, 5.0),
            m_url: 'examples/data/model/qiche.gltf',
            m_scale: 0.2,
            m_minimumPixelSize: 1,
        })
        qiche2.orientation = Cesium.Transforms.headingPitchRollQuaternion(
            Cesium.Cartesian3.fromDegrees(116.45607312664649, 39.9121358435351, 5.0),
            new Cesium.HeadingPitchRoll(
                Cesium.Math.toRadians(100),
                Cesium.Math.toRadians(360),
                Cesium.Math.toRadians(0)
            )
        )
        this._entitys.push(this._viewer.entities.add(qiche2))

        let qiche3 = this._util.createModel({
            position: Cesium.Cartesian3.fromDegrees(116.45599344936372, 39.90995529263869, 5.0),
            m_url: 'examples/data/model/qiche.gltf',
            m_scale: 0.2,
            m_minimumPixelSize: 1,
        })
        qiche3.orientation = Cesium.Transforms.headingPitchRollQuaternion(
            Cesium.Cartesian3.fromDegrees(116.45607312664649, 39.9121358435351, 5.0),
            new Cesium.HeadingPitchRoll(
                Cesium.Math.toRadians(100),
                Cesium.Math.toRadians(360),
                Cesium.Math.toRadians(0)
            )
        )
        this._entitys.push(this._viewer.entities.add(qiche3))
    })

    // 规划 2
    new Promise(() => {
        var paths3 = [
            { lon: 116.45607599287338, lat: 39.91211052696586, alt: 5.0, time: 0 },
            { lon: 116.46343018628019, lat: 39.912178743752165, alt: 5.0, time: 120 },
            { lon: 116.4634261354027, lat: 39.90698393946382, alt: 5.0, time: 240 },
            { lon: 116.4578395763206, lat: 39.90711011075553, alt: 5.0, time: 360 },
            { lon: 116.45782254964705, lat: 39.9083739589879, alt: 5.0, time: 480 }]

        this._entitys.push(this._util.addMaterialLine({
            positions: this._util.transformWGS84ArrayToCartesianArray(paths3),
            width: 90,
            material: new Cesium.PolylineCityLinkMaterialProperty({
                color: Cesium.Color.GREEN,
                duration: 2000
            }),
            clampToGround: true
        }))
    })

    setTimeout(() => {

        this._layers.msg('A路段车险拥堵耗时15分钟,B路线上班时段路况良好耗时5分钟', {
            time: 1500,
        });

    }, 1500)

    setTimeout(() => {
        // 弹出结果信息
        this._layers.open({
            type: 1
            , title: false
            , closeBtn: 1
            , shade: false
            , shadeClose: true
            , anim: 2
            , area: ['500px', '400px']
            , offset: 'auto'
            , content: `<div style="color:white"><h2 style="text-align:center;padding:10px">接警预案</h2>
            <div style="font-size:15px;padding:14px">
            <p style="padding-bottom:20px"> 接警预案如下:</p>
            <p> 路径规划AB两条最近路线,分别对比</p>
            <p> 路况</p>
            <p></p>
            <p> A 路线: 半小时前发生车辆碰撞，路段较为拥堵;</p>
            <p> B 路线: 上班时间较少车辆,路况较为通畅;</p>
            <p></p>
            <p> 时间</p>
            <p> A 路线: 拥堵路段通行预计10分钟,到达任务现场预计20分钟</p>
            <p> B 路线: 全程通畅,到达时间预计5分钟以内</p>
            </div></div>`
            , btn: ['确认']
            , btn1: () => {
                layer.closeAll();
            },
            end: () => {
                if (typeof callback === 'function') {

                    setTimeout(() => {

                        callback()

                    }, 1000)

                } else {
                    // update state
                    this._state = this._STATECODE.four
                }
            }

        });
    }, 5000)

}

D3.prototype.scheduling = function () {

    if (this._STATECODE.four !== this._state & this._STATECODE.all !== this._state) {

        this._layers.msg('请先预览完启动预案 ', {
            time: 3000,
        });
        return false
    }

    if (this._entitys) {

        this._entitys.forEach(entity => this._viewer.entities.remove(entity))

        if (this._css3Renderer4) this._css3Renderer4.removeEntityLayer('msg')

        this._css3Renderer4 = undefined
    }
    //街道漫游
    this._viewer.scene.camera.stopFlyCircle();
    // 救护车
    var paths = [{ lon: 116.46241198522928, lat: 39.907148889182075, alt: 5.0, time: 0 },
    { lon: 116.46043835981496, lat: 39.907158880417825, alt: 5.0, time: 120 },
    { lon: 116.45816578316938, lat: 39.90728678537851, alt: 5.0, time: 240 },
    { lon: 116.45763480348734, lat: 39.908564297125224, alt: 5.0, time: 360 },
    { lon: 116.45763480348734, lat: 39.908564297125224, alt: 5.0, time: 480 },
    { lon: 116.45763480348734, lat: 39.908564297125224, alt: 5.0, time: 600 }]

    // xf车
    var paths2 = [{ lon: 116.45607599287338, lat: 39.91211052696586, alt: 5.0, time: 0 },
    { lon: 116.46343018628019, lat: 39.912178743752165, alt: 5.0, time: 120 },
    { lon: 116.4634261354027, lat: 39.90698393946382, alt: 5.0, time: 240 },
    { lon: 116.4578395763206, lat: 39.90711011075553, alt: 5.0, time: 360 },
    { lon: 116.45782254964705, lat: 39.9083739589879, alt: 5.0, time: 480 },
    { lon: 116.45782254964705, lat: 39.9083739589879, alt: 5.0, time: 600 }]
    //
    var paths3 = [
        { lon: 116.4516363100139, lat: 39.9073513899446, alt: 5.0, time: 0 },
        { lon: 116.45473873371758, lat: 39.907340835782044, alt: 5.0, time: 120 },
        { lon: 116.45746586850883, lat: 39.90728376446731, alt: 5.0, time: 240 },
        { lon: 116.45746586850883, lat: 39.90728376446731, alt: 5.0, time: 360 },
        { lon: 116.4574429358174, lat: 39.907926330171534, alt: 5.0, time: 480 },
        { lon: 116.4574429358174, lat: 39.907926330171534, alt: 5.0, time: 600 }]

    // 添加车辆
    new Promise(() => {

        // this._xfcEntity = this._util.setPathRoaming({
        //     paths: paths,
        //     model: true,
        //     m_url: 'examples/data/model/qiche.gltf',
        //     m_scale: 0.3,
        //     m_minimumPixelSize: 1,
        //     label: true,
        //     l_text: '消防车',
        //     l_pixelOffset: new Cesium.Cartesian2(52, -48),
        //     l_fillColor: Cesium.Color.WHITE,
        //     l_outlineWidth: 3,
        //     billboard: true,
        //     b_img: 'examples/images/Textures/bp2.png',
        //     b_width: 55,
        //     b_height: 80,
        //     b_scale: 2,
        //     b_pixelOffset: new Cesium.Cartesian2(30, 0)
        // })
        this._jhcEntity = this._util.setPathRoaming({
            paths: paths2,
            model: true,
            m_url: 'examples/data/model/qiche.gltf',
            m_scale: 0.3,
            m_minimumPixelSize: 1,
            label: true,
            l_text: '救护车',
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

        this._wzcEntity = this._util.setPathRoaming({
            paths: paths3,
            model: true,
            m_url: 'examples/data/model/qiche.gltf',
            m_scale: 0.3,
            m_minimumPixelSize: 1,
            label: true,
            l_text: '物资车',
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
        this._viewer.clock.multiplier = 15;
    })
    this._viewer.clock.shouldAnimate = false

    // 添加街道警示线
    var warn2 = [
        116.45602593719212, 39.912290797702546, 20.0,
        116.45524556327449, 39.91233303051379, 20.0
    ]
    this._viewer.entities.add({
        wall: {
            positions: Cesium.Cartesian3.fromDegreesArrayHeights(warn2),
            material: new Cesium.WarnLinkMaterialProperty({ freely: 'cross', color: Cesium.Color.YELLOW, duration: 1000, count: 1.0, direction: '-' }),
        }
    });


    // 创建动画信息框
    this._css3Renderer5 = new Cesium.Css3Renderer([], true)
    this.createCss3Renderer({
        obj: this._css3Renderer5,
        css3Elements: [],
        position: [116.45607599287338, 39.91211052696586, 10.0],
        id: "msg2",
        div: `<div class='main' style="font-size:14px">
                <div class="" style="color:#ff9800">物资车开始任务！ </div>
            <div class=""> 地点：海淀科技大厦</div>
            <div class=""> 时间：预计20分钟抵达现场</div>
        </div>`
    })

    // 任务中
    setTimeout(() => {
        // start
        this._viewer.clock.shouldAnimate = true

        // 调整粒子
        // if(this.primitives.length > 0){
        
        //     this.primitives[0].show = false
        // }

        // remove 
        if (this._css3Renderer5) this._css3Renderer5.removeEntityLayer('msg2')
        this._css3Renderer5 = undefined

        // 引导线
        new Promise(() => {
            // this._util.addMaterialLine({
            //     positions: this._util.transformWGS84ArrayToCartesianArray(paths),
            //     width: 90,
            //     material: new Cesium.PolylineCityLinkMaterialProperty({
            //         color: Cesium.Color.RED,
            //         duration: 20000
            //     }),
            //     clampToGround: true
            // })

            this._util.addMaterialLine({
                positions: this._util.transformWGS84ArrayToCartesianArray(paths2),
                width: 90,
                material: new Cesium.PolylineCityLinkMaterialProperty({
                    color: Cesium.Color.GREEN,
                    duration: 20000
                }),
                clampToGround: true
            })
            this._util.addMaterialLine({
                positions: this._util.transformWGS84ArrayToCartesianArray(paths3),
                width: 90,
                material: new Cesium.PolylineCityLinkMaterialProperty({
                    color: Cesium.Color.GREEN,
                    duration: 20000
                }),
                clampToGround: true
            })
        })
        // 聚焦

        setTimeout(() => {

            addMan() // 添加xf员

            // 弹出结果信息
            setTimeout(() => {
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
                                        <p style="padding-bottom:20px"> 海淀地区某街道于29日下午发生水积情况,报告如下:</p>
                                        <p>原因:    由于连续一周暴雨天,造成该地区排水系统承压过载;</p>
                                        <p>损失:    该地区部分一层商户有货物侵水导致无货售卖;</p>
                                        <p>出警:    接警后10分钟救护车与xf车到达现场,10分钟救险;</p>
                                        <p>伤亡:    无伤亡,2人轻伤.</p>
                                        </div></div>`
                    , btn: ['确认']
                    , btn1: function () {
                        layer.closeAll();
                    }
                });
            }, 1500)
        }, 33000)

    }, 3000)


    var addMan = () => {

        this._viewer.clock.multiplier = 1.0
        this._viewer.entities.add(this._util.createModel({
            position: Cesium.Cartesian3.fromDegrees(116.4567346604242, 39.908572218282316, 5.0),
            m_url: 'examples/data/model/xiaofangyuan-run.gltf',
            m_scale: 10,
            m_minimumPixelSize: 1,
        }))
        

        this._viewer.entities.add(this._util.createModel({
            position: Cesium.Cartesian3.fromDegrees(116.45693141468111, 39.908452908231915, 5.0),
            m_url: 'examples/data/model/xiaofangyuan-run.gltf',
            m_scale: 10,
            m_minimumPixelSize: 1,
        }))
        //修改汽车状态
        // this._xfcEntity.label.text = '消防车抵达!'
        this._wzcEntity.label.text = '物资车抵达!'
        this._jhcEntity.label.text = '救护车抵达!'

        // this._css3Renderer6 = new Cesium.Css3Renderer([], true)
        // this.createCss3Renderer({
        //     obj: this._css3Renderer6,
        //     css3Elements: [],
        //     position: [116.45763480348734, 39.908564297125224, 10.0],
        //     id: "msg3",
        //     div: `<div class='main' style="font-size:14px">
        //             <div class="" style="color:#ff9800">消防车抵达！ </div>
        //         <div class=""> 地点：海淀科技大厦</div>
        //         <div class=""> 用时：5 分钟</div>
        //     </div>`
        // })

        this._css3Renderer7 = new Cesium.Css3Renderer([], true)

        this.createCss3Renderer({
            obj: this._css3Renderer7,
            css3Elements: [],
            position: [116.4574429358174, 39.907926330171534, 10.0],
            id: "msg4",
            div: `<div class='main' style="font-size:14px">
                    <div class="" style="color:#ff9800">救护车抵达! </div>
                <div class=""> 地点：海淀科技大厦</div>
                <div class=""> 用时：8 分钟</div>
            </div>`
        })

        this._css3Renderer8 = new Cesium.Css3Renderer([], true)
        this.createCss3Renderer({
            obj: this._css3Renderer8,
            css3Elements: [],
            position: [116.45774327003204, 39.90839174767998, 10.0],
            id: "msg5",
            div: `<div class='main' style="font-size:14px">
                    <div class="" style="color:#ff9800">物资车抵达！ </div>
                <div class=""> 地点：海淀科技大厦</div>
                <div class=""> 用时：4 分钟</div>
            </div>`
        })

        // this._viewer.clock.shouldAnimate = false

    }
}


D3.prototype.createCss3Renderer = function (param) {

    param.obj.addEntityLayer({
        id: param.id,
        position: param.position,//高度为 boxHeightMax
        element: `<div class='ysc-dynamic-layer ys-css3-box' id='` + param.id + `'>
               <div class='line'></div>
               `+ param.div + `
           </div>`,
        offset: [10, -250],
        boxShow: false,
        circleShow: false,
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
        this.ambientLightColor = 0.3
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
        this._addScenePoi = function () {

            $this.addScenePoi()
        }
        this._addVideo = function () {

            $this.addVideo()
        }
        this._addGIF = function () {

            $this.addGIF()
        }
        this._addCircle = function () {

            $this.addCircle()
        }
    }

    var menu = gui.addFolder('导航')

    menu.add(menuObj, '_cityRoming').name("城市漫游");
    menu.add(menuObj, '_addPoiData').name("添加POI");
    // menu.add(menuObj, '_addVideo').name("添加视频融合");
    // menu.add(menuObj, '_addScenePoi').name("添加场景POI");
    menu.add(menuObj, '_addPolygon').name("添加矢量面");
    // menu.add(menuObj, '_addCircle').name("添加圆环");
    // menu.add(menuObj, '_addWall').name("添加围栏");
    // menu.add(menuObj, '_addLightScan').name("添加灯光扫描");
    menu.add(menuObj, '_addGIF').name("添加GIF投影");
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
        this._plan = function () {

            $this.plan()
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
    scene1.add(demo, '_monitoring').name("1.警情上报");
    scene1.add(demo, '_scanInfo').name("2.警情核检");
    scene1.add(demo, '_analysis').name("3.警情分析");
    scene1.add(demo, '_plan').name("4.启动预案");
    scene1.add(demo, '_scheduling').name("5.统一指挥");
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
