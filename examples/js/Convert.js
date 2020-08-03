var CesiumToSuperMap = {
    convertPoint : function(Cesium,SuperMap,point){
        if(!Cesium || !SuperMap || !point){
            return undefined;
        }
        var lonlatPoint = Cesium.Cartographic.fromCartesian(point);
        var x = Cesium.Math.toDegrees(lonlatPoint.longitude);
        var y = Cesium.Math.toDegrees(lonlatPoint.latitude);
        if(x && y){
            return new SuperMap.Geometry.Point(x,y);
        }
        return undefined;
    },
    convertPolyline : function(Cesium,SuperMap,polyline){
        if(!Cesium || !SuperMap || !polyline){
            throw undefined;
        }
        var points = polyline.positions;
        if(points && points instanceof Array && points.length >= 2){
            var arr = [];
            for(var i = 0,j = points.length;i < j;i++){
                var point = this.convertPoint(Cesium,SuperMap,points[i]);
                if(point){
                    arr.push(point);
                }
            }
            return new SuperMap.Geometry.LineString(arr);
        }
        return undefined;
    },
    convertPolygon : function(Cesium,SuperMap,polygon){
        if(!Cesium || !SuperMap || !polygon){
            throw undefined;
        }
        var points = polygon.positions;
        if(points && points instanceof Array && points.length >= 3){
            var arr = [];
            for(var i = 0,j = points.length;i < j;i++){
                var point = this.convertPoint(Cesium,SuperMap,points[i]);
                if(point){
                    arr.push(point);
                }
            }
            var linearRing = new SuperMap.Geometry.LinearRing(arr);
            return new SuperMap.Geometry.Polygon(linearRing);
        }
        return undefined;
    }
};

var SuperMapToCesium = {
    geometryToEntity : function(Cesium,SuperMap,geometry){
        var className = geometry.CLASS_NAME;
        if(className == 'SuperMap.Geometry.MultiPolygon'){
            return this.multipolygonToEntities(Cesium,SuperMap,geometry);
        }
        else if(className == 'SuperMap.Geometry.Polygon'){
            return [this.polygonToEntity(Cesium,SuperMap,geometry)];
        }
        return undefined;
    },
    polygonToEntity : function(Cesium,SuperMap,geometry){
        var hierarchy = {};
        for(var i = 0,j = geometry.components.length;i < j;i++){
            if(i == 0){
                hierarchy.positions = this.GeometrytoDegreesArray(Cesium,SuperMap,geometry.components[i]);
            }
            else{
                if(!hierarchy.holes){
                    hierarchy.holes = [];
                }
                hierarchy.holes.push({
                    positions : this.GeometrytoDegreesArray(Cesium,SuperMap,geometry.components[i])
                });
            }
        }
        return new Cesium.Entity({
            polygon : {
                hierarchy : hierarchy,
                material : Cesium.Color.BLUE.withAlpha(0.5)
            },
            depthTestEnabled : false
        });

    },
    multipolygonToEntities : function(Cesium,SuperMap,geometry){
        var components = geometry.components;
        var resultEntities = [];
        var entity;
        for(var item in components){
            entity = this.polygonToEntity(Cesium,SuperMap,components[item]);
            resultEntities.push(entity);
        }
        return resultEntities;
    },
    GeometrytoDegreesArray : function(Cesium,SuperMap,geometry){
        var vertices = geometry.getVertices();
        var degreesArr = [];
        for(var o in vertices){
            degreesArr.push(vertices[o].x,vertices[o].y);
        }
        return Cesium.Cartesian3.fromDegreesArray(degreesArr);
    }
};

