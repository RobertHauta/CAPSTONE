console.log("open");
var windowOptions = "height=800,width=800";
var url = "new_/quoting_tool/html/quote_page.html";
var formContext = Xrm.Page;
getFormData(formContext);

// Open the web resource
if(formContext.data.getIsDirty()){
    console.log("dirty");
    alert("Unsaved Changes: Please save your quote before opening the Quoting Tool.");
}
else{
    console.log("clean");
    Xrm.Navigation.openWebResource(url);
    refreshPage();
}

function getFormData(formContext) {
    console.log(formContext);
    // Retrieve the value of the 'quotenumber' field
    var ids = {
        quoteNumber: formContext.getAttribute("quotenumber").getValue(),
        revisionNumber: formContext.getAttribute("revisionnumber").getValue()
    };
    
    if (!ids) {
        console.error("missing!");
    }
    else{
        var stringified = JSON.stringify(ids);
        sessionStorage.setItem("ID", stringified);
    }
}

function refreshPage() {
    
console.log(window.parent.location.href);
    // Refresh the page by reloading the current browser window
    window.parent.location.replace(window.parent.location.href);
}

//OpenQuote!d1a7fd26e9e4461881e8a88e7ac4d3f1
