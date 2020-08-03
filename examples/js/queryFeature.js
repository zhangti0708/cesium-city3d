var viewer,selectedEntity;
function onload(Cesium) {
    viewer = new Cesium.Viewer('cesiumContainer');
    var scene = viewer.scene;
    var widget = viewer.cesiumWidget;
    selectedEntity = viewer.entities.add({
        name : 'selected'
    });
    try{
        var promise = scene.addS3MTilesLayerByScp('http://localhost:8090/iserver/services/3D-osgb/rest/realspace/datas/jinjiang/config',{
            name : 'jinjiang'
        });
        Cesium.when(promise,function(layer){
            scene.camera.setView({
                destination : Cesium.Cartesian3.fromDegrees(118.548,24.803, 600)
            });
        },function(e){
            if (widget._showRenderLoopErrors) {
                var title = '渲染时发生错误，已停止渲染。';
                widget.showErrorPanel(title, undefined, e);
            }
        });
    }
    catch(e){
        if (widget._showRenderLoopErrors) {
            var title = '渲染时发生错误，已停止渲染。';
            widget.showErrorPanel(title, undefined, e);
        }
    }
    var handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
    handler.setInputAction(function(e){
        var layers = scene.layers;
        var layer = layers.find('jinjiang');
        var id,url,dataSourceName,dataSetName;
        if(Cesium.defined(layer)){
            id = scene.getSelectID(e.position, layer);
            if(Cesium.defined(id)){
                url = 'http://localhost:8090/iserver/services/data-osgb/rest/data';
                dataSourceName = 'vector';
                dataSetName = 'test';
                var filter = 'SmID=' + id;
                var promise = queryFeature(Cesium,filter,url,dataSourceName,dataSetName);
                Cesium.when(promise,function(features){
                    var entity = new Cesium.Entity({
                        description : createDescription(Cesium,features[0].data),
                        name : features[0].data['NAME']
                    });
                    viewer.selectedEntity = entity;
                });
            }
        }
    },Cesium.ScreenSpaceEventType.LEFT_CLICK);
}

/**
 * 创建描述信息
 * @param Cesium
 * @param properties
 * @returns {string}
 */
function createDescription(Cesium,properties){
    var simpleStyleIdentifiers = ['SMID','SMUSERID','ID','类型ID','tName','modelName'];
    var html = '';
    for ( var key in properties) {
        if (properties.hasOwnProperty(key)) {
            if (simpleStyleIdentifiers.indexOf(key) !== -1) {
                continue;
            }
            var value = properties[key];
            if (Cesium.defined(value) && value !== '') {
                html += '<tr><td>' + key + '</td><td>' + value + '</td></tr>';
            }
        }
    }
    if (html.length > 0) {
        html = '<table class="zebra"><tbody>' + html + '</tbody></table>';
    }
    return html;
}

/**
 * 查询属性
 * @param Cesium
 * @param id
 * @param url
 * @param dataSourceName
 * @param dataSetName
 * @returns {*}
 */
function queryFeature(Cesium,filter,url,dataSourceName,dataSetName){
    if(Cesium === undefined){
        return undefined;
    }
    var defered = Cesium.when.defer();
    var parsObj = new SuperMap.REST.GetFeaturesBySQLParameters({
        returnContent: true,
        datasetNames: [dataSourceName + ":" + dataSetName],//数据源，数据集
        fromIndex: 0,
        toIndex:-1,
        queryParameter : new SuperMap.REST.FilterParameter({
            attributeFilter : filter
        })
    });
    var queryService = new SuperMap.REST.GetFeaturesBySQLService(url, {
        eventListeners: {
            "processCompleted": function(resultSet){
                var len = resultSet.result.features.length;
                if(len > 0){
                    return defered.resolve(resultSet.result.features);
                }
                return defered.reject('结果集长度为空!');
            }, "processFailed": function(){
                return defered.reject('查询失败!');
            }
        }
    });
    queryService.processAsync(parsObj);
    return defered;
}