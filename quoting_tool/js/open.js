
// Sets window to fit screen and disables menu/toolbar
var windowOptions = {
    height: window.screen.height,
    width: window.screen.width,
    menubar: "no",
    toolbar: "no",
    location: "no"
};
var url = "new_/quoting_tool/html/quote_page.html";
var formContext = Xrm.Page;
getFormData(formContext);

// Open the web resource

if(formContext.data.getIsDirty()){
    console.log("dirty");
    alert("Unsaved Changes: Please save your quote and refresh the page before opening the Quoting Tool.");
}
else{
    console.log("clean");
    Xrm.Navigation.openWebResource(url, windowOptions);
    refreshPage();
}

function getFormData(formContext) {
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
