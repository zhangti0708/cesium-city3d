 var removeLineEntity;
 var addAirLines;
 var quarterID=1;
 var lineEntityArrs=[];
 var lineEntityArrVisible;
 var lineEntityVisible;
 var MinlineEntityArr=[];
 var PlaceImgEntityArr=[];
 function onload(Cesium)
    {
        var viewer = new Cesium.Viewer('cesiumContainer', {
            imageryProvider:new Cesium.SingleTileImageryProvider({
                url : 'images/BlackMarble_2016_3km1.jpg'
                //url : ''
            }),
            infoBox : false,selectionIndicator : false,sceneModePicker:false
       });
        var scene = viewer.scene;
        //scene.globe.depthTestAgainstTerrain = true;
        scene.postRender.addEventListener(function(){
            var colc = viewer.scene.primitives;
            var tt = 0;
        });
        //scene.globe.enableLighting=true;
        var url = './SampleData/models/ship.s3m';
        var videoElement=document.getElementById("trailer");
        var videoElement1=document.getElementById("trailer1");
        var AirPointarr = [];
        var airportArr=[];
        var pointArryCollection=[]
        var num=600;
        var count=0;
        var isContain=0;  
        var imageTimer;
		var entityIDs=[];
		var quarterID=1;
		var imageUrl1='./images/imageChange/light_blue_000000.png';
		var imageUrl2='./images/imageChange/pink_000000.png'

        var EchartsDomID='echarts';
        addEcharts(EchartsDomID);
        addEcharts2();
       

        var routes = new Cesium.RouteCollection();
		        var fpfUrl = './data/NewSceneRoutes.fpf';
		        routes.fromFile(fpfUrl);
		var   flyManager = new Cesium.FlyManager({
		            scene : scene,
		            routes : routes
		        });   

        Sandcastle.addToolbarButton('复位', function() {
            ClearMinLine();
            airPortvisible(true);
            PlaceImgEntityVisible(true);
            layer.clear();
            clearInterval(modelTime);
            document.getElementById("toolbar").style.display = "none";
            disPlayPanleAndEcharts('block');
            for(var i =0 ;i<viewer.dataSources.length;i++)
            {
                var datasource = viewer.dataSources.get(i);
                if(datasource.name == "GlobalFlight.json")
                {
                    viewer.dataSources.remove(datasource,true);
                }
            }
			lineEntityArrVisible(quarterID);
            LoadPlaceEntity();
            scene.camera.flyHome(0);
            //$('.str11').liMarquee('pause');
        })
        
        //移除航线        
        removeLineEntity= function()
        {
            var removeFunc = function(){
                var colc = viewer.scene.primitives;

                if(isContain<50)
                {
                    for(var i=0;i<colc.length;i++)
                    {
                        if(colc.get(i).appearance)
                        {
                            var material=colc.get(i).appearance.material;
                            if(material)
                            {
                                if(material.type=='PolylineDynamic')
                                {
                                    colc.remove(colc.get(i));
                                }
                            }
                        }
                        isContain++;
                    }
                }
                else{
                    scene.postRender.removeEventListener(removeFunc);
                    isContain=0;
                }
            };
            scene.postRender.addEventListener(removeFunc); 	
        }
        function disPlayPanleAndEcharts(display)
        {
            if(display)
            {
                document.getElementById('graToolBar').style.display=display;
                document.getElementById('flightInfotool').style.display=display;
                document.getElementById('flightinfo').style.display=display;
                document.getElementById('echarts').style.display=display;
                document.getElementById('echarts2').style.display=display; 		 		
            }
        }
           
    ////航线
     {
         var handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
         handler.setInputAction(function (e) {
             var select = viewer.selectedEntity;
             if(select)
             {
                 if(select.name=="北京首都")
                 {
                     window.open("flightFly.html?北京首都");
                 }
                 else if(select.name=="约翰内斯堡")
                 {
                     window.open("flightFly.html?约翰内斯堡");
                 }
                 else if(select.name=="圣保罗")
                 {
                     window.open("flightFly.html?圣保罗");
                 }
                 else if(select.name=="荷兰阿姆斯特丹斯史基浦")
                 {
                     window.open("flightFly.html?荷兰阿姆斯特丹斯史基浦");
                 }
                 else if(select.name=="悉尼金斯福德")
                 {
                     window.open("flightFly.html?悉尼金斯福德");
                 }
                 else if(select.name=="洛杉矶")
                 {
                     window.open("flightFly.html?洛杉矶");
                 }
             }
         },Cesium.ScreenSpaceEventType.LEFT_CLICK);
         LoadPlaceEntity();
         function LoadPlaceEntity() {
             var entityPEK =new Cesium.Entity({
                 name : "北京首都",
                 position :  Cesium.Cartesian3.fromDegrees(116.5871, 40.078537,100000),
                 label : {
                     text : "北京",
                     font : '36px Helvetica',
                     fillColor : new Cesium.Color(255/255,255/255,1/255,1),
                     outlineColor : Cesium.Color.YELLOW,
                     outlineWidth : 1,
                     translucencyByDistance : new Cesium.NearFarScalar(1.5e2, 1.0, 1.5e8, 0.0),
                     scaleByDistance : new Cesium.NearFarScalar(1.5e2, 2.0, 1.5e7, 0.5),
                     style : Cesium.LabelStyle.FILL_AND_OUTLINE

                 }
             });
             var entityJNB =new Cesium.Entity({
                 name : "约翰内斯堡",
                 position :  Cesium.Cartesian3.fromDegrees(28.231314, -26.132664,100000),
                 label : {
                     text : "约翰内斯堡",
                     font : '36px Helvetica',
                     fillColor : new Cesium.Color(255/255,255/255,1/255,1),
                     outlineColor : Cesium.Color.YELLOW,
                     outlineWidth : 1,
                     translucencyByDistance : new Cesium.NearFarScalar(1.5e2, 1.0, 1.5e8, 0.0),
                     scaleByDistance : new Cesium.NearFarScalar(1.5e2, 2.0, 1.5e7, 0.5),
                     style : Cesium.LabelStyle.FILL_AND_OUTLINE
                 }
             });
             var entityGRU =new Cesium.Entity({
                 name : "圣保罗",
                 position :  Cesium.Cartesian3.fromDegrees(-46.481926, -23.425669,100000),
                 label : {
                     text : "圣保罗",
                     font : '36px Helvetica',
                     fillColor : new Cesium.Color(255/255,255/255,1/255,1),
                     outlineColor : Cesium.Color.YELLOW,
                     outlineWidth : 1,
                     translucencyByDistance : new Cesium.NearFarScalar(1.5e2, 1.0, 1.5e8, 0.0),
                     scaleByDistance : new Cesium.NearFarScalar(1.5e2, 2.0, 1.5e7, 0.5),
                     style : Cesium.LabelStyle.FILL_AND_OUTLINE

                 }
             });
             var entityAMS =new Cesium.Entity({
                 name : "荷兰阿姆斯特丹斯史基浦",
                 position :  Cesium.Cartesian3.fromDegrees(4.763385, 52.30907,100000),
                 label : {
                     text : "阿姆斯特丹",
                     font : '36px Helvetica',
                     fillColor : new Cesium.Color(255/255,255/255,1/255,1),
                     outlineColor : Cesium.Color.YELLOW,
                     outlineWidth : 1,
                     translucencyByDistance : new Cesium.NearFarScalar(1.5e2, 1.0, 1.5e8, 0.0),
                     scaleByDistance : new Cesium.NearFarScalar(1.5e2, 2.0, 1.5e7, 0.5),
                     style : Cesium.LabelStyle.FILL_AND_OUTLINE

                 }
             });
             var entitySYD =new Cesium.Entity({
                 name : "悉尼金斯福德",
                 position :  Cesium.Cartesian3.fromDegrees(151.1799, -33.932922,100000),
                 label : {
                     text : "悉尼",
                     font : '36px Helvetica',
                     fillColor : new Cesium.Color(255/255,255/255,1/255,1),
                     outlineColor : Cesium.Color.YELLOW,
                     outlineWidth : 1,
                     translucencyByDistance : new Cesium.NearFarScalar(1.5e2, 1.0, 1.5e8, 0.0),
                     scaleByDistance : new Cesium.NearFarScalar(1.5e2, 2.0, 1.5e7, 0.5),
                     style : Cesium.LabelStyle.FILL_AND_OUTLINE

                 }
             });
             var entityLAX =new Cesium.Entity({
                 name : "洛杉矶",
                 position :  Cesium.Cartesian3.fromDegrees(-118.40828, 33.943398,100000),
                 label : {
                     text : "洛杉矶",
                     font : '36px Helvetica',
                     fillColor : new Cesium.Color(255/255,255/255,1/255,1),
                     outlineColor : Cesium.Color.YELLOW,
                     outlineWidth : 1,
                     translucencyByDistance : new Cesium.NearFarScalar(1.5e2, 1.0, 1.5e8, 0.0),
                     scaleByDistance : new Cesium.NearFarScalar(1.5e2, 2.0, 1.5e7, 0.5),
                     style : Cesium.LabelStyle.FILL_AND_OUTLINE

                 }
             });
             viewer.entities.add(entityPEK);
             viewer.entities.add(entityJNB);
             viewer.entities.add(entityGRU);
             viewer.entities.add(entityAMS);
             viewer.entities.add(entitySYD);
             viewer.entities.add(entityLAX);
         }
     }
     lineEntityArrVisible=function(quarterValue)
     {
     	if(quarterValue==1)
     	{
     		lineEntityVisible(lineEntityArrs[1],true);
     		lineEntityVisible(lineEntityArrs[2],false);
     		lineEntityVisible(lineEntityArrs[3],false);
     		lineEntityVisible(lineEntityArrs[4],false);
     	}
     	else if(quarterValue==2)
     	{
     		lineEntityVisible(lineEntityArrs[1],false);
     		lineEntityVisible(lineEntityArrs[2],true);
     		lineEntityVisible(lineEntityArrs[3],false);
     		lineEntityVisible(lineEntityArrs[4],false);
     	}
     	else if(quarterValue==3)
     	{
     		lineEntityVisible(lineEntityArrs[1],false);
     		lineEntityVisible(lineEntityArrs[2],false);
     		lineEntityVisible(lineEntityArrs[3],true);
     		lineEntityVisible(lineEntityArrs[4],false);
     	}
     	else if(quarterValue==4)
     	{
     		lineEntityVisible(lineEntityArrs[1],false);
     		lineEntityVisible(lineEntityArrs[2],false);
     		lineEntityVisible(lineEntityArrs[3],false);
     		lineEntityVisible(lineEntityArrs[4],true);
     	}
     	else
     	{
     		lineEntityVisible(lineEntityArrs[1],false);
     		lineEntityVisible(lineEntityArrs[2],false);
     		lineEntityVisible(lineEntityArrs[3],false);
     		lineEntityVisible(lineEntityArrs[4],false);
     		
     	}
     }
     
     lineEntityVisible=function(entityArr,Value)
     {
		if(entityArr)
		{
			for(var i=0;i<entityArr.length;i++)
			{
				entityArr[i].show=Value;
			}
		}
     	
     }
     function LoadData() 
     {        
	   var promise = Cesium.GeoJsonDataSource.load('js/world.json');
	    promise.then(function(dataSource) 
	    {
	        viewer.dataSources.add(dataSource);
	
	        //Get the array of entities
	        var entities = dataSource.entities.values;
	
	        for (var i = 0; i < entities.length; i++) {
	            var entity = entities[i];
	            var name = entity.name;
	            if(Math.random()<0.3)
	            {
	            	entity.polygon.material = new Cesium.Color(23/255, 27/255, 25/255,1);
	            }
	            else if(Math.random()>=0.3&&Math.random()<0.6)
	            {
	            	entity.polygon.material = new Cesium.Color(80/255, 80/255, 80/255,1);
	            }
	            else
	            {
	            	entity.polygon.material = new Cesium.Color(50/255, 50/255, 50/255,1);
	            }
	            
	            
	            entity.polygon.outlineColor=new Cesium.Color(100/255, 100/255, 100/255,0.5);
	            //Remove the outlines.
	            entity.polygon.outline = true;
	
	            entity.polygon.extrudedHeight = 10000;
	        }
	    }).otherwise(function(error)
	    {
	        //Display any errrors encountered while loading.
	        window.alert(error);
	    }); 
	    addairport();
	    
		var lineEntity0=addAirLines(flightjidu[0]);
		lineEntityArrs.push(lineEntity0);
		var lineEntity1=addAirLines(flightjidu[1]);
		lineEntityArrs.push(lineEntity1);
		var lineEntity2=addAirLines(flightjidu[2]);
		lineEntityArrs.push(lineEntity2);
		var lineEntity3=addAirLines(flightjidu[3]);
		lineEntityArrs.push(lineEntity3);
		var lineEntity4=addAirLines(flightjidu[4]);
		lineEntityArrs.push(lineEntity4);
		var loadoutTimer=setTimeout(function(){
			lineEntityArrVisible(1);
			document.body.className = document.body.className.replace(/(?:\s|^)loading(?:\s|$)/, ' ');
			$('.str1').liMarquee({
				direction: 'up'	,
				hoverstop: false,
				circular: true,
				scrollamount:20
			});
	
			 document.getElementById('1').click();
			 clearTimeout(loadoutTimer);
		},3000);
    }
   
    function addAirpoint1(centerPoint,color)
    {
        var points=computeCircle(0.3,centerPoint);
        var CircleLine = viewer.entities.add({
            name : "测试",
                    polyline : {
                        positions : points,
                        width : 5,
                        hMax:800000,
                        material : new Cesium.PolylineDynamicMaterialProperty({
                            color : color,
                            outlineWidth : 0,
                            outlineColor : Cesium.Color.BLACK
                        })
                    }
                });
        return CircleLine; 
    }
    //添加机场点
    function addairport()
    {
        var imageUrl;
        var airportInfoArr=[];
        var airportInfoCount=0;
        var addAirportTimer;
        for(var key in airport)
        {
            //airportInfoArr.push(airport[key]);
            var airportInfo=airport[key];
            var num=parseInt(Math.random()*100);
            var imgcounStrNum=fillZero(num,6);
            if(Math.random()<0.5)
            {
                imageUrl='./images/imageChange/light_blue_'+imgcounStrNum+'.png'; 			
            }
            else
            {
                imageUrl='./images/imageChange/pink_'+imgcounStrNum+'.png'; ;
            }
            var AirPortCircle = viewer.entities.add({
                position: new Cesium.Cartesian3.fromDegrees(parseFloat(airportInfo[0]), parseFloat(airportInfo[1]), 0),
                name : airportInfo[2],
                ellipse : {
                    semiMinorAxis : 40000.0,
                    semiMajorAxis : 40000.0,
                    height: 10500,
                    //distanceDisplayCondition:new Cesium.DistanceDisplayCondition(0,Math.random()*15000000),
                    material : new Cesium.ImageMaterialProperty({image:imageUrl,transparent:true})
                }
            });	
            airportArr.push(AirPortCircle);
            
        }
        airportChangeImg();
    }
    //机场闪烁对象显隐控制
    var airPortvisible=function(visibleValue)
    {
        for(var i=0;i<airportArr.length;i++)
        {
            airportArr[i].show=visibleValue;
        }
    }
    //清楚选择机场之后生成的线
    var ClearMinLine=function()
    {
        for(var i=0;i<MinlineEntityArr.length;i++)
        {
            viewer.entities.remove(MinlineEntityArr[i]);
        }
        MinlineEntityArr.slice(0,MinlineEntityArr.length);
    }
    //间隔刷新图片 
    function airportChangeImg()
    {
            var imgcount=1;		
            imageTimer=setInterval(function(){
                    if(imgcount<100)
                    {
                        for(var i=0;i<airportArr.length;i++)
                        {
                            var imageUrlnow=airportArr[i].ellipse.material.image._value;
                            var imgtagblue=imageUrlnow.indexOf('blue');
                            var imgtagpink=imageUrlnow.indexOf('pink');
                            if(imgtagblue>-1)
                            {
                                var imageNum=Number(imageUrlnow.substring(imageUrlnow.length-10,imageUrlnow.length-4));
                                if(imageNum<100)
                                {
                                    var  imageNumPlus=imageNum+1;
                                }
                                else
                                {
                                    imageNumPlus=0;
                                }
                                
                                var  imgcounStr=fillZero((imageNumPlus),6);
                                airportArr[i].ellipse.material.image._value='./images/imageChange/light_blue_'+imgcounStr+'.png';
                                
                            }
                            if(imgtagpink>-1)
                            {
                                var  imageNum=Number(imageUrlnow.substring(imageUrlnow.length-10,imageUrlnow.length-4));
                                if(imageNum<100)
                                {
                                    var  imageNumPlus=imageNum+1;
                                }
                                else
                                {
                                    imageNumPlus=0;
                                }
                                var  imgcounStr=fillZero((imageNumPlus),6);
                                airportArr[i].ellipse.material.image._value='./images/imageChange/pink_'+imgcounStr+'.png';
                            }
                            
                        }
                        imgcount++;
                    }
                    else
                    {
                        imgcount=0;
                    }
            },100);
    }
    //补全字符串
    function fillZero(number, digits){  
        number = String(number);  
        var length = number.length;  
        if(number.length<digits){  
            for(var i=0;i<digits-length;i++){  
                number = "0"+number;  
            }  
        }  
        return number;  
    }
    //计算圆周坐标
    function computeCircle(radius,centerPoint) 
    {
        var positions = [];
        for (var i = 0; i < 360; i++) {
            var radians = Cesium.Math.toRadians(i);
            var point3D=new Cesium.Cartesian3.fromDegrees((radius * Math.cos(radians)+centerPoint[0]),(radius * Math.sin(radians)+centerPoint[1]),centerPoint[2])
            
            positions.push(point3D);
        }
        return positions;
    }   
            
    var flyflight=[];
    var color1=new Cesium.Color(34/255,165/255,255/255);
    var color2=new Cesium.Color(255/255,59/255,179/255);
    var linecolor;
    //添加动态线
    addAirLines=function(flightArr)
    {
        var lineEntityArr=[]
        
        for(var i=0;i<flightArr.length;i++)
        {
            //console.log(i);
            var flightStr=flightArr[i];
            var StartStr=flightStr.substring(0,3);
            var EndStr=flightStr.substring(3,6);
            var startpoint=geoCoordMap[StartStr];
            var endpoint=geoCoordMap[EndStr];		
            
            var distance=getGreatCircleDistance(parseFloat(startpoint[0]),parseFloat(startpoint[1]),parseFloat(endpoint[0]),parseFloat(endpoint[1]));
            //console.log(distance);
            var pointArry=[parseFloat(startpoint[0]),parseFloat(startpoint[1]),parseFloat(endpoint[0]),parseFloat(endpoint[1])]
            if(Math.random()<0.5)
            {
                linecolor=color1;
            }
            else
            {
                linecolor=color2;
            }
            var lineEntity=viewer.entities.add({
                name : 'PolylineDynamic',
                show: false,
                polyline : {
                    positions : Cesium.Cartesian3.fromDegreesArray(pointArry),
                    width : 8,
                    hMax:distance/15,
                    material : new Cesium.PolylineDynamicMaterialProperty({
                        color : linecolor,
                        outlineWidth : 0,
                        outlineColor : Cesium.Color.BLACK,
                        bAsy:true
                    })
                }
            });	
            lineEntityArr.push(lineEntity);
        }
        return lineEntityArr;
    }
            var EARTH_RADIUS = 6378137.0;    //单位M
            var PI = Math.PI;
            function getRad(d)
            {
                return d*PI/180.0;
            }
            function getGreatCircleDistance(lng1,lat1,lng2,lat2)
            {
                var radLat1 = getRad(lat1);
                var radLat2 = getRad(lat2);

                var a = radLat1 - radLat2;
                var b = getRad(lng1) - getRad(lng2);

                var s = 2*Math.asin(Math.sqrt(Math.pow(Math.sin(a/2),2) + Math.cos(radLat1)*Math.cos(radLat2)*Math.pow(Math.sin(b/2),2)));
                s = s*EARTH_RADIUS;
                s = Math.round(s*10000)/10000.0;
                return s;
            }	
            LoadData();

            
            
    }
        
    var flightInfotimer=null;
    var flightInfoTag=false;

    function updataliMarquee(InfoDOM)
    {
        
        if(flightInfotimer!=null)
        {
            clearInterval(flightInfotimer);
        }
        quarterID=Number(InfoDOM.id);

        lineEntityArrVisible(quarterID);	

        var bottons=document.getElementsByClassName('flightInfotoolbutton');
        for(var i=1;i<5;i++)
        {
            if(i==InfoDOM.id)
            {
                
                bottons[i-1].style.backgroundColor='#1E1E1E';
                var infoStr1='flightInfoAll'+i+'1';
                var infoStr2='flightInfoAll'+i+'2';
                document.getElementById(infoStr1).style.display="block";
                document.getElementById(infoStr2).style.display="none";

                flightInfotimer=setInterval(function(){
                    if(flightInfoTag==true)
                    {
                        document.getElementById(infoStr1).style.display="none";
                        document.getElementById(infoStr2).style.display="block";

                        flightInfoTag=false;
                    }
                    else
                    {
                        document.getElementById(infoStr1).style.display="block";
                        document.getElementById(infoStr2).style.display="none";

                        flightInfoTag=true;							
                    }
                },5000);
                
            }
            else
            {
                bottons[i-1].style.backgroundColor='#646464'
                var infoStrB1='flightInfoAll'+i+'1';
                var infoStrB2='flightInfoAll'+i+'2';
                document.getElementById(infoStrB1).style.display="none";
                document.getElementById(infoStrB2).style.display="none";
            }
        }
        
    }