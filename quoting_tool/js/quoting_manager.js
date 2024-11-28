
var quoteTable = document.getElementById("QuoteTable");
var redirect = false;

var wageField = document.getElementById("Wage");
wageField.addEventListener('click', function(event){
    if(event.key === "Enter"){
        reCalcBusiness();
    }
});
wageField.addEventListener('blur', reCalcBusiness);
wageField.value = 45;

var contingency_percent = document.getElementById("Contingency%");
contingency_percent.addEventListener('click', function(event){
    if(event.key === "Enter"){
        reCalcBusiness();
    }
});
contingency_percent.addEventListener('blur', reCalcBusiness);
contingency_percent.value = 0;

var overhead_percent = document.getElementById("Overhead%");
overhead_percent.addEventListener('click', function(event){
    if(event.key === "Enter"){
        reCalcBusiness();
    }
});
overhead_percent.addEventListener('blur', reCalcBusiness);
overhead_percent.value = 0;

var profit_percent = document.getElementById("Profit%");
profit_percent.addEventListener('click', function(event){
    if(event.key === "Enter"){
        reCalcBusiness();
    }
});
profit_percent.addEventListener('blur', reCalcBusiness);
profit_percent.value = 0;

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

function del_cookie(name) {
    document.cookie = name + '=;path=/';
}

window.addEventListener('beforeunload', (event) => {
    if(!redirect){
        del_cookie("Items");
        event.returnValue = `Are you sure you want to leave?`;
    }
});

// Retrieves cookie with name
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


//Since double reference to this page
//if checks that quote_page.html
if(document.URL[document.URL.length - 15] == 'q'){
    var serialized_items = getCookie("Items");
    if (serialized_items) {
        // Parse the serialized array back into an actual array
        var lineItems = JSON.parse(serialized_items);
        console.log("Array from HTML1: " + lineItems[0]);  // Display array values
    } else {
        console.log("No data found in cookie.");
    }
}


tableReCalc("null");

function reCalcBusiness(){
    for(i=1; i < quoteTable.rows.length; i++){
        businessLogic(i,quoteTable.rows[i].cells[1].querySelector('input[type="number"]').value);
    }
}

function businessLogic(row, value){
    const rowIndex = row; // Gets the row index (starts from 1)
    var curr_row = quoteTable.rows[row];
    var min_unit = lineItems[lineItems.length - row].crmd_minimumsellingquantity;
    var factor = parseInt(value) / parseInt(min_unit);
    if(parseInt(value) > parseInt(min_unit)*parseInt(factor)){
        value = parseInt(min_unit)*(parseInt(factor) + 1);
    }
            
    var mat_cost = lineItems[lineItems.length - row].crmdqe_costpricebc;
    mat_cost = parseFloat(value) * parseFloat(mat_cost);
    curr_row.cells[4].innerHTML = mat_cost.toFixed(2);
            
    var min_unit = lineItems[lineItems.length - row].davinci_laborminperunit;
    labor_hours = parseFloat(value) * parseFloat(min_unit) / 60.0;
    curr_row.cells[6].innerHTML = labor_hours.toFixed(3);
            
    var labor_cost = parseFloat(labor_hours) * parseFloat(wageField.value);
    curr_row.cells[7].innerHTML = labor_cost.toFixed(2);
            
    var total_cost = parseFloat(labor_cost) + parseFloat(mat_cost);
    curr_row.cells[8].innerHTML = total_cost.toFixed(2);
            
    var sell_cost = parseFloat(total_cost) * (1 + ((parseFloat(contingency_percent.value) + parseFloat(overhead_percent.value))/100.0)) * (1 + (parseFloat(profit_percent.value)/100.0));
    curr_row.cells[9].innerHTML = sell_cost.toFixed(2);
}

function tableReCalc(event){
    for(var i = quoteTable.rows.length - 1; i > 0; i--){
        quoteTable.deleteRow(i);
    }
    
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
    
    quantityInput.addEventListener("keypress", function(event){
        if (event.key == 'Enter') {
            businessLogic(event.target.closest('tr').rowIndex, event.target.value);
        }
    });
    
    quantityInput.addEventListener("blur", function(event){
        businessLogic(event.target.closest('tr').rowIndex, event.target.value);
    });
    
    cell2.appendChild(quantityInput);
    
    
    cell3.innerHTML = lineItems[i].crmd_unitid.crmd_name;
    cell4.innerHTML = lineItems[i].crmdqe_costpricebc;
    cell5.innerHTML = quantityInput.value * cell4.innerHTML;
    cell6.innerHTML = lineItems[i].davinci_laborminperunit;
    cell7.innerHTML = 0;
    cell8.innerHTML = 0;
    cell9.innerHTML = 0;
    cell10.innerHTML = 0;
    var button = document.createElement("button");
    button.innerHTML = "- Quote";
    button.setAttribute('class', 'btn btn-secondary');
    button.addEventListener('click', function(event) {
         // Find the row of the clicked button
         const rowIndex = event.target.closest('tr').rowIndex; // Gets the row index (starts from 1)
         
         lineItems.splice(lineItems.length - rowIndex, 1);
         
         quoteTable.deleteRow(rowIndex);
    });
    cell11.appendChild(button);
}
}
