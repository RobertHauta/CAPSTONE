/*
 * File Name: universal_Functions.js
 *
 * Description: This file contains all functions that are commonly used across the
 * various quoting tool pages
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

// Displays Asyncronous loading screen in top left corner
function showLoading() {
    Swal.fire({
        title: 'Saving...',
        didOpen: () => {
            Swal.showLoading();
        },
        allowOutsideClick: false,
        position: 'top-left',
        backdrop: false,
        showConfirmButton: false,
        timerProgressBar: true,
        customClass: {
            popup: 'swal-small'
        }
    });
}

// Hides loading screen
function hideLoading() {
    Swal.close();
}

// Confirms the user wants to exit before leaving the page
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

// Saves key object pair to the sessionStorage
function saveSession(key, obj){
    var serialized_items = "";
    if(!(obj.length === 0)){
        serialized_items = JSON.stringify(obj);
    }
    sessionStorage.setItem(key, serialized_items); //= "Items=" + serialized_items + ";path=/";
}

// Retrieves key object pair from database based on the key
function retrieveSession(key){
    var serialized_items = sessionStorage.getItem(key);//Cookies.get('Items'); //getCookie("Items");
    if (serialized_items) {
        // Parse the serialized array back into an actual array
        return JSON.parse(serialized_items);
    } else {
        return [];
    }
}

function loadingCircle(){
    $('.PageDiv').toggleClass("LoadPage");
    $('.loader').toggleClass("show");
    $('html').toggleClass("LoadingCursor");
    
    if($('html').hasClass("LoadingCursor")){
        $('.PageDiv').css('pointer-events', 'none');
    }
    else{
        $('.PageDiv').css('pointer-events', 'auto');
    }
}