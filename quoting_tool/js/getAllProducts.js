//
//
// START OF CODE EXECUTED ON OPEN
//
//


var table = document.getElementById("ProductTable");
var prev_search = "";
var prev_make = "Make";
var prev_cat1 = "Cat1";
var prev_cat2 = "Cat2";
var prev_cat3 = "Cat3";
var cur_results = [];
var quoteLineItems = [];
var make_types = [];
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

var make_Dropdown = document.getElementById("Make");
make_Dropdown.addEventListener("change", filterMake);

var cat1_Dropdown = document.getElementById("Cat1");
cat1_Dropdown.addEventListener("change", filterCat1);

var cat2_Dropdown = document.getElementById("Cat2");
cat2_Dropdown.addEventListener("change", filterCat2);

var cat3_Dropdown = document.getElementById("Cat3");
cat3_Dropdown.addEventListener("change", filterCat3);

var top_button = document.getElementById("TopButton");
top_button.addEventListener("click", scrollToTop);

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
searchBar.addEventListener('blur', searchBarHandler);

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
           if (!make_types.includes(result.entities[i].crmd_make) && result.entities[i].crmd_make != null) {
                    make_types.push(result.entities[i].crmd_make);
           }
           if (!cat1_mat_types.includes(result.entities[i].crmdqe_category1) && result.entities[i].crmdqe_category1 != null) {
                    cat1_mat_types.push(result.entities[i].crmdqe_category1);
           }
           if (!cat2_mat_types.includes(result.entities[i].crmdqe_category2) && result.entities[i].crmdqe_category2 != null) {
                    cat2_mat_types.push(result.entities[i].crmdqe_category2);
           }
           if (!cat3_mat_types.includes(result.entities[i].crmdqe_category3) && result.entities[i].crmdqe_category3 != null) {
                    cat3_mat_types.push(result.entities[i].crmdqe_category3);
           }
            
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
        populateDropdown(cat1_mat_types.sort(), "Cat1");
        populateDropdown(cat2_mat_types.sort(), "Cat2");
        populateDropdown(cat3_mat_types.sort(), "Cat3");
        populateDropdown(make_types.sort(), "Make");
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
    prev_search = search;
}

function populateDropdown(array, id){
    //populating the category filter dropdowns
    var dropdown = document.getElementById(id);
        array.forEach(optionText => {
        const option = document.createElement('option');
        option.value = optionText; // This will be the value of the option
        option.textContent = optionText; // This will be the visible text in the dropdown
        dropdown.appendChild(option); // Append the option to the dropdown
    });
}

function filterMake(){
   var make = make_Dropdown.value;
   console.log(make);
  if (make == prev_make){    //value is same as before
      return;
  }
  /*if (make == "Make"){  //resetting the table
      cataloguePopulator("crmdqe_productsservices", fetch_unfiltered);
      return;
  }*/
    
  for(var i = table.rows.length - 1; i > 0; i--){
      table.deleteRow(i);
  }

  var fetch_searchfiltered = "?$select=crmdqe_descriptionshort,crmd_unitid,crmd_make,crmdqe_category1,crmdqe_category2,crmdqe_category3,crmdqe_costpricebc, crmd_minimumsellingquantity, davinci_laborminperunit"
                                   + "&$expand=crmd_unitid($select=crmd_name)&$filter=contains(crmd_make,'" + make + "')";
         
  cataloguePopulator("crmdqe_productsservices", fetch_searchfiltered);

  prev_make = make;
  return; 
 }
 
function filterCat1() {
    var cat1 = cat1_Dropdown.value;
    if (cat1 == prev_cat1) {    //value is same as before
        return;
    }
    /*if (cat1 == "Cat1") {  //resetting the table
        cataloguePopulator("crmdqe_productsservices", fetch_unfiltered);
        return;
    }*/

    for (var i = table.rows.length - 1; i > 0; i--) {
        table.deleteRow(i);
    }

    var fetch_searchfiltered = "?$select=crmdqe_descriptionshort,crmd_unitid,crmd_make,crmdqe_category1,crmdqe_category2,crmdqe_category3,crmdqe_costpricebc, crmd_minimumsellingquantity, davinci_laborminperunit"
        + "&$expand=crmd_unitid($select=crmd_name)&$filter=contains(crmdqe_category1,'" + cat1 + "')";

    cataloguePopulator("crmdqe_productsservices", fetch_searchfiltered);

    prev_cat1 = cat1;
    return;
}

function filterCat2() {
    var cat2 = cat2_Dropdown.value;
    if (cat2 == prev_cat2) {    //value is same as before
        return;
    }
    /*if (cat2 == "Cat2") {  //resetting the table
        cataloguePopulator("crmdqe_productsservices", fetch_unfiltered);
        return;
    }*/

    for (var i = table.rows.length - 1; i > 0; i--) {
        table.deleteRow(i);
    }

    var fetch_searchfiltered = "?$select=crmdqe_descriptionshort,crmd_unitid,crmd_make,crmdqe_category1,crmdqe_category2,crmdqe_category3,crmdqe_costpricebc, crmd_minimumsellingquantity, davinci_laborminperunit"
        + "&$expand=crmd_unitid($select=crmd_name)&$filter=contains(crmdqe_category2,'" + cat2 + "')";

    cataloguePopulator("crmdqe_productsservices", fetch_searchfiltered);

    prev_cat2 = cat2;
    return;
}

function filterCat3() {
    var cat3 = cat3_Dropdown.value;
    if (cat3 == prev_cat3) {    //value is same as before
        return;
    }
    /*if (cat3 == "Cat3") {  //resetting the table
        cataloguePopulator("crmdqe_productsservices", fetch_unfiltered);
        return;
    }*/

    for (var i = table.rows.length - 1; i > 0; i--) {
        table.deleteRow(i);
    }

    var fetch_searchfiltered = "?$select=crmdqe_descriptionshort,crmd_unitid,crmd_make,crmdqe_category1,crmdqe_category2,crmdqe_category3,crmdqe_costpricebc, crmd_minimumsellingquantity, davinci_laborminperunit"
        + "&$expand=crmd_unitid($select=crmd_name)&$filter=contains(crmdqe_category3,'" + cat3 + "')";

    cataloguePopulator("crmdqe_productsservices", fetch_searchfiltered);

    prev_cat3 = cat3;
    return;
}   
    


function scrollToTop(){
    document.documentElement.scrollTop = 0;
}
//
//
// END OF FUNCTIONS
//
//
