//
//
// START CODE EXECUTED ON LOAD
//
//

//variable holding all line item json objects
var lineItems = [];
var quoteTable = document.getElementById("QuoteTable");
//parameter to check when leaving a page to see if its redirecting or exiting the quote manager
var redirect = false;

//Labor Rate field at top of page
//Adding watch for user to enter or blur from textfield
//if so update calculated fields with new values
var wageField = document.getElementById("Wage");
wageField.addEventListener('keypress', (event) => {reCalcEvent(event); });
wageField.addEventListener('blur', (event) => {reCalcEvent(event); });
wageField.value = 35; /////////////////// NOT EPIC'S DEFAULT VALUES CHANGE AFTER EVALUATIONS

//Contingency % field at top of page
//Adding watch for user to enter or blur from textfield
//if so update calculated fields with new values
var contingency_percent = document.getElementById("Contingency%");
contingency_percent.addEventListener('keypress', (event) => {reCalcEvent(event); });
contingency_percent.addEventListener('blur', (event) => {reCalcEvent(event); });
contingency_percent.value = 2.0; /////////////////// NOT EPIC'S DEFAULT VALUES CHANGE AFTER EVALUATIONS

//overhead % field at top of page
//Adding watch for user to enter or blur from textfield
//if so update calculated fields with new values
var overhead_percent = document.getElementById("Overhead%");
overhead_percent.addEventListener('keypress', (event) => {reCalcEvent(event); });
overhead_percent.addEventListener('blur', (event) => {reCalcEvent(event); });
overhead_percent.value = 10; /////////////////// NOT EPIC'S DEFAULT VALUES CHANGE AFTER EVALUATIONS

//profit % field at top of page
//Adding watch for user to enter or blur from textfield
//if so update calculated fields with new values
var profit_percent = document.getElementById("Profit%");
profit_percent.addEventListener('keypress', (event) => {reCalcEvent(event); });
profit_percent.addEventListener('blur', (event) => {reCalcEvent(event); });
profit_percent.value = 7.5; /////////////////// NOT EPIC'S DEFAULT VALUES CHANGE AFTER EVALUATIONS

//Button for redirecting to the product catalogue page
//Before redirect clear cookies and update with most recent line item info
var product_Button = document.getElementById("ProductButton");
product_Button.addEventListener("click", function(e){
    del_cookie("Items");
    var serialized_items = "";
    if(!(lineItems.length === 0)){
        serialized_items = JSON.stringify(lineItems);
    }
    document.cookie = "Items=" + serialized_items + ";path=/";
    redirect = true;
    window.location.href = "product_catalogue.html";
});

//When the window is closed delete the "Items" cookie
window.addEventListener('beforeunload', (event) => {
    if(!redirect){
        del_cookie("Items");
        //event.returnValue = `Are you sure you want to leave?`;
    }
});

//Gets the cookie called Items 
//fills line items with it's value if not empty
var serialized_items = getCookie("Items");
if (serialized_items) {
        // Parse the serialized array back into an actual array
    var lineItems = JSON.parse(serialized_items);
    console.log("Array from HTML1: " + lineItems[0]);  // Display array values
} else {
    console.log("No data found in cookie.");
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

//Function to delete a cookie by its name
function del_cookie(name) {
    document.cookie = name + '=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT';
}


// Retrieves cookie by supplied name
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

function calcTotalValues(){
    var laborHours = 0;
    var matCost = 0;
    var laborCost = 0;
    for(i=1; i < quoteTable.rows.length; i++){
        var curr_row = quoteTable.rows[i];
        laborHours = parseFloat(laborHours) + parseFloat(curr_row.cells[6].innerHTML);
        matCost = parseFloat(matCost) + parseFloat(curr_row.cells[4].innerHTML);
        laborCost = laborCost + parseFloat(curr_row.cells[7].innerHTML);
    }
    var totalCost = parseFloat(matCost) + parseFloat(laborCost);
    var totalSell = parseFloat(totalCost) * (1 + ((parseFloat(contingency_percent.value) + parseFloat(overhead_percent.value))/100.0)) * (1 + (parseFloat(profit_percent.value)/100.0));
    var markup = ((1 + ((parseFloat(contingency_percent.value) + parseFloat(overhead_percent.value))/100.0)) * (1 + (parseFloat(profit_percent.value)/100.0)) - 1) * 100;
    var margin = (parseFloat(markup) / (100 + parseFloat(markup)))*100;
    var contingencyCost = parseFloat(totalCost) * (parseFloat(contingency_percent.value)/100);
    var overheadCost = parseFloat(totalCost) * (parseFloat(overhead_percent.value)/100);
    var profitCost = parseFloat(totalSell) - (parseFloat(totalCost) + parseFloat(contingencyCost) + parseFloat(overheadCost));
    
    var laborHoursField = document.getElementById("LabHours");
    laborHoursField.innerHTML = "Labour Hours: " + laborHours.toFixed(3);
    
    var totMaterialField = document.getElementById("TotMat");
    totMaterialField.innerHTML = "Total Material: $" + matCost.toFixed(2);
    
    var totLaborField = document.getElementById("TotLabor");
    totLaborField.innerHTML = "Total Labour: $" + laborCost.toFixed(2);
    
    var totCostField = document.getElementById("TotCost");
    totCostField.innerHTML = "Total Cost: $" + totalCost.toFixed(2);
    
    var finalPriceField = document.getElementById("FinalPrice");
    finalPriceField.innerHTML = "Total Estimate Price: $" + totalSell.toFixed(2);
    
    var marginField = document.getElementById("Margin");
    marginField.innerHTML = "Gross-Margin %: " + margin.toFixed(3);
    
    var markupField = document.getElementById("Markup");
    markupField.innerHTML = "Mark-up %: " + markup.toFixed(3);
    
    var overhead$Field = document.getElementById("Over$");
    overhead$Field.innerHTML = overheadCost.toFixed(2);
    
    var contingency$Field = document.getElementById("Cont$");
    contingency$Field.innerHTML = contingencyCost.toFixed(2);
    
    var profit$Field = document.getElementById("Pro$");
    profit$Field.innerHTML = profitCost.toFixed(2);
}

//Calls business logic for every row in the table
function reCalcBusiness(){
    for(i=1; i < quoteTable.rows.length; i++){
        businessLogic(i);
    }
    
    calcTotalValues();
}

//Based on given table row
//Calculate material cost, labor cost, total cost and sell cost
//Uses data from textfields and lineitem array in calculations
function businessLogic(row){
    const rowIndex = row; // Gets the row index (starts from 1)
    var curr_row = quoteTable.rows[row];
    var min_unit = lineItems[lineItems.length - row].crmd_minimumsellingquantity;
    var value = curr_row.cells[1].querySelector('input[type="number"]').value;
    //Ensures quantity field is a multiple of the minimum selling quantity
    var factor = parseInt(value) / parseInt(min_unit);
    if(parseInt(value) > parseInt(min_unit)*parseInt(factor)){
        value = parseInt(min_unit)*(parseInt(factor) + 1);
        curr_row.cells[1].querySelector('input[type="number"]').value = value;
    }
    
    //Calculate material cost and update that row/column
    var mat_cost = curr_row.cells[3].querySelector('input[type="number"]').value;
    mat_cost = parseFloat(value) * parseFloat(mat_cost);
    curr_row.cells[4].innerHTML = mat_cost.toFixed(2);
    
    //Calculate labor hours and update that row/column
    var min_per_unit = curr_row.cells[5].querySelector('input[type="number"]').value;
    labor_hours = parseFloat(value) * parseFloat(min_per_unit) / 60.0;
    curr_row.cells[6].innerHTML = labor_hours.toFixed(3);
    
    //Calculate labor cost and update that row/column
    var labor_cost = parseFloat(labor_hours) * parseFloat(wageField.value);
    curr_row.cells[7].innerHTML = labor_cost.toFixed(2);
    
    //Calculate total cost and update to that row/column
    var total_cost = parseFloat(labor_cost) + parseFloat(mat_cost);
    curr_row.cells[8].innerHTML = total_cost.toFixed(2);
    
    //Calculate sell cost and update to that row/column
    var sell_cost = parseFloat(total_cost) * (1 + ((parseFloat(contingency_percent.value) + parseFloat(overhead_percent.value))/100.0)) * (1 + (parseFloat(profit_percent.value)/100.0));
    curr_row.cells[9].innerHTML = sell_cost.toFixed(2);
}

// Populates table with line item values
// Sets any components action listeners per row
function tableReCalc(){
    //if any rows in the table delete them
    for(var i = quoteTable.rows.length - 1; i > 0; i--){
        quoteTable.deleteRow(i);
    }
    
    //adds all line items to the table
    for(let i = 0; i < lineItems.length; i++){
    var row = quoteTable.tBodies[0].insertRow(0);
    var cell1 = row.insertCell(0); 
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    var cell4 = row.insertCell(3);
    var cell5 = row.insertCell(4);
    var cell6 = row.insertCell(5);
    var cell7 = row.insertCell(6);
    var cell8 = row.insertCell(7);
    var cell9 = row.insertCell(8);
    var cell10 = row.insertCell(9);
    var cell11 = row.insertCell(10);
            
    cell1.innerHTML = lineItems[i].crmdqe_descriptionshort;
    
    var quantityInput = document.createElement("input");
    quantityInput.setAttribute('type', 'number');
    quantityInput.setAttribute('placeholder', 0);
    
    //when quantity is changed ensure it is >=0 then apply business logic
    quantityInput.addEventListener("keypress", function(event){
        if (event.key == 'Enter') {
            if(event.target.value < 0 || !event.target.value){
                event.target.value = 0;
            }
            businessLogic(event.target.closest('tr').rowIndex);
            calcTotalValues();
        }
    });
    quantityInput.addEventListener("blur", function(event){
        if(event.target.value < 0 || !event.target.value){
                event.target.value = 0;
        }
        businessLogic(event.target.closest('tr').rowIndex);
        calcTotalValues();
    });
    quantityInput.value = 0;
    cell2.appendChild(quantityInput);
    
    // allows material price to be editable
    var materialInput = document.createElement("input");
    materialInput.setAttribute('type', 'number');
    materialInput.addEventListener("keypress", function(event){
        if(event.key == 'Enter'){
            if(event.target.value < 0){
                event.target.value = 0;
            }
            businessLogic(event.target.closest('tr').rowIndex);
            calcTotalValues();
        }
    });
    materialInput.addEventListener("blur", function(event){
        if(event.target.value < 0){
            event.target.value = 0;
        }
        businessLogic(event.target.closest('tr').rowIndex);
        calcTotalValues();
    });
    materialInput.value = lineItems[i].crmdqe_costpricebc;
    cell4.innerHTML = "$";
    cell4.appendChild(materialInput);
    
    // min/unit to be editable
    var timeUnitInput = document.createElement("input");
    timeUnitInput.setAttribute('type', 'number');
    timeUnitInput.addEventListener("keypress", function(event){
        if(event.key == 'Enter'){
            if(event.target.value < 0){
                event.target.value = 0;
            }
            businessLogic(event.target.closest('tr').rowIndex);
            calcTotalValues();
        }
    });
    timeUnitInput.addEventListener("blur", function(event){
        if(event.target.value < 0){
            event.target.value = 0;
        }
        businessLogic(event.target.closest('tr').rowIndex);
        calcTotalValues();
    });
    timeUnitInput.value = lineItems[i].davinci_laborminperunit;
    
    cell6.appendChild(timeUnitInput);
    
    // default values on new line item
    cell3.innerHTML = lineItems[i].crmd_unitid.crmd_name;
    cell5.innerHTML = 0;
    cell7.innerHTML = 0;
    cell8.innerHTML = 0;
    cell9.innerHTML = 0;
    cell10.innerHTML = 0;
    
    //New button that deletes a line item when the button in that row is selected
    var button = document.createElement("button");
    button.innerHTML = "- Quote";
    button.setAttribute('class', 'btn btn-secondary');
    button.addEventListener('click', function(event) {
         // Find the row of the clicked button
         const rowIndex = event.target.closest('tr').rowIndex; // Gets the row index (starts from 1)
         
         lineItems.splice(lineItems.length - rowIndex, 1);
         
         quoteTable.deleteRow(rowIndex);
         
         calcTotalValues();
    });
    cell11.appendChild(button);
}
calcTotalValues();
}

function reCalcEvent(event){
    if(event.type === 'keypress' && !(event.key === 'Enter')){ return; }
    
    if(event.target.value < 0 || !event.target.value){
        event.target.value = 0;
    }
    reCalcBusiness();
}

//
//
// END OF FUNCTIONS
//
//
