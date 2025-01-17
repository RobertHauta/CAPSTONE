/*
 * File Name: Query_Formatters.js
 *
 * Description: This file contains all functions used by quote_editor to help
 * format queries to be passed to Xrm.WebApi
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

function createRequest(product, index, QID){
    var row = $('#QuoteTable tbody tr').eq(index); 
    const record = {};
    
    // Lookup field for the related quote
    record["quoteid@odata.bind"] = `/quotes(${QID})`;

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

function updateLaborRequest(LabId){
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
            id: LabId,
            payload: record,
            getMetadata: function () { return { boundParameter: null, parameterTypes: {}, operationType: 2, operationName: "Update" }; }
        };
    
    return request;
}

function createLaborRequest(QID){
    //var row = $('#QuoteTable tbody tr').eq(index); 
    var totLabor = parseFloat($("#TotLabor").text().substring(15).replace(/,/g, ""));
    var margin = parseFloat($("#Margin").text().substring(16));
    var LaborPlus = Number(totLabor) * (1 + (Number(margin)/100));
    const record = {};
    
    // Lookup field for the related quote
    record["quoteid@odata.bind"] = `/quotes(${QID})`;

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

function quoteUpdate(isTemplate, QID){
    var totPrice = $('#FinalPrice').text();
    var totalCost = $('#TotCost').text();
    var totMat = $('#TotMat').text();
    var totLabor = $("#TotLabor").text().substring(15);
        
    var record = {};
    record.data = {};
    record.entityName = `/quote(${QID})`;
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
            id: QID,
            payload: record.data,
            getMetadata: function () { return { boundParameter: null, parameterTypes: {}, operationType: 2, operationName: "Update" }; }
        };
    return request;
}
