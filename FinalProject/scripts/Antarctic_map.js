"use strict";
var tooltip = d3.select("body")
                .append("div")
                .attr("class", "tooltip");

var mapsvg = d3.select("#mapsvg");

var g_Facilities = mapsvg.append("g").attr("class","Facilities");

var r = 4;

var projection = d3.geoMercator()
    .scale(492)
    .rotate([0,90,0])
    .translate([432,219]);

var geoGenerator = d3.geoPath()
    .projection(projection);

queue()
    .defer(d3.json, "dist/Seamask_medium_res_polygon.json")
    .defer(d3.csv, "dist/COMNAP_Antarctic_Facilities_Master.csv", typeAndSet)
    .await(loaded);

function typeAndSet(d){
    d.lon_dd = + d.lon_dd;
    d.lat_dd = + d.lat_dd;
    return d;
}

function loaded(error, Antarctic, Facilities){
    if(error) throw error;

    // console.log(Facilities);

    var circles = g_Facilities.selectAll("circle")
        .data(Facilities)
        .enter()
        .append("circle");

    circles
        .attr("cx", function(d){ return projection([d.lon_dd, d.lat_dd])[0]} )
        .attr("cy", function(d){ return projection([d.lon_dd, d.lat_dd])[1]})
        .attr("r", r)
        .attr("fill","rgba(251, 54, 29, 1)")
        .attr("opacity",0)
        .attr("stroke","#FFF")
        .attr("stroke-width", .5)
        .attr("class",function(d){return d.interid});

    circles
        .on("mouseover", mouseoverFunc) // see below...
        .on("mousemove", mousemoveFunc) // see below...
        .on("mouseout", mouseoutFunc); // see below...

    //tooltip制作
    function mouseoverFunc(d) {
            console.log(d);
            tooltip
                .style("display", null) // 区别"none": 不呈现；"null": 取消之前所有给display的属性。
                .style("stroke","#123")
                .attr("stroke-width", 0.5)
                .html("<p> <span>站点名称：</span>" + d.name_eng + "<br><span>建成年份：</span>" + d.year_est + "<br><span>所属国家：</span>" + d.operator_1 + "</p>");

            d3.select(this)
                .attr("r", r * 2)
                .attr("fill-opacity", 0)
                .attr("stroke","rgba(251, 54, 29, 1)");
        }

    function mousemoveFunc(d) {
            // console.log("events", window.event, d3.event);
            tooltip
                .style("top", (d3.event.pageY - 10) + "px" )
                .style("left", (d3.event.pageX + 10) + "px");
        }

    function mouseoutFunc(d) {
            tooltip.style("display", "none"); 
            d3.select(this)
              .attr("r", r)
              .attr("fill-opacity", 1)
              .attr("stroke","white");;
        }



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

    var a=d3.selectAll(".Facilities circle");
    console.log(a);
    console.log(a._groups[0]);
    Array.from(a._groups[0]).forEach(function(t){
        return e(c,t);
    });
    function e(e, t) {
        // e为触发器，t为每一个圆圈
        var n = t.className.animVal.slice(0,4)
          , o = document.getElementById("text" + n)
        // console.log(n);
        new ScrollMagic.Scene({
            triggerElement: "#text" + n,
            duration:o.getBoundingClientRect().height + document.documentElement.clientHeight
            }).addTo(e).on("progress",function(e){
                // console.log(e),
                t.style.opacity= 0 == e.progress ? 0 : e.progress < 1 ? 1 : 1;
                t.style.visibility= 0 == e.progress ? "hidden" : "";
            })        
      }
    }
