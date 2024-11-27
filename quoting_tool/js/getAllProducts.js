var table = document.getElementById("ProductTable");
var prev_search = "";
var cur_results = [];
var quoteLineItems = [];

var fetch_unfiltered = "?$select=crmdqe_descriptionshort,crmd_unitid,crmd_make,crmdqe_category1,crmdqe_category2,crmdqe_category3,crmdqe_costpricebc, crmd_minimumsellingquantity, davinci_laborminperunit"
                                   + "&$expand=crmd_unitid($select=crmd_name)";
                                   
var quote_Button = document.getElementById("QuoteButton");
quote_Button.addEventListener("click", function(e){
    clearAllCookies();
    var serialized_items = JSON.stringify(quoteLineItems);
    document.cookie = "Items=" + serialized_items + ";path=/";
    window.location.href = "quote_page.html";
});



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

var serialized = getCookie("Items");
if (serialized) {
        // Parse the serialized array back into an actual array
    quoteLineItems = JSON.parse(serialized);
    console.log(quoteLineItems[0]);
} else {
    console.log("No data found in cookie.");
}



parent.Xrm.WebApi.retrieveMultipleRecords("crmdqe_productsservices", fetch_unfiltered).then(
    function success(result) {
        for(let i = 0; i < result.entities.length; i++){
            var row = table.tBodies[0].insertRow(0);
            var cell1 = row.insertCell(0); 
            var cell2 = row.insertCell(1);
            var cell3 = row.insertCell(2);
            var cell4 = row.insertCell(3);
            var cell5 = row.insertCell(4);
            var cell6 = row.insertCell(5);
            var cell7 = row.insertCell(6);
            var cell8 = row.insertCell(7);
            
            cell1.innerHTML = result.entities[i].crmdqe_descriptionshort;
            cell2.innerHTML = result.entities[i].crmd_unitid.crmd_name;
            cell3.innerHTML = result.entities[i].crmdqe_costpricebc;
            cell4.innerHTML = result.entities[i].crmd_make;
            cell5.innerHTML = result.entities[i].crmdqe_category1;
            cell6.innerHTML = result.entities[i].crmdqe_category2;
            cell7.innerHTML = result.entities[i].crmdqe_category3;
            
            cur_results[result.entities.length - i - 1] = result.entities[i];
            
            var button = document.createElement("button");
            button.addEventListener('click', function(event) {
                // Find the row of the clicked button
                const rowIndex = event.target.closest('tr').rowIndex; // Gets the row index (starts from 1)
                quoteLineItems[quoteLineItems.length] = cur_results[rowIndex-1];
            });
            button.innerHTML = "+ Quote";
            button.setAttribute('class', 'btn btn-secondary');
            cell8.appendChild(button);
        }
        // perform operations on record retrieval
    },
    function (error) {
        
        // handle error conditions
    }
    
);

var searchButton = document.getElementById("SearchButton");
searchButton.addEventListener("click", searchBarHandler);

var searchBar = document.getElementById("SearchBar");
searchBar.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      // code for enter
      searchBarHandler();
    }
});

//Gets Value from Search Bar
//Performs a filter query on the database based on search value
//Populates table with Product Values and add to quote button
function searchBarHandler(){
    var search = searchBar.value;
    
    if(prev_search == search){ return;}
    
    for(var i = table.rows.length - 1; i > 0; i--){
        table.deleteRow(i);
    }
    
    var fetch_searchfiltered = "?$select=crmdqe_descriptionshort,crmd_unitid,crmd_make,crmdqe_category1,crmdqe_category2,crmdqe_category3,crmdqe_costpricebc, crmd_minimumsellingquantity, davinci_laborminperunit"
                                   + "&$expand=crmd_unitid($select=crmd_name)&$filter=contains(crmdqe_descriptionshort,'" + search + "')"
    
    parent.Xrm.WebApi.retrieveMultipleRecords("crmdqe_productsservices", fetch_searchfiltered).then(
    function success(result) {
        cur_results.length = 0;
        for(let i = 0; i < result.entities.length; i++){
            //Formatting Rows
            var row = table.tBodies[0].insertRow(0);
            var cell1 = row.insertCell(0); 
            var cell2 = row.insertCell(1);
            var cell3 = row.insertCell(2);
            var cell4 = row.insertCell(3);
            var cell5 = row.insertCell(4);
            var cell6 = row.insertCell(5);
            var cell7 = row.insertCell(6);
            var cell8 = row.insertCell(7);
            
            //Inserting line item values
            cell1.innerHTML = result.entities[i].crmdqe_descriptionshort;
            cell2.innerHTML = result.entities[i].crmd_unitid.crmd_name;
            cell3.innerHTML = result.entities[i].crmdqe_costpricebc;
            cell4.innerHTML = result.entities[i].crmd_make;
            cell5.innerHTML = result.entities[i].crmdqe_category1;
            cell6.innerHTML = result.entities[i].crmdqe_category2;
            cell7.innerHTML = result.entities[i].crmdqe_category3;
            
            //Inserting add to Quote Button
            cur_results[result.entities.length - i - 1] = result.entities[i];
            
            var button = document.createElement("button");
            button.addEventListener('click', function(event) {
                // Find the row of the clicked button
                const rowIndex = event.target.closest('tr').rowIndex; // Gets the row index (starts from 1)
                quoteLineItems[quoteLineItems.length] = cur_results[rowIndex-1];
            });
            button.innerHTML = "Add to Quote";
            cell8.appendChild(button);
        }
        // perform operations on record retrieval
        prev_search = search;
    },
    function (error) {
        
        // handle error conditions
    }
    
);
}

