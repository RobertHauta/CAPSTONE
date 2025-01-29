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
        saveTakeOffSession();
        window.location.href = "product_catalogue.html";
    });

}

{
    $('#QuoteButton').on("click", function (e) {
        redirect = true;
        saveTakeOffSession();
        window.location.href = "quote_page.html";
    });
}

{
    $('#TemplateButton').on("click", function (e) {
        redirect = true;
        saveTakeOffSession();
        window.location.href = "template_page.html";
    });
}

$('#ExitButton').click(exitConfirmation);

$('#TakeOffName').on("dblclick", function(){
    $(this).attr('contenteditable', 'true').focus();

    $(this).on('blur', function () {
        $(this).removeAttr('contenteditable');
        takeoffs[0].name = $(this).text();
    });
});

//
//
//
//

function retrieveSession(key){
    var serialized_items = sessionStorage.getItem(key);//Cookies.get('Items'); //getCookie("Items");
    if (serialized_items) {
        // Parse the serialized array back into an actual array
        return JSON.parse(serialized_items);
    } else {
        return [];
    }
}

function saveTakeOffSession(){
    var serialized = JSON.stringify(takeoffs);
    var serialized2 = JSON.stringify(materialNames);
    sessionStorage.setItem("TakeOff", serialized);
    sessionStorage.setItem("Material", serialized2);
}

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

function retrieveTakeOffAPI() {
    const fetchXml = buildFetchXml();

    parent.Xrm.WebApi.retrieveMultipleRecords("new_takeoff", `?fetchXml=${encodeURIComponent(fetchXml)}`)
        .then(processResults)
        .catch(handleError);
}

function buildFetchXml() {
    return `<fetch>
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
}

function makeNewTakeOff(){
    var takeoff = {};
    takeoff.name = "New Take Off";
    takeoff.new_fieldwaste = 0;
    takeoff.new_perimeterwaste = 0;
    takeoff.new_remarks = "";
    takeoff.new_takeoffid = "";
    takeoff.new_typecountpairs = [];
    takeoff.takeoff_details = [];
    
    takeoffs.push(takeoff);
}

function processResults(results) {
    takeoffs.length = 0;
    takeoffs = JSON.parse(JSON.stringify(results.entities.reduce(processRecord, [])));
    if(takeoffs.length === 0){
        makeNewTakeOff()
    }
    populateTables();
}

function processRecord(acc, record) {
    const parentId = record.new_takeoffid;
    let parent = acc.find(item => item.new_takeoffid === parentId);

    if (!parent) {
        parent = createParentObject(record);
        acc.push(parent);
    }

    processMaterial(record, parent);
    processDetailRecord(record, parent);

    return acc;
}

function createParentObject(record) {
    const types = deserializeTypeCounts(record.new_typecountpairs);
    return {
        new_takeoffid: record.new_takeoffid,
        name: record.new_takeoffname,
        new_fieldwaste: record.new_fieldwaste,
        new_perimeterwaste: record.new_perimeterwaste,
        new_remarks: record.new_remarks,
        new_typecountpairs: types,
        takeoff_details: []
    };
}

function processMaterial(record, parent) {
    if (record["new_takeoffmaterial_TakeoffDetail_new_takeoffdetail.new_materialtype"]) {
        const material = {
            new_detailtype: record["new_takeoffmaterial_TakeoffDetail_new_takeoffdetail.new_detailtype@OData.Community.Display.V1.FormattedValue"],
            new_totaldimension: record["new_takeoffmaterial_TakeoffDetail_new_takeoffdetail.new_totaldimension"],
            new_quantity: record["new_takeoffmaterial_TakeoffDetail_new_takeoffdetail.new_quantity"],
            new_materialname: record["new_takeoffmaterial_TakeoffDetail_new_takeoffdetail.new_materialname"],
            new_materialtype: record["new_takeoffmaterial_TakeoffDetail_new_takeoffdetail.new_materialtype"]
        };

        if (!materialNames.some(mat => mat.name === material.new_materialtype)) {
            materialNames.push({
                name: material.new_materialtype,
                type: record["new_TakeoffDetail_new_takeoff.new_detailtype@OData.Community.Display.V1.FormattedValue"]
            });
        }

        return material;
    }
    return null;
}

function processDetailRecord(record, parent) {
    const material = processMaterial(record, parent);
    const detailId = record["new_TakeoffDetail_new_takeoff.new_takeoffdetailid"];

    if (detailId && (!parent.takeoff_details.length || detailId !== parent.takeoff_details[parent.takeoff_details.length - 1].guid)) {
        parent.takeoff_details.push({
            guid: detailId,
            materials: material ? [material] : [],
            new_takeoffdetail1: record["new_TakeoffDetail_new_takeoff.new_takeoffdetail1"],
            new_measurement: record["new_TakeoffDetail_new_takeoff.new_measurement"],
            new_detailtype: record["new_TakeoffDetail_new_takeoff.new_detailtype@OData.Community.Display.V1.FormattedValue"]
        });
    } else if (material) {
        parent.takeoff_details[parent.takeoff_details.length - 1].materials.push(material);
    }
}

function handleError(error) {
    console.log(error.message);
}


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
            text: 'Delete',
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

function makeNewDetail(name, row){
    var tableId = row.closest('table').attr('id');
    console.log(tableId);
    var detail = {};
    detail.guid = "";
    detail.new_detailtype = tableId === "Details" ? "Perimeter" : "Field";
    detail.new_measurement = 0;
    detail.new_takeoffdetail1 = name;
    detail.materials = [];
    
    takeoffs[0].takeoff_details.push(detail);
    
    tableId === "Details" ? fillNewRow(row) : fillNewField(row);
}

function makeNewTypeCount(name, row){
    var typecount = {};
    typecount.type = name;
    typecount.count = 0;
    
    takeoffs[0].new_typecountpairs.push(typecount);
    
    createNumberCell(row, 0);
    
    createDeleteButton(row);
}

function contentEditableCell(row, rowFunc){
    $("<td>")
        .html("Click to edit me")
        .attr("contenteditable", "true")
        .on("blur", function () {  
            var cellrow = $(this).closest('tr');
            $(this).attr("contenteditable", "false");
            $(this).off('blur keydown');
            rowFunc($(this).html().trim(), cellrow);
            //makeNewDetail($(this).html().trim());
            //fillNewRow(cellrow);
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
                value: value
            })
            .click(function(){
                $(this).select();
            })
        )  
    ).appendTo(row);
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

function calcTotalMat(name){
    let tots = {sum: 0, total: 0};
    takeoffs[0].takeoff_details.forEach(detail => {
        const measure = detail.new_measurement;
        const match = detail.materials.find(mat => mat.new_materialtype === name.name);
        if(match){
            let total = measure * match.new_quantity;
        	match.new_detailtype !== "Field" ? tots.total += total : null;
                
            //Make sure to calculate total before waste correctly based on type
            if(match.new_detailtype === "Perimeter"){
                tots.sum += total * (1+(takeoffs[0].new_perimeterwaste/100));
             }
            else if(match.new_detailtype === "FieldInTotal"){
                tots.sum += total * (1+(takeoffs[0].new_fieldwaste/100));
            }
        }
    });
    return tots;
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

function addNewMaterial(match, name){
    const material = {
        new_detailtype: match.new_detailtype, 
        new_totaldimension: 0,
        new_quantity: 0,
        new_materialname: `${name} - ${match.new_takeoffdetail1}`,
        new_materialtype: name
    };
    match.materials.push(material);
    return material;
}

function detailRowReCalc(row, event){
    let columnInd = $(event.target).closest('td, th').index();
    const match_detail = takeoffs[0].takeoff_details.find(detail => detail.new_takeoffdetail1 === row.find("td:eq(0)").text());
    if(columnInd === 1){
        match_detail.new_measurement = $(event.target).val();
        match_detail.materials.forEach(mat => {
            mat.new_totaldimension = ($(event.target).val() * mat.new_quantity) * (1 + ($('#DetailWaste').val()/100));
            mat.new_totaldimension = Number(mat.new_totaldimension.toFixed(2));
        });	
    }
    else if(columnInd > 1){
        let name = materialNames[columnInd-2];
        var match = match_detail.materials.find(mat => mat.new_materialtype === name.name);
        if(!match){ match = addNewMaterial(match_detail, name.name); }
        match.new_quantity = Number($(event.target).val());
        match.new_totaldimension = (match.new_quantity * match_detail.new_measurement) * (1 + ($('#DetailWaste').val()/100));
        match.new_totaldimension = Number(match.new_totaldimension.toFixed(2));
    }
}

function fieldRowReCalc(row, event){
    let columnInd = $(event.target).closest('td, th').index();
    const match_field = takeoffs[0].takeoff_details.find(detail => detail.new_takeoffdetail1 === row.find("td:eq(0)").text());
    if(columnInd === 1){
        match_field.new_detailtype = $(event.target).prop("checked") ? "FieldInTotal" : "Field";	
        match_field.materials.forEach(mat => {
            mat.new_detailtype = match_field.new_detailtype;
        });
    }
    else if(columnInd === 2){
        match_field.new_measurement = $(event.target).val();
        match_field.materials.forEach(mat => {
            mat.new_totaldimension = ($(event.target).val() * mat.new_quantity) * (1 + ($('#FieldWaste').val()/100));
            mat.new_totaldimension = Number(mat.new_totaldimension.toFixed(2));
        });	
    }
}

function inputBoundsCheck(target){
    if($(target).val() < 0 || !$(target).val()){
        $(target).val(0);
    }
}

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

function addNewMatInputCheck(result){
    if (result.isConfirmed) {
        const newMaterial = {
            name: result.value,
            type: 'Perimeter'  // Types may no longer be required
        };
        materialNames.push(newMaterial);
        
        // Add new column header
        var heads = $('#Details thead tr').children('th');
        var secondLast = heads.length - 1;
        
        $('<th>').text(newMaterial.name).insertBefore(heads.eq(secondLast));
        
        $('#Detail tbody tr').each(() => {
            const cells = $(this).children('td');
            const lastCell = $(this).children('td');
            
            lastCell.detach();
            createNumberCell($(this), 0);
            lastCell.appendTo($(this));
        });
            
        // Refresh the total material table
        populateTotalMatTable();
    }
}

function addNewMaterialButton() {
    Swal.fire({
        title: 'Add New Material',
        input: 'text',
        inputLabel: 'Enter the name of the new material',
        showCancelButton: true,
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
    
    populateDetailsTable();
    populateTotalMatTable();
}

function deleteDetailButton(event){
    const row = $(event.target).closest('tr');
    
    const detailName = row.find('td:eq(0)').text();
    
    //Removes detail
    takeoffs[0].takeoff_details = JSON.parse(JSON.stringify(takeoffs[0].takeoff_details.filter(detail => detail.new_takeoffdetail1 !== detailName)));
    
    //populateDetailsTable();
    row.remove();
    populateTotalMatTable();
}

function deletePenOpenButton(event){
    const row = $(event.target).closest('tr');
    
    const typeName = row.find('td:eq(0)').text();
    
    takeoffs[0].new_typecountpairs = JSON.parse(JSON.stringify(takeoffs[0].new_typecountpairs.filter(type => type.type !== typeName)));
    
    row.remove();
    populatePenOpenTable();
}

function loadTakeOff(){
    takeoffs = retrieveSession("TakeOff");
    materialNames = retrieveSession("Material");
    if(takeoffs.length === 0){
        retrieveTakeOffAPI();
    }
    else{
        populateTables();
    }
}

//
//
//
//
//
$('#Details tbody').on('keypress', 'input', (event) => {
    if(event.key === "Enter"){
        detailsEventHandler(event, true);
    }
});

$('#Details tbody').on('click', 'button', (event) => deleteDetailButton(event));

$('#Details tbody').on('blur', 'input', (event)=>{detailsEventHandler(event, true);});

$('#Details tbody').on('focus', 'input', (event) => {
    const row = $(event.target).closest('tr');
    if(!row.find('td').hasClass('table-danger')){
        row.find('td').addClass('table-danger');
    }
});

$('#Fields tbody').on('keypress', 'input', (event) => {
    if(event.key === "Enter"){
        detailsEventHandler(event, false);
    }
});

$('#Fields tbody').on('blur', 'input', (event)=>{detailsEventHandler(event, false);});

$('#Fields tbody').on('change','checkbox', (event)=>{detailsEventHandler(event, false);});

$('#Fields tbody').on('click', 'button', (event) => deleteDetailButton(event));

$('#Fields tbody').on('focus', 'input', (event) => {
    const row = $(event.target).closest('tr');
    if(!row.find('td').hasClass('table-danger')){
        row.find('td').addClass('table-danger');
    }
});

$('#PenOpen tbody').on('blur', 'input', (event)=>{penOpenEventHandler(event);});

$('#PenOpen tbody').on('click', 'button', (event) => deletePenOpenButton(event));

$('#PenOpen tbody').on('keypress', 'input', (event) => {
    if(event.key === "Enter"){
        penOpenEventHandler(event, false);
    }
});

$('#PenOpen tbody').on('keydown', 'input', (event) => {
    if(!((event.key >= "0" && event.key <= "9") || 
            event.key === "Backspace" || 
            event.key === "Tab" || 
            event.key === "Enter" || 
            event.key === "ArrowLeft" || 
            event.key === "ArrowRight")){
        event.preventDefault();
    }
});

$('#PenOpen tbody').on('focus', 'input', (event) => {
    const row = $(event.target).closest('tr');
    if(!row.find('td').hasClass('table-danger')){
        row.find('td').addClass('table-danger');
    }
});

$('#DetailButton').click((event) => {
    var detail = {};
    addDetailRow(detail, true)
});

$('#PenOpenButton').click((event) => { addPenOpenRow(null, true) });

$('#FieldButton').click((event) => { addFieldRow(null, true)});

$('#MaterialButton').click((event) => { addNewMaterialButton() });

$('.waste-control').blur(changeWasteHandler);

loadTakeOff();
