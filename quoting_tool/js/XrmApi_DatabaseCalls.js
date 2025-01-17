/*
 * File Name: XrmApi_DatabaseCalls.js
 *
 * Description: This file contains all functions used by quote_editor to query the
 * database using Xrm.WebApi
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
