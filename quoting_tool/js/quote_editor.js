//
// START CODE EXECUTED ON LOAD
//
//

//Delete these global variables after migration to multiple files is complete
/*
$(document).ready(function() {
    parent.document.title = "Epic Roofing Quoting Tool";
});

//variable holding all line item json objects
var lineItems = [];
var existingLineItems = [];
var customLineItems = [];
var units = [];
var hasLoaded = true;
//parameter to check when leaving a page to see if its redirecting or exiting the quote manager
var redirect = false;
//Test Values will be dynamic in future
var QuoteId = "";
var LaborId = "";
var OpportunityId = "1bbcf3ef-e330-40ce-af4c-ed541dbe4c0f" //Testing Value will be integrated later
var QuoteInfo = {};*/

$(document).on('click', function(event){
    var elem = parent.document.documentElement;
if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) { /* Safari */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { /* IE11 */
    elem.msRequestFullscreen();
  }
  
});

$(window).on("load", function() {

{
    const serialized = sessionStorage.getItem("ID");
    QuoteInfo = JSON.parse(serialized);
    console.log(QuoteInfo);
}

//Resize table using current height values on load
var headerHeight = $('.sticky-top').height();
var footerHeight = $('#QuoteValuesFlex').height()
$('.Scrollable').height(window.innerHeight - (headerHeight + footerHeight + 50));

//Resize table using current height values on window resize
$(window).resize(function(){
    headerHeight = $('.sticky-top').height();
    footerHeight = $('#QuoteValuesFlex').height()
    $('.Scrollable').height(window.innerHeight - (headerHeight + footerHeight + 50));
});

$('#SearchBar').on("blur",searchBarHandler);
$('#SearchBar').on("keypress",(event) => {event.key === 'Enter' ? searchBarHandler() : null;});

$('#ExitButton').click(exitConfirmation);

$('input').click(function(){
    $(this).select();
});

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

$('#SaveQuote').on('click', saveQuote);
$('#SaveTemplate').on('click', saveTemplate);

$('#TopButton').on("click", scrollToTop);

/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
$('#SaveButton').on("click", function(e){
    $("#DropdownButtons").toggleClass("show");
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
    $("#NewCat1, #NewCat2, #NewCat3, #NewUnit, #NewLaborMin, #NewName, #NewMake, #MinSelling, #NewCostUnit").css('border-color', '#dee2e6');
    $('.PageDiv').toggleClass("LoadPage");
    $('.LineItemForm').toggleClass("show");
});

$('#NewItemSave').click(addCustomLineItem);
$('#NewItemCancel').click(leaveCustomForm);

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
  if(!event.target.matches('#SaveButton')) {
    var dropdowns = $("#DropdownButtons");
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
        LaborId = metrics.Labor;
    }

}

//Button for redirecting to the product catalogue page
//Before redirect clear sessionStorage and update with most recent line item info
{
    $('#ProductButton').on("click", function(e){
        saveSession("existing", existingLineItems);
        saveSession("Items", lineItems);
        saveSession("Custom", customLineItems);
        saveSession("Units", units);
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
        saveSession("Units", units);
        saveMetrics();
        redirect = true;
        window.location.href = "template_page.html";
    });
}

{
    $('#TakeoffButton').on("click", function (e) {
        var serialized_items = "";
        console.log(lineItems[3]);
        console.log(lineItems[2]);
        if (!(lineItems.length === 0)) {
            serialized_items = JSON.stringify(lineItems);
        }
        sessionStorage.setItem('Items', serialized_items); //= "Items=" + serialized_items + ";path=/";
        redirect = true;

        window.location.href = "takeoff_page.htm";
    });
}

//When the window is closed delete the "Items" cookie
window.addEventListener('beforeunload', (event) => {
    if(performance.navigation.type === 1){ return; }
    if (!redirect){
        //sessionStorage.clear();
        //event.returnValue = `Are you sure you want to leave?`;
    }
});

//Gets the session items 
//fills line items with it's value if not empty
lineItems = retrieveSession("Items");
existingLineItems = retrieveSession("existing");
customLineItems = retrieveSession("Customs");
units = retrieveSession("Units");
if(units.length === 0){
    getUnitsAPI().then(function(){
        populateUnitDropdown();
    }).catch(function(error){
        console.log(error);
    });
}
else{
    populateUnitDropdown();
}

if(QuoteId === ''){
    getQuoteAPI().then( function(){
        tableReCalc();
        saveSession("existing", existingLineItems);
        saveSession("Items", lineItems);
        saveSession("Custom", customLineItems);
        saveSession("Units", units);
        saveMetrics();
    }).catch(function(error){
        console.log("Error in getQuoteAPI:", error);
    });
}
else{
    tableReCalc();
    saveSession("existing", existingLineItems);
    saveSession("Items", lineItems);
    saveSession("Custom", customLineItems);
    saveSession("Units", units);
    saveMetrics();
}
});
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
    }
}

function saveMetrics(){
    var metricsJSON = {
        Wage: $('#Wage').val(),
        Cont: $('#Contingency\\%').val(),
        Over: $('#Overhead\\%').val(),
        Prof: $('#Profit\\%').val(),
        Quote: QuoteId,
        Name: $('#QuoteName').html(),
        Labor: LaborId
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

function populateUnitDropdown(){
    $('#NewUnit').empty();
    const defaultopt = $('<option></option>').val("Unit").text("Unit");
    $('#NewUnit').append(defaultopt);
    units.sort().forEach(optionText => {
        const option = $('<option></option>').val(optionText.name).text(optionText.name);
        $('#NewUnit').append(option);
    });
}

function leaveCustomForm(){
    $("#NewCat1").val("");
    $("#NewCat2").val(""); // Text
    $("#NewCat3").val(""); // Text
    
    const selOption = $("#NewUnit").find(`option[value="Unit"]`);
    selOption.prop('selected', true);

    $("#NewLaborMin").val(0); // Decimal
    $("#NewName").val(""); // Text
    $("#NewMake").val(""); // Text
    $("#MinSelling").val(0); // Decimal
    $("#NewCostUnit").val(""); // Decimal
    
    $('.PageDiv').toggleClass("LoadPage");
    $('.LineItemForm').toggleClass("show");
}

function addCustomLineItem(){
    var record = {};
    var errorString = ""
    var unit = "";
    
    $("#NewCat1, #NewCat2, #NewCat3, #NewUnit, #NewLaborMin, #NewName, #NewMake, #MinSelling, #NewCostUnit").css('border-color', '#dee2e6');
    
    $("#NewCat1").val() !== "" ? record.davinci_category1_newap = $("#NewCat1").val() : (errorString += "Category 1;", $("#NewCat1").css('border-color', 'red')); // Text
    $("#NewCat2").val() !== "" ? record.davinci_category2_newap = $("#NewCat2").val() : (errorString += "Category 2;", $("#NewCat2").css('border-color', 'red')); // Text
    $("#NewCat3").val() !== "" ? record.davinci_category3_newap = $("#NewCat3").val() : (errorString += "Category 3;", $("#NewCat3").css('border-color', 'red')); // Text
    record["defaultuomid@odata.bind"] = "/uoms(af7be14e-551b-e911-a97a-000d3a11fc57)"; // Lookup
    
    $('#NewUnit').val() !== "Unit" ? unit = $('#NewUnit').val() : (errorString += "Unit;", $("#NewUnit").css('border-color', 'red'));
    record.defaultuomid = {};
    const match = units.find(item => item.name === unit);
    if (match) {
        record.defaultuomid.name = unit;
        record.defaultuomid.uomid = match["uomid"];
        record.defaultuomid.scheduleid = match["uomscheduleid"];
    }

    $("#NewLaborMin").val() !== "" && Number($("#NewLaborMin").val()) >= 0 ? record.davinci_laborminperunit = $("#NewLaborMin").val() : (errorString += "Labour Min/Unit;", $("#NewLaborMin").css('border-color', 'red')); // Decimal
    $("#NewName").val() !== "" ? record.name = $("#NewName").val() : (errorString += "Product Name;", $("#NewName").css('border-color', 'red')); // Text
    $("#NewMake").val() !== "" ? record.davinci_make_newap = $("#NewMake").val() : (errorString += "Make;", $("#NewMake").css('border-color', 'red')); // Text
    $("#MinSelling").val() !== "" && Number($("#MinSelling").val()) > 0 && Number.isInteger(Number($("#MinSelling").val())) ? record.davinci_minimumsellingquantity = $("#MinSelling").val() : (errorString += "Minimum Selling Quantity;", $("#MinSelling").css('border-color', 'red')); // Decimal
    $("#NewCostUnit").val() !== "" && Number($("#NewCostUnit").val()) >= 0 ? record.davinci_purchaseunitcost = $("#NewCostUnit").val() : (errorString += "Cost/Unit;", $("#NewCostUnit").css('border-color', 'red')); // Decimal
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
                leaveCustomForm();
                tableReCalc();
            }
        });
    }
}

function saveTemplate(){
    updateQuoteAPI(true);
}

function saveQuote(){
    sanityCheck();
    //if this is a new quote
    /*if(QuoteId === ""){
        saveNewQuote(false);
    }
    //if quote already exists then create new version
    else{
        updateQuoteAPI(false);
    }*/
}

// This function checks for unusual input in the quote to ensure
// user knows of any unusual things
// If User chooses to continue then api call is invoked.
function sanityCheck(){
    var unusualQuantityLines = [];
    var unusualPricesLines = [];
    lineItems.forEach(item => {
        if(Number(item.quantity) === 0){ unusualQuantityLines.push(item.name); }
        else if(Number(item.davinci_purchaseunitcost) === 0 && Number(item.davinci_laborminperunit) === 0){
            unusualPricesLines.push(item.name);
        }
    });
    
    var msg = "";
    if(unusualQuantityLines.length !== 0){
        msg = msg + `<p><strong>Quantity is 0 for one or more lines. Including:</strong>
                       ${unusualQuantityLines[0]}</p>`;
    }
    if(unusualPricesLines.length !== 0){
        msg = msg + `<p><strong>Material Costs and Labour Costs is 0 for one or more lines. Including:</strong>
                       ${unusualPricesLines[0]}</p>`;
    }
    
    if(msg.length !== 0){
        var userContinue = true;
        Swal.fire({
            title: 'Sanity Check',
            html: msg,
            icon: 'warning', // Use 'question' for a question mark icon
            showCancelButton: true,
            allowOutsideClick: false, // Prevents dismissing by clicking outside
            confirmButtonText: 'Cancel',
            cancelButtonText: 'Continue Anyway'
        }).then((result) => {
            if(!result.isConfirmed) { 
                updateQuoteAPI(false);
            }
        });
    }
    else{
        updateQuoteAPI(false)
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

function searchBarHandler(){
    var search = $("#SearchBar").val();
    console.log(search);
    //if search is empty unhighlight everything
    if(search === ""){
        highlightedLines.forEach((index) => {
            $("#QuoteTable tbody tr").eq(index).removeClass("table-danger");
        });
        highlightedLines.length = 0;
        return;
    }
    
    var i = 0;
    lineItems.forEach((item) => {
        if(item.name.toLowerCase().includes(search.toLowerCase())){
            $("#QuoteTable tbody tr").eq(i).addClass("table-danger");
            highlightedLines.push(i);
        }
        else if($("#QuoteTable tbody tr").eq(i).hasClass("table-danger")){
            $("#QuoteTable tbody tr").eq(i).removeClass("table-danger");
            highlightedLines.splice(highlightedLines.indexOf(i), 1);
        }
        i++;
    });
}

//
//
// Start API Call Functions --- Deprecated Will be deleted after new file is tested
//
//
/*
function updateQuoteAPI(isTemplate){
    //disables page
    loadingCircle();
    console.log(lineItems);
    
    saveCustomLineAPI().then(function(){
    
    var requests = [];
    var quoteRecords = [];
    var lineUpdateRecords = [];
    var lineCreateRecords = [];
    var lineDeleteRecords = [];

    requests.push(quoteUpdate(isTemplate, QuoteId));
    
    LaborId === "" ? requests.push(createLaborRequest(QuoteId)) : requests.push(updateLaborRequest(LaborId));
    
    //three cases - item is brand new - item is being updated - item is being removed
    var i = 0;
    lineItems.forEach((product) => {
        if(customLineItems.some(item => item.name.toLowerCase() === product.name.toLowerCase())) {;}
        
        //else if(product.name.toLowerCase() === "Labour Costs") { requests.push(updateLaborRequest()); }
        
        else if(existingLineItems.some(item => item["productid"] === product["productid"])){
             requests.push(updateRequest(product, i));
        }
        else{
             requests.push(createRequest(product, i, QuoteId));
        }
        i++;
    });
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
    console.log("made it here");
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
                }).then((result) => {
                    lineItems.forEach((product) => {existingLineItems.push(product)});
                    LaborId === "" ? LaborId = response[1].headers._headers["Location"].match(/\((.*?)\)/)[1] :  null;
                    console.log("LaborId: " + LaborId);
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
                                <attribute name="producttypecode" />
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
                    if(result["quote_details.productname"] === "Labour Costs"){ 
                        LaborId = result["quote_details.quotedetailid"];
                        continue;
                    }
                    // Formatting line items to be consistent with json objects made previously
                    if(['Roof Estimate', 'Wall Estimate', 'Change Order'].includes(result["quote_details.productname"])) {
                        continue;
                    }
                    const newItem = {};
                    const unit = {
                        uomid: result["quote_details.uomid"], //GUID
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
                    newItem.producttypecode = result["quote_details.producttypecode"];
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
    customLineItems.forEach((product) => {
        var record = {};
        record.davinci_category1_newap = product.davinci_category1_newap; // Text
        record.davinci_category2_newap = product.davinci_category2_newap; // Text
        record.davinci_category3_newap = product.davinci_category3_newap; // Text
        record["defaultuomid@odata.bind"] = `/uoms(${product.defaultuomid.uomid})`; // Lookup af7be14e-551b-e911-a97a-000d3a11fc57
        record["defaultuomscheduleid@odata.bind"] = `/uomschedules(${product.defaultuomid.scheduleid})`; // Lookup 11684951-551b-e911-a986-000d3a11f5ee
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
            var i = 0;
            createRequests.forEach((req) => {
                const match = lineItems.find(item => item.name === req.payload.name);
                if(match){
                    match.productid = response[i].headers._headers["Location"].match(/\((.*?)\)/)[1];
                }
                i++;
            });
            customLineItems.length = 0;
            resolve(customLineItems);
            
        },
        function (error) {
            console.log(error);
            reject(error);
        }
    );
});    
}

// This function saves a quote to the Quote table, then upon success will 
function saveNewQuote(isTemplate){
        //disables page
        loadingCircle();
        saveCustomLineAPI();
        //retrieve some of the important metrics for a quote
        var totPrice = $('#FinalPrice').text();
        var totalCost = $('#TotCost').text();
        var totMat = $('#TotMat').text();
        var record = {};
        //formatting data so that it can be passed to xrm web api
        record.new_istemplate = isTemplate; // Boolean
        record["customerid_account@odata.bind"] = "/accounts(542c89b8-6eeb-ec11-bb3e-000d3a1406c3)"; // Customer 
        record.name = $('#QuoteName').html(); // Text 
        record.statuscode = 1; // Status
        record.msdyn_estimatedcost = Number(parseFloat(totalCost.substring(13).replace(/,/g, "")).toFixed(4)); // Currency
        record.msdyn_invoicesetuptotals = Number((parseFloat(totPrice.substring(23).replace(/,/g, "")) - parseFloat(totMat.substring(17).replace(/,/g, "")).toFixed(4))); // Currency 
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

function getUnitsAPI(){
return new Promise((resolve, reject) => {
    parent.Xrm.WebApi.retrieveMultipleRecords("uom", "?$select=uomid,name,_uomscheduleid_value").then(
        function success(results) {
            for (var i = 0; i < results.entities.length; i++) {
                var result = results.entities[i];
                // Columns
                record = {};
                record.uomid = result["uomid"]; // Guid
                record.name = result["name"]; // Text
                record.uomscheduleid = result["_uomscheduleid_value"]; // Lookup
                units.push(record);
            }
            resolve();
        },
        function(error) {
            console.log(error.message);
            reject(error);
        }
);
});
}

//function used during testing
//Currently unused in implementation
function deleteQuoteAPI(){
    parent.Xrm.WebApi.deleteRecord("quote", QuoteId).then(
        function success(result) {
            QuoteId = "";
        },
        function(error) {
            console.log(error.message);
        }
    );
}

*/

//
//
// To be deleted once separate files are tested fully for new bugs
//
//

/*
//This function formats line item information to json to be used in deep insert
function saveLineItemQuote(product, index){
    //Initializing Quote line item details to be sent to dataverse
    var row = $('#QuoteTable tbody tr').eq(index);    
    var record = {};
    record.msdyn_estimatedcost = Number(parseFloat(row.find('td:eq(8)').text().substring(1).replace(/,/g, "")).toFixed(4)); // Currency
    record.priceperunit = Number(parseFloat(product.davinci_purchaseunitcost).toFixed(4)); // Currency
    record["productid@odata.bind"] = `/products(${product.productid})`; // Lookup
    record.productname = product.name; // Text
    record.msdyn_costtotal = Number(parseFloat(row.find('td:eq(9)').text().substring(1).replace(/,/g, "")).toFixed(4)); // Currency
    record.quantity = Number(product.quantity); // Decimal
    record["uomid@odata.bind"] = `/uoms(${product.defaultuomid.uomid})`; // Lookup
    record.msdyn_budgetamount = Number(parseFloat(row.find('td:eq(9)').text().substring(1).replace(/,/g, "")).toFixed(4)); // Currency
    record.new_labourminperunit = Number(parseFloat(product.davinci_laborminperunit).toFixed(4)); // Decimal
    console.log(record);
    return record;
}

function updateRequest(product, index){
    var row = $('#QuoteTable tbody tr').eq(index); 
    const record = {};
    record.data = {};
    record.entityName = product.guid;
    record.data.priceperunit = Number(parseFloat(product.davinci_purchaseunitcost).toFixed(4)); // Currency
    record.data.msdyn_costpriceperunit = record.data.priceperunit; // Currency
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
    record.msdyn_costpriceperunit = record.priceperunit; // Currency
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

function updateLaborRequest(){
    var totLabor = parseFloat($("#TotLabor").text().substring(15).replace(/,/g, ""));
    var margin = parseFloat($("#Margin").text().substring(16));
    var LaborPlus = Number(totLabor) * (1 + (Number(margin)/100));
    
    const record = {};

    // Fields to populate in the new record
    record.priceperunit = Number(totLabor.toFixed(2)); // Currency
    record.msdyn_estimatedcost = Number(totLabor.toFixed(4)); // Currency
    record.productname = "Labour Costs"; // Text
    record.msdyn_costtotal = Number(LaborPlus.toFixed(2)); // Currency
    record.quantity = 1; // Decimal
    record.producttypecode = 5; // Choice
    record.extendedamount = Number(totLabor.toFixed(4));
    record.msdyn_budgetamount = Number(totLabor.toFixed(2)); // Currency
    
    var request = {
            etn: "quotedetail",
            id: LaborId,
            payload: record,
            getMetadata: function () { return { boundParameter: null, parameterTypes: {}, operationType: 2, operationName: "Update" }; }
        };
    
    return request;
}

function createLaborRequest(){
    //var row = $('#QuoteTable tbody tr').eq(index); 
    var totLabor = parseFloat($("#TotLabor").text().substring(15).replace(/,/g, ""));
    var margin = parseFloat($("#Margin").text().substring(16));
    var LaborPlus = Number(totLabor) * (1 + (Number(margin)/100));
    const record = {};
    
    // Lookup field for the related quote
    record["quoteid@odata.bind"] = `/quotes(${QuoteId})`;

    // Fields to populate in the new record
    record.priceperunit = Number(totLabor.toFixed(2)); // Currency
    record.msdyn_estimatedcost = Number(totLabor.toFixed(4)); // Currency
    record.productname = "Labour Costs"; // Text
    record.msdyn_costtotal = Number(LaborPlus.toFixed(2)); // Currency
    record.quantity = 1; // Decimal
    record.producttypecode = 5; // Choice
    record.extendedamount = Number(totLabor.toFixed(4));
    record.msdyn_budgetamount = Number(totLabor.toFixed(2)); // Currency
    record.quotedetailname = "Labour Costs";
    
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
    record.data.msdyn_invoicesetuptotals = Number(parseFloat(totLabor.replace(/,/g, "")));//Number((parseFloat(totPrice.substring(23)) - parseFloat(totMat.substring(17))).toFixed(4)); // Currency
    record.data.msdyn_estimatedcost = Number(parseFloat(totalCost.substring(13)).toFixed(4).replace(/,/g, "")); // Currency
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
}*/

//
//
// To be deleted once migration is tested and verified
//
//

/*

//Function to be called to dynamically update total values displayed at bottom of the screen
function calcTotalValues(){
    var laborHours = 0;
    var matCost = 0;
    var laborCost = 0;
    //sums labour hours, material cost, and labor cost from each line item in quote
    for(i=0; i < $('#QuoteTable tbody tr').length; i++){
        var curr_row = $('#QuoteTable tbody tr').eq(i);
        laborHours = parseFloat(laborHours) + parseFloat(curr_row.find('td').eq(6).text());
        matCost = parseFloat(matCost) + parseFloat(curr_row.find('td').eq(4).text().substring(1).replace(/,/g, ""));
        laborCost = laborCost + parseFloat(curr_row.find('td').eq(7).text().substring(1).replace(/,/g, ""));
    }
    
    // Business logic calculations 
    var totalCost = parseFloat(matCost) + parseFloat(laborCost);
    var totalSell = parseFloat(totalCost) * (1 + ((parseFloat($('#Contingency\\%').val()) + parseFloat($('#Overhead\\%').val()))/100.0)) * (1 + (parseFloat($('#Profit\\%').val())/100.0));
    var markup = ((1 + ((parseFloat($('#Contingency\\%').val()) + parseFloat($('#Overhead\\%').val()))/100.0)) * (1 + (parseFloat($('#Profit\\%').val())/100.0)) - 1) * 100;
    var margin = (parseFloat(markup) / (100 + parseFloat(markup)))*100;
    var contingencyCost = parseFloat(totalCost) * (parseFloat($('#Contingency\\%').val())/100);
    var overheadCost = parseFloat(totalCost) * (parseFloat($('#Overhead\\%').val())/100);
    var profitCost = parseFloat(totalSell) - (parseFloat(totalCost) + parseFloat(contingencyCost) + parseFloat(overheadCost));
    var gst = parseFloat(totalSell) * 0.05;
    
    //Sets corresponding field with the new updated values
    $('#LabHours').html("Labour Hours: " + Number(laborHours.toFixed(3)).toLocaleString('en-US'));
    $('#TotMat').html("Total Material: $" + Number(matCost.toFixed(2)).toLocaleString('en-US'));
    $('#TotLabor').html("Total Labour: $" + Number(laborCost.toFixed(2)).toLocaleString('en-US'));
    $('#TotCost').html("Total Cost: $" + Number(totalCost.toFixed(2)).toLocaleString('en-US'));
    $('#FinalPrice').html("Total Estimate Price: $" + Number(totalSell.toFixed(2)).toLocaleString('en-US'));
    $('#Margin').html("Gross-Margin %: " + margin.toFixed(3));
    $('#Markup').html("Mark-up %: " + markup.toFixed(3));
    $('#Over\\$').html("Overhead: $" + Number(overheadCost.toFixed(2)).toLocaleString('en-US'));
    $('#Cont\\$').html("Contingency: $" + Number(contingencyCost.toFixed(2)).toLocaleString('en-US'));    
    $('#Pro\\$').html("Profit: $" + Number(profitCost.toFixed(2)).toLocaleString('en-US'));
    $('#GST').html("GST: $" + Number(gst.toFixed(2)).toLocaleString('en-US'));
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
    var value = curr_row.find('td:eq(1) input[type="number"]').val();
    
    //Ensures quantity field is a multiple of the minimum selling quantity
    var factor = parseInt(value) / parseInt(min_unit);
    value = parseInt(value) > parseInt(min_unit)*parseInt(factor) ? parseInt(min_unit)*(parseInt(factor) + 1) : value;
    curr_row.find('td:eq(1) input[type="number"]').val(value);
    lineItems[row].quantity = value;
    
    //Calculate material cost and update that row/column
    var mat_cost = curr_row.find('td:eq(3) input[type="number"]').val();
    mat_cost = parseFloat(value) * parseFloat(mat_cost);
    curr_row.find('td:eq(4)').html("$" + Number(mat_cost.toFixed(2)).toLocaleString('en-US'));
    
    //Calculate labor hours and update that row/column
    var min_per_unit = curr_row.find('td:eq(5) input[type="number"]').val();
    labor_hours = parseFloat(value) * parseFloat(min_per_unit) / 60.0;
    curr_row.find('td:eq(6)').html(Number(labor_hours.toFixed(3)).toLocaleString('en-US'));
    
    //Calculate labor cost and update that row/column
    var labor_cost = parseFloat(labor_hours) * parseFloat($('#Wage').val());
    curr_row.find('td:eq(7)').html("$" + Number(labor_cost.toFixed(2)).toLocaleString('en-US'));
    
    //Calculate total cost and update to that row/column
    var total_cost = parseFloat(labor_cost) + parseFloat(mat_cost);
    curr_row.find('td:eq(8)').html("$" + Number(total_cost.toFixed(2)).toLocaleString('en-US'));
    
    //Calculate sell cost and update to that row/column
    var sell_cost = parseFloat(total_cost) * (1 + ((parseFloat($('#Contingency\\%').val()) + parseFloat($('#Overhead\\%').val()))/100.0)) * (1 + (parseFloat($('#Profit\\%').val())/100.0));
    curr_row.find('td:eq(9)').html("$" + Number(sell_cost.toFixed(2)).toLocaleString('en-US'));
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
            class: 'btn btn-danger'
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
        //$('#QuoteTable tbody tr').eq(rowInd).find(`td:eq(${columnInd}) input[type="number"]`).blur();
        $('#QuoteTable tbody tr').eq(rowInd + 1).find(`td:eq(${columnInd}) input[type="number"]`).select();
    }
    
    //when deselecting the table change highlight back to normal to indicate row is not being modified anymore
    else if(event.type === 'blur') {
        const row = $(event.target).closest('tr');
        row.find('td').css('background', rowInd % 2 == 1 ? '#f8f6ff' : '#fff');
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
} */
