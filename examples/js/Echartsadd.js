var myChart;
var myChart2
function addEcharts(DomID)
{
	var dom = document.getElementById(DomID);
	myChart = echarts.init(dom);
	var app = {};
	option = null;
	var uploadedDataURL = "data/echartsdata.xml";
	
	
	
	//myChart.showLoading();
$.get(uploadedDataURL, function (xml) {
    //myChart.hideLoading();

    var graph = echarts.dataTool.gexf.parse(xml);
/*    console.log(graph.nodes);
    console.log(graph.links);*/
    
    var categories = [];
    for (var i = 0; i < 7; i++) {
        categories[i] = {
            name: '类目' + i
        };
    }
    graph.nodes.forEach(function (node) {
        node.itemStyle = null;
        node.value = node.symbolSize;
        node.symbolSize /= 1.5;
        node.label = {
            normal: {
                show: node.symbolSize > 0
            }
        };
        node.category = node.attributes.modularity_class;
    });
    option = {
/*        title: {
            text: 'Les Miserables',
            subtext: 'Circular layout',
            top: 'bottom',
            left: 'right'
        },*/
        tooltip: {},
        grid:{
	    	bottom:'0',
	    	top:'0'
	    },
/*        legend:
        [{
            //selectedMode: 'single',
            selectedMode: false,
            data: categories.map(function (a) {
                return a.name;
            })
        }],*/
        animationDurationUpdate: 1500,
        animationEasingUpdate: 'quinticInOut',
        series : [
            {
                name: '',
                type: 'graph',
                layout: 'circular',
                circular: {
                    rotateLabel: true
                },
                data: graph.nodes,
                links: graph.links,
                categories: categories,
                roam: true,
                label: {
                    normal: {
                        position: 'right',
                        formatter: '{b}'
                    }
                },
                lineStyle: {
                    normal: {
                        color: 'source',
                        curveness: 0.3
                    }
                }
            }
        ]
    };


    myChart.setOption(option);
/*    myChart.on('legendselectchanged',function(obj){
    	//alert(obj);
    	//var tt=myChart.getOption().series;
    	//myChart.getOption().series[0].data[0].value=200;
    	      var option = myChart.getOption();
      option.series[0].data[0].value=200;   
      myChart.setOption(option); 
    	//var selected = obj.selected;
        //var legend = obj.name;
		
		});	*/	
    }, 'xml');
}

function grabuttonOnclick(value)
{
	var option = myChart.getOption();
	if(value==20)
	{
		
		for(var i=0;i<60;i++)
		{
			if(i<20)
			{
				option.series[0].data[i].value=100;  	
			}
			else
			{
				option.series[0].data[i].value=15; 
			}
			
		}
	    //myChart.clear();
	    //var tt=myChart.getOption();
	    myChart.setOption(option,true);		
	}
	if(value==40)
	{
		for(var i=0;i<60;i++)
		{
			if(i>=20&&i<40)
			{
				option.series[0].data[i].value=100;  
			}
			else
			{
				option.series[0].data[i].value=15; 
			}
			
		}
		//myChart.clear();
		//var tt=myChart.getOption();
		myChart.setOption(option,true);	
	     
	}
	if(value==60)
	{
		for(var i=0;i<60;i++)
		{
			if(i>40)
			{
				option.series[0].data[i].value=100;  	
			}
			else
			{
				option.series[0].data[i].value=15; 
			}
			
		}
		//myChart.clear();
		//var tt=myChart.getOption();
		myChart.setOption(option,true);	
	     
	}	
 
	
}

function addEcharts2()
{
	var dom = document.getElementById('echarts2');
	myChart2 = echarts.init(dom);
	var option;
	// Generate data
	var category = ['首尔-济州岛','札幌-羽田','羽田-福冈','墨尔本-悉尼','桃园-香港','孟买-新德里','冲绳-羽田','北京-虹桥','大阪-东京','里约-圣保罗'];	
	var barData2 = [700,610,580,500,420,390,385,385,370,365];
	var lineData = [53.9,91.6,86.3,76.1,100,46.3,90,100,100,99.8];
	//var barData2= [46.1,8.4,13.7,23.9,0,53.7,10,0,0,0.2];
	
	var barData = [377.3,558.76,500.54,319.62,420,180.57,346.5,385,370,357.7];
	var barData3= [322.7,51.24, 79.46, 180.38,0, 209.43,38.5,0,0,7.3];
	
	
/*	for (var i = 0; i < 20; i++) {
	    var date = new Date(dottedBase += 1000 * 3600 * 24);
	    category.push([
	        date.getFullYear(),
	        date.getMonth() + 1,
	        date.getDate()
	    ].join('-'));
	    var b = Math.random() * 200;
	    var d = Math.random() * 200;
	    barData.push(b)
	    lineData.push(d);
	}*/
	
	
	// option
	option = {
/*	    backgroundColor: '#0f375f',*/
	    tooltip: {
	        trigger: 'axis',
	        axisPointer: {
	            type: 'shadow',
	            label: {
	                show: true,
	                backgroundColor: '#333'
	            }
	        }
	    },
	    legend: {
	        data: ['全服务','总计','全服务百分比'],
	        bottom: '0',
	        textStyle: {
	            color: '#ccc'
	        }
	    },
	    xAxis: {
	        data: category,
	        axisLine: {
	            lineStyle: {
	                color: '#ccc'
	            }
	        },
	        axisLabel: {  
			   interval:0,
			   rotate:40 
			}
	    },
	    yAxis: {
	        splitLine: {show: false},
	        axisLine: {
	            lineStyle: {
	                color: '#ccc'
	            }
	        }
	    },
	    grid:{
	    	bottom:'20%'
	    },
	    series: [
	    {
	        name: '全服务百分比',
	        type: 'line',
	        smooth: true,
	        showAllSymbol: true,
	        symbol: 'emptyCircle',
	        symbolSize: 15,
	        data: lineData
	    }, 
	    {
	        name: '全服务',
	        type: 'bar',
	        barWidth: 14,
	        itemStyle: {
	            normal: {
	            	barBorderRadius: 5,
	                color: new echarts.graphic.LinearGradient(
	                    0, 0, 0, 1,
	                    [
	                        {offset: 0, color: '#14c8d4'},
	                        {offset: 1, color: '#43eec6'}
	                    ]
	                )
	            }
	        },
	        data: barData,
	        stack: 'test'
	    },
/*	    {
	        name: '底成本',
	        barGap: '-100%',
	        type: 'bar',
	        barWidth: 14,
	        itemStyle: {
	            normal: {
	            	barBorderRadius: 5,
	                color:'rgba(204,255,255,0.7)'
	            }
	        },
	        data: barData3,
	        stack: 'test'      
	        
	    },*/
		{
	        name: '总计',
	        type: 'pictorialBar',
	        symbol: 'rect',	        
	        //type: 'bar',
	        barWidth: 12,
	        itemStyle: {
	            normal: {
                color: new echarts.graphic.LinearGradient(
                    0, 0, 0, 1,
                    [
                        {offset: 0, color: 'rgba(0,255,255,1)'},
                        {offset: 0.5, color: 'rgba(0,255,255,0.4)'},
                        {offset: 1, color: 'rgba(0,255,255,0)'}
                    ]
                )
	            }
	        },
	        symbolRepeat: true,
	        symbolSize: [12, 4],
	        symbolMargin: 1,
	        z: -10,
	        data: barData2
	    }
	]
	};

	myChart2.setOption(option);
}

function EchartsDiVChange(chlickDIV)
{
	if(chlickDIV.id='echarts')
	{
			if(chlickDIV.style.width>50)
			{
				chlickDIV.style.width=00+'px';
				chlickDIV.style.hight=20+'px';
				
			}
			else
			{
				chlickDIV.style.width=500+'px';
				chlickDIV.style.hight=500+'px';
				
			}
		
	}
	else
	{
			if(chlickDIV.style.width>50)
			{
				chlickDIV.style.width=20+'px';
				chlickDIV.style.hight=20+'px';
				
			}
			else
			{
				chlickDIV.style.width=500+'px';
				chlickDIV.style.hight=300+'px';
				
			}
		
	}

	
}
