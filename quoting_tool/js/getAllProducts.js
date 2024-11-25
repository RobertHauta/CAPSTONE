var table = document.getElementById("ProductTable");
var prev_search = "";

parent.Xrm.WebApi.retrieveMultipleRecords("crmdqe_productsservices", "?$select=crmdqe_descriptionshort,crmd_unitid,crmd_purchaseunitcost,crmd_make,crmdqe_category1,crmdqe_category2,crmdqe_category3&$expand=crmd_unitid($select=crmd_name)").then(
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
            cell3.innerHTML = result.entities[i].crmd_purchaseunitcost;
            cell4.innerHTML = result.entities[i].crmd_make;
            cell5.innerHTML = result.entities[i].crmdqe_category1;
            cell6.innerHTML = result.entities[i].crmdqe_category2;
            cell7.innerHTML = result.entities[i].crmdqe_category3;
            
            var button = document.createElement("button");
            button.innerHTML = "Add to Quote";
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
    
    parent.Xrm.WebApi.retrieveMultipleRecords("crmdqe_productsservices", "?$select=crmdqe_descriptionshort,crmd_unitid,crmd_purchaseunitcost,crmd_make,crmdqe_category1,crmdqe_category2,crmdqe_category3&$expand=crmd_unitid($select=crmd_name)&$filter=contains(crmdqe_descriptionshort,'" + search + "')").then(
    function success(result) {
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
            cell3.innerHTML = result.entities[i].crmd_purchaseunitcost;
            cell4.innerHTML = result.entities[i].crmd_make;
            cell5.innerHTML = result.entities[i].crmdqe_category1;
            cell6.innerHTML = result.entities[i].crmdqe_category2;
            cell7.innerHTML = result.entities[i].crmdqe_category3;
            
            //Inserting add to Quote Button
            var button = document.createElement("button");
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
