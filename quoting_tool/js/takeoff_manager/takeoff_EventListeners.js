/*
 * File Name: takeoff_EventListeners.js
 *
 * Description: This file contains the code to instantiate all event listeners required
 * on the takeoff page
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

$(window).on("load", () => {

    const serialized = sessionStorage.getItem("Metrics");
    QuoteId = JSON.parse(serialized).Quote;
    
    $("#UploadButton").click(retrieveFile);

    $('#ProductButton').on("click", function (e) {
        redirect = true;
        saveTakeOffSession();
        window.location.href = "product_catalogue.html";
    });

    $('#QuoteButton').on("click", function (e) {
        redirect = true;
        saveTakeOffSession();
        window.location.href = "quote_page.html";
    });

    $('#TemplateButton').on("click", function (e) {
        redirect = true;
        saveTakeOffSession();
        window.location.href = "template_page.html";
    });

$('#ExitButton').click(exitConfirmation);

$('#TakeOffName').on("dblclick", function(){
    $(this).attr('contenteditable', 'true').focus();

    $(this).on('blur', function () {
        $(this).removeAttr('contenteditable');
        var oldName = takeoffs[0].name;
        takeoffs[0].name = $(this).text();
        takeoffs[0].changed = true;
        updateNames(oldName);
    });
});

$('#Details tbody').on('keydown', 'td input', (event) => {
    const rowInd = $(event.target).closest('tr').index();
    const colInd = $(event.target).closest('td, th').index();
    if(event.key === "Enter"){
        detailsEventHandler(event, true);
        moveSelected(rowInd + 1, colInd);
    }
    if(event.key === "Tab"){
        detailsEventHandler(event, true);
        moveSelected(rowInd, colInd + 1);
        event.preventDefault();
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

$('#Fields tbody').on('dblclick', 'td:nth-child(1)', editName);

$('#Fields tbody').on('blur', 'td:nth-child(1)', changeName);

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

$('#Remarks').blur(changeRemarkHandler);

$('#SaveButton').click(takeoffAPI);

loadTakeOff();

});