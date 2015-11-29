var infoWin;
var isDragging = false;
var isDraggingEnd = false;

function showNaverMap(startPoint, options) {
    var width  = (options||{}).width ||640;
    var height = (options||{}).height||480;

    var lat = startPoint.lat,
        lng = startPoint.lon;

    var mapContainer = document.getElementById('map-container');
    mapContainer.innerHTML = '';

    var oPoint = new nhn.api.map.LatLng(lat, lng); // -  지도의 중심점을 나타내는 변수 선언

    // map
    nhn.api.map.setDefaultPoint('LatLng'); // - 지도에서 기본적으로 사용하는 좌표계를 설정합니다.
    var oMap = new nhn.api.map.Map(mapContainer, {
        point              : oPoint,                         // - 지도의 중심점을 나타냅니다.
        zoom               : 8,                             // - 지도의 초기 레벨을 나타냅니다.
        enableWheelZoom    : false,                          // - 마우스 휠 줌으로 지도의 레벨을 조정할 수 있는지 없는지 설정합니다.
        enableDragPan      : true,                           // - 마우스 드래그를 통해 지도를 패닝할 수 있는지 없는지 설정합니다.
        enableDblClickZoom : false,                          // - 마우스 왼쪽 버튼 더블클릭을 통해,
        mapMode            : 0,                              // - 어떤 지도를 사용할 지 나타냅니다. 0은 일반, 1은 겹침지도, 2는 위성지도입니다.
        activateTrafficMap : false,                          // - 실시간 교통 지도를 사용할지 하지 않을 지의 여부를 나타냅니다.
        activateBicycleMap : false,                          // - 자전거 지도를 사용할 지 하지 않을 지의 여부를 나타냅니다.
        minMaxLevel        : [ 1, 14 ],                      // - 지도의 최대 최소 레벨을 설정합니다.
        size               : new nhn.api.map.Size(width, height), // - 지도의 크기를 설정합니다.
        detectCoveredMarker: true,
    });

    // zoom control
    var oSlider = new nhn.api.map.ZoomControl();
    oMap.addControl(oSlider);
    oSlider.setPosition({
        top : 10,
        right: 10
    });

    //
    // info window
    //
    infoWin = new nhn.api.map.InfoWindow(); // - info window 생성
    infoWin.setVisible(true);  // - infowindow 표시 여부 지정.
    oMap.addOverlay(infoWin);   // - 지도에 추가.     

    // marker label
    var oMarkerLabel = new nhn.api.map.MarkerLabel(); // - 마커 라벨 선언.
    oMap.addOverlay(oMarkerLabel);                    // - 마커 라벨 지도에 추가. 기본은 라벨이 보이지 않는 상태로 추가됨.

    function setContent(infoWin, point, content) {
        // - InfoWindow 에 들어갈 내용은 setContent 로 자유롭게 넣을 수 있습니다. 외부 css를 이용할 수 있으며, 
        // - 외부 css에 선언된 class를 이용하면 해당 class의 스타일을 바로 적용할 수 있습니다.
        // - 단, DIV 의 position style 은 absolute 가 되면 안되며, 
        // - absolute 의 경우 autoPosition 이 동작하지 않습니다. 
        var html = '<div style="border-top:1px solid; border-bottom:2px groove black; border-left:1px solid; border-right:2px groove black;margin-bottom:1px;color:black;background-color:white; width:auto; height:auto;">'+
             '<span style="color: #000000 !important;display: inline-block;font-size: 12px !important;font-weight: bold !important;letter-spacing: -1px !important;white-space: nowrap !important; padding: 2px 2px 2px 2px !important">' + 
                                     content + '<br /> ';
        +'<span></div>';

        infoWin.setContent(html);
        infoWin.setPoint(point);
        infoWin.setVisible(true);
        infoWin.setPosition({
            right: 15, 
            top  : 30,
        });
        infoWin.autoPosition();
    }

    // draw marker
    var oSize     = new nhn.api.map.Size(28, 37),
        oOffset   = new nhn.api.map.Size(14, 37),
        storeIcon = new nhn.api.map.Icon('http://static.naver.com/maps2/icons/pin_spot2.png', oSize, oOffset);

    infoWin.attach('changeVisible', function(oCustomEvent) {
        if (oCustomEvent.visible) {
            oMarkerLabel.setVisible(false);
        }
    });

    //
    // events
    //
    oMap.attach('mouseenter', function(oCustomEvent) {
        // mouse enters marker
        if (oCustomEvent.target instanceof nhn.api.map.Marker) {
            // show label
            oMarkerLabel.setVisible(true, oCustomEvent.target); // - 특정 마커를 지정하여 해당 마커의 title을 보여준다.
        } 
        else if (oCustomEvent.target instanceof nhn.api.map.Circle) {
        }
        else if (oCustomEvent.target instanceof nhn.api.map.Polygon) {
        }
    });
    oMap.attach('mouseleave', function(oCustomEvent) {
        // mouse leaves marker
        if (oCustomEvent.target instanceof nhn.api.map.Marker) {
            oMarkerLabel.setVisible(false);
        }
    });
    oMap.attach('click', function(oCustomEvent) {
        if (infoWin.getVisible() && !isDraggingEnd) {
            console.log('hide infoWin');
            infoWin.setVisible(false);
            return;
        }
    });
    

    // draw circle
    var circle = new nhn.api.map.Circle({
        strokeColor  : "darkred", // - 선의 색깔을 지정함.
        strokeOpacity: 1, // - 선의 투명도를 지정함.
        strokeWidth  : 1, // - 선의 두께를 지정함.
        fillColor    : "red",
        fillOpacity  : 1.0, // - 채우기 색상. none 이면 투명하게 된다.
        radius: 10, // meter
    });

    //var radius = 150; // - radius의 단위는 meter
    circle.setCenterPoint(oPoint); // - circle 의 중심점을 지정한다.
    //circle.setRadius(radius); // - circle 의 반지름을 지정하며 단위는 meter이다.
    //circle.setStyle("strokeColor", "blue"); // - 선의 색깔을 지정함.
    //circle.setStyle("strokeWidth", 5); // - 선의 두께를 지정함.
    //circle.setStyle("strokeOpacity", 1); // - 선의 투명도를 지정함.
    //circle.setStyle("fillColor", "none"); // - 채우기 색상. none 이면 투명하게 된다.

    //oMap.addOverlay(circle);

    return oMap;
}

function renderSpotsD3(map, data, options) {
    var colors = d3.scale.category10();
    //var radius = d3.scale.linear()
    //    .domain([0, 3000])
    //    .range([10, 50])
    //;

    var radius      = 5;
    var padding     = 50,
        plusPadding = 1;

    var layer = d3.select('.nmap_drawing_pane')
        .append("div").attr("class", "library")
        .append("svg")
            .attr("class", "user-drawing")
            .attr("width",  640)
            .attr("height", 480)
    ;
                        
    //var marker = layer.selectAll("g")
    //        .data(d3.entries(data))
    //        .each(transform)
    //    .enter().append("g")
    //        .each(transform)
    //        .attr("class", "marker")
    //        .style("position", "absolute")
    //;
    //                    
    //marker.append("svg:circle")
    //    .attr("r", function(d){ return radius; })
    //    .attr("cx", function(d){ return padding; })
    //    .attr("cy", function(d){ return padding; })
    //    .style("fill", function(d,i){ return colors("GU_NM"); })
    //    .attr("fill-opacity", "0.7")
    //    .on("click",function(d){ 
    //        alert("FCLTY_NM"); 
    //        map.setCenter(new nhn.api.map.LatLng(d.value.lat, d.value.lng)); 
    //    });

    var marker = layer.selectAll("circle")
        .data(d3.entries(data))
        .enter().append("circle")
        .each(transform)
            .attr("class", "marker")
            .style("fill", function(d,i){ return colors("GU_NM"); })
            .style("position", "absolute")
    ;
                        
    //marker.append("svg:text")
    //    .attr("x", function(d){return padding;})
    //    .attr("y", function(d){return padding;})
    //    .attr("dy", ".31em").style("text-anchor", "middle")
    //    .text(function(d) { return d.value.lng > 0 ? "HNR_NAM" : ""; });


    function transform(d) {
        var _oSize   = new nhn.api.map.Size(28, 37),
            _oOffset = new nhn.api.map.Size(28, 37),
            oIcon   = new nhn.api.map.Icon('http://static.naver.com/maps2/icons/pin_spot2.png', _oSize, _oOffset); 
        var oMarker = new nhn.api.map.Marker(oIcon, { 
            //title : "FCLTY_NM" 
        }); 
        var latLng = new nhn.api.map.LatLng(d.value.lat, d.value.lon);
        oMarker.setPoint(latLng);
        //
        map.addOverlay(oMarker);

        //
        oMarker.setVisible(false);

        //
        var style = d3.select(oMarker)[0][0]["_elEl"].style;
        var left = parseInt(style.left);
        var top  = parseInt(style.top);
        //console.log([d.value.lat, d.value.lon], [style.left, style.top]);

        return d3.select(this)
            //.style("left", (left -padding*0) + "px")
            //.style("top",  (top  -padding*0) + "px")
            .attr("r", function(d){ return radius; })
            .attr("cx", function(d){ return left; })
            .attr("cy", function(d){ return top ; })
            .attr("fill-opacity", "0.7")
            .style("width",  (radius + padding + plusPadding) + "px")
            .style("height", (radius + padding + plusPadding) + "px");
    }
}

function renderSpotsCircle(oMap, data, options) {
    var level = oMap.getLevel();

    var radius = options.radius || 70;

    // draw circles
    data.forEach(function(obj) {
        var oPoint = new nhn.api.map.LatLng(obj.lat, obj.lon);
        var circle = new nhn.api.map.Circle({
            strokeColor  : options.strokeColor || "rgb(31, 119, 180)", // - 선의 색깔을 지정함.
            strokeOpacity: 1, // - 선의 투명도를 지정함.
            strokeWidth  : 1, // - 선의 두께를 지정함.
            fillColor    : options.fillColor || "rgb(31, 119, 180)",
            fillOpacity  : options.fillOpacity || 0.3, // - 채우기 색상. none 이면 투명하게 된다.
            radius: radius, // meter
        });

        circle.setCenterPoint(oPoint); // - circle 의 중심점을 지정한다.
        oMap.addOverlay(circle);
    });

}

function renderSpotsRectWithData(oMap, data, options) {
    var level = oMap.getLevel();

    // draw rectangle
    data.forEach(function(obj) {
        renderSpotsRect(oMap, obj, options);
    });
}

function renderInfoWindow(obj, html, options) {
    var infoWin = new nhn.api.map.InfoWindow();
    infoWin.setContent(html);

    infoWin.setPoint(new nhn.api.map.LatLng(obj.lat, obj.lon));
    infoWin.setPosition({
        right: 15, 
        top  : 30,
    });
    infoWin.autoPosition();

    infoWin.setVisible(true);
    return infoWin;
}

function renderSpotsRect(oMap, obj, options) {
    var size = 0.001;
    var polygon = new nhn.api.map.Polygon([
        new nhn.api.map.LatLng(obj.lat-size, obj.lon-size),
        new nhn.api.map.LatLng(obj.lat+size, obj.lon-size),
        new nhn.api.map.LatLng(obj.lat+size, obj.lon+size),
        new nhn.api.map.LatLng(obj.lat-size, obj.lon+size),
    ], {
        strokeColor  : options.strokeColor || "rgb(31, 119, 180)", // - 선의 색깔을 지정함.
        strokeOpacity: 1, // - 선의 투명도를 지정함.
        strokeWidth  : 1, // - 선의 두께를 지정함.
        fillColor    : options.fillColor || "rgb(31, 119, 180)",
        fillOpacity  : options.fillOpacity || 0.3, // - 채우기 색상. none 이면 투명하게 된다.
    });
    //
    oMap.addOverlay(polygon);

    // event
    $(polygon.wrap).on('mouseenter', function(ev) {
        if (options.mouseenter) {
            options.mouseenter(this, obj);
        }

        if (isDragging) {
            return;
        }

        // show image
        var imgFilename = obj['key'] + '.thumbnail-256.jpg';
        var $imgContainer = $('<div class="image-thumbnail-viewer" draggable="true" style="padding: 5px; background-color: rgba(255,255,255,0.7); border-radius: 5px;"><div style="border-radius: 3px; overflow: hidden;"><img src="/images/thumbnails/256/' + imgFilename + '" width="128" style="max-width: 128px; max-height: 128px; vertical-align: top;" /></div></div>');
        infoWin.setContent($imgContainer[0]);
        infoWin.setVisible(true);
        infoWin.setPoint(new nhn.api.map.LatLng(obj.lat, obj.lon));
        infoWin.setPosition({
            right: 15, 
            top  : 30,
        });
        infoWin.autoPosition();

        //
        $imgContainer.css('position', 'absolute');
        var initialPos = $imgContainer.offset();
        $imgContainer.drag('start', function(ev, dd) {
            intiialPos = $imgContainer.offset();
            //console.log('start:', initialPos, dd);
        });
        $imgContainer.drag(function(ev, dd) {
            isDragging = true;

            $(this).css({
                top : dd.offsetY - initialPos.top,
                left: dd.offsetX - initialPos.left,
            });
        }, { distance: 5 });
        $imgContainer.drag('end', function(ev, dd) {
            isDragging = false;

            // delay dragging end
            isDraggingEnd = true;
            setTimeout(function() {
                isDraggingEnd = false;
            }, 300);
            //console.log('.');
        });
    });
}


function renderSpotsPath(oMap, data, options) {
    var colors = d3.scale.category10();

    var radius      = 5;
    var padding     = 50,
        plusPadding = 1;

    // draw polyline

    var points = data.map(function(obj) {
        return new nhn.api.map.LatLng(obj.lat, obj.lon);
    });

    var polyline = new nhn.api.map.Polyline(points, {
        strokeColor  : "rgb(31, 119, 180)", // - 선의 색깔을 지정함.
        strokeOpacity: 0.7, // - 선의 투명도를 지정함.
        strokeWidth  : 5, // - 선의 두께를 지정함.
        //fillColor    : "rgb(31, 119, 180)",
        //fillOpacity  : 0.7, // - 채우기 색상. none 이면 투명하게 된다.
        //radius: 20, // meter
    });
    oMap.addOverlay(polyline);

}


