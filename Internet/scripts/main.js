var E = new ScrollMagic.Controller({
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
var index1 = [];
var index2 = [];
var index3 = [];
var index4 = [];
var districtByName = d3.map();
d3.csv("data/mapdata.csv",function(error,chartdata){
	console.log(chartdata);
	chartdata.forEach(function(d,i){
		index1.push({district:d.district,data:+d.internet_per_2016})
		index2.push({district:d.district,data:+d.datascore_2017})
		index3.push({district:d.district,data:+d.length_internet_2017})
		index4.push({district:d.district,data:+d.pop_eduction})        			
	});
	new ScrollMagic.Scene({
    	triggerElement: "#text001",
   		duration:document.getElementById("text001").height + document.documentElement.clientHeight
    }).addTo(E).on("enter",function(e){makemap(index1,color1);});
	new ScrollMagic.Scene({
    	triggerElement: "#text002",
   		duration:document.getElementById("text002").height + document.documentElement.clientHeight
    }).addTo(C).on("enter",function(e){makemap(index2,color2);});
	new ScrollMagic.Scene({
    	triggerElement: "#text003",
   		duration:document.getElementById("text003").height + document.documentElement.clientHeight
    }).addTo(C).on("enter",function(e){makemap(index3,color3);});
	new ScrollMagic.Scene({
    	triggerElement: "#text004",
   		duration:document.getElementById("text004").height + document.documentElement.clientHeight
    }).addTo(C).on("enter",function(e){makemap(index4,color4);});
});
color1=["#02AAE5","#f7fbff"];
color2=["#f7fbff","#E06902"];
color3=["#f7fbff","#E7D140"];
color4=["#f7fbff","#A6DC30"];
function makemap(index,color){
	d3.select(".legendLinear").remove();
	Array.from(index).forEach(function(d){
		d.data = + d.data;
		districtByName.set(d.district, d) 
		return d;
	})
	var width = 800;
	var height = 400;
	var svg = d3.select("#mapsvg")
				.append("svg") 
				.attr("class","mapmap")
	var china_g = svg.append("g");
	var projection = d3.geoMercator()
	var geoGenerator = d3.geoPath().projection(projection);
	var colorScale = d3.scaleLinear().range(color);
	function getColor(d){
		var district = districtByName.get(d.properties.name);
		console.log(district);
		if(district){
			return colorScale(district.data)
		}else{
			return "#ccc";
		}
	};
	function getvalue(d){
		var district = districtByName.get(d.properties.name);
		if(district){
			return district.data;
		}else{
			return "null";
		}
	};
	d3.json("data/china_diaoyudao.json",function(error,china){
		console.log(china.features);
		colorScale.domain(d3.extent(index, function(g){return g.data;}))
		projection.fitSize([800, 400],china);
		var china = china_g.selectAll("path")
					.data(china.features);
		china.enter()
			.append("path")
			.attr("d", geoGenerator)
			.on("mouseover", mouseoverFunc)
	        .on("mouseout", mouseoutFunc)
	        .on("mousemove", mousemoveFunc)
			.attr("fill", function(d){ return getColor(d); })
		// The d3-legend component is called here:
		d3.select(".legendLinear").remove();
		var linear = colorScale;

		svg.append("g")
			.attr("class", "legendLinear")
			.attr("transform", "translate(20,20)");

		var legendLinear = d3.legendColor()
			.shapeWidth(30)
			.orient("vertical")
			.labelFormat(d3.format(".0f"))
			.scale(linear);

		svg.select(".legendLinear")
			.call(legendLinear);

		formatvalue=d3.format(".0f")
		
		var tooltip = d3.select("body")
		.append("div")
		.attr("class", "tooltip");

	    function tooltips(){
	        d3.selectAll("geoGenerator")
	    }

	    function mouseoverFunc(d) {
	    	provalue=getvalue(d)
	        tooltip
	            .style("display", null) 
	            .html(
	                    d.properties.name
	                    // +formatvalue(provalue)
	                );}
	    function mousemoveFunc(d) {
	        tooltip
	            .style("top", (d3.event.pageY - 10) + "px" )
	            .style("left", (d3.event.pageX + 10) + "px");
	        }

	    function mouseoutFunc(d) {
	        tooltip.style("display", "none");  
	    }
		// 设置颜色获取的函数
	});
}
function pinchart(){
	var t = document.getElementById("chinamap")
    var scene = new ScrollMagic.Scene({
        triggerElement: "#chinamap",
        duration: t.parentNode.getBoundingClientRect().height
    }).addTo(L).setPin("#chinamap", {
        pushFollowers: !1});
}
// function spiralplot(){
// 	var   width = 500,
//         height = 500,
//         start = 0,
//         end = 2.25,
//         numSpirals = 2,
//         margin = {top:50,bottom:50,left:50,right:50};

//     var theta = function(r) {
//       return numSpirals * Math.PI * r;
//     };

//     // used to assign nodes color by group
//     var color = d3.scaleOrdinal(d3.schemeCategory10);

//     var r = d3.min([width, height]) / 2 - 80;

//     var radius = d3.scaleLinear()
//       .domain([start, end])
//       .range([80, r]);

//     var svg = d3.select("#peoplechart").append("svg")
//       .attr("width", width + margin.right + margin.left)
//       .attr("height", height + margin.left + margin.right)
//       .append("g")
//       .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

//     var points = d3.range(start, end + 0.001, (end - start) / 1000);

//     var spiral = d3.radialLine()
//       .curve(d3.curveCardinal)
//       .angle(theta)
//       .radius(radius);

//     var path = svg.append("path")
//       .datum(points)
//       .attr("id", "spiral")
//       .attr("d", spiral)
//       .style("fill", "none")
//       .style("stroke", "steelblue");

//     var spiralLength = path.node().getTotalLength(),
//         N = 21,
//         barWidth = (spiralLength / N) - 1;
    
//     d3.csv("data/popinternet",function(error,someData){
//     	var XScale = d3.scaleLinear()
//        		.domain(d3.extent(someData, function(d){
//         		return d.date;
//       		}))
//       		.range([0, spiralLength]);

//     // yScale for the bar height
//     var yScale = d3.scaleLinear()
//       .domain([0, d3.max(someData, function(d){
//         return d.value;
//       })])
//       .range([0, (r / numSpirals) - 70]);

//     svg.selectAll("rect")
//       .data(someData)
//       .enter()
//       .append("rect")
//       .attr("x", function(d,i){
        
//         var linePer = XScale(d.date),
//             posOnLine = path.node().getPointAtLength(linePer),
//             angleOnLine = path.node().getPointAtLength(linePer - barWidth);
      
//         d.linePer = linePer; // % distance are on the spiral
//         d.x = posOnLine.x; // x postion on the spiral
//         d.y = posOnLine.y; // y position on the spiral
        
//         d.a = (Math.atan2(angleOnLine.y, angleOnLine.x) * 180 / Math.PI) - 90; //angle at the spiral position

//         return d.x;
//       })
//       .attr("y", function(d){
//         return d.y;
//       })
//       .attr("width", function(d){
//         return barWidth;
//       })
//       .attr("height", function(d){
//         return yScale(d.value);
//       })
//       .style("fill", function(d){return color(d.group);})
//       .style("stroke", "none")
//       .attr("transform", function(d){
//         return "rotate(" + d.a + "," + d.x  + "," + d.y + ")"; // rotate the bar
//       });
    
//     // add date labels
//     var tF = d3.timeFormat("%b %Y"),
//         firstInMonth = {};

//     svg.selectAll("text")
//       .data(someData)
//       .enter()
//       .append("text")
//       .attr("dy", 10)
//       .style("text-anchor", "start")
//       .style("font", "10px arial")
//       .append("textPath")
//       // only add for the first of each month
//       .filter(function(d){
//         var sd = tF(d.date);
//         if (!firstInMonth[sd]){
//           firstInMonth[sd] = 1;
//           return true;
//         }
//         return false;
//       })
//       .text(function(d){
//         return tF(d.date);
//       })
//       // place text along spiral
//       .attr("xlink:href", "#spiral")
//       .style("fill", "grey")
//       .attr("startOffset", function(d){
//         return ((d.linePer / spiralLength) * 100) + "%";
//       })


//     var tooltip = d3.select("#chart")
//     .append('div')
//     .attr('class', 'tooltip');

//     tooltip.append('div')
//     .attr('class', 'date');
//     tooltip.append('div')
//     .attr('class', 'value');

//     svg.selectAll("rect")
//     .on('mouseover', function(d) {

//         tooltip.select('.date').html("Date: <b>" + d.date.toDateString() + "</b>");
//         tooltip.select('.value').html("Value: <b>" + Math.round(d.value*100)/100 + "<b>");

//         d3.select(this)
//         .style("fill","#FFFFFF")
//         .style("stroke","#000000")
//         .style("stroke-width","2px");

//         tooltip.style('display', 'block');
//         tooltip.style('opacity',2);

//     })
//     .on('mousemove', function(d) {
//         tooltip.style('top', (d3.event.layerY + 10) + 'px')
//         .style('left', (d3.event.layerX - 25) + 'px');
//     })
//     .on('mouseout', function(d) {
//         d3.selectAll("rect")
//         .style("fill", function(d){return color(d.group);})
//         .style("stroke", "none")

//         tooltip.style('display', 'none');
//         tooltip.style('opacity',0);
//     });
//     })
// }
function makebarchart(){
  //准备画布大小
  var margin = {top: 40, right: 20, bottom: 30, left: 40},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;
  // *
  var xScale = d3.scaleBand().range([0,width])
                             .paddingInner(0.3)
                              .paddingOuter(0.3);
  var yScale = d3.scaleLinear().range([height, 0]);
  // *
  var xAxis = d3.axisBottom(xScale);
  var yAxis = d3.axisLeft(yScale);

  // 开始准备svg
  var svg = d3.select("#peoplechart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.csv("data/popinternet", function(error, data) {
    data.forEach(function(d){
          d.value = +d.value;    
    })
    // 完善X轴比例尺的DOMAIN
    xScale.domain(data.map(function(d) { return d.year; }));

    yScale.domain([0,d3.max(data, function(d) { return d.value;})*1.1
      ]);
    //将X轴下移 
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
    // Y轴样式设计？？？？
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
       .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y",6)
        .attr("dy",".71em")
        .style("text-anchor", "end")
        .text("Frequency");

    svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return xScale(d.year); })
        .attr("width", xScale.bandwidth())
        .attr("y", function(d) { return yScale(d.value); })
        .attr("height", function(d) { 
          return height - yScale(d.value); })
});
}
pinchart();
makebarchart();
spiralplot();