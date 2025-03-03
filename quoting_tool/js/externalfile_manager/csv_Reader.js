/*
 * File Name: csv_Reader.js
 *
 * Description: This file contains all functions to parse a CSV from bluebeam
 * and convert it into a takeoff
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
 
function parseFile(file){
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            complete: function (results){
                resolve(results);
            },
            error: function (error){
                reject(error);
            },
            header: true,
            skipEmptyLines: true
        });
    });
}

function verifyFile(file){
    if(!file){
        errorPopUpAlert("No File Found");
        return false;
    }
    
    const filetype = "text/csv";
    const fileext = ".csv";
    
    if(!file.name.endsWith(fileext) || file.type !== filetype){
        errorPopUpAlert("File must be a CSV");
        return false;
    }
    return true;
}

function makeDetail(attr){
    return {
            guid: "",
            materials: [],
            new_takeoffdetail1: attr.Color,
            new_measurement: Number(attr["Area"]) ? Number(attr["Area"]) : Number(attr["Length"]),
            new_detailtype: attr["Subject"] === "Area Measurement" ? "Field" : "Perimeter",
            isNew: true,
            changed: false
            };
}

function makeOpen(attr){
    return {
            type: attr.Color,
            count: 0
            };
}

function formatTakeoff(data){
    let details = [];
    let openings = [];
    
    data.forEach(attr => {
        if(attr["Subject"] === "Diameter Measurement"){
            openings.push(makeOpen(attr));
        }
        else if(attr["Subject"].includes("Measurement")){
            details.push(makeDetail(attr));
        }
    });
    console.log(details);
    console.log(openings);
    takeoffs[0].takeoff_details = [...takeoffs[0].takeoff_details, ...details];
    takeoffs[0].new_typecountpairs = [...takeoffs[0].new_typecountpairs, ...openings];
    populateTables();
}

async function retrieveFile(){
    const file = $("#CSVInput")[0].files[0];
	$('#CSVInput').val("");
    if(!verifyFile(file)){ return; }
    
    try{
        let results = await parseFile(file);
        formatTakeoff(results.data);
    }
    catch(error){
        errorPopUpAlert("CSV Could Not be Parsed. Ensure File is in correct format");
    }
}