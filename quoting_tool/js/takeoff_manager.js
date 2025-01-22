var lineItems = [];
var takeoffs = [];
var redirect = false;

{
    $('#ProductButton').on("click", function (e) {
        var serialized_items = "";
        if (!(lineItems.length === 0)) {
            serialized_items = JSON.stringify(lineItems);
        }
        sessionStorage.setItem('Items', serialized_items); //= "Items=" + serialized_items + ";path=/";
        redirect = true;

        window.location.href = "product_catalogue.html";
    });
}

{
    $('#QuoteButton').on("click", function (e) {
        var serialized_items = "";
        if (!(lineItems.length === 0)) {
            serialized_items = JSON.stringify(lineItems);
        }
        sessionStorage.setItem('Items', serialized_items); //= "Items=" + serialized_items + ";path=/";
        redirect = true;

        window.location.href = "quote_page.html";
    });
}

{
    $('#TemplateButton').on("click", function (e) {
        var serialized_items = "";
        if (!(lineItems.length === 0)) {
            serialized_items = JSON.stringify(lineItems);
        }
        sessionStorage.setItem('Items', serialized_items); //= "Items=" + serialized_items + ";path=/";
        redirect = true;

        window.location.href = "template_page.html";
    });
}

$('#ExitButton').click(exitConfirmation);

//
//
//
//

function exitConfirmation(){
    Swal.fire({
        title: 'Are You Sure You Want To Leave?',
        html: "Any Unsaved Changes will be Lost",
        icon: 'warning',
        showCancelButton: true,
        allowOutsideClick: false, // Prevents dismissing by clicking outside
        confirmButtonText: 'Don\'t Leave',
        cancelButtonText: 'Leave Anyways'
    }).then((result) => {
                    if (!result.isConfirmed) {
                        parent.window.close();
                    }
    });
}

function retrieveTakeOffAPI(){
var fetchXml = `<fetch>
                    <!-- Table -->
                    <entity name="new_takeoff">
                        <!-- Columns -->
                        <attribute name="new_takeoffid" />
                        <attribute name="new_fieldwaste" />
                        <attribute name="new_perimeterwaste" />
                        <attribute name="new_quoteid" />
                        <attribute name="new_quoteidname" />
                        <attribute name="new_remarks" />
                        <attribute name="new_takeoffname" />
                        <!-- One To Many Relationships -->
                        <link-entity name="new_takeoffdetail" from="new_takeoffid" to="new_takeoffid" alias="new_TakeoffDetail_new_takeoff" link-type="outer">
                            <attribute name="new_takeoffdetailid" />
                            <attribute name="new_detailtype" />
                            <attribute name="new_detailtypename" />
                            <attribute name="new_fieldwaste1" />
                            <attribute name="new_measurement" />
                            <attribute name="new_takeoffdetail1" />
                            <attribute name="new_perimeterwaste1" />
                            <link-entity name="new_takeoffmaterial" from="new_takeoffdetail" to="new_takeoffdetailid" alias="new_takeoffmaterial_TakeoffDetail_new_takeoffdetail" link-type="outer">
                                <attribute name="new_takeoffmaterialid" />
                                <attribute name="new_detailtype" />
                                <attribute name="new_detailtypename" />
                                <attribute name="new_fieldwaste1" />
                                <attribute name="new_materialname" />
                                <attribute name="new_measurement" />
                                <attribute name="new_totaldimension" />
                                <attribute name="new_quantity" />
                            </link-entity>
                        </link-entity>
                    </entity>
                </fetch>`;
                
                
    parent.Xrm.WebApi.retrieveMultipleRecords("new_takeoff", `?fetchXml=${encodeURIComponent(fetchXml)}`).then(
    function success(results) {
		console.log(results);
			//var result = results.entities[i];
            
            takeoffs.length = 0;
            takeoffs = JSON.parse(JSON.stringify(results.entities.reduce((acc, record) => {
                const parentId = record.new_takeoffid;

                // Check if this quote already exists in the accumulator
                let parent = acc.find(item => item.new_takeoffid === parentId);

                if (!parent) {
                    // If not, add a new parent object
                    parent = {
                        new_takeoffid: parentId,
                        name: record.new_takeoffname,
                        new_fieldwaste: record.new_fieldwaste,
                        new_perimeterwaste: record.new_perimeterwaste,
                        new_remarks: record.new_remarks,
                        takeoff_details: []
                    };
                    acc.push(parent);
                }
                
                const material = {
                    new_detailtype: record["new_takeoffmaterial_TakeoffDetail_new_takeoffdetail.new_detailtype@OData.Community.Display.V1.FormattedValue"], //GUID
                    new_totaldimension: record["new_takeoffmaterial_TakeoffDetail_new_takeoffdetail.new_totaldimension"],
                    new_quantity: record["new_takeoffmaterial_TakeoffDetail_new_takeoffdetail.new_quantity"]
                };
                
                // Add the child record if it exists
                if(parent.takeoff_details.length === 0){
                        var mats = [];
                        mats.push(material);
                        parent.takeoff_details.push({
                            guid: record["new_TakeoffDetail_new_takeoff.new_takeoffdetailid"],

                            materials: mats,
                            new_takeoffdetail1: record["new_TakeoffDetail_new_takeoff.new_takeoffdetail1"],
                            new_measurement: record["new_TakeoffDetail_new_takeoff.new_measurement"], // Text
                            new_detailtype: record["new_TakeoffDetail_new_takeoff.new_detailtype@OData.Community.Display.V1.FormattedValue"]                  
                        });                
                }
                else if (record["new_TakeoffDetail_new_takeoff.new_takeoffdetailid"] !== parent.takeoff_details[parent.takeoff_details.length - 1].guid) {
                        var mats = [];
                        mats.push(material);
                        parent.takeoff_details.push({
                            guid: record["new_TakeoffDetail_new_takeoff.new_takeoffdetailid"],

                            materials: mats,
                            new_takeoffdetail1: record["new_TakeoffDetail_new_takeoff.new_takeoffdetail1"],
                            new_measurement: record["new_TakeoffDetail_new_takeoff.new_measurement"], // Text
                            new_detailtype: record["new_TakeoffDetail_new_takeoff.new_detailtype@OData.Community.Display.V1.FormattedValue"]                  
                        });
                     
                }
                else{
                    parent.takeoff_details[parent.takeoff_details.length - 1]["materials"].push(material);
                }
                
                return acc;
            }, [])));
            populateTables();
			// Columns
            /*var new_takeoffid = result["new_takeoffid"]; // Guid
			var new_fieldwaste = result["new_fieldwaste"]; // Decimal
			var new_fieldwaste_formatted = result["new_fieldwaste@OData.Community.Display.V1.FormattedValue"];
			var new_perimeterwaste = result["new_perimeterwaste"]; // Decimal
			var new_perimeterwaste_formatted = result["new_perimeterwaste@OData.Community.Display.V1.FormattedValue"];
			var new_quoteid = result["_new_quoteid_value"]; // Lookup
			var new_quoteid_formatted = result["_new_quoteid_value@OData.Community.Display.V1.FormattedValue"];
			var new_quoteid_lookuplogicalname = result["_new_quoteid_value@Microsoft.Dynamics.CRM.lookuplogicalname"];
			var new_remarks = result["new_remarks"]; // Text
			var new_takeoffname = result["new_takeoffname"]; // Text*/
	},
	function(error) {
		console.log(error.message);
	});         

}


function populateTables(){
    $("#Remarks").text(takeoffs[0].new_remarks);
}

retrieveTakeOffAPI();
