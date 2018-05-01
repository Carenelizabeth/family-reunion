function handleLogin(){
    $('.js-login-button').click(e =>{
        e.preventDefault();
        $('.landing-page').addClass("hidden");
        $('.event-page').removeClass("hidden");
    });
};

function handleActivity(){
    $('.event-page').on('click', '.activity', e =>{
        $('.event-page').addClass("hidden");
        $('.activity-page').removeClass("hidden");
    });
};

handleLogin();
handleActivity();