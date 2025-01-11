//
//
// START OF CODE EXECUTED ON OPEN
//
//

var products = [];
var prev_search = "";
var default_filters = ["Make", "Cat1", "Cat2", "Cat3", ""];
var prev_filters = ["Make", "Cat1", "Cat2", "Cat3", ""];
var cur_results = [];
var quoteLineItems = [];
var make_types = [];
var cat1_types = [];
var cat2_types = [];
var cat3_types = [];
var redirect = false;

var fetch_unfiltered = "?$select=productid,name,defaultuomid,davinci_make_newap,davinci_category1_newap,davinci_category2_newap,davinci_category3_newap,davinci_purchaseunitcost, davinci_minimumsellingquantity, davinci_laborminperunit"
                                   + "&$expand=defaultuomid($select=name)";
                                   
$(window).on("load", function() {
    $('#QuoteButton').on('click', function(e){
        var serialized_items = JSON.stringify(quoteLineItems);
        sessionStorage.setItem('Items', serialized_items);
        redirect = true;
        window.location.href = "quote_page.html";
    
    });

    $('#TemplateButton').on("click", function(e){
        var serialized_items = JSON.stringify(quoteLineItems);
        sessionStorage.setItem('Items', serialized_items);
        redirect = true;
        window.location.href = "template_page.html";
    });



    //Table header dropdowns for filtering
    $('#Make').on('change', filter);
    $('#Cat1').on('change', filter);
    $('#Cat2').on('change', filter);
    $('#Cat3').on('change', filter);

    //Button to scroll back to top of page
    $('#TopButton').on("click", scrollToTop);

    quoteLineItems = retrieveSession("Items");
    console.log(quoteLineItems);

    $('#SearchButton').on('click', filter);
    $('#SearchBar').on('keypress', (event) => {event.key === 'Enter' ? filter() : null;});
    $('#SearchBar').blur(filter);

    //When the window is closed delete the "Items" cookie
    $(window).on('beforeunload', (event) => {
        if(!redirect){
            sessionStorage.clear();
        }
    });

    //Populate catalogue on open
    cataloguePopulatorAPI("product", fetch_unfiltered);
});
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

function retrieveSession(key){
    var serialized_items = sessionStorage.getItem(key);//Cookies.get('Items'); //getCookie("Items");
    if (serialized_items) {
        // Parse the serialized array back into an actual array
        return JSON.parse(serialized_items);
    } else {
        return [];
    }
}

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
function cataloguePopulatorArray(array) {
    make_types.length = 0;
    cat1_types.length = 0;
    cat2_types.length = 0;
    cat3_types.length = 0;

    const $tableBody = $("#ProductTable tbody");
    $tableBody.empty();

    $.each(array, function (index, item) {
        const $row = $("<tr>");

        const $cell1 = $("<td>").text(item.name).appendTo($row);
        const $cell2 = $("<td>").text(item.defaultuomid ? item.defaultuomid.name : "").appendTo($row);
        const $cell3 = $("<td>").text(item.davinci_purchaseunitcost).appendTo($row);
        const $cell4 = $("<td>").text(item.davinci_make_newap).appendTo($row);
        const $cell5 = $("<td>").text(item.davinci_category1_newap).appendTo($row);
        const $cell6 = $("<td>").text(item.davinci_category2_newap).appendTo($row);
        const $cell7 = $("<td>").text(item.davinci_category3_newap).appendTo($row);

        const $cell8 = $("<td>");

        // Check if item already exists in quoteLineItems
        if (quoteLineItems.some(q => q.name === item.name)) {
            $cell8.html("<strong>Added</strong>");
        } else {
            const $button = $("<button>")
                .addClass("btn btn-secondary")
                .text("+ Quote")
                .on("click", function () {
                    const rowIndex = $(this).closest("tr").index();
                    quoteLineItems.push(cur_results[array.length - rowIndex - 1]);
                    $(this).parent().html("<strong>Added</strong>");
                });

            $cell8.append($button);
        }

        $row.append($cell8);
        $tableBody.append($row);

        // Update category arrays
        if (!make_types.includes(item.davinci_make_newap) && item.davinci_make_newap !== null) {
            make_types.push(item.davinci_make_newap);
        }
        if (!cat1_types.includes(item.davinci_category1_newap) && item.davinci_category1_newap !== null) {
            cat1_types.push(item.davinci_category1_newap);
        }
        if (!cat2_types.includes(item.davinci_category2_newap) && item.davinci_category2_newap !== null) {
            cat2_types.push(item.davinci_category2_newap);
        }
        if (!cat3_types.includes(item.davinci_category3_newap) && item.davinci_category3_newap !== null) {
            cat3_types.push(item.davinci_category3_newap);
        }

        cur_results[array.length - index - 1] = item;
    });

    populateDropdowns();
}

// Finds all unique categories in the catalogue
// Populates dropdowns with list of categories in each column
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
    $('html, body').animate({ scrollTop: 0 }, 1000); // 'slow' or duration in milliseconds
}

// Filters catalogue based on categories selected and search bar contents
function filter(){
    var new_filters = [$('#Make').val(), $('#Cat1').val(), $('#Cat2').val(), $('#Cat3').val(), $('#SearchBar').val()];
    var filtered = [];
    
    //clear table
	const $tableBody = $("#ProductTable tbody");
    $tableBody.empty();
	
	//table reset
	if (new_filters.toString() === default_filters.toString()){  //resetting the table
	  cataloguePopulatorArray(products);
	}
    
    
    for(var i = 0; i < products.length; i++){
    
        if(products[i].davinci_make_newap !== new_filters[0] && new_filters[0] !== "Make"){ continue; }
        else if(products[i].davinci_category1_newap !== new_filters[1] && new_filters[1] !== "Cat1"){ continue; }
        else if(products[i].davinci_category2_newap !== new_filters[2] && new_filters[2] !== "Cat2"){ continue; }
        else if(products[i].davinci_category3_newap !== new_filters[3] && new_filters[3] !== "Cat3"){ continue; }
        else if(!products[i].name.toLowerCase().includes(new_filters[4].toLowerCase()) && new_filters[4] !== prev_search) { continue; }
        else{
            filtered.push(products[i]);
        }
    }
    
    cataloguePopulatorArray(filtered);
    prev_filters = new_filters;
    return;
}


//
//
// END OF FUNCTIONS
//
//
