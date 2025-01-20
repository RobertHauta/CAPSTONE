
var unitGroupId = "";
var Units = [];
var OldProducts = [];
var NewProducts = [];
/*function makeUnitGroup(){

    var record = {};
    record.baseuomname = "Main"; // Text
    record.name = "Main"; // Text
    record.statuscode = 1; // Status
    record.description = "Links all Units from the CRMD solution to the OOTB"; // Multiline Text

    parent.Xrm.WebApi.createRecord("uomschedule", record).then(
        function success(result) {
            unitGroupId = result.id;
            //console.log(newId);
            //run through synchronously
            retrieveUnits();
        },
        function(error) {
            console.log(error.message);
        }
    );

}

function retrieveUnits(){
    parent.Xrm.WebApi.retrieveMultipleRecords("crmd_unit", "?$select=crmd_baseunitratio,crmd_name,crmd_quantity,statecode").then(
        function success(results) {
            console.log(results);
            for (var i = 0; i < results.entities.length; i++) {
                var result = results.entities[i];
                // Columns
                var crmd_unitid = result["crmd_unitid"]; // Guid
                var crmd_baseunitratio = result["crmd_baseunitratio"]; // Decimal
                var crmd_baseunitratio_formatted = result["crmd_baseunitratio@OData.Community.Display.V1.FormattedValue"];
                var crmd_name = result["crmd_name"]; // Text
                var crmd_quantity = result["crmd_quantity"]; // Decimal
                var crmd_quantity_formatted = result["crmd_quantity@OData.Community.Display.V1.FormattedValue"];
                var statecode = result["statecode"]; // State
                var statecode_formatted = result["statecode@OData.Community.Display.V1.FormattedValue"];
                
                if(!Units.some(item => item["crmd_name"] === result["crmd_name"])){
                    Units.push(result);
                }
            }
            
            batchAPIUnits().then(function(){
                retrieveProducts();
            });
        },
        function(error) {
            console.log(error.message);
        }
    );
}

function createUnitsRequest(unit){
    var record = {};
    record.name = unit["crmd_name"] === "ROLL" ? "ROLLS" : unit["crmd_name"]; // Text
    record["uomscheduleid@odata.bind"] = `/uomschedules(${unitGroupId})`; // Lookup
    record.quantity = unit["crmd_quantity"]; // Decimal
    //record["baseuom@odata.bind"] = "/uoms(ab7af8fd-963b-4828-acdc-54160266055f)"; // Lookup

    var createRequest = {
        etn: "uom",
        payload: record,
        getMetadata: function () { return { boundParameter: null, parameterTypes: {}, operationType: 2, operationName: "Create" }; }
    };
    return createRequest;
}

function batchAPIUnits(){
    return new Promise((resolve, reject) => {
    var requests = [];
    //var i = 0;
    Units.forEach(unit => {
        //if(i < 50){
            requests.push(createUnitsRequest(unit));
        //}
        //i++;
    });
    console.log(requests);
    var allReq = [];
    allReq.push(requests);
    parent.Xrm.WebApi.online.executeMultiple(allReq).then(
        function (response) {
            var i = 0;
            requests.forEach((req) => {
                Units[i].guid = response[i].headers._headers["Location"].match(/\((.*?)\)/)[1];
                i++;
            });
            console.log(Units);
            resolve("Done");
            
        },
        function (error) {
            console.log(error);
            reject(error);
        }
    );
});  
}*/

function retrieveOldProducts(){
    parent.Xrm.WebApi.retrieveMultipleRecords("crmdqe_productsservices", "?$select=crmdqe_descriptionshort,crmd_minimumsellingquantity,crmdqe_costpricebc").then(
        function success(results) {
            console.log(results);
            for (var i = 0; i < results.entities.length; i++) {
                var result = results.entities[i];
                // Columns
                var crmdqe_productsservicesid = result["crmdqe_productsservicesid"]; // Guid
                var crmd_minimumsellingquantity = result["crmd_minimumsellingquantity"]; // Decimal
                var crmd_minimumsellingquantity_formatted = result["crmd_minimumsellingquantity@OData.Community.Display.V1.FormattedValue"];
                
                OldProducts.push(result);
            }
            
            
    parent.Xrm.WebApi.retrieveMultipleRecords("product", "?$select=name").then(
	function success(results) {
		console.log(results);
		for (var i = 0; i < results.entities.length; i++) {
			var result = results.entities[i];
			// Columns
			var productid = result["productid"]; // Guid
			var name = result["name"]; // Text
            NewProducts.push(result);
		}
        batchAPIProducts();
	},
	function(error) {
		console.log(error.message);
	}
    
);        
            
            
            
        },
        function(error) {
            console.log(error.message);
        }
    );
}

function createProductsRequest(product){
    var record = {};
    
    //record.name = product["crmdqe_descriptionshort"]; // Text
    /*record.msdyn_purchasename = product["crmdqe_descriptionshort"]; // Text
    record.davinci_category1_newap = product["crmdqe_category1"]; // Text
    record.davinci_category2_newap = product["crmdqe_category2"]; // Text
    record.davinci_category3_newap = product["crmdqe_category3"]; // Text
    record.davinci_make_newap = product["crmd_make"]; // Text
    record.davinci_purchaseunitcost = product["crmd_purchaseunitcost"]; // Decimal
    record.davinci_laborminperunit = product["davinci_laborminperunit"]; // Decimal
    record.davinci_laborcategory = product["davinci_laborcategory"]; // Choice
    if(product["_crmdqe_supplierlookup_value"]){
        record["msdyn_defaultvendor@odata.bind"] = `/accounts(${product["_crmdqe_supplierlookup_value"]})`; // Lookup
    }
    record.davinci_producttype_ootb = product["crmdqe_producttype"]; // Choice
    record.statecode = 0; // State
    record["transactioncurrencyid@odata.bind"] = "/transactioncurrencies(c6de58ad-d1ef-e611-81da-fc15b4287754)"; // Lookup
    record.davinci_guage = product["davinci_guage"]; // Choice
    record.davinci_ourproductcode = product["crmdqe_ourproductcode"]; // Text
    
    const match = Units.find(item => item.crmd_name === product["_crmd_unitid_value@OData.Community.Display.V1.FormattedValue"]);
    if(match["guid"]){
        record["defaultuomid@odata.bind"] = `/uoms(${match.guid})`;
    }
    else{
        console.log("No unit GUID");
        return null;
    }
    
    record["defaultuomscheduleid@odata.bind"] = `/uomschedules(${unitGroupId})`; // Lookup 

    var createRequest = {
        etn: "product",
        payload: record,
        getMetadata: function () { return { boundParameter: null, parameterTypes: {}, operationType: 2, operationName: "Create" }; }
    }; */
    
    //record.davinci_minimumsellingquantity = product["crmd_minimumsellingquantity"]; // Decimal
    record.davinci_purchaseunitcost = product["crmdqe_costpricebc"]; // Decimal
    
    var match = NewProducts.find(item => item["name"] === product["crmdqe_descriptionshort"]);
    

    var updateRequest = {
        etn: "product",
        id: match["productid"],
        payload: record,
        getMetadata: function () { return { boundParameter: null, parameterTypes: {}, operationType: 2, operationName: "Update" }; }
    };
    
    return updateRequest;
}

function batchAPIProducts(){
    return new Promise((resolve, reject) => {
    var requests = [];
    var requests2 = [];
    var i = 0;
    OldProducts.forEach(product => {
        if(i < 1000){
            requests.push(createProductsRequest(product));
        }
        else{
            requests2.push(createProductsRequest(product));
        }
        i++;
    });
    
    var allReq = [];
    allReq.push(requests);
    parent.Xrm.WebApi.online.executeMultiple(allReq).then(
        function (response) {
            var i = 0;
            requests.forEach((req) => {
                Products[i].guid = response[i].headers._headers["Location"].match(/\((.*?)\)/)[1];
                i++;
            });
            console.log("YAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
            resolve("Done");
            
        },
        function (error) {
            console.log(error);
            reject(error);
        }
    );
    
    var allReq2 = [];
    allReq2.push(requests2);
    parent.Xrm.WebApi.online.executeMultiple(allReq2).then(
        function (response) {
            var i = 0;
            requests2.forEach((req) => {
                Products[i].guid = response[i].headers._headers["Location"].match(/\((.*?)\)/)[1];
                i++;
            });
            console.log("YAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
            resolve("Done");
            
        },
        function (error) {
            console.log(error);
            reject(error);
        }
    );
});  
}


//function executethatMFAAAAA(){
   // makeUnitGroup();
//}

$(window).on("load", function(){
    retrieveOldProducts();
});
