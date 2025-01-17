/*
 * File Name: Quote_TableOps.js
 *
 * Description: This file contains all functions used by quote_editor to handle event for table
 * population as well as modifcations to certain cells
 *
 * Created By:  Epic Dynamics Capstone Team
 *              Joshua Weir
 *              Robert Hauta
 *              Ernest Sarna
 *              Braden Foley
 *
 * This File is intended for use at Epic Commercial Roofing and Exteriors (Epic) and should not be outside of 
 * Epic's internal affairs
 */

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
            class: 'form-control',
            type: 'number',
            placeholder: 0,
            value: val
        })
        .on("keypress blur keydown", (event) => { //When user exits the textfield or presses enter
            lineItemReCalc(event); 
        })
        .on('focus', (event) => { //highlight currently selected row for easier tracking of what user is doing
            const row = $(event.target).closest('tr');
            row.find('td').css('background', '#2793db80');
        }).click(function(){
            $(this).select();
        })
    ).appendTo(row);
    
    $('<td>').html(lineItems[i].defaultuomid.name).appendTo(row);

    // Append material input field to the fourth cell
    $('<td>').append(
        $('<div></div>' , {
            class: 'input-group'
        }).append(
            $('<div></div>', {
                class: 'input-group-prepend'
            }).append(
                $('<span></span>', {
                    class: 'input-group-text'
                }).html('$')
            )
         ).append(   
            $('<input>', {
                class: 'form-control',
                type: 'number',
                value: lineItems[i].davinci_purchaseunitcost
            }).on("keypress blur keydown", (event) => { lineItemReCalc(event); })
            .on('focus', (event) => {
                const row = $(event.target).closest('tr');
                row.find('td').css('background', '#2793db80');
            }).click(function(){
                $(this).select();
            })
         )  
    ).appendTo(row);
    
    $('<td>').html(0).appendTo(row);

    // Append min/unit input field to the sixth cell
    $('<td>').append(
        $('<input>', {
            class: 'form-control',
            type: 'number',
            value: lineItems[i].davinci_laborminperunit
        }).on("keypress blur keydown", (event) => { lineItemReCalc(event); })
        .on('focus', (event) => {
            const row = $(event.target).closest('tr');
            row.find('td').css('background', '#2793db80');
        }).click(function(){
            $(this).select();
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
        row.find('td').css('background', rowInd % 2 == 1 ? '#fff' : '#00000000');
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
