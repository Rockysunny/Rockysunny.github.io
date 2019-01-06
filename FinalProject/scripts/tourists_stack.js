var fullwidth = 700,
    fullheight = 500;

        var margin = {top: 20, right:100, bottom: 30, left: 60},
            width = fullwidth - margin.left - margin.right,
            height = fullheight - margin.top - margin.bottom;

        var svg = d3.select("#touristchart").append("svg")
                .attr("width", fullwidth )
                .attr("height", fullheight)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var formatDate = d3.timeFormat("%Y");
        var parseDate = d3.timeParse("%Y年");

        var xScale = d3.scaleBand()
                .range([0, width])
                .padding(0.1);

        var yScale = d3.scaleLinear()
                .range([height, 0]);

        var colorScale = d3.scaleOrdinal(d3.schemeCategory20c); 
        var xAxis = d3.axisBottom(xScale).ticks(10);
        var yAxis = d3.axisLeft(yScale);

        

        var stack = d3.stack();


        d3.csv("dist/country_percent.csv", function(error, data) {

            if (error) { console.log(error); };

            svg.append("text")
                .attr("class", "label")
                .attr("dx","15")
                .attr("dy","-10")
                .attr("color","black")
                .style("z-index","99")
                .text("（人数）"); 

            svg.append("text")
                .attr("class", "label")
                .attr("dx","580")
                .attr("dy","450")
                .attr("color","black")
                .style("z-index","99")
                .text("年份"); 

            // wide data6
            var dataset =  d3.nest()
                .key(function(d) { return d.Year; }).sortKeys(d3.ascending)
                .rollup(function(d) { 
                    return d.reduce(function(prev, curr) {
                      prev["Year"] = curr["Year"];
                      prev[curr["SortName"]] = curr["Amount"];
                      return prev;
                    }, {});
                })
                .entries(data)
                .map(function(d) { return d.value; });

            // console.log("dataset", dataset)

            var sort = ["其他","美国","澳大利亚","德国","英国","中国","加拿大","法国","瑞士","荷兰","日本"]

            stack.keys(sort)

            xScale.domain(dataset.map(function(d){ return d.Year;} ))

            

            // 1. default "Count"
            // 1.1 初始参数
            stack.offset(d3.stackOffsetNone);
            var layers = stack(dataset);
                       
            draw(layers);

            // 1.2 初始stacks
            var series = svg.selectAll("g.series")
                .data(layers);
            series
                .enter().append("g")
                .attr("class", "series")
             //    .style("fill", function(d) { 
             //     if (d.SortName === "中国") {
             //   return "black";
             // }
             // else {
             //        return colorScale(d.key); 
             //    }})

             //    
             //    .attr("fill-opacity", function(d){
             //    if (d.CountryName === "World") {
             //   return 0.8;
             // }
             // else {
             //   return 0.5;
             // }})

            series
                .selectAll("rect.rect")
                .data(function(d){ return d; })
                .enter().append("rect")
                .attr("class","rect")
                .attr("x",function(d) { return xScale(d.data.Year); })
                .attr("y",function(d) { return yScale(d[1]); })
                .attr("width", xScale.bandwidth())
                .attr("height", function(d) { return yScale(d[0]) - yScale(d[1]) ; })


            // 1.3 初始click
            d3.selectAll("span").on("click", handleFormClick);
            d3.select("#bycount").style("background-color","#306084");
            d3.select("#bycount").style("color","#fff");
            // 2 update 
            // 2.1 update handler
            function handleFormClick() {
                if (this.id === "bypercent") {
                    d3.select("#bypercent").style("background-color","#306084");
                    d3.select("#bypercent").style("color","#fff");      
                    d3.select("#bycount").style("background-color","#fff");
                    d3.select("#bycount").style("color","#306084");
                    yAxis.tickFormat(d3.format(".0%"));
                    stack.offset(d3.stackOffsetExpand);
                    layers = stack(dataset);
                    draw(layers);
                } else {
                    d3.select("#bypercent").style("background-color","#fff");
                    d3.select("#bypercent").style("color","#306084");      
                    d3.select("#bycount").style("background-color","#306084");
                    d3.select("#bycount").style("color","#fff");
                    yAxis.tickFormat(d3.format(",.0f"));
                    stack.offset(d3.stackOffsetNone);
                    layers = stack(dataset);
                    draw(layers);
                };
            }

            // 2.2 update draw data
            function draw(layers){

                // layers = stack(dataset);
                // console.log("layers", layers); 
                var maxY = d3.max(
                    layers,  function(l){
                        return d3.max(l, function(d) { return d[1]; })
                    }
                ) 
                yScale.domain([0, maxY]); 

                var series = svg.selectAll("g.series")
                    .data(layers);

                    console.log(layers);

                series
                    .enter().append("g")
                    .attr("class", "series")
                    .style("fill", function(d) { 
                    
                    if(d.key == "其他"){
                    return "#064b6b"; 
                }
                    else if(d.key == "美国"){
                    return "#166c94"; 
                }
                    else if(d.key == "澳大利亚"){
                    return "#166c94"; 
                }
                    else if(d.key == "德国"){
                    return "#9ec6d8"; 
                }
                    else if(d.key == "英国"){
                    return "#cee6f1"; 
                }
                    else if(d.key == "中国") {
                    return "#104842";
                }
                    else if(d.key == "加拿大"){
                    return "#237c72"; 
                }
                    else if(d.key == "法国"){
                    return "#5ac4b8"; 
                }
                    else if(d.key == "瑞士"){
                    return "#84d4cc"; 
                }
                    else if(d.key == "荷兰"){
                    return "#b3ece6"; 
                }
                    else{
                        return "#e0f9f6";
                    }


            })
                    .attr("fill-opacity",function(d){
                        if(d.key == "中国"){
                            return 1;
                        }
                        else{
                            return 1;
                        }
                    })
                    .attr("stroke","white")
                    .attr("stroke-width", 0.5)

                // var rects = series
                series
                    .selectAll("rect.rect")
                    .data(function(d){ return d; })
                    .enter().append("rect")
                    .attr("class","rect")
                    .attr("x",function(d) { return xScale(d.data.Year); })
                    .attr("width", xScale.bandwidth())
                    .on("mouseover", t_mouseoverFunc) // see below...
                    // .on("mousemove", t_mousemoveFunc) // see below...
                    .on("mouseout", t_mouseoutFunc); // see below...


                d3.selectAll("rect.rect")
                    .transition()
                    .duration(250)
                    .attr("y",function(d) { return yScale(d[1]); })
                    .attr("height", function(d) { return yScale(d[0]) - yScale(d[1]) ; })
                    // .append("title")
                    // .text(function(d) {
                    //     return d.key; // country is the key in the nest
                    // });
                series.exit().remove()
                svg.selectAll(".y.axis").transition().call(yAxis);


                

            } // end of draw()

    function t_mouseoverFunc(d) {
            console.log(d);
            
            d3.select(this)
              .transition()
                .attr("fill-opacity", 0.5)
                .style("stroke","black");

            // var parent = d3.select(this).node().parentNode.__data__;
        }

    // function t_mousemoveFunc(d) {
    //         // console.log("events", window.event, d3.event);
    //         console.log(d);
    //     }

    function t_mouseoutFunc(d) {

            d3.select(this)
              .transition()
              .attr("fill-opacity", 1)
              .style("stroke","white");
        }
            
            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis);

            // 图例 legend, based on http://bl.ocks.org/mbostock/3886208

            // layers的数据顺序并不是从0到max去排的，所以我们需要先手动排一下

            layers.sort(function(a,b){
                return a[0][0] - b[0][0];
            })
            var layers_key = layers.map(function(l){ return l.key; })

            // 数据的顺序是从基线往上，但我们给legend需要从上往下，所以要.reverse()
            var legend_order = layers_key.slice().reverse();

            console.log("legend_order",legend_order);

            var legend = svg.selectAll(".legend")
                .data(legend_order)
                .enter().append("g")
                .attr("class", "legend")
                .attr("transform", function(d, i) { return "translate(30," + i * 20 + ")"; });

            legend.append("rect")
                .attr("x", width)
                .attr("width", 18)
                .attr("height", 18)
                .style("fill", function(d) {
                    if(d == "其他"){
                    return "#064b6b"; 
                }
                    else if(d == "美国"){
                    return "#166c94"; 
                }
                    else if(d == "澳大利亚"){
                    return "#166c94"; 
                }
                    else if(d == "德国"){
                    return "#9ec6d8"; 
                }
                    else if(d == "英国"){
                    return "#cee6f1"; 
                }
                    else if(d == "中国") {
                    return "#104842";
                }
                    else if(d == "加拿大"){
                    return "#237c72"; 
                }
                    else if(d == "法国"){
                    return "#5ac4b8"; 
                }
                    else if(d == "瑞士"){
                    return "#84d4cc"; 
                }
                    else if(d == "荷兰"){
                    return "#b3ece6"; 
                }
                    else{
                        return "#e0f9f6";
                    }
}); // country name

            legend.append("text")
                .attr("x", width + 24)
                .attr("y", 9)
                .attr("dy", ".35em")
                .style("text-anchor", "start")
                .text(function(d, i) { return legend_order[i]/*.replace(/_/g, " ");*/ });

            

        }); // end of d3.csv
        