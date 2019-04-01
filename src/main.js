Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3MDYxMTVjYy05ZmI4LTQwNWMtOTdkZi05YWZlMGIzOTFmNTUiLCJpZCI6NjgwOSwic2NvcGVzIjpbImFzbCIsImFzciIsImFzdyIsImdjIl0sImlhdCI6MTU0NzU4MzkwM30.YnntM1PtfzuUjUiIMjysJDZP2eqfXaMCsBmzxzKVWEQ';
//Create a Viewer instances and add the DataSource.
var viewer = new Cesium.Viewer('cesiumContainer', {
    animation : true,
    shouldAnimate : true,
    timeline : true,
    baseLayerPicker : false,
    //Add terrain to Cesium viewer
    terrainProvider : Cesium.createWorldTerrain({
        requestWaterMask : true, // required for water effects
        requestVertexNormals : true // required for terrain lighting
    }) 
});

var dataSource = new WebGLGlobeDataSource();

function getResourceData(urlString){
    dataSource.loadUrl(urlString).then(function() {
        //After the initial load, create buttons to let the user switch among series.
        function createSeriesSetter(seriesName) {
            return function() {
                dataSource.seriesToDisplay = seriesName;
            };
        }
    });
}

var imageryLayers = viewer.imageryLayers;

var radarImageryProvider = new Cesium.WebMapServiceImageryProvider({
    url : 'https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi?',
    layers : 'nexrad-n0r',
    credit : 'Radar data courtesy Iowa Environmental Mesonet',
    parameters : {
        transparent : 'true',
        format : 'image/png'
    }
});
var radarLayer = imageryLayers.addImageryProvider(radarImageryProvider);
radarLayer.show = false;
radarLayer.alpha = $('#radarAlpha').val();
$('#showRadar').change(function(){
    radarLayer.show = this.checked;
});
$('#radarAlpha').on('input', function() {
	radarLayer.alpha = $('#radarAlpha').val();
})

var times = Cesium.TimeIntervalCollection.fromIso8601({
    iso8601: '2015-07-30/2017-06-16/P1D',
    leadingInterval: true,
    trailingInterval: true,
    isStopIncluded: false, // We want stop time to be part of the trailing interval
    dataCallback: dataCallback
});
function dataCallback(interval, index) {
    var time;
    if (index === 0) { // leading
        time = Cesium.JulianDate.toIso8601(interval.stop);
    } else {
        time = Cesium.JulianDate.toIso8601(interval.start);
    }

    return {
        Time: time
    };
}
var snowWaterImageryProvider = new Cesium.WebMapTileServiceImageryProvider({
    url : 'https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/AMSR2_Snow_Water_Equivalent/default/{Time}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png',
    layer : 'AMSR2_Snow_Water_Equivalent',
    style : 'default',
    tileMatrixSetID : '2km',
    maximumLevel : 5,
    format : 'image/png',
    clock: viewer.clock,
    times: times,
    credit : 'NASA Global Imagery Browse Services for EOSDIS'
});
// var snowWaterLayer = new Cesium.ImageryLayer(snowWaterImageryProvider);
var snowWaterLayer = imageryLayers.addImageryProvider(snowWaterImageryProvider);
snowWaterLayer.show = false;
snowWaterLayer.alpha = $('#snowWaterAlpha').val();
$('#showSnowWater').change(function(){
    snowWaterLayer.show = this.checked;
    if (snowWaterLayer.show) {
        startSnowWaterAnimation();
    }
    else {
        stopSnowWaterAnimation();
    }
});
$('#snowWaterAlpha').on('input', function() {
    snowWaterLayer.alpha = $('#snowWaterAlpha').val();
})

function startSnowWaterAnimation() {
    snowWaterImageryProvider.readyPromise.then(function() {
        var start = Cesium.JulianDate.fromIso8601('2015-07-30');
        var stop = Cesium.JulianDate.fromIso8601('2017-06-17');

        viewer.timeline.zoomTo(start, stop);

        var clock = viewer.clock;
        clock.startTime = start;
        clock.stopTime = stop;
        clock.currentTime = start;
        clock.clockRange = Cesium.ClockRange.LOOP_STOP;
        clock.multiplier = 86400;
    });
}
function stopSnowWaterAnimation() {
    var now = new Cesium.JulianDate();
    viewer.clock.currentTime = now;
    viewer.clock.startTime = now.clone();
    Cesium.JulianDate.addDays(now, 1, viewer.clock.stopTime);
    viewer.clock.multiplier = 1.0;

    viewer.timeline.updateFromClock();
    viewer.timeline.zoomTo(viewer.clock.startTime, viewer.clock.stopTime);
}

// Grid layer
var gridImageryProvider = new Cesium.GridImageryProvider();
var gridLayer = imageryLayers.addImageryProvider(gridImageryProvider);
gridLayer.show = false;
gridLayer.alpha = $('#gridAlpha').val();
$('#showGrid').change(function(){
    gridLayer.show = this.checked;
});
$('#gridAlpha').on('input', function() {
    gridLayer.alpha = $('#gridAlpha').val();
})

var tileImageryProvider = new Cesium.TileCoordinatesImageryProvider();
var tileLayer = imageryLayers.addImageryProvider(tileImageryProvider);
tileLayer.show = false;
tileLayer.alpha = $('#tileAlpha').val();
$('#showTile').change(function(){
    tileLayer.show = this.checked;
});
$('#tileAlpha').on('input', function() {
    tileLayer.alpha = $('#tileAlpha').val();
})

// Get data file list from backend
updateDataList();

function updateDataList() {
	$.ajax({
	    url: 'dataList',
	    dataType: 'json'
	  }).done(function(data) {
	    $("#dataSelect").empty();
		$("#dataSelect").append(new Option('None', 'None'));
	    for (var d in data) {
	    	var optionName = data[d].replace('.json', '');
	    	var o = new Option(optionName, optionName);
	    	$("#dataSelect").append(o);
    	}
	  }).fail(function() {
	    alert('Faild to retrieve data');
	});
}

var dataSource = new WebGLGlobeDataSource();
$("#dataSelect").change(function() {
	if($("#dataSelect").val() == "None"){
		viewer.dataSources.remove(dataSource);
        return ;
    }
	viewer.dataSources.remove(dataSource);
    getResourceData('data/' + $("#dataSelect").val() + '.json');
    viewer.dataSources.add(dataSource);
})
