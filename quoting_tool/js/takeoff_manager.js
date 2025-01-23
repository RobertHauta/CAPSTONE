var lineItems = [];
var takeoffs = [];
var materialNames = [];
var redirect = false;
var QuoteId = "";

{
    const serialized = sessionStorage.getItem("Metrics");
    QuoteId = JSON.parse(serialized).Quote;
}

{
    $('#ProductButton').on("click", function (e) {
        redirect = true;

        window.location.href = "product_catalogue.html";
    });
}

{
    $('#QuoteButton').on("click", function (e) {
        redirect = true;

        window.location.href = "quote_page.html";
    });
}

{
    $('#TemplateButton').on("click", function (e) {
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
        cancelButtonText: 'Leave Anyways',
        cancelButtonColor: "#3d3935",
        confirmButtonColor: "#e91d2d"
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
                        <filter type="and">
                            <condition attribute="new_quoteid" operator="eq" value="${QuoteId}" />
                        </filter>
                        <!-- Columns -->
                        <attribute name="new_takeoffid" />
                        <attribute name="new_fieldwaste" />
                        <attribute name="new_perimeterwaste" />
                        <attribute name="new_quoteid" />
                        <attribute name="new_quoteidname" />
                        <attribute name="new_remarks" />
                        <attribute name="new_takeoffname" />
                        <attribute name="new_typecountpairs" />
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
                                <attribute name="new_materialtype" />
                            </link-entity>
                        </link-entity>
                    </entity>
                </fetch>`;
                
                
    parent.Xrm.WebApi.retrieveMultipleRecords("new_takeoff", `?fetchXml=${encodeURIComponent(fetchXml)}`).then(
    function success(results) {
			//var result = results.entities[i];
            
            takeoffs.length = 0;
            takeoffs = JSON.parse(JSON.stringify(results.entities.reduce((acc, record) => {
                const parentId = record.new_takeoffid;

                // Check if this quote already exists in the accumulator
                let parent = acc.find(item => item.new_takeoffid === parentId);

                if (!parent) {
                    const types = [...record.new_typecountpairs.matchAll(/<([^;]+);(\d+)>/g)].map(match => {
                        return {
                            type: match[1],
                            count: parseInt(match[2], 10) // Convert count to a number
                        };
                    });
                    // If not, add a new parent object
                    parent = {
                        new_takeoffid: parentId,
                        name: record.new_takeoffname,
                        new_fieldwaste: record.new_fieldwaste,
                        new_perimeterwaste: record.new_perimeterwaste,
                        new_remarks: record.new_remarks,
                        new_typecountpairs: types,
                        takeoff_details: []
                    };
                    acc.push(parent);
                }
                
                const material = {
                    new_detailtype: record["new_takeoffmaterial_TakeoffDetail_new_takeoffdetail.new_detailtype@OData.Community.Display.V1.FormattedValue"], //GUID
                    new_totaldimension: record["new_takeoffmaterial_TakeoffDetail_new_takeoffdetail.new_totaldimension"],
                    new_quantity: record["new_takeoffmaterial_TakeoffDetail_new_takeoffdetail.new_quantity"],
                    new_materialname: record["new_takeoffmaterial_TakeoffDetail_new_takeoffdetail.new_materialname"],
                    new_materialtype: record["new_takeoffmaterial_TakeoffDetail_new_takeoffdetail.new_materialtype"]
                };
                
                //populating material names list
                if(!materialNames.some(mat => mat === record["new_takeoffmaterial_TakeoffDetail_new_takeoffdetail.new_materialtype"])) {
                    materialNames.push(record["new_takeoffmaterial_TakeoffDetail_new_takeoffdetail.new_materialtype"]);
                }
                
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
	},
	function(error) {
		console.log(error.message);
	});         

}

function populateMaterialHeaders(){
    materialNames.forEach(name => {
        $('#Details thead tr').append(`<th>${name}</th>`);
    });
}

function addFieldRow(detail){
    var row = $('<tr>').appendTo($('#Fields'));
    
    $('<td>').html(detail.new_takeoffdetail1).appendTo(row);
    
    var isChecked = false;
    if(detail.new_detailtype !== "Field"){ isChecked = true; }
    
    $('<td>').append(
        $('<input>', {
            type: 'checkbox',
            checked: isChecked
        }).click((event) => {;})
    ).appendTo(row);
    
     $('<td>').append(
            $('<div></div>' , {
                class: 'input-group'
            }).append(
                $('<div></div>', {
                    class: 'input-group-prepend'
                }).append(
                    $('<span></span>', {
                        class: 'input-group-text'
                    }).html(' ')
                )
            ).append(   
                $('<input>', {
                    class: 'form-control',
                    type: 'number',
                    value: detail.new_measurement
                }).on("keypress blur keydown", (event) => { ; })
                .on('focus', (event) => {
                    const row = $(event.target).closest('tr');
                    if(!row.find('td').hasClass('table-danger')){
                        row.find('td').addClass('table-danger');
                    }
                }).click(function(){
                    $(this).select();
                })
            )  
        ).appendTo(row);

        $('<td>').html(detail.materials[0].new_totaldimension).appendTo(row);
}

function addDetailRow(detail){
    var row = $('<tr>').appendTo($('#Details'));
        
        // Detail Name
        $('<td>').html(detail.new_takeoffdetail1).appendTo(row);
        
        // Measurement
        $('<td>').append(
            $('<div></div>' , {
                class: 'input-group'
            }).append(
                $('<div></div>', {
                    class: 'input-group-prepend'
                }).append(
                    $('<span></span>', {
                        class: 'input-group-text'
                    }).html(' ')
                )
            ).append(   
                $('<input>', {
                    class: 'form-control',
                    type: 'number',
                    value: detail.new_measurement
                }).on("keypress blur keydown", (event) => { ; })
                .on('focus', (event) => {
                    const row = $(event.target).closest('tr');
                    if(!row.find('td').hasClass('table-danger')){
                        row.find('td').addClass('table-danger');
                    }
                }).click(function(){
                    $(this).select();
                })
            )  
        ).appendTo(row);
        
        //Populating all the materials
        materialNames.forEach(name => {
            const match = detail.materials.find(mat => mat.new_materialtype === name);
            var width = 0;
            if(match){
                width = match.new_quantity;
            }
            
            $('<td>').append(
                $('<div></div>' , {
                    class: 'input-group'
                }).append(
                    $('<div></div>', {
                        class: 'input-group-prepend'
                    }).append(
                        $('<span></span>', {
                            class: 'input-group-text'
                        }).html(' ')
                    )
                ).append(   
                    $('<input>', {
                        class: 'form-control',
                        type: 'number',
                        value: width
                    }).on("keypress blur keydown", (event) => { ; })
                    .on('focus', (event) => {
                        const row = $(event.target).closest('tr');
                        if(!row.find('td').hasClass('table-danger')){
                            row.find('td').addClass('table-danger');
                        }
                    }).click(function(){
                        $(this).select();
                    })
                )  
            ).appendTo(row);

        });
}

function populateTotalMatTable(){
    $('#TotalMaterial tbody').empty();
    
    materialNames.forEach(name => {
        var sum = 0;
        takeoffs[0].takeoff_details.forEach(detail => {
            const match = detail.materials.find(mat => mat.new_materialtype === name);
            if(match){
                sum += match.new_totaldimension;
            }
        });
    
        var row = $('<tr>').appendTo($('#TotalMaterial tbody'));
        
        $('<td>').html(name).appendTo(row);
        
        $('<td>').html("To Be Calculated").appendTo(row);
        
        $('<td>').html(sum).appendTo(row);
    });
}

function populatePenOpenTable(){
    takeoffs[0].new_typecountpairs.forEach(typecount => {
        var row = $('<tr>').appendTo($('#PenOpen tbody'));
        
        $('<td>').html(typecount.type).appendTo(row);
        
        $('<td>').append(
                $('<div></div>' , {
                    class: 'input-group'
                }).append(
                    $('<div></div>', {
                        class: 'input-group-prepend'
                    }).append(
                        $('<span></span>', {
                            class: 'input-group-text'
                        }).html(' ')
                    )
                ).append(   
                    $('<input>', {
                        class: 'form-control',
                        type: 'number',
                        value: typecount.count
                    }).on("keypress blur keydown", (event) => { ; })
                    .on('focus', (event) => {
                        const row = $(event.target).closest('tr');
                        if(!row.find('td').hasClass('table-danger')){
                            row.find('td').addClass('table-danger');
                        }
                    }).click(function(){
                        $(this).select();
                    })
                )  
            ).appendTo(row);
    });
}

function populateTables(){
    $('#Details tbody').empty();
    $('#Fields tbody').empty();
    populateMaterialHeaders();
    
    takeoffs[0].takeoff_details.forEach(detail => {
        
        if(detail.new_detailtype === "Perimeter"){
            addDetailRow(detail);
        }
        else{
            addFieldRow(detail);
        }
    });
    populateTotalMatTable();
    populatePenOpenTable();

    console.log(takeoffs);
    $("#Remarks").text(takeoffs[0].new_remarks);
}

retrieveTakeOffAPI();
