var ws = new WebSocket("ws://192.168.1.2:8765/"),
    InputStateDIV = document.getElementById('InputState'),
    InsideTemperatureDIV = document.getElementById('InsideTemperature'),
    InsideHumidityDIV = document.getElementById('InsideHumidity'),
    OutsideTemperatureDIV = document.getElementById('OutsideTemperature'),
    OutsideHumidityDIV = document.getElementById('OutsideHumidity');
    // ResponseFromServerField = document.getElementById("ResponseFromServer");
    // ResponseFromServerField = document.getElementById("tbody");
    
ws.onopen = function (event) {
    var conn_status = document.getElementById('conn_text');
    //var text_field_data = document.getElementById('ResponseFromServer');
    conn_status.innerHTML = "Состояние соединения: Подключено!"
    //text_field_data.innerHTML = "Текст для текстового поля, если Подключено"
};
ws.onmessage = function (event) {
    var jsonObject = JSON.parse(event.data);
    var dataArray = [jsonObject.Temperature[0], jsonObject.Humidity[0],
                jsonObject.Temperature[1], jsonObject.Humidity[1],
                jsonObject.Input_state,jsonObject.ResponseFromDB];

    InsideTemperatureDIV.innerHTML = "Температура внутри " + dataArray[0] + " °C",
    InsideHumidityDIV.innerHTML = "Влажность внутри " + dataArray[1] + " %",
    OutsideTemperatureDIV.innerHTML = "Температура снаружи " + dataArray[2] + " °C",
    OutsideHumidityDIV.innerHTML = "Влажность снаружи " + dataArray[3] + " %",
    InputStateDIV.innerHTML = dataArray[4];
    var ResponseFromDB = dataArray[5];
    if (dataArray[5]!= null){ResponseToTable(ResponseFromDB),ResponseToChart(ResponseFromDB)};
    callback(dataArray);
    console.log(event.data)
};
ws.onclose = function (event) {
    alert("Соединение закрыто!");
};
var callback = function (array) {
    // console.log("Callback is called" + array);
    ChartsGroup.InsideTemperatureChart.value = array[0];
    ChartsGroup.InsideHumidityChart.value = array[1];
    ChartsGroup.OutsideTemperatureChart.value = array[2];
    ChartsGroup.OutsideHumidityChart.value = array[3];
    
    // ChartsGroup2.InsideTemperatureChart.value = array[0];
    // ChartsGroup2.InsideHumidityChart.value = array[1];
    // ChartsGroup2.OutsideTemperatureChart.value = array[2];
    // ChartsGroup2.OutsideHumidityChart.value = array[3];


};

//D3.js_section
var limit = 60 * 1,
    duration = 1500,
    now = new Date(Date.now() - duration);

var margin = { top: 20, 
               right: 2,
               bottom: 20,
               left: 25 };
var width = 600 - margin.left - margin.right,
    height = 200 - margin.top - margin.bottom;


var ChartsGroup = {
    InsideTemperatureChart: {
        value: 0,
        color: 'orange',
        data: d3.range(limit).map(function () {
            return 0
        })
    },
    InsideHumidityChart: {
        value: 0,
        color: 'blue',
        data: d3.range(limit).map(function () {
            return 0
        })
    },
    OutsideTemperatureChart: {
        value: 0,
        color: 'magenta',
        data: d3.range(limit).map(function () {
            return 0
        })
    },
    OutsideHumidityChart: {
        value: 0,
        color: 'green',
        data: d3.range(limit).map(function () {
            return 0
        })
    }
};
var x = d3.scaleTime()
    .domain([now - (limit - 2), now - duration])
    .range([0, width]);

var y = d3.scaleLinear()
    .domain([-40, 100])
    .range([height, 0]);

var line = d3.line()
    .curve(d3.curveBasis)
    .x(function (d, i) {
        return x(now - (limit - 2 - i) * duration)
    })
    .y(function (d) {
        return y(d)
});
var chart1 = d3.select('.graph1').append('svg')
    .attr('class', 'chart')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)

    //Adding margins to graph
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var axis = chart1.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(x.axis = d3.axisBottom().scale(x));

    //var y0 = d3.scaleLinear().range([height,0]);
    chart1.append("g")
    .call(d3.axisLeft(y));

// Gridline
var gridlinesY = d3.axisLeft()
    .tickFormat("")
    .tickSize(-width)
    .scale(y);

    chart1.append("g")
    .attr("class", "grid")
    .call(gridlinesY);

var gridlinesX = d3.axisTop()
    .tickFormat("")
    .tickSize(-height)
    .scale(x);

    chart1.append("g")
    .attr("class", "grid")
    .call(gridlinesX);



var paths = chart1.append('g');
for (var name in ChartsGroup) {
    var group = ChartsGroup[name];
    group.path = paths.append('path')
        .data([group.data])
        .attr('class', name + ' group')
        .style('stroke', group.color)
};
function tick1() {
    now = new Date();

    // Add new values
    for (var name in ChartsGroup) {
        var group = ChartsGroup[name];
        group.data.push(group.value); // Real values arrive at irregular intervals
        //group.data.push(10 + Math.random() * 70)
        group.path.attr('d', line)
    }

    // Shift domain
    x.domain([now - (limit - 2) * duration, now - duration]);

    // Slide x-axis left
    axis.transition()
        .duration(duration)
        .ease(d3.easeLinear)
        .call(x.axis);

    // Slide paths left
    paths.attr('transform', null)
        .transition()
        .duration(duration)
        .ease(d3.easeLinear)
        .attr('transform', 'translate(' + x(now - (limit - 1) * duration) + ')')
        .on('end', tick1);

    // Remove oldest data point from each group
    for (var name in ChartsGroup) {
        var group = ChartsGroup[name];
        group.data.shift()
    }
    };

// End of first chart section 



tick1()
// End of D3 section 


function change_button_text() {
    var elem = document.getElementById("myButton1");
    if (elem.value == "Выключить вытяжку") {
        elem.value = "Включить вытяжку",
            ws.send('turn_off_led_17');
    } 
    else {
        elem.value = "Выключить вытяжку",
            ws.send('turn_on_led_17');
    }

};
function MakeRequestToDB() {
    var CalendarFormData = { 'startDate': '', 'endDate': '' };
    var start = document.getElementById("startTime").value;
    var end = document.getElementById("endTime").value;
        CalendarFormData['startDate'] = start;
        CalendarFormData['endDate'] = end;
    var JsonFormData = JSON.stringify(CalendarFormData);
    ws.send(JsonFormData)
    console.log(JsonFormData)
};

var ResponseToTable = function (response){
    // EXTRACT VALUE FOR HTML HEADER.
    var col = [];
    for (var i = 0; i < response.length; i++) {
        for (var key in response[i]) {
            if (col.indexOf(key) === -1) {
                col.push(key);
            }
        }
    }
    // CREATE DYNAMIC TABLE.
    var table = document.createElement("table");

    // CREATE HTML TABLE HEADER ROW USING THE EXTRACTED HEADERS ABOVE.

    var tr = table.insertRow(-1);                   // TABLE ROW.

            for (var i = 0; i < col.length; i++) {
                var th = document.createElement("th");      // TABLE HEADER.
                th.innerHTML = col[i];
                tr.appendChild(th);
            }

    // ADD JSON DATA TO THE TABLE AS ROWS.
    for (var i = 0; i < response.length; i++) {
        
                    tr = table.insertRow(-1);
        
                    for (var j = 0; j < col.length; j++) {
                        var tabCell = tr.insertCell(-1);
                        tabCell.innerHTML = response[i][col[j]];
                    }
                }
    // FINALLY ADD THE NEWLY CREATED TABLE WITH JSON DATA TO A CONTAINER.
    var divContainer = document.getElementById("showData");
    divContainer.innerHTML = "";
    divContainer.appendChild(table);
};


var ResponseToChart = function(response){
    // SECOND CHART
    var data2 = response
    
    // set the dimensions and margins of the graph
    var margin2 = {top: 20, right: 2, bottom: 30, left: 25},
        width2 = 600 - margin2.left - margin2.right,
        height2 = 200 - margin2.top - margin2.bottom;

    // parse the date / time
    var parseTime = d3.utcParse('%Y-%m-%d %H:%M:%S');

    // set the ranges
    var x2 = d3.scaleTime().range([0, width2]);
    var y2 = d3.scaleLinear().range([height2, 0]);

    // define the 1st line
    var valueline1 = d3.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.insideTemperature); });

    // define the 2nd line
    var valueline2 = d3.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.insideHumidity); });

    // define the 3rd line
    var valueline3 = d3.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.outsideTemperature); });

    // define the 4th line
    var valueline4 = d3.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.outsideHumidity); });

    // append the svg obgect to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin

    var chart2 = d3.select('.graph2').append("svg")
        .attr("width", width2 + margin2.left + margin2.right)
        .attr("height", height2 + margin2.top + margin2.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin2.left + "," + margin2.top + ")");

    // Get the data

    // format the data
    data2.forEach(function(d) {
    d.date = parseTime(d.timestamp);
    d.insideTemperature = +d.temperature[0];
    d.insideHumidity = +d.humidity[0];
    d.outsideTemperature = +d.temperature[1];
    d.outsideHumidity = +d.humidity[1];


    });

    // Scale the range of the data
    x.domain(d3.extent(data2, function(d) { return d.date; }));
    // y.domain([d3.min(data2, function(d) {return Math.min(d.insideTemperature, d.insideHumidity,d.outsideTemperature,d.outsideHumidity); }),
    //           d3.max(data2, function(d) {return Math.max(d.insideTemperature, d.insideHumidity,d.outsideTemperature,d.outsideHumidity); })]);
    // y.domain([-40,100])
    // Add the valueline1 path.
    chart2.append("path")
        .data([data2])
        .attr("class", "line")
        .style("stroke", "orange")
        .attr("d", valueline1);

    // Add the valueline2 path.
    chart2.append("path")
        .data([data2])
        .attr("class", "line")
        .style("stroke", "blue")
        .attr("d", valueline2);

    // Add the valueline3 path.
    chart2.append("path")
        .data([data2])
        .attr("class", "line")
        .style("stroke", "magenta")
        .attr("d", valueline3);

    // Add the valueline4 path.
    chart2.append("path")
        .data([data2])
        .attr("class", "line")
        .style("stroke", "green")
        .attr("d", valueline4);


    // Add the X Axis
    chart2.append("g")
        .attr("transform", "translate(0," + height2 + ")")
        .call(d3.axisBottom(x));

    // Add the Y Axis
    chart2.append("g")
       .call(d3.axisLeft(y));

};
