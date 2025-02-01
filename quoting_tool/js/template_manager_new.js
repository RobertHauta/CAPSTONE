var lineItems = [];
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
        console.log(lineItems[3]);
        console.log(lineItems[2]);
        if (!(lineItems.length === 0)) {
            serialized_items = JSON.stringify(lineItems);
        }
        sessionStorage.setItem('Items', serialized_items); //= "Items=" + serialized_items + ";path=/";
        redirect = true;

        window.location.href = "quote_page.html";
    });
}

{
    $('#TakeoffButton').on("click", function (e) {
        var serialized_items = "";
        console.log(lineItems[3]);
        console.log(lineItems[2]);
        if (!(lineItems.length === 0)) {
            serialized_items = JSON.stringify(lineItems);
        }
        sessionStorage.setItem('Items', serialized_items); //= "Items=" + serialized_items + ";path=/";
        redirect = true;

        window.location.href = "takeoff_page.htm";
    });
}

$('#ExitButton').click(exitConfirmation);

$('#TopButton').on("click", scrollToTop);

{
    var serialized = sessionStorage.getItem("Items")//Cookies.get('Items');//getCookie("Items");
    if (serialized) {
        // Parse the serialized array back into an actual array
        lineItems = JSON.parse(serialized);
    } else {
        console.log("No data found in storage.");
    }

    $('#SearchBar').on('blur', function(){
        if($('#SearchBar').val() === ""){
            searchBarHandler();
        }
    });
    $('#SearchBar').on("keypress",(event) => {event.key === 'Enter' ? (searchBarHandler(), $('#SearchBar').blur()) : null;});
    $('#SearchButton').click(searchBarHandler);
}

// FetchXML Testing Gone Wild

var fetchXml = `
<fetch>
	<!-- Table -->
	<entity name="quote">
        <filter type="and">
			<condition attribute="new_istemplate" operator="eq" value="1" />
		</filter>
        <attribute name="name" />
		<!-- One To Many Relationships -->
		<link-entity name="quotedetail" from="quoteid" to="quoteid" alias="quote_details" link-type="outer">
		   <attribute name="productid" />
			<attribute name="productidname" />
            <link-entity name="product" from="productid" to="productid" alias="product_quote_details" link-type="outer">
                <attribute name="productid" />
                <attribute name="defaultuomid" />
                <attribute name="defaultuomidname" />
                <attribute name="davinci_category1_newap" />
                <attribute name="davinci_category2_newap" />
                <attribute name="davinci_category3_newap" />
                <attribute name="davinci_laborminperunit" />
                <attribute name="davinci_make_newap" />
                <attribute name="davinci_minimumsellingquantity" />    
                <attribute name="name" />
                <attribute name="davinci_purchaseunitcost" />
            </link-entity>
		</link-entity>
	</entity>
</fetch>
`;

var templateInfo = [];
getTemplateAPI();
//populateTable();

//
// FUNCTIONS
//


//Scrolls back to top of page	
function scrollToTop() {
    $(window).scrollTop(0);
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

function populateTable() {
    console.log(lineItems);
    for (let i = 0; i < templateInfo.length; i++) {
        console.log(templateInfo[i]);
        var templateAdded = true;
        // Create the parent row
        const parentRow = $('<tr>').appendTo($('#TemplateTable'));
        const uniqueId = templateInfo[i].name.replace(/\s+/g, "_"); // Create a unique ID from the name
        const itemCount = templateInfo[i].quote_details.length;
        // Add onclick handler for the parent row
        parentRow.click(function (event) {
            //ensure the click event is not on the exclude-toggle button
            if ($(event.target).closest('td').hasClass('TemplateDropdown')) {
                $('#ItemTableCell' + i).toggle();
            }
        });

        // Append cells to the parent row
        $('<td>', {
            class: 'TemplateDropdown',
            text: templateInfo[i].name
        }).appendTo(parentRow);
        
        $('<td>', {
            class: 'exclude-toggle'
        }).append(
            $('<button>', {
                class: 'btn btn-secondary IconButton'
            }).html("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\" fill=\"currentColor\" class=\"bi bi-plus-lg\" viewBox=\"0 0 16 16\">" +
                        "<path fill-rule=\"evenodd\" d=\"M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2\"/>" +
                    "</svg>")
            .click(function (event) { addTemplateToQuote(event, uniqueId, i) })
         ).appendTo(parentRow);
        
        const tableRow = $('<tr>').appendTo($('#TemplateTable'));
        
        $('<td>', {
            colspan: 2,
            id: 'ItemTableCell' + i
        }).css('display', 'none').append(
            $('<table>', {
                class: 'table table-striped table-hover table-bordered',
                id: 'TemplateItemTable' + i
            }).append(
                $('<thead>', {
                    class: 'table-dark'
                }).append(
                    $('<tr>').append(
                        $('<th>', {
                            text: 'Product'
                        }),
                        $('<th>', {
                            text: 'Unit'
                        }),
                        $('<th>', {
                            text: 'Purchase Unit'
                        }),
                        $('<th>', {
                            text: 'Make'
                        }),
                        $('<th>', {
                            text: 'Category 1'
                        }),
                        $('<th>', {
                            text: 'Category 2'
                        }),
                        $('<th>', {
                            text: 'Category 3'
                        }),
                        $('<th>')
                    )
                ),$('<tbody>')
            )
        ).appendTo(tableRow);
        

        // Create the hidden row
        for (let j = 1; j <= itemCount; j++) {
            const hiddenRow = $(`<tr id="hidden_row${uniqueId}${j}" class="hidden_row">`).appendTo($('#TemplateItemTable' + i + ' tbody'));
            $('<td>').html(templateInfo[i].quote_details[j - 1].name).appendTo(hiddenRow);
            $('<td>').html(templateInfo[i].quote_details[j - 1].defaultuomid.name).appendTo(hiddenRow);
            $('<td>').html(templateInfo[i].quote_details[j - 1].davinci_purchaseunitcost).appendTo(hiddenRow);
            $('<td>').html(templateInfo[i].quote_details[j - 1].davinci_make_newap).appendTo(hiddenRow);
            $('<td>').html(templateInfo[i].quote_details[j - 1].davinci_category1_newap).appendTo(hiddenRow);
            $('<td>').html(templateInfo[i].quote_details[j - 1].davinci_category2_newap).appendTo(hiddenRow);
            $('<td>').html(templateInfo[i].quote_details[j - 1].davinci_category3_newap).appendTo(hiddenRow);

            if (lineItems.some(item => item.name === templateInfo[i].quote_details[j - 1].name)) {
                $('<td>').html("<strong>Added</strong>").appendTo(hiddenRow);
            } else {
                templateAdded = false;
                $('<td>').append(
                    $('<button>', {
                        class: 'btn btn-outline-secondary IconButton',
                        'data-unique-id': uniqueId,
                        'data-row-index': j
                    }).html("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\" fill=\"currentColor\" class=\"bi bi-plus-lg\" viewBox=\"0 0 16 16\">" +
                                "<path fill-rule=\"evenodd\" d=\"M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2\"/>" +
                            "</svg>")
                    .click(function (event) { (addItemToQuote(uniqueId, j)) })
                ).appendTo(hiddenRow);
            }
        }
    }
}

// Add an entire template to the quote by saving the it in the session storage
function addTemplateToQuote(event, uniqueId, rowIndex){
        console.log("Template was selected");
        $(event.target).replaceWith("<strong>Added</strong>");

        // Get the unique ID of the parent row
        const template = templateInfo.find(t => t.name.replace(/\s+/g, "_") === uniqueId);
        if(!template) {
            console.log("Template not found");
            return;
        }
        
        for (let j = 1; j <= template.quote_details.length; j++) {
            // Get the item from the templateInfo array
            console.log(template.quote_details);
            addItemToQuote(uniqueId, j);
        }
}

// Add an item to the quote by saving the product in the session storage
function addItemToQuote(uniqueId, rowIndex) {
    console.log("Adding item to quote");

    // If the parent row was clicked, add all the child items to the quote
    /*if (isParentRow) {
        console.log("Template was selected");
        button.disabled = true;
        const cell = button.closest('td');
        cell.html("<strong>Added</strong>");

        // Get the unique ID of the parent row
        const template = templateInfo.find(t => t.name.replace(/\s+/g, "_") === uniqueId);
        if(!template) {
            console.log("Template not found");
            return;
        }

        for (let j = 1; j <= template.quote_details.length; j++) {
            // Get the item from the templateInfo array
            console.log(template.quote_details);
            const selectedItem = template.quote_details[j - 1];
            // Check if the item is already in the quote
            if (lineItems.some(item => item.name === selectedItem.name)) {
                console.log("Items already in quote");
                continue;
            }
            // Add the item to the quote
            lineItems.push(selectedItem);
            lineItems[lineItems.length - 1].isChanged = true;
            
            const hiddenRowButton = $(`#hidden_row${uniqueId}${j}`).find('button');
            hiddenRowButton.replaceWith("<strong>Added</strong>");
        }
    } else {*/
        // If a child item was clicked, add only that item to the quote
        console.log("Individual line item was selected");
        //$(event.target).replaceWith("<strong>Added</strong>");

        const template = templateInfo.find(t => t.name.replace(/\s+/g, "_") === uniqueId);
        if (!template) {
            console.log("Template not found");
            return;
        }
        
        const hiddenRowButton = $(`#hidden_row${uniqueId}${rowIndex}`).find('button');
        hiddenRowButton.replaceWith("<strong>Added</strong>");

        const selectedItem = template.quote_details[rowIndex - 1];
        // Check if the item is already in the quote
        if (lineItems.some(item => item.name === selectedItem.name)) {
            console.log("Item already in quote");
            return;
        }
        // Add the item to the quote
        lineItems.push(selectedItem);
        lineItems[lineItems.length-1].isChanged = true;
    //}
}

function getTemplateAPI() {
    parent.Xrm.WebApi.retrieveMultipleRecords("quote", `?fetchXml=${encodeURIComponent(fetchXml)}`).then(
        function success(results) {
            console.log(results);

            templateInfo.length = 0;
            templateInfo = JSON.parse(JSON.stringify(results.entities.reduce((acc, record) => {
                const parentId = record.quoteid;

                // Check if this quote already exists in the accumulator
                let parent = acc.find(item => item.quoteid === parentId);

                if (!parent) {
                    // If not, add a new parent object
                    parent = {
                        quoteid: parentId,
                        name: record.name,
                        quote_details: []
                    };
                    acc.push(parent);
                }

                // Add the child (quote_details) record if it exists
                if (record["quote_details.productid"]) {
                       const unit = {
                        uomid: record["product_quote_details.defaultuomid"], //GUID
                        name: record["product_quote_details.defaultuomid@OData.Community.Display.V1.FormattedValue"]
                    };
                       parent.quote_details.push({
                        guid: record["quote_details.productid"],
                        productid: record["quote_details.productid"],

                        defaultuomid: unit,
                        name: record["product_quote_details.name"],
                        davinci_category1_newap: record["product_quote_details.davinci_category1_newap"], // Text
                        davinci_category2_newap: record["product_quote_details.davinci_category2_newap"], // Text
                        davinci_category3_newap: record["product_quote_details.davinci_category3_newap"], // Text
                        davinci_laborminperunit: record["product_quote_details.davinci_laborminperunit"], // Decimal
                        davinci_make_newap: record["product_quote_details.davinci_make_newap"], // Text
                        davinci_minimumsellingquantity: record["product_quote_details.davinci_minimumsellingquantity"], // Decimal
                        davinci_purchaseunitcost: record["product_quote_details.davinci_purchaseunitcost"] // Decimal
                       
                    });
                     console.log(record);
                }

                return acc;
            }, [])));

            
            populateTable();

        },
        function (error) {
            console.log(error.message);
        }
    );
}

//Gets Value from Search Bar
//Performs a filter query on the database based on search value
//Populates table with Product Values and add to quote button
function searchBarHandler(){
    var search = $('#SearchBar').val();
    
    if(prev_search === search){ return;}
    
    for(var i = table.rows.length - 1; i > 0; i--){
        table.deleteRow(i);
    }
    
    var fetch_searchfiltered = "?$select=productid,name,defaultuomid,davinci_make_newap,davinci_category1_newap,davinci_category2_newap,davinci_category3_newap,davinci_purchaseunitcost, davinci_minimumsellingquantity, davinci_laborminperunit"
                                   + "&$expand=defaultuomid($select=name)&$filter=contains(name,'" + search + "')";
                                   
    cataloguePopulatorAPI("product", fetch_searchfiltered);
    prev_search = search;
}
