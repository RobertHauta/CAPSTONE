var lineItems = [];
var quoteTable = document.getElementById("QuoteTable");
var refreshButton = document.getElementById("RefreshButton");

function getCookie(name) {
            var nameEq = name + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i].trim();
                if (c.indexOf(nameEq) === 0) {
                    return c.substring(nameEq.length, c.length);
                }
            }
            return "";
}

if(document.URL[document.URL.length - 15] == 'q'){
    refreshButton.addEventListener("click", refreshHandler);
    console.log(document.URL[document.URL.length - 15]);
    var serialized_items = getCookie("Items");
    if (serialized_items) {
        // Parse the serialized array back into an actual array
        var lineItems = JSON.parse(serialized_items);
        console.log("Array from HTML1: " + lineItems.join(", "));  // Display array values
    } else {
        console.log("No data found in cookie.");
    }
}


for(let i = 0; i < lineItems.length; i++){
    var row = quoteTable.tBodies[0].insertRow(0);
    var cell1 = row.insertCell(0); 
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    var cell4 = row.insertCell(3);
    var cell5 = row.insertCell(4);
    var cell6 = row.insertCell(5);
    var cell7 = row.insertCell(6);
    var cell8 = row.insertCell(7);
    var cell9 = row.insertCell(8);
            
    cell1.innerHTML = lineItems[i].crmdqe_descriptionshort;
    cell2.innerHTML = lineItems[i].crmd_unitid.crmd_name;
    cell3.innerHTML = lineItems[i].crmd_purchaseunitcost;
    cell4.innerHTML = lineItems[i].crmd_make;
    cell5.innerHTML = lineItems[i].crmdqe_category1;
    cell6.innerHTML = lineItems[i].crmdqe_category2;
    cell7.innerHTML = lineItems[i].crmdqe_category3;
    cell8.innerHTML = lineItems[i].crmdqe_category3;
    cell9.innerHTML = lineItems[i].crmdqe_category3;
}

function refreshHandler(){
    console.log("made it");
    for(let i = 0; i < lineItems.length; i++){
        var row = quoteTable.tBodies[0].insertRow(0);
        var cell1 = row.insertCell(0); 
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        var cell4 = row.insertCell(3);
        var cell5 = row.insertCell(4);
        var cell6 = row.insertCell(5);
        var cell7 = row.insertCell(6);
        var cell8 = row.insertCell(7);
        var cell9 = row.insertCell(8);
                
        cell1.innerHTML = lineItems[i].crmdqe_descriptionshort;
        cell2.innerHTML = lineItems[i].crmd_unitid.crmd_name;
        cell3.innerHTML = lineItems[i].crmd_purchaseunitcost;
        cell4.innerHTML = lineItems[i].crmd_make;
        cell5.innerHTML = lineItems[i].crmdqe_category1;
        cell6.innerHTML = lineItems[i].crmdqe_category2;
        cell7.innerHTML = lineItems[i].crmdqe_category3;
        cell8.innerHTML = lineItems[i].crmdqe_category3;
        cell9.innerHTML = lineItems[i].crmdqe_category3;
        console.log(lineItems[i]);
    }
}
