//var data = [{
//    "key": "Long",
//    "values": getData()
//}];
function getData() {
    var data = [];
    var theDate = new Date(2012, 01, 01, 0, 0, 0, 0);
    for (var x = 0; x < 1000; x++) {
        data.push([new Date(theDate.getTime()), Math.random()]);
        theDate.setDate(theDate.getDate() + 1);
    }
    g.updateOptions({
        'file': data
    });
    //return arr;
}
//
//var chart;
//var duration=1000;
//
//function draw() {
//    nv.addGraph(function () {
//        chart = nv.models.lineChart()
//            .x(function (d) { return d.x; })
//            .y(function (d) { return d.y; });
//
//        chart.xAxis
//            .tickFormat(function (d) {
//                return d3.time.format('%x')(new Date(d));
//            });
//
//        chart.yAxis
//            .tickFormat(d3.format(',.1%'));
//
//        d3.select('#chart svg')
//            .datum(data)
//            .transition().duration(0)
//            .call(chart);
//
//        nv.utils.windowResize(chart.update);
//
//        return chart;
//    });        
//}
//
//function redraw() {
//    d3.select('#chart svg')
//        .datum(data)
//        //.transition().duration(duration)
//        .call(chart);
//}
//
//setInterval(function () {
//    // uncomment the following to get new data on each update
///*
//    var long = data[0].values;
//    var next = new Date(long[long.length - 1].x);
//    next.setDate(next.getDate() + 1);
//    long.shift();
//    long.push({x:next.getTime(), y:Math.random() * 100});
//*/
//    redraw();
//}, duration);
//
//draw();
var data = [];
//var t = new Date();
/*for (var i = 10; i >= 0; i--) {
    var x = new Date(t.getTime() - i * 1000);
    data.push([x, Math.random()]);
}*/

var g = new Dygraph(document.getElementById("div_g"), data, {
    drawPoints: true,
    showRoller: true,
    valueRange: [0.0, 1.2],
    labels: ['Time', 'Random']
});

setInterval(/*function () {
    var x = new Date(); // current time
    var y = Math.random();
    data.push([x, y]);
    g.updateOptions({
        'file': data
    });
}*/getData, 1000)