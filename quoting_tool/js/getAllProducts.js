//
//
// START OF CODE EXECUTED ON OPEN
//
//

var table = document.getElementById("ProductTable");
var products = [];
var prev_search = "";
var default_filters = ["Make", "Cat1", "Cat2", "Cat3"];
var prev_filters = ["Make", "Cat1", "Cat2", "Cat3"];
var cur_results = [];
var quoteLineItems = [];
var make_types = [];
var cat1_types = [];
var cat2_types = [];
var cat3_types = [];
var redirect = false;

var fetch_unfiltered = "?$select=crmdqe_descriptionshort,crmd_unitid,crmd_make,crmdqe_category1,crmdqe_category2,crmdqe_category3,crmdqe_costpricebc, crmd_minimumsellingquantity, davinci_laborminperunit"
                                   + "&$expand=crmd_unitid($select=crmd_name)";
                                   
var quote_Button = document.getElementById("QuoteButton");
quote_Button.addEventListener("click", function(e){
    //Cookies.remove("Items");
    var serialized_items = JSON.stringify(quoteLineItems);
    //Cookies.set("Items", serialized_items); //document.cookie = "Items=" + serialized_items + ";path=/";
    sessionStorage.setItem('Items', serialized_items);
    redirect = true;
    window.location.href = "quote_page.html";
});

//Table header dropdowns for filtering
var make_Dropdown = document.getElementById("Make");
make_Dropdown.addEventListener("change", filter);

var cat1_Dropdown = document.getElementById("Cat1");
cat1_Dropdown.addEventListener("change", filter);

var cat2_Dropdown = document.getElementById("Cat2");
cat2_Dropdown.addEventListener("change", filter);

var cat3_Dropdown = document.getElementById("Cat3");
cat3_Dropdown.addEventListener("change", filter);

//Button to scroll back to top of page
var top_button = document.getElementById("TopButton");
top_button.addEventListener("click", scrollToTop);

var serialized = sessionStorage.getItem("Items")//Cookies.get('Items');//getCookie("Items");
if (serialized) {
        // Parse the serialized array back into an actual array
    quoteLineItems = JSON.parse(serialized);
} else {
    console.log("No data found in storage.");
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
        sessionStorage.clear();
        //Cookies.remove('Items');//del_cookie("Items");
        //event.returnValue = `Are you sure you want to leave?`;
    }
});

//Populate catalogue on open
cataloguePopulatorAPI("crmdqe_productsservices", fetch_unfiltered);
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

//Populate catalogue with API call to Query database
function cataloguePopulatorAPI(tableName, queryString){
    products.length = 0;
parent.Xrm.WebApi.retrieveMultipleRecords(tableName, queryString).then(
    function success(result) {
        for(let i = 0; i < result.entities.length; i++){
            products.push(result.entities[i]);
         }
    cataloguePopulatorArray(products);
    },
    function (error) {
        
        // handle error conditions
    }
    
);
}

//Populated with displayed array
function cataloguePopulatorArray(array){
//    cat1_types.splice(0, cat1_types.length);
    cat2_types.splice(0, cat2_types.length);
    cat3_types.splice(0, cat3_types.length);

	for(let i = 0; i < array.length; i++){
		var row = table.tBodies[0].insertRow(0);
		var cell1 = row.insertCell(0); 
		var cell2 = row.insertCell(1);
		var cell3 = row.insertCell(2);
		var cell4 = row.insertCell(3);
		var cell5 = row.insertCell(4);
		var cell6 = row.insertCell(5);
		var cell7 = row.insertCell(6);
		var cell8 = row.insertCell(7);
		
		cell1.innerHTML = array[i].crmdqe_descriptionshort;
		cell2.innerHTML = array[i].crmd_unitid.crmd_name;
		cell3.innerHTML = array[i].crmdqe_costpricebc;
		cell4.innerHTML = array[i].crmd_make;
		cell5.innerHTML = array[i].crmdqe_category1;
		cell6.innerHTML = array[i].crmdqe_category2;
		cell7.innerHTML = array[i].crmdqe_category3;
		
		cur_results[array.length - i - 1] = array[i];
		
	   //Conditions to set what type of materials are in each category for filtering later
	   if (!make_types.includes(array[i].crmd_make) && array[i].crmd_make != null) {
				make_types.push(array[i].crmd_make);
	   }
	   if (!cat1_types.includes(array[i].crmdqe_category1) && array[i].crmdqe_category1 != null) {
				cat1_types.push(array[i].crmdqe_category1);
	   }
	   if (!cat2_types.includes(array[i].crmdqe_category2) && array[i].crmdqe_category2 != null) {
				cat2_types.push(array[i].crmdqe_category2);
	   }
	   if (!cat3_types.includes(array[i].crmdqe_category3) && array[i].crmdqe_category3 != null) {
				cat3_types.push(array[i].crmdqe_category3);
	   }
        
        if(quoteLineItems.some(item => item.crmdqe_descriptionshort === array[i].crmdqe_descriptionshort)){
            cell8.innerHTML = "<strong>Added</strong>";
        }
        else{
            var button = document.createElement("button");
            button.addEventListener('click', function(event) {
                // Find the row of the clicked button
                const rowIndex = event.target.closest('tr').rowIndex; // Gets the row index (starts from 1)
                quoteLineItems[quoteLineItems.length] = cur_results[rowIndex-1];
                const cell = event.target.closest('td');
                cell.innerHTML = "<strong>Added</strong>";
                event.target.remove();
            });
            button.innerHTML = "+ Quote";
            button.setAttribute('class', 'btn btn-secondary');
            cell8.appendChild(button);
        }
    }
    populateDropdowns();
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
                                   
    cataloguePopulatorAPI("crmdqe_productsservices", fetch_searchfiltered);
    prev_search = search;
}

function populateDropdowns(){
    //keep category hierarchy
    //disable nested filters
    if(cat1_Dropdown.value == default_filters[1]){
            cat2_Dropdown.disabled=true;
            cat3_Dropdown.disabled=true;
    }
    else{
            cat2_Dropdown.disabled=false;
            cat3_Dropdown.disabled=false;
    }
    if(cat2_Dropdown.value == default_filters[2]){
            cat3_Dropdown.disabled=true;
    }else{
            cat3_Dropdown.disabled=false;
    }
    
    // if(make_types.length > 2){
    //     make_types.sort().forEach(optionText => {
    //         const option = document.createElement('option');
    //         option.value = optionText; // This will be the value of the option
    //         option.textContent = optionText; // This will be the visible text in the dropdown
    //         make_Dropdown.appendChild(option); // Append the option to the dropdown
    //     });
    // }

//    for(let i = cat1_Dropdown.options.length; i > 0; i--){
//        cat1_Dropdown.remove(i)
//    }
//    for(let i = cat2_Dropdown.options.length; i > 1; i--){
//        cat2_Dropdown.remove(i)
//    }
//    for(let i = cat3_Dropdown.options.length; i > 0; i--){
//        cat3_Dropdown.remove(i)
//    }
   
    //populating the category filter dropdowns
    if(cat1_Dropdown.options.length < 2){
        cat1_types.sort().forEach(optionText => {
            const option = document.createElement('option');
            option.value = optionText; // This will be the value of the option
            option.textContent = optionText; // This will be the visible text in the dropdown
            cat1_Dropdown.appendChild(option); // Append the option to the dropdown
        });
    }
    cat2_types.sort().forEach(optionText => {
        const option = document.createElement('option');
        option.value = optionText; // This will be the value of the option
        option.textContent = optionText; // This will be the visible text in the dropdown
        cat2_Dropdown.appendChild(option); // Append the option to the dropdown
    });
    cat3_types.sort().forEach(optionText => {
        const option = document.createElement('option');
        option.value = optionText; // This will be the value of the option
        option.textContent = optionText; // This will be the visible text in the dropdown
        cat3_Dropdown.appendChild(option); // Append the option to the dropdown
    });
}

function filter(){
    var new_filters = [make_Dropdown.value, cat1_Dropdown.value, cat2_Dropdown.value, cat3_Dropdown.value];
	var filtered = [];

	//clear table
	for(var i = table.rows.length - 1; i > 0; i--){
	  table.deleteRow(i);
	}
	
	//table reset
	if (new_filters.toString() == default_filters.toString()){  //resetting the table
	  cataloguePopulatorArray(products);
	}
	
	//all filters
    if(new_filters[1] != "Cat1" && new_filters[2] != "Cat2" && new_filters[3] != "Cat3"){
		for(let i = 0; i < products.length; i++){
			if(products[i].crmdqe_category1 == new_filters[1] && products[i].crmdqe_category2 == new_filters[2] && products[i].crmdqe_category3 == new_filters[3]){
				filtered.push(products[i]);
			}
		}
    }
    //make and cat1 && cat2
	else if(new_filters[1] != "Cat1" && new_filters[2] != "Cat2"){
		for(let i = 0; i < products.length; i++){
			if(products[i].crmdqe_category1 == new_filters[1] && products[i].crmdqe_category2 == new_filters[2]){
				filtered.push(products[i]);
			}
		}
	}
	//cat1
	else if (new_filters[1] != "Cat1" && new_filters[0] == "Make"){
		for(let i = 0; i < products.length; i++){
			if(products[i].crmdqe_category1 == new_filters[1]){
				filtered.push(products[i]);
			}
		}
	}
    else if (new_filters[1] != "Cat1" && new_filters[0] != "Make"){
		for(let i = 0; i < products.length; i++){
			if(products[i].crmdqe_category1 == new_filters[1] && products[i].crmd_make == new_filters[0]){
				filtered.push(products[i]);
			}
		}
        
    }

  //var fetch_searchfiltered = "?$select=crmdqe_descriptionshort,crmd_unitid,crmd_make,crmdqe_category1,crmdqe_category2,crmdqe_category3,crmdqe_costpricebc, crmd_minimumsellingquantity, davinci_laborminperunit"
  //                                 + "&$expand=crmd_unitid($select=crmd_name)&$filter=contains(crmd_make,'" + make + "')";
    cataloguePopulatorArray(filtered);
    prev_filters = new_filters;
    return; 
 }
//Scrolls back to top of page	
function scrollToTop(){
    document.documentElement.scrollTop = 0;
}
//
//
// END OF FUNCTIONS
//
//
/*
function filterAll(){
    console.log("made it");
    products.length = 0;
    var filterQuery = "?$select=crmdqe_descriptionshort,crmd_unitid,crmd_make,crmdqe_category1,crmdqe_category2,crmdqe_category3,crmdqe_costpricebc,crmd_minimumsellingquantity,davinci_laborminperunit" 
                            + "&$expand=crmd_unitid($select=crmd_name)" 
                            + "&$filter=contains(crmdqe_descriptionshort, '" + searchBar.value + "')"
                            + " and contains(crmdqe_category1, '" + cat1_Dropdown.value + "')"
                            + " and contains(crmdqe_category2, '" + cat2_Dropdown.value + "')"
                            + " and contains(crmdqe_category3, '" + cat3_Dropdown.value + "')"
                            + " and contains(crmd_make, '" + make_Dropdown.value + "')";
    cataloguePopulatorAPI("crmdqe_productsservices" ,filterQuery);
}*/
