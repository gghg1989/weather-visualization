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

getResourceData('../data/population2016.json');
viewer.dataSources.add(dataSource);

// Get data file list from backend
$.ajax({
    url: 'dataList',
    dataType: 'json'
  }).done(function(data) {
    console.log(data);
  }).fail(function() {
    alert('Faild to retrieve data');
});

var baseLayers = [];
var imageryLayers = viewer.imageryLayers;
function setupLayers() {
    // Create all the base layers that this example will support.
    // These base layers aren't really special.  It's possible to have multiple of them
    // enabled at once, just like the other layers, but it doesn't make much sense because
    // all of these layers cover the entire globe and are opaque.
    addBaseLayerOption(
        'hurricanes',
         new Cesium.WebMapTileServiceImageryProvider({
            url : 'https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/AMSR2_Snow_Water_Equivalent/default/{Time}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png',
            layer : 'AMSR2_Snow_Water_Equivalent',
            style : 'default',
            tileMatrixSetID : '2km',
            maximumLevel : 5,
            format : 'image/png',
            clock: viewer.clock,
            // times: times,
            credit : 'NASA Global Imagery Browse Services for EOSDIS'
        }));

    addAdditionalLayerOption(
        'United States Weather Radar',
        new Cesium.WebMapServiceImageryProvider({
            url : 'https://mesonet.agron.iastate.edu/cgi-bin/wms/nexrad/n0r.cgi?',
            layers : 'nexrad-n0r',
            credit : 'Radar data courtesy Iowa Environmental Mesonet',
            parameters : {
                transparent : 'true',
                format : 'image/png'
            }
        }),1.0,false);

    addAdditionalLayerOption(
        'Grid',
        new Cesium.GridImageryProvider(), 1.0, false);

    addAdditionalLayerOption(
        'Tile Coordinates',
        new Cesium.TileCoordinatesImageryProvider(), 1.0, false);
}

function addBaseLayerOption(name, imageryProvider,dataSource) {
    var layer;
    if (typeof imageryProvider === 'undefined') {
        layer = imageryLayers.get(0);
        viewModel.selectedLayer = layer;
    }else {
        if(imageryProvider._layer==="AMSR2_Snow_Water_Equivalent"){
            //setAnimationData(imageryProvider);
        }
        layer = new Cesium.ImageryLayer(imageryProvider);
                
        
    }
    layer.name = name;
    baseLayers.push(layer);
    console.log(baseLayers);
}

function addAdditionalLayerOption(name, imageryProvider, alpha, show) {
    var layer = imageryLayers.addImageryProvider(imageryProvider);
    layer.alpha = Cesium.defaultValue(alpha, 0.5);
    layer.show = Cesium.defaultValue(show, true);
    layer.name = name;
    Cesium.knockout.track(layer, ['alpha', 'show', 'name']);
}

setupLayers();

// baseLayers['Grid'].show = true;

// Grid layer
var gridImageryProvider = new Cesium.GridImageryProvider();
var gridLayer = imageryLayers.addImageryProvider(gridImageryProvider);
gridLayer.show = false;
// gridLayer.alpha = 0.1;

var tileImageryProvider = new Cesium.TileCoordinatesImageryProvider();
var tileLayer = imageryLayers.addImageryProvider(tileImageryProvider);
// tileLayer.show = false;
// tileLayer.alpha = 0.1;