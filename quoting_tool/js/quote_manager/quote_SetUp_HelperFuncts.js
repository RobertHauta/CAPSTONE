//
// START CODE EXECUTED ON LOAD
//
//

/*$(document).on('click', function(event){
    var elem = parent.document.documentElement;
if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) {  //Safari 
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { // IE11 
    elem.msRequestFullscreen();
  }
  
});*/

$(window).on("load", function() {

/*PDFLib.PDFDocument.create().then(async (pdfDoc) => {
    // Add a page to the PDF
    const page = pdfDoc.addPage([600, 400]); // Dimensions: 600x400 points
    const { width, height } = page.getSize();

    // Draw text on the page
    page.drawText('Hello, World!', {
        x: 50, // X-coordinate
        y: height - 100, // Y-coordinate
        size: 24, // Font size
        color: PDFLib.rgb(0, 0, 1), // Blue color
    });

    // Serialize the PDFDocument to bytes
    const pdfBytes = await pdfDoc.save();

    // Trigger download in the browser
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'example.pdf'; // File name
    link.click();

    console.log('PDF created and saved');
});*/


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

$('#SearchBar').on('blur', function(){
    if($('#SearchBar').val() === ""){
        searchBarHandler();
    }
});
$('#SearchBar').on("keypress",(event) => {event.key === 'Enter' ? (searchBarHandler(), $('#SearchBar').blur()) : null;});
$('#SearchButton').click(searchBarHandler);

$('#ExitButton').click(exitConfirmation);

$('input').click(function(){
    $(this).select();
});
$('input[type="number"]').blur(function(){
    $(this).val(Number($(this).val()));
});

$("#QuoteTable").click(function(e){
    console.log(e.target.parentElement.rowIndex);
    rows = $("#QuoteTable tbody tr");
    var rowIndex = e.target.parentElement.rowIndex;
    
    if(!$(rows[rowIndex - 1]).hasClass('table-danger') && lastIndex != rowIndex){
        $(rows[rowIndex - 1]).addClass('table-danger');
        if(!highlightedLines.includes(lastIndex - 1)){
            $(rows[lastIndex - 1]).removeClass('table-danger');
        }
    }
    else if($(rows[rowIndex - 1]).hasClass('table-danger') && lastIndex != rowIndex){
        if(!highlightedLines.includes(lastIndex - 1)){
            $(rows[lastIndex - 1]).removeClass('table-danger');
        }
    }
    
    lastIndex = rowIndex;
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
    $('.PageDiv').css('pointer-events', 'none');
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
  if(!event.target.matches('#QuoteTable *')){
    if(!highlightedLines.includes(lastIndex - 1)){
        $(rows[lastIndex - 1]).removeClass('table-danger');
        lastIndex = 0;
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
        cancelButtonColor: "#3d3935",
        confirmButtonColor: "#e91d2d"
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
    
    $('.PageDiv').css('pointer-events', 'auto');
    $('.PageDiv').toggleClass("LoadPage");
    $('.LineItemForm').toggleClass("show");
}

function addCustomLineItem(){
    var record = {};
    var errorString = ""
    var unit = "";
    record.isChanged = true;
    $("#NewCat1, #NewCat2, #NewCat3, #NewUnit, #NewLaborMin, #NewName, #NewMake, #MinSelling, #NewCostUnit").css('border-color', '#dee2e6');
    
    $("#NewCat1").val() !== "" ? record.davinci_category1_newap = $("#NewCat1").val() : (errorString += "Category 1;", $("#NewCat1").css('border-color', '#e91d2d')); // Text
    $("#NewCat2").val() !== "" ? record.davinci_category2_newap = $("#NewCat2").val() : (errorString += "Category 2;", $("#NewCat2").css('border-color', '#e91d2d')); // Text
    $("#NewCat3").val() !== "" ? record.davinci_category3_newap = $("#NewCat3").val() : (errorString += "Category 3;", $("#NewCat3").css('border-color', '#e91d2d')); // Text
    record["defaultuomid@odata.bind"] = "/uoms(af7be14e-551b-e911-a97a-000d3a11fc57)"; // Lookup
    
    $('#NewUnit').val() !== "Unit" ? unit = $('#NewUnit').val() : (errorString += "Unit;", $("#NewUnit").css('border-color', '#e91d2d'));
    record.defaultuomid = {};
    const match = units.find(item => item.name === unit);
    if (match) {
        record.defaultuomid.name = unit;
        record.defaultuomid.uomid = match["uomid"];
        record.defaultuomid.scheduleid = match["uomscheduleid"];
    }

    $("#NewLaborMin").val() !== "" && Number($("#NewLaborMin").val()) >= 0 ? record.davinci_laborminperunit = $("#NewLaborMin").val() : (errorString += "Labour Min/Unit;", $("#NewLaborMin").css('border-color', '#e91d2d')); // Decimal
    $("#NewName").val() !== "" ? record.name = $("#NewName").val() : (errorString += "Product Name;", $("#NewName").css('border-color', '#e91d2d')); // Text
    $("#NewMake").val() !== "" ? record.davinci_make_newap = $("#NewMake").val() : (errorString += "Make;", $("#NewMake").css('border-color', '#e91d2d')); // Text
    $("#MinSelling").val() !== "" && Number($("#MinSelling").val()) > 0 && Number.isInteger(Number($("#MinSelling").val())) ? record.davinci_minimumsellingquantity = $("#MinSelling").val() : (errorString += "Minimum Selling Quantity;", $("#MinSelling").css('border-color', '#e91d2d')); // Decimal
    $("#NewCostUnit").val() !== "" && Number($("#NewCostUnit").val()) >= 0 ? record.davinci_purchaseunitcost = $("#NewCostUnit").val() : (errorString += "Cost/Unit;", $("#NewCostUnit").css('border-color', '#e91d2d')); // Decimal
    if(errorString !== ""){
        errorAlert(errorString);
        return;
    }
    else{
        $('.PageDiv').css('pointer-events', 'auto');
        Swal.fire({
            title: 'Are you sure?',
            text: "Please ensure all values are correct as this action can not be reversed.",
            icon: 'question', // Use 'question' for a question mark icon
            showCancelButton: true,
            confirmButtonText: 'Yes, proceed',
            cancelButtonText: 'No, cancel',
            cancelButtonColor: "#3d3935",
            confirmButtonColor: "#e91d2d"
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
            cancelButtonText: 'Continue Anyway',
            cancelButtonColor: "#3d3935",
            confirmButtonColor: "#e91d2d"
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
    
    if($('html').hasClass("LoadingCursor")){
        $('.PageDiv').css('pointer-events', 'none');
    }
    else{
        $('.PageDiv').css('pointer-events', 'auto');
    }
}

//Scrolls back to top of page	
function scrollToTop(){
    $('.Scrollable').animate({scrollTop: $('#QuoteTable').offset().top - $('.Scrollable').offset().top}, 1000);
}