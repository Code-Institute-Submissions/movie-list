
/*
==================================================================
    INIT APP
==================================================================
*/

/*========================================
    When page is frst loaded perform
    these actions to initilise the app
=========================================*/

function init() {
    setEventListeners();
    nav('movies,popular');
    getLocalStorageLists();
};
init();