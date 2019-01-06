    	var fullwidth_ele = 700;
		var fullheight_ele = 200;

		var elemargin = { top: 20, right: 10, bottom: 50, left: 90 };

		var elewidth = fullwidth_ele - elemargin.left - elemargin.right;
		var eleheight = fullheight_ele - elemargin.top - elemargin.bottom;

       	var elesvg = d3.select("#elevationchart")
   					.append("g")
					.attr("transform", "translate(" + elemargin.left + "," + elemargin.top + ")");
		var dotRadius = 5; 
		var elexScale = d3.scaleLinear()
						.range([ 0, elewidth ])
						.domain([-45,45]);
		var eleyScale = d3.scaleLinear()
						.range([ eleheight, 0 ])
						.domain([-1000,5000]);
		var elexAxis = d3.axisBottom(elexScale); 
		var eleyAxis = d3.axisLeft(eleyScale)
						.ticks(5)
						.scale(eleyScale);

		elesvg.append("text")
			.attr("class", "xlabel")
			.attr("transform", "translate(" + (elewidth / 2) + " ," +
				(eleheight + 20) + ")")
			.style("text-anchor", "middle")
			.attr("dy", "0")
			.text("南极洲90°E——90°W横截面");

		elesvg.append("text")
			.attr("class", "ylabel")
			.attr("transform","rotate(-90) translate(" + (-eleheight/2) + ",-25)")
			.style("text-anchor", "middle")
			.attr("dy", -25)
			.text("海拔/m");
		elesvg.append("g")
		.attr("class", "y axis")
		.call(eleyAxis);

		var eletooltip = d3.select("body")
                .append("div")
                .attr("class", "tooltip")
	    //tooltip制作
	    function mouseoverFunc(d) {
	            console.log(d);
	            eletooltip
	                .style("display", null) // 区别"none": 不呈现；"null": 取消之前所有给display的属性。
	                .style("stroke","#123")
	                .attr("stroke-width", 0.5)
	                .html("<p>"+d.name_eng +"站，海拔高"+d.elev_m+"米</p>");

	            d3.select(this)
	                .attr("r", dotRadius * 2)
	                .attr("stroke","rgba(251, 54, 29, 1)");
	        }

	    function mousemoveFunc(d) {
	            // console.log("events", window.event, d3.event);
	            eletooltip
	                .style("top", (d3.event.pageY - 10) + "px" )
	                .style("left", (d3.event.pageX + 10) + "px");
	        }

	    function mouseoutFunc(d) {
	            eletooltip.style("display", "none"); 
	            d3.select(this)
	              .attr("r", dotRadius)
	              .attr("fill-opacity", 1)
	              .attr("stroke","white");;
	        }

		// 开始设置scroll
	    var i = new ScrollMagic.Controller({
	        globalSceneOptions: {
	            triggerHook: "onEnter"
	        }
	    })
	      , c = new ScrollMagic.Controller({
	        globalSceneOptions: {
	            triggerHook: "onCenter"
	        }
	    })
	      , f = new ScrollMagic.Controller({
	        globalSceneOptions: {
	            triggerHook: "onLeave"
	        }
	    });	

        new ScrollMagic.Scene({
            triggerElement: "#eletrigger",
            duration:800
            }).addTo(c).on("enter",function(e){

		        d3.csv("dist/elevation_cut.csv", function(data) {

				var elecircles = elesvg.selectAll("circle")
							.data(data)
							.enter()
							.append("circle");
				elecircles.attr("cx", function(d) {
						return elexScale(+d.cut_point);
					})
					.attr("cy", function(d) {
						return eleyScale(+d.elev_m);
					})
					.attr("class", function(d){
						// highlighting some interesting outliers
						if (d.name_eng == "Kunlun" ) {
							return "highlighted";
						}
						else {
							return "dots";
						}
					})

				elecircles
					.transition()
					.delay(function(d, i) {
						return i * 20;
					})
					.duration(1000)  
					.attr("r",function(d){
					if (d.name_eng == "Kunlun" ) {
							return dotRadius * 1.3 ;
						}
						else {
							return dotRadius ;
						}	
					});

					elesvg.append("text")
					        .attr("class", "e_intro")
							.attr("transform", "translate(" + 450 + " ," +
										(eleheight -145) + ")")
							.style("text-anchor", "middle")
							.attr("dy", "20")
					        .text("冰盖高点：昆仑站（海拔：4087米）");
					elecircles
				        .on("mouseover", mouseoverFunc) // see below...
				        .on("mousemove", mousemoveFunc) // see below...
				        .on("mouseout", mouseoutFunc); // see below...


					});


            }) 

		
		