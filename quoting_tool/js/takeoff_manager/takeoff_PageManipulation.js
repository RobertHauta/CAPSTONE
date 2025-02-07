/*
 * File Name: takeoff_PageManipulation.js
 *
 * Description: This file contains all functions to manipulate the takeoff page
 *
 * Created By:  Epic Dynamics Capstone Team
 *              Joshua Weir
 *              Robert Hauta
 *              Ernest Sarna
 *              Braden Foley
 *
 * This File is intended for use at Epic Commercial Roofing and Exteriors (Epic) and should not be used outside of 
 * Epic's internal affairs
 */
 
 function populateMaterialHeaders(){
    materialNames.forEach(name => {
        var heads = $('#Details thead tr').children('th');
        var secondLast = heads.length - 1;
        
        $('<th>').text(name.name).insertBefore(heads.eq(secondLast))
    });
}

function createCheckBox(row, isChecked){
    $('<td>').append(
        $('<input>', {
            type: 'checkbox',
            checked: isChecked
        })

    ).appendTo(row);
}

function createDeleteButton(row){
    $('<td>').append(
        $('<button>', {
            class: 'btn btn-outline-danger IconButton'
        }).html("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\" fill=\"currentColor\" class=\"bi bi-trash\" viewBox=\"0 0 16 16\">" +
            "<path d=\"M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z\"/>" +
            "<path d=\"M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z\"/>" +
          "</svg>")
    ).appendTo(row);
}
 
 function fillNewField(row){
    createCheckBox(row, false);
    
    createNumberCell(row, 0);
    
    $('<td>').html(0).appendTo(row);
    
    createDeleteButton(row);
}

function fillNewRow(row){
    createNumberCell(row, 0);
    
    materialNames.forEach((mat) => {
        createNumberCell(row, 0);
    });
    
    createDeleteButton(row);
}
 
 function contentEditableCell(row, rowFunc){
    $("<td>")
        .html("Click to Edit")
        .attr("contenteditable", "true")
        .on("blur", function () {  
            var cellrow = $(this).closest('tr');
            if(rowFunc($(this).html().trim(), cellrow)){
                $(this).attr("contenteditable", "false");
                $(this).off('blur keydown');
            }
        })
        .on("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault(); 
                $(this).blur();
            }
        })
        .appendTo(row);
        
}

function createNumberCell(row, value){
    $('<td>').append(   
            $('<input>', {
                class: 'form-control',
                type: 'number',
                value: value
            })
            .click(function(){
                $(this).select();
            })
        ).appendTo(row);
}


function addFieldRow(detail, isNew){
return new Promise((resolve, reject) => {
    var row = $('<tr>').appendTo($('#Fields'));
    if(isNew){
        contentEditableCell(row, makeNewDetail);
    }
    else{
        $('<td>').html(detail.new_takeoffdetail1).appendTo(row);
    
        var isChecked = false;
        if(detail.new_detailtype !== "Field"){ isChecked = true; }
    
        createCheckBox(row, isChecked);
    
        createNumberCell(row, detail.new_measurement);
        
        var addedWaste = detail.new_measurement * (1 +(takeoffs[0].new_fieldwaste/100));
        $('<td>').html(addedWaste.toFixed(2)).appendTo(row);
        
        createDeleteButton(row);
    }
    resolve("Success!");
});
}

function addDetailRow(detail, isNew){
return new Promise ((resolve, reject) => {
    var row = $('<tr>').appendTo($('#Details'));
        
        // Detail Name
        isNew ? contentEditableCell(row, makeNewDetail) : $('<td>').html(detail.new_takeoffdetail1).appendTo(row);
        
        // Measurement
        !isNew ? createNumberCell(row, detail.new_measurement) : null;
        
        //Populating all the materials
        materialNames.forEach(name => {
            const match = !isNew ? detail.materials.find(mat => mat.new_materialtype === name.name) : null;
            var width = 0;
            if(match){
                width = match.new_quantity;
            }
            !isNew ? createNumberCell(row, width) : null;
        });
        
        !isNew ? createDeleteButton(row) : null;
    resolve("Success!");
});
}

function populateTotalMatTable(){
return new Promise((resolve, reject) => {
    $('#TotalMaterial tbody').empty();
    
    materialNames.forEach(name => {
        let tots = calcTotalMat(name)
        var row = $('<tr>').appendTo($('#TotalMaterial tbody'));
        
        $('<td>').html(name.name).appendTo(row);
        
        $('<td>').html(tots.total.toFixed(2)).appendTo(row);
        
        $('<td>').html(tots.sum.toFixed(2)).appendTo(row);
    });
    resolve("Success!");
});
}

function addPenOpenRow(typecount, isNew){
    var row = $('<tr>').appendTo($('#PenOpen tbody'));
        
    isNew ? contentEditableCell(row ,makeNewTypeCount) : $('<td>').html(typecount.type).appendTo(row);
      
    !isNew ? createNumberCell(row, typecount.count) : null;
    
    !isNew ? createDeleteButton(row) : null;
}

function populatePenOpenTable(){
return new Promise((resolve, reject) => {
    $('#PenOpen tbody').empty();
    takeoffs[0].new_typecountpairs.forEach(typecount => {
        addPenOpenRow(typecount);
    });
    resolve("Success!");
});
}

function populateDetailsTable(){
    return new Promise((resolve, reject) => {
        $('#Details tbody').empty();
        $('#Fields tbody').empty();
        takeoffs[0].takeoff_details.forEach(detail => {
        
            if(detail.new_detailtype === "Perimeter"){
                addDetailRow(detail, false);
            }
            else{
                addFieldRow(detail);
            }
        });
        resolve("Success!");
    });
}

function populateTables(){
    $('#FieldWaste').val(Number(takeoffs[0].new_fieldwaste));
    $('#DetailWaste').val(Number(takeoffs[0].new_perimeterwaste));
    $('#TakeOffName').text(takeoffs[0].name);
    
    populateMaterialHeaders();
    populateTotalMatTable();
    populatePenOpenTable();
    populateDetailsTable();

    console.log(takeoffs);
    $("#Remarks").text(takeoffs[0].new_remarks);
}

function addNewMatInputCheck(result){
    if(!verifyMaterial(result)){ return; }
        
    const newMaterial = {
        name: result.value,
        type: 'Perimeter'  // Types may no longer be required
    };
    materialNames.push(newMaterial);
        
    // Add new column header
    var heads = $('#Details thead tr').children('th');
    var secondLast = heads.length - 1;
        
    $('<th>').text(newMaterial.name).insertBefore(heads.eq(secondLast));
        
    $('#Details tbody tr').each((index, row) => {
        var cells = $(row).children('td');
        var ind = cells.length - 1;
        $('<td>').append(   
            $('<input>', {
                class: 'form-control',
                type: 'number',
                value: 0
            })
            .click(function(){
                $(this).select();
            })
        ).insertBefore(cells.eq(ind)); 
    });
            
    // Refresh the total material table
    populateTotalMatTable();
}

function moveSelected(rowIndex, colIndex){    
    {
        let numRows = $("#Details tbody tr").length;
        let numCells = $("#Details tbody tr").eq(0).find('td').length;
        
        if(colIndex === numCells - 1){
            colIndex = 1;
            rowIndex += 1;
        }
        
        if(numRows <= rowIndex || numCells - 1 <= colIndex){
            return;
        }
    }
    
    $('#Details tbody tr').eq(rowIndex).find(`td:eq(${colIndex}) input[type="number"]`).select()
}