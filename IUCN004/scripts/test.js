d3.csv("animaldata.csv",function(error,chartdata){
	// 以下是数据处理部分
	var chartdataYearNest = d3.nest().key(function(d){
		return d.year;
	})
	.entries(chartdata);
	console.log(chartdata);
	console.log(chartdataYearNest);
	// 按年份汇总数据完毕，之后或许相关最大值计算物理高度和宽度
	var minYear = d3.min(chartdataYearNest, function(d) { return +d.key });
	var maxYear = d3.max(chartdataYearNest, function(d) { return +d.key });
	var maxCount = d3.max(chartdataYearNest, function(d) { return +d.values.length });	
	var chartHeight = maxCount*12;
	var width = (maxYear-minYear)*16
	var offset = 0;
	var count = 0;
	var columnWidth = 16;
	var DataObject = [];
	for (var year in chartdataYearNest){
		// 对每一个年份进行循环设置，包括x坐标与y坐标
		var yearData = chartdataYearNest[year].key;
		var xPos = columnWidth*(chartdataYearNest[year].key - minYear)+offset;
		// 设置每一个原点柱横坐标的位移
		var yPos;
		var id;
		var nestCount;
		// page是chartdataYearNest[year]的一个查询变量
		for (var page in chartdataYearNest[year].values){
			id = chartdataYearNest[year].values[page].ID;
			nestCount = count++;
			yPos = chartHeight - page*12;
			DataObject.push({x:xPos,y:yPos,id:id,pageData:chartdataYearNest[year].values[page],nestCount:nestCount});
		}
	}
	// 以下是物理区域的设置过程
	var base = d3.select("#chartarea")
	base.style("width",width+10+"px")
	var circlesData = base.append("div")
		.attr("class",function(d){
			return "chart-data"
		})
		.style("height",maxCount*12+10+"px")
		.selectAll("div")
		.data(DataObject,function(d){
			return d.id
		});

	var circlesAppend = circlesData
		.enter()
		.append("div")
		.attr("class","circle")
		.style("position", "absolute")
  		.style("left", function(d, i) {
			return d.x + "px";
  		})
		.style("top", function(d, i) {
			return d.y + "px";
		})
		.on("mouseover", mouseoverFunc)
		.on("mousemove", mousemoveFunc)
		.on("mouseout", mouseoutFunc);
	// 以上为数据和物理页面区域初始化的过程
	// 接下来定义数据切换的函数
	function Chartpos(sectionFilter){
		// 先做是不是初始状态的判定
		if(sectionFilter >=1){
			var BetterFilter = chartdata.filter(function(d,i){
				return d.index1=="变好"
			});
			var WorseFilter = chartdata.filter(function(d,i){
				return d.index1=="变差"
			});
			console.log(BetterFilter);
			console.log(WorseFilter);
			// 以上分别筛选出了两类数据，接下来要对数据都进行按年汇总，并且分别计算其y坐标，最后将计算结果合并为一个数组制图
			var filterDataObject = BetterArray(BetterFilter).concat(WorseArray(WorseFilter));
			console.log(filterDataObject);
			circlesData = circlesData.data(filterDataObject,function(d){
				return d.id;
			});
			circlesData
				.classed("section-filtered",function(d,i){
					if(d.match){
						return true;
					}else{
					return false;
					}
				})
				.transition().duration(600)
				.delay(function(d,i){
					return i*2;
				})
				.style("top", function(d, i) {
					if(d.match){
						return (+d.y+chartHeight+10) + "px";
					}else{
					return (+d.y) + "px";
					}
				});
		}
		else if(sectionFilter == 0){
			var objectFilter = chartdata;
			var filterDataObject = WorseArray(objectFilter);
			circlesData = circlesData.data(filterDataObject,function(d){
					return d.id;
			});
			circlesData
				.classed("section-filtered",function(d,i){
					if(d.match){
						return true;
					}else{
						return false;
					}
				})
				.transition().duration(600)
				.delay(function(d,i){
					return i*2;
				})
				.style("top", function(d, i) {
					if(d.match){
						return (+d.y+chartHeight) + "px";
					}else{
						return (+d.y) + "px";
					}
				});	
		}
		function BetterArray (dataArray){
			var chartdataYearNest = d3.nest().key(function(d){
				return d.year;
			}).entries(dataArray);

			var minYear = d3.min(chartdataYearNest, function(d) { return +d.key });
			var maxYear = d3.max(chartdataYearNest, function(d) { return +d.key });
			var maxCount = d3.max(chartdataYearNest, function(d) { return +d.values.length });	
			var chartHeight = maxCount*12;
			var filterDataObject = [];
			var width = (maxYear-minYear)*16
			var offset = 0;
			var count = 0;
			//
			for (var year in chartdataYearNest){
				var yearData = chartdataYearNest[year].key;
				var xPos = 16*(chartdataYearNest[year].key - minYear)+offset;
				var yPos;
				var id;
				var nestCount;

				for (page in chartdataYearNest[year].values){
					id = chartdataYearNest[year].values[page].ID
					nestCount = count++;
					yPos = page*12+25;
					filterDataObject.push({x:xPos,y:yPos,id:id,index2:chartdataYearNest[year].values[page].index2,pageData:chartdataYearNest[year].values[page],nestCount:nestCount,match:1})
				}
			}
			return filterDataObject;
		}	
		function WorseArray (dataArray){
			var chartdataYearNest = d3.nest().key(function(d){
				return d.year;
			}).entries(dataArray);
			var minYear = d3.min(chartdataYearNest, function(d) { return +d.key });
			var maxYear = d3.max(chartdataYearNest, function(d) { return +d.key });
			var maxCount = d3.max(chartdataYearNest, function(d) { return +d.values.length });	
			var chartHeight = maxCount*12;
			var filterDataObject = [];
			var width = (maxYear-minYear)*16
			var offset = 0;
			var count = 0;
			for (var year in chartdataYearNest){
				var yearData = chartdataYearNest[year].key;
				var xPos = 16*(chartdataYearNest[year].key - minYear)+offset;
				var yPos;
				var id;
				var nestCount;

				for (page in chartdataYearNest[year].values){
					id = chartdataYearNest[year].values[page].ID
					nestCount = count++;
					yPos = chartHeight - page*12+25;
					filterDataObject.push({x:xPos,y:yPos,id:id,index2:chartdataYearNest[year].values[page].index2,pageData:chartdataYearNest[year].values[page],nestCount:nestCount,match:0})
				}
			}
			return filterDataObject;
		}			
	}
	var ChartAxis = d3.select("#chartarea")
		.append("div")
		.attr("class","chart-axis");

	ChartAxis
		.append("div")
		.attr("class","second-axis-container-wrapper")
		.style("width",function(){
			return "100%"
		})
		.selectAll("div")
		.data(d3.range(2007,2019,1))
		.enter()
		.append("div")
		.attr("class","second-chart-axis-item")
		.text(function(d,i){return d;});		
	// 现在返回	"scrollbegan"即可完成切换动效，接下来是控制颜色的动效
	// 首先要在返回的数据中增加index2的控制数据点,接着是根据scroll返回值变化颜色的
	function betterbetter() {
		circlesData
			.transition().duration(600)
			.delay(function(d,i){
				return 600+i*2;})
			.style("background",function(d){	
				if (d.index2 == "1") {
					return "#f29268";
				}
			})
	};
	function worseworse() {
		circlesData
			.transition().duration(600)
			.delay(function(d,i){
				return 600+i*2;})
			.style("background",function(d){	
				if (d.index2 == "2") {
					return "#88e2e2";
				}
			})
	};
	function huifu() {
		circlesData
			.transition().duration(600)
			.delay(function(d,i){
				return i*2;})
			.style("background","white")
	};	
	// 接下来是设置tooltip
	var tooltip = d3.select("body")
			        .append("div")
			        .attr("class", "tooltip");
	function mouseoverFunc(d) {
        tooltip.style("display", null);
        console.log(d.pageData);
        tooltip
        	.html("<p>"+d.pageData.Scientificname+"</p>");            	
    };
    // 此处css样式仍然需要修改
    function mousemoveFunc(d) {
        tooltip
            .style("top", (d3.event.pageY - 10) + "px" )
            .style("left", (d3.event.pageX + 10) + "px");
    };
    function mouseoutFunc(d) {
	    tooltip.style("display", "none"); 
	};
	// 接下来是scroll的控制时间
	// var scrollindex;
	function scrollcontroller(scrollindex) {
		Chartpos(scrollindex);
		if (scrollindex==2) {
			betterbetter();
		}
		else if(scrollindex==3){
			worseworse();
			console.log(success);
		}
		else if (scrollindex==0) {
			huifu();
		}
		else if (scrollindex==1){
			huifu();
		}
		;
	};
	// scrollcontroller(scrollindex);
	E = new ScrollMagic.Controller({
            globalSceneOptions: {
                triggerHook: "onEnter"
            }
        })
    , C = new ScrollMagic.Controller({
            globalSceneOptions: {
                triggerHook: "onCenter"
            }
        })
    , L = new ScrollMagic.Controller({
            globalSceneOptions: {
                triggerHook: "onLeave"
            }
        });
    console.log($("#chapter1")["0"].clientWidth);
	new ScrollMagic.Scene({triggerElement: "#trigger1", duration:$(".mainchart")["0"].clientHeight})
		.setPin("#chartpin",{pushFollowers: !1})
		.addTo(L);

	var a = new ScrollMagic.Scene({triggerElement: "#trigger2", duration:500})
		.on("enter",function(e){
			scrollcontroller(1)
		})
		.on("leave",function(e){
			if (e.state == "BEFORE") {
				scrollcontroller(0);
				console.log(0);
			};
			console.log(e)
		})
		.addTo(C);

	var a = new ScrollMagic.Scene({triggerElement: "#trigger3", duration:500})
		.on("enter",function(e){
			scrollcontroller(2)
		})
		.on("leave",function(e){
			if (e.state == "AFTER") {
				scrollcontroller(3);
			};
			console.log(e)
		})
		.addTo(C);
})