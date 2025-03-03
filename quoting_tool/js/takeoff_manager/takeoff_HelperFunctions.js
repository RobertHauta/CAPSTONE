/*
 * File Name: takeoff_HelperFunctions.js
 *
 * Description: This file contains functions for the takeoff page that handle intermediate
 * logic such as input verifications, sessionStorage management, and global variable manipulation 
 * (mostly the takeoffs global var)
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

//
//
// New detail names must be a combination of the takeoff and detail name!!! JS forced!!!
// Database will not work otherwise
//
var deleted = []
var lineItems = [];
var takeoffs = [];
var materialNames = [];
var redirect = false;
var QuoteId = "";

function updateNames(old){
    let newStr = takeoffs[0].name;
    takeoffs[0].takeoff_details.forEach(detail => {
        detail.new_takeoffdetail1 = detail.new_takeoffdetail1.replaceAll(old, newStr);
        detail.changed = true;
        detail.materials.forEach(material => {
            material.new_materialname = material.new_materialname.replaceAll(old, newStr);
            material.changed = true;
        });
    });
    populateDetailsTable();
    populateTotalMatTable();
}

function saveTakeOffSession(){
    saveSession("TakeOff", takeoffs);
    saveSession("Material", materialNames);
    saveSession("Deleted", deleted);
}

function serializeTypeCounts() {
    return takeoffs[0].new_typecountpairs.map(item => `<${item.type};${item.count}>`).join('');
}


function deserializeTypeCounts(typeCounts){
    const types = [...typeCounts.matchAll(/<([^;]+);(\d+)>/g)].map(match => {
        return {
            type: match[1],
            count: parseInt(match[2], 10) // Convert count to a number
        };
    });
    return types;
}

function errorAlert(msg){
    Swal.fire({
        title: 'Error',
        text: `An Error Occured. ${msg}`,
        icon: 'error',
        confirmButtonText: 'Dismiss',
        confirmButtonColor: "#e91d2d"
    });
}

function newNameVerification(name, isDetail){
    const msg = isDetail ? "Detail" : "Type";
    if(name === "" || name === `${takeoffs[0].name} - `){
        errorAlert(`${msg} Name contains no value.`);
        return false;
    }

    const contains = isDetail ? 
                        takeoffs[0].takeoff_details.some(detail => detail.new_takeoffdetail1.toLowerCase() === name.toLowerCase()) :
                        takeoffs[0].new_typecountpairs.some(type => type.type.toLowerCase() === name.toLowerCase());
    
    
    if(contains){
        errorAlert(`${msg} Name already exists.`);
        return false;
    }
    return true;
}

function makeNewDetail(name, row){
    name = `${takeoffs[0].name} - ${name}`;
    if(!newNameVerification(name, true)){
        return false;
    }
    
    var tableId = row.closest('table').attr('id');
    row.find("td:eq(0)").text(name);
    var detail = {};
    detail.guid = "";
    detail.new_detailtype = tableId === "Details" ? "Perimeter" : "Field";
    detail.new_measurement = 0;
    detail.new_takeoffdetail1 = name;
    detail.materials = [];
    detail.isNew = true;
    detail.changed = false;
    
    takeoffs[0].takeoff_details.push(detail);
    
    tableId === "Details" ? fillNewRow(row) : fillNewField(row);
    return true;
}

function makeNewTypeCount(name, row){
    if(!newNameVerification(name, false)){
        return false;
    }
    
    var typecount = {};
    typecount.type = name;
    typecount.count = 0;
    
    takeoffs[0].new_typecountpairs.push(typecount);
    takeoffs[0].changed = true;
    
    createNumberCell(row, 0);
    
    createDeleteButton(row);
    
    return true;
}

/*
 * Calculates the total material quantities for a specific material across all takeoff details.
 * 
 * @param {Object} name - An object containing the name of the material to calculate totals for.
 * @param {string} name.name - The name of the material.
 * @returns {Object} An object containing two properties:
 *   - sum: The total quantity of the material, including waste calculations for Perimeter and FieldInTotal types.
 *   - total: The total quantity of the material for non-Field types, without waste calculations.
 */
function calcTotalMat(name) {
    let tots = { sum: 0, total: 0 };
    takeoffs[0].takeoff_details.forEach(detail => {
        const measure = detail.new_measurement;
        const match = detail.materials.find(mat => mat.new_materialtype === name.name);
        if (!match) return;

        let total = measure * match.new_quantity;
        if (match.new_detailtype !== "Field") {
            tots.total += total;
        }

        if (match.new_detailtype === "Perimeter") {
            tots.sum += total * (1 + (takeoffs[0].new_perimeterwaste / 100));
        } else if (match.new_detailtype === "FieldInTotal") {
            tots.sum += total * (1 + (takeoffs[0].new_fieldwaste / 100));
        }
    });
    return tots;
}



/*
 * Creates a new material object and adds it to the materials array of the matched detail.
 * 
 * @param {Object} match - The matched detail object to which the new material will be added.
 * @param {string} match.new_detailtype - The type of the detail.
 * @param {string} match.new_takeoffdetail1 - The name of the takeoff detail.
 * @param {Array} match.materials - The array of materials for the matched detail.
 * @param {string} name - The name of the new material to be added.
 * @returns {Object} The newly created material object.
 */
function addNewMaterial(match, name){
    const material = {
        new_detailtype: match.new_detailtype, 
        new_totaldimension: 0,
        new_quantity: 0,
        new_materialname: `${name} - ${match.new_takeoffdetail1}`,
        new_materialtype: name,
        isNew: true,
        changed: false
    };
    match.materials.push(material);
    return material;
}


// function detailRowReCalc(row, event){
//     let columnInd = $(event.target).closest('td, th').index();
//     const match_detail = takeoffs[0].takeoff_details.find(detail => detail.new_takeoffdetail1 === row.find("td:eq(0)").text());
//     if(columnInd === 1){
//         match_detail.new_measurement = $(event.target).val();
//         match_detail.changed = true;
//         match_detail.materials.forEach(mat => {
//             mat.new_totaldimension = ($(event.target).val() * mat.new_quantity) * (1 + ($('#DetailWaste').val()/100));
//             mat.new_totaldimension = Number(mat.new_totaldimension.toFixed(2));
//             mat.changed = true;
//         });	
//     }
//     else if(columnInd > 1){
//         let name = materialNames[columnInd-2];
//         var match = match_detail.materials.find(mat => mat.new_materialtype === name.name);
//         if(!match){ match = addNewMaterial(match_detail, name.name); }
//         match.new_quantity = Number($(event.target).val());
//         match.new_totaldimension = (match.new_quantity * match_detail.new_measurement) * (1 + ($('#DetailWaste').val()/100));
//         match.new_totaldimension = Number(match.new_totaldimension.toFixed(2));
//         match.changed = true;
//     }
// }

//
//
//

/*
 * Recalculates the details of a takeoff row based on user input.
 * 
 * @param {jQuery} row - The jQuery object representing the table row.
 * @param {Event} event - The event object triggered by user input.
 */
function detailRowReCalc(row, event) {
    const columnInd = $(event.target).closest('td, th').index();
    const detailName = row.find("td:eq(0)").text();
    const match_detail = takeoffs[0].takeoff_details.find(detail => detail.new_takeoffdetail1 === detailName);
    
    if (!match_detail) return;

    const wastePercentage = 1 + (Number($('#DetailWaste').val()) / 100);
    const newValue = Number($(event.target).val());

    match_detail.changed = true;

    if (columnInd === 1) {
        match_detail.new_measurement = newValue;
        updateMaterialDimensions(match_detail, wastePercentage);
    } else if (columnInd > 1) {
        updateMaterial(match_detail, columnInd, newValue, wastePercentage);
    }
}

/*
 * Updates the dimensions of all materials for a given detail.
 * 
 * @param {Object} detail - The detail object containing materials to update.
 * @param {number} wastePercentage - The waste percentage to apply to the calculations.
 */
function updateMaterialDimensions(detail, wastePercentage) {
    detail.materials.forEach(mat => {
        mat.new_totaldimension = calculateTotalDimension(detail.new_measurement, mat.new_quantity, wastePercentage);
        mat.changed = true;
    });
}

/*
 * Updates a specific material for a detail based on user input.
 * 
 * @param {Object} detail - The detail object containing the material to update.
 * @param {number} columnInd - The index of the column being updated.
 * @param {number} newValue - The new value entered by the user.
 * @param {number} wastePercentage - The waste percentage to apply to the calculations.
 */
function updateMaterial(detail, columnInd, newValue, wastePercentage) {
    const materialName = materialNames[columnInd - 2].name;
    let material = detail.materials.find(mat => mat.new_materialtype === materialName);
    
    if (!material) {
        material = addNewMaterial(detail, materialName);
    }

    material.new_quantity = newValue;
    material.new_totaldimension = calculateTotalDimension(detail.new_measurement, newValue, wastePercentage);
    material.changed = true;
}

/*
 * Calculates the total dimension for a material, including waste.
 * 
 * @param {number} measurement - The measurement value for the detail.
 * @param {number} quantity - The quantity of the material.
 * @param {number} wastePercentage - The waste percentage to apply.
 * @returns {number} The calculated total dimension, rounded to 2 decimal places.
 */
function calculateTotalDimension(measurement, quantity, wastePercentage) {
    return Number(((measurement * quantity) * wastePercentage).toFixed(2));
}

/*
 * Recalculates the field row based on user input.
 * 
 * @param {jQuery} row - The jQuery object representing the table row.
 * @param {Event} event - The event object triggered by user input.
 */
function fieldRowReCalc(row, event) {
    const columnInd = $(event.target).closest('td, th').index();
    const fieldName = row.find("td:eq(0)").text();
    const match_field = takeoffs[0].takeoff_details.find(detail => detail.new_takeoffdetail1 === fieldName);
    
    if (!match_field) return;

    const wastePercentage = 1 + (Number($('#FieldWaste').val()) / 100);
    const newValue = columnInd === 1 ? $(event.target).prop("checked") : Number($(event.target).val());

    match_field.changed = true;

    if (columnInd === 1) {
        updateFieldType(match_field, newValue);
    } else if (columnInd === 2) {
        match_field.new_measurement = newValue;
        updateMaterialDimensions(match_field, wastePercentage);
    }
}

/*
 * Updates the field type based on the checkbox state.
 * 
 * @param {Object} field - The field object to update.
 * @param {boolean} isChecked - Whether the checkbox is checked.
 */
function updateFieldType(field, isChecked) {
    field.new_detailtype = isChecked ? "FieldInTotal" : "Field";
    field.materials.forEach(mat => {
        mat.new_detailtype = field.new_detailtype;
        mat.changed = true;
    });
}

//
//
//


// function fieldRowReCalc(row, event){
//     let columnInd = $(event.target).closest('td, th').index();
//     const match_field = takeoffs[0].takeoff_details.find(detail => detail.new_takeoffdetail1 === row.find("td:eq(0)").text());
//     if(columnInd === 1){
//         match_field.new_detailtype = $(event.target).prop("checked") ? "FieldInTotal" : "Field";
//         match_field.changed = true;
//         match_field.materials.forEach(mat => {
//             mat.new_detailtype = match_field.new_detailtype;
//             mat.changed = true;
//         });
//     }
//     else if(columnInd === 2){
//         match_field.new_measurement = $(event.target).val();
//         match_field.changed = true;
//         match_field.materials.forEach(mat => {
//             mat.new_totaldimension = ($(event.target).val() * mat.new_quantity) * (1 + ($('#FieldWaste').val()/100));
//             mat.new_totaldimension = Number(mat.new_totaldimension.toFixed(2));
//             mat.changed = true;
//         });	
//     }
// }

/*
 * Checks and adjusts the value of an input element to ensure it's not negative or empty.
 * If the value is less than 0 or empty, it sets the value to 0.
 * 
 * @param {HTMLElement} target - The input element to check and potentially adjust.
 */
function inputBoundsCheck(target){
    if($(target).val() < 0 || !$(target).val()){
        $(target).val(0);
    }
}


/**
 * Handles the event when a pen open input is changed.
 * This function checks the input bounds, toggles the 'table-danger' class on the row,
 * and updates the count in the takeoffs array.
 *
 * @param {Event} event - The DOM event object triggered by the input change.
 */
function penOpenEventHandler(event){
    inputBoundsCheck(event.target);

    var row = $(event.target).closest('tr');
    row.find('td').toggleClass('table-danger');
    takeoffs[0].new_typecountpairs[row.index()].count = Number($(event.target).val());
}


function detailsEventHandler(event, isDetail){
    inputBoundsCheck(event.target);
    
    var row = $(event.target).closest('tr');
    row.find('td').toggleClass('table-danger');
    
    isDetail ? detailRowReCalc(row, event) : fieldRowReCalc(row, event);
    populateTotalMatTable();
    populateDetailsTable();
}

function verifyMaterial(result){
    if(!result.isConfirmed){
        return false;
    }

    if(materialNames.some(mat => mat.name.toLowerCase() === result.value.toLowerCase())){
        errorAlert("Material Name already exists.");
        return false;
    }
    
    if(result.value === ""){
        errorAlert("Material Name cannot be empty.");
        return false;
    }
    return true;
}

function addNewMaterialButton() {
    Swal.fire({
        title: 'Add New Material',
        input: 'text',
        inputLabel: 'Enter the name of the new material',
        showCancelButton: true,
        cancelButtonColor: "#3d3935",
        confirmButtonColor: "#e91d2d",
        inputValidator: (value) => {
            if (!value) {
                return 'You need to write something!'
            }
            if (materialNames.some(mat => mat.name === value)) {
                return 'This material already exists!'
            }
        }
    }).then((result) => { addNewMatInputCheck(result) });
}

function changeWasteHandler(){
    takeoffs[0].new_fieldwaste = Number($('#FieldWaste').val());
    takeoffs[0].new_perimeterwaste = Number($('#DetailWaste').val());
    takeoffs[0].changed = true;
    
    populateDetailsTable();
    populateTotalMatTable();
}

function deleteDetailButton(event){
    const row = $(event.target).closest('tr');
    
    const detailName = row.find('td:eq(0)').text();
    
    //Removes detail
    var detail = takeoffs[0].takeoff_details.find(detail => detail.new_takeoffdetail1 === detailName);
    if(detail.guid !== ""){
        var detailDeleteInfo = { id: detail.guid, type: "Detail" };
        deleted.push(detailDeleteInfo);
    }
    
    takeoffs[0].takeoff_details = JSON.parse(JSON.stringify(takeoffs[0].takeoff_details.filter(detail => detail.new_takeoffdetail1 !== detailName)));
    
    row.remove();
    populateTotalMatTable();
}

function deletePenOpenButton(event){
    const row = $(event.target).closest('tr');
    
    const typeName = row.find('td:eq(0)').text();
    
    takeoffs[0].new_typecountpairs = JSON.parse(JSON.stringify(takeoffs[0].new_typecountpairs.filter(type => type.type !== typeName)));
    takeoffs[0].changed = true;
    
    row.remove();
    populatePenOpenTable();
}

function changeRemarkHandler(){
    takeoffs[0].new_remarks = $('#Remarks').val();
    takeoffs[0].changed = true;
}

function loadTakeOff(){
    takeoffs = retrieveSession("TakeOff");
    materialNames = retrieveSession("Material");
    deleted = retrieveSession("Deleted");
    if(takeoffs.length === 0){
        retrieveTakeOffAPI();
    }
    else{
        populateTables();
    }
}