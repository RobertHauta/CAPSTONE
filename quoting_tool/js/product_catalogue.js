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
    
    $('#TakeoffButton').on("click", function(e){
        var serialized_items = JSON.stringify(quoteLineItems);
        sessionStorage.setItem('Items', serialized_items);
        redirect = true;
        window.location.href = "takeoff_page.htm";
    });

    $('#ExitButton').click(exitConfirmation);

    //Table header dropdowns for filtering
    $('#Make').on('change', filter);
    $('#Cat1').on('change', filter);
    $('#Cat2').on('change', filter);
    $('#Cat3').on('change', filter);
    
    //Button to clear all filters
    $('#FilterButton').click(function(){
        $('#Make').val($('#Make option:first').val());
        $('#Cat1').val($('#Cat1 option:first').val());
        $('#Cat2').val($('#Cat2 option:first').val());
        $('#Cat3').val($('#Cat3 option:first').val());
        filter();
    });

    //Button to scroll back to top of page
    $('#TopButton').on("click", scrollToTop);

    quoteLineItems = retrieveSession("Items");
    console.log(quoteLineItems);

    //$('#SearchButton').on('click', filter);
    $('#SearchBar').on('keypress', (event) => {event.key === 'Enter' ? filter() : null;});
    $('#SearchBar').blur(filter);

    //When the window is closed delete the "Items" cookie
    $(window).on('beforeunload', (event) => {
        //if (!redirect || !(performance.navigation.type === 1)){
          //  sessionStorage.clear();
        //}
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

function exitConfirmation(){
    Swal.fire({
        title: 'Are You Sure You Want To Leave?',
        html: "Any Unsaved Changes will be Lost",
        icon: 'warning',
        showCancelButton: true,
        allowOutsideClick: false, // Prevents dismissing by clicking outside
        confirmButtonText: 'Don\'t Leave',
        cancelButtonText: 'Leave Anyways'
    }).then((result) => {
                    if (!result.isConfirmed) {
                        parent.window.close();
                    }
    });
}

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
            result.entities[i].davinci_purchaseunitcost = result.entities[i].davinci_purchaseunitcost !== null ? result.entities[i].davinci_purchaseunitcost : 0;
            result.entities[i].davinci_laborminperunit = result.entities[i].davinci_laborminperunit !== null ? result.entities[i].davinci_laborminperunit : 0;
            products.push(result.entities[i]);
         }
         products.sort((a, b) => a.name.localeCompare(b.name));
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
            const $button = $("<button>")
                .addClass("btn btn-outline-danger IconButton")
                //.text("- Quote")
                .html("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\" fill=\"currentColor\" class=\"bi bi-trash\" viewBox=\"0 0 16 16\">" +
                  "<path d=\"M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z\"/>" +
                  "<path d=\"M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z\"/>" +
                "</svg>")
                .on("click", function () {
                    const rowIndex = $(this).closest("tr").index();
                    if($(this).hasClass('btn-outline-secondary')){
                        quoteLineItems.push(cur_results[array.length - rowIndex - 1]); 
                        quoteLineItems[quoteLineItems.length - 1].isChanged = true;
                        $(this).html("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\" fill=\"currentColor\" class=\"bi bi-trash\" viewBox=\"0 0 16 16\">" +
                          "<path d=\"M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z\"/>" +
                          "<path d=\"M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z\"/>" +
                        "</svg>");
                    }
                    else{
                        quoteLineItems = quoteLineItems.filter(line => line.name !== cur_results[array.length - rowIndex - 1].name);
                        $(this).html("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\" fill=\"currentColor\" class=\"bi bi-plus-lg\" viewBox=\"0 0 16 16\">" +
                          "<path fill-rule=\"evenodd\" d=\"M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2\"/>" +
                        "</svg>");
                    }
                    $(this).toggleClass('btn-outline-secondary btn-outline-danger');
                });

            $cell8.append($button);
        } else {
            const $button = $("<button>")
                .addClass("btn btn-outline-secondary IconButton")
                //.text("+ Quote")
                .html("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\" fill=\"currentColor\" class=\"bi bi-plus-lg\" viewBox=\"0 0 16 16\">" +
                  "<path fill-rule=\"evenodd\" d=\"M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2\"/>" +
                "</svg>")
                .on("click", function () {
                    const rowIndex = $(this).closest("tr").index();
                    if($(this).hasClass('btn-outline-secondary')){
                        quoteLineItems.push(cur_results[array.length - rowIndex - 1]); 
                        $(this).html("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\" fill=\"currentColor\" class=\"bi bi-trash\" viewBox=\"0 0 16 16\">" +
                          "<path d=\"M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z\"/>" +
                          "<path d=\"M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z\"/>" +
                        "</svg>");
                    }
                    else{
                        quoteLineItems = quoteLineItems.filter(line => line.name !== cur_results[array.length - rowIndex - 1].name);
                        $(this).html("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\" fill=\"currentColor\" class=\"bi bi-plus-lg\" viewBox=\"0 0 16 16\">" +
                          "<path fill-rule=\"evenodd\" d=\"M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2\"/>" +
                        "</svg>");
                    }
                    $(this).toggleClass('btn-outline-secondary btn-outline-danger');
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
    $(window).scrollTop(0);
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
