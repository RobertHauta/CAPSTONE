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

    $('#SearchBar').on('keypress', (event) => {event.key === 'Enter' ? (filter(), $('#SearchBar').blur()) : null;});
    $('#SearchBar').on('blur', function(){
        if($('#SearchBar').val() === ""){
            filter();
        }
    });
    $('#SearchButton').click(filter);

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
        cancelButtonText: 'Leave Anyways',
        cancelButtonColor: "#3d3935",
        confirmButtonColor: "#e91d2d"
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
    [make_types, cat1_types, cat2_types, cat3_types] = [[], [], [], []];

    const $tableBody = $("#ProductTable tbody").empty();

    array.forEach((item, index) => {
        const $row = $("<tr>");
        const cells = [
            item.name,
            item.defaultuomid ? item.defaultuomid.name : "",
            item.davinci_purchaseunitcost,
            item.davinci_make_newap,
            item.davinci_category1_newap,
            item.davinci_category2_newap,
            item.davinci_category3_newap
        ];

        cells.forEach(cellText => $("<td>").text(cellText).appendTo($row));

        const $button = createButton(item, array.length - index - 1);
        $("<td>").append($button).appendTo($row);
        $tableBody.append($row);

        updateCategoryArrays(item);
        cur_results[array.length - index - 1] = item;
    });

    populateDropdowns();
}

function createButton(item, resultIndex) {
    const isInQuote = quoteLineItems.some(q => q.name === item.name);
    const buttonClass = isInQuote ? 'btn-outline-danger' : 'btn-outline-secondary';
    const buttonIcon = isInQuote ? getTrashIcon() : getPlusIcon();

    return $("<button>")
        .addClass(`btn ${buttonClass} IconButton`)
        .html(buttonIcon)
        .on("click", function() {
            const isAdding = $(this).hasClass('btn-outline-secondary');
            if (isAdding) {
                quoteLineItems.push(cur_results[resultIndex]);
                quoteLineItems[quoteLineItems.length - 1].isChanged = true;
                $(this).html(getTrashIcon());
            } else {
                quoteLineItems = quoteLineItems.filter(line => line.name !== cur_results[resultIndex].name);
                $(this).html(getPlusIcon());
            }
            $(this).toggleClass('btn-outline-secondary btn-outline-danger');
        });
}

function updateCategoryArrays(item) {
    const categories = [
        { array: make_types, value: item.davinci_make_newap },
        { array: cat1_types, value: item.davinci_category1_newap },
        { array: cat2_types, value: item.davinci_category2_newap },
        { array: cat3_types, value: item.davinci_category3_newap }
    ];

    categories.forEach(category => {
        if (!category.array.includes(category.value) && category.value !== null) {
            category.array.push(category.value);
        }
    });
}

function getTrashIcon() {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">' +
           '<path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>' +
           '<path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>' +
           '</svg>';
}

function getPlusIcon() {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-plus-lg" viewBox="0 0 16 16">' +
           '<path fill-rule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2"/>' +
           '</svg>';
}

/**
 * Populates dropdown menus with unique category options from the product catalogue.
 * This function updates the dropdown menus for Category 1, Category 2, Category 3, and Make.
 * It preserves the first option (usually a default option) and the currently selected option in each dropdown.
 * The options are sorted alphabetically before being added to the dropdowns.
 * 
 * @function
 * @name populateDropdowns
 * @description Populates category dropdowns with sorted, unique options from the product catalogue.
 * 
 * @requires jQuery - This function uses jQuery for DOM manipulation.
 * @requires cat1_types - Global array containing unique Category 1 options.
 * @requires cat2_types - Global array containing unique Category 2 options.
 * @requires cat3_types - Global array containing unique Category 3 options.
 * @requires make_types - Global array containing unique Make options.
 * 
 * @returns {void} This function does not return a value.
 */
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

/**
 * Filters the product catalogue based on selected categories and search bar contents.
 * This function updates the displayed products according to the current filter settings.
 * 
 * @function
 * @name filter
 * @description Applies filters to the product catalogue and updates the display.
 * 
 * @requires jQuery - This function uses jQuery for DOM manipulation.
 * @requires products - Global array containing all products.
 * @requires default_filters - Global array containing default filter values.
 * @requires prev_search - Global variable storing the previous search term.
 * @requires prev_filters - Global array storing the previous filter values.
 * @requires cataloguePopulatorArray - Function to populate the catalogue with filtered results.
 * 
 * @returns {void} This function does not return a value, but updates the global state and DOM.
 */
function filter() {
    const new_filters = [
        $('#Make').val(),
        $('#Cat1').val(),
        $('#Cat2').val(),
        $('#Cat3').val(),
        $('#SearchBar').val().toLowerCase()
    ];

    const isDefaultFilter = new_filters.toString() === default_filters.toString();
    const filtered = isDefaultFilter ? products : products.filter(product => {
        return (new_filters[0] === "Make" || product.davinci_make_newap === new_filters[0]) &&
               (new_filters[1] === "Cat1" || product.davinci_category1_newap === new_filters[1]) &&
               (new_filters[2] === "Cat2" || product.davinci_category2_newap === new_filters[2]) &&
               (new_filters[3] === "Cat3" || product.davinci_category3_newap === new_filters[3]) &&
               (new_filters[4] === prev_search || product.name.toLowerCase().includes(new_filters[4]));
    });

    $("#ProductTable tbody").empty();
    cataloguePopulatorArray(filtered);
    prev_filters = new_filters;
    prev_search = new_filters[4];
}




//
//
// END OF FUNCTIONS
//
//
