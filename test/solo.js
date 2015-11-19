var data = [];

function getData() {
    data = [];
    var theDate = new Date(2012, 01, 01, 0, 0, 0, 0);
    for (var x = 0; x < 20000; x++) {
        data.push([new Date(theDate.getTime()), Math.random()]);
        theDate.setDate(theDate.getDate() + 1);
    }
    g.updateOptions({
        'file': data
    });
}
var lastClickedGraph;
Dygraph.addEvent(document, "mousewheel", function () {
    lastClickedGraph = null;
});
Dygraph.addEvent(document, "click", function () {
    lastClickedGraph = null;
});

var g = new Dygraph(document.getElementById("div_g"), data, {
    drawPoints: true,
    showRoller: false,
    rollPeriod: 1,
    valueRange: [0.0, 1.2],
    labels: ['Time', 'Random'],
    xlabel: 'Time',
    ylabel: 'Random',
    legend: 'always',
    showRangeSelector: true
});

function change(el) {
    g.setVisibility(el.id, el.checked);
}

setInterval(
    getData, 1000);