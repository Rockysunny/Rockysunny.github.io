// 从这里开始制作气泡图

function bubblechart() {
	var width = 940;
  var height = 420;
  // 设置bubble的Tooltip
  // var bubble_tooltip=floatingTooltip('gates_tooltip', 240)
 	// 设置分类后bubble的走向和不同模式下的位置
    var center = { x: width / 2, y: height / 2+30};
    var yearCenters = {
	    0: { x: width/3-100, y: height / 2},
	    1: { x: width/2, y: height / 2},
      2: { x: 2*width/3+100, y: height / 2},
  		};
	// 设置年份标记的横坐标位置
	var yearsTitleX = {
	    "西部": width/3-100,
	    "中部": width/2,
      "东部": 2*width/3+100,
	  	};
	// @v4 strength to apply to the position forces设置位置节点排斥力效果的强度
  	var forceStrength = 0.05;
    // These will be set in create_nodes and create_vis设置节点
    var svg = null;
    var bubbles = null;
    var nodes = [];
    // 用来设置引力，pow(x,y) 方法可返回 x 的 y 次幂的值。
    var colorScale = d3.scaleLinear().range(["#bcd8ff","#417fad"]); 
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
	// 			      .range(['#d84b2a','#beccae','#7aa25c','#00477c']);
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
              per: d.percent,
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
      colorScale.domain(d3.extent(rawData, function(g){return g.percent;}))
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
	      .attr('fill', function (d) { return colorScale(d.per); })
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
                      .attr('fill','#417fad')
                      .attr('stroke','#417fad')
                      .text('中国（大陆地区）31各省人口数与互联网普及率');
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
        .attr('fill','#417fad')
        .attr('stroke','#417fad')
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
    var scene = new ScrollMagic.Scene({triggerHook:"onLeave",triggerElement: "#trigger",duration: a})
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
  	if (error) {console.log(error);}
    myBubbleChart('#vis', data);
}
// Load the data.
d3.csv('data/timeduration.csv', display);
