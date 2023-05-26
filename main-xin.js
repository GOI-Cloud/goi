let mousePositionControl = new ol.control.MousePosition({
    // 字符串格式为：保留小数点后两位
    coordinateFormat: new ol.coordinate.createStringXY(3),
    // 设置WGS84坐标系
    projection: 'EPSG:4326',
    // 设置类名称，方便使用css修改
    className: 'custom-mouse-position',
    // 鼠标离开地图后使用空格代替
    undefinedHTML: '&nbsp;',
});
//     // 获取弹窗元素
let container = document.getElementById('popup');
let content = document.getElementById('popup-content');
let closer = document.getElementById('popup-closer');
    // 创建图层用于定位弹窗
let overlay = new ol.Overlay({
    element: container,
    autoPan: true,
    autoPanAnimation: {
        duration: 250
    }
});
//天地图影响底图
var tian_img=new ol.layer.Tile({
    title: "天地图卫星影像",
    id:"tian_img",
    source: new ol.source.XYZ({
        url: 'http://t3.tianditu.com/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=63a3dc3e03fb3ab64d5f1aa97574a1c2'
    }),
    visible:false
})
//天地图影响底图注记
var tian_cia=new ol.layer.Tile({
    title: "天地图卫星影像注记",
    id:"tian_cia",
    source: new ol.source.XYZ({
        url: 'http://t3.tianditu.com/DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=63a3dc3e03fb3ab64d5f1aa97574a1c2'
    }),
    visible:false
})
//天地图地形底图
var tian_ter =new ol.layer.Tile({
    title: "天地图地形晕渲",
    id:"tian_ter",
    source: new ol.source.XYZ({
        url: 'http://t3.tianditu.com/DataServer?T=ter_w&x={x}&y={y}&l={z}&tk=63a3dc3e03fb3ab64d5f1aa97574a1c2'
    }),
    visible:true
})
// 天地图地形注记
var tian_cta =new ol.layer.Tile({
    title: "天地图地形注记",
    id:"tian_cta",
    source: new ol.source.XYZ({
        url: 'http://t3.tianditu.com/DataServer?T=cta_w&x={x}&y={y}&l={z}&tk=63a3dc3e03fb3ab64d5f1aa97574a1c2'
    }),
    visible:true
})
    //geoserver矢量图层 断层数据
var baseSource1 = new ol.source.TileWMS({
    url: 'http://localhost:8086/geoserver/earthquake/wms',
    params: {
            'LAYERS': 'earthquake:HimaTibetMap-1.0',
            'TILED': true
    },
    serverType: 'geoserver',
});
var baseLayer1 = new ol.layer.Tile({
    id:"FaultLayer",
    title:'活动断层、',
    source: baseSource1,
    visible: true,
    zIndex:9999
});
var pureCoverage = true;
var format = 'image/png';
var format1 = 'image/tiff';
var bounds = [0, 0,
       0, 0
]; //Geotiff的范围
var GridLayer6 = new ol.layer.Image({
    opacity: 1,
    id:"geo_20160118_20160211",
    title:"临时测试用、",
    // ratio: 1,
    // style:style,
    source:
        new ol.source.ImageWMS({
        ratio:1,
        projection: 'EPSG:4326',
        url: "http://localhost:8086/geoserver/earthquake/wms", //Geoserver的wms地址，用户可以根据需求而改变
        params: {
            'FORMAT': format,
            'VERSION': '1.1.0',
             // 'tiled': true,
            "LAYERS": 'earthquake:geo_20200713_20200725new', //图层名称，用户可以根据需求而改变
            "exceptions": 'application/openlayers',
        },
    }),
    visible: true
});
var styleFunction = function (feature) {
    const geometry = feature.getGeometry();
    const styles = [
        // linestring
        new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#ffcc33',
                width: 2,
            }),
        }),
    ];
    geometry.forEachSegment(function (start, end) {
        const dx = end[0] - start[0];
        const dy = end[1] - start[1];
        const rotation = Math.atan2(dy, dx);
        // arrows
        styles.push(
            new ol.style.Style({
                geometry: new ol.geom.Point(end),
                image: new ol.style.Icon({
                    src: 'resources/data/picture/arrow.png',
                    anchor: [0.75, 0.5],
                    rotateWithView: true,
                    rotation: -rotation,
                }),
            })
        );
    });
    return styles;
};
    //geojson文件读取
let GPSwy=new ol.layer.Vector({
    title:'GPS站点位移场',
    source: new ol.source.Vector({
        id:"GPSwy",
        projection: 'EPSG:900913',
        url: "resources/data/txt/GPSwy.geojson", //GeoJSON的文件路径，用户可以根据需求而改变
        format: new ol.format.GeoJSON()
    }),
    style: styleFunction,
    visible:false,
    zIndex:9999
});
let GPSzd=new ol.layer.Vector({
    title: 'GPS站点、',
    source: new ol.source.Vector({
        id:"GPSzd",
        projection: 'EPSG:900913',
        url: "resources/data/txt/gps-zd.geojson", //GeoJSON的文件路径，用户可以根据需求而改变
        format: new ol.format.GeoJSON()
    }),
    style: new ol.style.Style({
        fill: new ol.style.Fill({ //矢量图层填充颜色，以及透明度
            color: 'rgba(255, 255, 255, 0.6)'
        }),
        stroke: new ol.style.Stroke({ //边界样式
            color: '#b706f8',
            width: 4
        }),
    }),
    zIndex:9999,
    visible:false
});
//一级地块边界
let dkbj_1=new ol.layer.Vector({
    title: '地块边界、',
    source:new ol.source.Vector({
        id:"dkbj_1",
        projection: 'EPSG:900913',
        url: "resources/data/txt/dkbj1.geojson", //GeoJSON的文件路径，用户可以根据需求而改变
        format: new ol.format.GeoJSON()
    }),
    style: function (feature,resolution) {
            var name = feature.get('name');
            var color = getColor_1(name);
            return getStyle_1(name, color)
        },
    visible:true,
    zIndex:9999
});
var newTime=new Date().toLocaleDateString();
var url_2="https://earthquake.usgs.gov/fdsnws/event/1/query.geojson?starttime=2000-01-01&endtime=2022-10-09&minmagnitude=5&maxmagnitude=9&maxlatitude=50.01&minlatitude=20.01&maxlongitude=130.01&minlongitude=60.01&orderby=time"
var source_json_2=new ol.source.Vector({
    id:"dizhen",
    projection: 'EPSG:4326',
    url: "/resources/data/geojson/ICMT.json", //GeoJSON的文件路径，用户可以根据需求而改变
    format: new ol.format.GeoJSON()
})
var earthquake_2=new ol.layer.Vector({
    title: '含资料震例、',
    source:source_json_2,
    style:function (feature, resolution) {
        var id = feature.getId();
        var mag=feature.get('mag')
        // var size=getSize(mag)
        // var color = getColor_2(id);
        var color ='red';
        return getStyle(id,mag, color)
    },
    visible:true
});
let layer_group=new ol.layer.Group({
        layers:[
            GPSwy,
            GPSzd,
            baseLayer1,
            dkbj_1,
            earthquake_2,
            GridLayer6
        ]
    });
var layers=[
    tian_ter,
    tian_img,
    tian_cta,
    tian_cia,
    layer_group
];
//比例尺
const unitsSelect = document.getElementById('units');
const typeSelect = document.getElementById('type');
const stepsSelect = document.getElementById('steps');
const scaleTextCheckbox = document.getElementById('showScaleText');
const showScaleTextDiv = document.getElementById('showScaleTextDiv');
let scaleType = 'scaleline';
let scaleBarSteps = 4;
let scaleBarText = true;
let control;
function scaleControl() {
    if (scaleType === 'scaleline') {
        control = new ol.control.ScaleLine({
            units: unitsSelect.value,
        });
        return control;
    }
    control = new ol.control.ScaleLine({
        units: unitsSelect.value,
        bar: true,
        steps: scaleBarSteps,
        text: scaleBarText,
        minWidth: 140,
    });
    return control;
}
let zoom_slider = new ol.control.ZoomSlider({
    className: 'ol-zoomslider',
});// 添加缩放滑块控件
let Full_Screen =new ol.control.FullScreen();
let Overview_Map =new ol.control.OverviewMap();
// 添加缩放跳转控件
let ZoomToExtent =new ol.control.ZoomToExtent({
    className: 'ol-zoom-extent',
    extent: [
        5067718, 1062800,
        15018359, 5497725
    ]
});
let view=new ol.View({
    projection: ('EPSG:900913'),
    center: ol.proj.fromLonLat([95.23, 34.23]),//设置地图中心
    zoom:4,
    maxZoom:16,
    minZoom:4

})
let map = new ol.Map({
    target: 'map',
    layers: layers,
    overlays: [overlay],
    view:view,
    controls: ol.control.defaults({zoom:false}).extend([
        mousePositionControl, // 添加坐标拾取控件
        // scaleline,
        scaleControl(),
        zoom_slider,
        Full_Screen,// 添加全屏控件
        ZoomToExtent
    ]),
});
//地块标注
let plate_1 = new ol.Overlay({
    // 标注位置
    position: ol.proj.fromLonLat([90.435889, 34.911393]),
    // 标注相对与锚点的方位
    positioning: 'center-center',
    // 充当标注的DOM元素
    element: document.getElementById("plate_1")
});
let plate_2 = new ol.Overlay({
    // 标注位置
    position: ol.proj.fromLonLat([110.435889, 27.911393]),
    // 标注相对与锚点的方位
    positioning: 'center-center',
    // 充当标注的DOM元素
    element: document.getElementById("plate_2")
});
let plate_3 = new ol.Overlay({
    // 标注位置
    position: ol.proj.fromLonLat([117.035889, 47.911393]),
    // 标注相对与锚点的方位
    positioning: 'center-center',
    // 充当标注的DOM元素
    element: document.getElementById("plate_3")
});
let plate_4 = new ol.Overlay({
    // 标注位置
    position: ol.proj.fromLonLat([90.035889, 45.911393]),
    // 标注相对与锚点的方位
    positioning: 'center-center',
    // 充当标注的DOM元素
    element: document.getElementById("plate_4")
});
let plate_5 = new ol.Overlay({
    // 标注位置
    position: ol.proj.fromLonLat([116.035889, 36.911393]),
    // 标注相对与锚点的方位
    positioning: 'center-center',
    // 充当标注的DOM元素
    element: document.getElementById("plate_5")
});
let plate_6 = new ol.Overlay({
    // 标注位置
    position: ol.proj.fromLonLat([96.035889, 22.911393]),
    // 标注相对与锚点的方位
    positioning: 'center-center',
    // 充当标注的DOM元素
    element: document.getElementById("plate_6")
});
map.addOverlay(plate_1);
map.addOverlay(plate_2);
map.addOverlay(plate_3);
map.addOverlay(plate_4);
map.addOverlay(plate_5);
map.addOverlay(plate_6);
// 地块边界设置颜色
function getColor_1(name) {
    var color='';
    switch (name) {
        case '>':
            color = '#f88e54';
            break;
        default:
            color = '#319FD3';
            break;
    }
    return color;
}
// 地块边界获取样式
function getStyle_1(name, color) {
    return new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: color,
            width: 2
        })
    });
}
function onChange() {
    control.setUnits(unitsSelect.value);
}
function onChangeType() {
    scaleType = typeSelect.value;
    if (typeSelect.value === 'scalebar') {
        stepsSelect.style.display = 'inline';
        showScaleTextDiv.style.display = 'inline';
        map.removeControl(control);
        map.addControl(scaleControl());
    } else {
        stepsSelect.style.display = 'none';
        showScaleTextDiv.style.display = 'none';
        map.removeControl(control);
        map.addControl(scaleControl());
    }
}
function onChangeSteps() {
    scaleBarSteps = parseInt(stepsSelect.value, 10);
    map.removeControl(control);
    map.addControl(scaleControl());
}
function onChangeScaleText() {
    scaleBarText = scaleTextCheckbox.checked;
    map.removeControl(control);
    map.addControl(scaleControl());
}
unitsSelect.addEventListener('change', onChange);
typeSelect.addEventListener('change', onChangeType);
stepsSelect.addEventListener('change', onChangeSteps);
scaleTextCheckbox.addEventListener('change', onChangeScaleText);
//地震目录根据id设置颜色
function getColor(id) {
    var color='';
    switch (id) {
        case 'us7000e54r':
            color = 'Red';
            break;
        case 'us10004fv5':
            color = 'Red';
            break;
        default:
            color = 'Orange';
            break;
    }
    return color;
}
function getColor_2(id) {
    var color='';
    var earid=['us7000e54r','us10004fv5'];
    switch (id) {
    case 'us7000e54r':
        color = 'Red';
        break;
    case 'us10004fv5':
        color = 'Red';
        break;
    // case earid[i]:
    //     color = 'Red';
    //     break;
    default:
        color = 'rgba(255,255,255,0.01)';
}
    return color;
}
// 获取样式
function getStyle(id,mag, color) {
    return new ol.style.Style({
        image: new ol.style.Circle({
            radius: mag*1.6,
            fill: new ol.style.Fill({
                color: color
            }),

        })
    });
}
//矢量标注样式设置函数，设置image为图标ol.style.Icon
function createLabelStyle(feature){
    return new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 0.5],              //锚点
            anchorOrigin:'top-right',       //锚点源
            anchorXUnits: 'fraction',       //锚点X值单位
            anchorYUnits: 'pixels',         //锚点Y值单位
            offsetOrigin: 'top-right',      //偏移原点
            opacity: 0.75,
            src: 'resources/date/picture/geolocation_marker_heading.png'  //图标的URL
        }),
        text: new ol.style.Text({
            textAlign: 'center',            //位置
            textBaseline: 'middle',         //基准线
            font: 'normal 16px 微软雅黑',    //文字样式
            text: feature.get('name'),      //文本内容
            fill: new ol.style.Fill({       //文本填充样式（即文字颜色)
                color: '#ef2a2a'
            }),
            stroke: new ol.style.Stroke({
                color: '#bce8c1',
                width: 3
            })
        })
    });
}
//基础图层
var layersContent = document.getElementById('layerTree');              //图层目录容器
var layers1 = layer_group.getLayers();    //获取地图中所有图层
var layer = [];                   //map中的图层数组
var layerName = [];               //图层名称数组
var layerVisibility = [];         //图层可见属性数组
for (var i = 0; i < layers1.getLength() ; i++) {
    layer[i] = layers1.item(i);
    layerName[i] = layer[i].get('title');
    layerVisibility[i] = layer[i].getVisible();
    let eleLi = document.createElement('a');           //新增li元素，用来承载图层项
    var eleInput = document.createElement('input');     //创建复选框元素，用来控制图层开启关闭
    eleInput.type = "checkbox";
    eleInput.name = "layers";
    eleLi.appendChild(eleInput);                        //将复选框添加到li元素中
    // layersContent.appendChild(eleLi);                   //将li元素作为子节点放入到图层目录中
    layersContent.insertBefore(eleLi,layersContent.childNodes[0]); //将li元素作为子节点放入到图层目录中（按图层加载倒序）
    var eleLable = document.createElement('label');     //创建label元素
    // eleLable.className = "layer";
    // eleLable.htmlFor = "layer";
    setInnerText(eleLable, layerName[i]);                //在label中设置图层名称
    eleLi.appendChild(eleLable);                         //将label加入到li中

    if (layerVisibility[i]) {                            //设置图层默认显示状态
        eleInput.checked = true;
    }
    addChangeEvent(eleInput, layer[i]);              //为checkbox添加变更事件
}
/*
* 动态设置元素文本内容（兼容）
*/
function setInnerText(element, text) {
    if (typeof element.textContent == "string") {
        element.textContent = text;
    } else {
        element.innerText = text;
    }
}
/*
* 为checkbox元素绑定变更事件
*/
function addChangeEvent(element, layer) {
    element.onclick = function () {
        if (element.checked) {
            //显示图层
            layer.setVisible(true);
        }
        else {
            //不显示图层
            layer.setVisible(false);
        }
    };
}
// 创建一个div
var div_popup;
function createPopupDiv(){
    div_popup=document.createElement('div');
    div_popup.id="popup";
    div_popup.className="popup";
    // div_popup.style.cssText ="display:block;background:white;color:black;border:solid 1px;"
    document.body.appendChild(div_popup);
}
createPopupDiv();
// 创建一个overlay层
var popup = new ol.Overlay({
    element: document.getElementById('popup'),
    autoPan:true,
    autoPanMargin:100,
    positioning:'center-left',
    offset:[10,-5]
});
//点击显示震例详细信息
var selectClick = new ol.interaction.Select();
map.addInteraction(selectClick);
selectClick.on('select', function(e) {
    var features=e.target.getFeatures().getArray();
    if(features.length>0){
        var element = popup.getElement();
        var coor=features[0].getGeometry().getCoordinates()
        var coor0=ol.proj.toLonLat([coor[0],coor[1]])
        // coordinateFormat: new ol.coordinate.createStringXY(2)
        var property=features[0].getProperties();
        var idusgs=features[0].getId();
        var da = property["time"];
        // var dizhentitle = property["title"];
        da = new Date(da);
        var year = da.getFullYear()+'年';
        var month = da.getMonth()+1+'月';
        var date = da.getDate()+'日';
        var hour=da.getHours()+1+'时';
        var minutes=da.getMinutes()+'分';
        var seconds=da.getSeconds()+'秒';
        var depth = coor[2];
        var time=year+month+date+hour+minutes+seconds;
        var obj= property["detail"];
        var obj_url= property["url"];
        var obj1=property["place"];
        var hdms="时间："+time;
        hdms=hdms+"<br/>";
        hdms = hdms+"地点："+obj1;
        hdms=hdms+"<br/>";
        hdms = hdms+"震级：M "+property["mag"];
        hdms=hdms+"<br/>";
        hdms = hdms+"Moment："+"<a id='scalar_moment'></a>"+"  N-m";
        hdms=hdms+"<br/>";
        hdms = hdms+"深度："+depth+'km';
        hdms=hdms+"<br/>";
        var x=coor0[0].toFixed(3);
        var y=coor0[1].toFixed(3);
        hdms = hdms+"位置："+x+" °E ，"+y+" °N";
        hdms=hdms+"<br/>";
        hdms = hdms+"ID(USGS)："+idusgs;
        hdms=hdms+"<br/>";
        // var obj2="相关研究";
        // var obj4 = obj2.link("#services");
        document.getElementById("earId").value =time;
        document.createElement('dizhenplace').value=obj1;
        var obj4= "<table>\n" +
            "    <tr>\n" +
            "        <th>Plane</th>\n" +
            "        <th>Strike</th>\n" +
            "        <th>Dip</th>\n" +
            "        <th>Rake</th>\n" +
            "    </tr>\n" +
            "    <tr>\n" +
            "        <td>NP1</td>\n" +
            "        <td id='nodal_plane_1_strike'></td>\n" +
            "        <td id='nodal_plane_1_dip'></td>\n" +
            "        <td id='nodal_plane_1_rake'></td>\n" +
            "    </tr>\n" +
            "    <tr>\n" +
            "        <td>NP2</td>\n" +
            "        <td id='nodal_plane_2_strike'></td>\n" +
            "        <td id='nodal_plane_2_dip'></td>\n" +
            "        <td id='nodal_plane_2_rake'></tdi>\n" +
            "    </tr>\n" +
            "</table>";
        var obj00= "点击更多".link(obj_url);
        $.ajax({
            url: obj,//json文件位置，文件名
            type: "GET",//请求方式为get
            dataType: "json", //返回数据格式为json
            success: function(data) {//请求成功完成后要执行的方法
                var properties_0=data["properties"];
                var products=properties_0["products"];
                var moment_tensor=products["moment-tensor"];
                var nodal_plane=moment_tensor[0];
                var plane=nodal_plane["properties"];
                var nodal_plane_1_dip=plane["nodal-plane-1-dip"];
                var nodal_plane_1_rake=plane["nodal-plane-1-rake"];
                var nodal_plane_1_strike=plane["nodal-plane-1-strike"];
                var nodal_plane_2_dip=plane["nodal-plane-2-dip"];
                var nodal_plane_2_rake=plane["nodal-plane-2-rake"];
                var nodal_plane_2_strike=plane["nodal-plane-2-strike"];
                var scalar_moment=plane["scalar-moment"];
                var data_0=nodal_plane_1_dip+","+
                    nodal_plane_1_rake+","+
                    nodal_plane_1_strike+","+
                    nodal_plane_2_dip+","+
                    nodal_plane_2_rake+","+
                    nodal_plane_2_strike+","+
                    scalar_moment+"N-m"
                $("#nodal_plane_1_dip").html(nodal_plane_1_dip);
                $("#nodal_plane_1_rake").html(nodal_plane_1_rake);
                $("#nodal_plane_1_strike").html(nodal_plane_1_strike);
                $("#nodal_plane_2_dip").html(nodal_plane_2_dip);
                $("#nodal_plane_2_rake").html(nodal_plane_2_rake);
                $("#nodal_plane_2_strike").html(nodal_plane_2_strike);
                $("#scalar_moment").html(scalar_moment);
            }
        })
        var content="<button class='layui-btn layui-btn-zh layui-btn-radius layui-btn-xs'  href='javascript:void(0)' onclick='contents()'>详细数据信息</button>"
        hdms = hdms+obj00 +""+ obj4;
        element.innerHTML=hdms;
        map.addOverlay(popup);
        popup.setPosition(coor);
        view.fit(features[0].getGeometry(), { padding: [160, 40, 40, 160], minResolution: 200});

    }else{
        map.removeOverlay(popup);

    }
})
function inSAR_layers() {
    /*悬浮窗口的显示,需要将display变成block*/
    document.getElementById("window_1").style.display = "block";
}
function contents() {
    layer.open({
        title: "震例："+document.getElementById("earId").value,
        type:1,
        maxmin: true,
        moveOut: true,
        area: ['870px', '600px'],
        shade: [0.6, '#393D49'],
        content: $("#detail")
    });
}
document.getElementById("result001").src="resources/data/picture/result/result001.jpg";
//基础底图
let controls1 = document.getElementById('controls1');// 事件委托
controls1.addEventListener('click', (event) => {
    if(event.target.checked){                       // 如果选中某一复选框
            // 通过DOM元素的id值来判断应该对哪个图层进行显示
        switch(event.target.id){
            case "tian_ter":
                map.getLayers(tian_ter).item(0).setVisible(true);
                break;
            case "tian_img":
                 map.getLayers(tian_img).item(1).setVisible(true);
                 break;
            case "tian_cta":
                map.getLayers(tian_cta).item(2).setVisible(true);
                break;
            case "tian_cia":
                  map.getLayers(tian_cia).item(3).setVisible(true);
                  break;
                default: break;
        }
    }
    else{                                         // 如果取消某一复选框
            // 通过DOM元素的id值来判断应该 对哪个图层进行隐藏
        switch(event.target.id){
            case "tian_ter":
                map.getLayers(tian_ter).item(0).setVisible(false);
                break;
            case "tian_img":
                map.getLayers(tian_img).item(1).setVisible(false);
                break;
            case "tian_cta":
                map.getLayers(tian_cta).item(2).setVisible(false);
                break;
            case "tian_cia":
                map.getLayers(tian_cia).item(3).setVisible(false);
                break;
                default: break;
        }
    }
});
map.on('pointermove', function (e) {
    var pixel = map.getEventPixel(e.originalEvent);
    var hit = map.hasFeatureAtPixel(pixel);
    map.getTargetElement().style.cursor = hit ? 'pointer' : '';
});
//地震检索
function dizhen() {
    // layerszu.layer=[];
    var starttime=document.getElementById('starttime').value;
    var endtime=document.getElementById('endtime').value;
    var magMin=document.getElementById('magMin').value;
    var magMax=document.getElementById('magMax').value;
    var depthMin=document.getElementById('depthMin').value;
    var depthMax=document.getElementById('depthMax').value;
    var latitudeMin=document.getElementById('latitudeMin').value;
    var latitudeMax=document.getElementById('latitudeMax').value;
    var longitudeMin=document.getElementById('longitudeMin').value;
    var longitudeMax=document.getElementById('longitudeMax').value;
    var url_1="https://earthquake.usgs.gov/fdsnws/event/1/query.geojson?starttime="+ starttime
        +"&endtime="+endtime
        +"&minmagnitude="+magMin
        +"&maxmagnitude="+magMax
        +"&mindepth="+depthMin
        +"&maxdepth="+depthMax
        +"&&maxlatitude="+latitudeMax
        +"&minlatitude="+latitudeMin
        +"&maxlongitude="+longitudeMax
        +"&minlongitude="+longitudeMin
        +"&orderby=time"
    window.url_1=url_1;
    var source_json_1=new ol.source.Vector({
        id:"dizhen",
        projection: 'EPSG:4326',
        url: url_1, //GeoJSON的文件路径，用户可以根据需求而改变
        format: new ol.format.GeoJSON()
    })
    var earthquake_1=new ol.layer.Vector({
        title: 'di',
        source:source_json_1,
        style:function (feature, resolution) {
            var id = feature.getId();
            var mag=feature.get('mag');
            // var size=getSize(mag)
            var color = getColor(id);
            return getStyle(id,mag, color)
        },
        visible:true
    });
    map.addLayer(earthquake_1);
    window.earthquake_1=earthquake_1;
}
//清除震例
function reload_dizhen() {
    map.removeLayer(earthquake_1);
}
$.ajax({
    url: "/resources/data/geojson/dzml.json",//json文件位置，文件名
    type: "GET",//请求方式为get
    dataType: "json", //返回数据格式为json
    success: function (data) {//请求成功完成后要执行的方法
        var features=data["features"];
        var earid=['us7000e54r','us10004fv5'];
        var ear={};
        for(var i=0;i<earid.length;i++){
        }
        var content = JSON.stringify(ear);
        var blob = new Blob([content], {type: "text/plain;charset=utf-8"});
        FileSaver.saveAs(blob, "newdzml.json");
    }
})
//震例检索控制条
$(function(){
    $('#magMin').bind('input propertychange', function() {
        $('#valueMagMin').html($(this).val());
    });
    $('#depthMin').bind('input propertychange', function() {
        $('#valueDepthMin').html($(this).val());
    });
    $('#magMax').bind('input propertychange', function() {
        $('#valueMagMax').html($(this).val());
    });
    $('#depthMax').bind('input propertychange', function() {
        $('#valueDepthMax').html($(this).val());
    });
})
function startPlay() {
    document.getElementById("header").style.display="none";
}