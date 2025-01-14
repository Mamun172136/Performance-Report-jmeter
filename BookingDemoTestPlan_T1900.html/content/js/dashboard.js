/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 89.87030764640845, "KoPercent": 10.129692353591548};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.3330408381741282, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.46311799083873006, 500, 1500, "create  bookingRequest"], "isController": false}, {"data": [0.5360395935344601, 500, 1500, "get booking Request"], "isController": false}, {"data": [0.0, 500, 1500, "login Request"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 56981, 5772, 10.129692353591548, 9722.171671258928, 0, 352654, 924.0, 40847.8, 60205.8, 112764.4000000001, 9.380484062675942, 9.304815347854198, 2.362917049847969], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["create  bookingRequest", 18993, 1901, 10.008950666034854, 1402.3453377560186, 0, 58417, 829.0, 2565.600000000002, 5123.099999999995, 12415.640000000058, 3.1333502596607508, 3.276838448319765, 1.1813146677267892], "isController": false}, {"data": ["get booking Request", 18993, 1961, 10.324856526088558, 1040.8783762438832, 0, 33085, 573.0, 2118.0, 3065.0, 8505.880000000063, 3.133698186239975, 3.2132805320258244, 0.5150567240846641], "isController": false}, {"data": ["login Request", 18995, 1910, 10.05527770465912, 26721.501237167657, 4489, 352654, 16472.0, 59226.40000000002, 68601.6, 114775.36000000004, 3.1291338089770475, 2.830676533102595, 0.6706403656202176], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 5699, 98.73527373527374, 10.001579473859708], "isController": false}, {"data": ["Non HTTP response code: javax.net.ssl.SSLProtocolException/Non HTTP response message: Received close_notify during handshake", 1, 0.017325017325017324, 0.001754970955230691], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 4, 0.0693000693000693, 0.007019883820922764], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 3, 0.05197505197505198, 0.005264912865692073], "isController": false}, {"data": ["Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: No such host is known (restful-booker.herokuapp.com)", 1, 0.017325017325017324, 0.001754970955230691], "isController": false}, {"data": ["404/Not Found", 61, 1.0568260568260568, 0.10705322826907215], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: restful-booker.herokuapp.com:443 failed to respond", 2, 0.03465003465003465, 0.003509941910461382], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: A connection attempt failed because the connected party did not properly respond after a period of time, or established connection failed because connected host has failed to respond", 1, 0.017325017325017324, 0.001754970955230691], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 56981, 5772, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 5699, "404/Not Found", 61, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 4, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 3, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: restful-booker.herokuapp.com:443 failed to respond", 2], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["create  bookingRequest", 18993, 1901, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 1900, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["get booking Request", 18993, 1961, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 1900, "404/Not Found", 61, "", "", "", "", "", ""], "isController": false}, {"data": ["login Request", 18995, 1910, "Non HTTP response code: java.net.UnknownHostException/Non HTTP response message: restful-booker.herokuapp.com", 1899, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 3, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset by peer", 3, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: restful-booker.herokuapp.com:443 failed to respond", 2, "Non HTTP response code: javax.net.ssl.SSLProtocolException/Non HTTP response message: Received close_notify during handshake", 1], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
