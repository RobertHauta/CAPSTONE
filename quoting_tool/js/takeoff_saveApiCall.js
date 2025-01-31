

function translateDetailType(str){
    if(str === "Field"){ return 100000000; }
    if(str === "FieldInTotal"){ return 100000002; }
    if(str === "Perimeter"){ return 100000001; }
}

function createMaterialRequest(mat, detid){
    var record = {};
    record.new_detailtype = translateDetailType(mat.new_detailtype); // Choice
    record.new_materialname = mat.new_materialname; // Text
    record.new_materialtype = mat.new_materialtype; // Text
    record["new_TakeoffDetail@odata.bind"] = `/new_takeoffdetails(${detid})`; // Lookup
    record.new_quantity = mat.new_quantity; // Decimal

    var createRequest = {
        etn: "new_takeoffmaterial",
        payload: record,
        getMetadata: function () { return { boundParameter: null, parameterTypes: {}, operationType: 2, operationName: "Create" }; }
    };
    
    return createRequest;
}

function updateMaterialRequest(mat){
    var record = {};
    record.new_detailtype = translateDetailType(mat.new_detailtype); // Choice
    record.new_materialname = mat.new_materialname; // Text 
    record.new_materialtype = mat.new_materialtype; // Text
    record.new_quantity = mat.new_quantity; // Decimal

    var updateRequest = {
        etn: "new_takeoffmaterial",
        id: mat.new_takeoffmaterialid,
        payload: record,
        getMetadata: function () { return { boundParameter: null, parameterTypes: {}, operationType: 2, operationName: "Update" }; }
    };
    
    return updateRequest;
}

function deleteMaterialRequest(guid){
    var deleteRequest = {
        entityReference: { entityType: "new_takeoffmaterial", id: guid },
        getMetadata: function () { return { boundParameter: null, parameterTypes: {}, operationType: 2, operationName: "Delete" }; }
    };
    
    return deleteRequest;
}

function detailCreateRequest(detail){
    var record = {};
    record.new_detailtype = translateDetailType(detail.new_detailtype); // Choice
    record.new_measurement = Number(detail.new_measurement); // Decimal
    record.new_takeoffdetail1 = detail.new_takeoffdetail1; // Text
    record["new_TakeOffID@odata.bind"] = `/new_takeoffs(${takeoffs[0].new_takeoffid})`; // Lookup

    var createRequest = {
        etn: "new_takeoffdetail",
        payload: record,
        getMetadata: function () { return { boundParameter: null, parameterTypes: {}, operationType: 2, operationName: "Create" }; }
    };
    
    return createRequest;
}

function detailUpdateRequest(detail){
    var record = {};
    record.new_detailtype = translateDetailType(detail.new_detailtype); // Choice
    record.new_measurement = Number(detail.new_measurement); // Decimal
    record.new_takeoffdetail1 = detail.new_takeoffdetail1; // Text

    var updateRequest = {
        etn: "new_takeoffdetail",
        id: detail.guid,
        payload: record,
        getMetadata: function () { return { boundParameter: null, parameterTypes: {}, operationType: 2, operationName: "Update" }; }
    };
    
    return updateRequest;
}

function detailDeleteRequest(guid){
    var deleteRequest = {
        entityReference: { entityType: "new_takeoffdetail", id: guid },
        getMetadata: function () { return { boundParameter: null, parameterTypes: {}, operationType: 2, operationName: "Delete" }; }
    };
    
    return deleteRequest;
}


function processMaterials(){
    var requests = []
    takeoffs[0].takeoff_details.forEach(detail => {
        detail.materials.forEach(mat => {
            if(mat.isNew){ 
                requests.push(createMaterialRequest(mat, detail.guid)); 
            }
    
            else if(mat.changed){   
                requests.push(updateMaterialRequest(mat)); 
            }
        });
    });
    
    return requests;
}

function processDeletes(){
    var requests = [];
    deleted.forEach(id => {
        if(id.type === "Detail"){
            requests.push(detailDeleteRequest(id.id));
        }
        else if(id.type === "Material"){
            requests.push(deleteMaterialRequest(id.id));
        }
    });
    return requests;
}

function processDetails(){
    var requests = [];
    
    takeoffs[0].takeoff_details.forEach(detail => {
        if(detail.isNew){
            requests.push(detailCreateRequest(detail));
        }
        else if(detail.changed){
            requests.push(detailUpdateRequest(detail));
        }
    });
    return requests;
}

function createTakeOffRequest(){
    var quoteId = JSON.parse(sessionStorage.getItem("Metrics")).Quote;

    var record = {};
    record.new_fieldwaste = takeoffs[0].new_fieldwaste; // Decimal
    record.new_perimeterwaste = takeoffs[0].new_perimeterwaste; // Decimal
    record["new_QuoteID@odata.bind"] = `/quotes(${quoteId})`; // Lookup
    record.new_remarks = takeoffs[0].new_remarks; // Text
    record.new_takeoffname = takeoffs[0].name; // Text
    record.new_typecountpairs = serializeTypeCounts(); // Text

    var createRequest = {
        etn: "new_takeoff",
        payload: record,
        getMetadata: function () { return { boundParameter: null, parameterTypes: {}, operationType: 2, operationName: "Create" }; }
    };

    return createRequest;
}

function updateTakeOffRequest(){
    var record = {};
    record.new_fieldwaste = takeoffs[0].new_fieldwaste; // Decimal
    record.new_perimeterwaste = takeoffs[0].new_perimeterwaste; // Decimal
    record.new_remarks = takeoffs[0].new_remarks; // Text
    record.new_takeoffname = takeoffs[0].name; // Text
    record.new_typecountpairs = serializeTypeCounts(); // Text
    
    var updateRequest = {
        etn: "new_takeoff",
        id: takeoffs[0].new_takeoffid,
        payload: record,
        getMetadata: function () { return { boundParameter: null, parameterTypes: {}, operationType: 2, operationName: "Update" }; }
    };

    return updateRequest;
}

function processTakeOff(){
    if(takeoffs[0].isNew){
        return createTakeOffRequest();
    }
    else if(takeoffs[0].changed){
        return updateTakeOffRequest();
    }
    return null;
}

function takeoffAPI(){
    loadingCircle();
    var request = processTakeOff();
    if(request === null){ 
        detailsAPI();
        loadingCircle();
        return true;
    }
    
    parent.Xrm.WebApi.execute(request).then(
        function success(response) {
            if (response.ok) {
                takeoffs[0].new_takeoffid = response.headers.get("OData-EntityId").match(/\((.*?)\)/)[1];
                takeoffs[0].isNew = false;
                console.log(`Record updated: ${takeoffs[0].new_takeoffid}`);
                loadingCircle();
                detailsAPI();
            }
        }
    ).catch(function (error) {
        console.log(error.message);
        loadingCircle();
        errorPopUp("Error: Take-off Object could not be saved", error);
    });
}

function detailsAPI(){
    loadingCircle();
    var requests = [];
    requests.push(processDetails());
    requests[0] = [...processDeletes(), ...requests[0]];
    if(requests[0].length === 0){
        loadingCircle();
        materialsAPI();
        return;
    }
    
    parent.Xrm.WebApi.online.executeMultiple(requests).then(
        function (response){
            let i = 0;
            requests[0].forEach((req) => {
                const match = req.payload ? takeoffs[0].takeoff_details.find(detail => detail.new_takeoffdetail1 === req.payload.new_takeoffdetail1) : null;
                if(match){
                    match.guid = response[i].headers._headers["Location"].match(/\((.*?)\)/)[1];
                }
                i++;
            });
            loadingCircle();
            materialsAPI();
        },
        function (error){
            console.log("Didn't work bro details failed");
            errorPopUp("Error: Detail changes and deleted items could not be saved", error);
            loadingCircle();
        }
    );
}

function materialsAPI(){
    loadingCircle();
    var requests = [];
    requests.push(processMaterials());
    
    if(requests[0].length === 0){
        loadingCircle();
        successPopUp("Take-off Saved Successfully!");
        return;
    }
    
    parent.Xrm.WebApi.online.executeMultiple(requests).then(
        function (response){
            let i = 0;
            let j = 0;
            let k = 0;
            requests[0].forEach((req) => {
                
                const match = req.payload ? takeoffs[0].takeoff_details[j].materials.find(detail => detail.new_takeoffdetail1 === req.payload.new_takeoffdetail1) : null;
                if(match){
                    match.new_takeoffmaterialid = response[i].headers._headers["Location"].match(/\((.*?)\)/)[1];
                    k++;
                }
                
                if(k === takeoffs[0].takeoff_details[j].length){
                    j++;
                    k = 0;
                }
                i++;
            });
            loadingCircle();
            successPopUp("Take-off Saved Successfully!");
        },
        function (error){
            loadingCircle();
            errorPopUp("Error: Material changes could not be saved", error);
            console.log("Didn't work bro materials failed");
        }
    )
}

function successPopUp(msg){
    Swal.fire({
        title: 'Success',
        text: msg,
        icon: 'success',
        confirmButtonText: 'Okay',
        confirmButtonColor: "#e91d2d"
   });
}

function errorPopUp(msg, error){
    Swal.fire({
        title: 'Error',
        text: msg,
        icon: 'error',
        showCancelButton: true,
        confirmButtonText: 'Show Details',
        cancelButtonText: 'Dismiss',
        cancelButtonColor: "#3d3935",
        confirmButtonColor: "#e91d2d"
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
                confirmButtonText: 'Close',
                confirmButtonColor: "#e91d2d"
            });
        }
    });
}
