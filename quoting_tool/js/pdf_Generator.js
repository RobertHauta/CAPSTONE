/*
 * File Name: pdf_Generator.js
 *
 * Description: This file contains all functions to convert a quote into a PDF
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

var lineItems = [];
var details = [];
var lastSection = "";
var metrics = "";
var redirect = false;

$(window).on("load", function() {

loadConfig();

lineItems = retrieveSession("Items");
metrics = retrieveSession("Metrics");
console.log(lineItems.filter(item => item.isGroup));

$('#ExitButton').click(exitPDF);
$('#HelpButton').click(openManual);

$('#SaveButton').click(savePDF);

$('#title-picture > .image-input').on("change", function(event){
    retrieveFile(event);
});
$('#title-picture > .remove-picture').click(function(){
    let picture = $('#title-picture').find('.pdf-picture').remove();
    $('#title-picture').find('.image-input').css('display', 'inline-block');
});

$('#bold-button').click(function(event){
    textOperation(event, 'bold');
});
$('#ital-button').click(function(event){
    textOperation(event, 'italic');
});
$('#underline-button').click(function(event){
    textOperation(event, 'underline');
});
$('#unordered-button').click(function(event){
    textOperation(event, 'insertUnorderedList');
});
$('#ordered-button').click(function(event){
    textOperation(event, 'insertOrderedList');
});
$('#font-size').on('change', function(){
    let size = this.value;
    document.execCommand('fontSize', false, size);
});
$('#align-left').click(function(event){
    textOperation(event, 'justifyLeft');
});
$('#align-middle').click(function(event){
    textOperation(event, 'justifyCenter');
});
$('#align-right').click(function(event){
    textOperation(event, 'justifyRight');
});

$('#add-picture').click(function(){
    const gridDiv = $('#pictures-page > .pictures-grid');
    
    $('<div>', {
        class: 'picture-div'
    }).append(
        $('<div>', {
            class: 'pictures-flex square'
        }).append(
            $('<input>', {
                class: 'form-control image-input',
                type: 'file',
                'aria-label': 'Upload'
            }).on("change", function(event){
                retrieveFile(event);
            })
        ).append(
            $('<button>', {
                class: 'btn btn-danger IconButton remove-picture pdf-button me-2 mt-2'
            }).html('<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-x-lg" viewBox="0 0 16 16">' +
                '<path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>' +
            '</svg>').click(function(event){
                removePicture(event)
            })
        )
    ).append(
        $('<label>', {
            contenteditable: true,
            'for': 'picture'
        }).html("Label")
    ).appendTo(gridDiv);
});

$('#add-details').click(function(){
    $('.PageDiv').css('pointer-events', 'none');
    $('body').css('overflow-y', 'hidden');
    $('.PageDiv').toggleClass("LoadPage");
    $('.container-card').toggleClass("show");
});

$('#cancel-details').click(function(){
    $("#details-table tbody").empty();
    populateQuoteDetails();
    $('.Scrollable').scrollTop(0);
    $('.PageDiv').css('pointer-events', 'auto');
    $('body').css('overflow-y', 'auto');
    $('.PageDiv').toggleClass("LoadPage");
    $('.container-card').toggleClass("show");
});

populateDetailsItems();
populateQuoteDetails();
populateFields();

$('#checkbox-all').click(function(){
    const isChecked = $(this).prop('checked');
    $('.details-checkbox').each(function(){
        if($(this).prop('checked') !== isChecked){
            $(this).click();
        }
    });
});
$('.details-checkbox').change(function () {
    if ($('.details-checkbox:checked').length < $('.details-checkbox').length) {
        // If some checkboxes are unchecked, uncheck checkbox-all
        $('#checkbox-all').prop('checked', false);
    } else if ($('.details-checkbox:checked').length === $('.details-checkbox').length) {
        // If all checkboxes are checked, check checkbox-all
        $('#checkbox-all').prop('checked', true);
    }
});

let divHeight = $('.Scrollable').closest('#details-popup').height();
$('.Scrollable').height(divHeight - (divHeight * 0.18));
$(window).resize(function(){
    let divHeight = $('.Scrollable').closest('#details-popup').height();
    $('.Scrollable').height(divHeight - (divHeight * 0.18));
});

});

function textOperation(event, operation){
    document.execCommand(operation);
}

function removePicture(event){
    let pictureDiv = $(event.target).closest('.picture-div');
    let picture = pictureDiv.find('.pdf-picture');
    if(picture.length ===  0){
        pictureDiv.remove();
    }
    else{
        picture.remove();
        pictureDiv.find('.image-input').css('display', 'inline-block');
    }
}

function verifyFile(file){
    if(!file){
        errorPopUpAlert("No File Found");
        return false;
    }
    
    const fileTypes = ["image/jpeg", "image/png"];
    
    if(!fileTypes.includes(file.type)){
        errorPopUpAlert("File must be an image (JPEG or PNG)");
        return false;
    }
    
    return true;
}


function retrieveFile(event){
    const file = event.target.files[0];
    $(event.target).val("");
    
    if(!verifyFile(file)){ return; }

    const reader = new FileReader();
    reader.onload = function(e) {
        let pictureDiv = $(event.target).closest('.pictures-flex');
            
        $('<img>', {
            class: 'pdf-picture',
            width: pictureDiv.width(),
            height: pictureDiv.height(),
            src: e.target.result
        }).appendTo(pictureDiv);
            
        $(event.target).css('display', 'none');
    };
    reader.readAsDataURL(file);
}

async function populateDetailsItems(){
    const table = $("#items-table tbody");
    const lineItems = retrieveSession("Items");
    lineItems.forEach(item => {
        const row = $('<tr>').appendTo(table);
            
        if(item.isGroup){ 
            const checkGroupCell = $('<td>').append(
                $('<div>', {
                    class: 'd-flex justify-content-center mt-1'
                }).append(
                    $('<input>', {
                        id: `group_${item.name.replace(/\s/g, '_')}_checkbox`,
                        class: 'details-checkbox',
                        type: 'checkbox',
                        checked: details.includes(item)
                }).on('change', function(e){
                    const isAdded = details.includes(item);
                    if(!isAdded){
                        //$(`.checkbox_${item.name.replace(/\s/g, '_')}:not(:checked)`).each(function(){
                           // $(this).click();
                        //});
                        const firstItemIndex = details.findIndex(first => first.new_groupname === item.name);
                        if(firstItemIndex !== -1){
                            details.splice(firstItemIndex, 0, item);
                        }
                        else{
                            details.push(item);
                        }
                    }
                    else{
                        details = details.filter(detail => detail !== item);
                        $(`.checkbox_${item.name.replace(/\s/g, '_')}:checked`).each(function(){
                            $(this).click();
                        });
                    }
            }))).appendTo(row);
            
            const groupCell = $('<td>', {
                css: {
                    'padding': '0',
                    'border-color': '#4d5154'
                }
            }).append($('<div>', {
                class: 'group-cell',
                css: {
                    'height': '41px',
                    'cursor': 'auto',
                    'padding': '8px'
                }
            }).html(item.name)).appendTo(row);
            
//            let groupItems = lineItems.filter(groupItem => groupItem.new_groupname === item.name);
//            let groupTotal = 0;
//            groupItems.forEach((groupItem) => {
//                groupTotal += groupItem.davinci_purchaseunitcost;
//            });
            const groupTotalCell = $('<td>', {
                css: {
                    'background-color': '#3d3935',
                    'color': 'white',
                    'font-weight': 'bold'
                }
            }).html(`$${item.groupTotal.toFixed(2)}`).appendTo(row);
            
            return; 
        }
        
        const checkCell = $('<td>').append(
            $('<div>', {
                class: 'd-flex justify-content-center mt-1'
            }).append(
                $('<input>', {
                    class: `checkbox_${item.new_groupname.replace(/\s/g, '_')} details-checkbox`,
                    type: 'checkbox',
                    checked: details.includes(item)
            }).on('change', function(){
                const isAdded = details.includes(item);
                if(!isAdded){
                    details.push(item);
                }
                else{
                    details = details.filter(detail => detail !== item);
                }
                
                const allChecked = $(`.checkbox_${item.new_groupname.replace(/\s/g, '_')}:checked`).length;
                const allCheckboxes = $(`.checkbox_${item.new_groupname.replace(/\s/g, '_')}`).length;
                const groupCheckbox = $(`#group_${item.new_groupname.replace(/\s/g, '_')}_checkbox`);
                if(allChecked === allCheckboxes && !groupCheckbox.prop('checked')){
                    groupCheckbox.click();
                }
                else if(allChecked === 0 && groupCheckbox.prop('checked')){
                    groupCheckbox.click();
                }
        }))).appendTo(row);
        const descrCell = $('<td>', {
            colspan: 2
        }).html(item.name).appendTo(row);
        //let cost = `$${item.davinci_purchaseunitcost}`
        //const priceCell = $('<td>').html(cost).appendTo(row);     
    });
}

function populateQuoteDetails(){
    const table = $("#details-table tbody");
    details.sort((a, b) => {
        // Ungrouped items first
        if (a.new_groupname === '' && b.new_groupname !== '') return -1;
        if (a.new_groupname !== '' && b.new_groupname === '') return 1;

        // Group headers come before items in the same group
        if (a.isGroup && !b.isGroup && a.new_groupname === b.new_groupname) return -1;
        if (!a.isGroup && b.isGroup && a.new_groupname === b.new_groupname) return 1;

        // Sort grouped items alphabetically by groupname
        if (a.new_groupname < b.new_groupname) return -1;
        if (a.new_groupname > b.new_groupname) return 1;

        return 0; // Maintain original order otherwise
    });
    details.forEach(item => {
        const row = $('<tr>').appendTo(table);
            
        if(item.isGroup){ 
            const groupCell = $('<td>', {
                css: {
                    'padding': '0',
                    'border-color': '#4d5154'
                }
            }).append($('<div>', {
                    class: 'group-cell',
                    css: {
                        'height': '41px',
                        'cursor': 'auto',
                        'padding': '8px'
                    }
            }).html(item.name)).appendTo(row);
            
//            let groupItems = lineItems.filter(groupItem => groupItem.new_groupname === item.name);
//            let groupTotal = 0;
//            groupItems.forEach((groupItem) => {
//                groupTotal += groupItem.davinci_purchaseunitcost;
//            });
            const groupTotalCell = $('<td>', {
                css: {
                    'background-color': '#3d3935',
                    'color': 'white',
                    'font-weight': 'bold'
                }
            }).html(`$${item.groupTotal.toFixed(2)}`).appendTo(row);
            
            return; 
        }
        const descrCell = $('<td>', {
            colspan: 2
        }).html(item.name).appendTo(row);
        //let cost = `$${item.davinci_purchaseunitcost}`
        //const priceCell = $('<td>').html(cost).appendTo(row);     
    });
}

async function populateFields(){
    getOppInfo(metrics.Quote);
    
    let date = new Date();
    $('#title-date').val(date.toISOString().split('T')[0]);
    
    let gst = Number((Number(metrics.Subtotal.substring(1).replace(/,/g, "")) * 0.05).toFixed(2)).toLocaleString('en-US');
    let total = Number((Number(metrics.Subtotal.substring(1).replace(/,/g, "")) * 1.05).toFixed(2)).toLocaleString('en-US');
    
    $('#quote-name').html(metrics.Name);
    $('#pdf-subtotal').html(metrics.Subtotal);
    $('#pdf-gst').html("$" + gst);
    $('#pdf-total').html("$" + total);
    
    $('#auth-details').html("$" + total + "*");
}

function getOppInfo(QuoteId){
    parent.Xrm.WebApi.retrieveRecord("quote", QuoteId, "?$expand=opportunityid($select=name,_customerid_value)").then(
        function success(result) {		
            // Many To One Relationships
            if (result.hasOwnProperty("opportunityid") && result["opportunityid"] !== null) {
                let opportunityid_name = result["opportunityid"]["name"];
                $('#auth-project').html(opportunityid_name);
                $('#title-project').html(`Project #${opportunityid_name}`);
                
                let opportunityid_customerid_formatted = result["opportunityid"]["_customerid_value@OData.Community.Display.V1.FormattedValue"];
                $('#auth-name').html(opportunityid_customerid_formatted);
                $('#customer-name').html(`<strong contenteditable="true">${opportunityid_customerid_formatted}:</strong>`);
            }
        },
        function(error) {
            console.log(error.message);
        }
    );
}

async function exitPDF(){
    await Swal.fire({
        title: 'Are You Sure You Want To Leave?',
        html: "Any Unsaved Changes will be Lost",
        icon: 'question',
        showCancelButton: true,
        allowOutsideClick: false, // Prevents dismissing by clicking outside
        confirmButtonText: 'Don\'t Leave',
        cancelButtonText: 'Leave Anyways',
        cancelButtonColor: "#3d3935",
        confirmButtonColor: "#e91d2d"
    }).then((result) => {
                    if (!result.isConfirmed) {
                        saveSession('Items', lineItems);
                        redirect = true;
                        window.location.href = "quote_page.html";
                    }
    });
}

function openManual(){
    var url = "manual_page.html";
    window.open(url);
}

async function handleTitlePage(pdf, pageHeight, imgWidth, element) {
    const { jsPDF } = window.jspdf;

    // Select the title-info div and other sections
    const titleInfoDiv = element.querySelector('#title-info');

    const divElement = document.getElementById('title-info');

    // Get the bounding client rectangle, which provides the width and height
    const rect = divElement.getBoundingClientRect();

    // Extract the width and height from the rect object
    const width = rect.width/2;  // Width of the div
    const height = rect.height/2;  // Height of the div
    
    const titlePageChildren = element.children;
    
    const margin = 20; // Margin from the bottom
    const yPositionBottom = pageHeight - height - 60; // Bottom-left position for title-info

    // Starting position for the other elements
    let currentYPosition = margin; // Starting at the top of the page

    // Render the other content (excluding title-info)
    for (let i = 0; i < titlePageChildren.length; i++) {
        const child = titlePageChildren[i];

        // Skip title-info div since we're handling it separately
        if (child.id === "title-info") {
            continue;
        }

        // Render each child element (e.g., title-logo, title-picture) to the PDF
        const canvas = await html2canvas(child, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        let imgHeight = (canvas.height * imgWidth) / canvas.width;

        // If the content exceeds the available space, split it across multiple pages
        if (currentYPosition + imgHeight > yPositionBottom) {
            imgHeight = yPositionBottom - currentYPosition; // Reduce height to fit
        }

        // Add the image to the PDF at the calculated position
        pdf.addImage(imgData, 'PNG', 0, currentYPosition, imgWidth, imgHeight);

        // Update the current Y position for the next element
        currentYPosition += imgHeight + margin; // Move down by the height of the image + margin
    }

    

    // Capture the title-info div using html2canvas
    const canvasTitleInfo = await html2canvas(titleInfoDiv, { scale: 2 });
    const imgDataTitleInfo = canvasTitleInfo.toDataURL('image/png');

    // Add title-info image at the bottom-left of the page
    pdf.addImage(imgDataTitleInfo, 'PNG', 20, yPositionBottom, width, height);
}

function handleExecutiveSummary() {
    const originalParagraph = document.getElementById('pdf-summary');
    const computedStyle = window.getComputedStyle(originalParagraph);
    const lineHeight = parseFloat(computedStyle.lineHeight);
    const paragraphHeight = originalParagraph.offsetHeight;
    const maxHeight = 50 * lineHeight; // Height limit based on number of lines
      
    if (paragraphHeight > maxHeight) {
        originalParagraph.style.maxHeight = `${maxHeight}px`; // Restrict original paragraph height
        originalParagraph.style.overflow = 'hidden'; // Hide overflow text
        
        const originalText = originalParagraph.textContent;
        const clonedParagraph = originalParagraph.cloneNode(); // Clone original element
        clonedParagraph.style.maxHeight = 'none'; // Reset height in the clone
        clonedParagraph.textContent = originalText; // Get all text from original element

        const remainingText = clonedParagraph.textContent.substring(originalParagraph.textContent.length);
        const targetElement = $('<p>', {class: 'pdf-section'});
        targetElement.html(remainingText); // Populate the target element
        $('#executive-summary').after(targetElement);
    }
}

function handlePictures(){
    const mainPictures = $('#pictures-page > .pictures-grid');
    const allImages = mainPictures.children();
    if(allImages.length <= 4){
        return;
    }
    
    let i = 4;
    let gridDiv;
    allImages.slice(4).each(function(){
        if(i % 4 === 0){
           gridDiv = $('<div>', {class: 'pictures-grid pdf-section saving-pictures'});
           const extraGrids = $('#pdf-container').children('.pictures-grid');
           (extraGrids.length !== 0 ? gridDiv.insertAfter(extraGrids.last()) : $('#pictures-page').after(gridDiv));
        }
        const picture = $(this);
        picture.detach();
        gridDiv.append(picture);
        i++;
    });
}

function revertPictures(){
    const oldPage = $('#pictures-page > .pictures-grid');
    const newDivs = $(".saving-pictures");
    newDivs.each(function(){
        let children = $(this).children();
        children.each(function(){
            $(this).detach().appendTo(oldPage);
        });
    });
    newDivs.remove();
}

function handleTable(){
    $("#details-table").css("display", "none");
    const $tableBody = $('#details-table > tbody');
    let bodyChildren = $tableBody.children(); // Get all rows in the original table body
    const maxRowsPerTable = 28; // Maximum number of rows per table
    let first = true;
    if(bodyChildren.length < maxRowsPerTable){return;}

    while (bodyChildren.length > 0) {
        // Create a new table with the same structure
        const $newTable = $("<div>", {class: "pdf-section"}).append(
            $("<table>", { class: 'saving-table table table-bordered table-striped' })
                .append(
                    $("<thead>", {class: "table-dark"}).append(
                        $("<tr>").append(
                            $("<th>").html("Description"),
                            $("<th>").html("Unit Price")
                        )
                    )
                )
                .append($("<tbody>"))
        );

        if(first){
            $newTable.removeClass("pdf-section");
            $("#quote-page").append($newTable);
        }
        else{
            $("#quote-page").after($newTable);
        }

        // Move up to maxRowsPerTable rows to the new table
        bodyChildren.slice(0, maxRowsPerTable).each(function() {
            $(this).detach().appendTo($newTable.find("tbody"));
        });

        // Update the remaining rows in the original table body
        bodyChildren = $tableBody.children();
        let pdfTotal = $("#pdf-quote-total").detach();
        $(".saving-table:last").after(pdfTotal);
        first = false;
    }

}

function revertTable(){
    $("#details-table").css("display", "table");
    const $originalTable = $('#details-table > tbody');
    const newTables = $(".saving-table > tbody");

    newTables.each(function(){
        let children = $(this).children();
        children.each(function(){
            $(this).detach().appendTo($originalTable);
        });
    });
    let pdfTotal = $("#pdf-quote-total").detach();
    $("#details-table").after(pdfTotal);
    $(".saving-table").each(function(){
        $(this).parent().remove();
    });
}

async function savePDF() {
  toggleVisibility(true);
  handleExecutiveSummary();
  handlePictures();
  handleTable();

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('p', 'pt', [612, 792]); // Initialize jsPDF in portrait, A4 size
  
  const pageHeight = 792;  // Page height
  const imgWidth = 612;    // Page width
  const elements = document.querySelectorAll('.pdf-section'); // Divs to be saved into pdf

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];

    // Render the title-info div at the bottom-left of the page
    if (element.nodeName === 'DIV' && element.id === 'title-page') {
        await handleTitlePage(pdf, pageHeight, imgWidth, element);
//      // Use html2canvas to capture the bottom-left div as an image
//      const canvas = await html2canvas(, { scale: 2 });
//      const imgData = canvas.toDataURL('image/png');
//
//      // Add the image to the PDF at the calculated bottom-left position
//      pdf.addImage(imgData, 'PNG', 10, yPositionBottom, imgWidth, divHeight);
      continue; // Skip rendering the title-info div again
    }

    // Use html2canvas to capture the element
    const canvas = await html2canvas(element, { scale: 2 }); // High resolution
    const imgData = canvas.toDataURL('image/png');
    
    // Calculate dimensions
    let imgHeight = ((canvas.height * imgWidth) / canvas.width);

    if (i > 0) {
      pdf.addPage(); // Add a new page for every div except the first
    }
    
    // Add the image to the PDF
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
  }

  pdf.save(`${metrics.Name}.pdf`); // Save the PDF
  toggleVisibility(false);
  revertPictures();
  revertTable();
}

function toggleVisibility(saving){
    if(saving){
        $('#title-date').prop('type', 'text');
        $('#title-date').css('border', 0);
        $('.pictures-flex').css('border', 0);
        $('#pdf-summary').css('border', 0);
        $('.pdf-button').css('display', 'none');
    }
    else{
        $('#title-date').prop('type', 'date');
        $('#title-date').css('border', '1px solid black');
        $('.pictures-flex').css('border', '1px solid black');
        $('#pdf-summary').css('border', '1px solid black');
        $('.pdf-button').css('display', 'flex');
    }
}

async function loadConfig(){
    try{
        const response = await fetch('../../lib/config.xml');
          if (!response.ok) {
              throw new Error('Failed to fetch XML file');
          }

                // Get the text content of the XML file
          const xmlText = await response.text();

                // Parse the XML content into a DOM object
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xmlText, "application/xml");
          
          $("#Email").html(xmlDoc.getElementsByTagName("email")[0].textContent);
          $("#Phone").html(xmlDoc.getElementsByTagName("phone")[0].textContent);
    }catch(error){
        console.error("Error: ", error);
    }
}
