//
// START CODE EXECUTED ON LOAD
//
//

//variable holding all line item json objects
var lineItems = [];
//parameter to check when leaving a page to see if its redirecting or exiting the quote manager
var redirect = false;
//Test Values will be dynamic in future
var QuoteId = "";
var OpportunityId = "1bbcf3ef-e330-40ce-af4c-ed541dbe4c0f"
//deleteQuote();

//Labor Rate field at top of page
//Adding watch for user to enter or blur from textfield
//if so update calculated fields with new values 
$('#Wage').on('keypress blur', (event) => { reCalcEvent(event); });
$('#Wage').val(45); // Not Epic's default values, change after evaluations

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

/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
$('#dropbtn').on("click", function(e){
    document.getElementById("myDropdown").classList.toggle("show");
});

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('#dropbtn')) {
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
    }

}

//Button for redirecting to the product catalogue page
//Before redirect clear sessionstorage and update with most recent line item info
{
    $('#ProductButton').on("click", function(e){
        //Cookies.remove('Items');//del_cookie("Items");
        var serialized_items = "";
        if(!(lineItems.length === 0)){
            serialized_items = JSON.stringify(lineItems);
        }
        sessionStorage.setItem('Items', serialized_items); //= "Items=" + serialized_items + ";path=/";
        redirect = true;
        window.location.href = "product_catalogue.html";
    });
}

{
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
}

//When the window is closed delete the "Items" cookie
window.addEventListener('beforeunload', (event) => {
    if(!redirect){
        //del_cookie("Items");
        //Cookies.remove('Items');
        sessionStorage.clear();
        //event.returnValue = `Are you sure you want to leave?`;
    }
});

//Gets the session item called Items 
//fills line items with it's value if not empty
{
    var serialized_items = sessionStorage.getItem('Items');//Cookies.get('Items'); //getCookie("Items");
    if (serialized_items) {
        // Parse the serialized array back into an actual array
        lineItems = JSON.parse(serialized_items);
    } else {
        console.log("No data found in storage.");
    }
}
tableReCalc();

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

function calcTotalValues(){
    var laborHours = 0;
    var matCost = 0;
    var laborCost = 0;
    for(i=0; i < $('#QuoteTable tbody tr').length; i++){
        var curr_row = $('#QuoteTable tbody tr').eq(i);
        laborHours = parseFloat(laborHours) + parseFloat(curr_row.find('td').eq(6).text());
        matCost = parseFloat(matCost) + parseFloat(curr_row.find('td').eq(4).text());
        laborCost = laborCost + parseFloat(curr_row.find('td').eq(7).text());
    }
    var totalCost = parseFloat(matCost) + parseFloat(laborCost);
    var totalSell = parseFloat(totalCost) * (1 + ((parseFloat($('#Contingency\\%').val()) + parseFloat($('#Overhead\\%').val()))/100.0)) * (1 + (parseFloat($('#Profit\\%').val())/100.0));
    var markup = ((1 + ((parseFloat($('#Contingency\\%').val()) + parseFloat($('#Overhead\\%').val()))/100.0)) * (1 + (parseFloat($('#Profit\\%').val())/100.0)) - 1) * 100;
    var margin = (parseFloat(markup) / (100 + parseFloat(markup)))*100;
    var contingencyCost = parseFloat(totalCost) * (parseFloat($('#Contingency\\%').val())/100);
    var overheadCost = parseFloat(totalCost) * (parseFloat($('#Overhead\\%').val())/100);
    var profitCost = parseFloat(totalSell) - (parseFloat(totalCost) + parseFloat(contingencyCost) + parseFloat(overheadCost));

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
    var value = curr_row.find('td:eq(1) input[type="number"]').val() //cells[1].querySelector('input[type="number"]').value;
    //Ensures quantity field is a multiple of the minimum selling quantity
    var factor = parseInt(value) / parseInt(min_unit);
    if(parseInt(value) > parseInt(min_unit)*parseInt(factor)){
        value = parseInt(min_unit)*(parseInt(factor) + 1);
        curr_row.find('td:eq(1) input[type="number"]').val(value);
        lineItems[row].quantity = value;
    }
    
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
    var val = 0;
    if(lineItems[i].quantity){
        val = lineItems[i].quantity;
    }
    
    $('<td>').append(
        $('<input>', {
            type: 'number',
            placeholder: 0,
            value: val
        })
        .on("keypress blur keydown", (event) => {
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
    let metricsJSON = {
        Wage: $('#Wage').val(),
        Cont: $('#Contingency\\%').val(),
        Over: $('#Overhead\\%').val(),
        Prof: $('#Profit\\%').val()
    };
    serialized = JSON.stringify(metricsJSON);
    sessionStorage.setItem('Metrics', serialized);
    
    reCalcBusiness();
}


function lineItemReCalc(event){
    var rowInd = event.target.closest('tr').rowIndex - 1;
    
    //Allows user to move current row up or down in the table for more customizability
    if(event.type === 'keydown'){
        if((event.key === 'ArrowDown') && (rowInd != lineItems.length - 1)){
            rowInd += 1; 
            var temp = JSON.parse(JSON.stringify(lineItems[rowInd - 1]));
            lineItems[rowInd - 1] = JSON.parse(JSON.stringify(lineItems[rowInd]));
            lineItems[rowInd] = JSON.parse(JSON.stringify(temp));
            tableReCalc();
            $('#QuoteTable tbody tr').eq(rowInd).find('td:eq(1) input[type="number"]').select();
        }
        else if((event.key === 'ArrowUp') && (rowInd != 0)){
            rowInd -= 1;
            var temp = JSON.parse(JSON.stringify(lineItems[rowInd + 1]));
            lineItems[rowInd + 1] = JSON.parse(JSON.stringify(lineItems[rowInd]));
            lineItems[rowInd] = JSON.parse(JSON.stringify(temp));
            tableReCalc();
            $('#QuoteTable tbody tr').eq(rowInd).find('td:eq(1) input[type="number"]').select();
        }
        else if(event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            event.preventDefault();  // Prevent the default action (changing the number)
        }
        else{ return; }
    }
    
    else if(event.type === 'keypress' && !(event.key === 'Enter')){ return; }
    
    //when deselecting the table change highlight back to normal to indicate row is not being modified anymore
    else if(event.type === 'blur') {
        const row = $(event.target).closest('tr');
        if(rowInd % 2 == 1){
            row.find('td').css('background', '#f8f6ff');
        }
        else{
            row.find('td').css('background', '#f0f0f0');
        }
    }


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

function saveQuote(){
    //if this is a new quote
    if(QuoteId === ""){
        saveNewQuote();
    }
    //if quote already exists then create new version
    else{
    
    }
}

// This function saves a quote to the Quote table, then upon success will 
// call saveLineItemQuote() for every line item corresponding to the quote
function saveNewQuote(){
        var totPrice = $('#FinalPrice').text();
        var totalCost = $('#TotCost').text();
        var totMat = $('#TotMat').text();
        var record = {};
        record["customerid_account@odata.bind"] = "/accounts(542c89b8-6eeb-ec11-bb3e-000d3a1406c3)"; // Customer
        record.name = "Test Adding Quote"; // Text
        record.statuscode = 1; // Status
        record.msdyn_estimatedcost = Number(parseFloat(totalCost.substring(13)).toFixed(4)); // Currency
        record.msdyn_invoicesetuptotals = Number((parseFloat(totPrice.substring(23)) - parseFloat(totMat.substring(17))).toFixed(4)); // Currency 
        record["opportunityid@odata.bind"] = `/opportunities(${OpportunityId})`;
        record["pricelevelid@odata.bind"] = "/pricelevels(77beff8d-acfa-e611-811e-c4346bad9624)"; // Lookup -- General Sales PriceList
        record["quote_details"] = [];
        
        var i = 0;
        lineItems.forEach(product => {
            record["quote_details"][i] = saveLineItemQuote(product, i);
            i++;
        });
        
        parent.Xrm.WebApi.createRecord("quote", record).then(
            function success(result) {
                QuoteId = result.id;
                console.log(QuoteId);
            },
            function(error) {
                console.log(error.message);
            }
        );   
}

//This function formats line item information to json to be used in deep insert
function saveLineItemQuote(product, index){
    //Initializing Quote line item details to be sent to dataverse
    var row = $('#QuoteTable tbody tr').eq(index);    
    var record = {};
    record.msdyn_estimatedcost = Number(parseFloat(row.find('td:eq(8)').text()).toFixed(4)); // Currency
    //record["quoteid@odata.bind"] = `/quotes(${QuoteId})`; // Lookup
    record.priceperunit = Number(parseFloat(product.davinci_purchaseunitcost).toFixed(4)); // Currency
    record["productid@odata.bind"] = `/products(${product.productid})`; // Lookup
    record.productname = product.name; // Text
    record.msdyn_costtotal = Number(parseFloat(row.find('td:eq(9)').text()).toFixed(4)); // Currency
    record.quantity = Number(product.quantity); // Decimal
    record["uomid@odata.bind"] = `/uoms(${product.defaultuomid.uomid})`; // Lookup
    record.msdyn_budgetamount = Number(parseFloat(row.find('td:eq(9)').text()).toFixed(4)); // Currency
    return record;
}

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
//
//
// END OF FUNCTIONS
//
//
