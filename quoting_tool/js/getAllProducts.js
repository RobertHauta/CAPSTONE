//
//
// START OF CODE EXECUTED ON OPEN
//
//


var table = document.getElementById("ProductTable");
var prev_search = "";
var cur_results = [];
var quoteLineItems = [];
var cat1_mat_types = [];
var cat2_mat_types = [];
var cat3_mat_types = [];
var redirect = false;

var fetch_unfiltered = "?$select=crmdqe_descriptionshort,crmd_unitid,crmd_make,crmdqe_category1,crmdqe_category2,crmdqe_category3,crmdqe_costpricebc, crmd_minimumsellingquantity, davinci_laborminperunit"
                                   + "&$expand=crmd_unitid($select=crmd_name)";
                                   
var quote_Button = document.getElementById("QuoteButton");
quote_Button.addEventListener("click", function(e){
    del_cookie("Items");
    var serialized_items = JSON.stringify(quoteLineItems);
    document.cookie = "Items=" + serialized_items + ";path=/";
    redirect = true;
    window.location.href = "quote_page.html";
});

var serialized = getCookie("Items");
if (serialized) {
        // Parse the serialized array back into an actual array
    quoteLineItems = JSON.parse(serialized);
    console.log(quoteLineItems[0]);
} else {
    console.log("No data found in cookie.");
}

var searchButton = document.getElementById("SearchButton");
searchButton.addEventListener("click", searchBarHandler);

var searchBar = document.getElementById("SearchBar");
searchBar.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      // code for enter
      searchBarHandler();
    }
});

//When the window is closed delete the "Items" cookie
window.addEventListener('beforeunload', (event) => {
    if(!redirect){
        del_cookie("Items");
        //event.returnValue = `Are you sure you want to leave?`;
    }
});

cataloguePopulator("crmdqe_productsservices", fetch_unfiltered);

//
//
// END OF CODE EXECUTED ON OPEN
//
//

//
//
// START OF FUNCTIONS
//
//

//Function to delete a cookie by its name
function del_cookie(name) {
    document.cookie = name + '=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

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

function cataloguePopulator(tableName, queryString){
parent.Xrm.WebApi.retrieveMultipleRecords(tableName, queryString).then(
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
            
             //Conditions to set what type of materials are in each category for filtering later
            if(cat1_mat_types.includes(result.entities[i].crmdqe_category1) == false){
                cat1_mat_types[cat1_mat_types.length] = result.entities[i].crmdqe_category1;
            }
            if(cat2_mat_types.includes(result.entities[i].crmdqe_category2) == false){
                cat2_mat_types[cat2_mat_types.length] = result.entities[i].crmdqe_category2;
            }
            if(cat3_mat_types.includes(result.entities[i].crmdqe_category3) == false){
                cat3_mat_types[cat3_mat_types.length] = result.entities[i].crmdqe_category3;
            }
            
            //populating the category filter dropdowns
            // for (let j = 1; j <= 3; j++) {
            //     let selectId = '#arr' + j;
            //     let arrId = '#cat' + j + '_mat_types';
            //     $.each(arrId, function (i, val) {
            //         $(selectId).append($('<option></option>').val(val).html(val));
            //     });
            // }
            
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
}

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
                                   + "&$expand=crmd_unitid($select=crmd_name)&$filter=contains(crmdqe_descriptionshort,'" + search + "')";
                                   
    cataloguePopulator("crmdqe_productsservices", fetch_searchfiltered);
}

//
//
// END OF FUNCTIONS
//
//
