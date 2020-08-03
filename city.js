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

        d3map.init(); //d3map.initGUI()

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

    this._state = undefined

    this._util = undefined
}

/**
 * 初始化
 */
D3.prototype.init = function (opt = {}) {

    if (configs.mapDom && configs.mapUrl) {

        Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlYTQ2ZjdjNS1jM2E0LTQ1M2EtOWM0My1mODMzNzY3YjYzY2YiLCJpZCI6MjkzMjcsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1OTE5NDIzNjB9.RzKlVTVDTQ9r7cqCo-PDydgUh8Frgw0Erul_BVxiS9c';

        this._viewer = new Cesium.Viewer(configs.mapDom, configs.mapOptions);

        this._util = new Cesium.Utils(this._viewer)

        this._viewer.imageryLayers.addImageryProvider(new Cesium.MapboxImageryProvider({
            mapId: 'mapbox.dark'
        }))

        this._scene = this._viewer.scene

        this._scene.skyBox = this._util.setTwoGroundSkyBox()

        this._util.setSnowEffect()

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

        //设置环境光
        this._scene.lightSource.ambientLightColor = opt.ambientLightColor || new Cesium.Color(0.08, 0.08, 0.08, 1);

        //深度检测
        // this._scene.globe.depthTestAgainstTerrain = false;

        //地面调节
        //this._scene.globe.baseColor = Cesium.Color.BLACK;
        //this._scene.globe.globeAlpha = 0.1;
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

/**
 * 加载场景
 * 
 * 示例白膜数据
 */
D3.prototype.loadScene = function () {

    if (this._scene) {

        /**
         * 建筑
         */
        var promise = this._scene.open(configs.sceneUrl)

        Cesium.when.all(promise, (layer) => {

            this._util.setView({
                position: Cesium.Cartesian3.fromDegrees(106.6269866033348, 29.53232673901685, 2000),
                orientation: {
                    heading: 350.37060,
                    pitch: -12.75012,
                    roll: 0.00306
                }
            })

            layer[0].style3D.emissionColor = new Cesium.Color(2, 5, 10, 1); //自发光颜色


            this._util.setHypsometric(layer[0])



            this._util.bindFlyCircle(true) //给鼠标绑定旋转操作

        })


        /**
         * 扫描物
         */
        new Promise((resolve, reject) => {

            this._util.setRadarScanEffect({
                position: Cesium.Cartesian3.fromDegrees(106.54439406642704, 29.53412750079538, 10.0),
                color: Cesium.Color.DARKCYAN,
                radius: 500
            })

            this.addWall()
        })



        /**
        * 路网
        */
        new Promise((resolve, reject) => {

            this.addRoadLine("examples/data/json/lineback_1.json")

            this.addRoadLine("examples/data/json/lineback2_1.json")

            this.addRoadLine("examples/data/json/lineback3_1.json")
        })

        /**
         * 路径漫游 
         */
        new Promise((resolve, reject) => {

            var paths = [
                { lon: 106.57003293712452, lat: 29.524797836353418, alt: 0, height: 10000, time: 0 },
                { lon: 106.56383672216968, lat: 29.53146964052541, alt: 0, height: 10000, time: 120 },
                { lon: 106.56144813002342, lat: 29.531134070376954, alt: 0, height: 10000, time: 240 },
                { lon: 106.55416088966606, lat: 29.530970546674276, alt: 0, height: 10000, time: 360 },
                { lon: 106.55414087849685, lat: 29.53383654312555, alt: 0, height: 10000, time: 480 },
                { lon: 106.55414087849685, lat: 29.53383654312555, alt: 0, height: 10000, time: 600 }
            ]
            this._util.setPathRoaming({
                paths: paths,
                model: true,
                m_url: 'examples/data/model/qiche.gltf',
                m_scale: 1,
                m_minimumPixelSize: 1,
                label: true,
                l_text: '任务车辆.1',
                l_pixelOffset: new Cesium.Cartesian2(42, -48),
                l_fillColor: Cesium.Color.WHITE,
                l_outlineWidth: 3,
                billboard: true,
                b_img: 'examples/images/Textures/bp.png',
                b_width: 55,
                b_height: 80,
                b_scale: 2,
                b_pixelOffset: new Cesium.Cartesian2(20, 0)
            })

            var paths2 = [
                { lon: 106.5565907627419, lat: 29.53456446159264, alt: 0, height: 10000, time: 0 },
                { lon: 106.55814221039576, lat: 29.53472126114135, alt: 0, height: 10000, time: 120 },
                { lon: 106.55967343745067, lat: 29.535457923243882, alt: 0, height: 10000, time: 240 },
                { lon: 106.5605585760546, lat: 29.535371534594482, alt: 0, height: 10000, time: 360 },
                { lon: 106.56333275485729, lat: 29.532352521691557, alt: 0, height: 10000, time: 480 },
                { lon: 106.56401603756584, lat: 29.53145981355466, alt: 0, height: 10000, time: 600 },
                { lon: 106.56560417620496, lat: 29.531485540486234, alt: 0, height: 10000, time: 720 },
                { lon: 106.56982272180862, lat: 29.532047070094315, alt: 0, height: 10000, time: 840 }
            ]

            this._util.setPathRoaming({

                paths: paths2,
                model: true,
                m_url: 'examples/data/model/qiche.gltf',
                m_scale: 1,
                m_minimumPixelSize: 1,
                label: true,
                l_text: '任务车辆.2',
                l_pixelOffset: new Cesium.Cartesian2(42, -48),
                l_fillColor: Cesium.Color.WHITE,
                l_outlineWidth: 3,
                billboard: true,
                b_img: 'examples/images/Textures/bp.png',
                b_width: 55,
                b_height: 80,
                b_scale: 2,
                b_pixelOffset: new Cesium.Cartesian2(20, 0)
            })

            var paths3 = [
                { lon: 106.55995243647547, lat: 29.543838865278495, alt: 0, height: 10000, time: 0 },
                { lon: 106.56012297535275, lat: 29.54135878173985, alt: 0, height: 10000, time: 120 },
                { lon: 106.56010025753658, lat: 29.538155717188193, alt: 0, height: 10000, time: 240 },
                { lon: 106.5602143992771, lat: 29.535935972391595, alt: 0, height: 10000, time: 360 },
                { lon: 106.56566297913831, lat: 29.529388590619995, alt: 0, height: 10000, time: 480 },
                { lon: 106.56566297913831, lat: 29.529388590619995, alt: 0, height: 10000, time: 600 }
            ]

            this._util.setPathRoaming({

                paths: paths3,
                model: true,
                m_url: 'examples/data/model/qiche.gltf',
                m_scale: 1,
                m_minimumPixelSize: 1,
                label: true,
                l_text: '任务车辆.3',
                l_pixelOffset: new Cesium.Cartesian2(42, -48),
                l_fillColor: Cesium.Color.WHITE,
                l_outlineWidth: 3,
                billboard: true,
                b_img: 'examples/images/Textures/bp.png',
                b_width: 55,
                b_height: 80,
                b_scale: 2,
                b_pixelOffset: new Cesium.Cartesian2(20, 0)
            })

            var paths4 = [
                { lon: 106.55254218312906, lat: 29.525324292576798, alt: 0, height: 10000, time: 0 },
                { lon: 106.55094702943869, lat: 29.528138996089695, alt: 0, height: 10000, time: 120 },
                { lon: 106.55416687394586, lat: 29.531015366619958, alt: 0, height: 10000, time: 240 },
                { lon: 106.55796107689329, lat: 29.531015366619958, alt: 0, height: 10000, time: 360 },
                { lon: 106.55796107689329, lat: 29.53111995652228, alt: 0, height: 10000, time: 480 },
                { lon: 106.55826360770091, lat: 29.526149944173504, alt: 0, height: 10000, time: 600 },
                { lon: 106.55834657023352, lat: 29.525744009935668, alt: 0, height: 10000, time: 720 },
            ]

            this._util.setPathRoaming({

                paths: paths4,
                model: true,
                m_url: 'examples/data/model/CesiumMilkTruck.glb',
                m_scale:10,
                label: true,
                l_text: '社会车辆.1',
                l_pixelOffset: new Cesium.Cartesian2(42, -70),
                l_fillColor: Cesium.Color.WHITE,
                l_outlineWidth: 3,
                billboard: true,
                b_img: 'examples/images/Textures/bp2.png',
                b_width: 55,
                b_height: 80,
                b_scale: 2,
                b_pixelOffset: new Cesium.Cartesian2(20, -20)
            })

            var paths5 = [
                { lon: 106.54785660441873, lat: 29.541068287177758, alt: 0, height: 10000, time: 0 },
                { lon: 106.55096736681742, lat: 29.541274671684562, alt: 0, height: 10000, time: 120 },
                { lon: 106.55417026108965, lat: 29.542723927762594, alt: 0, height: 10000, time: 240 },
                { lon: 106.55768185185038, lat: 29.543343891151327, alt: 0, height: 10000, time: 360 },
                { lon: 106.56177018350208, lat: 29.543572027310912, alt: 0, height: 10000, time: 480 },
                { lon: 106.564952958958, lat: 29.543196019188958, alt: 0, height: 10000, time: 600 },
                { lon: 106.56496364017232, lat: 29.543182043715298, alt: 0, height: 10000, time: 720 },
            ]

            this._util.setPathRoaming({

                paths: paths5,
                model: true,
                m_url: 'examples/data/model/CesiumMilkTruck.glb',
                m_scale:10,
                label: true,
                l_text: '社会车辆.2',
                l_pixelOffset: new Cesium.Cartesian2(42, -70),
                l_fillColor: Cesium.Color.WHITE,
                l_outlineWidth: 3,
                billboard: true,
                b_img: 'examples/images/Textures/bp2.png',
                b_width: 55,
                b_height: 80,
                b_scale: 2,
                b_pixelOffset: new Cesium.Cartesian2(20, -20)
            })


            var paths5 = [
                { lon: 106.53723590282631, lat: 29.549647357633564, alt: 300, height: 10000, time: 0 },
                { lon: 106.54729432614089, lat: 29.525784806338617, alt: 300, height: 10000, time: 120 },
                { lon: 106.5710138566176, lat: 29.516772520652342, alt: 300, height: 10000, time: 240 },
                { lon: 106.5788276019971, lat: 29.53780626182699, alt: 300, height: 10000, time: 360 },
                { lon: 106.54982114025249, lat: 29.543572027310912, alt: 300, height: 10000, time: 480 }
            ]

            var flyEntity = this._util.setPathRoaming({

                paths: paths5,
                model: true,
                m_url: 'examples/data/model/CesiumDrone.gltf',
                label: true,
                l_text: '无人机侦察',
                l_outlineWidth: 3,
                l_fillColor: Cesium.Color.CYAN
            })
            // this._viewer.entities.add(this._util.createDynamicCylinder({
            //     positions: flyEntity.position.getValue(this._viewer.clock.currentTime),
            //     entity: flyEntity,
            //     cylinder: {
            //         length: 50,
            //         slices: 6,
            //         bottomRadius: 200,
            //         material: new Cesium.WarnLinkMaterialProperty({ freely: 'vertical', color: Cesium.Color.ORANGE, duration: 1, count: 0.0, direction: '-' }),
            //     }
            // }))


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

        })

        /**
         * 高度光源线
         */
        new Promise((resolve, reject) => {

            this.addHeightLineLight({
                positions: {
                    startPoint: Cesium.Cartesian3.fromDegrees(106.56558869414897, 29.546645918115, 0.0),
                    endPoint: Cesium.Cartesian3.fromDegrees(106.56558869414897, 29.546645918115, 20000.0)
                },
                color: Cesium.Color.DARKGOLDENROD,
                width: 6
            })

            this.addHeightLineLight({
                positions: {
                    startPoint: Cesium.Cartesian3.fromDegrees(106.56698580585798, 29.530538206648064, 0.0),
                    endPoint: Cesium.Cartesian3.fromDegrees(106.56698580585798, 29.530538206648064, 20000.0)
                },
                color: Cesium.Color.CYAN,
                width: 6
            })

            this.addHeightLineLight({
                positions: {
                    startPoint: Cesium.Cartesian3.fromDegrees(106.5399480984319, 29.53383231300993, 0.0),
                    endPoint: Cesium.Cartesian3.fromDegrees(106.5399480984319, 29.53383231300993, 20000.0)
                },
                color: Cesium.Color.CYAN,
                width: 6
            })
            //
            this._viewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(106.5399480984319, 29.53383231300993, 0.0),
                ellipsoid: {
                    radii: new Cesium.Cartesian3(200.0, 200.0, 200.0),
                    material: new Cesium.WallLinkMaterialProperty({ freely: 'vertical', color: Cesium.Color.RED.withAlpha(0.5), duration: 1000, count: 0, direction: '-' }),
                },
            });

            this.addHeightLineLight({
                positions: {
                    startPoint: Cesium.Cartesian3.fromDegrees(106.553868801763, 29.527073727667158, 0.0),
                    endPoint: Cesium.Cartesian3.fromDegrees(106.553868801763, 29.527073727667158, 20000.0)
                },
                color: Cesium.Color.DARKGOLDENROD,
                width: 6
            })

            this.addHeightLineLight({
                positions: {
                    startPoint: Cesium.Cartesian3.fromDegrees(106.54583250446436, 29.542360318905853, 0.0),
                    endPoint: Cesium.Cartesian3.fromDegrees(106.54583250446436, 29.542360318905853, 0.0)
                },
                color: Cesium.Color.CYAN,
                width: 6
            })

            //
            this._viewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(106.54583250446436, 29.542360318905853, 0.0),
                ellipsoid: {
                    radii: new Cesium.Cartesian3(200.0, 200.0, 200.0),
                    material: new Cesium.WallLinkMaterialProperty({ freely: 'vertical', color: Cesium.Color.DARKGREEN.withAlpha(0.1), duration: 1000, count: 0, direction: '-' }),
                },
            });

        })

        /**
         * 弧线
         */
        new Promise((resolve, reject) => {

            var startPoints = Cesium.Cartesian3.fromDegrees(106.56298388731544, 29.532057959712986, 230.0)
            this.addRadianLineLight(
                { startPoint: startPoints, endPoint: Cesium.Cartesian3.fromDegrees(106.55775961346458, 29.542807433251742, 0.0) },
            )
            this.addDynamicCricle({
                circle: { lng: 106.55775961346458, lat: 29.542807433251742, alt: 0.0 },
                color: Cesium.Color.CYAN,
                height: 0,
                radius: 20,
                count: 1
            })

            this.addRadianLineLight(
                { startPoint: startPoints, endPoint: Cesium.Cartesian3.fromDegrees(106.55510300690722, 29.527818241746893, 0.0) },
            )

            this.addDynamicCricle({
                circle: { lng: 106.55510300690722, lat: 29.527818241746893, alt: 0.0 },
                color: Cesium.Color.CYAN,
                height: 0,
                radius: 20,
                count: 1
            })
            this.addRadianLineLight(
                { startPoint: startPoints, endPoint: Cesium.Cartesian3.fromDegrees(106.55826955975746, 29.533090799351488, 0.0) },
            )

            this.addDynamicCricle({
                circle: { lng: 106.55826955975746, lat: 29.533090799351488, alt: 0.0 },
                color: Cesium.Color.CYAN,
                height: 0,
                radius: 20,
                count: 1
            })

            this.addRadianLineLight(
                { startPoint: startPoints, endPoint: Cesium.Cartesian3.fromDegrees(106.5518898036773, 29.53425871475176, 0.0) },
            )

            this.addDynamicCricle({
                circle: { lng: 106.5518898036773, lat: 29.53425871475176, alt: 0.0 },
                color: Cesium.Color.CYAN,
                height: 0,
                radius: 20,
                count: 1
            })

            this.addRadianLineLight(
                { startPoint: startPoints, endPoint: Cesium.Cartesian3.fromDegrees(106.55831081954038, 29.538058310725905, 0.0) },
            )

            this.addDynamicCricle({
                circle: { lng: 106.55831081954038, lat: 29.538058310725905, alt: 0.0 },
                color: Cesium.Color.CYAN,
                height: 0,
                radius: 20,
                count: 1
            })

            this.addRadianLineLight(
                { startPoint: startPoints, endPoint: Cesium.Cartesian3.fromDegrees(106.55200667660088, 29.529567664624146, 0.0) },
            )

            this.addDynamicCricle({
                circle: { lng: 106.55200667660088, lat: 29.529567664624146, alt: 0.0 },
                color: Cesium.Color.CYAN,
                height: 0,
                radius: 20,
                count: 1
            })
            this.addRadianLineLight(
                { startPoint: startPoints, endPoint: Cesium.Cartesian3.fromDegrees(106.56818853301075, 29.525016061106154, 0.0) },
            )

            this.addDynamicCricle({
                circle: { lng: 106.56818853301075, lat: 29.525016061106154, alt: 0.0 },
                color: Cesium.Color.CYAN,
                height: 0,
                radius: 20,
                count: 1
            })

            this.addRadianLineLight(
                { startPoint: startPoints, endPoint: Cesium.Cartesian3.fromDegrees(106.57296659709463, 29.5293255402316, 0.0) },
            )
            this.addDynamicCricle({
                circle: { lng: 106.57296659709463, lat: 29.5293255402316, alt: 0.0 },
                color: Cesium.Color.CYAN,
                height: 0,
                radius: 20,
                count: 1
            })
            this.addRadianLineLight(
                { startPoint: startPoints, endPoint: Cesium.Cartesian3.fromDegrees(106.56948261814809, 29.53323873346, 0.0) },
            )
            this.addDynamicCricle({
                circle: { lng: 106.56948261814809, lat: 29.53323873346, alt: 0.0 },
                color: Cesium.Color.CYAN,
                height: 0,
                radius: 20,
                count: 1
            })
            this.addRadianLineLight(
                { startPoint: startPoints, endPoint: Cesium.Cartesian3.fromDegrees(106.55511738770666, 29.520780769175847, 0.0) },
            )
            this.addDynamicCricle({
                circle: { lng: 106.55511738770666, lat: 29.520780769175847, alt: 0.0 },
                color: Cesium.Color.CYAN,
                height: 0,
                radius: 20,
                count: 1
            })
            this.addRadianLineLight(
                { startPoint: startPoints, endPoint: Cesium.Cartesian3.fromDegrees(106.56938764079821, 29.53789177413806, 0.0) },
            )
            this.addDynamicCricle({
                circle: { lng: 106.56938764079821, lat: 29.53789177413806, alt: 0.0 },
                color: Cesium.Color.CYAN,
                height: 0,
                radius: 20,
                count: 1
            })
            this.addRadianLineLight(
                { startPoint: startPoints, endPoint: Cesium.Cartesian3.fromDegrees(106.56869940844197, 29.54266106727103, 0.0) },
            )
            this.addDynamicCricle({
                circle: { lng: 106.56869940844197, lat: 29.54266106727103, alt: 0.0 },
                color: Cesium.Color.CYAN,
                height: 0,
                radius: 20,
                count: 1
            })
            this.addRadianLineLight(
                { startPoint: startPoints, endPoint: Cesium.Cartesian3.fromDegrees(106.57656077263997, 29.538952807799447, 0.0) },
            )
            this.addDynamicCricle({
                circle: { lng: 106.57656077263997, lat: 29.538952807799447, alt: 0.0 },
                color: Cesium.Color.CYAN,
                height: 0,
                radius: 20,
                count: 1
            })

        })

        /**
         * 楼宇信息
         */
        new Promise((resolve, reject) => {


            this._util.setPointLight(
                Cesium.Cartesian3.fromDegrees(106.56298388731544, 29.532057959712986, 50.0),
                {
                    color: Cesium.Color.CYAN,
                    cutoffDistance: 250,
                    decay: 1,
                    intensity: 2
                })
            this.addCircleLine({
                semiMinorAxis: 150,
                semiMajorAxis: 150,
                rotation: 0,
                center: Cesium.Cartesian3.fromDegrees(106.56298388731544, 29.532057959712986, 40.0),
                granularity: Math.PI / 45.0//间隔
            })

            //动态实体 楼宇中心
            this.addDynamicEntity({
                position: Cesium.Cartesian3.fromDegrees(106.56298388731544, 29.532057959712986, 230.0),
                model: { lng: 106.56298388731544, lat: 29.532057959712986, alt: 230.0 },
                circle: { lng: 106.56298388731544, lat: 29.532057959712986, alt: 350.0 },
                m_color: Cesium.Color.GREEN,
                label: true,
                billboard: true,
                text: ' xx大厦 ',
                l_fillColor: Cesium.Color.GREEN,
                l_pixelOffset: new Cesium.Cartesian2(0, -5),
            })

            this.addDynamicCricle({
                circle: { lng: 106.56298388731544, lat: 29.532057959712986, alt: 230.0 },
                color: Cesium.Color.GREEN,
                height: 205,
                radius: 30
            })

            this.addDynamicEntity({
                position: Cesium.Cartesian3.fromDegrees(106.5659092537878, 29.530924830570186, 120.0),
                model: { lng: 106.5659092537878, lat: 29.530924830570186, alt: 120.0 },
                circle: { lng: 106.5659092537878, lat: 29.530924830570186, alt: 120.0 },
                m_color: Cesium.Color.GREEN,
                label: true,
                text: ' 写字楼 ',
                l_fillColor: Cesium.Color.GREEN,
                l_pixelOffset: new Cesium.Cartesian2(0, -20),
                billboard: false

            })

            this.addDynamicCricle({
                circle: { lng: 106.5659092537878, lat: 29.530924830570186, alt: 120.0 },
                color: Cesium.Color.GREEN,
                height: 95,
                radius: 20
            })

            this.addDynamicEntity({
                position: Cesium.Cartesian3.fromDegrees(106.56240261998792, 29.527304750255123, 120.0),
                model: { lng: 106.56240261998792, lat: 29.527304750255123, alt: 120.0 },
                circle: { lng: 106.56240261998792, lat: 29.527304750255123, alt: 120.0 },
                m_color: Cesium.Color.GREEN,
                label: true,
                l_fillColor: Cesium.Color.GREEN,
                l_pixelOffset: new Cesium.Cartesian2(0, -20),
                billboard: false,
                text: ' 服务中心 '
            })

            this.addDynamicCricle({
                circle: { lng: 106.56240261998792, lat: 29.527304750255123, alt: 120.0 },
                color: Cesium.Color.GREEN,
                height: 95,
                radius: 20
            })

            this.addDynamicEntity({
                position: Cesium.Cartesian3.fromDegrees(106.56339406642704, 29.53412750079538, 180.0),
                model: { lng: 106.56339406642704, lat: 29.53412750079538, alt: 180.0 },
                circle: { lng: 106.56339406642704, lat: 29.53412750079538, alt: 180.0 },
                m_color: Cesium.Color.GREEN,
                label: true,
                l_fillColor: Cesium.Color.GREEN,
                l_pixelOffset: new Cesium.Cartesian2(0, -20),
                billboard: false,
                text: ' 商场 '
            })

            this.addDynamicCricle({
                circle: { lng: 106.56339406642704, lat: 29.53412750079538, alt: 180.0 },
                color: Cesium.Color.GREEN,
                height: 155,
                radius: 20
            })

            //

            this.addDynamicEntity({
                position: Cesium.Cartesian3.fromDegrees(106.54439406642704, 29.53412750079538, 200.0),
                model: { lng: 106.54439406642704, lat: 29.54439406642704, alt: 200.0 },
                m_scale: 35,
                minimumPixelSize: 80,
                m_color: Cesium.Color.CYAN,
                label: true,
                l_pixelOffset: new Cesium.Cartesian2(0, -20),
                l_fillColor: Cesium.Color.CYAN,
                billboard: false,
                text: ' 雷达探测 '
            })

            //

            this.addDynamicEntity({
                position: Cesium.Cartesian3.fromDegrees(106.55439406642704, 29.53412750079538, 80.0),
                model: { lng: 106.55439406642704, lat: 29.53412750079538, alt: 80.0 },
                m_scale: 35,
                minimumPixelSize: 80,
                m_color: Cesium.Color.CYAN,
                label: true,
                l_pixelOffset: new Cesium.Cartesian2(0, -20),
                billboard: false,
                text: '车牌: 京A53137 '
            })

            this.addDynamicEntity({
                position: Cesium.Cartesian3.fromDegrees(106.54439406642704, 29.54412750079538, 80.0),
                model: { lng: 106.54439406642704, lat: 29.54412750079538, alt: 80.0 },
                m_scale: 35,
                minimumPixelSize: 80,
                m_color: Cesium.Color.CYAN,
                label: true,
                l_pixelOffset: new Cesium.Cartesian2(0, -20),
                billboard: false,
                text: '车牌: 京A52157 '
            })

            this.addDynamicEntity({
                position: Cesium.Cartesian3.fromDegrees(106.53582326246042, 29.53843116134104, 80.0),
                model: { lng: 106.53582326246042, lat: 29.53843116134104, alt: 80.0 },
                m_scale: 35,
                minimumPixelSize: 80,
                m_color: Cesium.Color.CYAN,
                label: true,
                l_pixelOffset: new Cesium.Cartesian2(0, -20),
                billboard: false,
                text: '车牌: 京B52688 '
            })

            this.addDynamicEntity({
                position: Cesium.Cartesian3.fromDegrees(106.57205354541892, 29.560026997082456, 300.0),
                model: { lng: 106.57205354541892, lat: 29.560026997082456, alt: 300.0 },
                m_scale: 35,
                minimumPixelSize: 80,
                m_color: Cesium.Color.GREEN,
                label: true,
                l_pixelOffset: new Cesium.Cartesian2(0, -20),
                billboard: false,
                text: ' 隔离区 '
            })
            this.addPoi(Cesium.Cartesian3.fromDegrees(106.55682326246042, 29.534247808485972, 1.0))

            this.addPoi(Cesium.Cartesian3.fromDegrees(106.55882326246042, 29.534247808485972, 1.0))

            this.addPoi(Cesium.Cartesian3.fromDegrees(106.55982326246042, 29.534247808485972, 1.0))

            this.addPoi(Cesium.Cartesian3.fromDegrees(106.56082326246042, 29.534247808485972, 1.0))

            this.addPoi(Cesium.Cartesian3.fromDegrees(106.56582326246042, 29.534247808485972, 1.0))

            this.addPoi(Cesium.Cartesian3.fromDegrees(106.55982326246042, 29.52843116134104, 1.0))

            this.addPoi(Cesium.Cartesian3.fromDegrees(106.56082326246042, 29.52843116134104, 1.0))

            this.addPoi(Cesium.Cartesian3.fromDegrees(106.56582326246042, 29.52843116134104, 1.0))

            this.addPoi(Cesium.Cartesian3.fromDegrees(106.54982326246042, 29.52843116134104, 1.0))

            this.addPoi(Cesium.Cartesian3.fromDegrees(106.53082326246042, 29.52843116134104, 1.0))

            this.addPoi(Cesium.Cartesian3.fromDegrees(106.55582326246042, 29.54843116134104, 1.0))

            this.addPoi(Cesium.Cartesian3.fromDegrees(106.54539406642704, 29.54412750079538, 1.0))

        })

        // this._viewer.scene.camera.moveEnd.addEventListener((move) => {

        //     console.log(this._util.getCameraPosition())

        // });
        // var _handler = new Cesium.ScreenSpaceEventHandler(this._viewer.scene.canvas)
        // _handler.setInputAction((movement) => {

        //     var cartesian = this._util.getCatesian3FromPX(movement.position)

        //     console.log(this._util.transformCartesianToWGS84(cartesian))

        // }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        // this._util.setDark()
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
}

D3.prototype.addRoadLine = function (url, polyline) {

    var DEF_STYLE = {
        width: 2
    }
    polyline = polyline || DEF_STYLE

    if (url) {

        this._util.addLineLayer({
            url: url,
            polyline: polyline
        })
    }
}

D3.prototype.addDynamicCricle = function (opt) {

    var cricleEntity = this._util.createDynamicCricle({
        center: opt.circle,
        imge: opt.imge,
        material: new Cesium.CircleWaveMaterialProperty({
            color: opt.color || Cesium.Color.DARKCYAN.withAlpha(0.8),
            count: opt.count || 3,
            gradient: opt.gradient || 0.9
        }),
        radius: opt.radius || 100,
        height: opt.height || 0.1,
        rotateAmount: 0.01
    })
    this._viewer.entities.add(cricleEntity)


}


D3.prototype.addDynamicEntity = function (opt) {

    var Entity = this._util.createEntity()

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
            l_fillColor: opt.l_fillColor || Cesium.Color.CYAN
        })
    }

    Entity.position = opt.position
    this._viewer.entities.add(Entity)

}

D3.prototype.addPoi = function (position) {

    this._viewer.entities.add(this._util.createPoint({
        position: position,
        lable: false,
        point: false,
        billboard: {
            b_img: 'examples/images/Textures/poi2.png',
            b_width: 42,
            b_height: 140,
            b_scale: 1.5
        }
    }))
}

D3.prototype.addRadianLineLight = function (positions, angularityFactor = 50000, numOfSingleLine = 500, cutoffDistance = 100) {
    if (positions) {

        this._util.addMaterialLine({
            positions: this._util.getLinkedPointList(positions.startPoint, positions.endPoint, angularityFactor, numOfSingleLine),
            width: 8,
            material: new Cesium.PolylineCityLinkMaterialProperty({
                color: Cesium.Color.CYAN,
                duration: 20000
            })
        })

        this._util.setPointLight(
            positions.endPoint,
            {
                color: new Cesium.Color(1, 1, 2, 0.8),
                cutoffDistance: cutoffDistance,
                decay: 0.5,
                intensity: 1
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

D3.prototype.addCircleLine = function (opt) {

    var ellipse = this._util.computeEllipseEdgePositions(opt)

    var positions = []
    for (let i = 0; i < ellipse.outerPositions.length; i += 3) {
        let cartesian = new Cesium.Cartesian3(ellipse.outerPositions[i], ellipse.outerPositions[i + 1], ellipse.outerPositions[i + 2]);
        positions.push(cartesian)
    }
    positions.push(positions[0])

    var circleLine = this._viewer.entities.add(this._util.createLine({
        positions: positions,
        width: 8,
        material: new Cesium.PolylineOutlineMaterialProperty({
            color: Cesium.Color.CYAN,
        }),
    }))

    this._util.setDynamicHeight({
        entity: circleLine.polyline,
        cartesians: circleLine.polyline.positions._value,
        minHeiht: 40,
        maxHeiht: 220,
        speed: 0.01
    })
}

D3.prototype.addWall = function () {

    var warn = [
        106.56100246619017, 29.55196242209373, 200.0,
        106.56340609277548, 29.566165610819642, 200.0,
        106.58569020875434, 29.565728490316253, 200.0,
        106.58005269968774, 29.554240715275743, 200.0,
        106.56120354632381, 29.55085916174001, 200.0,
        106.56100246619017, 29.55196242209373, 200.0,
    ]
    // this._viewer.entities.add({
    //     wall: {
    //         positions: Cesium.Cartesian3.fromDegreesArrayHeights(warn),
    //         material: new Cesium.WarnLinkMaterialProperty({ freely: 'cross', color: Cesium.Color.ORANGE, duration: 1000, count: 1.0, direction: '-' }),
    //     }
    // });

    // var wall = [
    //     106.48371807021667, 29.58911680397793, 300,
    //     106.51856472700705, 29.521864720316948, 300,
    //     106.58365973316853, 29.509643881335794, 300,
    //     106.59786596223937, 29.55949597535444, 300,
    //     106.59947239295121, 29.571088868292403, 300,
    //     106.53450991438845, 29.604637451928784, 300,
    //     106.50579172352724, 29.650956459667555, 300,
    //     106.48371807021667, 29.58911680397793, 300
    // ]

    this._viewer.entities.add({
        wall: {
            positions: Cesium.Cartesian3.fromDegreesArrayHeights(warn),
            material: new Cesium.WallLinkMaterialProperty({ freely: 'vertical', color: Cesium.Color.DARKGREEN.withAlpha(0.1), duration: 1000, count: 0, direction: '-' }),
        }
    });
}

D3.prototype.addThreeObject = function () {


    // Lathe geometry
    var doubleSideMaterial = new THREE.MeshNormalMaterial({
        side: THREE.DoubleSide
    });
    var segments = 10;
    var points = [];
    for (var i = 0; i < segments; i++) {
        points.push(new THREE.Vector2(Math.sin(i * 0.2) * segments + 5, (i - 5) * 2));
    }
    var geometry = new THREE.LatheGeometry(points);
    var latheMesh = new THREE.Mesh(geometry, doubleSideMaterial);
    latheMesh.scale.set(100, 100, 100); //scale object to be visible at planet scale
    latheMesh.position.z += 1500.0; // translate "up" in Three.js space so the "bottom" of the mesh is the handle
    latheMesh.rotation.x = Math.PI / 2; // rotate mesh for Cesium's Y-up system
    var latheMeshYup = new THREE.Group();
    latheMeshYup.add(latheMesh)
    this._util._three.scene.add(latheMeshYup); // don’t forget to add it to the Three.js scene manually

    var threeObject = []

    var maxWGS84 = [106.57003293712452, 29.524797836353418]
    var minWGS84 = [106.55003293712452, 29.504797836353418]

    var _3DOB = this._util.createThreeObject()
    _3DOB.maxWGS84 = maxWGS84
    _3DOB.minWGS84 = minWGS84
    _3DOB.threeMesh = latheMeshYup

    threeObject.push(_3DOB)

    this._util.addThreeObjects(threeObject)

}
/**
 * 初始化页面
 * 添加gu
 */
D3.prototype.initGUI = function () {

    var viewer = this._viewer,
        gui = new dat.GUI();

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
        this.ambientLightColor = 0.1
    };

    var sceneEffect = gui.addFolder('场景效果')

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
    sceneEffect.open()
}

if (typeof Cesium !== 'undefined') {
    onloadApp()
}
