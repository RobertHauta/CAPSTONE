/*
 * File Name: takeoff_RetrieveApi.js
 *
 * Description: This file contains all functions to retrieve takeoff
 * information and process/format the results
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
    takeoff.name = "New Takeoff";
    takeoff.new_fieldwaste = 5;
    takeoff.new_perimeterwaste = 8;
    takeoff.new_remarks = "";
    takeoff.new_takeoffid = "";
    takeoff.new_typecountpairs = [];
    takeoff.takeoff_details = [];
    takeoff.isNew = true;
    takeoff.changed = false;
    
    takeoffs.push(takeoff);
}

function processResults(results) {
    takeoffs.length = 0;
    takeoffs = JSON.parse(JSON.stringify(results.entities.reduce(processRecord, [])));
    if(takeoffs.length === 0){
        makeNewTakeOff();
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
        isNew: false,
        changed: false,
        takeoff_details: []
    };
}

function processMaterial(record, parent) {
    if (record["new_takeoffmaterial_TakeoffDetail_new_takeoffdetail.new_materialtype"]) {
        const material = {
            new_takeoffmaterialid: record["new_takeoffmaterial_TakeoffDetail_new_takeoffdetail.new_takeoffmaterialid"],
            new_detailtype: record["new_takeoffmaterial_TakeoffDetail_new_takeoffdetail.new_detailtype@OData.Community.Display.V1.FormattedValue"],
            new_totaldimension: record["new_takeoffmaterial_TakeoffDetail_new_takeoffdetail.new_totaldimension"],
            new_quantity: record["new_takeoffmaterial_TakeoffDetail_new_takeoffdetail.new_quantity"],
            new_materialname: record["new_takeoffmaterial_TakeoffDetail_new_takeoffdetail.new_materialname"],
            new_materialtype: record["new_takeoffmaterial_TakeoffDetail_new_takeoffdetail.new_materialtype"],
            isNew: false,
            changed: false
        };

        if (!materialNames.some(mat => mat.name === material.new_materialtype)) {
            materialNames.push({
                name: material.new_materialtype,
                type: record["new_TakeoffDetail_new_takeoff.new_detailtype@OData.Community.Display.V1.FormattedValue"],
            });
        }

        return material;
    }
    return null;
}

function processDetailRecord(record, parent) {
    let material = processMaterial(record, parent);
    const detailId = record["new_TakeoffDetail_new_takeoff.new_takeoffdetailid"];

    if (detailId && (!parent.takeoff_details.length || detailId !== parent.takeoff_details[parent.takeoff_details.length - 1].guid)) {
        parent.takeoff_details.push({
            guid: detailId,
            materials: material ? [material] : [],
            new_takeoffdetail1: record["new_TakeoffDetail_new_takeoff.new_takeoffdetail1"],
            new_measurement: record["new_TakeoffDetail_new_takeoff.new_measurement"],
            new_detailtype: record["new_TakeoffDetail_new_takeoff.new_detailtype@OData.Community.Display.V1.FormattedValue"],
            isNew: false,
            changed: false
        });
    } else if (material) {
        parent.takeoff_details[parent.takeoff_details.length - 1].materials.push(material);
    }
}

function handleError(error) {
    console.log(error.message);
}
