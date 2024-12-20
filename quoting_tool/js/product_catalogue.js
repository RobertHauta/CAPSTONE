//
//
// START OF CODE EXECUTED ON OPEN
//
//

//Temp
/*{
var record = {};
record.davinci_category1_newap = "Clips"; // Text
record.davinci_category2_newap = "Crayon"; // Text
record.davinci_category3_newap = "TestCat3"; // Text
record["defaultuomid@odata.bind"] = "/uoms(af7be14e-551b-e911-a97a-000d3a11fc57)"; // Lookup
record.davinci_laborminperunit = 0; // Decimal
record.davinci_make_newap = "Altex"; // Text
record.davinci_minimumsellingquantity = 2; // Decimal
record.name = "Test 3"; // Text
record.davinci_ourproductcode = "003test"; // Text
record.davinci_purchaseunitcost = 0.85; // Decimal
record["defaultuomscheduleid@odata.bind"] = "/uomschedules(11684951-551b-e911-a986-000d3a11f5ee)"; // Lookup
record.statecode = 0; // State
record.new_sku = "Testing111"; // Text

parent.Xrm.WebApi.createRecord("product", record).then(
	function success(result) {
		var newId = result.id;
		console.log(newId);
        var record1 = {};
        record1.statecode = 0; // State

        parent.Xrm.WebApi.updateRecord("product", newId, record1).then(
            function success(result) {
                var updatedId = result.id;
                console.log(updatedId);
            },
            function(error) {
                console.log(error.message);
            }
        );
	},
	function(error) {
		console.log(error.message);
	}
);


var record = {};
record.statecode = 0; // State

parent.Xrm.WebApi.updateRecord("product", "a29625-8ebe-ef11-b8e8-000d3a147421", record).then(
	function success(result) {
		var updatedId = result.id;
		console.log(updatedId);
	},
	function(error) {
		console.log(error.message);
	}
);
}*/
//end temp


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

var fetch_unfiltered = "?$select=productid,name,defaultuomid,davinci_make_newap,davinci_category1_newap,davinci_category2_newap,davinci_category3_newap,davinci_purchaseunitcost, davinci_minimumsellingquantity, davinci_laborminperunit"
                                   + "&$expand=defaultuomid($select=name)";

$('#QuoteButton').on('click', function(e){
    var serialized_items = JSON.stringify(quoteLineItems);
    sessionStorage.setItem('Items', serialized_items);
    redirect = true;
    window.location.href = "quote_page.html";
    
});

$('#TemplateButton').on("click", function(e){
    //Cookies.remove('Items');//del_cookie("Items");
    /*
    var serialized_items = "";
    if(!(lineItems.length === 0)){
        serialized_items = JSON.stringify(lineItems);
    }
    sessionStorage.setItem('Items', serialized_items); //= "Items=" + serialized_items + ";path=/";
    redirect = true;
    */
    window.location.href = "template_page.html";
});



//Table header dropdowns for filtering
/*$('#Make').on('change', newFilter);
$('#Cat1').on('change', newFilter);
$('#Cat2').on('change', newFilter);
$('#Cat3').on('change', newFilter);*/

var make_Dropdown = document.getElementById("Make");
make_Dropdown.addEventListener("change", newFilter);

var cat1_Dropdown = document.getElementById("Cat1");
cat1_Dropdown.addEventListener("change", newFilter);

var cat2_Dropdown = document.getElementById("Cat2");
cat2_Dropdown.addEventListener("change", newFilter);

var cat3_Dropdown = document.getElementById("Cat3");
cat3_Dropdown.addEventListener("change", newFilter);

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
cataloguePopulatorAPI("product", fetch_unfiltered);
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
    //cat1_types.splice(0, cat1_types.length);
    //cat2_types.splice(0, cat2_types.length);
    //cat3_types.splice(0, cat3_types.length);
    make_types.length = 0;
    cat1_types.length = 0;
    cat2_types.length = 0;
    cat3_types.length = 0;
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
		
		cell1.innerHTML = array[i].name;
        if(array[i].defaultuomid){ 
            cell2.innerHTML = array[i].defaultuomid.name; }

		cell3.innerHTML = array[i].davinci_purchaseunitcost;
		cell4.innerHTML = array[i].davinci_make_newap;
		cell5.innerHTML = array[i].davinci_category1_newap;
		cell6.innerHTML = array[i].davinci_category2_newap;
		cell7.innerHTML = array[i].davinci_category3_newap;
		
		cur_results[array.length - i - 1] = array[i];
		
	   //Conditions to set what type of materials are in each category for filtering later
	   if (!make_types.includes(array[i].davinci_make_newap) && array[i].davinci_make_newap !== null) {
				make_types.push(array[i].davinci_make_newap);
	   }
	   if (!cat1_types.includes(array[i].davinci_category1_newap) && array[i].davinci_category1_newap !== null) {
				cat1_types.push(array[i].davinci_category1_newap);
	   }
	   if (!cat2_types.includes(array[i].davinci_category2_newap) && array[i].davinci_category2_newap !== null) {
				cat2_types.push(array[i].davinci_category2_newap);
	   }
	   if (!cat3_types.includes(array[i].davinci_category3_newap) && array[i].davinci_category3_newap !== null) {
				cat3_types.push(array[i].davinci_category3_newap);
	   }
        
        if(quoteLineItems.some(item => item.name === array[i].name)){
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
    
    if(prev_search === search){ return;}
    
    for(var i = table.rows.length - 1; i > 0; i--){
        table.deleteRow(i);
    }
    
    var fetch_searchfiltered = "?$select=productid,name,defaultuomid,davinci_make_newap,davinci_category1_newap,davinci_category2_newap,davinci_category3_newap,davinci_purchaseunitcost, davinci_minimumsellingquantity, davinci_laborminperunit"
                                   + "&$expand=defaultuomid($select=name)&$filter=contains(name,'" + search + "')";
                                   
    cataloguePopulatorAPI("product", fetch_searchfiltered);
    prev_search = search;
}

function populateDropdowns(){
    
    const categories = [
        {types: cat1_types, dropdown: $('#Cat1')},
        {types: cat2_types, dropdown: $('#Cat2')},
        {types: cat3_types, dropdown: $('#Cat3')},
        {types: make_types, dropdown: $('#Make')}
    ];

    categories.forEach(category => {
        const firstOption = category.dropdown.find('option:first');
        const selected = category.dropdown.val();
        category.dropdown.empty();
        category.dropdown.append(firstOption);
        category.types.sort().forEach(optionText => {
            const option = $('<option></option>').val(optionText).text(optionText);
            category.dropdown.append(option);
        });
        const selOption = category.dropdown.find(`option[value="${selected}"]`);
        selOption.prop('selected', true);
    });
}

//Scrolls back to top of page	
function scrollToTop(){
    document.documentElement.scrollTop = 0;
}


function newFilter(){
    var new_filters = [$('#Make').val(), $('#Cat1').val(), $('#Cat2').val(), $('#Cat3').val()];
    var filtered = [];
    
    //clear table
	for(var i = table.rows.length - 1; i > 0; i--){
        table.deleteRow(i);
    }
	
	//table reset
	if (new_filters.toString() === default_filters.toString()){  //resetting the table
	  cataloguePopulatorArray(products);
	}
    
    
    for(var i = 0; i < products.length; i++){
        if(products[i].davinci_make_newap !== new_filters[0] && new_filters[0] !== "Make"){ continue; }
        else if(products[i].davinci_category1_newap !== new_filters[1] && new_filters[1] !== "Cat1"){ continue; }
        else if(products[i].davinci_category2_newap !== new_filters[2] && new_filters[2] !== "Cat2"){ continue; }
        else if(products[i].davinci_category3_newap !== new_filters[3] && new_filters[3] !== "Cat3"){ continue; }
        else{
            filtered.push(products[i]);
        }
    } /*
      f f f
      f t f
      t f f
      t t t*/
    
    cataloguePopulatorArray(filtered);
    prev_filters = new_filters;
    return;
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


/*function filter(){
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
			if(products[i].davinci_category1_newap == new_filters[1] && products[i].davinci_category2_newap == new_filters[2] && products[i].davinci_category3_newap == new_filters[3]){
				filtered.push(products[i]);
			}
		}
    }
    //make and cat1 && cat2
	else if(new_filters[1] != "Cat1" && new_filters[2] != "Cat2"){
		for(let i = 0; i < products.length; i++){
			if(products[i].davinci_category1_newap == new_filters[1] && products[i].davinci_category2_newap == new_filters[2]){
				filtered.push(products[i]);
			}
		}
	}
	//cat1
	else if (new_filters[1] != "Cat1" && new_filters[0] == "Make"){
		for(let i = 0; i < products.length; i++){
			if(products[i].davinci_category1_newap == new_filters[1]){
				filtered.push(products[i]);
			}
		}
	}
    else if (new_filters[1] != "Cat1" && new_filters[0] !== "Make"){
		for(let i = 0; i < products.length; i++){
			if(products[i].davinci_category1_newap == new_filters[1] && products[i].davinci_make_newap == new_filters[0]){
				filtered.push(products[i]);
			}
		}
        
    }

  //var fetch_searchfiltered = "?$select=crmdqe_descriptionshort,crmd_unitid,crmd_make,crmdqe_category1,crmdqe_category2,crmdqe_category3,crmdqe_costpricebc, crmd_minimumsellingquantity, davinci_laborminperunit"
  //                                 + "&$expand=crmd_unitid($select=crmd_name)&$filter=contains(crmd_make,'" + make + "')";
    cataloguePopulatorArray(filtered);
    prev_filters = new_filters;
    retu*/
