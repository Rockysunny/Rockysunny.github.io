// 从这里开始制作气泡图

function bubblechart() {
	// 设置SVG页面大小
	var width = 940;
  var height = 420;
  // 设置bubble的Tooltip
  // var bubble_tooltip=floatingTooltip('gates_tooltip', 240)
 	// 设置分类后bubble的走向和不同模式下的位置
    var center = { x: width / 2, y: height / 2+30};
    var yearCenters = {
	    0: { x: width/2-100, y: height / 2+30},
	    1: { x: width/2+100, y: height / 2+30},
  		};
	// 设置年份标记的横坐标位置
	var yearsTitleX = {
	    "改革开放前": width/2-150,
	    "改革开放后": width/2+130,
	  	};
	// @v4 strength to apply to the position forces设置位置节点排斥力效果的强度
  	var forceStrength = 0.05;
    // These will be set in create_nodes and create_vis设置节点
    var svg = null;
    var bubbles = null;
    var nodes = [];
    // 用来设置引力，pow(x,y) 方法可返回 x 的 y 次幂的值。
    function charge(d) {
    	return -Math.pow(d.radius,2.0) * forceStrength;
    }
    // 创造一个节点引力的框架，同时把力赋给每一个节点
    var simulation = d3.forceSimulation()
					   .velocityDecay(0.2)
					   .force('x', d3.forceX().strength(forceStrength).x(center.x))
					   .force('y', d3.forceY().strength(forceStrength).y(center.y))
					   .force('charge', d3.forceManyBody().strength(charge))
					   .on('tick', ticked);
  	// V4中力学仿真会自动开始，这里通过设置stop来暂时停止手动tick
  	simulation.stop();
	// // Nice looking colors - no reason to buck the trend
	// // @v4 scales now have a flattened naming scheme
	// var fillColor = d3.scaleOrdinal()
	// 			      .domain(['0','1','2','3'])
	// 			      .range(['#d84b2a','#beccae','#7aa25c','00477c']);
	// 将csv数据转化为nodes结构
  	function createNodes(rawData) {
    	// 获取半径坐标轴的最大数据单位
    	var maxAmount = d3.max(rawData, function (d) { return +d.number; });
    	// 为气泡图重新附着数据Sizes bubbles based on area.
    	// @v4: new flattened scale names.
    	// scalePow是一个指数比例尺，exponent是指数幂，range是实际的投射范围
	    var radiusScale = d3.scalePow()
						    .exponent(0.8)
						    .range([2,40])
						    .domain([0, maxAmount]);
		// 使用map将raw data转化为node结构，并使用这些数据
		// 想问x、y是啥
    	var myNodes = rawData.map(function (d) {    	
			return {id: d.id,
			        radius: radiusScale(+d.number),
			        value: +d.number,
			        name: d.country,
			        // org: d.organization,
			        group: d.durnation,
			        x: Math.random() * 900,
			        y: Math.random() * 800};
			    });
    	//排序防止小的节点被堵塞sort them to prevent occlusion of smaller nodes.
	    myNodes.sort(function (a, b) { return b.value - a.value; });
	    return myNodes;
	}
	// 用来创建bubblechart的svg
	var chart = function chart(selector, rawData) {
    	// 转换rawdata为node数据
   		nodes = createNodes(rawData);
	    // 创建svg元素并设置尺寸
	    // with desired size.
	    svg = d3.select(selector)
	      .append('svg')
	      .attr('width', width)
	      .attr('height', height);
    	// 让nodes数据和网页元素相结合，每一点赋予一个bubble的class属性，并反馈ID
    	bubbles = svg.selectAll('.bubble')
      				 .data(nodes, function (d) { return d.id; });
	    // 给每一个属性为bubble的圆球都创建以个元素，每一个nodes数据都有一个相对应的元素
	    // 设置初始半径为0,
	    // @v4 Selections are immutable, so lets capture the enter selection to apply our transtition to below.
	    var bubblesE = bubbles.enter().append('circle')
	      .classed('bubble', true)
	      .attr('r', 0)
	      .attr('fill', function (d) { return "#c28f53"; })
	      .attr('stroke', function (d) { return "#fff" })
	      .attr('stroke-width', 10);
	      // .on('mouseover', showDetail)
	      // .on('mouseout', hideDetail);
	    // 不停地添加元素
	    bubbles = bubbles.merge(bubblesE);
	    // Fancy transition to make bubbles appear, ending with the correct radius
	    // 实现梦幻变幻
	    bubbles.transition()
		       .duration(2000)
		       .attr('r', function (d) { return d.radius; })
           .attr('stroke', function (d) { return "#fff" })
           .attr('stroke-width', 0.5);

	    // 设置节点间的引力值Set the simulation's nodes to our newly created nodes array.
	    // @v4 Once we set the nodes, the simulation will start running automatically!
    	simulation.nodes(nodes);
    	// 为bubble设置原始的分组Set initial layout to single group.
    	groupBubbles();
  	};
  	/*
     * Callback function that is called after every tick of the
     * force simulation.
     * Here we do the acutal repositioning of the SVG circles
     * based on the current x and y values of their bound node data.
     * These x and y values are modified by the force simulation.
     */
    // 设置每一个tick后的节点的瞬间相对原始的位置
    function ticked() {bubbles
	    .attr('cx', function (d) { return d.x; })
	    .attr('cy', function (d) { return d.y; });
  	}

	/*Provides a x value for each node to be used with the split by year x force.*/
	// 获取每一个节点分开后的x方向上的坐标位置
  	function nodeYearPos(d) {return yearCenters[d.group].x;}
    /*
     * Sets visualization in "single group mode".
     * The year labels are hidden and the force layout
     * tick function is set to move all nodes to the center of the visualization.
    */
    // 重置切换模式前的可视化方案，初始隐藏分类title
  	function groupBubbles() {
    	hideYearTitles();
    	// @v4 Reset the 'x' force to draw the bubbles to the center.
    	// 初始设置以中心x为聚合点
    	simulation.force('x', d3.forceX().strength(forceStrength).x(center.x));
    	// @v4 We can reset the alpha value and restart the simulation
    	// 通过alpha重置
    	simulation.alpha(1).restart();
  	}
    /*
     * Sets visualization in "split by year mode".
     * The year labels are shown and the force layout
     * tick function is set to move nodes to the
     * yearCenter of their data's year.
    */
    // 设置切换模式后的可视化防范，tick功能被用来区分布局位置
    function splitBubbles() {
        showYearTitles();
        // @v4 Reset the 'x' force to draw the bubbles to their year centers
    	simulation.force('x', d3.forceX().strength(forceStrength).x(nodeYearPos));
    	// @v4 We can reset the alpha value and restart the simulation
    	simulation.alpha(1).restart();
  	}
  	// 设置title的display
    function hideYearTitles() {
        var bubbletitle = svg.append('text')
                      .attr('class','bubbletitle')
                      .attr('x',width / 2)
                      .attr('y',20)
                      .attr('text-anchor', 'middle')
                      .attr('fill','#c28f53')
                      .attr('stroke','#c28f53')
                      .text('世界各国与我国签约总量');
        svg.selectAll('.year').remove();}
  	function showYearTitles() {
	    // Another way to do this would be to create
	    // the year texts once and then just hide them.
    	var yearsData = d3.keys(yearsTitleX);
    	var years = svg.selectAll('.year')
      				   .data(yearsData);
	    years.enter().append('text')
	      .attr('class', 'year')
	      .attr('x', function (d) { return yearsTitleX[d]; })
	      .attr('y', 20)
	      .attr('text-anchor', 'middle')
        .attr('fill','#c28f53')
        .attr('stroke','#c28f53')
	      .text(function (d) { return d; });
      svg.selectAll('.bubbletitle').remove()
	  }
	// 制作mouseover之后的内容显示
  	function showDetail(d) {
    	//改变边框效果
    	d3.select(this).attr('stroke', 'black');
    	var content = '<span class="name">Title: </span><span class="value">' +
                  d.name +
                  '</span><br/>' +
                  '<span class="name">Amount: </span><span class="value">$' +
                  addCommas(d.value) +
                  '</span><br/>' +
                  '<span class="name">Year: </span><span class="value">' +
                  d.year +
                  '</span>';
    	tooltip.showTooltip(content, d3.event);
    }
  	function hideDetail(d) {
	    // reset outline
	    d3.select(this)
	      .attr('stroke', d3.rgb("#00477c")).darker();
    	tooltip.hideTooltip();
  	}
    /*
     * Externally accessible function (this is attached to the
     * returned chart function). Allows the visualization to toggle
     * between "single group" and "split by year" modes.
     * displayName is expected to be a string and either 'year' or 'all'.
    */
    function ifon(e) {
        if (e === 0) {
          groupBubbles();
        } else {
          splitBubbles();
        }
    }
    var a=document.body.clientHeight
    var controller = new ScrollMagic.Controller();
    var scene = new ScrollMagic.Scene({triggerHook:"onEnter",triggerElement: "#trigger",duration: a})
                        .addTo(controller)
                        .on("progress", function(e){
                          len=e.progress;
                          ifon(len);
                        }); 
    // 切换两种不同的模式，为chart再补充一个设计功能
    chart.toggleDisplay = function (displayName) {
        if (displayName === 'year') {
           splitBubbles();
        } else {
           groupBubbles();
    }};  	
    // return the chart function from closure.
  	return chart;
}
/*Below is the initialization code as well as some helper functions 
 *to create a new bubble chart instance, load the data, and display it.
 */
//定义myBubbleChart 为bubbleChart 
var myBubbleChart = bubblechart();
// 定义一个函数将数据从csv中导入，并且将图表放入#vis的div中
function display(error, data) {
  	if (error) {
    console.log(error);}
    myBubbleChart('#vis', data);
}
// 设置切换按钮
function setupButtons() {
  	d3.select('#toolbar')
      .selectAll('.button')
      .on('click', function () {
      // Remove active class from all buttons
      d3.selectAll('.button').classed('active', false);
      // Find the button just clicked
      var button = d3.select(this);

      // Set it as the active button
      button.classed('active', true);
      // Get the id of the button
      var buttonId = button.attr('id');
      // Toggle the bubble chart based on
      // the currently clicked button.
      myBubbleChart.toggleDisplay(buttonId);
    });
}
// Load the data.
d3.csv('data/timeduration.csv', display);
// setup the buttons.
setupButtons();


// 从这里开始制作桑基图区域--------------------------------------------------------------------------------------------

function sankeychart() {

  var units = "条";
  // set the dimensions and margins of the graph
  var margin = {top: 10, right: 10, bottom: 10, left: 10},
      width = 1000 - margin.left - margin.right,
      height = 900 - margin.top - margin.bottom;
  // format variables
  var formatNumber = d3.format(",.0f"),    // zero decimal places
      format = function(d) { return formatNumber(d) + " " + units; },
      color = d3.scaleOrdinal(d3.schemeCategory20c);
  // append the svg object to the body of the page
  var svg = d3.select("#sankeyvis").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", 
            "translate(" + margin.left + "," + margin.top + ")");
  // Set the sankey diagram properties
  var sankey = d3.sankey()
      .nodeWidth(36)
      .nodePadding(5)
      // .nodeSort(d3.descending(a.value, b.value))
      .size([width, height]);
  var path = sankey.link();
  console.log(units);
  // load the data
  d3.json("data/country_type02.json", function(error, graph) {
  var nodeMap = {};
  graph.nodes.forEach(function(x) { nodeMap[x.name] = x; });
  graph.links = graph.links.map(function(x) {
    return {
      source: nodeMap[x.source],
      target: nodeMap[x.target],
      value: x.value
    };
  });
  sankey
      .nodes(graph.nodes)
      .links(graph.links)
      .layout(32);//没意义？

  // add in the links
  var link = svg.append("g").selectAll(".link")
      .data(graph.links)
      .enter().append("path")
      .attr("class", "link")
      .attr("d", path)
      // .style("stroke", "red")
      .style("stroke-width", function(d) { return Math.max(1, d.dy); })
      // .sort(function(a, b) { return a.dy - b.dy; });
  // add the link titles
  link.append("title")
        .text(function(d) {
        return "中国与" + d.source.name + "共签署了 " + 
                 "\n" + format(d.value) + d.target.name + "条约"; });
  // add in the nodes
  var node = svg.append("g").selectAll(".node")
      .data(graph.nodes)
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { 
      return "translate(" + d.x + "," + d.y + ")"; })
      // .sort(function(a,b){ return a.value - b.value; })
      // add the rectangles for the nodes
  node.append("rect")
      .attr("height", function(d) { return d.dy; })
      .attr("width", sankey.nodeWidth())
      .style("fill", function(d) { 
        if(d.name == "边界海洋") {
          return "#904840"; 
        }else if (d.name == "环境") {
          return "#904840";
        }else if (d.name == "交通运输") {
          return "#904840";
        }else if (d.name == "经济") {
          return "#904840";
        }else if (d.name == "其他") {
          return "grey";
        }else if (d.name == "科技和知识产权") {
          return "#904840";
        }else if (d.name == "领事") {
          return "#904840";
        }else if (d.name == "农林") {
          return "#904840";
        }else if (d.name == "税收") {
          return "#904840";
        }else if (d.name == "通讯") {
          return "#904840";
        }else if (d.name == "投资贸易") {
          return "#904840";
        }else if (d.name == "卫生") {
          return "#904840";
        }else if (d.name == "文化"){
          return "#904840";
        }else if (d.name == "政治"){
          return "#904840";
        }else if (d.name == "苏联"){
          return "grey";
        }else{
          return "#00477c";
        }
  })
      .style("stroke", function(d) { 
      return d3.rgb(d.color).darker(3); })
    .append("title")
      .text(function(d) { 
      return d.name + "\n" + format(d.value); });
      // add in the title for the nodes
  node.append("text")
      .attr("x", -6)
      .attr("y", function(d) { return d.dy / 2; })
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .attr("transform", null)
      .text(function(d) { return d.name; })
    .filter(function(d) { return d.x < width / 2; })
      .attr("x", 6 + sankey.nodeWidth())
      .attr("text-anchor", "start");
  // the function for moving the nodes
  function dragmove(d) {
    sankey.relayout();
    link.attr("d", path);}
  });
  console.log(22222222)
}

// ---------------------------------------------------------------------------------------------------
function mutiplechart(){
  console.log("mutiplechart")
//完成基础设置 
  var fullwidth = 225,
      fullheight = 180;

  var margin = {top: 10, right: 10, bottom: 80, left: 40},
      width = fullwidth - margin.left - margin.right,
      height = fullheight - margin.top - margin.bottom;

  var parseDate = d3.timeParse("%Y");
  var formatDate = d3.timeFormat("%Y");

  var xScale = d3.scaleTime()
      .range([0, width-10])

  var yScale = d3.scaleLinear()
      .range([height, 0])

  var yAxis = d3.axisLeft(yScale)
      .ticks(4)
      .tickFormat("%");

  // helper functions for looking up things on mouseover
  var xValue = function(d) {
      return d.date;
  };
  var yValue = function(d) {
      return d.count;
  };

  var area = d3.area()
      .x(function(d) { return xScale(xValue(d)); })
      .y0(height)
      .y1(function(d) { return yScale(yValue(d)); });

  var line = d3.line()
      .x(function(d) { return xScale(xValue(d)); })
      .y(function(d) { return yScale(yValue(d)); });

  var data = [],
      circle = null,
      caption = null,
      curYear = null; 

  var bisect = d3.bisector(function(d) { //获取d.date这个数组项左边的位置
      return d.date;
  }).left;
  // bisect API https://github.com/d3/d3-array#bisectLeft
  // 中文各种d3语法简述 https://blog.csdn.net/kriszhang/article/details/70174410

  // Prep 1: scale data with functions
  function setupScales(data){
      var extentX, maxY;

      extentX = d3.extent(data[0].values, function(d){
          return xValue(d);
      })
      xScale.domain(extentX);

      maxY = d3.max(data, function(d){ 
          return d3.max(d.values, function(v){
              return yValue(v);
          })
      });
      console.log(maxY);
      yScale.domain([0, maxY + maxY * .25]);
      // console.log(maxY)
  }

  // Prep 2: 数据处理函数，返回层叠状况的数组
  function transformData(rawData) {
      rawData.forEach(function(r){
          r.date = parseDate(r.year);
          r.count = + r.ratio;
      });
      // 为数据换格式
      var nest = d3.nest()
          .key(function(r){ return r.country; })
          .sortValues(function(a,b){ return a.date - b.date; })
          .entries(rawData);
      console.log(nest);
      // 为数据转换为wide层叠data
      // 筛选空值？
      nest = nest.filter(function(n){
          return n.values.length == 68;
      })   

      return nest; 
  }

  // Prep 3: jquery lib to do the small multiple sorting
  function setupIsotope() {
      console.log("isotope");
      $("#mutiplevis").isotope({
          itemSelector: '.chart',
          layoutMode: 'fitRows',
          getSortData: {
              count: function(e) {
                  var d, sum;
                  d = d3.select(e).datum();
                  sum = d3.sum(d.values, function(d) {
                      return d.count;
                  });
                  return sum * -1;
              },
              country: function(e) {
                  var d;
                  d = d3.select(e).datum();
                  return d.key;
              }
          }
      });
      return $("#multiplevis").isotope({
          sortBy: 'ratio'
      });
  }


  d3.csv("data/MULTI_DATA.csv", function(error, data) { 

      if (error) { console.log(error); };
      var countries = transformData(data);
      console.log(countries)
      // 利用自定义函数，完成数据格式清理
      // “#vis”是放置multiple的区域，下列方法将数据导入了制图空间
      d3.select("#mutiplevis").datum(countries).each(function(myData){
          // mydata是单行数据
          setupScales(myData);
          var div = d3.select(this).selectAll(".chart").data(myData);
          // 把数据给div,每个div-svg-g
          var svg = div.enter()
              .append("div")
              .attr("class","chart")
              .append("svg")
              .attr("width", fullwidth)
              .attr("height", fullheight)
              .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

          // 每个g上+rect作为热区
          svg.append("rect")
              .attr("class", "background")
              .attr("width", width + margin.right) // extra space for labels that appear
              .attr("height", height)
              .style("pointer-events", "all")
              .on("mouseover", mouseover)
              .on("mousemove", mousemove)
              .on("mouseout", mouseout);

          // 每个g上+g.lines：用来画图——line区域才是真正可显示的画图区域
          var lines = svg.append("g").attr("class", "lines");
          //倒入area后的值
          lines.append("path")
              .attr("class", "area")
              .style("pointer-events", "none")
              .attr("d", function(c) {
                  return area(c.values);
              });
          // 倒入line之后的值

          lines.append("path")
              .attr("class", "line")
              .style("pointer-events", "none")
              .attr("d", function(c) {
                  return line(c.values);
              });
          // 下方年份左侧提醒（固定的）
          lines.append("text")
              .attr("class", "static_year")
              .attr("x", 0)
              .attr("y", height + margin.bottom/2)
              .style("text-anchor", "start")
              .text(function(c) {
                  return formatDate(c.values[0].date);
              });
          // 中间提示
          lines.append("text")
              .attr("class", "title")
              .attr("x", width/2)
              .attr("y", height+55)
              .style("text-anchor", "middle")
              .text(function(d) {
                  return d.key;
              });
          // 下方年份左侧提醒（固定的
          lines.append("text")
              .attr("class", "static_year")
              .attr("x", width)
              .attr("y", height + margin.bottom/2)
              .style("text-anchor", "end")
              .text(function(d) {
                  return formatDate(d.values[d.values.length - 1].date);
              });

          // mouseover会出现的circle
          var circle = lines.append("circle")
              .attr("class", "circle")
              .attr("opacity", 0)
              .attr("r", 2)
              .style("pointer-events", "none");

          // mouseover会出现的value
          var caption = lines.append("text")
              .attr("class", "caption")
              .attr("text-anchor", "middle")
              .style("pointer-events", "none")
              .attr("dy", -8);

          // mouseover会出现的year
          var curYear = lines.append("text")
              .attr("class", "curYear")
              .attr("text-anchor", "middle")
              .style("pointer-events", "none")
              .attr("dy", 13)
              .attr("y", height);


          lines.append("g").attr("class","yaxis").call(yAxis);

          function mouseover(){
              circle.attr("opacity", 1);
              d3.selectAll(".static_year").classed("hidden", true);
              // return mousemove.call(this);
          }

          function mousemove(){
              var year = xScale.invert(d3.mouse(this)[0]).getFullYear();
              var date = d3.timeParse("%Y")(year);

              var index = 0;
              circle
                  .attr("cx", xScale(date)) // locate the x using year date
                  .attr("cy", function(c) {
                      // find the closest value with bisect and the values for the circles y's
                      //console.log(c.values);
                      index = bisect(c.values, date, 0, c.values.length - 1); // which number is it?
                      return yScale(yValue(c.values[index])); // yValue just gets the count
                  });

              caption.attr("x", xScale(date))
                  .attr("y", function(c) {
                      return yScale(yValue(c.values[index]));
                  })
                  .text(function(c) {
                      return yValue(c.values[index]);
                  });
              return curYear.attr("x", xScale(date)).text(year);
          }

          function mouseout(){
              d3.selectAll(".static_year").classed("hidden", false);
              circle.attr("opacity", 0);
              caption.text("");
              return curYear.text("");
          }

      })
      setupIsotope(); 
  })
}
// -----------------------------------------------------------------------------------------------------
!function() {
  sankeychart();
  console.log(1);
  mutiplechart()
}();