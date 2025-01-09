//
// START CODE EXECUTED ON LOAD
//
//
$(window.parent).on("load", function() {
     window.parent.document.title = "Quoting Tool";
});

//variable holding all line item json objects
var lineItems = [];
var existingLineItems = [];
var customLineItems = [];
var hasLoaded = true;
//parameter to check when leaving a page to see if its redirecting or exiting the quote manager
var redirect = false;
//Test Values will be dynamic in future
var QuoteId = "";

var OpportunityId = "1bbcf3ef-e330-40ce-af4c-ed541dbe4c0f" //Testing Value will be integrated later
var QuoteInfo = {};
{
    const serialized = sessionStorage.getItem("ID");
    QuoteInfo = JSON.parse(serialized);
}
//Labor Rate field at top of page
//Adding watch for user to enter or blur from textfield
//if so update calculated fields with new values 
$('#Wage').on('keypress blur', (event) => { reCalcEvent(event); });
$('#Wage').val(45); 

//Workday Length field at top of page
//Adding watch for user to enter or blur from textfield
//if so update calculated fields with new values 
$('#DayHrs').on('keypress blur', (event) => { reCalcEvent(event); });
$('#DayHrs').val(8); 

//Contingency % field at top of page
//Adding watch for user to enter or blur from textfield
//if so update calculated fields with new values
$('#Contingency\\%').on('keypress blur', (event) => {reCalcEvent(event);});
$('#Contingency\\%').val(3.7);

//overhead % field at top of page
//Adding watch for user to enter or blur from textfield
//if so update calculated fields with new values
$('#Overhead\\%').on('keypress blur', (event) => {reCalcEvent(event);});
$('#Overhead\\%').val(15);

//profit % field at top of page
//Adding watch for user to enter or blur from textfield
//if so update calculated fields with new values
$('#Profit\\%').on('keypress blur', (event) => {reCalcEvent(event);});
$('#Profit\\%').val(10);

$('#saveQuote').on('click', saveQuote);
$('#saveTemplate').on('click', saveTemplate);

$('#TopButton').on("click", scrollToTop);

/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
$('.save-btn').on("click", function(e){
    $("#myDropdown").toggleClass("show");
});

//Allows Quote Name to be Editable
$('#QuoteName').on("dblclick", function(){
    $(this).attr('contenteditable', 'true').focus();

    $(this).on('blur', function () {
        $(this).removeAttr('contenteditable');
        saveMetrics();
    });
});

$('#LineItmBtn').on("click", function(){
    $('.PageDiv').toggleClass("LoadPage");
    $('.LineItemForm').toggleClass("show");
});

$('#NewItemSave').click(addCustomLineItem);

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
  if(!event.target.matches('.save-btn')) {
    var dropdowns = $(".dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}


//Use scope because unserialized is unused after this point
{
    //checks if the metrics item has previously been set so
    //that users changes in quote page save state
    var unserialized = sessionStorage.getItem('Metrics');
    if(!(unserialized === null)){
        var metrics = JSON.parse(unserialized);
        $('#Wage').val(metrics.Wage);
        $('#Contingency\\%').val(metrics.Cont);
        $('#Overhead\\%').val(metrics.Over);
        $('#Profit\\%').val(metrics.Prof);
        QuoteId = metrics.Quote;
        $('#QuoteName').html(metrics.Name);
    }

}

//Button for redirecting to the product catalogue page
//Before redirect clear sessionstorage and update with most recent line item info
{
    $('#ProductButton').on("click", function(e){
        saveSession("existing", existingLineItems);
        saveSession("Items", lineItems);
        saveSession("Custom", customLineItems);
        saveMetrics();
        redirect = true;
        window.location.href = "product_catalogue.html";
    });
}

{
    $('#TemplateButton').on("click", function(e){
        saveSession("existing", existingLineItems);
        saveSession("Items", lineItems);
        saveSession("Custom", customLineItems);
        saveMetrics();
        redirect = true;
        window.location.href = "template_page.html";
    });
}

//When the window is closed delete the "Items" cookie
window.addEventListener('beforeunload', (event) => {
    if(!redirect){
        sessionStorage.clear();
        //event.returnValue = `Are you sure you want to leave?`;
    }
});

//Gets the session items 
//fills line items with it's value if not empty
lineItems = retrieveSession("Items");
existingLineItems = retrieveSession("existing");
customLineItems = retrieveSession("Customs");

if(QuoteId === ''){
    getQuoteAPI().then( function(){
        tableReCalc();
    }).catch(function(error){
        console.log("Error in getQuoteAPI:", error);
    });
}
else{
    tableReCalc();
}


//
//
// END OF CODE EXECUTED WHEN LOADED IN
//
//

//
//
// START OF FUNCTIONS
//
//

//a key value pair saves to session storage
function saveSession(key, obj){
    var serialized_items = "";
    if(!(obj.length === 0)){
        serialized_items = JSON.stringify(obj);
    }
    sessionStorage.setItem(key, serialized_items); //= "Items=" + serialized_items + ";path=/";
}

function retrieveSession(key){
    var serialized_items = sessionStorage.getItem(key);//Cookies.get('Items'); //getCookie("Items");
    if (serialized_items) {
        // Parse the serialized array back into an actual array
        return JSON.parse(serialized_items);
    } else {
        return [];
        //console.log("No data found in storage.");
    }
}

function saveMetrics(){
    var metricsJSON = {
        Wage: $('#Wage').val(),
        Cont: $('#Contingency\\%').val(),
        Over: $('#Overhead\\%').val(),
        Prof: $('#Profit\\%').val(),
        Quote: QuoteId,
        Name: $('#QuoteName').html()
    };
    serialized = JSON.stringify(metricsJSON);
    sessionStorage.setItem('Metrics', serialized);
}

function errorAlert(msg){
    Swal.fire({
        title: 'Error',
        text: `An Error Occured. ${msg} has no value. Please Try Again`,
        icon: 'error',
        showCancelButton: true,
        confirmButtonText: 'Dismiss',
    });
}

function addCustomLineItem(){
    var record = {};
    var errorString = ""
    
    $("#NewCat1").val() !== "" ? record.davinci_category1_newap = $("#NewCat1").val() : errorString += "Category 1;"; // Text
    $("#NewCat2").val() !== "" ? record.davinci_category2_newap = $("#NewCat2").val() : errorString += "Category 2;"; // Text
    $("#NewCat3").val() !== "" ? record.davinci_category3_newap = $("#NewCat3").val() : errorString += "Category 3;"; // Text
    record["defaultuomid@odata.bind"] = "/uoms(af7be14e-551b-e911-a97a-000d3a11fc57)"; // Lookup
    record.defaultuomid = {};
    record.defaultuomid.name = "Roll";
    record.defaultuomid.uomid = "af7be14e-551b-e911-a97a-000d3a11fc57";
    $("#NewLaborMin").val() !== "" && Number($("#NewLaborMin").val()) >= 0 ? record.davinci_laborminperunit = $("#NewLaborMin").val() : errorString += "Labour Min/Unit;"; // Decimal
    $("#NewName").val() !== "" ? record.name = $("#NewName").val() : errorString += "Product Name;"; // Text
    $("#NewMake").val() !== "" ? record.davinci_make_newap = $("#NewMake").val() : errorString += "Make;"; // Text
    $("#MinSelling").val() !== "" && Number($("#MinSelling").val()) > 0 ? record.davinci_minimumsellingquantity = $("#MinSelling").val() : errorString += "Minimum Selling Quantity;"; // Decimal
    $("#NewCostUnit").val() !== "" && Number($("#NewCostUnit").val()) >= 0 ? record.davinci_purchaseunitcost = $("#NewCostUnit").val() : errorString += "Cost/Unit;"; // Decimal
    if(errorString !== ""){
        errorAlert(errorString);
        return;
    }
    else{
        Swal.fire({
            title: 'Are you sure?',
            text: "Please ensure all values are correct as this action can not be reversed.",
            icon: 'question', // Use 'question' for a question mark icon
            showCancelButton: true,
            confirmButtonText: 'Yes, proceed',
            cancelButtonText: 'No, cancel'
        }).then((result) => {
            if(result.isConfirmed) { 
                customLineItems.push(record);
                lineItems.push(record);
                $('.PageDiv').toggleClass("LoadPage");
                $('.LineItemForm').toggleClass("show");
                tableReCalc();
            }
        });
    }
}

//Function to be called to dynamically update total values displayed at bottom of the screen
function calcTotalValues(){
    var laborHours = 0;
    var matCost = 0;
    var laborCost = 0;
    //sums labour hours, material cost, and labor cost from each line item in quote
    for(i=0; i < $('#QuoteTable tbody tr').length; i++){
        var curr_row = $('#QuoteTable tbody tr').eq(i);
        laborHours = parseFloat(laborHours) + parseFloat(curr_row.find('td').eq(6).text());
        matCost = parseFloat(matCost) + parseFloat(curr_row.find('td').eq(4).text());
        laborCost = laborCost + parseFloat(curr_row.find('td').eq(7).text());
    }
    
    // Business logic calculations 
    var totalCost = parseFloat(matCost) + parseFloat(laborCost);
    var totalSell = parseFloat(totalCost) * (1 + ((parseFloat($('#Contingency\\%').val()) + parseFloat($('#Overhead\\%').val()))/100.0)) * (1 + (parseFloat($('#Profit\\%').val())/100.0));
    var markup = ((1 + ((parseFloat($('#Contingency\\%').val()) + parseFloat($('#Overhead\\%').val()))/100.0)) * (1 + (parseFloat($('#Profit\\%').val())/100.0)) - 1) * 100;
    var margin = (parseFloat(markup) / (100 + parseFloat(markup)))*100;
    var contingencyCost = parseFloat(totalCost) * (parseFloat($('#Contingency\\%').val())/100);
    var overheadCost = parseFloat(totalCost) * (parseFloat($('#Overhead\\%').val())/100);
    var profitCost = parseFloat(totalSell) - (parseFloat(totalCost) + parseFloat(contingencyCost) + parseFloat(overheadCost));
    
    //Sets corresponding field with the new updated values
    $('#LabHours').html("Labour Hours: " + laborHours.toFixed(3));
    $('#TotMat').html("Total Material: $" + matCost.toFixed(2));
    $('#TotLabor').html("Total Labour: $" + laborCost.toFixed(2));
    $('#TotCost').html("Total Cost: $" + totalCost.toFixed(2));
    $('#FinalPrice').html("Total Estimate Price: $" + totalSell.toFixed(2));
    $('#Margin').html("Gross-Margin %: " + margin.toFixed(3));
    $('#Markup').html("Mark-up %: " + markup.toFixed(3));
    $('#Over\\$').html("Overhead: $" + overheadCost.toFixed(2));
    $('#Cont\\$').html("Contingency: $" + contingencyCost.toFixed(2));    
    $('#Pro\\$').html("Profit: $" + profitCost.toFixed(2));
}

//Calls business logic for every row in the table
function reCalcBusiness(){
    for(i=0; i < $('#QuoteTable tbody tr').length; i++){
        businessLogic(i);
    }
    calcTotalValues();
}

//Based on given table row
//Calculate material cost, labor cost, total cost and sell cost
//Uses data from textfields and lineitem array in calculations
function businessLogic(row){
    const rowIndex = row; // Gets the row index (starts from 1)
    var curr_row = $('#QuoteTable tbody tr').eq(row);//quoteTable.rows[row];
    var min_unit = lineItems[row].davinci_minimumsellingquantity;
    console.log(min_unit);
    var value = curr_row.find('td:eq(1) input[type="number"]').val();
    
    //Ensures quantity field is a multiple of the minimum selling quantity
    var factor = parseInt(value) / parseInt(min_unit);
    value = parseInt(value) > parseInt(min_unit)*parseInt(factor) ? parseInt(min_unit)*(parseInt(factor) + 1) : value;
    curr_row.find('td:eq(1) input[type="number"]').val(value);
    lineItems[row].quantity = value;
    
    //Calculate material cost and update that row/column
    var mat_cost = curr_row.find('td:eq(3) input[type="number"]').val();
    mat_cost = parseFloat(value) * parseFloat(mat_cost);
    curr_row.find('td:eq(4)').html(mat_cost.toFixed(2));
    
    //Calculate labor hours and update that row/column
    var min_per_unit = curr_row.find('td:eq(5) input[type="number"]').val();
    labor_hours = parseFloat(value) * parseFloat(min_per_unit) / 60.0;
    curr_row.find('td:eq(6)').html(labor_hours.toFixed(3));
    
    //Calculate labor cost and update that row/column
    var labor_cost = parseFloat(labor_hours) * parseFloat($('#Wage').val());
    curr_row.find('td:eq(7)').html(labor_cost.toFixed(2));
    
    //Calculate total cost and update to that row/column
    var total_cost = parseFloat(labor_cost) + parseFloat(mat_cost);
    curr_row.find('td:eq(8)').html(total_cost.toFixed(2));
    
    //Calculate sell cost and update to that row/column
    var sell_cost = parseFloat(total_cost) * (1 + ((parseFloat($('#Contingency\\%').val()) + parseFloat($('#Overhead\\%').val()))/100.0)) * (1 + (parseFloat($('#Profit\\%').val())/100.0));
    curr_row.find('td:eq(9)').html(sell_cost.toFixed(2));
}

// Populates table with line item values
// Sets any components action listeners per row
function tableReCalc(){
    //if any rows in the table delete them
    $('#QuoteTable tbody').empty();

for (let i = 0; i < lineItems.length; i++) {
    // Adds Rows to the top of the table    
    var row = $('<tr>').appendTo($('#QuoteTable'));
    //row.on('click', (event) => {row.backgroundColor = '#e9eb9d'});

    // Appending Cells
    $('<td>').html(lineItems[i].name).appendTo(row);

    // Append quantity input field to the second cell    
    var val = lineItems[i].quantity ? lineItems[i].quantity : 0;
    
    $('<td>').append(
        $('<input>', {
            type: 'number',
            placeholder: 0,
            value: val
        })
        .on("keypress blur keydown", (event) => { //When user exits the textfield or presses enter
            lineItemReCalc(event); 
        })
        .on('focus', (event) => { //highlight currently selected row for easier tracking of what user is doing
            const row = $(event.target).closest('tr');
            row.find('td').css('background', '#f0ecb9');
        })
    ).appendTo(row);
    
    $('<td>').html(lineItems[i].defaultuomid.name).appendTo(row);

    // Append material input field to the fourth cell
    $('<td>').html('$').append(
        $('<input>', {
            type: 'number',
            value: lineItems[i].davinci_purchaseunitcost
        }).on("keypress blur keydown", (event) => { lineItemReCalc(event); })
        .on('focus', (event) => {
            const row = $(event.target).closest('tr');
            row.find('td').css('background', '#f0ecb9');
        })
    ).appendTo(row);
    
    $('<td>').html(0).appendTo(row);

    // Append min/unit input field to the sixth cell
    $('<td>').append(
        $('<input>', {
            type: 'number',
            value: lineItems[i].davinci_laborminperunit
        }).on("keypress blur keydown", (event) => { lineItemReCalc(event); })
        .on('focus', (event) => {
            const row = $(event.target).closest('tr');
            row.find('td').css('background', '#f0ecb9');
        })
    ).appendTo(row);

    // Append other cells with default values
    $('<td>').html(0).appendTo(row);
    $('<td>').html(0).appendTo(row);
    $('<td>').html(0).appendTo(row);
    $('<td>').html(0).appendTo(row);

    // Create and append a delete button to the last cell
    $('<td>').append(
        $('<button>', {
            text: '- Quote',
            class: 'btn btn-deleting-line'
        }).on('click', function(event) {
            var rowIndex = $(event.target).closest('tr').index(); // Get the row index

            // Remove the item from lineItems and delete the row
            customLineItems = customLineItems.filter(item => item.name !== lineItems[i].name);
            lineItems.splice(rowIndex, 1);
            $(this).closest('tr').remove();

            calcTotalValues();
        })
    ).appendTo(row);
    businessLogic(i);
}
calcTotalValues();
}

function reCalcEvent(event){
    if(event.type === 'keypress' && !(event.key === 'Enter')){ return; }
    
    if(event.target.value < 0 || !event.target.value){
        event.target.value = 0;
    }
    //Saves these values in session Storage so they save state switching between html files
    saveMetrics();
    
    reCalcBusiness();
}

//Shifts row up or down in quote table so users
function moveRow(rowInd, colInd, diff){
    rowInd += diff;
    var temp = JSON.parse(JSON.stringify(lineItems[rowInd - diff]));
    lineItems[rowInd - diff] = JSON.parse(JSON.stringify(lineItems[rowInd]));
    lineItems[rowInd] = JSON.parse(JSON.stringify(temp));
    tableReCalc();
    $('#QuoteTable tbody tr').eq(rowInd).find(`td:eq(${colInd}) input[type="number"]`).select();
}

function lineItemReCalc(event){
    var rowInd = event.target.closest('tr').rowIndex - 1;
    var columnInd = $(event.target).closest('td, th').index();
    //Allows user to move current row up or down in the table for more customizability
    if(event.type === 'keydown'){
        if((event.key === 'ArrowDown') && (rowInd != lineItems.length - 1)){
            moveRow(rowInd, columnInd, 1);
        }
        else if((event.key === 'ArrowUp') && (rowInd != 0)){
            moveRow(rowInd, columnInd, -1);
        }
        else if(event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            event.preventDefault();  // Prevent the default action (changing the number)
        }
        else{ return; }
    }
    
    //If user presses enter move selected field down one row for seamless movement
    else if(event.type === 'keypress' && (event.key === 'Enter') && rowInd != lineItems.length){
        //console.log(columnInd);
        //$('#QuoteTable tbody tr').eq(rowInd).find(`td:eq(${columnInd}) input[type="number"]`).blur();
        $('#QuoteTable tbody tr').eq(rowInd + 1).find(`td:eq(${columnInd}) input[type="number"]`).select();
    }
    
    //when deselecting the table change highlight back to normal to indicate row is not being modified anymore
    else if(event.type === 'blur') {
        const row = $(event.target).closest('tr');
        row.find('td').css('background', rowInd % 2 == 1 ? '#f8f6ff' : '#f0f0f0');
    }
    
    else { return; };

    if(event.target.value < 0 || !event.target.value){
        event.target.value = 0;
    }
    
    var row = $('#QuoteTable tbody tr').eq(rowInd);
    
    //Save these values so they save between html switches
    lineItems[rowInd].quantity = row.find('td').eq(1).find('input[type="number"]').val();
    lineItems[rowInd].davinci_laborminperunit = row.find('td').eq(5).find('input[type="number"]').val();
    lineItems[rowInd].davinci_purchaseunitcost = row.find('td').eq(3).find('input[type="number"]').val();
    
    
    businessLogic(rowInd);
    calcTotalValues();
}

function saveTemplate(){
    saveNewQuote(true);
}

function saveQuote(){
    //if this is a new quote
    if(QuoteId === ""){
        saveNewQuote(false);
    }
    //if quote already exists then create new version
    else{
        updateQuoteAPI(false);
    }
}

//Enables loading circle and disables rest of page
//This asserts that users cannot interupt a certain process
function loadingCircle(){
    $('.PageDiv').toggleClass("LoadPage");
    $('.loader').toggleClass("show");
    $('html').toggleClass("LoadingCursor");
    
    const isLoading = $('html').hasClass("LoadingCursor");
    $('input').prop( "disabled", isLoading );
    $('button').prop( "disabled", isLoading );
}

//Scrolls back to top of page	
function scrollToTop(){
    $('html, body').animate({ scrollTop: 0 }, 1000); // 'slow' or duration in milliseconds
}

//This function formats line item information to json to be used in deep insert
function saveLineItemQuote(product, index){
    //Initializing Quote line item details to be sent to dataverse
    var row = $('#QuoteTable tbody tr').eq(index);    
    var record = {};
    record.msdyn_estimatedcost = Number(parseFloat(row.find('td:eq(8)').text()).toFixed(4)); // Currency
    record.priceperunit = Number(parseFloat(product.davinci_purchaseunitcost).toFixed(4)); // Currency
    record["productid@odata.bind"] = `/products(${product.productid})`; // Lookup
    record.productname = product.name; // Text
    record.msdyn_costtotal = Number(parseFloat(row.find('td:eq(9)').text()).toFixed(4)); // Currency
    record.quantity = Number(product.quantity); // Decimal
    record["uomid@odata.bind"] = `/uoms(${product.defaultuomid.uomid})`; // Lookup
    record.msdyn_budgetamount = Number(parseFloat(row.find('td:eq(9)').text()).toFixed(4)); // Currency
    record.new_labourminperunit = Number(parseFloat(product.davinci_laborminperunit).toFixed(4)); // Decimal
    return record;
}

function updateRequest(product, index){
    var row = $('#QuoteTable tbody tr').eq(index); 
    const record = {};
    record.data = {};
    record.entityName = product.guid;
    record.data.priceperunit = Number(parseFloat(product.davinci_purchaseunitcost).toFixed(4)); // Currency
    record.data.msdyn_estimatedcost = Number(parseFloat(row.find('td:eq(8)').text()).toFixed(4)); // Currency
    record.data.msdyn_costtotal = Number(parseFloat(row.find('td:eq(9)').text()).toFixed(4)); // Currency
    record.data.quantity = Number(product.quantity); // Decimal
    record.data.msdyn_budgetamount = Number(parseFloat(row.find('td:eq(9)').text()).toFixed(4)); // Currency
    record.data.new_labourminperunit = Number(parseFloat(product.davinci_laborminperunit).toFixed(4)); // Decimal
    
    var request = {
            etn: "quotedetail",
            id: record.entityName,
            payload: record.data,
            getMetadata: function () { return { boundParameter: null, parameterTypes: {}, operationType: 2, operationName: "Update" }; }
        };
    
    return request;
}

function createRequest(product, index){
    var row = $('#QuoteTable tbody tr').eq(index); 
    const record = {};
    
    // Lookup field for the related quote
    record["quoteid@odata.bind"] = `/quotes(${QuoteId})`;

    // Fields to populate in the new record
    record.priceperunit = Number(parseFloat(product.davinci_purchaseunitcost).toFixed(4)); // Currency
    record.msdyn_estimatedcost = Number(parseFloat(row.find('td:eq(8)').text()).toFixed(4)); // Currency
    record["productid@odata.bind"] = `/products(${product.productid})`; // Lookup
    record.productname = product.name; // Text
    record.msdyn_costtotal = Number(parseFloat(row.find('td:eq(9)').text()).toFixed(4)); // Currency
    record.quantity = Number(product.quantity); // Decimal
    record["uomid@odata.bind"] = `/uoms(${product.defaultuomid.uomid})`; // Lookup
    record.msdyn_budgetamount = Number(parseFloat(row.find('td:eq(9)').text()).toFixed(4)); // Currency
    record.new_labourminperunit = Number(parseFloat(product.davinci_laborminperunit).toFixed(4)); // Decimal
    
    var request = {
            etn: "quotedetail",
            payload: record,
            getMetadata: function () { return { boundParameter: null, parameterTypes: {}, operationType: 2, operationName: "Create" }; }
        };
    
    return request;
}

function quoteUpdate(isTemplate){
    var totPrice = $('#FinalPrice').text();
    var totalCost = $('#TotCost').text();
    var totMat = $('#TotMat').text();
    var totLabor = $("#TotLabor").text().substring(15);
        
    var record = {};
    record.data = {};
    record.entityName = `/quote(${QuoteId})`;
    record.data.name = $('#QuoteName').html(); // Text
    record.data.new_istemplate = isTemplate; // Boolean
    record.data.msdyn_invoicesetuptotals = Number(parseFloat(totLabor));//Number((parseFloat(totPrice.substring(23)) - parseFloat(totMat.substring(17))).toFixed(4)); // Currency
    record.data.msdyn_estimatedcost = Number(parseFloat(totalCost.substring(13)).toFixed(4)); // Currency
    record.data.new_laborrate = Number($('#Wage').val()); // Decimal
    record.data.new_profitmargin = Number($('#Profit\\%').val()); // Decimal
    record.data.new_contingencymargin = Number($('#Contingency\\%').val()); // Decimal
    record.data.new_overheadmargin = Number($('#Overhead\\%').val()); // Decimal
    
    var request = {
            etn: "quote",
            id: QuoteId,
            payload: record.data,
            getMetadata: function () { return { boundParameter: null, parameterTypes: {}, operationType: 2, operationName: "Update" }; }
        };
    return request;
}

//
//
// Start API Call Functions
//
//

function updateQuoteAPI(isTemplate){
    //disables page
    loadingCircle();
    
    saveCustomLineAPI().then(function(){
    
    var requests = [];
    var quoteRecords = [];
    var lineUpdateRecords = [];
    var lineCreateRecords = [];
    var lineDeleteRecords = [];

    requests.push(quoteUpdate(isTemplate));
    
    
    //three cases - item is brand new - item is being updated - item is being removed
    var i = 0;
    lineItems.forEach((product) => {
        if(customLineItems.some(item => item.name.toLowerCase() === product.name.toLowerCase())) {;}
        
        else if(existingLineItems.some(item => item["productid"] === product["productid"])){
             requests.push(updateRequest(product, i));
        }
        else{
             //lineCreateRecords.push(createRequest(product, i));
             requests.push(createRequest(product, i));
        }
        i++;
    });
    console.log(requests);
    existingLineItems.forEach( (product) => {
        if(!lineItems.some(item => item["productid"] === product["productid"])){
            var request = {
                entityReference: { entityType: "quotedetail", id: product.guid },
                getMetadata: function () { return { boundParameter: null, parameterTypes: {}, operationType: 2, operationName: "Delete" }; }
            };
            requests.push(request);
        }
    });
    
    // Batched Call for all Updates Deletes and Creates related to saving quote so that 
    // Less API calls used
    var allReq = [];
    allReq.push(requests);
    parent.Xrm.WebApi.online.executeMultiple(allReq).then(
        function (response) {
            loadingCircle();
            Swal.fire({
                    title: 'Success',
                    text: `${isTemplate ? "Template" : "Quote"} Saved`,
                    icon: 'success',
                    confirmButtonText: 'Okay'
                });
        },
        function (error) {
            loadingCircle();
            Swal.fire({
                    title: 'Error',
                    text: `An Error Occured. ${isTemplate ? "Template" : "Quote"} Could Not be Saved.`,
                    icon: 'error',
                    showCancelButton: true,
                    confirmButtonText: 'Show Details',
                    cancelButtonText: 'Dismiss',
                }).then((result) => {
                    if (result.isConfirmed) {
                    // Show detailed error information for debugging
                        Swal.fire({
                            title: 'Error Details',
                            html: `
                                <p><strong>Error Code:</strong> ${error.code || 'N/A'}</p>
                                <p><strong>Message:</strong> ${error.message}</p>
                                <p><strong>Stack Trace:</strong></p>
                                <pre>${error.stack || 'No Stack Trace Available'}</pre>`
                            ,
                            icon: 'info',
                            confirmButtonText: 'Close'
                        });
                    }
                });
        }
    );
    
    }).catch(function(error){
        loadingCircle();
        console.log(error);
    });
}

// Retrieves the quote passed from the mda along with all line items associated with it
// Appends these lines items to the array of line items
function getQuoteAPI(){
    var fetchXml = `<fetch>
                        <!-- Table -->
                        <entity name="quote">
                            <!-- Columns -->
                            <attribute name="quoteid" />
                            <attribute name="name" />
                            <attribute name="new_overheadmargin" />
                            <attribute name="new_contingencymargin" />
                            <attribute name="new_profitmargin" />
                            <attribute name="new_laborrate" />
                            <!-- Filter By -->
                            <filter type="and">
                                <condition attribute="revisionnumber" operator="eq" value="${QuoteInfo.revisionNumber}" />
                                <condition attribute="quotenumber" operator="eq" value="${QuoteInfo.quoteNumber}" />
                            </filter>
                            <!-- One To Many Relationships -->
                            <link-entity name="quotedetail" from="quoteid" to="quoteid" alias="quote_details" link-type="outer">
                                <attribute name="productid" />
                                <attribute name="productidname" />
                                <attribute name="new_labourminperunit" />
                                <attribute name="priceperunit" />
                                <attribute name="productname" />
                                <attribute name="quantity" />
                                <attribute name="uomid" />
                                <attribute name="uomidname" />
                                <attribute name="quotedetailid" />
                                <link-entity name="product" from="productid" to="productid" alias="productid" link-type="outer">
                                    <attribute name="davinci_minimumsellingquantity" />
                                </link-entity>
                            </link-entity>
                        </entity>
                    </fetch>`;
                    
    // using async stuff so that table is not populated before the retrieve is finished
    return new Promise((resolve, reject) => {
        parent.Xrm.WebApi.retrieveMultipleRecords("quote", `?fetchXml=${encodeURIComponent(fetchXml)}`).then(
            function success(results) {
                console.log(results);
                for (var i = 0; i < results.entities.length; i++) {
                    var result = results.entities[i];
                    // Columns
                    QuoteId = result["quoteid"]; // Guid
                    if($('#QuoteName').html() === 'New Quote'){
                        $('#QuoteName').html(result.name);
                        $('#Wage').val(Number(result["new_laborrate"]));
                        $('#Profit\\%').val(Number(result["new_profitmargin"])); // Decimal
                        $('#Contingency\\%').val(Number(result["new_contingencymargin"])); // Decimal
                        $('#Overhead\\%').val(Number(result["new_overheadmargin"])); // Decimal                      
                        hasLoaded = false;
                    }
                    if(!result["quote_details.productname"]){ continue; }
                    // Formatting line items to be consistent with json objects made previously
                    if(['Roof Estimate', 'Wall Estimate', 'Change Order'].includes(result["quote_details.productname"])) {
                        continue;
                    }
                    const newItem = {};
                    const unit = {
                        uomid: result["quote_details._uomid_value"], //GUID
                        name: result["quote_details.uomid@OData.Community.Display.V1.FormattedValue"]
                    };

                    newItem.guid = result["quote_details.quotedetailid"];
                    newItem.name = result["quote_details.productname"]; //text
                    newItem.quantity = result["quote_details.quantity"]; // Decimal
                    newItem.defaultuomid = unit; // Lookup
                    newItem.davinci_purchaseunitcost = result["quote_details.priceperunit"]; // Currency
                    newItem.davinci_laborminperunit = result["quote_details.new_labourminperunit"]; //Decimal
                    newItem.productid = result["quote_details.productid"]; // Lookup
                    newItem.davinci_minimumsellingquantity = result["productid.davinci_minimumsellingquantity"];
                    if(!hasLoaded){ existingLineItems.push(newItem); }
                    lineItems.push(newItem);
                }
                saveMetrics();
                resolve(lineItems); // Resolve the promise with the lineItems
            },
            function(error) {
                console.log(error.message);
                reject(error); // Reject the promise with the error
            }
        );
    });
}

function saveCustomLineAPI(){
return new Promise((resolve, reject) => {
    if(customLineItems.length === 0){ 
        resolve("Empty");
        return;
    }
    var createRequests = [];
    var names = "";
    var isFirst = true;
    customLineItems.forEach((product) => {
        isFirst ? names += `name eq '${product.name}'` : names += ` or name eq '${product.name}'`;
        isFirst = false;
        
        var record = {};
        record.davinci_category1_newap = product.davinci_category1_newap; // Text
        record.davinci_category2_newap = product.davinci_category2_newap; // Text
        record.davinci_category3_newap = product.davinci_category3_newap; // Text
        record["defaultuomid@odata.bind"] = "/uoms(af7be14e-551b-e911-a97a-000d3a11fc57)"; // Lookup
        record["defaultuomscheduleid@odata.bind"] = "/uomschedules(11684951-551b-e911-a986-000d3a11f5ee)"; // Lookup
        record.davinci_laborminperunit = Number(parseFloat(product.davinci_laborminperunit)); // Decimal
        record.name = product.name; // Text
        record.davinci_make_newap = product.davinci_make_newap; // Text
        record.davinci_minimumsellingquantity = Number(parseFloat(product.davinci_minimumsellingquantity)); // Decimal
        record.davinci_purchaseunitcost = Number(parseFloat(product.davinci_purchaseunitcost)); // Decimal
        record.new_sku = product.name; // Text
        record.statecode = 0; // State
        //record.davinci_ourproductcode = product.name; // Text

        var createRequest = {
            etn: "product",
            payload: record,
            getMetadata: function () { return { boundParameter: null, parameterTypes: {}, operationType: 2, operationName: "Create" }; }
        };
        createRequests.push(createRequest);
    });
    
    var allReq = [];
    allReq.push(createRequests);
    parent.Xrm.WebApi.online.executeMultiple(allReq).then(
        function (response) {
            console.log(response);
            
            parent.Xrm.WebApi.retrieveMultipleRecords("product", `?$select=productid,name&$filter=(${names})`).then(
            function success(results) {
                console.log(results);
                for (var i = 0; i < results.entities.length; i++) {
                    var result = results.entities[i];
                    // Columns
                    const match = lineItems.find(item => item.name === result["name"]);
                    if (match) {
                        match.productid = result["productid"]; // Set the value from array1 to array2
                    }
                }
                console.log(lineItems);
                customLineItems.length = 0;
                resolve(customLineItems);
            },
            function(error) {
                console.log(error.message + "mememememememe");
                reject(error);
            });
            
                },
        function (error) {
            console.log(error + "aaaaaaaaaaaaaa");
            reject(error);
        }
    );
});    
}

// This function saves a quote to the Quote table, then upon success will 
// call saveLineItemQuote() for every line item corresponding to the quote
function saveNewQuote(isTemplate){
        //disables page
        loadingCircle();
        //retrieve some of the important metrics for a quote
        var totPrice = $('#FinalPrice').text();
        var totalCost = $('#TotCost').text();
        var totMat = $('#TotMat').text();
        var record = {};
        //formatting data so that it can be passed to xrm web api
        record.new_istemplate = isTemplate; // Boolean
        record["customerid_account@odata.bind"] = "/accounts(542c89b8-6eeb-ec11-bb3e-000d3a1406c3)"; // Customer //put a 5 at front
        record.name = $('#QuoteName').html(); // Text 
        record.statuscode = 1; // Status
        record.msdyn_estimatedcost = Number(parseFloat(totalCost.substring(13)).toFixed(4)); // Currency
        record.msdyn_invoicesetuptotals = Number((parseFloat(totPrice.substring(23)) - parseFloat(totMat.substring(17))).toFixed(4)); // Currency 
        record["opportunityid@odata.bind"] = `/opportunities(${OpportunityId})`;
        record["pricelevelid@odata.bind"] = "/pricelevels(77beff8d-acfa-e611-811e-c4346bad9624)"; // Lookup -- General Sales PriceList
        record["quote_details"] = [];
        
        //Adds all lineitems to the the quote format
        var i = 0;
        lineItems.forEach(product => {
            record["quote_details"][i] = saveLineItemQuote(product, i);
            i++;
        });
        
        
        parent.Xrm.WebApi.createRecord("quote", record).then(
            function success(result) {
                QuoteId = result.id;
                console.log(QuoteId);
                loadingCircle();
                //Display a success notification to the user
                Swal.fire({
                    title: 'Success',
                    text: `${isTemplate ? "Template" : "Quote"} Saved`,
                    icon: 'success',
                    confirmButtonText: 'Okay'
                });
            },
            function(error) {
                loadingCircle();
                //Display error notification so user knows quote/template was not saved
                Swal.fire({
                    title: 'Error',
                    text: `An Error Occured. ${isTemplate ? "Template" : "Quote"} Could Not be Saved.`,
                    icon: 'error',
                    showCancelButton: true,
                    confirmButtonText: 'Show Details',
                    cancelButtonText: 'Dismiss',
                }).then((result) => {
                    if (result.isConfirmed) {
                    // Show detailed error information for debugging
                        Swal.fire({
                            title: 'Error Details',
                            html: `
                                <p><strong>Error Code:</strong> ${error.code || 'N/A'}</p>
                                <p><strong>Message:</strong> ${error.message}</p>
                                <p><strong>Stack Trace:</strong></p>
                                <pre>${error.stack || 'No Stack Trace Available'}</pre>`
                            ,
                            icon: 'info',
                            confirmButtonText: 'Close'
                        });
                    }
                });
            }
        );   
}

//function used during testing
//Currently unused in implementation
function deleteQuote(){
    parent.Xrm.WebApi.deleteRecord("quote", QuoteId).then(
        function success(result) {
            QuoteId = "";
            console.log(result);
        },
        function(error) {
            console.log(error.message);
        }
    );
}
